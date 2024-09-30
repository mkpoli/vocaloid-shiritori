<script lang="ts">
	import { browser, dev } from '$app/environment';
	import { check, getNextChar, DEFAULT_SHIRITORI_OPTIONS } from '$lib/shiritori';
	import type { Gamemode } from '$lib/game';
	import { find } from '$lib/vocaloid';
	import { onMount, setContext } from 'svelte';
	import Options from '$lib/game/Options.svelte';
	import WordList from './game/WordList.svelte';

	const {
		vocaloids,
		gamemode,
		username
	}: { vocaloids: Map<string, string>; gamemode: Gamemode; username: string } = $props();

	let input: HTMLInputElement;

	setContext('vocaloids', vocaloids);

	let word = $state('');
	let words: [vocaloid: string, yomigana: string, sender: 'user' | 'computer'][] = $state([]);
	let allowN = $state(DEFAULT_SHIRITORI_OPTIONS.allowN);
	let stripChouon = $state(DEFAULT_SHIRITORI_OPTIONS.stripChouon);
	let thinking = $state(false);

	const left = $derived(
		words.length == 0
			? [...vocaloids]
			: [...vocaloids]
					.filter(([vocaloid, yomigana]) => {
						const lastYomigana = words.at(-1)?.[1];
						if (!lastYomigana) {
							return true;
						}
						const nextChar = getNextChar(lastYomigana, stripChouon);
						return yomigana.startsWith(nextChar) || vocaloid.startsWith(nextChar);
					})
					.filter(([vocaloid]) => !words.some(([v]) => v === vocaloid))
					.filter(([, yomigana]) => allowN || !yomigana.endsWith('ん'))
	);

	if (dev) {
		console.log({ vocaloids });
		$effect(() => {
			console.log('left', left.length);
			if (words.length) {
				const shuffledVocaloids = [...left].sort(() => Math.random() - 0.5);
				for (const [v, y] of shuffledVocaloids) {
					console.log(`${v}（${y}）`);
				}
			}
		});
	}

	let gameOver = $derived(left.length === 0);
	$effect(() => {
		if (gameOver) {
			alert(
				`ゲームオーバー！\nスコア: ${score}` +
					(gamemode === 'computer'
						? words.at(-1)?.[2] === 'user'
							? 'あなたの勝ちです'
							: 'あなたの負けです'
						: '')
			);
			uploadScore();
		}
	});

	onMount(() => {
		if (gamemode === 'computer') {
			thinking = true;
			setTimeout(() => {
				words.push([...left[Math.floor(Math.random() * left.length)], 'computer']);
				thinking = false;
			}, 500);
		}
	});

	let score = $derived(words.filter(([, , sender]) => sender === 'user').length * 10); // TODO: Advanced scoring based on rarity and time and etc.

	async function uploadScore() {
		const score = words.filter(([, , sender]) => sender === 'user').length * 10;

		await fetch('/api/score', {
			method: 'POST',
			body: JSON.stringify({ score, username, mode: gamemode })
		});
	}

	async function terminateGame() {
		//  upload score
		const score = words.filter(([, , sender]) => sender === 'user').length * 10;

		await fetch('/api/score', {
			method: 'POST',
			body: JSON.stringify({ score, username, mode: gamemode })
		});

		location.reload();
	}

	$effect(() => {
		if (browser) {
			if (words.length) {
				input.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	});
</script>

<div class="flex items-center justify-center gap-2">
	{#if !words.length && gamemode === 'single'}
		<button
			class="rounded-md bg-slate-500 px-4 py-2 text-white hover:bg-slate-600"
			onclick={() => {
				words.push([
					...[...vocaloids].filter(([, yomigana]) => allowN || !yomigana.endsWith('ん'))[
						Math.floor(Math.random() * vocaloids.size)
					],
					'user'
				]);
			}}>ランダム・スタート</button
		>
	{:else}
		<button
			class="rounded-md border border-red-500 bg-white px-4 py-2 text-red-500 hover:bg-red-500 hover:text-white"
			onclick={async () => {
				await uploadScore();
				words = [];
				word = '';
				if (gamemode === 'computer') {
					thinking = true;
					setTimeout(() => {
						words.push([...left[Math.floor(Math.random() * left.length)], 'computer']);
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
		<div>スコア: {score}</div>
		<button
			onclick={() => {
				terminateGame();
			}}
			class="rounded-md border border-black bg-white px-4 py-2 text-black hover:bg-slate-900 hover:text-white"
			title="ゲームを終了して、スコアをランキングに登録します"
		>
			<!-- TODO: （5曲以上の場合） -->
			ゲーム終了
		</button>
	{/if}
</div>

<WordList {words} {gamemode} {thinking} {stripChouon} />

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

		switch (check(lastWord?.[1] ?? '', yomigana, { allowN, stripChouon })) {
			case 'valid':
				break;
			case 'trailing-n':
				alert('「ん」で終わる曲は追加できません');
				return;
			case 'invalid':
				alert('しりとりが成立していません');
				return;
		}

		words.push([vocaloid, yomigana, 'user']);

		if (gamemode === 'computer') {
			thinking = true;
			setTimeout(
				() => {
					words.push([...left[Math.floor(Math.random() * left.length)], 'computer']);

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
		bind:this={input}
		placeholder="ボカロ曲名を入力してください"
		class="rounded-md border border-gray-300 p-2"
	/>
	<button
		type="submit"
		class="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
		disabled={thinking}>追加</button
	><span class="text-xs text-gray-500">{left.length}曲</span>
</form>

<Options bind:allowN bind:stripChouon />
