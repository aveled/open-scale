'use client';

import {
    useState,
    useEffect,
} from 'react';

import Image from 'next/image';

import {
    ENDPOINT,
    PATHS,
    defaultTargetWeights,
} from '@/data/index';

import WeightDisplay from '@/components/WeightDisplay';



export default function Home() {
    const [view, setView] = useState<'general' | 'settings' | 'current' | 'target'>('general');

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

    const newTargetWeight = async (weight: number) => {
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
            className="grid place-content-center h-full gap-12 text-center"
        >
            <Image
                src="/open-scale.png"
                alt="open scale"
                width={200}
                height={200}
                style={{
                    margin: '0 auto',
                    pointerEvents: 'none',
                    userSelect: 'none',
                }}
                priority={true}
            />

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

            <hr
                style={{
                    width: '100%',
                    border: '1px solid #eab5b5',
                }}
            />

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

            <div
                className="grid gap-8"
            >
                {view === 'general' && (
                    <>
                        <button
                            className="text-2xl font-bold p-4 rounded-full select-none bg-[#5a5a5a] text-[#eab5b5]"
                            onClick={() => {
                                start();
                            }}
                        >
                            START
                        </button>

                        {activeScale && (
                            <button
                                className="text-2xl font-bold p-4 rounded-full select-none bg-[#5a5a5a] text-[#eab5b5]"
                                onClick={() => {
                                    stop();
                                }}
                            >
                                STOP
                            </button>
                        )}
                    </>
                )}

                {view === 'current' && (
                    <button
                        className="text-2xl font-bold p-4 rounded-full select-none bg-[#5a5a5a] text-[#eab5b5]"
                        onClick={() => {
                            tare();
                        }}
                    >
                        TARE
                    </button>
                )}
            </div>

            {view === 'target' && (
                <div
                    className="grid grid-cols-4 gap-4 justify-center items-center text-xl"
                >
                    {defaultTargetWeights.map((weight, index) => (
                        <button
                            key={index}
                            className="flex items-center justify-center text-2xl font-bold p-4 rounded-full select-none bg-[#5a5a5a] text-[#eab5b5]"
                            onClick={() => {
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
                </div>
            )}
        </div>
    );
}
