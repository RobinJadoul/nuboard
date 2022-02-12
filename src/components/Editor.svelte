<script>
    import 'prosemirror-view/style/prosemirror.css';
    import { Schema } from 'prosemirror-model';
    import { EditorState } from 'prosemirror-state';
    import { EditorView } from 'prosemirror-view';
    import { keymap } from 'prosemirror-keymap';

    import * as Y from 'yjs';
    import { ySyncPlugin, yUndoPlugin, undo, redo } from 'y-prosemirror';
    import { WebrtcProvider } from 'y-webrtc';
    import { IndexeddbPersistence } from 'y-indexeddb';

	import { createEventDispatcher, onMount } from 'svelte';
	const dispatchEvent = createEventDispatcher();


    const ydoc = new Y.Doc();
    const ytype = ydoc.getXmlFragment('prosemirror');
    if (!import.meta.env.SSR) { // No point trying to get anything synced when prerendering
        // TODO: proper naming instead of nuboard-stuff
        const webrtc = new WebrtcProvider('nuboard-stuff', ydoc);
        const idbsync = new IndexeddbPersistence('nuboard-stuff', ydoc);
    }
    

    const schema = new Schema({
        nodes: {
            doc: {content: "wrapper"},
            // Wrapper to avoid troubles with yjs?
            wrapper: {
                content: "text*", code: true, whitespace: "pre",
                toDOM: () => ['div', 0],
            },
            text: {code: true},
        },
    });
    let view;

    let editor_element;
    const state = EditorState.create({
        schema,
        plugins: [
            ySyncPlugin(ytype),
            yUndoPlugin(),
            keymap({
                "Enter": (state, dispatch) => {
                    if (dispatch) dispatch(state.tr.insertText('\n').scrollIntoView());
                },
                "Mod-z": undo,
                "Mod-y": redo,
                "Mod-Shift-z": redo,
            }),
        ]
    });

    function emit(val) {
        dispatchEvent("update", {
            value: val,
        });
    }

    onMount(() => {
        view = new EditorView(editor_element, {
            state,
            dispatchTransaction(tr) {
                view.updateState(view.state.apply(tr));
                if (view.state.doc.content.content[0].content.content.length > 0) {
                    emit(view.state.doc.content.content[0].content.content[0].text);
                } else {
                    emit("");
                }
            }
        });
    });
</script>

<div bind:this={editor_element} class="editor" />

<style>
    div.editor {
        font-family: monospace;
        font-size: 14px;
        background-color: lightgrey;
    }
</style>
