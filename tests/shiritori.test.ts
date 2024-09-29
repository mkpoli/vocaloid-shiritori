import { expect, test, describe } from 'bun:test';
import { check, convertSmallKana, indexNextChar, getNextChar } from '$lib/shiritori';

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

	test('handles words ending with punctuation', () => {
		expect(indexNextChar('あいうえお。')).toBe(4);
	});

	test('handles single character words', () => {
		expect(indexNextChar('あ')).toBe(0);
		expect(indexNextChar('ー')).toBe(0);
	});

	test('handles empty strings', () => {
		expect(indexNextChar('')).toBe(-1);
	});
});

describe('getNextChar', () => {
	test('returns last character for normal words', () => {
		expect(getNextChar('さくら')).toBe('ら');
		expect(getNextChar('あいうえお')).toBe('お');
		expect(getNextChar('ボカロ')).toBe('ろ');
	});

	test('handles words ending with chouon when stripChouon is true (default)', () => {
		expect(getNextChar('メロディー')).toBe('い');
		expect(getNextChar('パーティー')).toBe('い');
		expect(getNextChar('スマートフォン')).toBe('ん');
	});

	test('handles words ending with chouon when stripChouon is false', () => {
		expect(getNextChar('メロディー', false)).toBe('ー');
		expect(getNextChar('パーティー', false)).toBe('ー');
		expect(getNextChar('スマートフォン', false)).toBe('ん');
	});

	test('handles words with multiple chouon at the end', () => {
		expect(getNextChar('キャリーーー')).toBe('い');
		expect(getNextChar('キャリーーー', false)).toBe('ー');
	});

	test('handles single character words', () => {
		expect(getNextChar('あ')).toBe('あ');
		expect(getNextChar('ー')).toBe('');
	});

	test('handles words with chouon in the middle', () => {
		expect(getNextChar('カーテン')).toBe('ん');
		expect(getNextChar('スーパー')).toBe('あ');
	});

	test('handles empty strings', () => {
		expect(getNextChar('')).toBe('');
	});

	test('handles words with small kana', () => {
		expect(getNextChar('きゃ')).toBe('や');
		expect(getNextChar('しゅ')).toBe('う');
		expect(getNextChar('ちょ')).toBe('よ');
	});

	test('handles words ending with small kana', () => {
		expect(getNextChar('いぇーい')).toBe('い');
		expect(getNextChar('ウォッチ')).toBe('ち');
	});

	test('handles words with non-Japanese characters', () => {
		expect(getNextChar('Hello')).toBe('o');
		expect(getNextChar('ハローWorld')).toBe('d');
	});

	test('handles words with Japanese punctuation', () => {
		expect(getNextChar('こんにちは。')).toBe('は');
		expect(getNextChar('さようなら！')).toBe('ら');
	});

	test('handles words ending with different vowels followed by chouon', () => {
		expect(getNextChar('トマトー')).toBe('お');
		expect(getNextChar('カレー')).toBe('え');
		expect(getNextChar('パーティー')).toBe('い');
		expect(getNextChar('ドアー')).toBe('あ');
		expect(getNextChar('シチュー')).toBe('う');
	});
});
