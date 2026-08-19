import { describe, expect, it } from 'bun:test';
import {
	consumeWriteBudget,
	gameId,
	readJson,
	score,
	scoreMode,
	songName,
	username
} from './api-security';

describe('public API boundaries', () => {
	it('accepts bounded fields', () => {
		expect(username(' user ')).toBe('user');
		expect(songName(' song ')).toBe('song');
		expect(score(100)).toBe(100);
		expect(scoreMode('single')).toBe('single');
		expect(gameId('42')).toBe(42);
	});

	it('rejects malformed fields', () => {
		expect(username('')).toBeNull();
		expect(songName('x'.repeat(201))).toBeNull();
		expect(score(11)).toBeNull();
		expect(scoreMode('public')).toBeNull();
		expect(gameId('-1')).toBeNull();
	});

	it('rejects an oversized body before parsing', async () => {
		const request = new Request('https://example.test', {
			method: 'POST',
			body: JSON.stringify({ value: 'x'.repeat(2048) })
		});
		await expect(readJson(request)).rejects.toBeInstanceOf(RangeError);
	});

	it('uses one fixed quota row with a 60-request ceiling', async () => {
		let sql = '';
		let bindings: unknown[] = [];
		const db = {
			prepare(statement: string) {
				sql = statement;
				return {
					bind(...values: unknown[]) {
						bindings = values;
						return this;
					},
					async first() {
						return { count: 1 };
					}
				};
			}
		} as unknown as D1Database;

		expect(await consumeWriteBudget(db)).toBe(true);
		expect(sql).toContain("VALUES ('public-write', ?, 1)");
		expect(bindings[1]).toBe(60);
	});
});
