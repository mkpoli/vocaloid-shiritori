<script lang="ts">
	let word = $state('');
	let words: string[] = $state([]);

	function addWord(word: string) {
		words.push(word);
	}
</script>

<ul>
	{#each words as word}
		<li>
			{word}
		</li>
	{/each}
</ul>

<form
	onsubmit={(e) => {
		e.preventDefault();
		addWord(word);
		word = '';
	}}
>
	<input type="text" bind:value={word} placeholder="ボカロ曲名を入力してください" />
	<button type="submit">追加</button>
</form>
