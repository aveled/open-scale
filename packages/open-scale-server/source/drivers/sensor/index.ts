import gpio from 'rpi-gpio';

import {
    ENVIRONMENT,
} from '../../data';

import {
    logger,
} from '../../utilities';



const SENSOR_GPIO = parseInt(process.env.SENSOR_GPIO || '') || 12;


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
                logger('error', 'Sensor setup error', error, value);
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
            console.log({
                channel, value
            });
            if (channel !== SENSOR_GPIO) {
                return;
            }

            this.toggled = value === 1;
            updater(value === 1);
        });
    }

    public async __testToggle__() {
        this.toggled = !this.toggled;
        return;
    }
}


export default Sensor;
