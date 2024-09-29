<script lang="ts">
	import { dev } from '$app/environment';
	import { check, indexNextChar } from '$lib/shiritori';
	import { find } from './vocaloid';

	const { vocaloids }: { vocaloids: Map<string, string> } = $props();

	const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });

	let word = $state('');
	let words: [vocaloid: string, yomigana: string][] = $state([]);
	let allowN = $state(false);

	const left = $derived(
		[...vocaloids]
			.filter(([, yomigana]) => yomigana.startsWith(words.at(-1)?.at(-1)?.at(-1) ?? ''))
			.filter(([vocaloid]) => !words.some(([v]) => v === vocaloid))
			.filter(([, yomigana]) => allowN || !yomigana.endsWith('ん'))
	);

	if (dev) {
		console.log({ vocaloids });
		$effect(() => {
			console.log({ left, words });
		});
	}
</script>

{#if !words.length}
	<button
		class="bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600"
		onclick={() => {
			words.push(
				[...vocaloids].filter(([, yomigana]) => allowN || !yomigana.endsWith('ん'))[
					Math.floor(Math.random() * vocaloids.size)
				]
			);
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
		{@const index = indexNextChar(yomigana)}
		<li>
			<ruby class="inline-flex">
				{vocaloid}
				<rt class="text-gray-400">
					{@html [...segmenter.segment(yomigana)]
						.map(({ segment }, i, arr) =>
							i === index ? `<span class="text-gray-500 font-bold">${segment}</span>` : segment
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

		const [vocaloid, yomigana] = entry;
		if (
			!(
				!lastWord ||
				check(lastWord[0], word, {
					allowN
				}) ||
				check(lastWord[0], yomigana, {
					allowN
				}) ||
				check(lastWord[0], vocaloid, {
					allowN
				})
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
	><span class="text-gray-500 text-xs">{left.length}曲</span>
</form>

<div>
	<input type="checkbox" bind:checked={allowN} id="allowN" />
	<label for="allowN"
		>「ん」で終わることを許します（<span title="んで始まる曲"
			>{[...vocaloids].filter(([, yomigana]) => yomigana.startsWith('ん')).length}</span
		>対<span title="んで終わる曲"
			>{[...vocaloids].filter(([, yomigana]) => yomigana.endsWith('ん')).length}</span
		>曲）</label
	>
</div>
