import { defineAction } from 'astro:actions';
import { db } from '../database/database';
import {
    TelemetryActiveModifications,
    TelemetryActiveModules,
    TelemetryModules,
    TelemetrySystem,
} from '../database/schema';
import { and, count, eq, like, not, or } from 'drizzle-orm';
import { permission } from './authentication';

export interface TelemetrySystemInfoResult {
    osStats: {
        osName: string;
        count: number;
    }[];
    osVersionStats: {
        osName: string;
        osVersion: string;
        count: number;
    }[];
}

export type TelemetryActiveModulesResult = {
    id: string;
    count: number;
}[];

export type TelemetryActiveModificationsResult = {
    name: string;
    versions: string[];
    count: number;
}[];

export const telemetry = {
    processSystemInfo: defineAction({
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            const resultOS = await db
                .select({
                    osName: TelemetrySystem.osName,
                    count: count(),
                })
                .from(TelemetrySystem)
                .groupBy(TelemetrySystem.osName);

            const resultOSVersion = await db
                .select({
                    osName: TelemetrySystem.osName,
                    osVersion: TelemetrySystem.osVersion,
                    count: count(),
                })
                .from(TelemetrySystem)
                .groupBy(TelemetrySystem.osName, TelemetrySystem.osVersion);

            return {
                osStats: resultOS,
                osVersionStats: resultOSVersion,
            } satisfies TelemetrySystemInfoResult;
        },
    }),

    processActiveModules: defineAction({
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            const result = await db
                .select({
                    id: TelemetryActiveModules.id,
                    count: count(),
                })
                .from(TelemetryActiveModules)
                .groupBy(TelemetryActiveModules.id)
                .where(eq(TelemetryActiveModules.enabled, true));

            return result satisfies TelemetryActiveModulesResult;
        },
    }),

    processActiveModifications: defineAction({
        async handler(input, context) {
            await permission(context, (u) => u.administrator);

            const modifications = await db
                .select({
                    name: TelemetryActiveModifications.name,
                    count: count(),
                })
                .from(TelemetryActiveModifications)
                .groupBy(TelemetryActiveModifications.name)
                .where(or(
                    not(like(TelemetryActiveModifications.name, 'fabric%')),
                    not(like(TelemetryActiveModifications.name, 'kotlin%')),
                    not(like(TelemetryActiveModifications.name, 'glsl%')),
                    not(like(TelemetryActiveModifications.name, 'OpenJDK%')),
                    not(like(TelemetryActiveModifications.name, 'MixinExtras%')),
                    not(like(TelemetryActiveModifications.name, 'Minecraft%')),
                    not(like(TelemetryActiveModifications.name, 'ConfigManager%')),
                    not(like(TelemetryActiveModifications.name, 'Forgified%')),
                ));

            const result: TelemetryActiveModificationsResult = [];

            for (const mod of modifications) {
                const versions = await db
                    .select({
                        version: TelemetryActiveModifications.version,
                    })
                    .from(TelemetryActiveModifications)
                    .where(eq(TelemetryActiveModifications.name, mod.name));

                const versionSet = new Set<string>();
                versions.forEach((v) => versionSet.add(v.version));

                result.push({
                    name: mod.name,
                    versions: Array.from(versionSet),
                    count: mod.count,
                });
            }

            return result;
        },
    }),
};
