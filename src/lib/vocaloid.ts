import { normalize } from './shiritori';

const FANDOM =
	'https://raw.githubusercontent.com/blueset/vocaloid-yomigana/refs/heads/master/outcomes/fandom/fandom_safe.csv';
const HMIKU =
	'https://raw.githubusercontent.com/blueset/vocaloid-yomigana/refs/heads/master/outcomes/hmiku/hmiku.csv';
// const VOCADB = 'https://raw.githubusercontent.com/blueset/vocaloid-yomigana/refs/heads/master/outcomes/vocadb/vocadb.csv';

const MANUAL_PATCH: [string, string][] = [
	['空想フォレスト', 'くうそうフォレスト'],
	['Ievan Polkka', 'いえゔぁんぽるっか']
];

export async function load(): Promise<[string, string][]> {
	return (await Promise.all([FANDOM, HMIKU].map(async (url) => (await fetch(url)).text())))
		.flatMap((data) => data.split('\n').map((line) => line.split(',')))
		.map(
			(data) => (data.length === 3 ? [data[1], data[2]] : [data[0], data[1]]) as [string, string]
		)
		.concat(MANUAL_PATCH)
		.filter(([, yomigana]) => yomigana)
		.filter(([, yomigana]) => !/\p{sc=Han}/u.test(yomigana)) // TODO: Why is this filter not working?
		.filter(([, yomigana]) => !/\p{sc=Latn}[^\p{L}]*$/u.test(yomigana)); // TODO: Find a better way to convert latn words to hiragana rather than simply ignoring them
}

/**
 * ボカロ曲名のマップから曲名を検索する
 * @param map ボカロ曲名のマップ
 * @param word 曲名
 * @returns 曲名がマップに存在する場合は曲名とひらがなを返す
 */
export function find(map: Map<string, string>, word: string, ignorePunctuations = true): [string, string] | undefined {
	let normalized = normalize(word);
	if (ignorePunctuations) {
		normalized = normalized.replace(/[\p{Punctuation}\p{Separator}]/gu, '');
	}
	return [...map.entries()].find(
		([vocaloid, yomigana]) => {
			if (ignorePunctuations) {
				vocaloid = vocaloid.replace(/[\p{Punctuation}\p{Separator}]/gu, '');
				word = word.replace(/[\p{Punctuation}\p{Separator}]/gu, '').replace(/\/.*$/, '');
			}
			return yomigana === normalized || vocaloid === word || vocaloid.replace(/\/.+$/, '') === word;
		}
	);
}
