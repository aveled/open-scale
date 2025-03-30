import {
    WeightIndicatorDriver,
} from '../../../data';
import WeightIndicatorBase from '../base';



const REGISTERS = {
    COMMAND: 5, // 40006
    WEIGHT: 7, // 40008
    OUTPUTS: 17, // 40018
    TARE_LOW: 72,
    TARE_HIGH: 73,
};

const COMMANDS = {
    SEMI_AUTO_ZERO: 8,
};


class LaumasW100 extends WeightIndicatorBase implements WeightIndicatorDriver {
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

    public async __testSetWeight__(_weight: number) {
        return;
    }
}


export default LaumasW100;
