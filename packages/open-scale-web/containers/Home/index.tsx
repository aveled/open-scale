'use client';

import {
    useState,
    useCallback,
    useEffect,
} from 'react';

import {
    ENDPOINT,
    PATHS,
    LOADING_INTERVAL,

    ViewType,
} from '@/data/index';

import {
    currentLevelIcon,
    currentTargetIcon,
} from '@/data/icons';

import OpenScaleImage from '@/components/OpenScaleImage';
import WeightDisplay from '@/components/WeightDisplay';
import WeightDisplayInput from '@/components/WeightDisplayInput';
import WeightSelector from '@/components/WeightSelector';
import Button from '@/components/Button';
import HomeButton from '@/components/HomeButton';



export default function Home() {
    const [loading, setLoading] = useState(true);

    const [view, setView] = useState<ViewType>('general');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const [activeScale, setActiveScale] = useState(false);
    const [currentWeight, setCurrentWeight] = useState(0);
    const [targetWeight, setTargetWeight] = useState(0);
    const [errors, setErros] = useState([]);


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
                    errors,
                } = data;

                setActiveScale(active);
                setCurrentWeight(currentWeight);
                setTargetWeight(targetWeight);
                setErros(errors);

                if (loading) {
                    setLoading(false);
                }
            } catch (_e: any) {
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


    if (loading) {
        return;
    }

    return (
        <div
            className="grid place-content-center h-full gap-6 text-center"
        >
            <OpenScaleImage
                setView={() => {
                    setView('settings');
                }}
            />

            {(view === 'general' || view === 'current') && (
                <WeightDisplay
                    // icon={(<>current</>)}
                    icon={currentLevelIcon}
                    weight={currentWeight}
                    setView={() => {
                        setView('current');
                    }}
                    clickable={view === 'general'}
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
                    clickable={view === 'general'}
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
                        text="TARE"
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
                <div
                    className="grid gap-6"
                >
                    <div>
                        language
                    </div>

                    <div>
                        theme
                    </div>
                </div>
            )}

            {view !== 'general' && (
                <HomeButton
                    setView={() => {
                        setView('general');
                    }}
                />
            )}
        </div>
    );
}
