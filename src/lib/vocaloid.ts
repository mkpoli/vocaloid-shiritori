import { normalize } from './shiritori';

const FANDOM =
	'https://raw.githubusercontent.com/blueset/vocaloid-yomigana/refs/heads/master/outcomes/fandom/fandom_safe.csv';
const HMIKU =
	'https://raw.githubusercontent.com/blueset/vocaloid-yomigana/refs/heads/master/outcomes/hmiku/hmiku.csv';
// const VOCADB = 'https://raw.githubusercontent.com/blueset/vocaloid-yomigana/refs/heads/master/outcomes/vocadb/vocadb.csv';

export async function load(): Promise<[string, string][]> {
	return (await Promise.all([FANDOM, HMIKU].map(async (url) => (await fetch(url)).text())))
		.flatMap((data) => data.split('\n').map((line) => line.split(',')))
		.map(
			(data) => (data.length === 3 ? [data[1], data[2]] : [data[0], data[1]]) as [string, string]
		)
		.filter(([, yomigana]) => yomigana)
		.filter(([, yomigana]) => !/\p{sc=Han}/u.test(yomigana)) // TODO: Why is this filter not working?
		.filter(([, yomigana]) => !/\p{sc=Latn}[^\p{L}]*$/u.test(yomigana)); // TODO: Find a better way to convert latn words to hiragana rather than simply ignoring them
	// TODO: dedupe
}

/**
 * ボカロ曲名のマップに曲名が存在するかどうかをチェックする
 * @param map ボカロ曲名のマップ
 * @param word 曲名
 * @returns 曲名がマップに存在するかどうか
 */
export function find(map: Map<string, string>, word: string): [string, string] | undefined {
	const normalized = normalize(word);
	return [...map.entries()].find(
		([vocaloid, yomigana]) => yomigana === normalized || vocaloid === word
	);
}
