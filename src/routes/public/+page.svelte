<script lang="ts">
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { userManager } from '$lib/user.svelte';
	import type { PageData } from './$types';

	// const { data } = await useFetch('/api/public');
	const { data }: { data: PageData } = $props();

	const endedGames = data.games.filter((game) => game.ended);
	const ongoingGames = data.games.filter((game) => !game.ended);
</script>

<!-- <WordList {words} gamemode="public" thinking={false} stripChouon={true} /> -->

<h2 class="text-xl font-bold">パブリック・ゲーム</h2>

<h3 class="text-md font-bold">進行中のゲーム</h3>

{#each ongoingGames as game}
	<a
		href={`/public/${game.id}`}
		class="flex flex-row gap-2 rounded-md border-2 border-gray-200 bg-gray-100 p-2"
	>
		{game.createdAt}</a
	>
{/each}
{#if ongoingGames.length < 5}
	<button
		onclick={async () => {
			// const gameId = crypto.randomUUID(); // TODO: ゲームIDを生成する
			try {
				const res = await fetch('/api/public', {
					method: 'POST',
					body: JSON.stringify({
						createdBy: userManager.username
					})
				});
				const data = (await res.json()) as { id: string };
				if (dev) {
					console.info('[public] Successfully created a game, id: ' + data.id);
				}
				goto(`/public/${data.id}`);
			} catch (error) {
				console.error('[public] Failed to create a game', error);
				alert('ゲームの作成に失敗しました');
				return;
			}
		}}
		class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">ゲームを作成する</button
	>
{/if}

<h3 class="text-md font-bold">過去のゲーム</h3>

{#each endedGames as game}
	<div>
		<a href={`/public/${game.id}`}>{game.createdAt}</a>
	</div>
{/each}
