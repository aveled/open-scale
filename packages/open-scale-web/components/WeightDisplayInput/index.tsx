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
    icon: React.JSX.Element;
    weight: number;
    update: (newWeight: number) => void;
}

const WeightDisplayInput: React.FC<WeightDisplayInputProps> = ({
    icon,
    weight,
    update,
}) => {
    const formattedWeight = (weight / 1000).toLocaleString('de-DE', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    }).padStart(6, '0').split('');


    const [selectedChar, setSelectedChar] = useState(0);


    const handleArrowClick = (i: number, direction: 'up' | 'down') => {
        if (selectedChar !== i) {
            return;
        }

        const numbers = (availableNumbers as any)[i];
        if (!numbers) {
            return;
        }

        const currentValue = parseInt(formattedWeight[i], 10);
        const currentIndex = numbers.indexOf(currentValue);
        const nextIndex = direction === 'up'
            ? (currentIndex + 1) % numbers.length
            : (currentIndex - 1 + numbers.length) % numbers.length;
        const nextValue = numbers[nextIndex];
        const newWeightString = formattedWeight.map((c, j) => {
            if (j === i) {
                return nextValue;
            }
            return c;
        }).join('');
        const newWeight = parseFloat(newWeightString.replace(',', '.')) * 1000;
        update(newWeight);
    };


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
                    key={'char' + i}
                    className="relative"
                >
                    {selectedChar === i && (
                        <div
                            className={`absolute -top-9 left-0 w-full cursor-pointer`}
                            onClick={() => handleArrowClick(i, 'up')}
                            style={{
                                fontSize: '1.5rem',
                            }}
                        >
                            {/* Up Arrow */}
                            &#11014;
                        </div>
                    )}

                    <div
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

                    {selectedChar === i && (
                        <div
                            className={`absolute -bottom-9 left-0 w-full cursor-pointer`}
                            onClick={() => handleArrowClick(i, 'down')}
                            style={{
                                fontSize: '1.5rem',
                            }}
                        >
                            {/* Down Arrow */}
                            &#11015;
                        </div>
                    )}
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
