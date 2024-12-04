import { exec } from 'node:child_process';

import {
    Request,
} from 'express';

import scaleManager from './scaleManager';
import { copyToUSB } from './usb';
import {
    DATABASE_PATH,
    COLD_STORAGE_PATH,
} from './database';

import {
    PATHS,
    corsHeaders,
} from './data';



const handlerResponse = <D = any>(
    response: {
        status: boolean;
        data?: D;
    },
    status: number = 200,
) => {
    const body = JSON.stringify(response);

    return {
        body,
        status,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            ...corsHeaders,
        },
    };
}

// curl -X GET http://localhost:8485/status
const handlerStatus = async (_req: Request) => {
    const data = scaleManager.getStatus();

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
    } = req.body;

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
    } = req.body;

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

const handlerAnalytics = async (_req: Request) => {
    const data = await scaleManager.getAnalytics();

    return handlerResponse({
        status: true,
        data,
    });
}

// curl -X POST http://localhost:8485/clear-errors
const handlerClearErrors = async (_req: Request) => {
    scaleManager.clearErrors();

    return handlerResponse({
        status: true,
    });
}

// curl -X POST http://localhost:8485/restart-server
const handlerRestartServer = async (_req: Request) => {
    setTimeout(() => {
        exec('kill -SIGHUP 1', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error restarting container: ${error.message}`);
            }
            if (stderr) {
                console.error(`Error output: ${stderr}`);
            }

            console.log(`Restart output: ${stdout}`);
        });
    }, 500);

    return handlerResponse({
        status: true,
    });
}

const handlerExportData = async (_req: Request) => {
    await copyToUSB(DATABASE_PATH, 'database.json');
    await copyToUSB(COLD_STORAGE_PATH, 'cold-storage.json');

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
    if (process.env.ENVIRONMENT !== 'development') {
        return handlerNotFound();
    }

    const {
        weight,
    } = req.body;

    scaleManager.__testSetWeight__(weight);

    return handlerResponse({
        status: true,
    });
}

const handlerOptions = async (_req: Request) => {
    return {
        body: null,
        status: 204,
        headers: corsHeaders,
    };
};


const handlers = {
    NOT_FOUND: handlerNotFound,
    GET: {
        [PATHS.STATUS]: handlerStatus,
        [PATHS.ANALYTICS]: handlerAnalytics,
    },
    POST: {
        [PATHS.START]: handlerStart,
        [PATHS.STOP]: handlerStop,
        [PATHS.TARGET_WEIGHT]: handlerTargetWeight,
        [PATHS.TARE]: handlerTare,
        [PATHS.SETTINGS]: handlerSettings,
        [PATHS.CLEAR_ERRORS]: handlerClearErrors,
        [PATHS.RESTART_SERVER]: handlerRestartServer,
        [PATHS.EXPORT_DATA]: handlerExportData,
        [PATHS.TEST_SET_WEIGHT]: handlerTestSetWeight,
    },
    OPTIONS: {
        [PATHS.STATUS]: handlerOptions,
        [PATHS.ANALYTICS]: handlerOptions,
        [PATHS.START]: handlerOptions,
        [PATHS.STOP]: handlerOptions,
        [PATHS.TARGET_WEIGHT]: handlerOptions,
        [PATHS.TARE]: handlerOptions,
        [PATHS.SETTINGS]: handlerOptions,
        [PATHS.CLEAR_ERRORS]: handlerOptions,
        [PATHS.RESTART_SERVER]: handlerOptions,
        [PATHS.EXPORT_DATA]: handlerOptions,
    },
} as const;


export default handlers;
