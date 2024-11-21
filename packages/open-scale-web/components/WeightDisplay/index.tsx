import React from 'react';
import './style.css';



interface WeightDisplayProps {
    icon: JSX.Element;
    weight: number;
    setView: () => void;
}

const WeightDisplay: React.FC<WeightDisplayProps> = ({
    icon,
    weight,
    setView,
}) => {
    const formattedWeight = (weight / 1000).toLocaleString('de-DE', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    }).padStart(6, '0').split('');

    return (
        <div
            className="weight-display flex items-center justify-center cursor-pointer"
            onClick={() => {
                setView();
            }}
        >
            <div
                className="flex items-center justify-center text-xl font-bold mr-4 w-[40px] h-[40px] lg:w-[90px] lg:h-[90px]"
            >
                {icon}
            </div>

            {formattedWeight.map(char => (
                <span
                    key={Math.random() + ''}
                    className="weight-char"
                    style={{
                        backgroundColor: char === ',' ? '#444' : 'auto',
                    }}
                >
                    {char}
                </span>
            ))}

            <span
                className="ml-4 text-3xl inline-block font-bold"
            >
                kg
            </span>
        </div>
    );
};

export default WeightDisplay;
