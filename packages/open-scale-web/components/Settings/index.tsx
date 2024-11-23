import {
    useState,
    useEffect,
} from 'react';

import {
    ENDPOINT,
    PATHS,
    fastFeedSpeedValues,
    slowFeedSpeedValues,
    fastSlowPercentageValues,
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
    const [fastFeedSpeed, setFastFeedSpeed] = useState<keyof typeof fastFeedSpeedValues>('50 Hz');
    const [slowFeedSpeed, setSlowFeedSpeed] = useState<keyof typeof slowFeedSpeedValues>('20 Hz');
    const [fastSlowPercentage, setFastSlowPercentage] = useState<keyof typeof fastSlowPercentageValues>('95 %');
    const [errorPercentage, setErrorPercentage] = useState<keyof typeof errorPercentageValues>('1,0 %');
    const [restingTime, setRestingTime] = useState<keyof typeof restingTimeValues>('1 s');


    useEffect(() => {
        const updateSettings = async (
            fastFeedSpeed: number,
            slowFeedSpeed: number,
            fastSlowPercentage: number,
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
                        fastFeedSpeed,
                        slowFeedSpeed,
                        fastSlowPercentage,
                        errorPercentage,
                        restingTime,
                    }),
                });
            } catch (error) {
                return;
            }
        }

        const fastFeedSpeedValue = fastFeedSpeedValues[fastFeedSpeed];
        const slowFeedSpeedValue = slowFeedSpeedValues[slowFeedSpeed];
        const fastSlowPercentageValue = fastSlowPercentageValues[fastSlowPercentage];
        const errorPercentageValue = errorPercentageValues[errorPercentage];
        const restingTimeValue = restingTimeValues[restingTime];

        updateSettings(
            fastFeedSpeedValue,
            slowFeedSpeedValue,
            fastSlowPercentageValue,
            errorPercentageValue,
            restingTimeValue,
        );
    }, [
        fastFeedSpeed,
        slowFeedSpeed,
        fastSlowPercentage,
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
                name={i18n[language].fastFeedSpeed}
                selectables={[
                    ...Object.keys(fastFeedSpeedValues),
                ]}
                selected={fastFeedSpeed}
                atSelect={(selected) => {
                    setFastFeedSpeed(selected as keyof typeof fastFeedSpeedValues);
                }}
            />

            <Dropdown
                name={i18n[language].slowFeedSpeed}
                selectables={[
                    ...Object.keys(slowFeedSpeedValues),
                ]}
                selected={slowFeedSpeed}
                atSelect={(selected) => {
                    setSlowFeedSpeed(selected as keyof typeof slowFeedSpeedValues);
                }}
            />

            <Dropdown
                name={i18n[language].fastSlowPercentage}
                selectables={[
                    ...Object.keys(fastSlowPercentageValues),
                ]}
                selected={fastSlowPercentage}
                atSelect={(selected) => {
                    setFastSlowPercentage(selected as keyof typeof fastSlowPercentageValues);
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
