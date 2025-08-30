CREATE TABLE `jwk` (
	`id` text PRIMARY KEY NOT NULL,
	`public_key` text NOT NULL,
	`private_key` text,
	`kid` text,
	`created_at` integer,
	`updated_at` integer
);
