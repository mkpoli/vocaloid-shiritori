<script lang="ts">
	import { browser, dev } from '$app/environment';
	import { check, getNextChar, DEFAULT_SHIRITORI_OPTIONS, normalize } from '$lib/shiritori';
	import type { Gamemode, Word } from '$lib/game';
	import { find } from '$lib/vocaloid';
	import { onMount, setContext } from 'svelte';
	import Options from '$lib/game/Options.svelte';
	import WordList from './game/WordList.svelte';
	import EndScreen from './game/EndScreen.svelte';
	import { error } from '@sveltejs/kit';

	const {
		vocaloids,
		gamemode,
		username,
		words: initialWords = [],
		gameId = undefined,
		ended = false
	}: {
		vocaloids: Map<string, string>;
		gamemode: Gamemode;
		username: string;
		words?: Word[];
		gameId?: number;
		ended?: boolean;
	} = $props();

	if (gamemode === 'public' && !gameId) {
		throw error(403, 'Game ID is required for public mode');
	}

	let input: HTMLInputElement;

	setContext('vocaloids', vocaloids);

	let word = $state('');
	let words: Word[] = $state(initialWords);
	let thinking = $state(false);

	// Options
	let allowN = $state(DEFAULT_SHIRITORI_OPTIONS.allowN);
	let stripChouon = $state(DEFAULT_SHIRITORI_OPTIONS.stripChouon);
	let ignorePunctuations = $state(DEFAULT_SHIRITORI_OPTIONS.ignorePunctuations);

	const left = $derived(
		(words.length == 0
			? [...vocaloids]
			: [...vocaloids].filter(([vocaloid, yomigana]) => {
					const lastYomigana = words.at(-1)?.yomigana;
					if (!lastYomigana) {
						return true;
					}
					const nextChar = getNextChar(lastYomigana, stripChouon);
					return yomigana.startsWith(nextChar) || vocaloid.startsWith(nextChar);
				})
				.filter(([vocaloid]) => !words.some(({ vocaloid: v }) => v === vocaloid))
		)
			.filter(([, yomigana]) => allowN || !yomigana.endsWith('ん'))
	);

	if (dev) {
		console.info({ vocaloids });
		$effect(() => {
			console.info('left', left.length);
			if (words.length) {
				const shuffledVocaloids = [...left].sort(() => Math.random() - 0.5);
				for (const [v, y] of shuffledVocaloids) {
					console.info(`${v}（${y}）`);
				}
			}
		});
	}

	let gameOver = $state(false);

	$effect(() => {
		if (left.length === 0) {
			gameOver = true;
		}
	});
	// $derived(left.length === 0);
	$effect(() => {
		if (gameOver) {
			uploadScore().then((res) => {
				rank = res;
			});
		}
	});

	onMount(() => {
		if (gamemode === 'computer') {
			thinking = true;
			setTimeout(() => {
				const [vocaloid, yomigana] = left[Math.floor(Math.random() * left.length)];

				words.push({ vocaloid, yomigana, sender: { type: 'computer', createdAt: Date.now() } });
				thinking = false;
			}, 500);
		}

		if (gamemode === 'public') {
			setInterval(async () => {
				words = await fetchNewRecords();
			}, 1000);
		}
	});

	let score = $derived(words.filter(({ sender }) => sender.type === 'user').length * 10); // TODO: Advanced scoring based on rarity and time and etc.

	async function uploadScore(): Promise<number> {
		if (gamemode === 'public') {
			return 0;
		}
		const score = words.filter(({ sender }) => sender.type === 'user').length * 10;

		if (score === 0) {
			return 0;
		}

		const res = await fetch('/api/score', {
			method: 'POST',
			body: JSON.stringify({ score, username, mode: gamemode })
		});
		const data = (await res.json()) as { rank: number };
		return data.rank;
	}

	function restartGame() {
		words = [];
		word = '';
		gameOver = false;
		triggeredEnd = false;
		if (gamemode === 'computer') {
			thinking = true;
			setTimeout(() => {
				const [vocaloid, yomigana] = left[Math.floor(Math.random() * left.length)];
				words.push({
					vocaloid,
					yomigana,
					sender: { type: 'computer', createdAt: Date.now() }
				});
				thinking = false;
			}, 2000);
		}
	}

	let triggeredEnd = $state(false);

	let wordsLength = $derived(words.length);

	$effect(() => {
		if (browser) {
			if (wordsLength) {
				input.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	});

	if (dev) {
		globalThis.check = check;
		globalThis.find = find;
		globalThis.vocaloids = vocaloids;
	}

	let rank = $state(0);

	let lastUserWord: [string, string] | undefined = $derived.by(() => {
		if (!words.length) {
			return undefined;
		}
		let result = undefined;
		for (const word of words.toReversed()) {
			if (word.sender.type === 'user') {
				result = word;
				break;
			}
		}
		if (!result) {
			const lastWord = words.at(-1);
			return lastWord ? [lastWord.vocaloid, lastWord.yomigana] : undefined;
		}
		return [result.vocaloid, result.yomigana];
	});

	async function fetchNewRecords(): Promise<Word[]> {
		if (gamemode !== 'public') {
			return words;
		}
		const res = await fetch(`/api/public/${gameId}`, {
			method: 'GET'
		});
		const data = (await res.json()) as {
			records: {
				songName: string;
				username: string;
			}[];
		};
		return data.records.map(({ songName, username }) => {
			const [vocaloid, yomigana] = find(vocaloids, songName) ?? [songName, normalize(songName)];
			return {
				vocaloid,
				yomigana,
				sender: { type: 'user', username, createdAt: Date.now() }
			};
		});
	}

	const randomBotUsername = `ボカロボット${Math.floor(Math.random() * 90000) + 10000}`;

	let timer: number | null = $state(null);
</script>

<div class="flex items-center justify-center gap-2">
	{#if !words.length && gamemode === 'single'}
		<button
			class="rounded-md bg-slate-500 px-4 py-2 text-white hover:bg-slate-600"
			onclick={() => {
				const [vocaloid, yomigana] = [...vocaloids].filter(
					([, yomigana]) => allowN || !yomigana.endsWith('ん')
				)[Math.floor(Math.random() * vocaloids.size)];
				words.push({
					vocaloid,
					yomigana,
					sender: { type: 'computer', createdAt: Date.now() }
				});
			}}>ランダム・スタート</button
		>
	{:else}
		{#if ['computer', 'single'].includes(gamemode)}
			<button
				class="rounded-md border border-red-500 bg-white px-4 py-2 text-red-500 hover:bg-red-500 hover:text-white"
				onclick={async () => {
					rank = await uploadScore();
					restartGame();
				}}
			>
				{#if gamemode !== 'computer' && words.length === 1}
					再スタート
				{:else}
					リセット
				{/if}
			</button>
		{/if}
		<div>スコア: {score}</div>
		{#if ['computer', 'single'].includes(gamemode)}
			<button
				onclick={async () => {
					gameOver = true;
					triggeredEnd = true;
				}}
				class="rounded-md border border-black bg-white px-4 py-2 text-black hover:bg-slate-900 hover:text-white"
				title="ゲームを終了して、スコアをランキングに登録します"
			>
				<!-- TODO: （5曲以上の場合） -->
				ゲーム終了
			</button>
		{/if}
	{/if}
</div>

<WordList {words} {gamemode} {thinking} {stripChouon} />

{#if !ended}
	<form
		class="flex items-center justify-center gap-2"
		onsubmit={async (e) => {
			e.preventDefault();

			words = await fetchNewRecords();

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

			const entry = find(vocaloids, word) ?? find(vocaloids, normalize(word));
			if (dev) {
				console.info('Vocaloid entry:', entry);
			}
			if (!entry) {
				alert('その曲名は存在しません');
				return;
			}

			const [vocaloid, yomigana] = entry;

			switch (check(lastWord?.yomigana ?? '', yomigana, { allowN, stripChouon })) {
				case 'valid':
					break;
				case 'trailing-n':
					alert('「ん」で終わる曲は追加できません');
					return;
				case 'invalid':
					alert('しりとりが成立していません');
					return;
			}

			words.push({ vocaloid, yomigana, sender: { type: 'user', username, createdAt: Date.now() } });

			if (gamemode === 'computer') {
				thinking = true;
				setTimeout(
					() => {
						const [vocaloid, yomigana] = left[Math.floor(Math.random() * left.length)];
						words.push({ vocaloid, yomigana, sender: { type: 'computer', createdAt: Date.now() } });

						thinking = false;
					},
					1000 + Math.random() * 500
				);
			}

			if (gamemode === 'public') {
				await fetch(`/api/public/${gameId}`, {
					method: 'POST',
					body: JSON.stringify({ vocaloid, username })
				});

				if (timer) {
					window.clearTimeout(timer);
				}
				timer = window.setTimeout(async () => {
					if (document.hidden) {
						return;
					}
					const [vocaloid, yomigana] = left[Math.floor(Math.random() * left.length)];
					words.push({
						vocaloid,
						yomigana,
						sender: { type: 'user', createdAt: Date.now(), username: randomBotUsername }
					});
					await fetch(`/api/public/${gameId}`, {
						method: 'POST',
						body: JSON.stringify({ vocaloid, username: randomBotUsername })
					});
					await uploadScore();
				}, 5000);
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
{/if}

{#if gamemode !== 'public'}
<Options bind:allowN bind:stripChouon bind:ignorePunctuations />
{/if}

{#if gamemode !== 'public' && gameOver}
	<EndScreen
		{score}
		winner={words.at(-1)?.sender.type === 'user' ? username : 'コンピュータ'}
		lastWord={lastUserWord}
		{gamemode}
		{triggeredEnd}
		{rank}
		length={words.length}
		onback={() => {
			gameOver = false;
			triggeredEnd = false;
			location.reload();
		}}
		onrestart={() => {
			restartGame();
		}}
		onsave={() => {
			const csv = words
				.map(
					({ vocaloid, yomigana, sender }) =>
						`${vocaloid},${yomigana},${sender.type},${sender.type === 'computer' ? '' : sender.username}`
				)
				.join('\n');
			const blob = new Blob([csv], { type: 'text/csv' });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			a.download = `${username}-${gamemode}-${new Date().toISOString()}.csv`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
		}}
	/>
{/if}
