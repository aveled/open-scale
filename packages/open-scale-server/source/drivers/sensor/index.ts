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
    private updater: (value: boolean) => void = () => {};

    constructor(
        updater?: (value: boolean) => void,
    ) {
        this.updater = updater || (() => {});
        this.setup();
    }

    private setup() {
        if (ENVIRONMENT !== 'production') {
            return;
        }

        gpio.setMode(gpio.MODE_BCM);

        gpio.setup(SENSOR_GPIO, gpio.DIR_IN, gpio.EDGE_BOTH, (error, value) => {
            if (error || value === undefined) {
                logger('error', 'Sensor setup error', error, value);
                return;
            }

            this.toggled = value;
        });

        gpio.on('change', (channel, value) =>  {
            if (channel !== SENSOR_GPIO) {
                return;
            }

            this.toggled = value === 1;
            this.updater(value === 1);
        });
    }

    public readState() {
        return this.toggled;
    }

    public onUpdate(
        updater: (value: boolean) => void,
    ) {
        this.updater = updater;
    }

    public async __testToggle__() {
        this.toggled = !this.toggled;
        return;
    }
}


export default Sensor;
