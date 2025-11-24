import { Hono } from 'npm:hono@^4.6.14';

async function main() {
    const app = new Hono();

    const port = Number(Deno.env.get('PORT') || 3000);
    const keyPath = Deno.env.get('SERVER_KEY_PATH');
    const certPath = Deno.env.get('SERVER_CERT_PATH');

    let options: Deno.ServeTcpOptions | (Deno.ServeTcpOptions & Deno.TlsCertifiedKeyPem) = {
        port,
    };

    if (keyPath && certPath) {
        options = {
            ...options,
            ...{
                key: await Deno.readTextFile(keyPath),
                cert: await Deno.readTextFile(certPath),
            },
        };
    }

    await Deno.serve(options, app.fetch);
}

await main();
