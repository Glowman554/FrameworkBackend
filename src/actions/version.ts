import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq, type InferSelectModel } from 'drizzle-orm';
import { ClientVersions } from '../database/schema';
import { db } from '../database/database';
import { permission } from './authentication';

export type Version = InferSelectModel<typeof ClientVersions>;

export const version = {
    load: defineAction({
        input: z.object({ version: z.string() }),
        async handler(input, context) {
            const loaded = await db
                .select()
                .from(ClientVersions)
                .where(eq(ClientVersions.version, input.version))
                .get();

            if (!loaded) {
                throw new Error('Version not found');
            }

            return loaded satisfies Version;
        },
    }),

    loadAll: defineAction({
        async handler(input, context) {
            const loaded = await db.select().from(ClientVersions).all();
            return loaded satisfies Version[];
        },
    }),

    delete: defineAction({
        input: z.object({ version: z.string() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            await db.delete(ClientVersions).where(eq(ClientVersions.version, input.version));
        },
    }),

    create: defineAction({
        input: z.object({ version: z.string(), endOfLife: z.boolean(), downloadUrl: z.string() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            await db.insert(ClientVersions).values({
                version: input.version,
                endOfLife: input.endOfLife,
                downloadUrl: input.downloadUrl,
            });
        },
    }),

    update: defineAction({
        input: z.object({ version: z.string(), endOfLife: z.boolean(), downloadUrl: z.string() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            await db
                .update(ClientVersions)
                .set({ endOfLife: input.endOfLife, downloadUrl: input.downloadUrl })
                .where(eq(ClientVersions.version, input.version));
        },
    }),
};
