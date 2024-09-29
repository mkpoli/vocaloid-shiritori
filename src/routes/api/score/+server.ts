// TOOD: Calculate score on server-side

import type { RequestHandler } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/d1';
import { scores } from '$lib/db/schema';

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
		return new Response(null, { status: 200 });
	} catch (error) {
		console.error(error);
		return new Response(null, { status: 500 });
	}
};
