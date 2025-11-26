import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { authentication } from './authentication';
import { version } from './version';
import { uploads } from './uploads';
import { featured } from './featured';
import { chat } from './chat';
import { telemetry } from './telemetry';

export const server = {
    double: defineAction({
        input: z.number(),
        handler(input, context) {
            return input * 2;
        },
    }),
    authentication,
    version,
    uploads,
    featured,
    chat,
    telemetry,
};
