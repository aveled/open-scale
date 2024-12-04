import {
    WeightIndicatorDriver,

    REGISTERS,
} from '../../../data';
import WeightIndicatorBase from '../base';



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

    public async __testSetWeight__(_weight: number) {
        return;
    }
}


export default LaumasW100;
