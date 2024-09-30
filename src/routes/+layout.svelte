<script>
	import '../app.css';
</script>

<svelte:head>
	<title>ボカロ曲名しりとり</title>
	<meta name="description" content="ボカロの曲名でしりとりを楽しめるゲームです。" />
	<meta name="keywords" content="ボカロ, 曲名, しりとり, ゲーム" />
	<meta name="author" content="mkpoli" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@mkpoli" />
	<meta name="twitter:creator" content="@mkpoli" />
	<meta name="twitter:title" content="ボカロ曲名しりとり" />
	<meta name="twitter:description" content="ボカロ曲名しりとりを楽しめるゲームです。" />
	<meta name="twitter:image" content="https://vocaloid-shiritori.mkpo.li/ogp.png" />
	<meta property="og:title" content="ボカロ曲名しりとり" />
	<meta property="og:description" content="ボカロの曲名でしりとりを楽しめるゲームです。" />
	<meta property="og:image" content="https://vocaloid-shiritori.mkpo.li/ogp.png" />
	<meta property="og:url" content="https://vocaloid-shiritori.mkpo.li" />
	<meta property="og:type" content="website" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="ボカロ曲名しりとり" />
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
