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
    },
} as const;

export type Language = keyof typeof i18n;
