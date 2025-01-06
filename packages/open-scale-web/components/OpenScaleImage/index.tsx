import {
    KIOSK_MODE,
} from '@/data/index';

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
            width={100}
            height={100}
            style={{
                margin: '0 auto',
                marginBottom: '2rem',
                userSelect: 'none',
                cursor: KIOSK_MODE
                    ? ''
                    : clickable === false ? '' : 'pointer',
            }}
            priority={true}
            draggable={false}
            onClick={() => {
                setView();
            }}
        />
    );
}
