import { expect, test, describe } from 'bun:test';
import { indexNextChar } from '../src/lib/shiritori';
import { check, convertSmallKana } from '$lib/shiritori';

describe('convertSmallKana', () => {
	test('should convert small kana', () => {
		expect(convertSmallKana('ぁ')).toBe('あ');
		expect(convertSmallKana('ぃ')).toBe('い');
		expect(convertSmallKana('ぅ')).toBe('う');
		expect(convertSmallKana('ぇ')).toBe('え');
		expect(convertSmallKana('ぉ')).toBe('お');
		expect(convertSmallKana('ゃ')).toBe('や');
		expect(convertSmallKana('ゅ')).toBe('ゆ');
		expect(convertSmallKana('ょ')).toBe('よ');
		expect(convertSmallKana('ゎ')).toBe('わ');

		expect(convertSmallKana('きょうしゅう')).toBe('きようしゆう');
	});
});

describe('check', () => {
	test('basic matching', () => {
		expect(check('さくら', 'らっぱ')).toBe(true);
		expect(check('さくら', 'あめ')).toBe(false);
	});

	test('hiragana and katakana conversion', () => {
		expect(check('サクラ', 'ラッパ')).toBe(true);
		expect(check('さくら', 'ラッパ')).toBe(true);
	});

	test('ignoring dakuten', () => {
		expect(check('まど', 'とんぼ')).toBe(true);
		expect(check('まど', 'どんぶり')).toBe(true);
	});

	test('respecting dakuten', () => {
		expect(check('まど', 'とんぼ', { ignoreDakuten: false })).toBe(false);
		expect(check('まど', 'どんぶり', { ignoreDakuten: false })).toBe(true);
	});

	test('stripping chouon', () => {
		expect(check('かー', 'かかと')).toBe(true);
		expect(check('スター', 'たそがれ')).toBe(true);
		expect(check('パーティー', 'いカメラ')).toBe(true);
	});

	test('respecting chouon', () => {
		expect(check('かー', 'アート', { stripChouon: false })).toBe(false);
		expect(check('スター', 'アーム', { stripChouon: false })).toBe(true);
		expect(check('パーティー', 'いカメラ', { stripChouon: false })).toBe(true);
	});

	test('converting small kana', () => {
		expect(check('きゃべつ', 'つばさ')).toBe(true);
		expect(check('きゃべつ', 'やま')).toBe(false);
	});

	test('normalizing zi, di, zu, du', () => {
		expect(check('はなぢ', 'じてんしゃ')).toBe(false);
		expect(check('はなぢ', 'ぢめん')).toBe(false);

		expect(check('つづ', 'づうち')).toBe(true);
		expect(check('つづ', 'ずうち')).toBe(false);
	});

	test('stripping di, du as si, su', () => {
		expect(check('まぢ', 'しま', { stripDiDuAsZiZu: true })).toBe(true);
		expect(check('まづ', 'ずい', { stripDiDuAsZiZu: true })).toBe(true);
	});

	test('normalizing wi, we, wo', () => {
		expect(check('かゐ', 'ゐるす')).toBe(true);
		expect(check('しづゑ', 'えんと')).toBe(true);
	});

	test('disallow words ending with ん by default', () => {
		expect(check('まんが', 'がまん')).toBe(false);
		expect(check('さくら', 'らーめん')).toBe(false);
		expect(check('ぶどう', 'うどん')).toBe(false);
	});

	test('allow words ending with ん when allowN is true', () => {
		expect(check('さくら', 'らーめん', { allowN: true })).toBe(true);
		expect(check('ぶどう', 'うどん', { allowN: true })).toBe(true);
		expect(check('らーめん', 'んこ', { allowN: true })).toBe(true);
		expect(check('うどん', 'んま', { allowN: true })).toBe(true);
	});

	test('mixed cases with allowN', () => {
		expect(check('ぱん', 'んぱん', { allowN: true })).toBe(true);
		expect(check('ぱんだ', 'だんご', { allowN: true })).toBe(true);
		expect(check('だんご', 'ごはん', { allowN: true })).toBe(true);
	});

	test('edge cases', () => {
		expect(check('', '')).toBe(true);
		expect(check('あ', 'あ')).toBe(true);
		expect(check('ん', 'んこ')).toBe(true);
	});
});

describe('indexNextChar', () => {
	test('returns last character index for normal words', () => {
		expect(indexNextChar('さくら')).toBe(2);
		expect(indexNextChar('あいうえお')).toBe(4);
	});

	test('handles words ending with chouon when stripChouon is true', () => {
		expect(indexNextChar('メロディー')).toBe(3);
		expect(indexNextChar('パーティー')).toBe(3);
	});

	test('handles words ending with chouon when stripChouon is false', () => {
		expect(indexNextChar('メロディー', false)).toBe(4);
		expect(indexNextChar('パーティー', false)).toBe(4);
	});

	test('handles words with multiple chouon at the end', () => {
		expect(indexNextChar('キャリーーー')).toBe(2);
		expect(indexNextChar('キャリーーー', false)).toBe(5);
	});

	test('handles single character words', () => {
		expect(indexNextChar('あ')).toBe(0);
		expect(indexNextChar('ー')).toBe(-1); // TODO: ここは0でいいのか？
	});

	test('handles empty strings', () => {
		expect(indexNextChar('')).toBe(-1);
	});
});
