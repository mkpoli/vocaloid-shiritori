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

export interface ShiritoriOptions {
	ignoreDakuten: boolean;
	stripChouon: boolean;
	allowN: boolean;
	normalizeZiDiZuDu: boolean;
	normalizeWiWeWo: boolean;
	stripDiDuAsZiZu: boolean;
}

/**
 * しりとりをチェックする
 * @param a 前のワード
 * @param b 次のワード
 * @param ignoreDakuten 濁点を無視するかどうか（trueの場合は濁点を無視して例えば「さぎ」は「き」として扱う、falseの場合は「さぎ」は「ぎ」として扱う）
 * @param stripChouon 長音を取るかどうか（trueの場合は長音を無視して例えば「キー」は「き」として扱う、falseの場合は「キー」は「い」として扱う）
 * @param normalizeZiDiZuDu 「ぢ」「づ」を「じ」「ず」に変換するかどうか
 * @param normalizeWiWeWo 「ゐ」「ゑ」「を」を「い」「え」「お」に変換するかどうか
 * @param stripDiDuAsZiZu 「ぢ」「づ」を「じ」「ず」に変換するかどうか
 * @returns しりとりが成立しているかどうか
 */
export function check(
	a: string,
	b: string,

	options?: Partial<ShiritoriOptions>
): boolean {
	const {
		ignoreDakuten = true,
		stripChouon = true,
		allowN = false,
		normalizeZiDiZuDu = true,
		normalizeWiWeWo = true,
		stripDiDuAsZiZu = false
	} = options ?? {};

	if (stripChouon) {
		a = a.replace(/ー/g, '');
		// TODO: がぁ, ーー　etc.
	}

	// カタカナをひらがなに変換
	a = toHiragana(a);
	b = toHiragana(b);

	if (!allowN && b.endsWith('ん')) {
		return false;
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

	return lastCharA === firstCharB;
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
 * 曲名を正規化する
 * @param word 曲名
 * @returns 正規化された曲名
 */
export function normalize(word: string): string {
	return toHiragana(word);
}
