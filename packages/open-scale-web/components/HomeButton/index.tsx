export default function HomeButton({
    setView,
}: {
    setView: () => void;
}) {
    return (
        <div
            className="mt-8"
        >
            <button
                className="text-lg font-bold p-4 rounded-full select-none text-[#eab5b5]"
                onClick={() => {
                    setView();
                }}
            >
                HOME
            </button>
        </div>
    );
}
