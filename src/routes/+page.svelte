<script lang="ts">
	import Game from '$lib/Game.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
</script>

<h1>ボカロ曲名しりとり！</h1>
<p>「ボカロ曲名しりとり！」とは、ボカロ曲名を使ったしりとりゲームです。</p>

<Game vocaloids={data.vocaloids} />

<footer>
	<a href="https://mkpo.li/"> @mkpoli </a>
</footer>
