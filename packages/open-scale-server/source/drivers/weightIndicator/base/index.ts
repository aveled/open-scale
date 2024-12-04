import ModbusRTU from 'modbus-serial';

import {
    logger,
} from '../../../utilities';



class WeightIndicatorBase {
    protected client: ModbusRTU;

    constructor() {
        this.client = new ModbusRTU();

        this.loadClient().catch(_ => {
            const interval = setInterval(async () => {
                try {
                    logger('info', 'Trying to load weight indicator driver');
                    await this.loadClient();
                    clearInterval(interval);
                } catch (error) {
                    logger('error', 'Could not load weight indicator driver', error);
                }
            }, 3_000);
        });
    }

    private async loadClient() {
        const MODBUS_ID = parseInt(process.env.MODBUS_ID || '') || 1;

        if (process.env.USE_MODBUS_RTU === 'true') {
            const MODBUS_DEVICE = process.env.MODBUS_DEVICE || '/dev/ttyUSB0';
            const MODBUS_BAUD = parseInt(process.env.MODBUS_BAUD || '') || 9600;
            const MODBUS_PARITY = (process.env.MODBUS_PARITY || 'none') as 'none' | 'even' | 'odd';
            const MODBUS_STOP = parseInt(process.env.MODBUS_STOP || '') || 1;
            await this.client.connectRTUBuffered(MODBUS_DEVICE, {
                baudRate: MODBUS_BAUD,
                parity: MODBUS_PARITY,
                stopBits: MODBUS_STOP,
            });
        } else {
            const MODBUS_IP = process.env.MODBUS_IP || '127.0.0.1';
            const MODBUS_PORT = parseInt(process.env.MODBUS_PORT || '') || 8502;
            await this.client.connectTCP(MODBUS_IP, { port: MODBUS_PORT });
        }

        this.client.setID(MODBUS_ID);
    }
}


export default WeightIndicatorBase;
