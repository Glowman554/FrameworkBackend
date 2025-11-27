import { asc } from 'drizzle-orm';
import { db } from '../database/database';
import {
    TelemetryActiveModifications,
    TelemetryActiveModules,
    TelemetryDiscord,
    TelemetryModifications,
    TelemetryModules,
    TelemetrySessions,
    TelemetrySystem,
} from '../database/schema';
import type { TelemetryData } from '../pages/api/v1/telemetry';
import { insertUserIfNecessary } from './user';

async function insertModIfNecessary(name: string, version: string) {
    await db
        .insert(TelemetryModifications)
        .values({
            name,
            version,
        })
        .onConflictDoNothing();
}

async function insertModuleIfNecessary(id: string) {
    await db
        .insert(TelemetryModules)
        .values({
            id,
        })
        .onConflictDoNothing();
}

async function processTelemetryModifications(sessionId: number, modifications: TelemetryData['modifications']) {
    if (!modifications) {
        return;
    }

    for (const mod of modifications.mods) {
        await insertModIfNecessary(mod.name, mod.version);

        await db
            .insert(TelemetryActiveModifications)
            .values({
                name: mod.name,
                version: mod.version,
                sessionId: sessionId,
            })
            .onConflictDoNothing();
    }
}

async function processTelemetrySystem(sessionId: number, system: TelemetryData['system']) {
    if (!system) {
        return;
    }

    await db.insert(TelemetrySystem).values({
        sessionId: sessionId,
        osName: system.osName,
        osVersion: system.osVersion,
        osArch: system.osArch,
        cpuCores: system.cpuCores,
    });
}

async function processTelemetryModules(sessionId: number, modules: TelemetryData['modules']) {
    if (!modules) {
        return;
    }
    
    const moduleIds = Object.keys(modules);

    for (const id of moduleIds) {
        await insertModuleIfNecessary(id);

        await db
            .insert(TelemetryActiveModules)
            .values({
                id: id,
                sessionId: sessionId,
                enabled: modules[id].enabled,
            })
            .onConflictDoNothing();
    }
}

export async function processTelemetryDiscord(sessionId: number, discord: TelemetryData['discord']) {
    if (!discord) {
        return;
    }

    await db
        .insert(TelemetryDiscord)
        .values({
            sessionId: sessionId,
            userId: discord.userId,
            username: discord.username,
            discriminator: discord.discriminator,
        })
        .onConflictDoNothing();
}

export async function processTelemetry(data: TelemetryData) {
    await insertUserIfNecessary(data.id.playerName);

    await db
        .insert(TelemetrySessions)
        .values({
            username: data.id.playerName,
            sessionId: data.id.sessionId,
        })
        .onConflictDoNothing();

    await processTelemetryModifications(data.id.sessionId, data.modifications);
    await processTelemetrySystem(data.id.sessionId, data.system);
    await processTelemetryModules(data.id.sessionId, data.modules);
    await processTelemetryDiscord(data.id.sessionId, data.discord);
}
