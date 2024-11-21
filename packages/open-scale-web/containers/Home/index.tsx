'use client';

import {
    useState,
    useCallback,
    useEffect,
} from 'react';

import Image from 'next/image';

import {
    ENDPOINT,
    PATHS,
    defaultTargetWeights,
} from '@/data/index';

import WeightDisplay from '@/components/WeightDisplay';
import WeightDisplayInput from '@/components/WeightDisplayInput';
import Button from '@/components/Button';



export default function Home() {
    const [view, setView] = useState<'general' | 'settings' | 'current' | 'target'>('general');
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
                    activeScale,
                    currentWeight,
                    targetWeight,
                    errors,
                } = data;

                setActiveScale(activeScale);
                setCurrentWeight(currentWeight);
                setTargetWeight(targetWeight);
                setErros(errors);
            } catch (_e: any) {
                return;
            }
        }

        load();
    }, []);


    return (
        <div
            className="grid place-content-center h-full gap-6 text-center mt-8"
        >
            <Image
                src="/open-scale.png"
                alt="open scale"
                width={150}
                height={150}
                style={{
                    margin: '0 auto',
                    userSelect: 'none',
                    cursor: 'pointer',
                }}
                priority={true}
                onClick={() => {
                    setView('settings');
                }}
            />

            {(view === 'general' || view === 'current') && (
                <WeightDisplay
                    // icon={(<>current</>)}
                    icon={(<>
                        <Image
                            src="/current-level.svg"
                            alt="current-level"
                            width={70}
                            height={70}
                            style={{
                                margin: '0 auto',
                                pointerEvents: 'none',
                                userSelect: 'none',
                            }}
                            priority={true}
                        />
                    </>)}
                    weight={currentWeight}
                    setView={() => {
                        setView('current');
                    }}
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
                    icon={(<>
                        <Image
                            src="/target.svg"
                            alt="target"
                            width={70}
                            height={70}
                            style={{
                                margin: '0 auto',
                                pointerEvents: 'none',
                                userSelect: 'none',
                            }}
                            priority={true}
                        />
                    </>)}
                    weight={targetWeight}
                    setView={() => {
                        setView('target');
                    }}
                />
            )}

            {view === 'target'
            && showCustomInput
            && (
                <WeightDisplayInput
                    icon={(<>
                        <Image
                            src="/target.svg"
                            alt="target"
                            width={70}
                            height={70}
                            style={{
                                margin: '0 auto',
                                pointerEvents: 'none',
                                userSelect: 'none',
                            }}
                            priority={true}
                        />
                    </>)}
                    weight={targetWeight}
                    update={(value) => {
                        newTargetWeight(value);
                    }}
                />
            )}

            <div
                className="grid gap-6 mt-8"
            >
                {view === 'general' && !activeScale && (
                    <Button
                        text="START"
                        onClick={() => {
                            start();
                        }}
                    />
                )}

                {view === 'general' && activeScale && (
                    <Button
                        text="STOP"
                        onClick={() => {
                            stop();
                        }}
                    />
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
                <>
                    <div
                        className="grid grid-cols-3 lg:grid-cols-4 gap-4 justify-center items-center text-xl"
                    >
                        {defaultTargetWeights.map((weight, index) => (
                            <button
                                key={index}
                                className="flex items-center justify-center text-2xl font-bold p-4 rounded-full select-none bg-[#5a5a5a] text-[#eab5b5]"
                                onClick={() => {
                                    setShowCustomInput(false);
                                    newTargetWeight(weight);
                                }}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    margin: '10px',
                                }}
                            >
                                {(weight / 1000)}

                                <span
                                    className="text-sm ml-2"
                                >
                                    kg
                                </span>
                            </button>
                        ))}

                        <button
                            className="flex items-center justify-center text-2xl font-bold p-4 rounded-full select-none bg-[#5a5a5a] text-[#eab5b5]"
                            onClick={() => {
                                setShowCustomInput(show => !show);
                            }}
                            style={{
                                width: '80px',
                                height: '80px',
                                margin: '10px',
                                fontSize: '2.8rem',
                            }}
                        >
                            &#9998;
                        </button>
                    </div>
                </>
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
                <button
                    className="text-lg font-bold p-4 rounded-full select-none text-[#eab5b5]"
                    onClick={() => {
                        setView('general');
                    }}
                >
                    HOME
                </button>
            )}
        </div>
    );
}
