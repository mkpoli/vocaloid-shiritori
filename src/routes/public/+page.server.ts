import { drizzle } from 'drizzle-orm/d1';
import type { PageServerLoad } from './$types';

import { publicGameRecords, publicGames } from '$lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export type Game = typeof publicGames.$inferSelect;
export type GameRecord = typeof publicGameRecords.$inferSelect;
export type GameWithRecords = Game & {
	records: {
		first: GameRecord;
		last: GameRecord;
	};
};

export const load: PageServerLoad = async ({ platform }) => {
	const DB = platform?.env?.DB;
	if (!DB) {
		throw new Error('DB not found');
	}
	const db = drizzle(DB);

	// Fetch all records for the games
	const records = await db
		.select()
		.from(publicGames)
		.leftJoin(publicGameRecords, eq(publicGameRecords.gameId, publicGames.id))
		.orderBy(desc(publicGames.createdAt)); // TODO: Limit?

	const gameRecords = new Map<number, GameWithRecords>();

	for (const record of records) {
		const { public_games: publicGame, public_game_records: publicGameRecord } = record;
		const { id: gameId } = publicGame;
		if (!publicGameRecord) continue;
		const { createdAt } = publicGameRecord;
		if (!gameRecords.has(gameId)) {
			gameRecords.set(gameId, {
				...publicGame,
				records: {
					first: publicGameRecord,
					last: publicGameRecord
				}
			});
		} else {
			const existing = gameRecords.get(gameId);

			if (!existing) continue;

			if (createdAt < existing.records.first.createdAt) {
				existing.records.first = publicGameRecord;
			}

			if (createdAt > existing.records.last.createdAt) {
				existing.records.last = publicGameRecord;
			}
		}
	}

	return {
		games: Array.from(gameRecords.values())
	};
};
