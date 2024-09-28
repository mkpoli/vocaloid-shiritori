<script lang="ts">
	import { check } from "$lib/shiritori";

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
    if (!word) {
      alert('曲名を入力してください');
      return;
    }
    const lastWord = words.at(-1) ?? '';
    if (word && (words.length == 0 || check(lastWord, word))) {
      addWord(word);
    } else {
      alert('その曲名はしりとりのルール違反です');
    }
    // TODO: Better alert
    // TODO: Show error type and context
		word = '';
	}}
>
	<input type="text" bind:value={word} placeholder="ボカロ曲名を入力してください" />
	<button type="submit">追加</button>
</form>
