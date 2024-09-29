const FANDOM =
	'https://raw.githubusercontent.com/blueset/vocaloid-yomigana/refs/heads/master/outcomes/fandom/fandom_safe.csv';
const HMIKU =
	'https://raw.githubusercontent.com/blueset/vocaloid-yomigana/refs/heads/master/outcomes/hmiku/hmiku.csv';
// const VOCADB = 'https://raw.githubusercontent.com/blueset/vocaloid-yomigana/refs/heads/master/outcomes/vocadb/vocadb.csv';

export async function load(): Promise<[string, string][]> {
	return (await Promise.all([FANDOM, HMIKU].map(async (url) => (await fetch(url)).text())))
		.flatMap((data) => data.split('\n').map((line) => line.split(',')))
    .map((data) => (data.length === 3 ? [data[1], data[2]] : [data[0], data[1]]))
    .map(([vocaloid, yomigana]) => [yomigana, vocaloid])
  // TODO: dedupe
}
