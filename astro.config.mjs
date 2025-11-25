// @ts-check
import { defineConfig } from 'astro/config';
import solid from '@astrojs/solid-js';

import nodeWebSocket from 'astro-node-websocket';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    // Enable Solid to support Solid JSX components.
    site: 'https://test.glowman554.de',
    integrations: [solid({ include: ['**'] }), sitemap()],

    vite: {
        plugins: [tailwindcss()],
    },

    adapter: nodeWebSocket({
        mode: 'standalone',
    }),
});
