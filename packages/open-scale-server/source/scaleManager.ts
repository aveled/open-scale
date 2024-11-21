import ModbusRTU from 'npm:modbus-serial';

import {
    REGISTERS,
    FEED_SPEED,
    FAST_SLOW_PERCENTAGE,
    DEFAULT_TARGET_WEIGHT,
    DEFAULT_ERROR_PERCENTAGE,
    WEIGHT_INTERVAL,
    FEED_INTERVAL,
    ERRORS,
} from './data.ts';
import modbus from './modbus.ts';
import database from './database.ts';
import {
    logger,
} from './utilities.ts';



class ScaleManager {
    private client: ModbusRTU.default;
    private currentWeight: number = 0;
    private targetWeight: number = DEFAULT_TARGET_WEIGHT;
    private errorPercentage: number = DEFAULT_ERROR_PERCENTAGE;
    private activeScale: boolean = false;
    private feedStarted: boolean = false;
    private feedStopped: boolean = false;
    private feedFastSet: boolean = false;
    private feedSlowSet: boolean = false;
    private errors: Set<string> = new Set();


    constructor(
        client: ModbusRTU.default,
    ) {
        this.client = client;
        this.initialize();
    }


    private async initialize() {
        await this.loadDatabase();
        this.startMonitoring();
    }

    private async loadDatabase() {
        await database.read();

        this.targetWeight = database.data.targetWeight ?? DEFAULT_TARGET_WEIGHT;
        this.errorPercentage = database.data.errorPercentage ?? DEFAULT_ERROR_PERCENTAGE;
    }

    private startMonitoring() {
        this.weightMonitorLoop();
        this.feedControlLoop();
    }

    private weightMonitorLoop() {
        setInterval(async () => {
            try {
                const weightRegister = await this.client.readHoldingRegisters(REGISTERS.WEIGHT, 1);
                this.currentWeight = weightRegister.data[0];
            } catch (_e) {
                this.errors.add(ERRORS.NO_WEIGHT);
            }
        }, WEIGHT_INTERVAL);
    }

    private feedControlLoop() {
        setInterval(async () => {
            if (!this.activeScale) {
                if (this.feedStarted) {
                    this.feedStarted = false;
                    this.feedFastSet = false;
                    this.feedSlowSet = false;

                    await this.client.writeRegisters(REGISTERS.STOP_FEED, [1]);
                }
                return;
            }

            if (!this.checkWeight()) {
                this.feedStopped = false;

                if (this.currentWeight < this.targetWeight * FAST_SLOW_PERCENTAGE) {
                    if (!this.feedFastSet) {
                        logger('info', 'Set feed to fast', this.currentWeight, this.targetWeight);
                        this.feedFastSet = true;
                        await this.client.writeRegisters(REGISTERS.SPEED_FEED, [FEED_SPEED.FAST]);
                    }
                } else {
                    if (!this.feedSlowSet) {
                        logger('info', 'Set feed to slow', this.currentWeight, this.targetWeight);
                        this.feedSlowSet = true;
                        await this.client.writeRegisters(REGISTERS.SPEED_FEED, [FEED_SPEED.SLOW]);
                    }
                }

                if (!this.feedStarted) {
                    this.feedStarted = true;
                    this.feedFastSet = false;
                    this.feedSlowSet = false;

                    await this.client.writeRegisters(REGISTERS.START_FEED, [1]);
                }
            } else {
                this.feedStarted = false;
                this.feedFastSet = false;
                this.feedSlowSet = false;

                if (!this.feedStopped) {
                    this.feedStopped = true;
                    await this.client.writeRegisters(REGISTERS.STOP_FEED, [1]);

                    this.activeScale = false;

                    this.recordScaleEvent();
                }
            }
        }, FEED_INTERVAL);
    }

    private checkWeight() {
        const lowerBound = this.targetWeight * (1 - this.errorPercentage / 100);
        const upperBound = this.targetWeight * (1 + this.errorPercentage / 100);

        if (this.currentWeight > upperBound) {
            this.errors.add(ERRORS.OVERSHOOT);
            this.activeScale = false;
            return true;
        }

        return this.currentWeight >= lowerBound && this.currentWeight <= upperBound;
    }

    private recordScaleEvent() {
        const data = [
            Date.now(),
            this.targetWeight,
            this.currentWeight,
        ];

        logger('info', 'Record scale event', data);
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

    public setActive(active: boolean) {
        this.activeScale = active;
    }

    public isActive() {
        return this.activeScale;
    }

    public getErrors() {
        return Array.from(this.errors);
    }

    public stop() {
        this.activeScale = false;
    }

    public tare() {
        this.currentWeight = 0;
        this.client.writeRegisters(REGISTERS.TARE, [1]);
    }

    public clearErrors() {
        this.errors.clear();
    }

    public async __testSetWeight__(targetWeight: number) {
        await this.client.writeRegisters(REGISTERS.WEIGHT, [targetWeight]);
    }
}


const scaleManager = new ScaleManager(modbus);


export default scaleManager;