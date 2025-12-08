CREATE TABLE `fakeMinecraftUsers` (
	`username` text NOT NULL,
	`token` text NOT NULL,
	FOREIGN KEY (`username`) REFERENCES `minecraftUsers`(`username`) ON UPDATE cascade ON DELETE cascade
);
