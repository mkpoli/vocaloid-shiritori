import { drizzle } from 'drizzle-orm/d1';
import type { PageServerLoad } from './$types';

import { publicGameRecords, publicGames } from '$lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ platform, params }) => {
	const DB = platform?.env?.DB;
	if (!DB) {
		throw new Error('DB not found');
	}
	const db = drizzle(DB);

	const gameId = Number(params.session);

	if (isNaN(gameId)) {
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
		.limit(1000);
	return {
		game: game,
		records: records
	};
};
