import { drizzle } from 'drizzle-orm/d1';
import type { PageServerLoad } from './$types';

import { scores } from '$lib/db/schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ platform }) => {
	const DB = platform?.env?.DB;
	if (!DB) {
		throw new Error('DB not found');
	}
	const db = drizzle(DB);
	const result = await db.select().from(scores).orderBy(desc(scores.score));
	return {
		scores: result
	};
};
