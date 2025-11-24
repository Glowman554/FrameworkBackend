import { type APIContext } from 'astro';
import { getProfile } from '../../../backend/minecraft';

export const prerender = false;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Authentication, Content-Type',
};

export async function GET(context: APIContext) {
    const token = context.request.headers.get('Authentication');
    if (!token) {
        throw new Error('Missing authentication token');
    }

    const mc = await getProfile(token);
    if (!mc) {
        return new Response('', { status: 400, headers });
    }

    return new Response(JSON.stringify(mc), {
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
