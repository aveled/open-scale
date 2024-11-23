export const ENDPOINT = process.env.ENDPOINT || 'http://localhost:8485';

export const PATHS = {
    STATUS: '/status',
    START: '/start',
    STOP: '/stop',
    TARGET_WEIGHT: '/target-weight',
    TARE: '/tare',
    SETTINGS: '/settings',
    CLEAR_ERRORS: '/clear-errors',
    RESTART_SERVER: '/restart-server',
} as const;

export const LOADING_INTERVAL = 1_000; // ms



export const defaultTargetWeights = [
    1_000,
    5_000,
    10_000,
    20_000,
    25_000,
    30_000,
    50_000,
];

export const fastFeedSpeedValues = [
    35,
    40,
    45,
    50,
] as const;

export const slowFeedSpeedValues = [
    10,
    15,
    20,
    25,
    30,
] as const;

export const fastSlowPercentageValues = [
    0.87,
    0.9,
    0.93,
    0.95,
    0.97,
] as const;

export const errorPercentageValues = [
    0.001,
    0.002,
    0.005,
    0.01,
    0.015,
    0.02,
    0.025,
] as const;

export const restingTimeValues = [
    100,
    200,
    500,
    1000,
    1500,
    2000,
    5000,
] as const;


export type ViewType =
    | 'general' | 'settings' | 'current' | 'target';

export interface StatusData {
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

export const defaultScaleSettings: ScaleSettings = {
    fastFeedSpeed: 50,
    slowFeedSpeed: 20,
    fastSlowPercentage: 0.95,
    errorPercentage: 0.01,
    restingTime: 1000,
} as const;
