import { drizzle } from 'drizzle-orm/d1';
import type { PageServerLoad } from './$types';

import { publicGames } from '$lib/db/schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ platform }) => {
	const DB = platform?.env?.DB;
	if (!DB) {
		throw new Error('DB not found');
	}
	const db = drizzle(DB);
	const result = await db
		.select()
		.from(publicGames)
		.orderBy(desc(publicGames.createdAt))
		.limit(1000);
	return {
		games: result.map(({ id, createdAt, ended }) => ({
			id,
			createdAt,
			ended: ended === 1
		}))
	};
};
