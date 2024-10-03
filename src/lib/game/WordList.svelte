<script lang="ts">
	import { indexNextChar } from '$lib/shiritori';
	import type { Gamemode, Sender, Word } from '$lib/game';
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
	const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	});

	let sortedWords = $derived(words.toSorted((a, b) => a.sender.createdAt - b.sender.createdAt));

	let showAll = $state(false);
</script>

{#snippet bubble(vocaloid: string, yomigana: string, sender: Sender)}
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
		title={dateFormatter.format(new Date(sender.createdAt))}
	>
		{#if !isMe && sender.type === 'user'}
			<span class="text-xs font-bold text-blue-400">
				{sender.username}
			</span>
		{/if}
		<ruby class="inline-flex gap-1 self-end">
			{vocaloid.replace(/\/.*$/, '')}
			<rt class="text-gray-400">
				{@html [...segmenter.segment(yomigana)]
					.map(({ segment }, i, arr) =>
						i === index ? `<span class="text-gray-500 font-bold">${segment}</span>` : segment
					)
					.join('')}
			</rt>
		</ruby>
	</li>
{/snippet}
<ul class="mx-auto flex w-full list-inside flex-col items-center justify-start gap-2 bg-white">
	{#if words.length <= 25}
		{#each sortedWords as { vocaloid, yomigana, sender }}
			{@render bubble(vocaloid, yomigana, sender)}
		{/each}
	{:else}
		{#each sortedWords.slice(0, 4) as { vocaloid, yomigana, sender }}
			{@render bubble(vocaloid, yomigana, sender)}
		{/each}
		{#if !showAll}
			<li class="w-max self-center rounded-md p-2 text-center" title={`全てのしりとりを表示（${words.length - 20}件）`}>
				<button class="text-gray-800 hover:text-black" onclick={() => (showAll = true)}> …… </button>
			</li>
		{:else}
			<!-- show hided words -->
			{#each sortedWords.slice(
				4,
				words.length - 20
			) as { vocaloid, yomigana, sender }}
				{@render bubble(vocaloid, yomigana, sender)}
			{/each}
		{/if}
		{#each sortedWords.slice(-20) as { vocaloid, yomigana, sender }}
			{@render bubble(vocaloid, yomigana, sender)}
		{/each}
	{/if}
	{#if thinking}
		<li class="w-max rounded-md p-2 shadow-sm">
			<Thinking />
		</li>
	{/if}
</ul>
