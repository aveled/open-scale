import http from 'node:http';
import {
    WebSocketServer,
} from 'ws';

import {
    PORT,
} from './source/data';

import handlers from './source/handlers';
import scaleManager from './source/scaleManager';



const server = http.createServer(async (req, res) => {
    try {
        if (req.headers.upgrade === 'websocket') {
            // Let the `upgrade` event handle WebSocket connections
            res.writeHead(426, { 'Content-Type': 'text/plain' });
            res.end('Upgrade Required');
            return;
        }

        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const method = req.method || 'GET';
        const methodHandlers = (handlers as any)[method] || {};
        const handler = methodHandlers[url.pathname];

        if (handler) {
            const data = await handler(req) as {
                body: string | null,
                status: number,
                headers: Record<string, string>,
            };

            res.writeHead(data.status, data.headers);
            res.end(data.body);
        } else {
            const data = handlers.NOT_FOUND();
            res.writeHead(data.status, data.headers);
            res.end(data.body);
        }
    } catch (error) {
        console.error('Error handling request:', error);
        const data = handlers.NOT_FOUND();
        res.writeHead(data.status, data.headers);
        res.end(data.body);
    }
});


const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (socket) => {
    const socketID = Math.random().toString(36).slice(2);

    scaleManager.handleSocket(socketID, socket);

    socket.on('close', () => {
        scaleManager.closeSocket(socketID, socket);
    });
});

server.on('upgrade', (req, socket, head) => {
    if (req.headers['upgrade'] !== 'websocket') {
        socket.destroy();
        return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
    });
});


server.listen(PORT, () => {
    console.log(`Server running at http://0.0.0.0:${PORT}/`);
});
