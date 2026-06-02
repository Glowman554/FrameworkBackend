// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from 'drizzle-orm';
import { foreignKey, integer, primaryKey, pgTable, boolean, timestamp, text } from 'drizzle-orm/pg-core';
export const Users = pgTable('users', {
    username: text('username').primaryKey().notNull(),
    administrator: boolean('administrator').default(false).notNull(),
    passwordHash: text('passwordHash').notNull(),
});

export const Sessions = pgTable('sessions', {
    username: text('username')
        .references(() => Users.username, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    token: text('token').primaryKey().notNull(),
    creationDate: timestamp('creationDate', { withTimezone: true })
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull(),
});

export const MinecraftUsers = pgTable('minecraftUsers', {
    username: text('username').primaryKey().notNull(),
    firstSeen: timestamp('firstSeen', { withTimezone: true })
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull(),
});

export const FakeMinecraftUsers = pgTable('fakeMinecraftUsers', {
    username: text('username')
        .references(() => MinecraftUsers.username, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    token: text('token').notNull(),
});

export const TelemetrySessions = pgTable('telemetrySessions', {
    username: text('username')
        .references(() => MinecraftUsers.username, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    sessionId: integer('sessionId').primaryKey(),
    sessionStart: timestamp('sessionStart', { withTimezone: true })
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull(),
});

export const TelemetryDiscord = pgTable('telemetryDiscord', {
    sessionId: integer('sessionId')
        .references(() => TelemetrySessions.sessionId, { onDelete: 'cascade', onUpdate: 'cascade' })
        .primaryKey()
        .notNull(),

    userId: text('userId').notNull(),
    username: text('username').notNull(),
    discriminator: text('discriminator'),
});

export const TelemetrySystem = pgTable('telemetrySystem', {
    sessionId: integer('sessionId')
        .references(() => TelemetrySessions.sessionId, { onDelete: 'cascade', onUpdate: 'cascade' })
        .primaryKey()
        .notNull(),

    osName: text('osName').notNull(),
    osVersion: text('osVersion').notNull(),
    osArch: text('osArch').notNull(),
    cpuCores: integer('cpuCores').notNull(),
});

export const TelemetryModifications = pgTable(
    'telemetryModifications',
    {
        name: text('name').notNull(),
        version: text('version').notNull(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.name, t.version] }),
    })
);

export const TelemetryActiveModifications = pgTable(
    'telemetryActiveModifications',
    {
        sessionId: integer('sessionId')
            .references(() => TelemetrySessions.sessionId, { onDelete: 'cascade', onUpdate: 'cascade' })
            .notNull(),

        name: text('name').notNull(),
        version: text('version').notNull(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.sessionId, t.name, t.version] }),

        fk: foreignKey({
            columns: [t.name, t.version],
            foreignColumns: [TelemetryModifications.name, TelemetryModifications.version],
        }),
    })
);

export const TelemetryModules = pgTable('telemetryModules', {
    id: text('id').primaryKey().notNull(),
});

export const TelemetryActiveModules = pgTable(
    'telemetryActiveModules',
    {
        sessionId: integer('sessionId')
            .references(() => TelemetrySessions.sessionId, { onDelete: 'cascade', onUpdate: 'cascade' })
            .notNull(),

        id: text('id')
            .references(() => TelemetryModules.id, { onDelete: 'cascade', onUpdate: 'cascade' })
            .notNull(),

        enabled: boolean('enabled').notNull(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.sessionId, t.id] }),
    })
);

export const ConfigurationProfiles = pgTable(
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

export const ClientVersions = pgTable('clientVersions', {
    version: text('version').primaryKey().notNull(),
    endOfLife: boolean('endOfLife').default(false).notNull(),
    downloadUrl: text('downloadUrl').notNull(),
});

export const FeaturedServers = pgTable('featuredServers', {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity().notNull(),
    name: text('name').notNull(),
    address: text('address').notNull(),
});

export const ClientMessages = pgTable('clientMessages', {
    id: integer('id').primaryKey().generatedByDefaultAsIdentity().notNull(),
    username: text('username')
        .references(() => MinecraftUsers.username, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    message: text('message').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true })
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull(),
});
