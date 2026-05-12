# Editing the App's Data

All real data — roster, schedule, coaches — lives in JSON files under `src/data/`. To update any of them: edit the file in any text editor, save, and push to GitHub. Deploy is automatic. Takes ~30 seconds.

## `src/data/schedule.json`

The full season schedule. Each game has these fields:

| Field | What it does |
| --- | --- |
| `id` | Unique identifier. Anything string is fine (I use the date as `MMDDYY`). |
| `date` | ISO date string (`YYYY-MM-DD`). Used for sorting and "upcoming vs past" logic. |
| `day` | 3-letter day of week (`SAT`, `SUN`, etc.) — displayed in the date block. |
| `dateLabel` | The number shown in the date block (`15`, `01`, etc.) |
| `monthLabel` | 3-letter month (`NOV`, `DEC`). |
| `time` | Display string for game time. |
| `opponent` | Full opponent name. Match the format we use elsewhere (e.g. `"San Diego Sockers"`, `"Kansas City Comets"`). The app uses the last word to look up the team logo, so spelling matters. |
| `isHome` | `true` if home, `false` if away. |
| `venue` | Display string. |
| `promo` | Promo night name like `"Hispanic Heritage Night"`, or `null` if no promo. |
| `status` | `"upcoming"` or `"final"`. Final games show the result, upcoming games show a Tickets button. |
| `result` | `"W"`, `"L"`, or `null`. |
| `score` | Display string like `"5-3"` or `null`. |
| `notes` | Optional notes (not displayed yet, but stored for future use). |

### When a game finishes:
1. Open `src/data/schedule.json`
2. Find the game by `id` or date
3. Change `status` from `"upcoming"` to `"final"`
4. Fill in `result` (`"W"` or `"L"`) and `score` (e.g. `"6-5"`)
5. Save, commit, push

## `src/data/roster.json`

Player list. Each player can have these fields:

| Field | Required | What it does |
| --- | --- | --- |
| `num` | Yes | Jersey number as a string (`"7"`, `"10"`). |
| `name` | Yes | Full name. |
| `pos` | Yes | One of `"F"`, `"M"`, `"D"`, `"GK"`. Drives which roster section the player appears in. |
| `tag` | No | Optional badge: `"CAPTAIN"`, `"TOP SCORER"`, etc. |
| `hometown` | No | City, State / Country. |
| `height` | No | Display string like `"5'10\""`. |
| `age` | No | Number. |
| `years` | No | `"3rd season"`, `"Rookie"`, etc. |
| `college` | No | School name or `"—"`. |
| `bio` | No | 1-2 sentences. Shows on the player detail page. |
| `stats` | No | Object: `{gp, g, a, pts, sh}` for skaters, `{gp, w, l, sv, gaa}` for keepers. |
| `photo` | No | Full URL to a headshot. Leave out to show the jersey-number watermark instead. |

### To add a player:
Add a new object to the `players` array. Order doesn't matter — the app groups them by position automatically.

### To remove a player:
Delete the object from the array.

## `src/data/coaches.json`

Coaching staff and front office. The `coaches` array has these fields:

| Field | What it does |
| --- | --- |
| `id` | Unique short id. |
| `name` | Coach's name. |
| `title` | Primary role (`"Head Coach"`, `"Assistant Coach"`). |
| `subtitle` | Secondary role (`"Co-Owner / GM"`). |
| `photo` | Full URL to headshot. |
| `bio` | Short bio (1-3 sentences). |
| `isHero` | `true` for one coach (the head coach typically) — gets the big hero card treatment. All others get the small row treatment. |
| `badge` | Optional pink badge label (`"Coach of the Year"`). Usually only on the hero coach. |

The `frontOffice` array is simpler — just `name` and `title` per person.

## `src/data/news.json`

Auto-updated every 4 hours by the GitHub Action `scrape-news.yml`. **Don't edit manually** — your edits will be overwritten on the next scrape. If you want to add a manual headline, edit the scraper script instead.

## `src/data/photos.js`

Hero photos for the Home tab carousel. To swap in new photos:

1. Drop the new JPG into `public/hero/` (recommended: `1200px` wide, JPEG quality 82, under 300KB)
2. Edit `src/data/photos.js` and add it to the `heroPhotos` array
3. Save, push, done

## `src/data/teams.js`

MASL opponent logo URLs. These are hotlinked from the team CDN, so they auto-update if the league changes a logo. If a new opponent joins the league, add their entry here.

---

## Workflow tips

- Use a text editor that knows JSON (VS Code, Sublime, even GitHub's web editor) — it'll warn you about missing commas or quotes.
- Always validate JSON by running `npm run dev` before pushing — Vite will show an error if the JSON is malformed.
- The `_comment` fields at the top of each JSON file are ignored by the app. They're notes to your future self.
- Pushing to `main` automatically rebuilds and redeploys via GitHub Actions. Allow ~2 minutes after push to see changes on the live site.
