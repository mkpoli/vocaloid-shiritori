CREATE TABLE `public_game_records` (
	`id` integer PRIMARY KEY NOT NULL,
	`game_id` integer NOT NULL,
	`username` text NOT NULL,
	`song_name` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `public_games` (
	`id` integer PRIMARY KEY NOT NULL,
	`ended` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
