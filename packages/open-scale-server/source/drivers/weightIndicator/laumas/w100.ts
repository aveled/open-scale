import WeightIndicatorBase from '../base';

import {
    WeightIndicatorDriver,
} from '../../../data';

import {
    logger,
} from '../../../utilities';



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
};


class LaumasW100 extends WeightIndicatorBase implements WeightIndicatorDriver {
    private pollingIntervals: Map<number, NodeJS.Timeout> = new Map();
    private nextPollingId = 0;


    constructor() {
        super();
    }

    public async getWeight(): Promise<number> {
        const weightRegister = await this.client.readHoldingRegisters(REGISTERS.WEIGHT, 2);
        const newWeight = (weightRegister.data[0] << 16) | weightRegister.data[1] * 10; // Convert to grams

        return newWeight;
    }

    public async tare(): Promise<boolean> {
        await this.client.writeRegisters(REGISTERS.TARE_LOW, [0]);
        await this.client.writeRegisters(REGISTERS.TARE_HIGH, [0]);
        await this.client.writeRegisters(REGISTERS.COMMAND, [130]);

        return true;
    }

    /**
     * Performs a semi-automatic zero operation.
     * Used for zeroing small variations around zero.
     * @returns {Promise<boolean>}
     */
    public async zero(): Promise<boolean> {
        // Send command 8 (SEMI_AUTO_ZERO) to register 40006
        await this.client.writeRegister(REGISTERS.COMMAND, COMMANDS.SEMI_AUTO_ZERO);

        return true;
    }


    /**
     * Controls the digital outputs (1-5). Internal helper method.
     * Requires outputs to be set to PLC mode in instrument settings (Manual page 129).
     * @param output1State State for Output 1 (true=closed/on, false=open/off)
     * @param output2State State for Output 2 (true=closed/on, false=open/off)
     * @param output3State (Optional) State for Output 3
     * @param output4State (Optional) State for Output 4
     * @param output5State (Optional) State for Output 5
     * @returns {Promise<boolean>} True if the command was sent successfully.
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

        // Writes to Outputs Register 40018 (index 17)
        await this.client.writeRegister(REGISTERS.OUTPUTS, outputValue);

        return true;
    }

    /**
     * Sets outputs for Coarse VFD control: Output 1 CLOSED, Output 2 OPEN.
     * @returns {Promise<boolean>} True if the command was sent successfully.
     */
    public async setOutputCoarse(): Promise<boolean> {
        // Output 1 = true (Closed), Output 2 = false (Open)
        return this.setOutputs(true, false);
    }

    /**
     * Sets outputs for Fine VFD control: Output 1 OPEN, Output 2 CLOSED.
     * @returns {Promise<boolean>} True if the command was sent successfully.
     */
    public async setOutputFine(): Promise<boolean> {
        // Output 1 = false (Open), Output 2 = true (Closed)
        return this.setOutputs(false, true);
    }

    /**
     * Resets VFD control outputs: Output 1 OPEN, Output 2 OPEN.
     * @returns {Promise<boolean>} True if the command was sent successfully.
     */
    public async resetOutputs(): Promise<boolean> {
        // Output 1 = false (Open), Output 2 = false (Open)
        return this.setOutputs(false, false);
    }

    /**
     * Reads the state of Digital Input 1.
     * Input 1 corresponds to Bit 0 of the INPUTS register (40017).
     * @returns {Promise<boolean>} True if Input 1 is HIGH/CLOSED, false if LOW/OPEN.
     * @see Protocols_for_series_W_CE-M_approved_manual_EN.pdf,
     */
    public async getInputState(): Promise<boolean> {
        // Read INPUTS Register 40017 (index 16)
        const inputRegister = await this.client.readHoldingRegisters(REGISTERS.INPUTS, 1);

        // Ensure data was received
        if (!inputRegister || !inputRegister.data || inputRegister.data.length === 0) {
            logger('error', 'Failed to read input register or no data received.');
            return false;
        }

        const inputValue = inputRegister.data[0];

        // Check Bit 0 for Input 1 status
        // (inputValue & (1 << 0)) will be non-zero (true) if Bit 0 is 1
        return (inputValue & (1 << 0)) !== 0;
    }

    /**
     * Polls a specific input function and calls a callback when the input state changes.
     *
     * @param inputFunction An async function that returns the current boolean state of an input (e.g., this.getInput1State.bind(this)).
     * @param callback The function to call when the input state changes. It receives the new state (boolean).
     * @param intervalMs The polling interval in milliseconds. Defaults to 200ms.
     * @returns {number} An ID that can be used to stop polling with stopPolling.
     *
     * @example
     * const laumas = new LaumasW100();
     * // ... initialize client ...
     * const pollingId = laumas.pollInputChange(
     * laumas.getInput1State.bind(laumas), // Pass the bound function
     * (newState) => {
     * console.log(`Input 1 changed to: ${newState}`);
     * },
     * 500 // Poll every 500ms
     * );
     * // To stop later: laumas.stopPolling(pollingId);
     */
    public pollInputChange(
        inputFunction: () => Promise<boolean>,
        callback: (newState: boolean) => void,
        intervalMs: number = 200
    ): number {
        let previousState: boolean | null = null;
        // Assign a unique ID for this polling operation
        const pollingId = this.nextPollingId++;

        const intervalTimer = setInterval(async () => {
            try {
                const currentState = await inputFunction();

                // Initialize previousState on the first successful read
                if (previousState === null) {
                    previousState = currentState;
                }

                // Check for change compared to the last known state
                if (currentState !== previousState) {
                    callback(currentState); // Execute the callback with the new state
                    previousState = currentState; // Update the state
                }

                // If no change, do nothing until the next interval
            } catch (error) {
                logger('error', `Error polling input for ID ${pollingId}:`, error);
                this.stopPolling(pollingId);
            }
        }, intervalMs);

        this.pollingIntervals.set(pollingId, intervalTimer);
        return pollingId;
    }

    /**
     * Stops an input change polling operation started with pollInputChange.
     * @param pollingId The ID returned by pollInputChange.
     * @returns {boolean} True if polling was stopped, false if the ID was not found or already stopped.
     */
    public stopPolling(pollingId: number): boolean {
        const intervalTimer = this.pollingIntervals.get(pollingId);
        if (intervalTimer) {
            clearInterval(intervalTimer)
            this.pollingIntervals.delete(pollingId);
            logger('info', `Stopped polling for ID ${pollingId}`);
            return true;
        }

        logger('warn', `Polling ID ${pollingId} not found or already stopped.`);
        return false;
    }

    public async __testSetWeight__(_weight: number) {
        return;
    }
}


export default LaumasW100;
