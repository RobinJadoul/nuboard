<script>
    import Board from './components/Board.svelte';
    import Editor from './components/Editor.svelte';

    let content;

    function setContent(event) {
        content = event.detail.value;
    }
</script>

<Board content={content} />
<Editor on:update={setContent} />
