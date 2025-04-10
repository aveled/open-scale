export const styleTrim = (
    style: string,
) => {
    return style
        .replace(/\s+|\n/g, ' ')
        .trim();
}


export const logger = (
    level: 'info' | 'warn' | 'error' = 'info',
    ...message: any[]
) => {
    if (process.env.NEXT_DEBUG !== 'true' && level !== 'error') {
        return;
    }

    const logLevel = process.env.NEXT_LOG_LEVEL || 'error';
    if (
        (logLevel === 'error' && level !== 'error')
        || (logLevel === 'warn' && (level !== 'warn' && level !== 'error'))
    ) {
        return;
    }

    console.log(`[${level.toUpperCase()}]`, ...message);

    try {
        if (typeof window === 'undefined') {
            return;
        }

        fetch('/api/logger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                level,
                message,
            }),
        });
    } catch (error) {
        console.error('Logger error', error);
    }
}
