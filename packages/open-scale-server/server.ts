// deno-lint-ignore-file require-await no-explicit-any no-unused-vars ban-unused-ignore

import ModbusRTU from 'npm:modbus-serial';



const port = 8485;

const WEIGHT_REGISTER = 5;
const START_FEED_REGISTER = 6;
const STOP_FEED_REGISTER = 7;
const SPEED_FEED_REGISTER = 8;
const FAST_SPEED_FEED = 50;
const SLOW_SPEED_FEED = 20;
const FAST_SLOW_PERCENTAGE = 0.95;
const DEFAULT_TARGET_WEIGHT = 25_000;
const NO_WEIGHT_ERROR = 'NO_WEIGHT';



class ScaleManager {
    private client: ModbusRTU.default;
    private currentWeight: number = 0;
    private targetWeight: number = DEFAULT_TARGET_WEIGHT;
    private activeScale: boolean = false;
    private feedStarted: boolean = false;
    private feedStopped: boolean = false;
    private feedSet: boolean = false;
    private errors: string[] = [];


    constructor(
        client: ModbusRTU.default,
    ) {
        this.client = client;

        this.weightLoop();
        this.feedLoop();
    }

    public getCurrentWeight() {
        return this.currentWeight;
    }

    public getTargetWeight() {
        return this.targetWeight;
    }

    public setTargetWeight(targetWeight: number) {
        this.targetWeight = targetWeight;
    }

    public checkWeight() {
        return this.currentWeight <= this.targetWeight;
    }

    public setActive(active: boolean) {
        this.activeScale = active;
    }

    public isActive() {
        return this.activeScale;
    }

    public getErrors() {
        return this.errors;
    }

    public clearErrors() {
        this.errors = [];
    }

    public stop() {
        this.activeScale = false;
    }

    public tare() {
        this.currentWeight = 0;
        // this.client.writeRegisters(0, [1]);
    }


    private weightLoop() {
        setInterval(async () => {
            try {
                const weightRegister = await this.client.readHoldingRegisters(WEIGHT_REGISTER, 1);
                this.currentWeight = weightRegister.data[0];
            } catch (e) {
                if (!this.errors.includes(NO_WEIGHT_ERROR)) {
                    this.errors.push(NO_WEIGHT_ERROR);
                }
            }
        }, 50);
    }

    private feedLoop() {
        setInterval(async () => {
            if (!this.activeScale) {
                if (this.feedStarted) {
                    this.feedStarted = false;
                    await this.client.writeRegisters(STOP_FEED_REGISTER, [1]);
                }
                return;
            }

            if (this.checkWeight()) {
                this.feedStopped = false;

                if (this.targetWeight * FAST_SLOW_PERCENTAGE < this.currentWeight) {
                    if (!this.feedSet) {
                        this.feedSet = true;
                        await this.client.writeRegisters(SPEED_FEED_REGISTER, [FAST_SPEED_FEED]);
                    }
                } else {
                    if (!this.feedSet) {
                        this.feedSet = true;
                        await this.client.writeRegisters(SPEED_FEED_REGISTER, [SLOW_SPEED_FEED]);
                    }
                }

                if (!this.feedStarted) {
                    this.feedStarted = true;
                    this.feedSet = false;

                    await this.client.writeRegisters(START_FEED_REGISTER, [1]);
                }
            } else {
                this.feedStarted = false;
                this.feedSet = false;

                if (!this.feedStopped) {
                    this.feedStopped = true;
                    await this.client.writeRegisters(STOP_FEED_REGISTER, [1]);

                    this.activeScale = false;

                    this.recordScaleEvent();
                }
            }
        }, 50);
    }

    private recordScaleEvent() {
        const data = [
            Date.now(),
            this.targetWeight,
            this.currentWeight,
        ];

        console.log('Record scale event', data);
    }
}



const client = new ModbusRTU.default();
// client.connectRTUBuffered("/dev/ttyUSB0", { baudRate: 9600 }, write);
client.connectTCP('127.0.0.1', { port: 8502 });
client.setID(1);
// client.writeRegisters(5, [0 , 0xffff]);


const scaleManager = new ScaleManager(client);


const handlerResponse = <D = any>(
    response: {
        status: boolean;
        data?: D;
    },
    status: number = 200,
) => {
    const body = JSON.stringify(response);

    return new Response(body, {
        status,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            ...corsHeaders,
        },
    });
}

// curl -X GET http://localhost:8485/status
const handlerStatus = async (_req: Request) => {
    const data = {
        active: scaleManager.isActive(),
        currentWeight: scaleManager.getCurrentWeight(),
        targetWeight: scaleManager.getTargetWeight(),
        errors: scaleManager.getErrors(),
    };

    return handlerResponse({
        status: true,
        data,
    });
}

// curl -X POST http://localhost:8485/start
const handlerStart = async (_req: Request) => {
    scaleManager.setActive(true);

    return handlerResponse({
        status: true,
    });
}

// curl -X POST http://localhost:8485/stop
const handlerStop = async (_req: Request) => {
    scaleManager.stop();

    return handlerResponse({
        status: true,
    });
}

// curl -X POST -H "Content-Type: application/json" -d '{"targetWeight": 15000}' http://localhost:8485/target-weight
const handlerTargetWeight = async (req: Request) => {
    const {
        targetWeight,
    } = await req.json();

    scaleManager.setTargetWeight(targetWeight);

    return handlerResponse({
        status: true,
    });
}

// curl -X POST http://localhost:8485/tare
const handlerTare = async (_req: Request) => {
    scaleManager.tare();

    return handlerResponse({
        status: true,
    });
}

// curl -X POST http://localhost:8485/clear-errors
const handlerClearErrors = async (_req: Request) => {
    scaleManager.clearErrors();

    return handlerResponse({
        status: true,
    });
}

const handlerNotFound = () => {
    return handlerResponse(
        { status: false },
        404,
    );
}


// disable cors for Deno server
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

const handlerOptions = async (_req: Request) => {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    });
};


const PATHS = {
    STATUS: '/status',
    START: '/start',
    STOP: '/stop',
    TARGET_WEIGHT: '/target-weight',
    TARE: '/tare',
    CLEAR_ERRORS: '/clear-errors',
} as const;

const handlers = {
    GET: {
        [PATHS.STATUS]: handlerStatus,
    },
    POST: {
        [PATHS.START]: handlerStart,
        [PATHS.STOP]: handlerStop,
        [PATHS.TARGET_WEIGHT]: handlerTargetWeight,
        [PATHS.TARE]: handlerTare,
        [PATHS.CLEAR_ERRORS]: handlerClearErrors,
    },
    OPTIONS: {
        [PATHS.STATUS]: handlerOptions,
        [PATHS.START]: handlerOptions,
        [PATHS.STOP]: handlerOptions,
        [PATHS.TARGET_WEIGHT]: handlerOptions,
        [PATHS.TARE]: handlerOptions,
        [PATHS.CLEAR_ERRORS]: handlerOptions,
    },
} as const;


Deno.serve({
    port,
    hostname: '0.0.0.0',
}, async (req) => {
    try {
        const url = new URL(req.url);
        const handler = (handlers as any)[req.method][url.pathname];
        if (handler) {
            return await handler(req);
        }

        return handlerNotFound();
    } catch (_e) {
        return handlerNotFound();
    }
});
