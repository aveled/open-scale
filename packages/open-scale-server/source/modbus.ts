import ModbusRTU from 'npm:modbus-serial';



const client = new ModbusRTU.default();

// client.connectRTUBuffered("/dev/ttyUSB0", { baudRate: 9600 }, write);

const MODBUS_IP = Deno.env.get('MODBUS_IP') || '127.0.0.1';
const MODBUS_PORT = parseInt(Deno.env.get('MODBUS_PORT') || '') || 8502;
client.connectTCP(MODBUS_IP, { port: MODBUS_PORT });
client.setID(1);


export default client;
