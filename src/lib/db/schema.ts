import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const scores = sqliteTable('scores', {
	id: integer('id').primaryKey(),
	username: text('username').notNull(),
	score: integer('score').notNull(),
	mode: text('mode').notNull(),
	createdAt: integer('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

export const publicGames = sqliteTable('public_games', {
	id: integer('id').primaryKey(),
	ended: integer('ended').notNull().default(0),
	createdAt: integer('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	createdBy: text('created_by').notNull()
});

export const publicGameRecords = sqliteTable('public_game_records', {
	id: integer('id').primaryKey(),
	gameId: integer('game_id').notNull(),
	username: text('username').notNull(),
	songName: text('song_name').notNull(),
	createdAt: integer('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});
