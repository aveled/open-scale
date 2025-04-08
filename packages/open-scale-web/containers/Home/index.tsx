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
    ScaleErrors,

    PROXY_ENDPOINT,
    SERVER_ENDPOINT,
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
} from '@/data/language';

import OpenScaleImage from '@/components/OpenScaleImage';
import WeightDisplay from '@/components/WeightDisplay';
import WeightDisplayInput from '@/components/WeightDisplayInput';
import WeightSelector from '@/components/WeightSelector';
import Button from '@/components/Button';
import Toggle from '@/components/Toggle';
import HomeButton from '@/components/HomeButton';
import Settings from '@/components/Settings';

import useStore from '@/store/index';

import { logger } from '@/logic/utilities';



export default function Home() {
    const [loading, setLoading] = useState(true);

    const {
        language, setLanguage,
        theme, setTheme,
    } = useStore();

    const [view, setView] = useState<ViewType>('general');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const [activeScale, setActiveScale] = useState(false);
    const [automaticMode, setAutomaticMode] = useState(false);
    const [currentWeight, setCurrentWeight] = useState(0);
    const [targetWeight, setTargetWeight] = useState(0);
    const [scaleSettings, setScaleSettings] = useState<ScaleSettings>(defaultScaleSettings);
    const [errors, setErrors] = useState<ScaleErrors[]>([]);


    const start = async () => {
        try {
            setActiveScale(true);

            const response = await fetch(PROXY_ENDPOINT + PATHS.START, {
                method: 'POST',
            });
            const {
                status,
            } = await response.json();

            if (!status) {
                setActiveScale(false);
                return;
            }
        } catch (error) {
            logger('error', 'Could not start scale', error);
            return;
        }
    }

    const stop = async () => {
        try {
            setActiveScale(false);

            const response = await fetch(PROXY_ENDPOINT + PATHS.STOP, {
                method: 'POST',
            });
            const {
                status,
            } = await response.json();

            if (!status) {
                setActiveScale(true);
                return;
            }
        } catch (error) {
            logger('error', 'Could not stop scale', error);
            return;
        }
    }

    const toggleAutomaticMode = async () => {
        try {
            const oldMode = automaticMode;
            setAutomaticMode(!automaticMode);

            const response = await fetch(PROXY_ENDPOINT + PATHS.TOGGLE_AUTOMATIC_MODE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const {
                status,
            } = await response.json();

            if (!status) {
                setAutomaticMode(oldMode);
                return;
            }
        } catch (error) {
            logger('error', 'Could not toggle automatic mode', error);
            return;
        }
    }

    const tare = async () => {
        try {
            const oldWeight = currentWeight;
            setCurrentWeight(0);

            const response = await fetch(PROXY_ENDPOINT + PATHS.TARE, {
                method: 'POST',
            });
            const {
                status,
            } = await response.json();

            if (!status) {
                setCurrentWeight(oldWeight);
                return;
            }
        } catch (error) {
            logger('error', 'Could not tare scale', error);
            return;
        }
    }

    const newTargetWeight = useCallback(async (weight: number) => {
        try {
            const oldWeight = targetWeight;
            setTargetWeight(weight);

            const response = await fetch(PROXY_ENDPOINT + PATHS.TARGET_WEIGHT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
        } catch (error) {
            logger('error', 'Could not set target weight', error);
            return;
        }
    }, [
        targetWeight,
    ]);

    const clearErrors = () => {
        try {
            setErrors([]);

            fetch(PROXY_ENDPOINT + PATHS.CLEAR_ERRORS, {
                method: 'POST',
            });
        } catch (error) {
            logger('error', 'Could not clear errors', error);
            return;
        }
    }


    /** Load status */
    useEffect(() => {
        const load = async () => {
            const reject = (error?: any) => {
                if (loading) {
                    setLoading(false);
                }
                logger('error', 'Could not load status', error);
                setErrors([
                    'NO_SERVER',
                ]);
            }

            try {
                const response = await fetch(PROXY_ENDPOINT + PATHS.STATUS);
                if (!response || response.status !== 200) {
                    return reject(response);
                }
                const {
                    status,
                    data,
                } = await response.json();

                if (!status) {
                    return reject();
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
            } catch (error) {
                return reject(error);
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

    /** Theme */
    useEffect(() => {
        if (theme === 'light') {
            document.body.style.backgroundColor = '#f0fff0';
        } else {
            document.body.style.backgroundColor = '#0a0a0a';
        }
    }, [
        theme,
    ]);

    /** Socket */
    useEffect(() => {
        const handleSocket = () => {
            try {
                if (!SERVER_ENDPOINT) {
                    logger('error', 'No server endpoint');
                    return;
                }

                const socket = new WebSocket(SERVER_ENDPOINT.replace('http', 'ws'));

                socket.addEventListener('message', (event) => {
                    try {
                        const {
                            active,
                            currentWeight,
                            targetWeight,
                            settings,
                            errors,
                        } = JSON.parse(event.data) as StatusData;

                        setActiveScale(active);
                        setCurrentWeight(currentWeight);
                        setTargetWeight(targetWeight);
                        setScaleSettings(settings);
                        setErrors(errors);
                    } catch (error) {
                        logger('error', 'Could not parse socket message', error);
                        return;
                    }
                });
            } catch (error) {
                logger('error', 'Could not connect to socket', error);
                return;
            }
        }

        handleSocket();
    }, []);


    if (errors.length > 0) {
        return (
            <div
                className={
                    `grid place-content-center h-screen gap-6 text-center`
                }
            >
                <h1
                    className="text-2xl"
                >
                    {i18n[language].error}
                </h1>

                <div
                    className="grid gap-6"
                >
                    {errors.map((error, index) => {
                        return (
                            <div
                                key={index}
                            >
                                {i18n[language].errors[error]}
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
            className={
                `grid place-content-center h-full gap-6 text-center my-8`
            }
            style={{
                filter: theme === 'light' ? 'invert(1)' : '',
            }}
        >
            <OpenScaleImage
                setView={() => {
                    if (activeScale) {
                        return;
                    }

                    if (view === 'general') {
                        setView('settings');
                        return;
                    }

                    setView('general');
                }}
                clickable={!activeScale}
            />

            <div
                className="grid grid-cols-2 gap-6"
            >
                <div>
                    {(view === 'general' || view === 'current') && (
                        <WeightDisplay
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
                </div>

                <div>
                    <div
                        className="grid gap-8 mt-4"
                    >
                        {view === 'general' && (
                            <>
                                <Toggle
                                    text={i18n[language].automaticMode}
                                    value={automaticMode}
                                    toggle={() => {
                                        toggleAutomaticMode();
                                    }}
                                />

                                <Button
                                    text="START"
                                    onClick={() => {
                                        start();
                                    }}
                                    disabled={activeScale}
                                />

                                {activeScale && (
                                    <>
                                        <Button
                                            text="STOP"
                                            onClick={() => {
                                                stop();
                                            }}
                                        />
                                    </>
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
                </div>
            </div>

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
