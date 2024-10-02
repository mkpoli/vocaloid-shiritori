<script lang="ts">
	import Game from '$lib/Game.svelte';
	import { userManager } from '$lib/user.svelte';

	const { data } = $props();
	const { game, records, vocaloids } = data;
</script>

<h2 class="text-xl font-bold"><a href="/public" class="hover:underline">パブリック・ゲーム</a> No.{game.id}</h2>

<p class="text-sm text-slate-500">
	<time datetime={game.createdAt.toString()} class="">{game.createdAt}</time>
	{game.ended ? '終了' : '進行中'}
</p>

<Game
	gamemode="public"
	{vocaloids}
	username={userManager.username}
	words={records.map((record) => {
		const [vocaloid, yomigana] = [...vocaloids].find(([v, _y]) => v === record.songName) ?? [
			record.songName,
			record.songName,
		];
		return {
			vocaloid,
			yomigana,
			sender: { type: 'user', username: record.username, createdAt: record.createdAt }
		};
	})}
	gameId={game.id}
	ended={game.ended === 1}
/>
