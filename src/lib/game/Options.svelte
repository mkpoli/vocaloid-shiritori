<script lang="ts">
	import { getContext } from 'svelte';

	let {
		allowN = $bindable(DEFAULT_SHIRITORI_OPTIONS.allowN),
		stripChouon = $bindable(DEFAULT_SHIRITORI_OPTIONS.stripChouon)
	} = $props();

	const vocaloids = getContext<Map<string, string>>('vocaloids');
</script>

<fieldset class="flex flex-col gap-2 rounded-md border p-2">
	<legend class=" bg-white px-2 text-lg font-bold">ルール設定</legend>
	<div class="grid grid-cols-[auto_1fr] items-center justify-items-start gap-2 p-4">
		<input type="checkbox" bind:checked={allowN} id="allowN" />
		<label for="allowN">
			撥音「ん」で終わることを許します （<span title="んで始まる曲"
				>{[...vocaloids].filter(([, yomigana]) => yomigana.startsWith('ん')).length}</span
			>対<span title="んで終わる曲"
				>{[...vocaloids].filter(([, yomigana]) => yomigana.endsWith('ん')).length}</span
			>曲）
		</label>
		<input type="checkbox" bind:checked={stripChouon} id="stripChouon" />
		<label for="stripChouon">
			長音「ー」を取り除きます（オフの場合「シー」→「い」のように母音接続）</label
		>
	</div>
</fieldset>
