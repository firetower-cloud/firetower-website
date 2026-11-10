import fs from 'node:fs';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const origin = 'https://usefiretower.com';
const docs = JSON.parse(fs.readFileSync('content/docs-manifest.json', 'utf8'));
const markdown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
markdown.use(gfm);
markdown.remove(['script', 'style', 'svg']);
markdown.addRule('omitControls', {
  filter: (node) => node.classList.contains('code-top') || node.classList.contains('image-dark'),
  replacement: () => '',
});
markdown.addRule('definitionTerm', { filter: 'dt', replacement: (content) => `\n\n**${content.trim()}**\n\n` });
markdown.addRule('definition', { filter: 'dd', replacement: (content) => `\n\n${content.trim()}\n\n` });
markdown.addRule('absoluteLinks', {
  filter: (node) => node.nodeName === 'A' && node.hasAttribute('href'),
  replacement: (content, node) => `[${content.trim()}](${new URL(node.getAttribute('href'), origin).href})`,
});
markdown.addRule('screenshots', {
  filter: 'img',
  replacement: (_content, node) => {
    if (node.classList.contains('image-dark')) return '';
    const src = node.getAttribute('src');
    return src ? `\n\n![${(node.getAttribute('alt') || '').replace(/\]/g, '\\]')}](${new URL(src, origin).href})\n\n` : '';
  },
});

// This directory contains generated files only. Rebuild it so removed pages
// cannot survive as stale Markdown after a documentation navigation change.
fs.rmSync('public/docs', { recursive: true, force: true });
fs.mkdirSync('public/docs', { recursive: true });
const pages = docs.map((doc) => {
  const url = `${origin}/docs${doc.slug ? '/' + doc.slug : ''}`;
  const html = fs.readFileSync(`content/docs/${doc.id}.html`, 'utf8');
  const body = `# ${doc.title}\n\n> ${doc.description}\n\nSource: ${url}\n\n${markdown.turndown(html)}\n`;
  fs.writeFileSync(`public/docs/${doc.slug || 'index'}.md`, body);
  return body;
});
fs.writeFileSync('public/llms-full.txt', `# Firetower documentation\n\nComplete documentation, generated from the same content as the website. Screenshots show sample data. For a topic index, see ${origin}/llms.txt.\n\n---\n\n${pages.join('\n---\n\n')}`);
console.log(`Built Markdown versions of ${pages.length} documentation pages and llms-full.txt.`);
