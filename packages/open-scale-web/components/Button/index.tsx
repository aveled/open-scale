interface ButtonProps {
    text: string;
    onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({
    text,
    onClick,
}) => {
    return (
        <button
            onClick={onClick}
            className="text-2xl font-bold p-4 w-[300px] mx-auto my-0 rounded-full select-none bg-[#5a5a5a] text-[#eab5b5]"
        >
            {text}
        </button>
    );
};


export default Button;
