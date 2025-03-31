import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxy from 'http-proxy';



// Disable Next.js's default body parsing for this route
export const config = {
    api: {
        bodyParser: false,
    },
};


const proxy = httpProxy.createProxyServer({});


export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise<void>((resolve, reject) => {
        proxy.once('error', (err) => {
            console.error('Proxy error:', err);
            res.status(500).json({ error: 'Proxy request failed' });
            reject(err);
        });

        req.url = req.url?.replace(/^\/api/, '') || '/';

        proxy.web(req, res, {
            target: process.env.SERVER_ENDPOINT || 'http://localhost:8485',
            changeOrigin: true,
        });

        res.on('finish', resolve);
    });
}
