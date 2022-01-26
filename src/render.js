import katex from 'katex';
import splitAtDelimiters from 'katex/contrib/auto-render/splitAtDelimiters.js';
import {} from 'katex/contrib/copy-tex/copy-tex.js';
import katexCSS from 'katex/dist/katex.min.css';

import { marked } from 'marked';

import DOMPurify from 'dompurify';

// An adaption to the auto-render extension for KaTeX

// envs listed at https://katex.org/docs/supported.html
const environments = [
                    'matrix', 'pmatrix', 'vmatrix', 'Bmatrix', 'cases', 'smallmatrix',
                    'array', 'bmatrix', 'Vmatrix', 'rcases', 'subarray',
                    'equation', 'split', 'gather', 'CD', 'align', 'alignat',
                    'darray', 'dcases', 'drcases',
                    'matrix*', 'pmatrix*', 'bmatrix*', 'Bmatrix*', 'vmatrix*', 'Vmatrix*',
                    'equation*', 'gather*', 'align*', 'alignat*'
                    ]
const delimiters = [
  {left: '$$', right: '$$', display: true},
  {left: '$', right: '$', display: false},
  {left: '\\(', right: '\\)', display: false},
  {left: '\\[', right: '\\]', display: true}
].concat(environments.map((env) => {
    return {
        left: `\\begin{${env}}`,
        right: `\\end{${env}}`,
        display: true
    }
}));

function renderPart(part, display) {
    return katex.renderToString(part, {
        throwOnError: false,
        displayMode: display,
    });
}

export function renderMath(content) {
    let result = '';
    for (const block of splitAtDelimiters(content, delimiters)) {
        if (block.type === 'text') {
            result += block.data;
        } else if (block.type === 'math') {
            const { data, display, rawData } = block;
            try {
                result += renderPart(data, display);
            } catch (e) {
                if (!(e instanceof katex.ParseError)) {
                    throw e;
                }
                result += rawData;
            }
        } else {
            console.warn("Unknown splitAtDelimiters type while rendering math");
        }
    }
    return result;
}

export function renderMarkdown(content) {
    return marked.parse(content, {
        silent: true,
        smartLists: true,
    });
}

export function sanitize(html) {
    return DOMPurify.sanitize(html);
}


export function render(content) {
    if (!content) return '';

    // Do math first in an attempt to prevent markdown mangling things
    const withMath = renderMath(content, true);
    const withMD = renderMarkdown(withMath);
    return sanitize(withMD);
}

export default { render, renderMath, renderMarkdown };
