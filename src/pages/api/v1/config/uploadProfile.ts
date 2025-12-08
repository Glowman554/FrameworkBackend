import { type APIContext } from 'astro';
import { validateOrThrow } from '../../../../config';
import z from 'zod';
import { getProfile } from '../../../../backend/minecraft';
import { createOrUpdateProfile } from '../../../../backend/user';

export const prerender = false;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Authentication, Content-Type',
};

const schema = z.object({ name: z.string(), configuration: z.any() });

export async function POST(context: APIContext) {
    const token = context.request.headers.get('Authentication');
    if (!token) {
        throw new Error('Missing authentication token');
    }

    const mc = await getProfile(token);
    if (!mc) {
        return new Response('', { status: 400, headers });
    }

    const input = validateOrThrow(schema, await context.request.json());

    await createOrUpdateProfile(mc.name, input.name, input.configuration);

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
