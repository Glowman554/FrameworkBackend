import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq, type InferSelectModel } from 'drizzle-orm';
import { ClientVersions, FakeMinecraftUsers, MinecraftUsers } from '../database/schema';
import { db } from '../database/database';
import { createRandomToken, permission } from './authentication';
import { insertUserIfNecessary } from '../backend/user';
import type { Profile } from '../backend/minecraft';

export type FakeUser = InferSelectModel<typeof FakeMinecraftUsers>;

export async function loadFakeUser(token: string): Promise<Profile | null> {
    const user = await db.select().from(FakeMinecraftUsers).where(eq(FakeMinecraftUsers.token, token)).get();
    if (!user) {
        return null;
    }

    return {
        capes: [],
        skins: [],
        id: user.username,
        name: user.username,
    };
}

export const users = {
    loadAll: defineAction({
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            const loaded = await db.select().from(FakeMinecraftUsers).all();
            return loaded satisfies FakeUser[];
        },
    }),

    delete: defineAction({
        input: z.object({ username: z.string() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            await db.delete(FakeMinecraftUsers).where(eq(FakeMinecraftUsers.username, input.username));
        },
    }),

    create: defineAction({
        input: z.object({ username: z.string() }),
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            const token = createRandomToken();

            await insertUserIfNecessary(input.username);
            await db.insert(FakeMinecraftUsers).values({
                username: input.username,
                token,
            });

            return token;
        },
    }),
};
