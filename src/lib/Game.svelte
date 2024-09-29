<script lang="ts">
	import { dev } from '$app/environment';
	import { check, getNextChar, indexNextChar } from '$lib/shiritori';
	import type { Gamemode } from '$lib/game';
	import { find } from '$lib/vocaloid';
	import { onMount } from 'svelte';
	import Thinking from '$lib/Thinking.svelte';

	const { vocaloids, gamemode }: { vocaloids: Map<string, string>; gamemode: Gamemode } = $props();
	const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });

	let word = $state('');
	let words: [vocaloid: string, yomigana: string][] = $state([]);
	let allowN = $state(false);
	let thinking = $state(false);

	const left = $derived(
		words.length == 0
			? [...vocaloids]
			: [...vocaloids]
					.filter(([vocaloid, yomigana]) => {
						const lastYomigana = words.at(-1)?.at(-1);
						if (!lastYomigana) {
							return true;
						}
						const nextChar = getNextChar(lastYomigana, allowN);
						return yomigana.startsWith(nextChar) || vocaloid.startsWith(nextChar);
					})
					.filter(([vocaloid]) => !words.some(([v]) => v === vocaloid))
					.filter(([, yomigana]) => allowN || !yomigana.endsWith('ん'))
	);

	if (dev) {
		console.log({ vocaloids });
		$inspect(left);
	}

	let gameOver = $derived(left.length === 0);
	$effect(() => {
		if (gameOver) {
			alert('ゲームオーバー');
		}
	});

	onMount(() => {
		if (gamemode === 'computer') {
			thinking = true;
			setTimeout(() => {
				words.push(left[Math.floor(Math.random() * left.length)]);
				thinking = false;
			}, 500);
		}
	});
</script>

{#if !words.length && gamemode === 'single'}
	<button
		class="rounded-md bg-slate-500 px-4 py-2 text-white hover:bg-slate-600"
		onclick={() => {
			words.push(
				[...vocaloids].filter(([, yomigana]) => allowN || !yomigana.endsWith('ん'))[
					Math.floor(Math.random() * vocaloids.size)
				]
			);
		}}>ランダム・スタート</button
	>
{:else}
	<button
		class="rounded-md border-2 border-red-500 bg-white px-4 py-2 text-red-500 hover:bg-red-500 hover:text-white"
		onclick={() => {
			words = [];
			word = '';
			if (gamemode === 'computer') {
				thinking = true;
				setTimeout(() => {
					words.push(left[Math.floor(Math.random() * left.length)]);
					thinking = false;
				}, 500);
			}
		}}
	>
		{#if gamemode !== 'computer' && words.length === 1}
			再スタート
		{:else}
			リセット
		{/if}
	</button>
{/if}

<ul class="mx-auto w-max list-inside list-disc text-left">
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
	{#if thinking}
		<li>
			<Thinking />
		</li>
	{/if}
</ul>
<form
	class="flex items-center justify-center gap-2"
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

		switch (check(lastWord?.at(-1) ?? '', yomigana, { allowN })) {
			case 'valid':
				break;
			case 'trailing-n':
				alert('「ん」で終わる曲は追加できません');
				return;
			case 'invalid':
				alert('しりとりが成立していません');
				return;
		}

		words.push([vocaloid, yomigana]);

		if (gamemode === 'computer') {
			thinking = true;
			setTimeout(
				() => {
					words.push(left[Math.floor(Math.random() * left.length)]);

					thinking = false;
				},
				1000 + Math.random() * 500
			);
		}

		// TODO: Better alert
		// TODO: Show error type and context
		word = '';
	}}
>
	<input
		type="text"
		bind:value={word}
		placeholder="ボカロ曲名を入力してください"
		class="rounded-md border border-gray-300 p-2"
	/>
	<button
		type="submit"
		class="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
		disabled={thinking}>追加</button
	><span class="text-xs text-gray-500">{left.length}曲</span>
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
