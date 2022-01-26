<script>
    import render from '../render.js';
    import { onMount } from 'svelte';

    export let content;
    let html
    $: html = render.render(content);
</script>

<div>
    {@html html}
</div>
