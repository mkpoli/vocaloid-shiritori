<script lang="ts">
	import { indexNextChar } from '$lib/shiritori';
	import type { Gamemode, Word } from '$lib/game';
	import Thinking from '$lib/Thinking.svelte';

	let {
		words,
		gamemode,
		thinking,
		stripChouon
	}: {
		words: Word[];
		gamemode: Gamemode;
		thinking: boolean;
		stripChouon: boolean;
	} = $props();

	const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });
</script>

<ul class="mx-auto flex w-full list-inside flex-col items-center justify-start gap-2 bg-white">
	{#each words as {vocaloid, yomigana, sender}}
		{@const index = indexNextChar(yomigana, stripChouon)}
		<li
			class="w-max rounded-md px-3 py-2 shadow-sm"
			class:self-start={gamemode !== 'single' && sender.type === 'computer'}
			class:bg-blue-50={gamemode !== 'single' && sender.type === 'computer'}
			class:self-end={gamemode !== 'single' && sender.type === 'user'}
			class:bg-green-50={gamemode !== 'single' && sender.type === 'user'}
			class:self-center={gamemode === 'single'}
			class:bg-gray-50={gamemode === 'single'}
		>
			<ruby class="inline-flex gap-1 self-end">
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
	{#if thinking}
		<li class="w-max rounded-md p-2 shadow-sm">
			<Thinking />
		</li>
	{/if}
</ul>
