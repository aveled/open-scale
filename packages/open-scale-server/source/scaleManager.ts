import {
    WebSocket,
} from 'ws';

import {
    WEIGHT_INDICATOR,
    DEFAULT_FEED_SPEED,
    DEFAULT_FAST_SLOW_PERCENTAGE,
    DEFAULT_TARGET_WEIGHT,
    DEFAULT_ERROR_PERCENTAGE,
    DEFAULT_RESTING_TIME,
    WEIGHT_INTERVAL,
    FEED_INTERVAL,
    ANALYTICS_INTERVAL,
    ERRORS,

    RecordEvent,
    ScaleSettings,
    ScaleStatus,
    WeightIndicatorDriver,
} from './data';
import {
    updateAnalytics,
} from './analytics';
import database from './database';
import {
    WeightIndicatorDrivers,
    Sensor,
} from './drivers';
import {
    logger,
} from './utilities';



class ScaleManager {
    private weightIndicatorDriver: WeightIndicatorDriver | null;
    private sensorDriver: Sensor | null;
    private currentWeight: number = 0;
    private fastFeedSpeed: number = DEFAULT_FEED_SPEED.FAST;
    private slowFeedSpeed: number = DEFAULT_FEED_SPEED.SLOW;
    private fastSlowPercentage: number = DEFAULT_FAST_SLOW_PERCENTAGE;
    private targetWeight: number = DEFAULT_TARGET_WEIGHT;
    private errorPercentage: number = DEFAULT_ERROR_PERCENTAGE;
    private restingTime: number = DEFAULT_RESTING_TIME;
    private automaticMode: boolean = false;
    private activeScale: boolean = false;
    private feedStarted: boolean = false;
    private feedStopped: boolean = false;
    private feedFastSet: boolean = false;
    private feedSlowSet: boolean = false;
    private startFeedTime: number = 0;
    private slowFeedTime: number = 0;
    private errors: Set<string> = new Set();
    private sockets = new Map<string, WebSocket>();


    constructor() {
        this.initialize();

        this.weightIndicatorDriver = null;
        this.sensorDriver = null;
    }


    private async initialize() {
        await this.loadDatabase();
        this.startMonitoring();

        try {
            this.weightIndicatorDriver = new WeightIndicatorDrivers[WEIGHT_INDICATOR]();
        } catch (_e) {
            const interval = setInterval(() => {
                try {
                    this.weightIndicatorDriver = new WeightIndicatorDrivers[WEIGHT_INDICATOR]();
                    clearInterval(interval);
                } catch (error) {
                    logger('error', 'Could not initialize weight indicator driver', error);
                }
            }, 1_000);
        }

        try {
            this.sensorDriver = new Sensor();
        } catch (error) {
            logger('error', 'Could not initialize sensor', error);
        }
    }

    private async loadDatabase() {
        await database.read();

        this.fastFeedSpeed = database.data.fastFeedSpeed ?? DEFAULT_FEED_SPEED.FAST;
        this.slowFeedSpeed = database.data.slowFeedSpeed ?? DEFAULT_FEED_SPEED.SLOW;
        this.fastSlowPercentage = database.data.fastSlowPercentage ?? DEFAULT_FAST_SLOW_PERCENTAGE;
        this.targetWeight = database.data.targetWeight ?? DEFAULT_TARGET_WEIGHT;
        this.errorPercentage = database.data.errorPercentage ?? DEFAULT_ERROR_PERCENTAGE;
        this.restingTime = database.data.restingTime ?? DEFAULT_RESTING_TIME;
    }

    private startMonitoring() {
        this.weightMonitorLoop();
        this.feedControlLoop();
        this.analyticsLoop();
    }

    private weightMonitorLoop() {
        setInterval(async () => {
            if (!this.weightIndicatorDriver) {
                return;
            }

            try {
                const newWeight = await this.weightIndicatorDriver.getWeight();

                if (this.currentWeight === newWeight) {
                    return;
                }

                this.currentWeight = newWeight;
                this.messageSockets();
            } catch (_e) {
                this.errors.add(ERRORS.NO_WEIGHT);
            }
        }, WEIGHT_INTERVAL);
    }

    private feedStart() {
        this.feedCoarse();
    }

    private feedStop() {
        if (!this.weightIndicatorDriver) {
            return;
        }

        this.weightIndicatorDriver.resetOutputs();
    }

    private feedCoarse() {
        if (!this.weightIndicatorDriver) {
            return;
        }

        this.weightIndicatorDriver.setOutputCoarse();
    }

    private feedFine() {
        if (!this.weightIndicatorDriver) {
            return;
        }

        this.weightIndicatorDriver.setOutputFine();
    }

    private feedControlLoop() {
        setInterval(async () => {
            if (!this.activeScale) {
                if (this.feedStarted) {
                    this.feedStarted = false;
                    this.feedFastSet = false;
                    this.feedSlowSet = false;
                    this.feedStop();
                    this.messageSockets();
                }
                return;
            }

            if (!this.checkWeight()) {
                this.feedStopped = false;

                if (this.currentWeight < this.targetWeight * this.fastSlowPercentage) {
                    if (!this.feedFastSet) {
                        logger('info', 'Set feed to fast', this.currentWeight, this.targetWeight);
                        this.feedFastSet = true;
                        this.feedCoarse();
                        this.messageSockets();
                    }
                } else {
                    if (!this.feedSlowSet) {
                        logger('info', 'Set feed to slow', this.currentWeight, this.targetWeight);
                        this.feedSlowSet = true;
                        this.slowFeedTime = Date.now();
                        this.feedFine();
                        this.messageSockets();
                    }
                }

                if (!this.feedStarted) {
                    this.feedStarted = true;
                    this.feedFastSet = false;
                    this.feedSlowSet = false;

                    this.startFeedTime = Date.now();
                    this.feedStart();
                    this.messageSockets();
                }
            } else {
                this.feedStarted = false;
                this.feedFastSet = false;
                this.feedSlowSet = false;

                if (!this.feedStopped) {
                    this.feedStopped = true;
                    this.feedStop();

                    this.activeScale = false;

                    this.recordScaleEvent();
                    this.messageSockets();
                }
            }
        }, FEED_INTERVAL);
    }

    private async analyticsLoop() {
        await updateAnalytics();

        setInterval(async () => {
            await updateAnalytics();
        }, ANALYTICS_INTERVAL);
    }

    private checkWeight() {
        const lowerBound = this.targetWeight * (1 - this.errorPercentage);
        const upperBound = this.targetWeight * (1 + this.errorPercentage);

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
            this.fastSlowPercentage,
            this.errorPercentage,
            this.restingTime,
            this.fastFeedSpeed,
            this.slowFeedSpeed,
        ] satisfies RecordEvent;
        logger('info', 'Record scale event', data);

        await database.update((db) => {
            db.events.push(data);
        });
    }

    private messageSockets() {
        const status = this.getStatus();

        this.sockets.forEach((socket) => {
            socket.send(JSON.stringify(status));
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

        this.messageSockets();
    }

    public setActive(active: boolean) {
        this.activeScale = active;
        this.messageSockets();
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

    public async tare() {
        if (!this.weightIndicatorDriver) {
            return;
        }

        this.currentWeight = 0;

        await this.weightIndicatorDriver.tare();

        this.messageSockets();
    }

    public async toggleAutomaticMode() {
        this.automaticMode = !this.automaticMode;
        this.messageSockets();
    }

    public getStatus(): ScaleStatus {
        return {
            automaticMode: this.automaticMode,
            active: this.isActive(),
            currentWeight: this.getCurrentWeight(),
            targetWeight: this.getTargetWeight(),
            sensor: this.sensorDriver ? this.sensorDriver.readState() : false,
            settings: this.getSettings(),
            errors: this.getErrors(),
        } satisfies ScaleStatus;
    }

    public getSettings() {
        return {
            fastFeedSpeed: this.fastFeedSpeed,
            slowFeedSpeed: this.slowFeedSpeed,
            fastSlowPercentage: this.fastSlowPercentage,
            errorPercentage: this.errorPercentage,
            restingTime: this.restingTime,
        } satisfies ScaleSettings;
    }

    public async updateSettings(
        settings: ScaleSettings,
    ) {
        this.fastFeedSpeed = settings.fastFeedSpeed;
        this.slowFeedSpeed = settings.slowFeedSpeed;
        this.fastSlowPercentage = settings.fastSlowPercentage;;
        this.errorPercentage = settings.errorPercentage;
        this.restingTime = settings.restingTime;

        await database.update((data) => {
            data.fastFeedSpeed = settings.fastFeedSpeed;
            data.slowFeedSpeed = settings.slowFeedSpeed;
            data.fastSlowPercentage = settings.fastSlowPercentage;
            data.errorPercentage = settings.errorPercentage;
            data.restingTime = settings.restingTime;
        });

        this.messageSockets();
    }

    public async getAnalytics() {
        await database.read();

        return database.data.analytics;
    }

    public clearErrors() {
        this.errors.clear();
        this.messageSockets();
    }

    public handleSocket(socketID: string, socket: WebSocket) {
        this.sockets.set(socketID, socket);
    }

    public closeSocket(socketID: string, socket: WebSocket) {
        this.sockets.delete(socketID);
        socket.close();
    }

    public async __testSetWeight__(targetWeight: number) {
        if (!this.weightIndicatorDriver) {
            return;
        }

        await this.weightIndicatorDriver.__testSetWeight__(targetWeight);
    }

    public async __testToggleSensor__() {
        if (!this.sensorDriver) {
            return;
        }

        await this.sensorDriver.__testToggle__();
    }
}


const scaleManager = new ScaleManager();


export default scaleManager;
