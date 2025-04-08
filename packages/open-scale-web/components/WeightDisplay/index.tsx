import React from 'react';
import './style.css';



export interface WeightDisplayProps {
    icon: React.JSX.Element;
    weight: number;
    setView: () => void;
    clickable?: boolean;
}

const WeightDisplay: React.FC<WeightDisplayProps> = ({
    icon,
    weight,
    setView,
    clickable = true,
}) => {
    const formattedWeight = (weight / 1000).toLocaleString('de-DE', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    }).padStart(6, '0').split('');

    return (
        <div
            className={`weight-display flex items-center justify-center ${clickable ? 'cursor-pointer' : ''}`}
            onClick={() => {
                if (!clickable) {
                    return;
                }

                setView();
            }}
        >
            <div
                className="flex items-center justify-center text-xl font-bold mr-4 w-[40px] h-[40px] lg:w-[90px] lg:h-[90px]"
            >
                {icon}
            </div>

            {formattedWeight.map((char, i) => (
                <div
                    key={Math.random() + ''}
                    className="weight-char"
                    style={{
                        backgroundColor: char === ',' ? '#444' : 'auto',
                        borderLeft: i === 0 ? '2px solid transparent' : 'auto',
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

export default WeightDisplay;
