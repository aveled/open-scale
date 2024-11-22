import {
    Language,
    languages,
    i18n,
} from '@/data/language';

import Dropdown from '@/components/Dropdown';



export default function Settings({
    language,
    setLanguage,
    theme,
    setTheme,
}: {
    language: Language;
    setLanguage: React.Dispatch<React.SetStateAction<Language>>;
    theme: string;
    setTheme: React.Dispatch<React.SetStateAction<string>>;
}) {
    return (
        <div
            className="select-none grid gap-6 min-w-[300px] font-bold text-lg"
        >
            <Dropdown
                name={i18n[language].language}
                selectables={[
                    ...Object.values(languages),
                ]}
                selected={(languages as any)[language]}
                atSelect={(selected) => {
                    for (const [key, value] of Object.entries(languages)) {
                        if (value === selected) {
                            setLanguage(key as Language);
                            return;
                        }
                    }
                }}
            />

            <Dropdown
                name={i18n[language].theme}
                selectables={[
                    'light',
                    'dark',
                ]}
                selected={theme}
                atSelect={(selected) => {
                    setTheme(selected);
                }}
            />
        </div>
    );
}
