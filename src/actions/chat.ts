import { defineAction } from 'astro:actions';
import { z } from 'astro:content';
import { getProfile } from '../backend/minecraft';
import { db } from '../database/database';
import { ClientMessages } from '../database/schema';
import { desc, type InferSelectModel } from 'drizzle-orm';
import { publishChatMessage } from '../pages/api/v1/chat/subscribe';
import { insertUserIfNecessary } from '../backend/user';

export type ChatMessage = InferSelectModel<typeof ClientMessages>;
const anonymous = 'anonymous';

async function publish(message: string, username: string) {
    await insertUserIfNecessary(username);

    const result = await db
        .insert(ClientMessages)
        .values({
            username: username,
            message: message,
        })
        .returning()
        .get();

    await publishChatMessage(result);
}

export const chat = {
    publish: defineAction({
        input: z.object({ message: z.string().max(512), token: z.string() }),
        async handler(input, context) {
            const { message, token } = input;

            const mc = await getProfile(token);
            if (!mc) {
                throw new Error('Invalid token');
            }

            await publish(message, mc.name);
        },
    }),

    publishUnauthenticated: defineAction({
        input: z.object({ message: z.string().max(512) }),
        async handler(input, context) {
            const { message } = input;

            await publish(message, anonymous);
        },
    }),

    loadLatest: defineAction({
        input: z.object({ limit: z.number().min(1).max(100) }),
        async handler(input, context) {
            const messages = await db
                .select()
                .from(ClientMessages)
                .orderBy(desc(ClientMessages.timestamp))
                .limit(input.limit)
                .all();

            return messages;
        },
    }),
};
