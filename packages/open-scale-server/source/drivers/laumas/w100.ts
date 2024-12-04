import ModbusRTU from 'modbus-serial';

import {
    WeightIndicatorDriver,

    REGISTERS,
} from '../../data';



class W100 implements WeightIndicatorDriver {
    private client: ModbusRTU;

    constructor() {
        const client = new ModbusRTU();
        const MODBUS_ID = parseInt(process.env.MODBUS_ID || '') || 1;

        if (process.env.MODBUS_RTU === 'true') {
            const MODBUS_RTU = process.env.MODBUS_RTU || '/dev/ttyUSB0';
            const MODBUS_BAUD = parseInt(process.env.MODBUS_BAUD || '') || 9600;
            const MODBUS_PARITY = (process.env.MODBUS_PARITY || 'none') as 'none' | 'even' | 'odd';
            const MODBUS_STOP = parseInt(process.env.MODBUS_STOP || '') || 1;
            client.connectRTUBuffered(MODBUS_RTU, {
                baudRate: MODBUS_BAUD,
                parity: MODBUS_PARITY,
                stopBits: MODBUS_STOP,
            });
        } else {
            const MODBUS_IP = process.env.MODBUS_IP || '127.0.0.1';
            const MODBUS_PORT = parseInt(process.env.MODBUS_PORT || '') || 8502;
            client.connectTCP(MODBUS_IP, { port: MODBUS_PORT });
        }

        client.setID(MODBUS_ID);

        this.client = client;
    }


    public async getWeight(): Promise<number> {
        const weightRegister = await this.client.readHoldingRegisters(REGISTERS.WEIGHT, 2);
        const newWeight = (weightRegister.data[0] << 16) | weightRegister.data[1] * 10; // Convert to grams

        return newWeight;
    }

    public async tare(): Promise<boolean> {
        await this.client.writeRegisters(REGISTERS.TARE_LOW, [0]);
        await this.client.writeRegisters(REGISTERS.TARE_HIGH, [0]);
        await this.client.writeRegisters(REGISTERS.COMMAND, [130]);

        return true;
    }
}


export default W100;
