<script lang="ts">
	import type { Score } from '$lib/game';

	let { scores, full = false }: { scores: Score[]; full?: boolean } = $props();
</script>

<ol class="mx-auto flex w-max flex-col gap-2">
	{#each scores as score, i}
		<li class="relative rounded py-3 pl-10 pr-4 drop-shadow-md" title={score.timestamp.toString()}>
			<div>
				{i + 1}. {score.username} - {score.score}
			</div>
		</li>
	{/each}
</ol>
{#if !full}
	<a
		href="/leaderboard"
		class="text-sm text-gray-500 underline-offset-4 hover:text-gray-600 hover:underline"
		>もっと見る</a
	>
{/if}

<style lang="postcss">
	li:nth-child(1) {
		@apply bg-gradient-to-r from-amber-500/15 via-yellow-500/15 to-amber-500/15 font-bold;
	}
	li:nth-child(1) > div {
		@apply z-10 bg-clip-text text-transparent;
		animation: shine 1s infinite;
		background-image: radial-gradient(
				ellipse farthest-corner at right bottom,
				#dab024 0%,
				#fdb931 8%,
				#ca9930 30%,
				#c89a2f 40%,
				transparent 80%
			),
			radial-gradient(
				ellipse farthest-corner at left top,
				#7d3e00 0%,
				#e5e523 8%,
				#ffd146 25%,
				#c69c3a 62.5%,
				#e2b650 100%
			);
		filter: drop-shadow(0 0 5px rgba(255, 204, 0, 0.5));
	}
	li:nth-child(1)::before {
		content: '🥇';
		@apply absolute left-2 z-10 bg-clip-content;
	}

	@keyframes shine {
		0% {
			opacity: 1;
			background-position: 0 0;
		}
		50% {
			opacity: 0.85;
			background-position: 100% 100%;
		}
		100% {
			opacity: 1;
			background-position: 0 0;
		}
	}

	li:nth-child(2) {
		@apply bg-gray-300/15 font-semibold text-gray-600;
	}
	li:nth-child(2)::before {
		content: '🥈';
		@apply absolute left-2;
	}

	li:nth-child(3) {
		color: #cd7f32;
		@apply bg-yellow-300/15 font-semibold text-orange-700;
	}
	li:nth-child(3)::before {
		content: '🥉';
		@apply absolute left-2;
	}
</style>
