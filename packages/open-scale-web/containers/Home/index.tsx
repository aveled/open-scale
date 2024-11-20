'use client';

import {
    useState,
    useEffect,
} from 'react';

import {
    ENDPOINT,
    PATHS,
} from '@/data/index';

import WeightDisplay from '@/components/WeightDisplay';



export default function Home() {
    const [activeScale, setActiveScale] = useState(false);
    const [currentWeight, setCurrentWeight] = useState(0);
    const [targetWeight, setTargetWeight] = useState(0);
    const [errors, setErros] = useState([]);


    useEffect(() => {
        const load = async () => {
            try {
                const response = await fetch(ENDPOINT + PATHS.STATUS);
                const {
                    status,
                    data,
                } = await response.json();
                console.log(data);

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
            className="grid place-content-center h-full gap-8 text-center"
        >
            <div>
                current weight

                <WeightDisplay
                    weight={currentWeight}
                />
            </div>

            <div>
                target weight

                <WeightDisplay
                    weight={targetWeight}
                />
            </div>
        </div>
    );
}
