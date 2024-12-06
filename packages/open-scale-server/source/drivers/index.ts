import Sensor from './sensor';

import LaumasW100 from './weightIndicator/laumas/w100';
import Tester from './weightIndicator/tester';



export const WeightIndicatorDrivers = {
    'laumas-w100': LaumasW100,
    'tester': Tester,
} as const;


export {
    Sensor,
};
