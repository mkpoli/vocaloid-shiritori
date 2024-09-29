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
	<a href="https://mkpo.li/"> @mkpoli </a>
</footer>
