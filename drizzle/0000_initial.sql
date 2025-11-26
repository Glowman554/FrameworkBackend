CREATE TABLE `clientMessages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`message` text NOT NULL,
	`timestamp` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`username`) REFERENCES `minecraftUsers`(`username`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `clientVersions` (
	`version` text PRIMARY KEY NOT NULL,
	`endOfLife` integer DEFAULT false NOT NULL,
	`downloadUrl` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `configurationProfiles` (
	`username` text NOT NULL,
	`profile` text NOT NULL,
	`configuration` text NOT NULL,
	PRIMARY KEY(`username`, `profile`),
	FOREIGN KEY (`username`) REFERENCES `minecraftUsers`(`username`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `featuredServers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `minecraftUsers` (
	`username` text PRIMARY KEY NOT NULL,
	`firstSeen` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`username` text NOT NULL,
	`token` text PRIMARY KEY NOT NULL,
	`creationDate` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `telemetryActiveModifications` (
	`sessionId` integer NOT NULL,
	`name` text NOT NULL,
	`version` text NOT NULL,
	PRIMARY KEY(`sessionId`, `name`, `version`),
	FOREIGN KEY (`sessionId`) REFERENCES `telemetrySessions`(`sessionId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`name`,`version`) REFERENCES `telemetryModifications`(`name`,`version`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `telemetryActiveModules` (
	`sessionId` integer NOT NULL,
	`id` text NOT NULL,
	`enabled` integer NOT NULL,
	PRIMARY KEY(`sessionId`, `id`),
	FOREIGN KEY (`sessionId`) REFERENCES `telemetrySessions`(`sessionId`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`id`) REFERENCES `telemetryModules`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `telemetryDiscord` (
	`sessionId` integer PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`username` text NOT NULL,
	`discriminator` text,
	FOREIGN KEY (`sessionId`) REFERENCES `telemetrySessions`(`sessionId`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `telemetryModifications` (
	`name` text NOT NULL,
	`version` text NOT NULL,
	PRIMARY KEY(`name`, `version`)
);
--> statement-breakpoint
CREATE TABLE `telemetryModules` (
	`id` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `telemetrySessions` (
	`username` text NOT NULL,
	`sessionId` integer PRIMARY KEY NOT NULL,
	`sessionStart` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`username`) REFERENCES `minecraftUsers`(`username`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `telemetrySystem` (
	`sessionId` integer PRIMARY KEY NOT NULL,
	`osName` text NOT NULL,
	`osVersion` text NOT NULL,
	`osArch` text NOT NULL,
	`cpuCores` integer NOT NULL,
	FOREIGN KEY (`sessionId`) REFERENCES `telemetrySessions`(`sessionId`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`username` text PRIMARY KEY NOT NULL,
	`administrator` integer DEFAULT false NOT NULL,
	`passwordHash` text NOT NULL
);
