import Image from 'next/image';



export default function OpenScaleImage({
    setView,
    clickable,
}: {
    setView: () => void;
    clickable: boolean;
}) {
    return (
        <Image
            src="/open-scale.png"
            alt="open scale"
            width={75}
            height={75}
            style={{
                margin: '0 auto',
                userSelect: 'none',
                cursor: clickable === false ? '' : 'pointer',
            }}
            priority={true}
            draggable={false}
            onClick={() => {
                setView();
            }}
        />
    );
}
