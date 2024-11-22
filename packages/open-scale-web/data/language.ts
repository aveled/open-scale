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
    },
    ro: {
        home: 'acasă',
        tare: 'tarare',
        language: 'limbă',
        theme: 'temă',
    },
} as const;

export type Language = keyof typeof i18n;
