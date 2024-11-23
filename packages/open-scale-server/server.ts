// deno-lint-ignore-file no-explicit-any

import {
    PORT,
} from './source/data.ts';

import handlers from './source/handlers.ts';
import scaleManager from './source/scaleManager.ts';



Deno.serve({
    port: PORT,
    hostname: '0.0.0.0',
}, async (req) => {
    try {
        if (req.headers.get('upgrade') !== 'websocket') {
            const url = new URL(req.url);
            const handler = (handlers as any)[req.method][url.pathname];
            if (handler) {
                return await handler(req);
            }

            return handlers.NOT_FOUND();
        }

        const { socket, response } = Deno.upgradeWebSocket(req);

        const socketID = Math.random().toString(36).slice(2);

        socket.addEventListener('open', () => {
            scaleManager.handleSocket(socketID, socket);
        });

        socket.addEventListener('close', () => {
            scaleManager.closeSocket(socketID, socket);
        });

        return response;
    } catch (_e) {
        return handlers.NOT_FOUND();
    }
});
