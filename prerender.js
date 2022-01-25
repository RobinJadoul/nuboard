// Pre-render the app into static HTML.
// Based on https://github.com/vitejs/vite/blob/main/packages/playground/ssr-vue/prerender.js
//  and https://github.com/gobeli/svelte-prerender

import App from './src/App.svelte';

// Not with import to silence warnings from the build system
const fs = require('fs');
const path = require('path');

const index = fs.readFileSync(path.resolve(__dirname, '..', 'dist', 'index.html'), 'utf8');
const app = App.render();
const rendered = index.replace('<!--%SSR HEAD%-->', app.head).replace('<!--%SSR BODY%-->', app.html);
fs.writeFileSync(path.resolve(__dirname, '..', 'dist', 'index.html'), rendered);
