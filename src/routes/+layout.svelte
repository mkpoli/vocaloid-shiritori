<script>
	import '../app.css';
</script>

<svelte:head>
	<title>ボカロ曲名しりとり</title>
</svelte:head>

<header class="flex flex-col gap-4 py-8 text-center">
	<h1 class="text-2xl font-bold">ボカロ曲名しりとり！</h1>
	<p class="text-lg">「ボカロ曲名しりとり！」とは、ボカロ曲名を使ったしりとりゲームです。</p>
</header>

<hr class="w-80" />

<slot />

<hr class="w-80" />

<footer class="py-8 text-center">
	<p>
		<a
			href="https://github.com/blueset/vocaloid-yomigana/issues"
			class="text-blue-600 no-underline hover:underline">楽曲情報修正・追加依頼</a
		>
	</p>

	<p>
		<a href="https://mkpo.li/"> @mkpoli </a>
	</p>
</footer>
