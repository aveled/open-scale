// deno-lint-ignore-file no-explicit-any

import {
    PORT,
} from './source/data.ts';

import handlers from './source/handlers.ts';



Deno.serve({
    port: PORT,
    hostname: '0.0.0.0',
}, async (req) => {
    try {
        const url = new URL(req.url);
        const handler = (handlers as any)[req.method][url.pathname];
        if (handler) {
            return await handler(req);
        }

        return handlers.NOT_FOUND();
    } catch (_e) {
        return handlers.NOT_FOUND();
    }
});
