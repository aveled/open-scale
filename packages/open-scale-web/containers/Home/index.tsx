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
                    />
                </>)}
                weight={currentWeight}
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
                    />
                </>)}
                weight={targetWeight}
            />

            <div
                className="grid gap-8"
            >
                <button
                    onClick={() => {
                        start();
                    }}
                >
                    start
                </button>

                {activeScale && (
                    <button
                        onClick={() => {
                            stop();
                        }}
                    >
                        stop
                    </button>
                )}

                <button
                    onClick={() => {
                        tare();
                    }}
                >
                    tare
                </button>
            </div>

            <div
                className="flex gap-4 justify-center items-center text-xl"
            >
                {defaultTargetWeights.map((weight, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            newTargetWeight(weight);
                        }}
                    >
                        {(weight / 1000)}
                    </button>
                ))}
            </div>
        </div>
    );
}
