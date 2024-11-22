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
        errorPercentage: 'error percentage',
        restingTime: 'resting time',
    },
    ro: {
        home: 'acasă',
        tare: 'tarare',
        language: 'limbă',
        theme: 'temă',
        errorPercentage: 'procentaj de eroare',
        restingTime: 'timp de așezare',
    },
} as const;

export type Language = keyof typeof i18n;
