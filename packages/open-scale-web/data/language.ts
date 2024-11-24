export const languages = {
    en: 'english',
    ro: 'română',
} as const;

export const i18n = {
    en: {
        home: 'home',
        tare: 'tare',
        language: 'language',
        theme: 'theme',
        fastFeedSpeed: 'fast feed speed',
        slowFeedSpeed: 'slow feed speed',
        fastSlowPercentage: 'fast-slow percentage',
        errorPercentage: 'error percentage',
        restingTime: 'resting time',
        error: 'error',
        errors: {
            'OVERSHOOT': 'overshoot weighing limit',
            'NO_WEIGHT': 'no weight',
            'NO_FEED': 'no feed',
            'NO_SERVER': 'no server found',
        },
    },
    ro: {
        home: 'acasă',
        tare: 'tarare',
        language: 'limbă',
        theme: 'temă',
        fastFeedSpeed: 'viteză de alimentare rapidă',
        slowFeedSpeed: 'viteză de alimentare lentă',
        fastSlowPercentage: 'procentaj rapid-lent',
        errorPercentage: 'procentaj de eroare',
        restingTime: 'timp de așezare',
        error: 'eroare',
        errors: {
            'OVERSHOOT': 'depășire limită cântărire',
            'NO_WEIGHT': 'fără greutate',
            'NO_FEED': 'fără alimentare',
            'NO_SERVER': 'server-ul nu a fost găsit',
        },
    },
} as const;

export type Language = keyof typeof i18n;
