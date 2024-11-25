import {
    useState,
    useEffect,
} from 'react';

import {
    ScaleSettings,
    Analytics,

    ENDPOINT,
    PATHS,
    fastFeedSpeedValues,
    slowFeedSpeedValues,
    fastSlowPercentageValues,
    errorPercentageValues,
    restingTimeValues,
    defaultScaleSettings,
} from '@/data/index';

import {
    Language,
    languages,
    i18n,
} from '@/data/language';

import Dropdown from '@/components/Dropdown';
import Button from '@/components/Button';
import DropdownInputNumber from '@/components/DropdownInputNumber';
import AnalyticsDashboard from '@/components/Analytics';



export default function Settings({
    language,
    setLanguage,
    theme,
    setTheme,
    values,
    analytics,
}: {
    language: Language;
    setLanguage: (language: Language) => void;
    theme: string;
    setTheme: (theme: string) => void;
    values: ScaleSettings;
    analytics: Analytics;
}) {
    const [fastFeedSpeed, setFastFeedSpeed] = useState(values.fastFeedSpeed);
    const [slowFeedSpeed, setSlowFeedSpeed] = useState(values.slowFeedSpeed);
    const [fastSlowPercentage, setFastSlowPercentage] = useState(values.fastSlowPercentage);
    const [errorPercentage, setErrorPercentage] = useState(values.errorPercentage);
    const [restingTime, setRestingTime] = useState(values.restingTime);


    const reset = () => {
        setLanguage('en');
        setTheme('dark');
        setFastFeedSpeed(defaultScaleSettings.fastFeedSpeed);
        setSlowFeedSpeed(defaultScaleSettings.slowFeedSpeed);
        setFastSlowPercentage(defaultScaleSettings.fastSlowPercentage);
        setErrorPercentage(defaultScaleSettings.errorPercentage);
        setRestingTime(defaultScaleSettings.restingTime);
    }

    const restartServer = async () => {
        try {
            await fetch(ENDPOINT + PATHS.RESTART_SERVER, {
                method: 'POST',
            });
        } catch (error) {
            return;
        }
    }

    const exportData = async () => {
        try {
            await fetch(ENDPOINT + PATHS.EXPORT_DATA, {
                method: 'POST',
            });
        } catch (error) {
            return;
        }
    }


    useEffect(() => {
        const updateSettings = async () => {
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

        updateSettings();
    }, [
        fastFeedSpeed,
        slowFeedSpeed,
        fastSlowPercentage,
        errorPercentage,
        restingTime,
    ]);

    useEffect(() => {
        setFastFeedSpeed(values.fastFeedSpeed);
        setSlowFeedSpeed(values.slowFeedSpeed);
        setFastSlowPercentage(values.fastSlowPercentage);
        setErrorPercentage(values.errorPercentage);
        setRestingTime(values.restingTime);
    }, [
        values.fastFeedSpeed,
        values.slowFeedSpeed,
        values.fastSlowPercentage,
        values.errorPercentage,
        values.restingTime,
    ]);


    return (
        <div
            className="select-none grid gap-6 min-w-[300px] lg:min-w-[400px] font-bold text-lg"
        >
            <AnalyticsDashboard
                data={analytics}
            />

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


            <DropdownInputNumber
                name={i18n[language].fastFeedSpeed}
                selectables={[
                    ...fastFeedSpeedValues.map((value) => value + ' Hz'),
                ]}
                selected={fastFeedSpeed + ' Hz'}
                atSelect={(selected) => {
                    const value = Number(selected.replace(' Hz', '').replace(',', '.'));
                    setFastFeedSpeed(value);
                }}

                value={fastFeedSpeed}
                format="XX,XX"
                unit="Hz"
                max={50}
                availableNumbers={{
                    0: [0, 1, 2, 3, 4, 5],
                }}
            />

            <DropdownInputNumber
                name={i18n[language].slowFeedSpeed}
                selectables={[
                    ...slowFeedSpeedValues.map((value) => value + ' Hz'),
                ]}
                selected={slowFeedSpeed + ' Hz'}
                atSelect={(selected) => {
                    const value = Number(selected.replace(' Hz', '').replace(',', '.'));
                    setSlowFeedSpeed(value);
                }}

                value={slowFeedSpeed}
                format="XX,XX"
                unit="Hz"
                max={50}
                availableNumbers={{
                    0: [0, 1, 2, 3, 4, 5],
                }}
            />

            <DropdownInputNumber
                name={i18n[language].fastSlowPercentage}
                selectables={[
                    ...fastSlowPercentageValues.map((value) => (value * 100) + ' %'),
                ]}
                selected={(fastSlowPercentage * 100) + ' %'}
                atSelect={(selected) => {
                    const value = Number(selected.replace(' %', '').replace(',', '.')) / 100;
                    setFastSlowPercentage(value);
                }}

                value={fastSlowPercentage * 100}
                format="XX,XX"
                unit="%"
                max={99.99}
                availableNumbers={{
                }}
            />

            <DropdownInputNumber
                name={i18n[language].errorPercentage}
                selectables={[
                    ...errorPercentageValues.map((value) => (value * 100) + ' %'),
                ]}
                selected={(errorPercentage * 100) + ' %'}
                atSelect={(selected) => {
                    const value = Number(selected.replace(' %', '').replace(',', '.')) / 100;
                    setErrorPercentage(value);
                }}

                value={errorPercentage * 100}
                format="X,XX"
                unit="%"
                max={99.99}
                availableNumbers={{
                }}
            />

            <DropdownInputNumber
                name={i18n[language].restingTime}
                selectables={[
                    ...restingTimeValues.map((value) => (value / 1000) + ' s'),
                ]}
                selected={(restingTime / 1000) + ' s'}
                atSelect={(selected) => {
                    const value = Number(selected.replace(' s', '').replace(',', '.')) * 1000;
                    setRestingTime(value);
                }}

                value={restingTime / 1000}
                format="XX,X"
                unit="s"
                max={99.9}
                availableNumbers={{
                }}
                defaultSelectedChar={1}
            />

            <div
                className="mt-12 grid gap-12"
            >
                <Button
                    text="RESET"
                    onClick={() => {
                        reset();
                    }}
                    small={true}
                />

                <Button
                    text="RESTART"
                    onClick={() => {
                        restartServer();
                    }}
                    small={true}
                />

                <Button
                    text="EXPORT DATA"
                    onClick={() => {
                        exportData();
                    }}
                    small={true}
                />
            </div>
        </div>
    );
}
