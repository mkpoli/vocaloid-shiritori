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
