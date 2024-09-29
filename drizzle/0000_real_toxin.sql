CREATE TABLE `scores` (
	`id` integer PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`score` integer NOT NULL,
	`mode` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
