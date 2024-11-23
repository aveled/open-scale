export const ENDPOINT = process.env.ENDPOINT || 'http://localhost:8485';

export const PATHS = {
    STATUS: '/status',
    START: '/start',
    STOP: '/stop',
    TARGET_WEIGHT: '/target-weight',
    TARE: '/tare',
    SETTINGS: '/settings',
    CLEAR_ERRORS: '/clear-errors',
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

export const fastFeedSpeedValues = {
    '35 Hz': 35,
    '40 Hz': 40,
    '45 Hz': 45,
    '50 Hz': 50,
} as const;

export const slowFeedSpeedValues = {
    '10 Hz': 10,
    '15 Hz': 15,
    '20 Hz': 20,
    '25 Hz': 25,
    '30 Hz': 30,
    '35 Hz': 35,
} as const;

export const fastSlowPercentageValues = {
    '85 %': 0.85,
    '87 %': 0.87,
    '90 %': 0.9,
    '93 %': 0.93,
    '95 %': 0.95,
    '97 %': 0.97,
} as const;

export const errorPercentageValues = {
    '0,1 %': 0.1,
    '0,2 %': 0.2,
    '0,3 %': 0.3,
    '0,5 %': 0.5,
    '1,0 %': 1.0,
    '1,5 %': 1.5,
    '2,0 %': 2.0,
    '2,5 %': 2.5,
    '3,0 %': 3.0,
} as const;

export const restingTimeValues = {
    '0,1 s': 0.1,
    '0,2 s': 0.2,
    '0,3 s': 0.3,
    '0,5 s': 0.5,
    '1 s': 1.0,
    '1,5 s': 1.5,
    '2 s': 2.0,
    '2,5 s': 2.5,
    '3 s': 3.0,
    '5 s': 5.0,
} as const;


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

export interface TextualScaleSettings {
    fastFeedSpeed: string;
    slowFeedSpeed: string;
    fastSlowPercentage: string;
    errorPercentage: string;
    restingTime: string;
}

export const defaultScaleSettings: TextualScaleSettings = {
    fastFeedSpeed: '50 Hz',
    slowFeedSpeed: '20 Hz',
    fastSlowPercentage: '95 %',
    errorPercentage: '1,0 %',
    restingTime: '1 s',
} as const;
