import {
    Language,
    i18n,
} from '@/data/language';



export default function HomeButton({
    setView,
    language,
}: {
    setView: () => void;
    language: Language,
}) {
    return (
        <div
            className="my-8"
        >
            <button
                className="text-lg font-bold p-4 rounded-full select-none text-[#eab5b5]"
                onClick={() => {
                    setView();
                }}
            >
                {i18n[language].home.toUpperCase()}
            </button>
        </div>
    );
}
