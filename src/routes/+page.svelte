<script lang="ts">
	import type { Gamemode, Score } from '$lib/game';
	import Game from '$lib/Game.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import Leaderboard from '$lib/Leaderboard.svelte';

	const { data }: { data: PageData } = $props();

	let gamemode = $state<Gamemode | undefined>(undefined);

	let username = $state('');

	onMount(() => {
		function generateStableRandomNumber() {
			const userAgent = navigator.userAgent;
			const screenResolution = `${screen.width}x${screen.height}`;
			const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

			const uniqueString = `${userAgent}_${screenResolution}_${timezone}`;

			let hash = 0;
			for (let i = 0; i < uniqueString.length; i++) {
				const char = uniqueString.charCodeAt(i);
				hash = (hash << 5) - hash + char;
				hash = hash & hash;
			}

			const randomNumber = Math.abs(hash % 100000);

			return randomNumber;
		}

		username =
			localStorage.getItem('username') ??
			`ボカロリスナー${Math.floor(generateStableRandomNumber())}`;
	});
</script>

<main class="flex flex-col gap-4 py-12 text-center">
	<h1 class="text-2xl font-bold">ボカロ曲名しりとり！</h1>
	<p class="text-lg">「ボカロ曲名しりとり！」とは、ボカロ曲名を使ったしりとりゲームです。</p>
	<hr />

	{#if gamemode}
		<Game vocaloids={data.vocaloids} {gamemode} {username} />
	{:else}
		<h2 class="text-lg font-bold">ユーザー名</h2>
		<input
			type="text"
			bind:value={username}
			class="rounded border p-2"
			placeholder="ユーザーネーム"
			onfocus={(e) => {
				e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
			}}
			onblur={(e) => {
				localStorage.setItem('username', e.currentTarget.value);
			}}
		/>
		<h2 class="text-lg font-bold">モード選択</h2>

		<button
			class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
			onclick={() => {
				gamemode = 'single';
			}}
		>
			シングル
		</button>
		<button
			class="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
			onclick={() => {
				gamemode = 'computer';
			}}
		>
			コンピュータ
		</button>
		<button class="rounded bg-gray-500 px-4 py-2 text-white" disabled>
			パブリック（準備中）
		</button>
		<button class="rounded bg-gray-500 px-4 py-2 text-white" disabled> マルチ（準備中） </button>
	{/if}

	<h2 class="text-lg font-bold">ランキング</h2>
	{#key gamemode}
		<Leaderboard
			scores={data.scores.map(({ mode, username, score, createdAt }) => ({
				gamemode: mode,
				username,
				score,
				timestamp: createdAt
			})) as Score[]}
		/>
	{/key}
</main>
