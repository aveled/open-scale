import {
    WeightIndicatorDriver,
} from '../../../data';
import WeightIndicatorBase from '../base';



const REGISTERS = {
    WEIGHT: 1,     // Register to hold the current weight value
    COMMAND: 5,    // Register to receive commands like TARE, ZERO
    OUTPUTS: 17,   // Register to control the state of simulated outputs
};

const COMMANDS = {
    TARE: 130,         // Mimics LaumasW100 Tare command value
    SEMI_AUTO_ZERO: 8, // Mimics LaumasW100 Zero command value
};


class Tester extends WeightIndicatorBase implements WeightIndicatorDriver {
    constructor() {
        super();
    }

    public async getWeight(): Promise<number> {
        const response = await this.client.readHoldingRegisters(REGISTERS.WEIGHT, 1);
        return response.data[0];
    }

    public async tare(): Promise<boolean> {
        await this.client.writeRegister(REGISTERS.COMMAND, COMMANDS.TARE);
        console.log(`Tester: Sent TARE command (${COMMANDS.TARE}) to Register ${REGISTERS.COMMAND}`);
        return true;
    }

    public async zero(): Promise<boolean> {
        await this.client.writeRegister(REGISTERS.COMMAND, COMMANDS.SEMI_AUTO_ZERO);
        console.log(`Tester: Sent ZERO command (${COMMANDS.SEMI_AUTO_ZERO}) to Register ${REGISTERS.COMMAND}`);
        return true;
    }

    /**
     * Internal helper to set the state of simulated outputs by writing to the OUTPUTS register.
     * Uses bitmasking similar to LaumasW100.
     * @param output1State State for Output 1 (true=on)
     * @param output2State State for Output 2 (true=on)
     * @returns {Promise<boolean>} Always returns true for the tester.
     */
    private async setOutputs(
        output1State: boolean,
        output2State: boolean
    ): Promise<boolean> {
        let outputValue = 0;
        if (output1State) outputValue |= (1 << 0); // Set bit 0 for Output 1
        if (output2State) outputValue |= (1 << 1); // Set bit 1 for Output 2
        // Add more bits here if simulating more outputs

        // Write the calculated bitmask to the OUTPUTS register
        await this.client.writeRegister(REGISTERS.OUTPUTS, outputValue);
        console.log(`Tester: Set OUTPUTS Register ${REGISTERS.OUTPUTS} to ${outputValue} (Out1: ${output1State}, Out2: ${output2State})`);
        return true;
    }

    /**
     * Simulates setting Coarse output: Output 1 ON, Output 2 OFF.
     * Writes value 1 (binary 01) to the OUTPUTS register.
     * @returns {Promise<boolean>} True if the command was sent successfully.
     */
    public async setOutputCoarse(): Promise<boolean> {
        // Output 1 = true, Output 2 = false
        return this.setOutputs(true, false);
    }

    /**
     * Simulates setting Fine output: Output 1 OFF, Output 2 ON.
     * Writes value 2 (binary 10) to the OUTPUTS register.
     * @returns {Promise<boolean>} True if the command was sent successfully.
     */
    public async setOutputFine(): Promise<boolean> {
         // Output 1 = false, Output 2 = true
        return this.setOutputs(false, true);
    }

    /**
     * Simulates resetting outputs: Output 1 OFF, Output 2 OFF.
     * Writes value 0 (binary 00) to the OUTPUTS register.
     * @returns {Promise<boolean>} True if the command was sent successfully.
     */
    public async resetOutputs(): Promise<boolean> {
         // Output 1 = false, Output 2 = false
        return this.setOutputs(false, false);
    }

    public async __testSetWeight__(targetWeight: number): Promise<void> {
        await this.client.writeRegister(REGISTERS.WEIGHT, targetWeight);
        console.log(`Tester: Set WEIGHT Register ${REGISTERS.WEIGHT} to ${targetWeight}`);
        return;
    }
}

export default Tester;
