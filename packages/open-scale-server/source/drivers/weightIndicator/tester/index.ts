import {
    WeightIndicatorDriver,
} from '../../../data';
import WeightIndicatorBase from '../base';



const REGISTERS = {
    WEIGHT: 1,
};


class Tester extends WeightIndicatorBase implements WeightIndicatorDriver {
    constructor() {
        super();
    }

    public async getWeight(): Promise<number> {
        return 0;
    }

    public async tare(): Promise<boolean> {
        return true;
    }

    public async __testSetWeight__(targetWeight: number) {
        await this.client.writeRegisters(REGISTERS.WEIGHT, [targetWeight]);
        return;
    }
}


export default Tester;
