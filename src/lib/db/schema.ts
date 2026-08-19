import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const scores = sqliteTable(
	'scores',
	{
		id: integer('id').primaryKey(),
		username: text('username').notNull(),
		score: integer('score').notNull(),
		mode: text('mode').notNull(),
		createdAt: integer('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => ({
		modeScore: index('scores_mode_score_idx').on(table.mode, table.score)
	})
);

export const publicGames = sqliteTable(
	'public_games',
	{
		id: integer('id').primaryKey(),
		ended: integer('ended').notNull().default(0),
		createdAt: integer('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		createdBy: text('created_by').notNull()
	},
	(table) => ({
		createdAt: index('public_games_created_at_idx').on(table.createdAt, table.id)
	})
);

export const publicGameRecords = sqliteTable(
	'public_game_records',
	{
		id: integer('id').primaryKey(),
		gameId: integer('game_id').notNull(),
		username: text('username').notNull(),
		songName: text('song_name').notNull(),
		createdAt: integer('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => ({
		gameCreatedAt: index('public_game_records_game_created_at_idx').on(
			table.gameId,
			table.createdAt,
			table.id
		)
	})
);

export const apiRateLimits = sqliteTable('api_rate_limits', {
	scope: text('scope').primaryKey(),
	window: integer('window').notNull(),
	count: integer('count').notNull()
});
