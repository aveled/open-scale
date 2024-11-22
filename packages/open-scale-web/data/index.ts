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
    errors: string[];
}
