import ModbusRTU from 'npm:modbus-serial';

import {
    WEIGHT_REGISTER,
    START_FEED_REGISTER,
    STOP_FEED_REGISTER,
    SPEED_FEED_REGISTER,
    FAST_SPEED_FEED,
    SLOW_SPEED_FEED,
    FAST_SLOW_PERCENTAGE,
    DEFAULT_TARGET_WEIGHT,
    NO_WEIGHT_ERROR,
} from './data.ts';
import modbus from './modbus.ts';
import database from './database.ts';



class ScaleManager {
    private client: ModbusRTU.default;
    private currentWeight: number = 0;
    private targetWeight: number = DEFAULT_TARGET_WEIGHT;
    private activeScale: boolean = false;
    private feedStarted: boolean = false;
    private feedStopped: boolean = false;
    private feedSet: boolean = false;
    private errors: string[] = [];


    constructor(
        client: ModbusRTU.default,
    ) {
        this.client = client;

        this.loadDatabase();
        this.weightLoop();
        this.feedLoop();
    }

    public getCurrentWeight() {
        return this.currentWeight;
    }

    public getTargetWeight() {
        return this.targetWeight;
    }

    public async setTargetWeight(targetWeight: number) {
        this.targetWeight = targetWeight;

        await database.update((data) => {
            data.targetWeight = targetWeight;
        });
    }

    public checkWeight() {
        return this.currentWeight <= this.targetWeight;
    }

    public setActive(active: boolean) {
        this.activeScale = active;
    }

    public isActive() {
        return this.activeScale;
    }

    public getErrors() {
        return this.errors;
    }

    public clearErrors() {
        this.errors = [];
    }

    public stop() {
        this.activeScale = false;
    }

    public tare() {
        this.currentWeight = 0;
        // this.client.writeRegisters(0, [1]);
    }

    public async testSetWeight(targetWeight: number) {
        await this.client.writeRegisters(WEIGHT_REGISTER, [targetWeight]);
    }


    private weightLoop() {
        setInterval(async () => {
            try {
                const weightRegister = await this.client.readHoldingRegisters(WEIGHT_REGISTER, 1);
                this.currentWeight = weightRegister.data[0];
            } catch (_e) {
                if (!this.errors.includes(NO_WEIGHT_ERROR)) {
                    this.errors.push(NO_WEIGHT_ERROR);
                }
            }
        }, 50);
    }

    private feedLoop() {
        setInterval(async () => {
            if (!this.activeScale) {
                if (this.feedStarted) {
                    this.feedStarted = false;
                    await this.client.writeRegisters(STOP_FEED_REGISTER, [1]);
                }
                return;
            }

            if (this.checkWeight()) {
                this.feedStopped = false;

                if (this.targetWeight * FAST_SLOW_PERCENTAGE < this.currentWeight) {
                    if (!this.feedSet) {
                        this.feedSet = true;
                        await this.client.writeRegisters(SPEED_FEED_REGISTER, [FAST_SPEED_FEED]);
                    }
                } else {
                    if (!this.feedSet) {
                        this.feedSet = true;
                        await this.client.writeRegisters(SPEED_FEED_REGISTER, [SLOW_SPEED_FEED]);
                    }
                }

                if (!this.feedStarted) {
                    this.feedStarted = true;
                    this.feedSet = false;

                    await this.client.writeRegisters(START_FEED_REGISTER, [1]);
                }
            } else {
                this.feedStarted = false;
                this.feedSet = false;

                if (!this.feedStopped) {
                    this.feedStopped = true;
                    await this.client.writeRegisters(STOP_FEED_REGISTER, [1]);

                    this.activeScale = false;

                    this.recordScaleEvent();
                }
            }
        }, 50);
    }

    private recordScaleEvent() {
        const data = [
            Date.now(),
            this.targetWeight,
            this.currentWeight,
        ];

        console.log('Record scale event', data);
    }

    private async loadDatabase() {
        await database.read();

        this.targetWeight = database.data.targetWeight;
    }
}


const scaleManager = new ScaleManager(modbus);


export default scaleManager;
