import ModbusRTU from 'npm:modbus-serial';



const registers: Record<number, number> = Array.from({ length: 100 }, (_, i) => i)
    .reduce((acc, cur) => ({ ...acc, [cur]: 0 }), {});

function printRegisters(registers: Record<number, number>, columns = 10): void {
    const keys = Object.keys(registers).map(Number).sort((a, b) => a - b);
    const rows = Math.ceil(keys.length / columns);

    for (let row = 0; row < rows; row++) {
        let line = "";
        for (let col = 0; col < columns; col++) {
            const index = row * columns + col;
            const key = keys[index];
            if (key !== undefined) {
                const value = registers[key];
                // Format: Rxx: [value], right-padded to 6 characters
                const formatted = `R${key.toString().padStart(2, '0')}: ${value.toString().padStart(6, ' ')}`;
                line += formatted + '  ';
            }
        }
        console.log(line.trimEnd());
    }
}

const vector = {
    getInputRegister: function(addr: any, unitID: any) {
        // Synchronous handling
        return addr;
    },
    getHoldingRegister: function(addr: any, unitID: any, callback: any) {
        // Asynchronous handling (with callback)
        setTimeout(function() {
            // callback = function(err, value)
            callback(null, registers[addr]);
        }, 10);
    },
    getCoil: function(addr: any, unitID: any) {
        // Asynchronous handling (with Promises, async/await supported)
        return new Promise(function(resolve) {
            setTimeout(function() {
                resolve((addr % 2) === 0);
            }, 10);
        });
    },
    setRegister: function(addr: any, value: any, unitID: any) {
        // Asynchronous handling supported also here
        console.log("set register", addr, value, unitID);
        registers[addr] = value;
        console.log("current registers");
        printRegisters(registers);
        return;
    },
    setCoil: function(addr: any, value: any, unitID: any) {
        // Asynchronous handling supported also here
        console.log("set coil", addr, value, unitID);
        return;
    },
    readDeviceIdentification: function(addr: any) {
        return {
            0x00: "MyVendorName",
            0x01: "MyProductCode",
            0x02: "MyMajorMinorRevision",
            0x05: "MyModelName",
            0x97: "MyExtendedObject1",
            0xAB: "MyExtendedObject2"
        };
    }
};

// set the server to answer for modbus requests
console.log("ModbusTCP listening on modbus://0.0.0.0:8502");
const serverTCP = new ModbusRTU.ServerTCP(vector, { host: "0.0.0.0", port: 8502, debug: true, unitID: 1 });

serverTCP.on("socketError", function(err){
    // Handle socket error if needed, can be ignored
    console.error(err);
});
