const MAX_BODY_BYTES = 2048;
const MAX_USERNAME_LENGTH = 40;
const MAX_SONG_LENGTH = 200;
const MAX_SCORE = 1_000_000;
const WRITE_LIMIT_PER_MINUTE = 60;

export async function readJson(request: Request): Promise<unknown> {
	const declaredLength = Number(request.headers.get('content-length'));
	if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
		throw new RangeError('Request body is too large');
	}
	const body = await request.text();
	if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
		throw new RangeError('Request body is too large');
	}
	return JSON.parse(body);
}

export function username(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const normalized = value.trim();
	return normalized.length > 0 && normalized.length <= MAX_USERNAME_LENGTH ? normalized : null;
}

export function songName(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const normalized = value.trim();
	return normalized.length > 0 && normalized.length <= MAX_SONG_LENGTH ? normalized : null;
}

export function score(value: unknown): number | null {
	return typeof value === 'number' &&
		Number.isSafeInteger(value) &&
		value > 0 &&
		value <= MAX_SCORE &&
		value % 10 === 0
		? value
		: null;
}

export function scoreMode(value: unknown): 'single' | 'computer' | null {
	return value === 'single' || value === 'computer' ? value : null;
}

export function gameId(value: string | undefined): number | null {
	if (!value || !/^\d+$/.test(value)) return null;
	const parsed = Number(value);
	return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function consumeWriteBudget(db: D1Database): Promise<boolean> {
	const window = Math.floor(Date.now() / 60_000);
	const result = await db
		.prepare(
			`INSERT INTO api_rate_limits (scope, window, count)
			 VALUES ('public-write', ?, 1)
			 ON CONFLICT(scope) DO UPDATE SET
			   window = excluded.window,
			   count = CASE
			     WHEN api_rate_limits.window = excluded.window THEN api_rate_limits.count + 1
			     ELSE 1
			   END
			 WHERE api_rate_limits.window != excluded.window
			    OR api_rate_limits.count < ?
			 RETURNING count`
		)
		.bind(window, WRITE_LIMIT_PER_MINUTE)
		.first<{ count: number }>();
	return result !== null;
}

export function inputError(error: unknown): Response {
	if (error instanceof RangeError) {
		return Response.json({ message: error.message }, { status: 413 });
	}
	return Response.json({ message: 'Invalid JSON' }, { status: 400 });
}

export function rateLimitResponse(): Response {
	return Response.json(
		{ message: 'Too many requests' },
		{ status: 429, headers: { 'Retry-After': '60' } }
	);
}
