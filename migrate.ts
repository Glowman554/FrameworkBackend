import { createClient } from '@libsql/client';
import { Pool } from 'pg';
import { config } from './src/config';

const sqliteDb = createClient({
    url: 'file:data.db',
});

const pgClient = new Pool({
    connectionString: config.database.url,
});

async function migrateUsers() {
    const sqliteRes = await sqliteDb.execute('SELECT * FROM users');
    const users = sqliteRes.rows.map((row) => ({
        username: row.username,
        passwordHash: row.passwordHash,
        administrator: row.administrator === 1,
    }));

    console.log(`Migrating ${users.length} users...`);

    await pgClient.query(`DELETE FROM users`);
    for (const user of users) {
        await pgClient.query(`INSERT INTO users (username, "passwordHash", administrator) VALUES ($1, $2, $3)`, [
            user.username,
            user.passwordHash,
            user.administrator,
        ]);
    }

    console.log('Done!');
}

async function migrateSessions() {
    const sqliteRes = await sqliteDb.execute('SELECT * FROM sessions');
    const sessions = sqliteRes.rows.map((row) => ({
        username: row.username,
        token: row.token,
        creationDate: row.creationDate,
    }));

    console.log(`Migrating ${sessions.length} sessions...`);

    await pgClient.query(`DELETE FROM sessions`);
    for (const session of sessions) {
        await pgClient.query(
            `INSERT INTO sessions (username, token, "creationDate") VALUES ($1, $2, to_timestamp($3))`,
            [session.username, session.token, session.creationDate]
        );
    }

    console.log('Done!');
}

async function migrateClientVersions() {
    const sqliteRes = await sqliteDb.execute('SELECT * FROM "clientVersions"');
    const versions = sqliteRes.rows.map((row) => ({
        version: row.version,
        downloadUrl: row.downloadUrl,
        endOfLife: row.endOfLife === 1,
    }));

    console.log(`Migrating ${versions.length} client versions...`);

    await pgClient.query(`DELETE FROM "clientVersions"`);
    for (const version of versions) {
        await pgClient.query(`INSERT INTO "clientVersions" (version, "downloadUrl", "endOfLife") VALUES ($1, $2, $3)`, [
            version.version,
            version.downloadUrl,
            version.endOfLife,
        ]);
    }

    console.log('Done!');
}

async function migrateFeaturedServers() {
    const sqliteRes = await sqliteDb.execute('SELECT * FROM "featuredServers"');
    const servers = sqliteRes.rows.map((row) => ({
        name: row.name,
        address: row.address,
        id: row.id,
    }));

    console.log(`Migrating ${servers.length} featured servers...`);

    await pgClient.query(`DELETE FROM "featuredServers"`);
    for (const server of servers) {
        await pgClient.query(`INSERT INTO "featuredServers" (name, address, id) VALUES ($1, $2, $3)`, [
            server.name,
            server.address,
            server.id,
        ]);
    }

    await pgClient.query(`SELECT setval('"featuredServers_id_seq"', (SELECT MAX(id) FROM "featuredServers"))`);

    console.log('Done!');
}

async function migrateMinecraftUsers() {
    const sqliteRes = await sqliteDb.execute('SELECT * FROM "minecraftUsers"');
    const users = sqliteRes.rows.map((row) => ({
        username: row.username,
        firstSeen: row.firstSeen,
    }));

    console.log(`Migrating ${users.length} Minecraft users...`);

    await pgClient.query(`DELETE FROM "minecraftUsers"`);
    for (const user of users) {
        await pgClient.query(`INSERT INTO "minecraftUsers" (username, "firstSeen") VALUES ($1, to_timestamp($2))`, [
            user.username,
            user.firstSeen,
        ]);
    }

    console.log('Done!');
}

async function migrateFakeMinecraftUsers() {
    const sqliteRes = await sqliteDb.execute('SELECT * FROM "fakeMinecraftUsers"');
    const users = sqliteRes.rows.map((row) => ({
        username: row.username,
        token: row.token,
    }));

    console.log(`Migrating ${users.length} fake Minecraft users...`);

    await pgClient.query(`DELETE FROM "fakeMinecraftUsers"`);
    for (const user of users) {
        await pgClient.query(`INSERT INTO "fakeMinecraftUsers" (username, token) VALUES ($1, $2)`, [
            user.username,
            user.token,
        ]);
    }

    console.log('Done!');
}

async function migrateClientMessages() {
    const sqliteRes = await sqliteDb.execute('SELECT * FROM "clientMessages"');
    const messages = sqliteRes.rows.map((row) => ({
        message: row.message,
        id: row.id,
        username: row.username,
        timestamp: row.timestamp,
    }));

    console.log(`Migrating ${messages.length} client messages...`);

    await pgClient.query(`DELETE FROM "clientMessages"`);
    for (const message of messages) {
        await pgClient.query(
            `INSERT INTO "clientMessages" (message, id, username, timestamp) VALUES ($1, $2, $3, to_timestamp($4))`,
            [message.message, message.id, message.username, message.timestamp]
        );
    }

    await pgClient.query(`SELECT setval('"clientMessages_id_seq"', (SELECT MAX(id) FROM "clientMessages"))`);

    console.log('Done!');
}

async function migrateTelemetrySessions() {
    const sqliteRes = await sqliteDb.execute('SELECT * FROM "telemetrySessions"');
    const sessions = sqliteRes.rows.map((row) => ({
        sessionId: row.sessionId,
        username: row.username,
        sessionStart: row.sessionStart,
    }));

    console.log(`Migrating ${sessions.length} telemetry sessions...`);

    await pgClient.query(`DELETE FROM "telemetrySessions"`);
    for (const session of sessions) {
        await pgClient.query(
            `INSERT INTO "telemetrySessions" ("sessionId", username, "sessionStart") VALUES ($1, $2, to_timestamp($3))`,
            [session.sessionId, session.username, session.sessionStart]
        );
    }

    console.log('Done!');
}

async function migrateTelemetrySystem() {
    const sqliteRes = await sqliteDb.execute('SELECT * FROM "telemetrySystem"');
    const entries = sqliteRes.rows.map((row) => ({
        sessionId: row.sessionId,
        osName: row.osName,
        osVersion: row.osVersion,
        osArch: row.osArch,
        cpuCores: row.cpuCores,
    }));

    console.log(`Migrating ${entries.length} telemetry system entries...`);

    await pgClient.query(`DELETE FROM "telemetrySystem"`);
    for (const entry of entries) {
        await pgClient.query(
            `INSERT INTO "telemetrySystem" ("sessionId", "osName", "osVersion", "osArch", "cpuCores") VALUES ($1, $2, $3, $4, $5)`,
            [entry.sessionId, entry.osName, entry.osVersion, entry.osArch, entry.cpuCores]
        );
    }

    console.log('Done!');
}

async function migrateTelemetryDiscord() {
    const sqliteRes = await sqliteDb.execute('SELECT * FROM "telemetryDiscord"');
    const entries = sqliteRes.rows.map((row) => ({
        sessionId: row.sessionId,
        userId: row.userId,
        username: row.username,
        discriminator: row.discriminator,
    }));

    console.log(`Migrating ${entries.length} telemetry Discord entries...`);

    await pgClient.query(`DELETE FROM "telemetryDiscord"`);
    for (const entry of entries) {
        await pgClient.query(
            `INSERT INTO "telemetryDiscord" ("sessionId", "userId", username, discriminator) VALUES ($1, $2, $3, $4)`,
            [entry.sessionId, entry.userId, entry.username, entry.discriminator]
        );
    }

    console.log('Done!');
}

async function migrateTelemetryModules() {
    const sqliteRes = await sqliteDb.execute('SELECT * FROM "telemetryModules"');
    const entries = sqliteRes.rows.map((row) => ({
        id: row.id,
    }));

    console.log(`Migrating ${entries.length} telemetry module entries...`);

    await pgClient.query(`DELETE FROM "telemetryModules"`);
    for (const entry of entries) {
        await pgClient.query(`INSERT INTO "telemetryModules" (id) VALUES ($1)`, [entry.id]);
    }

    console.log('Done!');
}

async function migrateTelemetryActiveModules() {
    const sqliteRes = await sqliteDb.execute('SELECT * FROM "telemetryActiveModules"');
    const entries = sqliteRes.rows.map((row) => ({
        sessionId: row.sessionId,
        id: row.id,
        enabled: row.enabled === 1,
    }));

    console.log(`Migrating ${entries.length} telemetry active module entries...`);

    await pgClient.query(`DELETE FROM "telemetryActiveModules"`);
    for (const entry of entries) {
        await pgClient.query(`INSERT INTO "telemetryActiveModules" ("sessionId", id, enabled) VALUES ($1, $2, $3)`, [
            entry.sessionId,
            entry.id,
            entry.enabled,
        ]);
    }

    console.log('Done!');
}

async function migrateTelemetryModifications() {
    const sqliteRes = await sqliteDb.execute('SELECT * FROM "telemetryModifications"');
    const entries = sqliteRes.rows.map((row) => ({
        name: row.name,
        version: row.version,
    }));

    console.log(`Migrating ${entries.length} telemetry modification entries...`);

    await pgClient.query(`DELETE FROM "telemetryModifications"`);
    for (const entry of entries) {
        await pgClient.query(`INSERT INTO "telemetryModifications" (name, version) VALUES ($1, $2)`, [
            entry.name,
            entry.version,
        ]);
    }

    console.log('Done!');
}

async function migrateTelemetryActiveModifications() {
    const sqliteRes = await sqliteDb.execute('SELECT * FROM "telemetryActiveModifications"');
    const entries = sqliteRes.rows.map((row) => ({
        sessionId: row.sessionId,
        name: row.name,
        version: row.version,
    }));

    console.log(`Migrating ${entries.length} telemetry active modification entries...`);

    await pgClient.query(`DELETE FROM "telemetryActiveModifications"`);
    for (const entry of entries) {
        await pgClient.query(
            `INSERT INTO "telemetryActiveModifications" ("sessionId", name, version) VALUES ($1, $2, $3)`,
            [entry.sessionId, entry.name, entry.version]
        );
    }

    console.log('Done!');
}

await pgClient.connect();
await migrateUsers();
await migrateSessions();
await migrateClientVersions();
await migrateFeaturedServers();
await migrateMinecraftUsers();
await migrateFakeMinecraftUsers();
await migrateClientMessages();
await migrateTelemetrySessions();
await migrateTelemetrySystem();
await migrateTelemetryDiscord();
await migrateTelemetryModules();
await migrateTelemetryActiveModules();
await migrateTelemetryModifications();
await migrateTelemetryActiveModifications();
await pgClient.end();
