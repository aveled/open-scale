import ModbusRTU from 'npm:modbus-serial';



const client = new ModbusRTU.default();
// client.connectRTUBuffered("/dev/ttyUSB0", { baudRate: 9600 }, write);
client.connectTCP('127.0.0.1', { port: 8502 });
client.setID(1);
// client.writeRegisters(5, [0 , 0xffff]);


export default client;
