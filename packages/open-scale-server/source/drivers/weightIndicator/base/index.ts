import ModbusRTU from 'modbus-serial';

import {
    logger,
} from '../../../utilities';



class WeightIndicatorBase {
    protected client: ModbusRTU;
    private reconnectInterval: NodeJS.Timeout | null = null;
    private connectionMonitorInterval: NodeJS.Timeout | null = null;
    private isConnecting: boolean = false;
    private reconnectCallback: (() => void) | null = null;
    private connectionParams: {
        isRTU: boolean;
        device?: string;
        baudRate?: number;
        parity?: 'none' | 'even' | 'odd';
        stopBits?: number;
        ip?: string;
        port?: number;
        id: number;
    } | null = null;

    constructor() {
        this.client = new ModbusRTU();

        this.loadClient().catch(_ => {
            this.startReconnection();
        });

        // Start connection monitoring
        this.startConnectionMonitor();
    }

    private async loadClient() {
        if (this.isConnecting) {
            return;
        }

        this.isConnecting = true;

        try {
            // If we have stored connection parameters, use them instead of re-parsing env vars
            if (this.connectionParams) {
                if (this.connectionParams.isRTU) {
                    await this.client.connectRTUBuffered(this.connectionParams.device!, {
                        baudRate: this.connectionParams.baudRate!,
                        parity: this.connectionParams.parity!,
                        stopBits: this.connectionParams.stopBits!,
                    });
                } else {
                    await this.client.connectTCP(this.connectionParams.ip!, {
                        port: this.connectionParams.port!
                    });
                }
                this.client.setID(this.connectionParams.id);
            } else {
                // First-time connection, parse environment variables
                const MODBUS_ID = parseInt(process.env.MODBUS_ID || '') || 1;

                if (process.env.USE_MODBUS_RTU === 'true') {
                    const MODBUS_DEVICE = process.env.MODBUS_DEVICE || '/dev/ttyUSB0';
                    const MODBUS_BAUD = parseInt(process.env.MODBUS_BAUD || '') || 9600;
                    const MODBUS_PARITY = (process.env.MODBUS_PARITY || 'none') as 'none' | 'even' | 'odd';
                    const MODBUS_STOP = parseInt(process.env.MODBUS_STOP || '') || 1;

                    // Store connection parameters for reconnection
                    this.connectionParams = {
                        isRTU: true,
                        device: MODBUS_DEVICE,
                        baudRate: MODBUS_BAUD,
                        parity: MODBUS_PARITY,
                        stopBits: MODBUS_STOP,
                        id: MODBUS_ID
                    };

                    await this.client.connectRTUBuffered(MODBUS_DEVICE, {
                        baudRate: MODBUS_BAUD,
                        parity: MODBUS_PARITY,
                        stopBits: MODBUS_STOP,
                    });
                } else {
                    const MODBUS_IP = process.env.MODBUS_IP || '127.0.0.1';
                    const MODBUS_PORT = parseInt(process.env.MODBUS_PORT || '') || 8502;

                    // Store connection parameters for reconnection
                    this.connectionParams = {
                        isRTU: false,
                        ip: MODBUS_IP,
                        port: MODBUS_PORT,
                        id: MODBUS_ID
                    };

                    await this.client.connectTCP(MODBUS_IP, { port: MODBUS_PORT });
                }

                this.client.setID(MODBUS_ID);
            }

            // Log successful connection
            logger('info', 'Successfully connected to Modbus device');

            // Clear reconnection interval if it exists
            this.stopReconnection();

            this.isConnecting = false;
        } catch (error) {
            this.isConnecting = false;
            throw error;
        }
    }

    /**
     * Check if the Modbus connection is still active
     */
    protected async isConnected(): Promise<boolean> {
        try {
            // Attempt a simple read to test connection
            // Note: This assumes there's at least one valid register to read at address 0
            // You may need to adjust this based on your specific device
            await this.client.readHoldingRegisters(0, 1);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Register a callback function to be called on successful reconnection
     */
    public onReconnect(callback: () => void): void {
        this.reconnectCallback = callback;
    }

    /**
     * Start the reconnection process
     */
    private startReconnection() {
        if (!this.reconnectInterval) {
            logger('info', 'Starting Modbus reconnection attempts');
            this.reconnectInterval = setInterval(async () => {
                try {
                    logger('info', 'Attempting to reconnect to Modbus device');
                    await this.loadClient();
                    logger('info', 'Reconnected to Modbus device');

                    if (this.reconnectCallback) {
                        this.reconnectCallback();
                    }
                } catch (error) {
                    logger('error', 'Failed to reconnect to Modbus device', error);
                }
            }, 3000);
        }
    }

    /**
     * Stop the reconnection process
     */
    private stopReconnection() {
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
        }
    }

    /**
     * Start monitoring the connection status
     */
    private startConnectionMonitor() {
        // Check connection status every 5 seconds
        this.connectionMonitorInterval = setInterval(async () => {
            if (!await this.isConnected() && !this.reconnectInterval) {
                logger('warn', 'Modbus connection lost, attempting to reconnect');
                // If we have a client, close it to clean up resources
                try {
                    this.client.close(() => {});
                } catch (error) {
                    // Ignore errors on close
                }
                // Create a new client instance
                this.client = new ModbusRTU();
                // Start reconnection process
                this.startReconnection();
            }
        }, 5000);
    }

    /**
     * Clean up resources when the class is destroyed
     */
    protected cleanup() {
        this.stopReconnection();

        if (this.connectionMonitorInterval) {
            clearInterval(this.connectionMonitorInterval);
            this.connectionMonitorInterval = null;
        }

        try {
            this.client.close(() => {});
        } catch (error) {
            // Ignore errors on close
        }
    }
}


export default WeightIndicatorBase;
