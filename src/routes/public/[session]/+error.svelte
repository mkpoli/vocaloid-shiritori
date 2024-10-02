<script lang="ts">
	import '../../../app.css';
	import { page } from '$app/stores';

	let status = $page.status;

	let session = $page.params.session;
</script>

{#if status === 404}
	<p>404</p>

	<p>番号{session}のゲームは存在しません</p>
{:else if status === 403}
	<p>番号{session}は不正なゲーム番号です</p>
{:else}
	<p>未知のエラーが発生しました</p>
{/if}

<a href="/public" class="text-blue-500 hover:text-blue-600 hover:underline"
	>パブリック・ゲーム一覧に戻る</a
>
