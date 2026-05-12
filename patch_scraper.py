#!/usr/bin/env python3
"""
Surgical patch for the STL Ambush scraper. Run from project root:
    python3 patch_scraper.py

Fixes three remaining bugs:
1. Detect 26865-byte SoccerShift placeholder, mark photo as null
2. Schedule regex stops too early, missing the W/L span
3. Score assignment ignored home/away orientation
"""
import sys
import os

SCRIPT_PATH = 'scripts/scrape-ambush-data.mjs'

if not os.path.exists(SCRIPT_PATH):
    print(f'ERROR: {SCRIPT_PATH} not found. Run this from the project root.')
    sys.exit(1)

with open(SCRIPT_PATH, 'r') as f:
    s = f.read()

# === Fix 1: replace downloadAll with placeholder-aware version ===
new_dl = """async function downloadAll(items,prefix=''){
  await ensureDir(PLAYERS_DIR);
  const PLACEHOLDER_SIZE=26865;
  let success=0,skipped=0,noPhoto=0;
  for(const p of items){
    if(!p.photoUrl)continue;
    const slug=(prefix?prefix+'-':'')+slugify(p.name);
    let ext='.png';try{ext=path.extname(new URL(p.photoUrl).pathname)||'.png';}catch{}
    const dest=path.join(PLAYERS_DIR,slug+ext);
    if(existsSync(dest)){
      const st=await fs.stat(dest);
      if(st.size===PLACEHOLDER_SIZE){await fs.unlink(dest);noPhoto++;continue;}
      p.localPhoto='/stl-ambush/players/'+slug+ext;skipped++;continue;
    }
    const ok=await downloadImage(p.photoUrl,dest);
    if(ok){
      const st=await fs.stat(dest);
      if(st.size===PLACEHOLDER_SIZE){
        await fs.unlink(dest);noPhoto++;
        console.log('  (no photo) '+p.name);
        continue;
      }
      p.localPhoto='/stl-ambush/players/'+slug+ext;success++;
      console.log('  + '+p.name);
    }
  }
  console.log('  Downloaded '+success+', cached '+skipped+', no-photo '+noPhoto);
}"""

start_marker = "async function downloadAll(items,prefix=''){"
start = s.find(start_marker)
if start < 0:
    print('ERROR: downloadAll function not found')
    sys.exit(1)

# Find matching closing brace by counting braces
depth = 0
end = start
i = start
in_string = False
string_char = None
while i < len(s):
    c = s[i]
    if in_string:
        if c == '\\':
            i += 2
            continue
        if c == string_char:
            in_string = False
    else:
        if c in ('"', "'", '`'):
            in_string = True
            string_char = c
        elif c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    i += 1

if end == start:
    print('ERROR: could not find end of downloadAll function')
    sys.exit(1)

s = s[:start] + new_dl + s[end:]
print('Fix 1: replaced downloadAll')

# === Fix 2: schedule regex — lookahead instead of fixed close ===
old_re = 'const gameRegex=/<div class="game"[^>]*>([\\s\\S]*?)<\\/div><\\/div>\\s*<\\/div>/g;'
new_re = 'const gameRegex=/<div class="game"[^>]*>([\\s\\S]*?)(?=<div class="game"|$)/g;'
if old_re in s:
    s = s.replace(old_re, new_re)
    print('Fix 2: replaced game regex')
else:
    print('WARNING: old gameRegex not found, skipping Fix 2')

# === Fix 3: score assignment should respect home/away ===
old_scores = "      ourScore:scores[0],\n      oppScore:scores[1],"
new_scores = "      ourScore:ourIsHome?scores[0]:scores[1],\n      oppScore:ourIsHome?scores[1]:scores[0],"
if old_scores in s:
    s = s.replace(old_scores, new_scores)
    print('Fix 3: fixed score assignment')
else:
    print('WARNING: old score assignment not found, skipping Fix 3')

# === Fix 4: result fallback from scores when span missing ===
old_res = 'const result=resM?resM[1]:null;'
new_res = "let result=resM?resM[1]:null;\n    if(!result && scores.length>=2){\n      const ourSc=ourIsHome?scores[0]:scores[1];\n      const oppSc=ourIsHome?scores[1]:scores[0];\n      result=ourSc>oppSc?'W':(ourSc<oppSc?'L':'T');\n    }"
if old_res in s:
    s = s.replace(old_res, new_res)
    print('Fix 4: added result fallback')
else:
    print('WARNING: old result line not found, skipping Fix 4')

with open(SCRIPT_PATH, 'w') as f:
    f.write(s)

print('\nDone. Run: node scripts/scrape-ambush-data.mjs')
