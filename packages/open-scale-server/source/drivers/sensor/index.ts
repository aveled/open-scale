import gpio from 'rpi-gpio';

import {
    ENVIRONMENT,
} from '../../data';



const SENSOR_GPIO = parseInt(process.env.SENSOR_GPIO || '') || 7;


class Sensor {
    private toggled = false;

    constructor() {
        this.setup();
    }

    private setup() {
        if (ENVIRONMENT !== 'production') {
            return;
        }

        gpio.setup(SENSOR_GPIO, gpio.DIR_IN, gpio.EDGE_BOTH, (error, value) => {
            if (error || value === undefined) {
                return;
            }

            this.toggled = value;
        });
    }

    public readState() {
        return this.toggled;
    }

    public onUpdate(
        updater: (value: boolean) => void,
    ) {
        if (ENVIRONMENT !== 'production') {
            return;
        }

        gpio.on('change', (channel, value) =>  {
            if (channel !== SENSOR_GPIO) {
                return;
            }

            updater(value === 1);
        });
    }
}


export default Sensor;
