export const ENDPOINT = process.env.ENDPOINT || 'http://localhost:8485';

export const PATHS = {
    STATUS: '/status',
    START: '/start',
    STOP: '/stop',
    TARGET_WEIGHT: '/target-weight',
    TARE: '/tare',
    CLEAR_ERRORS: '/clear-errors',
} as const;



export const defaultTargetWeights = [
    1_000,
    5_000,
    10_000,
    20_000,
    25_000,
    30_000,
    50_000,
];
