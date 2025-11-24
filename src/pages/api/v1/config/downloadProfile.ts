import { type APIContext } from 'astro';
import { validateOrThrow } from '../../../../config';
import z from 'zod';
import { getProfile } from '../../../../backend/minecraft';
import { loadProfile } from '../../../../backend/user';

export const prerender = false;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Authentication, Content-Type',
};

const schema = z.object({ name: z.string() });

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
    const profile = await loadProfile(mc.name, input.name);

    return new Response(JSON.stringify(profile), {
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
