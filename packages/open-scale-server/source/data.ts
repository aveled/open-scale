export const PORT = 8485;

export const REGISTERS = {
    WEIGHT: 5,
    START_FEED: 6,
    STOP_FEED: 7,
    SPEED_FEED: 8,
    TARE: 9,
};
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


export type RecordEvent = [
    number, // startFeedTime
    number, // slowFeedTime difference
    number, // currentTime difference
    number, // targetWeight
    number, // currentWeight difference
    number, // fastSlowPercentage
    number, // errorPercentage,
    number, // restingTime,
    number, // fastFeedSpeed
    number, // slowFeedSpeed
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
    active: boolean;
    currentWeight: number;
    targetWeight: number;
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
