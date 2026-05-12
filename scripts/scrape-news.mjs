// scripts/scrape-news.mjs
//
// Fetches the latest news from stlambush.com/news.rss and writes
// src/data/news.json. Designed to run in GitHub Actions on a schedule
// or be invoked locally with `node scripts/scrape-news.mjs`.
//
// We deliberately keep this dependency-free (just Node 20+ standard library)
// so it's fast in CI and easy to debug.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const RSS_URL = 'https://www.stlambush.com/news.rss';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_PATH = resolve(__dirname, '../src/data/news.json');
const MAX_ITEMS = 20;

// Lightweight RSS parser — RSS 2.0 is just XML, and we only need a handful of fields.
function parseRSS(xml) {
  const items = [];
  // Match each <item>...</item> block
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    items.push({
      title: extractTag(block, 'title'),
      link: extractTag(block, 'link'),
      description: extractTag(block, 'description'),
      pubDate: extractTag(block, 'pubDate'),
      // Some feeds use <enclosure url="..."> for images
      image: extractEnclosure(block) || extractImageFromDescription(extractTag(block, 'description')),
    });
  }
  return items;
}

function extractTag(block, tag) {
  // Handle CDATA-wrapped content as well
  const re = new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i');
  const m = block.match(re);
  return m ? m[1].trim() : null;
}

function extractEnclosure(block) {
  const m = block.match(/<enclosure[^>]*url=['"]([^'"]+)['"]/i);
  return m ? m[1] : null;
}

function extractImageFromDescription(desc) {
  if (!desc) return null;
  const m = desc.match(/<img[^>]*src=['"]([^'"]+)['"]/i);
  return m ? m[1] : null;
}

// Heuristic to derive a category tag from the title — keeps the UI clean
// without requiring an editorial taxonomy on the source side.
function inferTag(title) {
  if (!title) return 'CLUB';
  const upper = title.toUpperCase();
  if (/\bAWARD|MVP|COACH OF THE YEAR|HONOR/.test(upper)) return 'AWARDS';
  if (/\bSEMIFINAL|PLAYOFF|FINAL\b/.test(upper)) return 'PLAYOFFS';
  if (/\bWIN|LOSS|FALL|DEFEAT|VICTORY|HOST|HEARTBREAK|OVERTIME/.test(upper)) return 'GAME';
  if (/\bSIGN|TRADE|TRANSACTION|RELEASE|ROSTER/.test(upper)) return 'ROSTER';
  if (/\bARENA|RENOVAT|FACILITY/.test(upper)) return 'FACILITY';
  return 'CLUB';
}

function slugFromUrl(url) {
  if (!url) return '';
  const m = url.match(/\/news\/([^/?#]+)/);
  return m ? m[1] : '';
}

async function main() {
  console.log(`Fetching ${RSS_URL}...`);
  const res = await fetch(RSS_URL, {
    headers: {
      // Polite user-agent so the team can attribute traffic if they ever check logs
      'User-Agent': 'stl-ambush-app-scraper/1.0 (+https://github.com/dyllanleehaggard/stl-ambush)',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch RSS: ${res.status} ${res.statusText}`);
  }

  const xml = await res.text();
  const rawItems = parseRSS(xml);
  console.log(`Parsed ${rawItems.length} items from feed.`);

  const items = rawItems.slice(0, MAX_ITEMS).map((it) => ({
    title: it.title,
    slug: slugFromUrl(it.link),
    url: it.link,
    image: it.image,
    tag: inferTag(it.title),
    publishedAt: it.pubDate ? new Date(it.pubDate).toISOString() : null,
  }));

  const output = {
    lastUpdated: new Date().toISOString(),
    items,
  };

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${items.length} items to ${OUTPUT_PATH}`);

  if (items.length === 0) {
    console.warn('Warning: no items parsed. Feed may be empty or format changed.');
  }
}

main().catch((err) => {
  console.error('Scrape failed:', err);
  process.exit(1);
});
