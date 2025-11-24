import type { APIContext } from 'astro';
import { actions } from 'astro:actions';

export const prerender = false;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET(context: APIContext) {
    const { version } = context.params;

    const info = await context.callAction(actions.version.load, { version: version! });

    if (info.error) {
        console.log(info.error);
        return new Response('', { status: 500, headers });
    }

    return new Response(JSON.stringify(info.data), {
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
