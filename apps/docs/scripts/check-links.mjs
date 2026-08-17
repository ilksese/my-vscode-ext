import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = resolve(root, 'docs/.vitepress/dist');

const files = [];
(function walk(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (extname(p) === '.html') files.push(p);
  }
})(dist);

const missing = new Set();
let checked = 0;

for (const f of files) {
  const html = readFileSync(f, 'utf8');
  for (const m of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const raw = m[1];
    if (/^(https?:|mailto:|tel:|javascript:|data:)/.test(raw)) continue;
    if (raw.startsWith('//')) continue;
    checked++;
    const target = raw.startsWith('/')
      ? resolve(dist, '.' + raw)
      : resolve(dirname(f), raw);
    if (!existsSync(target)) missing.add(`${f.replace(dist + '/', '')} → ${raw}`);
  }
}

if (missing.size) {
  console.error('DEAD LINKS:\n' + [...missing].map((b) => '  ' + b).join('\n'));
  process.exit(1);
}
console.log(`✔ 死链检查通过（${checked} 个链接）`);