import { defineAction } from "astro:actions";
import { db } from "../database/database";
import { FeaturedServers } from "../database/schema";

export const featured = {
    loadAll: defineAction({
        async handler(input, context) {
            const loaded = await db.select().from(FeaturedServers).all();
            return loaded;
        },
    }),
}