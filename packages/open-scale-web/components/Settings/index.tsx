import {
    useState,
    useEffect,
} from 'react';

import {
    ENDPOINT,
    PATHS,
    errorPercentageValues,
    restingTimeValues,
} from '@/data/index';

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
    const [errorPercentage, setErrorPercentage] = useState<keyof typeof errorPercentageValues>('1,0 %');
    const [restingTime, setRestingTime] = useState<keyof typeof restingTimeValues>('1 s');


    useEffect(() => {
        const updateSettings = async (
            errorPercentage: number,
            restingTime: number,
        ) => {
            try {
                await fetch(ENDPOINT + PATHS.SETTINGS, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        errorPercentage,
                        restingTime,
                    }),
                });
            } catch (error) {
                return;
            }
        }

        const errorPercentageValue = errorPercentageValues[errorPercentage];
        const restingTimeValue = restingTimeValues[restingTime];

        updateSettings(
            errorPercentageValue,
            restingTimeValue,
        );
    }, [
        errorPercentage,
        restingTime,
    ]);


    return (
        <div
            className="select-none grid gap-6 min-w-[300px] lg:min-w-[400px] font-bold text-lg"
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

            <Dropdown
                name={i18n[language].errorPercentage}
                selectables={[
                    ...Object.keys(errorPercentageValues),
                ]}
                selected={errorPercentage}
                atSelect={(selected) => {
                    setErrorPercentage(selected as keyof typeof errorPercentageValues);
                }}
            />

            <Dropdown
                name={i18n[language].restingTime}
                selectables={[
                    ...Object.keys(restingTimeValues),
                ]}
                selected={restingTime}
                atSelect={(selected) => {
                    setRestingTime(selected as keyof typeof restingTimeValues);
                }}
            />
        </div>
    );
}
