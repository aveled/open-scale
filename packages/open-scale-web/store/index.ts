import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Required for zustand.
import type { } from '@redux-devtools/extension';

import {
    Language,
} from '@/data/language';



export interface State {
    language: Language;
    setLanguage: (language: Language) => void;
    theme: string;
    setTheme: (theme: string) => void;
}


const useStore = create<State>()(
    devtools(
    persist(
    immer(
        (set) => ({
            language: 'en',
            setLanguage: (language: Language) => set({ language }),
            theme: 'dark',
            setTheme: (theme: string) => set({ theme }),
        }),
    ),
        {
            name: 'OPEN_SCALE',
        },
    ),
    ),
);


export default useStore;
