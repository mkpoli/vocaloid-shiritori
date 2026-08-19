import { scores } from '$lib/db/schema';
import {
	consumeWriteBudget,
	inputError,
	rateLimitResponse,
	readJson,
	score,
	scoreMode,
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
	const submittedScore =
		typeof input === 'object' && input !== null && 'score' in input ? score(input.score) : null;
	const submittedBy =
		typeof input === 'object' && input !== null && 'username' in input
			? username(input.username)
			: null;
	const mode =
		typeof input === 'object' && input !== null && 'mode' in input ? scoreMode(input.mode) : null;
	if (!submittedScore || !submittedBy || !mode) {
		return Response.json({ message: 'Invalid score' }, { status: 400 });
	}

	try {
		if (!(await consumeWriteBudget(DB))) return rateLimitResponse();
		const db = drizzle(DB);
		await db.insert(scores).values({ score: submittedScore, username: submittedBy, mode });
		const rankResult = await DB.prepare(
			`SELECT COUNT(*) + 1 AS rank
			 FROM (
			   SELECT 1 FROM scores
			   WHERE mode = ? AND score > ?
			   LIMIT 100
			 )`
		)
			.bind(mode, submittedScore)
			.first<{ rank: number }>();
		return Response.json({ rank: rankResult?.rank ?? 0 }, { status: 201 });
	} catch (error) {
		console.error(error);
		return Response.json({ message: 'Failed to store score' }, { status: 500 });
	}
};
