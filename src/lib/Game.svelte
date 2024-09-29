<script lang="ts">
	import { dev } from '$app/environment';
	import { check, normalize } from '$lib/shiritori';
	import { find } from './vocaloid';

	const { vocaloids }: { vocaloids: Map<string, string> } = $props();

	if (dev) {
		console.log({ vocaloids });
	}

	const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });

	let word = $state('');
	let words: [vocaloid: string, yomigana: string][] = $state([]);
</script>

{#if !words.length}
	<button
		class="bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600"
		onclick={() => {
			words.push([...vocaloids][Math.floor(Math.random() * vocaloids.size)]);
		}}>ランダム・スタート</button
	>
{:else if words.length === 1}
	<button
		class="bg-white text-red-500 px-4 py-2 rounded-md hover:bg-red-500 hover:text-white border-red-500 border-2"
		onclick={() => {
			words = [];
			word = '';
		}}
	>
		再スタート
	</button>
{/if}

<ul class="list-disc list-inside">
	{#each words as [vocaloid, yomigana]}
		<li>
			<ruby class="inline-flex">
				{vocaloid}
				<rt class="text-gray-400">
					{@html [...segmenter.segment(yomigana)]
						.map(({ segment }, i, arr) =>
							i === arr.length - 1
								? `<span class="text-gray-500 font-bold">${segment}</span>`
								: segment
						)
						.join('')}
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

		const entry = find(vocaloids, word);
		if (dev) {
			console.info('Vocaloid entry:', entry);
		}
		if (!entry) {
			alert('その曲名は存在しません');
			return;
		}

		const [yomigana, vocaloid] = entry;
		if (
			!(
				!lastWord ||
				check(lastWord[0], word) ||
				check(lastWord[0], yomigana) ||
				check(lastWord[0], vocaloid)
			)
		) {
			alert('その曲名はしりとりのルール違反です');
			return;
		}

		words.push([vocaloid, yomigana]);

		// TODO: Better alert
		// TODO: Show error type and context
		word = '';
	}}
>
	<input
		type="text"
		bind:value={word}
		placeholder="ボカロ曲名を入力してください"
		class="border border-gray-300 rounded-md p-2"
	/>
	<button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
		>追加</button
	>
</form>
