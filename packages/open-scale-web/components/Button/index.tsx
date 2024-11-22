interface ButtonProps {
    text: string;
    onClick: () => void;
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    text,
    onClick,
    disabled = false,
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
            className="text-2xl font-bold p-4 w-[300px] mx-auto my-0 rounded-full select-none bg-[#5a5a5a] text-[#eab5b5]"
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
