import { publicGameRecords, publicGames } from '$lib/db/schema';
import {
	consumeWriteBudget,
	gameId,
	inputError,
	rateLimitResponse,
	readJson,
	songName,
	username
} from '$lib/server/api-security';
import type { RequestHandler } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

const MAX_GAME_RECORDS = 250;

export const POST: RequestHandler = async ({ request, platform, params }) => {
	const DB = platform?.env?.DB;
	if (!DB) return Response.json({ message: 'Database unavailable' }, { status: 503 });
	const session = gameId(params.session);
	if (!session) return Response.json({ message: 'Invalid session' }, { status: 400 });

	let input: unknown;
	try {
		input = await readJson(request);
	} catch (error) {
		return inputError(error);
	}
	const vocaloid =
		typeof input === 'object' && input !== null && 'vocaloid' in input
			? songName(input.vocaloid)
			: null;
	const submittedBy =
		typeof input === 'object' && input !== null && 'username' in input
			? username(input.username)
			: null;
	if (!vocaloid || !submittedBy) {
		return Response.json({ message: 'Invalid game record' }, { status: 400 });
	}

	try {
		const db = drizzle(DB);
		const [game] = await db
			.select({ ended: publicGames.ended })
			.from(publicGames)
			.where(eq(publicGames.id, session))
			.limit(1);
		if (!game) return Response.json({ message: 'Game not found' }, { status: 404 });
		if (game.ended) return Response.json({ message: 'Game has ended' }, { status: 409 });
		if (!(await consumeWriteBudget(DB))) return rateLimitResponse();

		await db.insert(publicGameRecords).values({
			songName: vocaloid,
			username: submittedBy,
			gameId: session
		});
		return new Response(null, { status: 201 });
	} catch (error) {
		console.error(error);
		return Response.json({ message: 'Failed to insert record' }, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ platform, params }) => {
	const DB = platform?.env?.DB;
	if (!DB) return Response.json({ message: 'Database unavailable' }, { status: 503 });
	const session = gameId(params.session);
	if (!session) return Response.json({ message: 'Invalid session' }, { status: 400 });

	try {
		const db = drizzle(DB);
		const records = await db
			.select()
			.from(publicGameRecords)
			.where(eq(publicGameRecords.gameId, session))
			.orderBy(desc(publicGameRecords.createdAt), desc(publicGameRecords.id))
			.limit(MAX_GAME_RECORDS);
		return Response.json(
			{ records: records.reverse() },
			{ headers: { 'Cache-Control': 'private, max-age=1' } }
		);
	} catch (error) {
		console.error(error);
		return Response.json({ message: 'Failed to retrieve records' }, { status: 500 });
	}
};
