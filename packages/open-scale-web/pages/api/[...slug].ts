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

            if (req.url === '/logger') {
                let body = '';
                req.on('data', (chunk) => {
                    body += chunk;
                });
                req.on('end', () => {
                    try {
                        const parsedBody = JSON.parse(body);
                        req.body = parsedBody;

                        console.log('[Frontend] Logger request', req.body);
                        res.status(200).json({ message: 'Logger request received' });

                        resolve();
                    } catch (error) {
                        logger('error', 'Failed to parse body', error);
                        res.status(400).json({ error: 'Invalid JSON' });
                        reject(error);
                    }
                });
                req.on('error', (error) => {
                    logger('error', 'Request error', error);
                    res.status(500).json({ error: 'Request error' });
                    reject(error);
                });
                return;
            }

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
