// deno-lint-ignore-file require-await no-explicit-any

import scaleManager from './scaleManager.ts';

import {
    ScaleStatus,
} from './data.ts';



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
        settings: scaleManager.getSettings(),
        analytics: scaleManager.getAnalytics(),
        errors: scaleManager.getErrors(),
    } satisfies ScaleStatus;

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

const handlerSettings = async (req: Request) => {
    const {
        fastFeedSpeed,
        slowFeedSpeed,
        fastSlowPercentage,
        errorPercentage,
        restingTime,
    } = await req.json();

    scaleManager.updateSettings({
        fastFeedSpeed,
        slowFeedSpeed,
        fastSlowPercentage,
        errorPercentage,
        restingTime,
    });

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

const handlerRestartServer = async (_req: Request) => {
    // schedule restart

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

// curl -X POST -H "Content-Type: application/json" -d '{"weight": 15000}' http://localhost:8485/test-set-weight
const handlerTestSetWeight = async (req: Request) => {
    if (Deno.env.get('ENVIRONMENT') !== 'development') {
        return handlerNotFound();
    }

    const {
        weight,
    } = await req.json();

    scaleManager.__testSetWeight__(weight);

    return handlerResponse({
        status: true,
    });
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
    SETTINGS: '/settings',
    CLEAR_ERRORS: '/clear-errors',
    RESTART_SERVER: '/restart-server',
    TEST_SET_WEIGHT: '/test-set-weight',
} as const;

const handlers = {
    NOT_FOUND: handlerNotFound,
    GET: {
        [PATHS.STATUS]: handlerStatus,
    },
    POST: {
        [PATHS.START]: handlerStart,
        [PATHS.STOP]: handlerStop,
        [PATHS.TARGET_WEIGHT]: handlerTargetWeight,
        [PATHS.TARE]: handlerTare,
        [PATHS.SETTINGS]: handlerSettings,
        [PATHS.CLEAR_ERRORS]: handlerClearErrors,
        [PATHS.RESTART_SERVER]: handlerRestartServer,
        [PATHS.TEST_SET_WEIGHT]: handlerTestSetWeight,
    },
    OPTIONS: {
        [PATHS.STATUS]: handlerOptions,
        [PATHS.START]: handlerOptions,
        [PATHS.STOP]: handlerOptions,
        [PATHS.TARGET_WEIGHT]: handlerOptions,
        [PATHS.TARE]: handlerOptions,
        [PATHS.SETTINGS]: handlerOptions,
        [PATHS.CLEAR_ERRORS]: handlerOptions,
        [PATHS.RESTART_SERVER]: handlerOptions,
    },
} as const;


export default handlers;
