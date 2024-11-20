export const ENDPOINT = process.env.ENDPOINT || 'http://localhost:8485';

export const PATHS = {
    STATUS: '/status',
    START: '/start',
    NEW_WEIGHT: '/new-weight',
    CLEAR_ERRORS: '/clear-errors',
} as const;
