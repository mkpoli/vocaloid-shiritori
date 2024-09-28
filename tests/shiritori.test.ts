import { expect, test, describe } from 'bun:test';

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
		expect(check('まど', 'とんぼ', false)).toBe(false);
		expect(check('まど', 'どんぶり', false)).toBe(true);
	});

	test('stripping chouon', () => {
		expect(check('かー', 'かかと')).toBe(true);
		expect(check('スター', 'たそがれ')).toBe(true);
		expect(check('パーティー', 'いカメラ')).toBe(true);
	});

	test('respecting chouon', () => {
    expect(check('かー', 'アート', true, false)).toBe(false);
    expect(check('スター', 'アーム', true, false)).toBe(true);
    expect(check('パーティー', 'いカメラ', true, false)).toBe(true);
	});

	test('converting small kana', () => {
		expect(check('きゃべつ', 'つばさ')).toBe(true);
		expect(check('きゃべつ', 'やま')).toBe(false);
	});

  test('normalizing zi, di, zu, du', () => {
    expect(check('はなぢ', 'じてんしゃ')).toBe(false);
    expect(check('はなぢ', 'ぢめん')).toBe(false);

    expect(check('つづ', "づうち")).toBe(true);
    expect(check('つづ', "ずうち")).toBe(false);
  })

  test('stripping di, du as si, su', () => {
    expect(check('まぢ', 'しま', true, true, true, true, false, true)).toBe(true);
    expect(check('まづ', 'ずい', true, true, true, true, false, true)).toBe(true);
  })

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
		expect(check('さくら', 'らーめん', true, true, true)).toBe(true);
		expect(check('ぶどう', 'うどん', true, true, true)).toBe(true);
		expect(check('らーめん', 'んこ', true, true, true)).toBe(true);
		expect(check('うどん', 'んま', true, true, true)).toBe(true);
	});

	test('mixed cases with allowN', () => {
		expect(check('ぱん', 'んぱん', true, true, true)).toBe(true);
		expect(check('ぱんだ', 'だんご', true, true, true)).toBe(true);
		expect(check('だんご', 'ごはん', true, true, true)).toBe(true);
	});

	test('edge cases', () => {
		expect(check('', '')).toBe(true);
		expect(check('あ', 'あ')).toBe(true);
		expect(check('ん', 'んこ')).toBe(true);
	});
});
