import ModbusRTU from 'npm:modbus-serial';



const client = new ModbusRTU.default();

const MODBUS_ID = parseInt(Deno.env.get('MODBUS_ID') || '') || 1;

const MODBUS_RTU = Deno.env.get('MODBUS_RTU') || '/dev/ttyUSB0';
const MODBUS_BAUD = parseInt(Deno.env.get('MODBUS_BAUD') || '') || 9600;
const MODBUS_PARITY = (Deno.env.get('MODBUS_PARITY') || 'none') as 'none' | 'even' | 'odd';
const MODBUS_STOP = parseInt(Deno.env.get('MODBUS_STOP') || '') || 1;
client.connectRTUBuffered(MODBUS_RTU, {
    baudRate: MODBUS_BAUD,
    parity: MODBUS_PARITY,
    stopBits: MODBUS_STOP,
});

// const MODBUS_IP = Deno.env.get('MODBUS_IP') || '127.0.0.1';
// const MODBUS_PORT = parseInt(Deno.env.get('MODBUS_PORT') || '') || 8502;
// client.connectTCP(MODBUS_IP, { port: MODBUS_PORT });

client.setID(MODBUS_ID);

export default client;
