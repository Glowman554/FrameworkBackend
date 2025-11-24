// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from 'drizzle-orm';
import { int, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const Users = sqliteTable('users', {
    username: text('username').primaryKey().notNull(),
    administrator: int({ mode: 'boolean' }).default(false).notNull(),
    passwordHash: text('passwordHash').notNull(),
});

export const Sessions = sqliteTable('sessions', {
    username: text('username')
        .references(() => Users.username, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    token: text('token').primaryKey().notNull(),
    creationDate: integer('creationDate', { mode: 'timestamp' })
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),
});

export const MinecraftUsers = sqliteTable('minecraftUsers', {
    username: text('username').primaryKey().notNull(),
    firstSeen: integer('firstSeen', { mode: 'timestamp' })
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),
});

export const TelemetrySessions = sqliteTable('telemetrySessions', {
    username: text('username')
        .references(() => MinecraftUsers.username, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    sessionId: integer('sessionId').primaryKey(),
    sessionStart: integer('sessionStart', { mode: 'timestamp' })
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),
});

export const TelemetryDiscord = sqliteTable('telemetryDiscord', {
    sessionId: text('sessionId')
        .references(() => TelemetrySessions.sessionId, { onDelete: 'cascade', onUpdate: 'cascade' })
        .primaryKey()
        .notNull(),

    userId: text('userId').notNull(),
    username: text('username').notNull(),
    discriminator: text('discriminator'),
});

export const TelemetryModifications = sqliteTable(
    'telemetryModifications',
    {
        name: text('name').notNull(),
        version: text('version').notNull(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.name, t.version] }),
    })
);

export const TelemetryActiveModifications = sqliteTable(
    'telemetryActiveModifications',
    {
        sessionId: text('sessionId')
            .references(() => TelemetrySessions.sessionId, { onDelete: 'cascade', onUpdate: 'cascade' })
            .notNull(),

        name: text('name')
            .references(() => TelemetryModifications.name, { onDelete: 'cascade', onUpdate: 'cascade' })
            .notNull(),
        version: text('version')
            .references(() => TelemetryModifications.version, { onDelete: 'cascade', onUpdate: 'cascade' })
            .notNull(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.sessionId, t.name, t.version] }),
    })
);

export const TelemetryModules = sqliteTable('telemetryModules', {
    id: text('id').primaryKey().notNull(),
});

export const TelemetryActiveModules = sqliteTable(
    'telemetryActiveModules',
    {
        sessionId: text('sessionId')
            .references(() => TelemetrySessions.sessionId, { onDelete: 'cascade', onUpdate: 'cascade' })
            .notNull(),

        id: text('id')
            .references(() => TelemetryModules.id, { onDelete: 'cascade', onUpdate: 'cascade' })
            .notNull(),

        enabled: integer('enabled', { mode: 'boolean' }).notNull(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.sessionId, t.id] }),
    })
);

export const ConfigurationProfiles = sqliteTable(
    'configurationProfiles',
    {
        username: text('username')
            .references(() => MinecraftUsers.username, { onDelete: 'cascade', onUpdate: 'cascade' })
            .notNull(),
        profile: text('profile').notNull(),
        configuration: text('configuration').notNull(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.username, t.profile] }),
    })
);

export const ClientVersions = sqliteTable('clientVersions', {
    version: text('version').primaryKey().notNull(),
    endOfLife: integer('endOfLife', { mode: 'boolean' }).default(false).notNull(),
    downloadUrl: text('downloadUrl').notNull(),
});
