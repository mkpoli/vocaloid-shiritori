import { toHiragana } from 'wanakana';
import { toSeion } from 'kanadaku';

/**
 * 捨てがな（小さいカナ）を大きくする
 */
export function convertSmallKana(a: string): string {
	return a
		.replace(/ぁ/g, 'あ')
		.replace(/ぃ/g, 'い')
		.replace(/ぅ/g, 'う')
		.replace(/ぇ/g, 'え')
		.replace(/ぉ/g, 'お')
		.replace(/ゃ/g, 'や')
		.replace(/ゅ/g, 'ゆ')
		.replace(/ょ/g, 'よ')
		.replace(/ゎ/g, 'わ');
}

/**
 * しりとりのオプション
 */
export interface ShiritoriOptions {
	/** 濁点を無視するかどうか */
	ignoreDakuten: boolean;
	/** 長音を取るかどうか */
	stripChouon: boolean;
	/** 「ん」で終わる単語を許可するかどうか */
	allowN: boolean;
	/** 「ぢ」「づ」を「じ」「ず」に変換するかどうか */
	normalizeZiDiZuDu: boolean;
	/** 「ゐ」「ゑ」「を」を「い」「え」「お」に変換するかどうか */
	normalizeWiWeWo: boolean;
	/** 「ぢ」「づ」を「じ」「ず」に変換するかどうか */
	stripDiDuAsZiZu: boolean;
}

export const DEFAULT_SHIRITORI_OPTIONS: ShiritoriOptions = {
	ignoreDakuten: true,
	stripChouon: true,
	allowN: false,
	normalizeZiDiZuDu: true,
	normalizeWiWeWo: true,
	stripDiDuAsZiZu: false
};

export type ShiritoriValidity = 'valid' | 'trailing-n' | 'invalid';

/**
 * しりとりをチェックする
 * @param a 前のワード
 * @param b 次のワード
 * @param options オプション
 * @returns しりとりが成立しているかどうか
 */
export function check(
	a: string,
	b: string,
	options?: Partial<ShiritoriOptions>
): ShiritoriValidity {
	const {
		ignoreDakuten,
		stripChouon,
		allowN,
		normalizeZiDiZuDu,
		normalizeWiWeWo,
		stripDiDuAsZiZu
	} = {
		...DEFAULT_SHIRITORI_OPTIONS,
		...options
	};

	if (stripChouon) {
		a = a.replace(/ー/g, '');
		// TODO: がぁ, ーー　etc.
	}

	// カタカナをひらがなに変換
	a = toHiragana(a);
	b = toHiragana(b);

	if (!allowN && b.endsWith('ん')) {
		return 'trailing-n';
	}

	// 捨てがなを大きくする
	a = convertSmallKana(a);
	b = convertSmallKana(b);

	let lastCharA = a.slice(-1);
	let firstCharB = b.slice(0, 1);

	if (!stripDiDuAsZiZu && ignoreDakuten) {
		lastCharA = toSeion(lastCharA);
		firstCharB = toSeion(firstCharB);
	}

	if (normalizeZiDiZuDu) {
		const ZI_DI_ZU_DU = {
			ぢ: 'じ',
			づ: 'ず'
		} as const;

		lastCharA = ZI_DI_ZU_DU[lastCharA as keyof typeof ZI_DI_ZU_DU] || lastCharA;
		firstCharB = ZI_DI_ZU_DU[firstCharB as keyof typeof ZI_DI_ZU_DU] || firstCharB;

		if (stripDiDuAsZiZu && ignoreDakuten) {
			lastCharA = toSeion(lastCharA);
			firstCharB = toSeion(firstCharB);
		}
	}

	if (normalizeWiWeWo) {
		const WI_WE_WO = {
			ゐ: 'い',
			ゑ: 'え',
			を: 'お'
		} as const;
		lastCharA = WI_WE_WO[lastCharA as keyof typeof WI_WE_WO] || lastCharA;
		firstCharB = WI_WE_WO[firstCharB as keyof typeof WI_WE_WO] || firstCharB;
	}

	return !lastCharA || lastCharA === firstCharB ? 'valid' : 'invalid';
}

/**
 * 単語の次のしりとり文字の位置を取得する
 * @param word 単語
 * @param stripChouon 長音を取るかどうか
 * @returns 次の文字の位置
 */
export function indexNextChar(word: string, stripChouon: boolean = true): number {
	// const normalized = normalize(word);
	if (stripChouon && word.endsWith('ー')) {
		return word.replace(/ー+$/, '').length - 1;
	}

	return word.length - 1;
}

/**
 * 単語の次のしりとり文字を取得する
 * @param word 単語
 * @param stripChouon 長音を取るかどうか
 * @returns 次の文字
 */
export function getNextChar(word: string, stripChouon: boolean = true): string {
	return convertSmallKana(word.at(indexNextChar(word, stripChouon)) ?? '');
}

/**
 * 曲名を正規化する
 * @param word 曲名
 * @returns 正規化された曲名
 */
export function normalize(word: string): string {
	return toHiragana(word);
}
