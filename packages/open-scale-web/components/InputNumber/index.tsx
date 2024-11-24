import React, {
    useState,
} from 'react';

import './style.css';



export const allNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export interface InputNumberProps {
    value: number;
    /**
     * Format of the number, e.g. 'XX', 'X,X', 'XX,XXX'
     * where 'X' is a digit and ',' is a separator.
     */
    format: string;
    update: (newValue: number) => void;
    unit?: string;
    max?: number;
    availableNumbers?: Record<number, number[]>;
    defaultSelectedChar?: number;
}

const InputNumber: React.FC<InputNumberProps> = ({
    value,
    format,
    update,
    unit,
    max,
    availableNumbers,
    defaultSelectedChar,
}) => {
    const fractionDigits = format.includes(',') ? format.slice(format.indexOf(',') + 1).length : 0;
    const formattedValue = (value).toLocaleString('de-DE', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).padStart(format.length, '0').split('');


    const [selectedChar, setSelectedChar] = useState(defaultSelectedChar || 0);


    const handleArrowClick = (i: number, direction: 'up' | 'down') => {
        if (selectedChar !== i) {
            return;
        }

        let numbers = (availableNumbers as any)[i];
        if (!numbers) {
            numbers = allNumbers;
        }

        const currentValue = parseInt(formattedValue[i], 10);
        const currentIndex = numbers.indexOf(currentValue);
        const nextIndex = direction === 'up'
            ? (currentIndex + 1) % numbers.length
            : (currentIndex - 1 + numbers.length) % numbers.length;
        const nextValue = numbers[nextIndex];
        const newValueString = formattedValue.map((c, j) => {
            if (j === i) {
                return nextValue;
            }
            return c;
        }).join('');
        const newValue = parseFloat(newValueString.replace(',', '.'));

        if (max && newValue > max) {
            update(max);
            return;
        }

        update(newValue);
    };


    return (
        <div
            className="input-number flex items-center justify-center"
        >
            {formattedValue.map((char, i) => (
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
                        className={`input-number-char ${selectedChar === i ? 'input-number-char-blink' : ''} ${char === ',' ? '' : 'cursor-pointer'}`}
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

            {unit && (
                <div
                    className="ml-4 text-3xl inline-block font-bold"
                >
                    {unit}
                </div>
            )}
        </div>
    );
};

export default InputNumber;
