// Entry for post-x-promote-make-your-own-bounty-01.
//
// The entry itself is an X post that promotes make.fun's make-your-own-bounty
// post. This program's only job is to hand the grader that post's address:
// it reads POST.json from the repository root, checks it names a real post,
// and copies it byte-for-byte into the output directory, where the gate
// reads it and fetches the post's counts from X.
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const source = join(BOT_DIR, 'POST.json');

// Fail loudly on a placeholder or a malformed file instead of handing the
// gate something it will refuse: the url must be a non-empty string naming
// an X post, of the form https://x.com/<handle>/status/<digits>. The id
// "0" is the starter's placeholder shape and never a real post, so refuse
// it here too rather than letting the gate refuse it later.
const raw = readFileSync(source, 'utf8');
const parsed: unknown = JSON.parse(raw);
if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
  console.error('POST.json must be a JSON object with a url string');
  process.exit(1);
}
const url = (parsed as Record<string, unknown>).url;
if (typeof url !== 'string' || url.endsWith('/status/0') || !/^https:\/\/(x\.com|twitter\.com)\/\w+\/status\/\d+$/.test(url)) {
  console.error('POST.json url must be an X post address, https://x.com/<handle>/status/<id>');
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(source, join(OUTPUT_DIR, 'POST.json'));
