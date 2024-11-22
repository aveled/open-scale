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


export const arrowDownIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"
        style={{
            width: '16px', height: '16px',
        }}
    >
        <polygon
            fill="#fff"
            points="981 259.5 783 259.5 500 542.5 217 259.5 19 259.5 500 740.5 981 259.5"
        />
    </svg>
);
