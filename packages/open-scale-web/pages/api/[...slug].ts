import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxy from 'http-proxy';

import {
    SERVER_ENDPOINT,
} from '@/data/index';

import { logger } from '@/logic/utilities';



// Disable Next.js's default body parsing for this route
export const config = {
    api: {
        bodyParser: false,
    },
};


let proxy: httpProxy | null;
try {
    proxy = httpProxy.createProxyServer({});
} catch (error) {
    logger('error', 'createProxyServer error', error);
}


export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise<void>((resolve, reject) => {
        try {
            if (!proxy) {
                return;
            }

            proxy.once('error', (error) => {
                logger('error', 'Proxy error', error);
                res.status(500).json({ error: 'Proxy request failed' });
                reject(error);
            });

            req.url = req.url?.replace(/^\/api/, '') || '/';

            proxy.web(req, res, {
                target: SERVER_ENDPOINT,
                changeOrigin: true,
            });

            res.on('finish', resolve);
        } catch (error) {
            if (res.writableEnded) {
                logger('error', 'Response already ended', error);
                return;
            }

            logger('error', 'Proxy error', error);
            res.status(500).json({ error: 'Proxy request failed' });
            reject(error);
        }
    });
}
