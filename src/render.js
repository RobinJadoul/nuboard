import katex from 'katex';
import katexCSS from 'katex/dist/katex.min.css';

import { marked } from 'marked';

import DOMPurify from 'dompurify';

// An adaption to the auto-render extension for KaTeX

// The splitAtDelimiters logic from auto-render is reproduced and adapted here
//  since the build system didn't seem to be properly able to import it
function splitAtDelimiters(text, delimiters) {
    const outputs = [];

    const findEndOfMath = function(delimiter, text, startIndex) {
        // Adapted from auto-render, which was adapted from
        // https://github.com/Khan/perseus/blob/master/src/perseus-markdown.jsx
        let index = startIndex;
        let braceLevel = 0;

        while (index < text.length) {
            const character = text[index];

            if (braceLevel <= 0 &&
                text.slice(index, index + delimiter.right.length) === delimiter.right) {
                return index + delimiter.right.length;
            } else if (character === "\\") {
                index++;
            } else if (character === "{") {
                braceLevel++;
            } else if (character === "}") {
                braceLevel--;
            } else if (text.slice(index, index + delimiter.left.length) == delimiter.left) {
                braceLevel++; // Modification: nested envs
                index += delimiter.left.length - 1;
            } else if (text.slice(index, index + delimiter.right.length) == delimiter.right) {
                braceLevel--;
                index += delimiter.right.length - 1;
            }

            index++;
        }

        return -1;
    };

    function emitText(t) {
        if (t === '') return;

        if (outputs.length > 0 && outputs[outputs.length - 1].type === 'text') { // extend
            outputs[outputs.length - 1].data += t;
        } else { // new text blob
            outputs.push({
                type: 'text',
                data: t,
            });
        }
    }

    function emitMath(t, delim) {
        const raw = t;
        if (!delim.keep) {
            t = t.slice(delim.left.length);
            t = t.slice(0, t.length - delim.right.length);
        }
        outputs.push({
            type: 'math',
            rawData: raw,
            data: t,
            display: delim.display,
        });
    }

    function findFirstDelimiter(text, start) {
        let best = {delim: null, start: Infinity};
        for (const delim of delimiters) {
            const found = text.indexOf(delim.left, start);
            if (found !== -1 && found < best.start) {
                best = {delim, start: found};
            }
        }
        return best;
    }

    let idx = 0;
    while (idx < text.length) {
        const {delim, start} = findFirstDelimiter(text, idx);
        if (delim === null) { // no delimiter found, everything is text
            emitText(text.slice(idx));
            break;
        } else { // handle a math block
            const end = findEndOfMath(delim, text, start + delim.left.length);
            if (end === -1) { // no end to be seen, give up
                emitText(text.slice(idx));
                break;
            } else {
                emitText(text.slice(idx, start));
                emitMath(text.slice(start, end), delim);
                idx = end;
            }
        }
    }

    return outputs;
}


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
  {left: '$$', right: '$$', display: true, keep: false},
  {left: '$', right: '$', display: false, keep: false},
  {left: '\\(', right: '\\)', display: false, keep: false},
  {left: '\\[', right: '\\]', display: true, keep: false}
].concat(environments.map((env) => {
    return {
        left: `\\begin{${env}}`,
        right: `\\end{${env}}`,
        display: true,
        keep: true
    }
}));

function renderPart(part, display) {
    const rendered = katex.renderToString(part, {
        throwOnError: false,
        displayMode: display,
    });
    return rendered;
}

const MATH_BLOCK_PLACEHOLDER = "<span><!--___MATH_BLOCK___--></span>"

function renderMath(content) {
    let result = '';
    let blocks = [];
    for (const block of splitAtDelimiters(content, delimiters)) {
        if (block.type === 'text') {
            result += block.data;
        } else if (block.type === 'math') {
            const { data, display, rawData } = block;
            try {
                const block = renderPart(data, display);
                result += MATH_BLOCK_PLACEHOLDER;
                blocks.push(block);
            } catch (e) {
                if (!(e instanceof katex.ParseError)) {
                    throw e;
                }
                result += MATH_BLOCK_PLACEHOLDER;
                blocks.push(rawData);
            }
        } else {
            console.warn("Unknown splitAtDelimiters type while rendering math");
        }
    }
    return { text: result, mathblocks: blocks };
}

function renderMarkdown(content, mathblocks) {
    const rendered = marked.parse(content, {
        silent: true,
        smartLists: true,
    });
    const withMath = rendered.replaceAll(MATH_BLOCK_PLACEHOLDER, () => mathblocks.splice(0, 1));
    return withMath;
}

function sanitize(html) {
    return DOMPurify.sanitize(html);
}


export function render(content) {
    if (!content) return '';

    // Do math first in an attempt to prevent markdown mangling things
    const { text, mathblocks } = renderMath(content, true);
    const withMD = renderMarkdown(text, mathblocks);
    return sanitize(withMD);
}

export default { render, renderMath, renderMarkdown };
