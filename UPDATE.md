# Update — Full Real Roster

The full 31-player Ambush roster is in. Names, jersey numbers, positions, pronunciations, heights, weights, ages, hometowns — all sourced from the 3/1/26 game notes pronunciation guide.

## What's new

### Real 31-player MASL roster

All players in `src/data/roster.json`, sorted by jersey number, grouped by position in the Team tab:

- **10 Forwards** including #11 Robert Kristo (6'5", St. Louis), #88 Duduca Carvalho (Brazil), #20 James Thomas (Doncaster, England), #70 Ozzy Santana (Brazil)
- **9 Midfielders** including #10 Lucas Almeida (Brazil), #19 Daniel Torrealba (Venezuela), #91 Randy Martinez (California)
- **8 Defenders** including #33 Andres Chalbaud (Venezuela), #66 James Togbah (Liberia)
- **4 Goalkeepers** including #0 Eduardo "Pollo" Cortes, #17 Paulo Nascimento, #37 Dominic Haggard, #99 Jose Ogaz

Player detail pages (tap any player card) now show:
- **Height, weight, age** in the info strip
- **Pronunciation guide** section ("Say It Right") with a tasteful editorial treatment — this is a signature detail no other team app has
- **Birthdate** below the pronunciation
- Sections for bio, college, and season stats automatically hide when not present (currently null across the board — easy to fill in later)

### Player profile page restructure

Rewrote the PlayerProfile component to gracefully handle the data we actually have. Replaced "Tenure" with "Weight" in the info strip. Added the pronunciation guide as section 01 (since that's what we have for everyone). Bio, college, and stats sections render only when those fields exist — no awkward "—" placeholders.

## Files changed / added

**Modified:**
- `src/data/roster.json` — populated with 31 real players (was empty scaffold)
- `src/AmbushApp.jsx` — PlayerProfile rewritten to handle the real-world data shape, gracefully omits sections that aren't filled in

## How to apply

```bash
cd ~/Documents/stl-ambush
# Drop the new project on top of your existing folder (replace files)

npm install         # safe to run
npm run dev         # preview locally
```

Verify locally:
- Team tab → MASL should now show four roster sections: Forwards, Midfielders, Defenders, Goalkeepers
- Each player card shows their number, name (with last name in italic-pink), and position badge
- Tap any player to see their detail page — pronunciation guide is a nice touch fans will notice
- Info strip shows Height/Weight/Age
- Footer at bottom of Team tab shows "2025–26 Squad · 31 Active"

When happy:

```bash
git add .
git commit -m "Real Ambush roster: 31 players with pronunciation guide"
git push
```

## Honest disclosures

- The pronunciation guide is the most distinctive feature here — none of the other MASL team apps have this, and it directly addresses a common frustration where fans don't know how to say players' names. Worth showing off.
- Bios are currently null for everyone. Per-player bio writing is a 5-10 minute exercise per player when you have time. Easy to do in batches.
- College info isn't in the game notes data — would need a separate source.
- Season stats are also blank. When you want these, the cleanest approach is to either get DigitalShift API access (cleaner long-term) or to maintain them manually in roster.json after each game.
- The "TOP SCORER" / "CAPTAIN" tags from the previous mock are gone. To add a tag for a specific player, just add `"tag": "CAPTAIN"` to their entry in `roster.json` — the player card shows it as a pink badge.
- I sorted everyone by jersey number, but the position grouping is the primary view. The number sort is just a sensible default within each position group.

## What's still pending

- Player headshots — still showing the big translucent jersey-number watermark. Real photos require either SoccerShift API access or you sending individual photos.
- Player bios — null for everyone, ready to fill in.
- Season stats — null for everyone.
- FC Ambush USL2 roster — still empty (separate platform at modular11.com).
- Loyalty backend — still mock data.

The "real data" workstream is now substantively done. The Home tab, Schedule tab, Team tab, and Tickets tab all show real verifiable data from the actual team.

## What's next

The two remaining big workstreams:

1. **Player headshots + bios** — adding visual depth to the player pages. Two paths: ask Donnie for press kit photos, or photograph players ourselves at the next home opener.
2. **Loyalty backend (Supabase)** — turning the loyalty tab from a mockup into a working feature. This is the demo-to-ownership feature.

Or pivot to the **Heritage Hub** (the "St. Louis soccer started here" content section we keep deferring).

Your call.
