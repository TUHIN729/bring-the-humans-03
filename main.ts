// bring-the-humans-03 entry — "Bring the humans with a TikTok ad" (Node 22,
// standard library only).
//
// The entry is the video itself: an original vertical ad for make.fun, made in
// this session, posted publicly on TikTok from @catty1054, its caption carrying
// "$500 bounty", make.fun written out and the play code makefun-sultana-lamp-moon.
// VIDEO.json at the repository root names the video's full TikTok address, and
// this program hands that file to the grader: it reads VIDEO.json from the
// repository and writes the same bytes to /output/VIDEO.json, where the gate
// reads them. Nothing this program writes about the video is scored — the house
// reads the video itself from TikTok and ranks it on its real views.
//
// The ad shows make.fun's brand badge from its first frame and ends on the
// press pack's referral end card with referral code ecdsgx0z, both fetched from
// https://make.fun/press/manifest.json and used as they are.
//
// The gate refuses a VIDEO.json whose url is not a TikTok video address
// (https://www.tiktok.com/@<handle>/video/<id>, the id digits only — a short
// link or a photo post will not do), so this program checks that shape before
// it hands the file over, and refuses to pass on a broken hand-in.
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Outside the grader's container these stand in for /bot and /output.
const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const SOURCE = join(BOT_DIR, 'VIDEO.json');
const TARGET = join(OUTPUT_DIR, 'VIDEO.json');

// A TikTok video's full address as the browser shows it: tiktok.com or
// m.tiktok.com, /@<handle>/video/<digits>, an optional query or fragment after
// it read past. Short links (vm.tiktok.com, vt.tiktok.com, tiktok.com/t) and
// photo posts (/photo/<id>) do not name a video and are refused.
const VIDEO_URL = /^https:\/\/(?:www\.|m\.)?tiktok\.com\/@[^/]+\/video\/\d+(?:[?#].*)?$/;

let raw: Buffer;
try {
  raw = readFileSync(SOURCE);
} catch (err) {
  console.error(`could not read ${SOURCE}: ${(err as Error).message}`);
  process.exit(1);
}

// Refuse a broken hand-in early: VIDEO.json must parse and name a url string.
let parsed: unknown;
try {
  parsed = JSON.parse(raw.toString('utf8'));
} catch (err) {
  console.error(`VIDEO.json is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}
if (
  typeof parsed !== 'object' ||
  parsed === null ||
  typeof (parsed as { url?: unknown }).url !== 'string'
) {
  console.error('VIDEO.json must be an object with a string "url" field');
  process.exit(1);
}

const url = (parsed as { url: string }).url;
if (url.includes('PLACEHOLDER')) {
  console.warn(
    'warning: VIDEO.json still holds the placeholder — replace it with the ' +
      'posted video\'s full TikTok address before submitting',
  );
} else if (!VIDEO_URL.test(url)) {
  console.error(
    `url is not a TikTok video address (https://www.tiktok.com/@<handle>/video/<id>): ${url}`,
  );
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(TARGET, raw);
console.log(`wrote ${TARGET} for ${url}`);
