// Live GBIF data pipeline (the intended production data source).
//
//   node scripts/fetch-gbif.mjs
//
// For each pathogen name it calls the GBIF species-match + usage endpoints,
// extracts the full classification, runs it through the SAME updated-name
// normalizer used by the bundled build, and writes data/bacteria.json and
// src/data.js — identical schema to scripts/build-dataset.mjs.
//
// Why this also ships with a pre-built dataset: the environment this game was
// developed in blocks outbound egress to api.gbif.org, so the committed dataset
// was produced by scripts/build-dataset.mjs from a curated, normalized seed.
// Run THIS script anywhere GBIF is reachable to (re)generate from the live API
// and to scale the pool up toward ~500 species by extending PATHOGENS below.
//
// Node 18+ has global fetch. Behind a proxy, run with NODE_USE_ENV_PROXY=1 and,
// if a custom CA is required, NODE_EXTRA_CA_CERTS=/path/to/ca-bundle.crt.

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SEED } from './seed-taxa.mjs';
import { normalizeRecord } from '../src/normalize.mjs';
import { finalize, writeOutputs } from './finalize.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// The pathogen work list. Seeded from the curated groups (pre-normalization
// binomials, as GBIF knows them); append more "Genus species" strings here to
// grow the pool toward ~500.
const PATHOGENS = [
  ...new Set(SEED.flatMap((g) => g.taxa.map(([genus, sp]) => `${genus} ${sp}`))),
  // e.g. 'Legionella micdadei', 'Vibrio mimicus', 'Rickettsia africae', ...
];

const API = 'https://api.gbif.org/v1';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'bacteria-taxonomy-game' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function lookup(name) {
  // 1) Fuzzy match to a backbone usageKey.
  const match = await getJSON(`${API}/species/match?kingdom=Bacteria&name=${encodeURIComponent(name)}`);
  if (!match || match.matchType === 'NONE' || !match.usageKey) {
    return { name, ok: false, reason: match?.matchType || 'no match' };
  }
  // 2) Pull the full record for the ranked classification.
  const sp = await getJSON(`${API}/species/${match.usageKey}`);
  const rec = normalizeRecord({
    kingdom: 'Bacteria',
    phylum: sp.phylum || match.phylum,
    class: sp.class || match.class,
    order: sp.order || match.order,
    family: sp.family || match.family,
    genus: sp.genus || match.genus,
    species: (sp.species || match.species || name).split(' ').slice(1).join(' ') || name.split(' ')[1],
  });
  // Only keep records with a complete lineage — the game needs every rank.
  const complete = ['phylum', 'class', 'order', 'family', 'genus', 'species'].every((r) => rec[r]);
  return complete ? { ok: true, rec } : { name, ok: false, reason: 'incomplete lineage' };
}

async function main() {
  const records = [];
  const failures = [];
  const seen = new Set();

  for (const name of PATHOGENS) {
    try {
      const r = await lookup(name);
      if (r.ok) {
        const key = `${r.rec.genus} ${r.rec.species}`;
        if (!seen.has(key)) { seen.add(key); records.push(r.rec); }
      } else {
        failures.push(`${name} (${r.reason})`);
      }
    } catch (err) {
      failures.push(`${name} (${err.message})`);
    }
    await sleep(120); // be polite to the API
  }

  // Cap genera at 4, attach lab profiles, sort, and write both outputs.
  const finalRecords = finalize(records);
  const meta = writeOutputs(root, finalRecords, 'gbif');

  console.log(`Fetched ${meta.count} records · ${meta.genera} genera · ${meta.phyla} phyla · ${meta.profiled} with lab profiles`);
  if (failures.length) console.warn(`Skipped ${failures.length}:\n  ${failures.join('\n  ')}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
