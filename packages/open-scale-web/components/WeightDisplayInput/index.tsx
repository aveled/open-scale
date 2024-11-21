import React, {
    useState,
} from 'react';

import './style.css';



export const allNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
export const availableNumbers = {
    0: [0, 1, 2, 3, 4, 5],
    1: allNumbers,
    2: allNumbers,
    3: allNumbers,
    4: allNumbers,
    5: allNumbers,
};

interface WeightDisplayInputProps {
    icon: JSX.Element;
    weight: number;
    update: (newWeight: number) => void;
}

const WeightDisplayInput: React.FC<WeightDisplayInputProps> = ({
    icon,
    weight,
}) => {
    const formattedWeight = (weight / 1000).toLocaleString('de-DE', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    }).padStart(6, '0').split('');


    const [selectedChar, setSelectedChar] = useState(0);


    return (
        <div
            className="weight-display flex items-center justify-center"
        >
            <div
                className="flex items-center justify-center text-xl font-bold mr-4 w-[40px] h-[40px] lg:w-[90px] lg:h-[90px]"
            >
                {icon}
            </div>

            {formattedWeight.map((char, i) => (
                <div
                    key={Math.random() + ''}
                    className={`weight-char ${selectedChar === i ? 'weight-char-blink' : ''} ${char === ',' ? '' : 'cursor-pointer'}`}
                    style={{
                        backgroundColor: char === ',' ? '#444' : 'auto',
                        borderLeft: i === 0 ? '2px solid transparent' : 'auto',
                    }}
                    onClick={() => {
                        if (char === ',') {
                            return;
                        }

                        setSelectedChar(i);
                    }}
                >
                    {char}
                </div>
            ))}

            <div
                className="ml-4 text-3xl inline-block font-bold"
            >
                kg
            </div>
        </div>
    );
};

export default WeightDisplayInput;
