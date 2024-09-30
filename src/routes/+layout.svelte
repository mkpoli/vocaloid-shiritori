<script>
	import '../app.css';
</script>

<svelte:head>
	<title>ボカロ曲名しりとり</title>
</svelte:head>

<slot />

<footer class="py-12 text-center">
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
