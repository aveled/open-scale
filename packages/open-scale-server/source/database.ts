import { promises as fs } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

import {
    DEFAULT_TARGET_WEIGHT,
    DEFAULT_ERROR_PERCENTAGE,
} from './data.ts';



const OPEN_SCALE_DIR = path.join(
    homedir(),
    '/.open-scale',
);
await fs.mkdir(OPEN_SCALE_DIR, { recursive: true });

const DATABASE_PATH = path.join(
    OPEN_SCALE_DIR,
    '/db.json',
);
interface Database {
    targetWeight: number;
    errorPercentage: number;
}
const defaultData: Database = {
    targetWeight: DEFAULT_TARGET_WEIGHT,
    errorPercentage: DEFAULT_ERROR_PERCENTAGE,
};
const database = new Low<Database>(new JSONFile(DATABASE_PATH), defaultData);


export default database;
