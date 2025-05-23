export const languages = {
    en: 'english',
    ro: 'română',
} as const;

export const i18n = {
    en: {
        home: 'home',
        automaticMode: 'automatic',
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
        analyticsYear: 'analytics year',
        analyticsMonth: 'month',
        analyticsDay: 'day',
        noData: 'no data',
    },
    ro: {
        home: 'acasă',
        automaticMode: 'automat',
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
            'NO_WEIGHT': 'fără masă',
            'NO_FEED': 'fără alimentare',
            'NO_SERVER': 'server-ul nu a fost găsit',
        },
        analyticsYear: 'anul de analiză',
        analyticsMonth: 'luna',
        analyticsDay: 'ziua',
        noData: 'fără date',
    },
} as const;

export type Language = keyof typeof i18n;
