import {
    defaultTargetWeights,
} from '@/data/index';



export default function WeightSelector({
    newTargetWeight,
    setShowCustomInput,
}: {
    newTargetWeight: (weight: number) => void;
    setShowCustomInput: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    return (
        <>
            <div
                className="grid grid-cols-3 lg:grid-cols-4 gap-4 justify-center items-center text-xl"
            >
                {defaultTargetWeights.map((weight, index) => (
                    <button
                        key={index}
                        onMouseDown={(e) => {
                            e.currentTarget.style.backgroundColor = '#4a4a4a';
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.backgroundColor = '#5a5a5a';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#5a5a5a';
                        }}
                        className="flex items-center justify-center text-2xl font-bold p-4 rounded-full select-none bg-[#5a5a5a] text-[#eab5b5]"
                        onClick={() => {
                            setShowCustomInput(false);
                            newTargetWeight(weight);
                        }}
                        style={{
                            width: '80px',
                            height: '80px',
                            margin: '10px',
                        }}
                    >
                        {(weight / 1000)}

                        <span
                            className="text-sm ml-2"
                        >
                            kg
                        </span>
                    </button>
                ))}

                <button
                    className="flex items-center justify-center text-2xl font-bold p-4 rounded-full select-none bg-[#5a5a5a] text-[#eab5b5]"
                    onMouseDown={(e) => {
                        e.currentTarget.style.backgroundColor = '#4a4a4a';
                    }}
                    onMouseUp={(e) => {
                        e.currentTarget.style.backgroundColor = '#5a5a5a';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#5a5a5a';
                    }}
                    onClick={() => {
                        setShowCustomInput(show => !show);
                    }}
                    style={{
                        width: '80px',
                        height: '80px',
                        margin: '10px',
                        fontSize: '2.8rem',
                    }}
                >
                    &#9998;
                </button>
            </div>
        </>
    );
}
