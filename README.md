# 🧬 Phylotype — Bacterial Taxonomy Game

A browser game where you identify a random **pathogenic bacterium** from its
taxonomy, one rank at a time. You're given only the Kingdom (*Bacteria*); every
guess that shares part of the true lineage reveals those ranks and grows an
animated **dendrogram** toward the answer. Solve it in as few guesses as
possible.

Runs on desktop and mobile — no build step, no dependencies, no framework.

## How it works

1. A random bacterium is chosen. You know its Kingdom (*Bacteria*); Phylum →
   Species are hidden.
2. Guess a **genus** and **species**. The genus fixes the whole lineage above it
   (Phylum, Class, Order, Family), so each guess is compared rank-by-rank against
   the hidden answer.
3. Every rank that matches is **confirmed** and revealed. The dendrogram extends
   down through the confirmed trunk (green). Where your guess diverges from the
   truth it **branches off** (red), and a pulsing **`?`** node marks the rank
   where the real answer went a different way.
4. All previous guesses are retained in their correct place on the tree, so the
   picture of what you know accumulates with every turn.

The tree is a custom SVG renderer with a `requestAnimationFrame` tween: existing
nodes glide to their new positions while new branches sprout out of their parent,
and confirmed ranks transition to green. It honours `prefers-reduced-motion`.

## Running it

It's a static site. Serve the folder over HTTP (ES modules don't load from
`file://`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Or deploy the folder as-is to GitHub Pages / any static host.

## Taxonomic data

### Updated nomenclature

Bacterial higher taxa were extensively renamed under the 2021 ICNP reform
(phyla now take the standardised `-ota` suffix) and several groups were
reclassified. All data is passed through [`src/normalize.mjs`](src/normalize.mjs)
so the game always speaks current nomenclature. Examples:

| Legacy name | Current name |
| --- | --- |
| *Firmicutes* (phylum) | **Bacillota** |
| *Proteobacteria* (phylum) | **Pseudomonadota** |
| *Actinobacteria* (phylum) | **Actinomycetota** |
| *Tenericutes* (phylum) | **Mycoplasmatota** |
| *Epsilonproteobacteria* (class) | **Campylobacterota** (phylum) / **Campylobacteria** (class) |
| order *Corynebacteriales* | **Mycobacteriales** |
| *Clostridium difficile* | **Clostridioides difficile** |
| *Propionibacterium acnes* | **Cutibacterium acnes** |
| *Enterobacter aerogenes* | **Klebsiella aerogenes** |

### Where the data comes from

The intended production source is the **GBIF** taxonomic backbone. Two pipelines
produce the identical dataset schema (`data/bacteria.json` + the browser module
`src/data.js`):

- **[`scripts/fetch-gbif.mjs`](scripts/fetch-gbif.mjs)** — the live path. For each
  pathogen it calls GBIF's species-match + usage endpoints, extracts the full
  classification, and normalizes it. Extend the `PATHOGENS` list to scale the
  pool up toward ~500 species.

  ```bash
  node scripts/fetch-gbif.mjs
  ```

- **[`scripts/build-dataset.mjs`](scripts/build-dataset.mjs)** — the bundled path.
  Flattens a curated, grouped seed of pathogenic bacteria
  ([`scripts/seed-taxa.mjs`](scripts/seed-taxa.mjs)) through the same normalizer.

  ```bash
  node scripts/build-dataset.mjs
  ```

> **Why a bundled dataset ships in the repo:** the sandbox this was developed in
> blocks outbound egress to `api.gbif.org`, so the committed dataset was generated
> by `build-dataset.mjs` from the curated seed — written in GBIF's *legacy*
> nomenclature precisely so the normalizer does real work. The seed's names,
> lineages, and diseases are hand-verified. Run `fetch-gbif.mjs` in any
> environment with GBIF access to regenerate from the live API and grow the pool.

## Project layout

```
index.html                 markup + modals
assets/styles.css          responsive dark "lab" theme + tree/animation styles
src/
  data.js                  generated dataset (BACTERIA + META) — imported by the game
  normalize.mjs            updated-nomenclature normalizer (used by both scripts)
  game.js                  game state, rank comparison, dendrogram construction
  tree.js                  animated SVG dendrogram renderer
  main.js                  UI wiring, comboboxes, modals
scripts/
  seed-taxa.mjs            curated pathogen seed (legacy names, grouped by lineage)
  build-dataset.mjs        seed → normalize → data.js + bacteria.json
  fetch-gbif.mjs           live GBIF pull → data.js + bacteria.json
data/bacteria.json         portable generated dataset
```

## Regenerating the dataset

After editing the seed or the normalizer:

```bash
node scripts/build-dataset.mjs   # rebuild from the curated seed
# or
node scripts/fetch-gbif.mjs      # rebuild from live GBIF (needs network)
```

Both rewrite `data/bacteria.json` and `src/data.js`; reload the page to play with
the new pool.
