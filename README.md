# 🧬 Phylotype — Bacterial Taxonomy & Identification Game

A browser game where you identify a random **pathogenic bacterium** in as few
guesses as possible. You start knowing only its Kingdom (*Bacteria*) and work
toward the answer through **four modes**:

- **Taxonomic** — guess a genus + species; every matching rank (Phylum → Species)
  is confirmed and an animated **dendrogram** grows down the trunk. Wrong guesses
  branch off, and a pulsing **`?`** marks where the true lineage diverges.
- **Identifier** — a grid of ~20 lab results (Gram stain, catalase, haemolysis,
  fermentation…). Each guess colours cells **green** (exact), **orange** (partial
  / variable), or **red** (no match). Green cells **lock**; each guess only
  updates the rest — a phenotypic Mastermind.
- **Combined** — both surfaces update together.
- **Quiz** — no organism to hunt: answer **20 random multiple-choice questions**
  drawn from the logged lab data — e.g. *"What is the Gram stain result for
  Staphylococcus aureus?"* — with options spanning that identifier's possible
  results. Pick an answer to lock it in and see if you were right, track your
  running score, and get a per-question review at the end. Questions are built
  from whatever pool is active; a sparse Supabase list simply serves as many
  questions as its data supports.

Runs on desktop and mobile — no build step, no framework. A **rotating DNA
double-helix** rendered with three.js drifts behind the glassy UI and parallaxes
gently toward the pointer; it's purely decorative (`aria-hidden`, non-interactive)
and honours `prefers-reduced-motion`. three.js is **vendored** in
[`assets/vendor/`](assets/vendor/) so the site stays self-contained and offline —
no CDN, no package install at serve time.

## The identifier grid

Each identifier compares your guessed organism's value against the hidden
answer's:

| Colour | Meaning |
| --- | --- |
| 🟩 Green | Exact match — **locked**, shows the true value |
| 🟧 Orange | Partial — a "Variable" / "Temp-variable" overlap, or a shared item in a multi-value field (shape, fermentation) |
| 🟥 Red | No match — shows what your guess had |
| ⬜ Grey | Not scorable (unknown for that organism) |

Identifiers: Gram stain, shape, motility, spores; the enzymes oxidase, catalase,
coagulase, aesculin, PYR/PYZ; the biochemicals indole, methyl red,
Voges-Proskauer, citrate, nitrate reduction, urease; fermentation (glucose/
lactose/maltose/sucrose/mannitol) and Hugh–Leifson O/F; haemolysis and atmosphere.

The **MALDI-TOF** button on each mode reveals the answer outright — as the mass
spectrometer would in the lab. An optional **BMS mode** toggle roasts you for
every wrong guess after your first, in the finest biomedical-scientist tradition.
With BMS mode on, the MALDI-TOF shortcut is taken away entirely: clicking it pops
up a jeer for reaching for the easy way out, and once dismissed the button reads
**"No ID, low confidence."** — you sign it out yourself.

## Running it

It's a static site. Serve the folder over HTTP (ES modules don't load from
`file://`):

```bash
python3 -m http.server 8000       # then open http://localhost:8000
```

Or deploy the folder as-is to GitHub Pages / any static host. A `.nojekyll` file
is included so the `src/` and `assets/` folders serve verbatim.

## Data

### The pool

The bundled dataset is **151 pathogenic bacteria across 78 genera and 9 phyla**,
each genus **capped at 4 species** so guessing stays tractable. **All 151** now
carry hand-authored lab profiles — so the entire pool is playable in the
Identifier and Combined modes (and drives the Quiz), not just a curated core.
Obligate intracellular, wall-less, and spirochaete taxa are profiled by
morphology and atmosphere only, since the routine biochemical panel doesn't
apply to them.

### Updated nomenclature

All taxonomy is normalized to current (post-2021 ICNP) names via
[`src/normalize.mjs`](src/normalize.mjs): e.g. *Firmicutes* → **Bacillota**,
*Proteobacteria* → **Pseudomonadota**, *Actinobacteria* → **Actinomycetota**, the
*Epsilonproteobacteria* → **Campylobacterota** reclassification, order
*Corynebacteriales* → **Mycobacteriales**, and binomials like *Clostridium
difficile* → **Clostridioides difficile**, *Propionibacterium acnes* →
**Cutibacterium acnes**.

### Where it comes from (GBIF)

The intended production source is the **GBIF** taxonomic backbone. Two pipelines
produce the identical dataset schema (`data/bacteria.json` + the browser module
`src/data.js`):

- **[`scripts/fetch-gbif.mjs`](scripts/fetch-gbif.mjs)** — the live path: matches
  each pathogen against GBIF's species endpoints, normalizes the classification,
  caps genera, and merges lab profiles. Extend the `PATHOGENS` list to scale
  toward ~500.
- **[`scripts/build-dataset.mjs`](scripts/build-dataset.mjs)** — the bundled path:
  flattens the curated seed ([`scripts/seed-taxa.mjs`](scripts/seed-taxa.mjs))
  through the same normalizer and finalizer.

```bash
node scripts/build-dataset.mjs    # rebuild from the curated seed
node scripts/fetch-gbif.mjs       # rebuild from live GBIF (needs network)
```

> The committed dataset was built from the curated seed because the development
> sandbox blocks egress to `api.gbif.org`. Both scripts share
> [`scripts/finalize.mjs`](scripts/finalize.mjs) (cap + profile-merge + output)
> so the two paths stay identical.

### Lab profiles

Hand-authored phenotypic profiles live in
[`scripts/profiles.mjs`](scripts/profiles.mjs), keyed by current binomial and
merged into records at build time. Only confidently-known results are filled in;
anything omitted renders as a neutral cell and doesn't score. Values are derived
from standard clinical-microbiology references (Manual of Clinical Microbiology,
Bergey's, Koneman's); for strain-level nuance, cross-check individual reactions
against [BacDive](https://bacdive.dsmz.de/).

### Filling profile gaps from BacDive (optional)

[`scripts/fetch-bacdive.mjs`](scripts/fetch-bacdive.mjs) pulls phenotypic data
from the **[BacDive](https://bacdive.dsmz.de/) API v2** (DSMZ) to fill cells left
blank in the curated profiles. **No credentials are needed** — API v2 (2026-02)
is public; usage must comply with [BacDive's terms](https://bacdive.dsmz.de/about).

```bash
node scripts/fetch-bacdive.mjs --selftest        # offline: verify the field mapping
node scripts/fetch-bacdive.mjs --limit 5         # try a handful of species first
node scripts/fetch-bacdive.mjs --write           # full run; also emit the gap-fill module
node scripts/build-dataset.mjs                   # rebuild data with the fills merged in
```

For each organism it queries `taxon/{genus}/{species}` → `fetch/{ids}`, maps
BacDive's enzyme / metabolite / morphology fields onto the identifier vocabulary,
and **aggregates across strains** (unanimous → that value; conflicting +/- →
`Variable`). It writes a review table (`scripts/bacdive-proposals.md` + `.json`)
and, with `--write`, `scripts/profiles.bacdive.mjs`. That module is merged
**under** the curated profiles by [`scripts/finalize.mjs`](scripts/finalize.mjs),
so a hand-authored value always wins and BacDive only fills genuine blanks.
Delete the generated module to drop the BacDive-sourced fills.

> Run it where BacDive is reachable (e.g. your machine or CI); some sandboxed
> environments block egress to `api.bacdive.dsmz.de`.

## Loading your own lists from Supabase (optional)

You can swap the bundled pool for bacteria lists stored in your **SpeciesDoc**
Supabase project. The game plays fine with no configuration; to enable it, edit
[`src/config.js`](src/config.js):

1. Set `enabled: true` and fill in your project `url` + `anonKey` (the anon key is
   safe in frontend code with Row Level Security enabled).
2. Point `table` and the `columns` map at your schema. Only `genus` + `species`
   are required — missing taxonomy is filled from the bundled facts by name.
3. Optionally set `columns.list` to a grouping column to expose named,
   selectable lists, and `identifierColumns` if your rows already store lab
   results (otherwise bundled profiles are used).

An in-game **Data source** dropdown then lets players pick a list;
[`src/supabase.js`](src/supabase.js) fetches and maps the rows, falling back to
bundled facts for anything a row doesn't supply.

## Project layout

```
index.html                 markup, mode tabs, panels, modals, helix canvas
assets/styles.css          responsive dark theme + tree/grid/animation styles
assets/vendor/             vendored three.js (three.module.min.js) + its licence
src/
  background.js            three.js DNA-helix backdrop (pointer parallax)
  data.js                  generated dataset (BACTERIA + META)
  normalize.mjs            updated-nomenclature normalizer
  identifiers.js           identifier schema + comparison logic
  game.js                  game state: taxonomy comparison + identifier grid
  tree.js                  animated SVG dendrogram renderer
  idgrid.js                identifier grid renderer
  quiz.js                  Quiz mode — question generation + view
  config.js                Supabase configuration (yours to fill in)
  supabase.js              Supabase data adapter
  main.js                  UI wiring: modes, data source, comboboxes, modals
scripts/
  seed-taxa.mjs            curated pathogen seed (legacy names, grouped)
  profiles.mjs             hand-authored lab profiles
  normalize / finalize     shared pipeline helpers
  build-dataset.mjs        seed → data
  fetch-gbif.mjs           live GBIF → data
  fetch-bacdive.mjs        BacDive API v2 → gap-fill blank identifier cells
data/bacteria.json         portable generated dataset
```
