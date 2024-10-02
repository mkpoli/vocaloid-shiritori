<script lang="ts">
	import { indexNextChar } from '$lib/shiritori';
	import type { Gamemode, Word } from '$lib/game';
	import Thinking from '$lib/Thinking.svelte';
	import { userManager } from '$lib/user.svelte';

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
	{#each words as { vocaloid, yomigana, sender }}
		{@const index = indexNextChar(yomigana, stripChouon)}
		{@const isMe = sender.type === 'user' && sender.username === userManager.username}
		<li
			class="flex w-max flex-col rounded-md px-3 py-2 shadow-sm"
			class:self-start={(gamemode === 'computer' && sender.type === 'computer') ||
				(gamemode === 'public' && !isMe)}
			class:bg-blue-50={(gamemode === 'computer' && sender.type === 'computer') ||
				(gamemode === 'public' && !isMe)}
			class:self-end={(gamemode === 'computer' && sender.type === 'user') ||
				(gamemode === 'public' && isMe)}
			class:bg-green-50={(gamemode === 'computer' && sender.type === 'user') ||
				(gamemode === 'public' && isMe)}
			class:self-center={gamemode === 'single'}
			class:bg-gray-50={gamemode === 'single'}
			class:justify-start={gamemode === 'public' && !isMe}
			class:justify-end={gamemode === 'public' && isMe}
			class:items-end={gamemode === 'public' && isMe}
			class:items-start={gamemode === 'public' && !isMe}
			title={sender.createdAt.toString()}
		>
			{#if !isMe && sender.type === 'user'}
				<span class="text-xs font-bold text-blue-400">
					{sender.username}
				</span>
			{/if}
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
