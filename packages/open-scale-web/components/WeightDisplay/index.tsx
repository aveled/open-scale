import React from 'react';
import './style.css';



interface WeightDisplayProps {
    weight: number;
}

const WeightDisplay: React.FC<WeightDisplayProps> = ({ weight }) => {
    const formattedWeight = (weight / 1000).toLocaleString('de-DE', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    });

    return (
        <div className="weight-display">
            {formattedWeight} kg
        </div>
    );
};

export default WeightDisplay;
