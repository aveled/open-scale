import Image from 'next/image';



export const currentLevelIcon = (
    <Image
        src="/current-level.svg"
        alt="current-level"
        width={70}
        height={70}
        style={{
            margin: '0 auto',
            pointerEvents: 'none',
            userSelect: 'none',
        }}
        priority={true}
    />
);


export const currentTargetIcon = (
    <Image
        src="/target.svg"
        alt="target"
        width={70}
        height={70}
        style={{
            margin: '0 auto',
            pointerEvents: 'none',
            userSelect: 'none',
        }}
        priority={true}
    />
);
