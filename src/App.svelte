<script>
    import Board from './components/Board.svelte';
    let content;
</script>

<Board content={content} />
<textarea bind:value={content} />
