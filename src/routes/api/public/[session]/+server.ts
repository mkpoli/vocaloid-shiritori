import { publicGameRecords } from '$lib/db/schema';
import { error, type RequestHandler } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
export const POST: RequestHandler = async ({ request, platform, params }) => {
	try {
		const DB = platform?.env?.DB;
		if (!DB) {
			throw new Error('DB not found');
		}
		const db = drizzle(DB);

		const { session } = params;
		const gameId = Number(session);

		if (isNaN(gameId)) {
			throw error(403, 'Invalid session');
		}

		const { vocaloid, username } = (await request.json()) as {
			vocaloid: string;
			username: string;
		};

		await db.insert(publicGameRecords).values({
			songName: vocaloid,
			username,
			gameId
		});

		return new Response(null, { status: 200 });
	} catch (error) {
		console.error(error);
		return new Response(null, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ platform, params }) => {
	try {
		const DB = platform?.env?.DB;
		if (!DB) {
			throw new Error('DB not found');
		}
		const db = drizzle(DB);

		const { session } = params;
		const gameId = Number(session);

		if (isNaN(gameId)) {
			throw error(403, 'Invalid session');
		}

		const records = await db
			.select()
			.from(publicGameRecords)
			.where(eq(publicGameRecords.gameId, gameId));

		return new Response(JSON.stringify({ records }), { status: 200 });
	} catch (error) {
		console.error(error);
		return new Response(null, { status: 500 });
	}
};
