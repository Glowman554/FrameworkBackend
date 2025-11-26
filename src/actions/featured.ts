import { defineAction } from 'astro:actions';
import { db } from '../database/database';
import { FeaturedServers } from '../database/schema';
import { z } from 'astro:content';
import { eq, type InferSelectModel } from 'drizzle-orm';
import { permission } from './authentication';

export type FeaturedServer = InferSelectModel<typeof FeaturedServers>;

export const featured = {
    loadAll: defineAction({
        async handler(input, context) {
            const loaded = await db.select().from(FeaturedServers).all();
            return loaded;
        },
    }),

    create: defineAction({
        input: z.object({ name: z.string(), address: z.string() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            await db.insert(FeaturedServers).values({
                name: input.name,
                address: input.address,
            });
        },
    }),

    delete: defineAction({
        input: z.object({ id: z.number() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            await db.delete(FeaturedServers).where(eq(FeaturedServers.id, input.id));
        },
    }),

    update: defineAction({
        input: z.object({ id: z.number(), name: z.string(), address: z.string() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            await db
                .update(FeaturedServers)
                .set({ name: input.name, address: input.address })
                .where(eq(FeaturedServers.id, input.id));
        },
    }),
};
