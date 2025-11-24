import { and, eq } from 'drizzle-orm';
import { db } from '../database/database';
import { ConfigurationProfiles, MinecraftUsers } from '../database/schema';

export async function insertUserIfNecessary(username: string) {
    await db.insert(MinecraftUsers).values({ username }).onConflictDoNothing();
}

export async function createOrUpdateProfile(username: string, profile: string, configuration: any) {
    const configurationEncoded = JSON.stringify(configuration);
    await db
        .insert(ConfigurationProfiles)
        .values({ username, profile, configuration: configurationEncoded })
        .onConflictDoUpdate({
            target: [ConfigurationProfiles.username, ConfigurationProfiles.profile],
            set: { configuration: configurationEncoded },
        });
}

export async function loadProfile(username: string, profile: string) {
    const loaded = await db
        .select()
        .from(ConfigurationProfiles)
        .where(and(eq(ConfigurationProfiles.username, username), eq(ConfigurationProfiles.profile, profile)))
        .get();

    if (!loaded) {
        throw new Error('Failed to load profile');
    }

    return JSON.parse(loaded.configuration);
}
