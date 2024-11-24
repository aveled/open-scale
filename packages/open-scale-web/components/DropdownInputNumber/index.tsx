import {
    useState,
} from 'react';

import Dropdown from '@/components/Dropdown';
import InputNumber from '@/components/InputNumber';



export interface DropdownInputNumberProps {
    name: string,
    selected: string,
    selectables: string[],
    atSelect: (selected: string) => void,

    value: number;
    format: string;
    unit: string;
    max: number;
    availableNumbers: Record<number, number[]>;
    defaultSelectedChar?: number;
}

const DropdownInputNumber: React.FC<DropdownInputNumberProps> = ({
    name,
    selected,
    selectables,
    atSelect,

    value,
    format,
    unit,
    max,
    availableNumbers,
    defaultSelectedChar,
}) => {
    const [showInputNumber, setShowInputNumber] = useState(false);


    return (
        <>
            <Dropdown
                name={name}
                selectables={selectables}
                selected={selected}
                atSelect={atSelect}
                atClick={() => {
                    setShowInputNumber(show => !show);
                }}
            />

            {showInputNumber && (
                <InputNumber
                    value={value}
                    update={(value) => {
                        atSelect(value + ' ' + unit);
                    }}
                    format={format}
                    unit={unit}
                    max={max}
                    availableNumbers={availableNumbers}
                    defaultSelectedChar={defaultSelectedChar}
                />
            )}
        </>
    );
}

export default DropdownInputNumber;
