export const logger = (
    level: 'info' | 'warn' | 'error' = 'info',
    ...message: any[]
) => {
    if (process.env.DEBUG !== 'true') {
        return;
    }

    const logLevel = process.env.LOG_LEVEL;
    if (
        (logLevel === 'error' && level !== 'error')
        || (logLevel === 'warn' && (level !== 'warn' && level !== 'error'))
    ) {
        return
    }

    console.log(`[${level.toUpperCase()}]`, ...message);
}
