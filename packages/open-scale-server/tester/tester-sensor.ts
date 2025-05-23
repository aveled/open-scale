import gpio from 'rpi-gpio';



const SENSOR_GPIO = 12;

class Sensor {
    private toggled = false;

    constructor() {
        this.setup();
    }

    private setup() {
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
        gpio.on('change', (channel, value) =>  {
            if (channel !== SENSOR_GPIO) {
                return;
            }

            this.toggled = value === 1;
            updater(value === 1);
        });
    }
}


const sensor = new Sensor();
sensor.onUpdate((value) => {
    console.log(value);
});
