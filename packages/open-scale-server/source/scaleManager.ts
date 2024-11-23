import ModbusRTU from 'npm:modbus-serial';

import {
    REGISTERS,
    FEED_SPEED,
    FAST_SLOW_PERCENTAGE,
    DEFAULT_TARGET_WEIGHT,
    DEFAULT_ERROR_PERCENTAGE,
    DEFAULT_RESTING_TIME,
    WEIGHT_INTERVAL,
    FEED_INTERVAL,
    ERRORS,

    RecordEvent,
    ScaleSettings,
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
    private restingTime: number = DEFAULT_RESTING_TIME;
    private activeScale: boolean = false;
    private feedStarted: boolean = false;
    private feedStopped: boolean = false;
    private feedFastSet: boolean = false;
    private feedSlowSet: boolean = false;
    private startFeedTime: number = 0;
    private slowFeedTime: number = 0;
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
        this.restingTime = database.data.restingTime ?? DEFAULT_RESTING_TIME;
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
                        this.slowFeedTime = Date.now();
                        await this.client.writeRegisters(REGISTERS.SPEED_FEED, [FEED_SPEED.SLOW]);
                    }
                }

                if (!this.feedStarted) {
                    this.feedStarted = true;
                    this.feedFastSet = false;
                    this.feedSlowSet = false;

                    this.startFeedTime = Date.now();
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

    private delayRestingTime() {
        return new Promise((resolve) => {
            setTimeout(resolve, this.restingTime);
        });
    }

    private async recordScaleEvent() {
        await this.delayRestingTime();

        const now = Date.now();
        const data = [
            this.startFeedTime,
            this.slowFeedTime - this.startFeedTime,
            now - this.startFeedTime,
            this.targetWeight,
            this.currentWeight - this.targetWeight,
            this.errorPercentage,
            this.restingTime,
        ] satisfies RecordEvent;
        logger('info', 'Record scale event', data);

        await database.update((db) => {
            db.events.push(data);
        });
    }


    public getCurrentWeight() {
        return this.currentWeight;
    }

    public getTargetWeight() {
        return this.targetWeight;
    }

    public async setTargetWeight(targetWeight: number) {
        logger('info', 'Set target weight', targetWeight);
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

    public async updateSettings(
        settings: ScaleSettings,
    ) {
        this.errorPercentage = settings.errorPercentage;
        this.restingTime = settings.restingTime;

        await database.update((data) => {
            data.errorPercentage = settings.errorPercentage;
            data.restingTime = settings.restingTime;
        });
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
