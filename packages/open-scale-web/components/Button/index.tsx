import React, {
    useState, useRef, useEffect,
} from 'react';
import {
    KIOSK_MODE,
} from '@/data/index';



export interface ButtonProps {
    text: string;
    onClick: () => void;
    disabled?: boolean;
    small?: boolean;
    throttleMs?: number;
}

const Button: React.FC<ButtonProps> = ({
    text,
    onClick,
    disabled = false,
    small = false,
    throttleMs = 700,
}) => {
    const [isThrottled, setIsThrottled] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleThrottledClick = () => {
        if (disabled || isThrottled) {
            return;
        }

        onClick();

        setIsThrottled(true);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setIsThrottled(false);
            timeoutRef.current = null;
        }, throttleMs);
    };

    const isDisabled = disabled || isThrottled;

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isDisabled) {
            e.currentTarget.style.backgroundColor = '#4a4a4a';
        }
    };

    const handleMouseUpOrLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled) {
            e.currentTarget.style.backgroundColor = '#5a5a5a';
        }
    };


    return (
        <button
            onClick={handleThrottledClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={
                `${small ? 'text-lg p-2 w-[200px]' : 'text-2xl p-4 w-[300px]'}
                font-bold mx-auto my-0 rounded-full select-none bg-[#5a5a5a] text-[#eab5b5]
                ${KIOSK_MODE ? 'cursor-none' : ''}
                ${isDisabled ? 'cursor-not-allowed' : ''}
                `
            }
            disabled={isDisabled}
            style={{
                opacity: isDisabled ? 0.4 : 1,
                backgroundColor: isDisabled ? '#5a5a5a' : undefined
            }}
            aria-disabled={isDisabled}
        >
            {text}
        </button>
    );
};

export default Button;
