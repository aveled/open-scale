import { promises as fs } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

import {
    DEFAULT_FEED_SPEED,
    DEFAULT_FAST_SLOW_PERCENTAGE,
    DEFAULT_TARGET_WEIGHT,
    DEFAULT_ERROR_PERCENTAGE,
    DEFAULT_RESTING_TIME,

    Database,
} from './data.ts';



const setupDatabase = async () => {
    const OPEN_SCALE_DIR = path.join(
        homedir(),
        '/.open-scale',
    );
    await fs.mkdir(OPEN_SCALE_DIR, { recursive: true });

    const DATABASE_PATH = path.join(
        OPEN_SCALE_DIR,
        '/db.json',
    );
    const defaultData: Database = {
        fastFeedSpeed: DEFAULT_FEED_SPEED.FAST,
        slowFeedSpeed: DEFAULT_FEED_SPEED.SLOW,
        fastSlowPercentage: DEFAULT_FAST_SLOW_PERCENTAGE,
        targetWeight: DEFAULT_TARGET_WEIGHT,
        errorPercentage: DEFAULT_ERROR_PERCENTAGE,
        restingTime: DEFAULT_RESTING_TIME,
        events: [],
    };

    try {
        await fs.access(DATABASE_PATH);
    } catch (_error) {
        await fs.writeFile(DATABASE_PATH, JSON.stringify(defaultData));
    }

    return [
        DATABASE_PATH,
        defaultData,
    ] as const;
}

const [DATABASE_PATH, defaultData] = await setupDatabase();
const database = new Low<Database>(new JSONFile(DATABASE_PATH), defaultData);


export default database;
