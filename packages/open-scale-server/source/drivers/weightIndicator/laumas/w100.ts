import WeightIndicatorBase from '../base';

import {
    WeightIndicatorDriver,
    WeightIndicatorState,
} from '../../../data';

import { logger } from '../../../utilities';



const REGISTERS = {
    COMMAND: 5, // 40006
    WEIGHT: 7, // 40008
    INPUTS: 16, // 40017
    OUTPUTS: 17, // 40018
    TARE_LOW: 72,
    TARE_HIGH: 73,
};

const COMMANDS = {
    SEMI_AUTO_ZERO: 8,
    TARE: 130,
};

const MIN_OPERATION_INTERVAL_MS = 100; // Minimum delay between operations

type QueueOperation = {
    operation: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
}


class LaumasW100 extends WeightIndicatorBase implements WeightIndicatorDriver {
    // --- Queue Mechanism ---
    private operationQueue: QueueOperation[] = [];
    private isProcessingQueue = false;
    private lastOperationTimestamp = 0;

    // --- Continuous State Reading ---
    private stateReadingInterval: NodeJS.Timeout | null = null;
    private stateUpdateCallback: ((state: WeightIndicatorState) => void) | null = null;
    private isStateReadingActive = false;
    private lastReadState: WeightIndicatorState | null = null;

    constructor() {
        super();
    }


    // --- Core Queue Processing Logic ---
    /**
     * Enqueues a Modbus operation to ensure serialization and minimum delay.
     * @param operationFn An async function that performs the Modbus read/write.
     * @returns A promise that resolves/rejects when the specific operation completes.
     */
    private enqueueOperation<T>(operationFn: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.operationQueue.push({ operation: operationFn, resolve, reject });
            this.processQueue();
        });
    }

    /**
     * Processes the operation queue one item at a time with delays.
     */
    private async processQueue(): Promise<void> {
        if (this.isProcessingQueue || this.operationQueue.length === 0) {
            return; // Already processing or queue is empty
        }

        this.isProcessingQueue = true;

        // Pause continuous reading if it's active *before* starting the next operation
        const wasReadingPaused = this.pauseContinuousReadingIfNeeded();

        const queueItem = this.operationQueue.shift();

        if (!queueItem) {
            this.isProcessingQueue = false; // Should not happen, but safety check
            if (wasReadingPaused) this.resumeContinuousReadingIfNeeded(); // Resume if we paused it
            return;
        }

        const { operation, resolve, reject } = queueItem;

        try {
            // Ensure minimum delay since the last operation completed
            const now = Date.now();
            const timeSinceLastOp = now - this.lastOperationTimestamp;
            if (timeSinceLastOp < MIN_OPERATION_INTERVAL_MS) {
                await this.delay(MIN_OPERATION_INTERVAL_MS - timeSinceLastOp);
            }

            // Execute the operation
            const result = await operation();
            resolve(result); // Resolve the promise returned by enqueueOperation
        } catch (error) {
            logger('error', 'Error processing queue operation:', error);
            reject(error); // Reject the promise returned by enqueueOperation
        } finally {
            this.lastOperationTimestamp = Date.now(); // Record completion time
            this.isProcessingQueue = false;

            // Resume continuous reading *after* the operation completes, if it was paused
            if (wasReadingPaused) {
                this.resumeContinuousReadingIfNeeded();
            }

            // Process the next item if any
            this.processQueue();
        }
    }

    /** Helper function for delays */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    // --- Public API Methods (Using the Queue) ---
    public async getWeight(): Promise<number> {
        if (!this.lastReadState) {
            logger('warn', 'No weight data available. Please read the state first.');
            throw new Error('No weight data available');
        }

        return this.lastReadState.weight;
    }

    public async tare(): Promise<boolean> {
        // Sequence of writes for tare operation
        return this.enqueueOperation(async () => {
            logger('info', 'Performing tare operation...');
            // Original code had 3 separate writes. Enqueueing them ensures delay between each.
            // If they MUST happen atomically without delay *between them*, group them differently.
            // Assuming delay between each is fine/required:
            await this.client.writeRegisters(REGISTERS.TARE_LOW, [0]);
            await this.delay(MIN_OPERATION_INTERVAL_MS); // Explicit delay if needed between parts of multi-step command
            await this.client.writeRegisters(REGISTERS.TARE_HIGH, [0]);
            await this.delay(MIN_OPERATION_INTERVAL_MS);
            await this.client.writeRegisters(REGISTERS.COMMAND, [COMMANDS.TARE]);
            logger('info', 'Tare command sent.');
            return true;
        });
    }

    public async zero(): Promise<boolean> {
        // Writes command 8 (SEMI_AUTO_ZERO) to register 40006
        return this.enqueueOperation(async () => {
            logger('info', 'Performing semi-auto zero...');
            await this.client.writeRegister(REGISTERS.COMMAND, COMMANDS.SEMI_AUTO_ZERO);
            logger('info', 'Semi-auto zero command sent.');
            return true;
        });
    }

    private async setOutputsInternal(outputValue: number): Promise<boolean> {
        return this.enqueueOperation(async () => {
            logger('info', `Setting outputs to value: ${outputValue}`);
            await this.client.writeRegister(REGISTERS.OUTPUTS, outputValue);
            logger('info', 'Outputs set.');
            return true;
        });
    }

    /**
     * Controls the digital outputs (1-5).
     * Requires outputs to be set to PLC mode in instrument settings.
     */
    private async setOutputs(
        output1State: boolean,
        output2State: boolean,
        output3State: boolean = false,
        output4State: boolean = false,
        output5State: boolean = false
    ): Promise<boolean> {
        let outputValue = 0;
        if (output1State) outputValue |= (1 << 0); // Set bit 0 for Output 1
        if (output2State) outputValue |= (1 << 1); // Set bit 1 for Output 2
        if (output3State) outputValue |= (1 << 2); // Set bit 2 for Output 3
        if (output4State) outputValue |= (1 << 3); // Set bit 3 for Output 4
        if (output5State) outputValue |= (1 << 4); // Set bit 4 for Output 5

        return this.setOutputsInternal(outputValue);
    }

    public async setOutputCoarse(): Promise<boolean> {
        logger('info', 'Setting outputs: Coarse (Out1=ON, Out2=OFF)');
        return this.setOutputs(true, false);
    }

    public async setOutputFine(): Promise<boolean> {
        logger('info', 'Setting outputs: Fine (Out1=OFF, Out2=ON)');
        return this.setOutputs(false, true);
    }

    public async resetOutputs(): Promise<boolean> {
        logger('info', 'Setting outputs: Reset (Out1=OFF, Out2=OFF)');
        return this.setOutputs(false, false);
    }

    /**
     * Reads the state of all digital inputs (Register 40017).
     * @returns {Promise<number>} The raw value of the input register.
     */
    public async readInputRegister(): Promise<WeightIndicatorState['inputs']> {
        if (!this.lastReadState) {
            logger('warn', 'No input data available. Please read the state first.');
            throw new Error('No input data available');
        }

        return this.lastReadState.inputs;
    }

    /**
     * Reads the state of Digital Input 1 specifically.
     * @returns {Promise<boolean>} True if Input 1 is HIGH/CLOSED, false if LOW/OPEN.
     */
    public async getInput1State(): Promise<boolean> {
        const inputValue = await this.readInputRegister();
        return inputValue.input1;
    }


    // --- Continuous State Reading Mechanism ---
    /**
     * Reads the essential state (Weight, Inputs) in a single queued operation.
     * @returns {Promise<WeightIndicatorState>} The current state.
     */
    private async readCurrentState(): Promise<WeightIndicatorState> {
        // Enqueue a single operation that performs multiple reads sequentially
        return this.enqueueOperation(async () => {
            // logger('info', 'Reading full state...'); // Can be noisy
            const startAddress = REGISTERS.WEIGHT; // 40008 (assuming 1-based address for clarity)
            const endAddress = REGISTERS.OUTPUTS;  // 40018
            const registerCount = (endAddress - startAddress) + 1; // 40018 - 40008 + 1 = 11 registers

            const registerBlock = await this.client.readHoldingRegisters(
                startAddress, // Starting register address (e.g., 40008 or index 7)
                registerCount // Number of registers to read (11)
            );

            if (!registerBlock || !registerBlock.data || registerBlock.data.length < registerCount) {
                logger('error', `Failed to read state register block (expected ${registerCount} registers).`);
                throw new Error('Failed to read state register block or received incomplete data');
            }

            const data = registerBlock.data;

            const weight = (data[0] << 16) | (data[1] * 10);

            const inputsRegisterIndex = REGISTERS.INPUTS - startAddress;
            const inputsValue = data[inputsRegisterIndex];

            const outputsRegisterIndex = REGISTERS.OUTPUTS - startAddress;
            const outputsValue = data[outputsRegisterIndex];

            const inputsState = {
                input1: (inputsValue & (1 << 0)) !== 0, // Check bit 0 for Input 1
                input2: (inputsValue & (1 << 1)) !== 0, // Check bit 1 for Input 2
                input3: (inputsValue & (1 << 2)) !== 0, // Check bit 2 for Input 3
            };

            const outputsState = {
                output1: (outputsValue & (1 << 0)) !== 0, // Check bit 0 for Output 1
                output2: (outputsValue & (1 << 1)) !== 0, // Check bit 1 for Output 2
                output3: (outputsValue & (1 << 2)) !== 0, // Check bit 2 for Output 3
                output4: (outputsValue & (1 << 3)) !== 0, // Check bit 3 for Output 4
                output5: (outputsValue & (1 << 4)) !== 0, // Check bit 4 for Output 5
            };

            const state: WeightIndicatorState = {
                weight: weight,
                rawInputs: inputsValue,
                rawOutputs: outputsValue,
                inputs: inputsState,
                outputs: outputsState,
            };
            // logger('info', 'State read successfully:', state); // Can be noisy
            this.lastReadState = state;
            return state;
        });
    }

    /**
    * Starts continuously polling the weight indicator state (weight, inputs).
    * The polling loop automatically pauses when write operations are enqueued.
    * @param callback Function to call with the updated state.
    * @param intervalMs Polling interval in milliseconds. Defaults to 250ms.
    */
    public startContinuousStateReading(
        callback: (state: WeightIndicatorState) => void,
        intervalMs: number = 250
    ): void {
        if (this.stateReadingInterval) {
            logger('warn', 'Continuous state reading is already active.');
            return;
        }

        logger('info', `Starting continuous state reading with interval ${intervalMs}ms.`);
        this.stateUpdateCallback = callback;
        this.isStateReadingActive = true;

        const pollState = async () => {
            // Only proceed if reading is marked as active (not manually paused)
            if (!this.isStateReadingActive) {
                logger('info', 'State reading paused, skipping poll cycle.');
                return;
            }
            // Check if the queue is busy with non-read operations (heuristic)
            // This check is optional, the queue *will* serialize, but this *might* slightly reduce queuing reads if a write is imminent.
            // However, it's complex to reliably predict. The queue itself is the primary mechanism.
            // Let's rely on the queue for serialization.

            try {
                // Enqueue the state read. It will wait if other operations are running.
                const currentState = await this.readCurrentState();

                // If reading is still active after the await (it wasn't stopped while reading)
                // and a callback is registered, call it.
                if (this.isStateReadingActive && this.stateUpdateCallback) {
                    this.stateUpdateCallback(currentState);
                }
            } catch (error) {
                logger('error', 'Error during continuous state polling:', error);
                // Optional: Stop polling on error, or just log and continue?
                // this.stopContinuousStateReading(); // Example: Stop on error
            }
        };

        // Start the interval timer
        // Run immediately first time? Yes.
        pollState();
        this.stateReadingInterval = setInterval(pollState, intervalMs);
    }

    /**
     * Stops the continuous state polling.
     */
    public stopContinuousStateReading(): void {
        if (this.stateReadingInterval) {
            logger('info', 'Stopping continuous state reading.');
            clearInterval(this.stateReadingInterval);
            this.stateReadingInterval = null;
            this.stateUpdateCallback = null;
            this.isStateReadingActive = false;
        } else {
            logger('warn', 'Continuous state reading is not active.');
        }
    }

    /**
    * Temporarily pauses the continuous state reading loop if it's running.
    * Used internally by the queue processor before executing an operation.
    * @returns True if reading was active and is now paused, false otherwise.
    */
    private pauseContinuousReadingIfNeeded(): boolean {
        if (this.isStateReadingActive && this.stateReadingInterval) {
            // logger('info', 'Pausing continuous state reading for operation.'); // Can be noisy
            this.isStateReadingActive = false; // Prevent new poll cycles from running `readCurrentState`
            // We don't clear the interval here, just flag it as inactive.
            return true;
        }
        return false;
    }

    /**
     * Resumes continuous state reading if it was previously paused.
     * Used internally by the queue processor after executing an operation.
     */
    private resumeContinuousReadingIfNeeded(): void {
        // Check if an interval timer exists but the reading is marked inactive
        if (this.stateReadingInterval && !this.isStateReadingActive) {
            // logger('info', 'Resuming continuous state reading.'); // Can be noisy
            this.isStateReadingActive = true; // Allow poll cycles to run again
        }
    }

    /**
     * Gets the last successfully read state without querying the device again.
     * Returns null if no state has been read yet.
     */
    public getLastReadState(): WeightIndicatorState | null {
        return this.lastReadState;
    }


    // Test method
    public async __testSetWeight__(_weight: number) {
        logger('warn', '__testSetWeight__ is a placeholder and does not interact with the queue.');
        return;
    }
}

export default LaumasW100;
