// deno-lint-ignore-file no-explicit-any

export const logger = (
    level: 'info' | 'warn' | 'error' = 'info',
    ...message: any[]
) => {
    if (Deno.env.get('DEBUG') !== 'true') {
        return;
    }

    const logLevel = Deno.env.get('LOG_LEVEL');
    if (
        (logLevel === 'error' && level !== 'error')
        || (logLevel === 'warn' && (level !== 'warn' && level !== 'error'))
    ) {
        return
    }

    console.log(`[${level.toUpperCase()}]`, ...message);
}
