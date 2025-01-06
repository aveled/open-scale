import {
    KIOSK_MODE,
} from '@/data/index';



export interface ButtonProps {
    text: string;
    onClick: () => void;
    disabled?: boolean;
    small?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    text,
    onClick,
    disabled = false,
    small = false,
}) => {
    return (
        <button
            onClick={onClick}
            onMouseDown={(e) => {
                e.currentTarget.style.backgroundColor = '#4a4a4a';
            }}
            onMouseUp={(e) => {
                e.currentTarget.style.backgroundColor = '#5a5a5a';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#5a5a5a';
            }}
            className={
                `${small ? 'text-lg p-2 w-[200px]' : 'text-2xl p-4 w-[300px]'}
                font-bold mx-auto my-0 rounded-full select-none bg-[#5a5a5a] text-[#eab5b5]
                ${KIOSK_MODE ? 'cursor-none' : ''}
                `
            }
            disabled={disabled}
            style={{
                opacity: disabled ? 0.4 : 1,
            }}
        >
            {text}
        </button>
    );
};


export default Button;
