import Image from 'next/image';



export default function OpenScaleImage({
    setView,
}: {
    setView: () => void;
}) {
    return (
        <div
            className="my-8"
        >
            <Image
                src="/open-scale.png"
                alt="open scale"
                width={150}
                height={150}
                style={{
                    margin: '0 auto',
                    userSelect: 'none',
                    cursor: 'pointer',
                }}
                priority={true}
                draggable={false}
                onClick={() => {
                    setView();
                }}
            />
        </div>
    );
}
