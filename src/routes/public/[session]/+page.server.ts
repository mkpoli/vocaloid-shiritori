import { drizzle } from 'drizzle-orm/d1';
import type { PageServerLoad } from './$types';

import { publicGameRecords, publicGames } from '$lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { gameId as parseGameId } from '$lib/server/api-security';

const MAX_GAME_RECORDS = 250;

export const load: PageServerLoad = async ({ platform, params, setHeaders }) => {
	const DB = platform?.env?.DB;
	if (!DB) {
		throw new Error('DB not found');
	}
	const db = drizzle(DB);

	const gameId = parseGameId(params.session);

	if (!gameId) {
		throw error(403, 'Invalid game ID');
	}

	const [game] = await db.select().from(publicGames).where(eq(publicGames.id, gameId));

	if (!game) {
		throw error(404, 'Game not found');
	}

	const records = await db
		.select()
		.from(publicGameRecords)
		.where(eq(publicGameRecords.gameId, gameId))
		.orderBy(desc(publicGameRecords.createdAt))
		.limit(MAX_GAME_RECORDS);
	setHeaders({ 'cache-control': 'private, max-age=1' });
	return {
		game: game,
		records: records.reverse()
	};
};
