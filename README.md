# gta6-trophy-guide-01
[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Ngntier/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Ngntier/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA VI

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver and 46 bronze, 28 of them hidden on PlayStation until earned.

Every trophy shows its **official name, description and grade** as PlayStation publishes them (Exophase / PSNProfiles, 18 November 2026), plus a guide written for this entry **in our own words** that names its source beside it — PowerPyx's trophy guide and roadmap, and Push Square's trophy guide and roadmap. Four trophies have no confirmed unlock method at launch (In The Beginning…, Bad Luck, I Guess, The Truth Is Out There, Ten Pin); those guides say so honestly instead of guessing.

## What it does

- **Tracker** — tick trophies off; progress is saved in the browser (localStorage), with export to a JSON file and import back.
- **Filters** — by kind (story, missable, collectibles, activities, online), by grade, and by free-text search. There are no online trophies: all 55 unlock in single-player.
- **Spoiler setting** — hides the names and descriptions of the 18 story trophies until you have earned them.
- **Platinum roadmap** — three steps (story → 100% Completion checklist → Strangers & Freaks cleanup), built from the official descriptions, with the one possibly missable trophy flagged: Positive Mental Attitude, whose Chapter 1 balcony meditation may be required and is gone after Chapter 1.
- **Offline** — plain static files under `app/`; nothing is loaded over the network. Open `app/index.html` in a browser with the network off and it works.

## How to run

```sh
node serve.ts        # serves app/ at http://localhost:8080
```

Or open `app/index.html` directly from any static file server with `app/` at its root.

## How to hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/dossier.json
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library in `vendor/makefun-frontend.ts` (unchanged from the kit).

## Layout

- `app/index.html`, `app/app.js`, `app/style.css` — the guide (no build step, no external assets)
- `app/data/trophies.json` — all 55 trophies: official name, description, grade, hidden flag, kind, missable flag, chapter, target, guide and cited source
- `screenshots/` — genuine headless-Chrome captures of the built app
- `shots.json` — what each screenshot shows

<sub>Entered on [make.fun](https://make.fun/?ref=t1h9wdbp&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
