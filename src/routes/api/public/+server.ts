import { publicGames } from '$lib/db/schema';
import {
	consumeWriteBudget,
	inputError,
	rateLimitResponse,
	readJson,
	username
} from '$lib/server/api-security';
import type { RequestHandler } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/d1';

export const POST: RequestHandler = async ({ request, platform }) => {
	const DB = platform?.env?.DB;
	if (!DB) return Response.json({ message: 'Database unavailable' }, { status: 503 });

	let input: unknown;
	try {
		input = await readJson(request);
	} catch (error) {
		return inputError(error);
	}
	const createdBy =
		typeof input === 'object' && input !== null && 'createdBy' in input
			? username(input.createdBy)
			: null;
	if (!createdBy) return Response.json({ message: 'Invalid username' }, { status: 400 });

	try {
		if (!(await consumeWriteBudget(DB))) return rateLimitResponse();
		const db = drizzle(DB);
		const [result] = await db
			.insert(publicGames)
			.values({ createdBy, ended: 0 })
			.returning({ id: publicGames.id });
		return Response.json({ id: result.id }, { status: 201 });
	} catch (error) {
		console.error(error);
		return Response.json({ message: 'Failed to create game' }, { status: 500 });
	}
};
