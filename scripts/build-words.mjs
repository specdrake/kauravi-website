/**
 * Regenerates src/data/words.json from words_raw.txt (one entry per line, optional ". " prefix).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const rawPath = path.join(root, 'words_raw.txt');
const outPath = path.join(root, 'src', 'data', 'words.json');

function slugify(s) {
  return (
    s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 56) || 'word'
  );
}

function firstLetter(word) {
  const m = word.match(/[A-Za-z\u0900-\u097F]/u);
  if (m) {
    const ch = m[0];
    if (/[A-Za-z]/.test(ch)) return ch.toUpperCase();
    return ch;
  }
  return 'A';
}

const raw = fs.readFileSync(rawPath, 'utf8');
const lines = raw
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l.length > 0);

const seenIds = new Map();
const entries = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  if (line.startsWith('.')) line = line.replace(/^\.\s*/, '').trim();

  const paren = line.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  let displayWord = line;
  let definition;
  if (paren) {
    displayWord = paren[1].trim();
    definition = `${paren[2].trim()} — from the regional word list.`;
  } else {
    definition =
      'Kauravi term from the community word list; gloss and usage can be expanded with the Baithak.';
  }

  const letter = firstLetter(displayWord);
  let baseId = slugify(displayWord.split('/')[0].trim());
  let id = baseId;
  let n = 2;
  while (seenIds.has(id)) {
    id = `${baseId}-${n++}`;
  }
  seenIds.set(id, true);

  entries.push({
    id,
    word: line,
    ipa: null,
    pos: 'phrase',
    letter,
    definition,
    example: null,
    etymology: 'Community-sourced entry (words_raw.txt).',
    audio: null,
  });
}

fs.writeFileSync(outPath, JSON.stringify(entries, null, 2) + '\n', 'utf8');
console.log(`Wrote ${entries.length} entries to ${path.relative(root, outPath)}`);
