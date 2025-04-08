export const PORT = parseInt(process.env.PORT || '') || 8485;
export const ENVIRONMENT = process.env.NODE_ENV || 'development';
export const EXTERNAL_USB = process.env.EXTERNAL_USB || '/dev/ttyUSB2';

export const DEFAULT_FEED_SPEED = {
    FAST: 50,
    SLOW: 20,
}; // Hz
export const DEFAULT_FAST_SLOW_PERCENTAGE = 0.95;
export const DEFAULT_TARGET_WEIGHT = 25_000; // grams
export const DEFAULT_ERROR_PERCENTAGE = 0.01; // 1%
export const DEFAULT_RESTING_TIME = 2_000; // ms
export const WEIGHT_INTERVAL = 100;
export const FEED_INTERVAL = 95;
export const ANALYTICS_INTERVAL = 1000 * 60 * 60 * 12; // 12 hours
export const ERRORS = {
    OVERSHOOT: 'OVERSHOOT',
    NO_WEIGHT: 'NO_WEIGHT',
    NO_FEED: 'NO_FEED',
    NO_SERVER: 'NO_SERVER',
} as const;

export type WeightIndicatorType = 'tester' | 'laumas-w100';
export const WEIGHT_INDICATOR = (process.env.WEIGHT_INDICATOR || 'tester') as WeightIndicatorType;
export type VFDType = 'tester' | 'vfd';
export const VFD = (process.env.VFD || 'tester') as VFDType;


export const PATHS = {
    STATUS: '/status',
    START: '/start',
    STOP: '/stop',
    TARGET_WEIGHT: '/target-weight',
    TOGGLE_AUTOMATIC_MODE: '/toggle-automatic-mode',
    TARE: '/tare',
    SETTINGS: '/settings',
    ANALYTICS: '/analytics',
    CLEAR_ERRORS: '/clear-errors',
    RESTART_SERVER: '/restart-server',
    EXPORT_DATA: '/export-data',
    TEST_SET_WEIGHT: '/test-set-weight',
    TEST_TOGGLE_SENSOR: '/test-toggle-sensor',
} as const;

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};



export type RecordEvent = [
    number, // 0 - startFeedTime
    number, // 1 - fast/slowFeedTime difference
    number, // 2 - feed duration,
    number, // 3 - targetWeight
    number, // 4 - currentWeight difference
    number, // 5 - fastSlowPercentage
    number, // 6 - errorPercentage,
    number, // 7 - restingTime,
    number, // 8 - fastFeedSpeed
    number, // 9 - slowFeedSpeed
];
export interface Database {
    fastFeedSpeed: number;
    slowFeedSpeed: number;
    fastSlowPercentage: number;
    targetWeight: number;
    errorPercentage: number;
    restingTime: number;
    events: RecordEvent[];
    analytics: Analytics;
}
export interface ColdStorage {
    events: RecordEvent[];
}


export interface ScaleStatus {
    automaticMode: boolean;
    active: boolean;
    currentWeight: number;
    targetWeight: number;
    sensor: boolean;
    settings: ScaleSettings;
    errors: string[];
}

export interface ScaleSettings {
    fastFeedSpeed: number;
    slowFeedSpeed: number;
    fastSlowPercentage: number;
    errorPercentage: number;
    restingTime: number;
}


export type Analytics = Record<number, Year>;
export interface Year {
    [month: number]: Month;
}
export interface Month {
    [day: number]: Day;
}
export interface Day {
    [hour: number]: Hour;
}
export interface Hour {
    // targetWeight -> units measured
    measurements: Record<number, number>;
    averageError: number;
}



export interface WeightIndicatorDriver {
    getWeight(): Promise<number>;
    tare(): Promise<boolean>;
    zero(): Promise<boolean>;
    setOutputCoarse(): Promise<boolean>;
    setOutputFine(): Promise<boolean>;
    resetOutputs(): Promise<boolean>;
    getInputState(): Promise<boolean>;
    pollInputChange(
        inputFunction: () => Promise<boolean>,
        callback: (newState: boolean) => void,
        intervalMs?: number,
    ): number;
    __testSetWeight__(_weight: number): Promise<void>;
    onReconnect(callback: () => void): void;
}
