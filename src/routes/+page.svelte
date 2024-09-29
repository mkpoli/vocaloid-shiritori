<script lang="ts">
	import Game from '$lib/Game.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
</script>

<main class="text-center py-12 flex flex-col gap-4">
	<h1 class="text-2xl font-bold">ボカロ曲名しりとり！</h1>
	<p class="text-lg">「ボカロ曲名しりとり！」とは、ボカロ曲名を使ったしりとりゲームです。</p>

	<Game vocaloids={data.vocaloids} />
</main>

<footer class="text-center py-12">
	<p>
		<a
			href="https://github.com/blueset/vocaloid-yomigana/issues"
			class="text-blue-600 hover:underline no-underline">楽曲情報修正・追加依頼</a
		>
	</p>

	<p>
		<a href="https://mkpo.li/"> @mkpoli </a>
	</p>
</footer>
