CREATE TABLE `api_rate_limits` (
	`scope` text PRIMARY KEY NOT NULL,
	`window` integer NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `public_game_records_game_created_at_idx` ON `public_game_records` (`game_id`,`created_at`,`id`);--> statement-breakpoint
CREATE INDEX `public_games_created_at_idx` ON `public_games` (`created_at`,`id`);--> statement-breakpoint
CREATE INDEX `scores_mode_score_idx` ON `scores` (`mode`,`score`);
