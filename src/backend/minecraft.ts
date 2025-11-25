import { z } from 'zod';
import { validateOrThrow } from '../config';

export const SkinSchema = z.object({
    id: z.string(),
    state: z.string(),
    url: z.string(),
    textureKey: z.string(),
    variant: z.string(),
});

export const CapeSchema = z.object({
    id: z.string(),
    state: z.string(),
    url: z.string(),
    alias: z.string(),
});

export const ProfileSchema = z.object({
    id: z.string(),
    name: z.string(),
    skins: z.array(SkinSchema),
    capes: z.array(CapeSchema),
});
type Profile = z.infer<typeof ProfileSchema>;

const profileCache = new Map<string, Profile & { timestamp: number }>();

export async function getProfile(token: string) {
    const cached = profileCache.get(token);
    const now = Date.now();
    if (cached && now - cached.timestamp < 5 * 60 * 1000) {
        return cached;
    }

    const res = await fetch('https://api.minecraftservices.com/minecraft/profile', {
        headers: {
            Authorization: 'Bearer ' + token,
        },
    });

    if (res.status != 200) {
        console.log(await res.json(), res.status);
        return null;
    }

    const profile = validateOrThrow(ProfileSchema, await res.json());
    profileCache.set(token, { ...profile, timestamp: Date.now() });
    return profile;
}
