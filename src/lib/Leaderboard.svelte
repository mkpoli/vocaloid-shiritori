<script lang="ts">
	import type { Score } from '$lib/game';

	let { scores }: { scores: Score[] } = $props();
</script>

<ol>
	{#each scores as score, i}
		<li class="drop-shadow-md" title={score.timestamp.toString()}>
			{i + 1}. {score.username} - {score.score}
		</li>
	{/each}
</ol>
<a href="/leaderboard">もっと見る</a>

<style>
	li:nth-child(1) {
		color: gold;
	}
	li:nth-child(2) {
		color: silver;
	}
	li:nth-child(3) {
		color: #cd7f32;
	}
</style>
