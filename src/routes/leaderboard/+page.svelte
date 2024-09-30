<script lang="ts">
	import type { Score } from '$lib/game';
	import Leaderboard from '$lib/Leaderboard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<a href="/">🏠</a>

<h1 class="my-4 text-2xl font-bold">ランキング</h1>
<Leaderboard
	full
	scores={data.scores.map(({ mode, username, score, createdAt }) => ({
		gamemode: mode,
		username,
		score,
		timestamp: createdAt
	})) as Score[]}
/>
