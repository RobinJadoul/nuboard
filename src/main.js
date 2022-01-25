import App from './App.svelte';

const app = new App({
    target: document.querySelector("#app"),
    hydrate: import.meta.env.MODE == "production",
});

export default app
