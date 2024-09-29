<script lang="ts">
	import { dev } from '$app/environment';
	import { check, checkInMap, normalize } from '$lib/shiritori';

	const { vocaloids }: { vocaloids: Map<string, string> } = $props();

	if (dev) {
		console.log({ vocaloids });
	}

	let word = $state('');
	let words: string[] = $state([]);

	function addWord(word: string) {
		words.push(word);
	}
</script>

<ul class="list-disc list-inside">
	{#each words as word}
		<li>
			{word}
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

		if (!(!lastWord || check(lastWord, word))) {
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
			addWord(vocaloid);
		}

		// TODO: Better alert
		// TODO: Show error type and context
		word = '';
	}}
>
	<input type="text" bind:value={word} placeholder="ボカロ曲名を入力してください" class="border border-gray-300 rounded-md p-2" />
	<button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">追加</button>
</form>
