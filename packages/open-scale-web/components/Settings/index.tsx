import Dropdown from '@/components/Dropdown';



export default function Settings({
    language,
    setLanguage,
    theme,
    setTheme,
}: {
    language: string;
    setLanguage: React.Dispatch<React.SetStateAction<string>>;
    theme: string;
    setTheme: React.Dispatch<React.SetStateAction<string>>;
}) {
    return (
        <div
            className="grid gap-6 min-w-[300px] font-bold select-none"
        >
            <Dropdown
                selectables={[
                    'english',
                    'română',
                ]}
                selected={language}
                atSelect={(selected) => {
                    setLanguage(selected);
                }}
                name="language"
            />

            <Dropdown
                selectables={[
                    'light',
                    'dark',
                ]}
                selected={theme}
                atSelect={(selected) => {
                    setTheme(selected);
                }}
                name="theme"
            />
        </div>
    );
}
