<script lang="ts">
	import type { Gamemode, Score } from '$lib/game';
	import Game from '$lib/Game.svelte';
	import type { PageData } from './$types';
	import Leaderboard from '$lib/Leaderboard.svelte';
	import { goto } from '$app/navigation';
	import { userManager } from '$lib/user.svelte';
	import { dev } from '$app/environment';

	const { data }: { data: PageData } = $props();

	let gamemode = $state<Gamemode | undefined>(undefined);
</script>

<svelte:window
	on:beforeunload={(event) => {
		if (dev) {
			return;
		}
		event.preventDefault();
		event.returnValue = true;
	}}
/>

<main class="flex min-w-80 flex-col gap-4 py-8 text-center">
	{#if gamemode}
		<Game vocaloids={data.vocaloids} {gamemode} username={userManager.username} />
	{:else}
		<h2 class="text-lg font-bold">ユーザー名</h2>
		<input
			type="text"
			bind:value={userManager.username}
			class="rounded border p-2"
			placeholder="ユーザーネーム"
			onfocus={(e) => {
				e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
			}}
			onblur={(e) => {
				userManager.username = e.currentTarget.value;
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
		<button
			onclick={() => {
				goto('/public');
			}}
			class="rounded bg-green-500 px-4 py-2 text-white"
		>
			パブリック
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
