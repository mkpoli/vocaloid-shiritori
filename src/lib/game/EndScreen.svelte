<script lang="ts">
	import type { Gamemode } from '$lib/game';

	const {
		score,
		winner,
		gamemode,
		length,
		lastWord,
		triggeredEnd,
		rank,
		onback,
		onrestart,
		onsave
	}: {
		score: number;
		winner: string;
		gamemode: Gamemode;
		lastWord: [string, string] | undefined;
		length: number;
		rank: number;
		triggeredEnd: boolean;
		onback: () => void;
		onrestart: () => void;
		onsave: () => void;
	} = $props();

	const gamemodeText = {
		computer: 'コンピュータ・モード',
		single: 'シングル・モード',
		multi: 'マルチ・モード',
		public: 'パブリック・モード'
	} as const;

	let twitterShareURL = 'https://vocaloid-shiritori.mkpo.li/';
	let twitterShareText = $derived(
		`【ボカロ曲名しりとり】\n🎶${length}曲に渡るしりとりの激戦の結果、私は${score}点でランキング${rank}位でした🏆\n\n🎼最後の曲は「${lastWord?.[0]}」でした！\n\n🔻ボカロ好きのみんなもやってみてね！🔻\n`
	);
	let twitterShareHashtag = 'ボカロ曲名しりとり';
	let twitterUrl = $derived(
		`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterShareText)}&hashtags=${twitterShareHashtag}&url=${encodeURIComponent(twitterShareURL)}&related=mkpoli`
	);
</script>

<div class="pointer-events-none fixed inset-0 z-20 flex bg-black/50 backdrop-blur-sm"></div>
<div
	class="fixed left-1/2 top-1/2 z-30 flex h-max h-screen -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-4 rounded-lg bg-white/90 px-8 py-8 shadow-lg"
>
	<p class="text-4xl">🎉</p>
	<h2 class="text-4xl font-bold leading-10 text-orange-500">ゲームオーバー</h2>
	<p class="bg-gradient-to-r from-blue-500 to-orange-300 bg-clip-text text-6xl text-transparent">
		{score}
	</p>
	<p class="text-xl font-bold text-black">ランキング{rank}位</p>
	{#if !triggeredEnd}
		<p class="text-xl font-bold text-black">{winner}の勝ちです！</p>
		{#if lastWord}
			<p class="text-xl font-bold text-black">
				「<ruby>
					{lastWord[0]}
					<rt>{lastWord[1]}</rt>
				</ruby>」
			</p>
		{/if}
	{/if}
	<p class="text-md text-black">
		{gamemodeText[gamemode]}
	</p>
	<button
		class="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
		onclick={onback}
	>
		メニューに戻る
	</button>
	<button
		class="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
		onclick={onrestart}
	>
		もう一回
	</button>
	<button class="w-full rounded border border-black bg-transparent px-4 py-2" onclick={onsave}
		>結果をダウロード</button
	>
	<a
		href={twitterUrl}
		class="w-full rounded border border-black bg-transparent px-4 py-2"
		target="_blank"
	>
		X (Twitter) でシェア
	</a>
</div>
