'use client';

import {
    useState,
    useCallback,
    useEffect,
} from 'react';

import {
    ViewType,
    StatusData,
    ScaleSettings,

    ENDPOINT,
    PATHS,
    LOADING_INTERVAL,
    defaultScaleSettings,
} from '@/data/index';

import {
    currentLevelIcon,
    currentTargetIcon,
} from '@/data/icons';

import {
    i18n,
    Language,
} from '@/data/language';

import {
    mapSettingsValuesToTextual,
} from '@/logic/utilities';

import OpenScaleImage from '@/components/OpenScaleImage';
import WeightDisplay from '@/components/WeightDisplay';
import WeightDisplayInput from '@/components/WeightDisplayInput';
import WeightSelector from '@/components/WeightSelector';
import Button from '@/components/Button';
import HomeButton from '@/components/HomeButton';
import Settings from '@/components/Settings';



export default function Home() {
    const [loading, setLoading] = useState(true);

    const [language, setLanguage] = useState<Language>('en');
    const [theme, setTheme] = useState('dark');

    const [view, setView] = useState<ViewType>('general');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const [activeScale, setActiveScale] = useState(false);
    const [currentWeight, setCurrentWeight] = useState(0);
    const [targetWeight, setTargetWeight] = useState(0);
    const [scaleSettings, setScaleSettings] = useState<ScaleSettings>(defaultScaleSettings);
    const [errors, setErrors] = useState<string[]>([]);


    const start = async () => {
        try {
            setActiveScale(true);

            const response = await fetch(ENDPOINT + PATHS.START, {
                method: 'POST',
            });
            const {
                status,
            } = await response.json();

            if (!status) {
                setActiveScale(false);
                return;
            }
        } catch (error: any) {
            return;
        }
    }

    const stop = async () => {
        try {
            setActiveScale(false);

            const response = await fetch(ENDPOINT + PATHS.STOP, {
                method: 'POST',
            });
            const {
                status,
            } = await response.json();

            if (!status) {
                setActiveScale(true);
                return;
            }
        } catch (error: any) {
            return;
        }
    }

    const tare = async () => {
        try {
            const oldWeight = currentWeight;
            setCurrentWeight(0);

            const response = await fetch(ENDPOINT + PATHS.TARE, {
                method: 'POST',
            });
            const {
                status,
            } = await response.json();

            if (!status) {
                setCurrentWeight(oldWeight);
                return;
            }
        } catch (error: any) {
            return;
        }
    }

    const newTargetWeight = useCallback(async (weight: number) => {
        try {
            const oldWeight = targetWeight;
            setTargetWeight(weight);

            const response = await fetch(ENDPOINT + PATHS.TARGET_WEIGHT, {
                method: 'POST',
                body: JSON.stringify({
                    targetWeight: weight,
                }),
            });
            const {
                status,
            } = await response.json();

            if (!status) {
                setTargetWeight(oldWeight);
                return;
            }
        } catch (error: any) {
            return;
        }
    }, [
        targetWeight,
    ]);

    const clearErrors = () => {
        try {
            setErrors([]);

            fetch(ENDPOINT + PATHS.CLEAR_ERRORS, {
                method: 'POST',
            });
        } catch (error) {
            console.log('Could not clear errors', error);
            return;
        }
    }


    useEffect(() => {
        const load = async () => {
            try {
                const response = await fetch(ENDPOINT + PATHS.STATUS);
                const {
                    status,
                    data,
                } = await response.json();

                if (!status) {
                    return;
                }

                const {
                    active,
                    currentWeight,
                    targetWeight,
                    settings,
                    errors,
                } = data as StatusData;

                setActiveScale(active);
                setCurrentWeight(currentWeight);
                setTargetWeight(targetWeight);
                setScaleSettings(settings);
                setErrors(errors);

                if (loading) {
                    setLoading(false);
                }
            } catch (_e: any) {
                setErrors([
                    'NO_SERVER',
                ]);
                return;
            }
        }

        load();
        const interval = setInterval(() => {
            load();
        }, LOADING_INTERVAL);

        return () => {
            clearInterval(interval);
        }
    }, [
        loading,
    ]);

    useEffect(() => {
        if (theme === 'light') {
            document.body.style.backgroundColor = '#f0fff0';
        } else {
            document.body.style.backgroundColor = '#0a0a0a';
        }
    }, [
        theme,
    ]);


    if (errors.length > 0) {
        return (
            <div
                className="grid place-content-center h-screen gap-6 text-center"
            >
                <h1
                    className="text-2xl"
                >
                    errors
                </h1>

                <div
                    className="grid gap-6"
                >
                    {errors.map((error, index) => {
                        return (
                            <div
                                key={index}
                            >
                                {error}
                            </div>
                        );
                    })}
                </div>

                <Button
                    text="CLEAR"
                    onClick={() => {
                        clearErrors();
                    }}
                />
            </div>
        );
    }

    if (loading) {
        return;
    }

    return (
        <div
            className="grid place-content-center h-full gap-6 text-center"
            style={{
                filter: theme === 'light' ? 'invert(1)' : '',
            }}
        >
            <OpenScaleImage
                setView={() => {
                    if (activeScale) {
                        return;
                    }

                    setView('settings');
                }}
                clickable={!activeScale}
            />

            {(view === 'general' || view === 'current') && (
                <WeightDisplay
                    // icon={(<>current</>)}
                    icon={currentLevelIcon}
                    weight={currentWeight}
                    setView={() => {
                        setView('current');
                    }}
                    clickable={view === 'general' && !activeScale}
                />
            )}

            {view === 'general' && (
                <hr
                    style={{
                        width: '100%',
                        border: '1px solid #eab5b5',
                    }}
                />
            )}

            {(view === 'general' || (view === 'target' && !showCustomInput))
            && (
                <WeightDisplay
                    // icon={(<>target</>)}
                    icon={currentTargetIcon}
                    weight={targetWeight}
                    setView={() => {
                        setView('target');
                    }}
                    clickable={view === 'general' && !activeScale}
                />
            )}

            {view === 'target'
            && showCustomInput
            && (
                <WeightDisplayInput
                    icon={currentTargetIcon}
                    weight={targetWeight}
                    update={(value) => {
                        newTargetWeight(value);
                    }}
                />
            )}

            <div
                className="grid gap-6 mt-8"
            >
                {view === 'general' && (
                    <>
                        <Button
                            text="START"
                            onClick={() => {
                                start();
                            }}
                            disabled={activeScale}
                        />

                        {activeScale && (
                            <Button
                                text="STOP"
                                onClick={() => {
                                    stop();
                                }}
                            />
                        )}
                    </>
                )}

                {view === 'current' && (
                    <Button
                        text={i18n[language].tare.toUpperCase()}
                        onClick={() => {
                            tare();
                        }}
                    />
                )}
            </div>

            {view === 'target' && (
                <WeightSelector
                    newTargetWeight={newTargetWeight}
                    setShowCustomInput={setShowCustomInput}
                />
            )}

            {view === 'settings' && (
                <Settings
                    language={language}
                    setLanguage={setLanguage}
                    theme={theme}
                    setTheme={setTheme}
                    values={scaleSettings}
                />
            )}

            {view !== 'general' && (
                <HomeButton
                    setView={() => {
                        setView('general');
                    }}
                    language={language}
                />
            )}
        </div>
    );
}
