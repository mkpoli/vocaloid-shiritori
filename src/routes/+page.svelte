<script lang="ts">
	import type { Gamemode } from '$lib/game';
	import Game from '$lib/Game.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	let gamemode = $state<Gamemode | undefined>(undefined);
</script>

<main class="flex flex-col gap-4 py-12 text-center">
	<h1 class="text-2xl font-bold">ボカロ曲名しりとり！</h1>
	<p class="text-lg">「ボカロ曲名しりとり！」とは、ボカロ曲名を使ったしりとりゲームです。</p>
	<hr />

	{#if gamemode}
		<Game vocaloids={data.vocaloids} {gamemode} />
	{:else}
		<h2 class="text-lg">モードを選択してください</h2>

		<button
			class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
			onclick={() => {
				gamemode = 'single';
			}}
		>
			シングル
		</button>
		<button
			class="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
			onclick={() => {
				gamemode = 'computer';
			}}
		>
			コンピュータ
		</button>
		<button class="rounded bg-gray-500 px-4 py-2 text-white" disabled>
			パブリック（準備中）
		</button>
		<button class="rounded bg-gray-500 px-4 py-2 text-white" disabled> マルチ（準備中） </button>
	{/if}
</main>
