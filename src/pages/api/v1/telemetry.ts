import z from 'zod';
import { validateOrThrow } from '../../../config';
import type { APIContext } from 'astro';
import { processTelemetry } from '../../../backend/telemetry';

export const prerender = false;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
};

const idSchema = z.object({ playerName: z.string(), sessionId: z.number() });

const modificationsSchema = z.object({
    mods: z.array(
        z.object({
            name: z.string(),
            version: z.string(),
            description: z.string(),
            type: z.string(),
        })
    ),
    time: z.number(),
});

const systemSchema = z.object({
    osName: z.string(),
    osVersion: z.string(),
    osArch: z.string(),
    cpuCores: z.number(),
});

const modulesSchema = z.record(
    z.object({
        pos: z
            .object({
                x: z.number(),
                y: z.number(),
            })
            .optional(),
        enabled: z.boolean(),
    })
);

const discordSchema = z.object({
    userId: z.string(),
    username: z.string(),
    discriminator: z.string(),
});

const schema = z.object({
    id: idSchema,
    modifications: modificationsSchema.optional(),
    system: systemSchema.optional(),
    modules: modulesSchema,
    discord: discordSchema.optional(),
});
export type TelemetryData = z.infer<typeof schema>;

export async function POST(context: APIContext) {
    const input = validateOrThrow(schema, await context.request.json());

    await processTelemetry(input);

    return new Response(JSON.stringify({}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });
}

export async function OPTIONS(context: APIContext) {
    return new Response(null, {
        status: 200,
        headers,
    });
}
