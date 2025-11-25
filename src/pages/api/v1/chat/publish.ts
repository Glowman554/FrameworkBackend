import { type APIContext } from 'astro';
import { validateOrThrow } from '../../../../config';
import z from 'zod';
import { getProfile } from '../../../../backend/minecraft';
import { actions } from 'astro:actions';
import type { ChatMessage } from '../../../../actions/chat';

export const prerender = false;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Authentication, Content-Type',
};

const schema = z.object({ message: z.string().max(512) });

export async function POST(context: APIContext) {
    const token = context.request.headers.get('Authentication');
    if (!token) {
        throw new Error('Missing authentication token');
    }

    const input = validateOrThrow(schema, await context.request.json());

    const res = await context.callAction(actions.chat.publish, { message: input.message, token });
    if (res.error) {
        return new Response('', { status: 500, headers });
    }

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
