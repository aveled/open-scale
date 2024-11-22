export const PORT = 8485;

export const REGISTERS = {
    WEIGHT: 5,
    START_FEED: 6,
    STOP_FEED: 7,
    SPEED_FEED: 8,
    TARE: 9,
};
export const FEED_SPEED = {
    FAST: 50,
    SLOW: 20,
};
export const FAST_SLOW_PERCENTAGE = 0.95;
export const DEFAULT_TARGET_WEIGHT = 25_000; // grams
export const DEFAULT_ERROR_PERCENTAGE = 1;
export const DEFAULT_RESTING_TIME = 1_000; // ms
export const WEIGHT_INTERVAL = 100;
export const FEED_INTERVAL = 95;
export const ERRORS = {
    OVERSHOOT: 'OVERSHOOT',
    NO_WEIGHT: 'NO_WEIGHT',
    NO_FEED: 'NO_FEED',
} as const;



export type RecordEvent = [number, number, number];
export interface Database {
    targetWeight: number;
    errorPercentage: number;
    restingTime: number;
    events: RecordEvent[];
}


export interface ScaleStatus {
    active: boolean;
    currentWeight: number;
    targetWeight: number;
    errors: string[];
}

export interface ScaleSettings {
    errorPercentage: number;
    restingTime: number;
}
