// TOOD: Calculate score on server-side

import type { RequestHandler } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/d1';
import { publicGames } from '$lib/db/schema';
import { sql } from 'drizzle-orm';

// export const GET: RequestHandler = async ({ request, platform }) => {
// 	try {
// 		const DB = platform?.env?.DB;
// 		if (!DB) {
// 			throw new Error('DB not found');
// 		}
// 		const db = drizzle(platform?.env.DB);
// 		const games = await db.select().from(publicGames);

// 		return new Response(JSON.stringify(games), { status: 200 });
// 	} catch (error) {
// 		console.error(error);
// 		return new Response(null, { status: 500 });
// 	}
// };

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const { createdBy } = (await request.json()) as {
			createdBy: string;
		};
		const DB = platform?.env?.DB;
		if (!DB) {
			throw new Error('DB not found');
		}
		const db = drizzle(platform?.env.DB);

		const result = await db
			.insert(publicGames)
			.values({
				createdBy,
				ended: 0
			})
			.returning({ id: publicGames.id });
		return new Response(
			JSON.stringify({
				id: result[0].id
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error(error);
		return new Response(null, { status: 500 });
	}
};
