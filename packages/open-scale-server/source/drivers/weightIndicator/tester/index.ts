import {
    WeightIndicatorDriver,

    REGISTERS,
} from '../../../data';
import WeightIndicatorBase from '../base';



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
