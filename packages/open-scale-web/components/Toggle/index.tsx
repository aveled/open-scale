import {
    KIOSK_MODE,
} from '@/data/index';

import Tooltip from '@/components/Tooltip';



const Toggle = ({
    text,
    value,
    toggle,
    tooltip,
    style,
}: {
    text: string;
    value: boolean;
    toggle: () => void;
    tooltip?: React.ReactNode;
    style?: React.CSSProperties;
}) => {
    return (
        <div
            className="max-w-[300px] flex gap-6 items-center justify-between my-2 mx-auto"
            style={style}
        >
            <div
                className="flex items-center gap-2 font-bold text-2xl"
            >
                <span>
                    {text}
                </span>

                {tooltip && (
                    <Tooltip
                        content={(
                            <div
                                className="max-w-[250px] p-2"
                            >
                                {tooltip}
                            </div>
                        )}
                    >
                        <span
                            className="text-gray-400 cursor-pointer"
                        >
                            ?
                        </span>
                    </Tooltip>
                )}
            </div>

            <div
                className="flex items-center"
            >
                <label className={`relative inline-flex items-center ${KIOSK_MODE ? 'cursor-none' : 'cursor-pointer'}`}>
                    <input
                        type="checkbox"
                        name={text}
                        checked={value}
                        className="sr-only peer"
                        onChange={() => {
                            toggle();
                        }}
                    />
                    <div className={`
                        w-11 h-6 bg-gray-500
                        peer-focus:outline-none
                        ring-2
                        ring-white
                        peer-focus:ring-2
                        peer-focus:ring-white
                        dark:peer-focus:ring-white
                        peer
                        dark:bg-gray-500
                        peer-checked:after:translate-x-full
                        rtl:peer-checked:after:-translate-x-full
                        peer-checked:after:border-white
                        after:content-[''] after:absolute after:top-[2px] after:start-[2px]
                        after:bg-white after:border-gray-300 after:border
                        after:h-5 after:w-5
                        after:transition-all
                        dark:border-gray-600
                        peer-checked:bg-gray-800
                    `}/>
                </label>
            </div>
        </div>
    );
}


export default Toggle;