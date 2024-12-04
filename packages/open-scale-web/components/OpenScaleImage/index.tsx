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
            width={150}
            height={150}
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
