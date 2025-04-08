import {
    ReactNode,
} from 'react';

import {
    Tooltip,
} from 'flowbite-react';



const theme = {
    "target": "w-fit",
    "animation": "transition-opacity",
    "arrow": {
        "base": "absolute z-10 h-2 w-2 rotate-45",
        "style": {
            "dark": "bg-gray-800 dark:bg-gray-700",
            "light": "bg-gray-800",
            "auto": "bg-gray-800 dark:bg-gray-700"
        },
        "placement": "-4px"
    },
    "base": "max-w-[350px] absolute inline-block z-10 py-2 px-3 text-sm font-medium shadow-sm",
    "hidden": "invisible opacity-0",
    "style": {
        "dark": "bg-gray-800 text-white dark:bg-gray-700",
        "light": "border border-gray-200 bg-gray-800 text-white",
        "auto": "border border-gray-200 bg-gray-800 text-white dark:border-none dark:bg-gray-700 dark:text-white"
    },
    "content": "relative z-20"
}


export default function CustomTooltip({
    content,
    children,
}: {
    content: ReactNode;
    children: ReactNode;
}) {
    return (
        <Tooltip
            content={content}
            theme={theme}
            style="dark"
            placement="bottom"
            trigger="hover"
            className="hidden md:flex"
        >
            {children}
        </Tooltip>
    );
}
