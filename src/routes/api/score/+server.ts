// TOOD: Calculate score on server-side

import type { RequestHandler } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/d1';
import { scores } from '$lib/db/schema';
import { sql } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const { score, username, mode } = (await request.json()) as {
			score: number;
			username: string;
			mode: string;
		};
		const DB = platform?.env?.DB;
		if (!DB) {
			throw new Error('DB not found');
		}
		const db = drizzle(platform?.env.DB);

		await db.insert(scores).values({
			score,
			username,
			mode
		});
		// TODO: Calculate rank
		const [rankResult] = await db
			.select({ rank: sql<number>`ROW_NUMBER() OVER (ORDER BY score DESC)` })
			.from(scores)
			.where(sql`${scores.mode} = ${mode}`)
			.orderBy(scores.score)
			.limit(1);
		const rank = rankResult?.rank ?? 0;
		return new Response(
			JSON.stringify({
				rank
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error(error);
		return new Response(null, { status: 500 });
	}
};
