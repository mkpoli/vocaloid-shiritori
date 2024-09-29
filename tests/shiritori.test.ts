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
		expect(check('さくら', 'らっぱ')).toBe('valid');
		expect(check('さくら', 'あめ')).toBe('invalid');
	});

	test('hiragana and katakana conversion', () => {
		expect(check('サクラ', 'ラッパ')).toBe('valid');
		expect(check('さくら', 'ラッパ')).toBe('valid');
	});

	test('ignoring dakuten', () => {
		expect(check('まど', 'とんぼ')).toBe('valid');
		expect(check('まど', 'どんぶり')).toBe('valid');
	});

	test('respecting dakuten', () => {
		expect(check('まど', 'とんぼ', { ignoreDakuten: false })).toBe('invalid');
		expect(check('まど', 'どんぶり', { ignoreDakuten: false })).toBe('valid');
	});

	test('stripping chouon', () => {
		expect(check('かー', 'かかと')).toBe('valid');
		expect(check('スター', 'たそがれ')).toBe('valid');
		expect(check('パーティー', 'いカメラ')).toBe('valid');
	});

	test('respecting chouon', () => {
		expect(check('かー', 'アート', { stripChouon: false })).toBe('invalid');
		expect(check('スター', 'アーム', { stripChouon: false })).toBe('valid');
		expect(check('パーティー', 'いカメラ', { stripChouon: false })).toBe('valid');
	});

	test('converting small kana', () => {
		expect(check('きゃべつ', 'つばさ')).toBe('valid');
		expect(check('きゃべつ', 'やま')).toBe('invalid');
	});

	test('normalizing zi, di, zu, du', () => {
		expect(check('はなぢ', 'ぢらい')).toBe('valid');
		expect(check('はなぢ', 'じてんしゃ')).toBe('invalid');

		expect(check('つづ', 'づうち')).toBe('valid');
		expect(check('つづ', 'ずうち')).toBe('invalid');
	});

	test('stripping di, du as si, su', () => {
		expect(check('まぢ', 'しま', { stripDiDuAsZiZu: true })).toBe('valid');
		expect(check('まづ', 'ずい', { stripDiDuAsZiZu: true })).toBe('valid');
	});

	test('normalizing wi, we, wo', () => {
		expect(check('かゐ', 'ゐるす')).toBe('valid');
		expect(check('しづゑ', 'えんと')).toBe('valid');
	});

	test('disallow words ending with ん by default', () => {
		expect(check('まんが', 'がまん')).toBe('trailing-n');
		expect(check('さくら', 'らーめん')).toBe('trailing-n');
		expect(check('ぶどう', 'うどん')).toBe('trailing-n');
	});

	test('allow words ending with ん when allowN is true', () => {
		expect(check('さくら', 'らーめん', { allowN: true })).toBe('valid');
		expect(check('ぶどう', 'うどん', { allowN: true })).toBe('valid');
		expect(check('らーめん', 'んこ', { allowN: true })).toBe('valid');
		expect(check('うどん', 'んま', { allowN: true })).toBe('valid');
	});

	test('mixed cases with allowN', () => {
		expect(check('ぱん', 'んぱん', { allowN: true })).toBe('valid');
		expect(check('ぱんだ', 'だんご', { allowN: true })).toBe('valid');
		expect(check('だんご', 'ごはん', { allowN: true })).toBe('valid');
	});

	test('edge cases', () => {
		expect(check('', '')).toBe('valid');
		expect(check('あ', 'あ')).toBe('valid');
		expect(check('ん', 'んこ')).toBe('valid');
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
