<script lang="ts">
	import { dev } from '$app/environment';
	import { check, checkInMap, normalize } from '$lib/shiritori';

	const { vocaloids }: { vocaloids: Map<string, string> } = $props();

	if (dev) {
		console.log({ vocaloids });
	}

  const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });

	let word = $state('');
	let words: [vocaloid: string, yomigana: string][] = $state([]);
</script>

<ul class="list-disc list-inside">
	{#each words as [vocaloid, yomigana]}
		<li>
      <ruby class="inline-flex">
        {vocaloid}
        <rt class="text-gray-400">
          {@html [...segmenter.segment(yomigana)].map(({ segment }, i, arr) => i === arr.length - 1 ? `<span class="text-gray-500 font-bold">${segment}</span>` : segment).join('')}
        </rt>
      </ruby>
		</li>
	{/each}
</ul>

<form
  class="flex gap-2 items-center justify-center"
	onsubmit={(e) => {
		e.preventDefault();

		if (dev) {
			console.info('User input:', word);
		}

		if (!word) {
			alert('曲名を入力してください');
			return;
		}

		const lastWord = words.at(-1);
		if (dev) {
			console.info('Last word:', lastWord);
		}

		if (!(!lastWord || check(lastWord[0], word))) {
			alert('その曲名はしりとりのルール違反です');
			return;
		}

		if (!checkInMap(vocaloids, word)) {
			alert('その曲名は存在しません');
			return;
		}

		if (dev) {
			console.info('Vocaloid:', vocaloids.get(normalize(word)));
		}

		const vocaloid = vocaloids.get(normalize(word));
		if (vocaloid) {
			words.push([vocaloid, normalize(word)]);
		}

		// TODO: Better alert
		// TODO: Show error type and context
		word = '';
	}}
>
	<input type="text" bind:value={word} placeholder="ボカロ曲名を入力してください" class="border border-gray-300 rounded-md p-2" />
	<button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">追加</button>
</form>
