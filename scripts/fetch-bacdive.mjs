// Fill blank identifier cells from BacDive (https://bacdive.dsmz.de), the DSMZ
// bacterial diversity database.
//
//   node scripts/fetch-bacdive.mjs [options]
//
// BacDive API v2 (2026-02) is PUBLIC — no registration or credentials required.
// Usage of the data must comply with BacDive's terms of use:
// https://bacdive.dsmz.de/about . This script only reads species-level phenotype
// data and proposes values for cells that are currently BLANK in the bundled
// dataset; it never overrides a curated value in scripts/profiles.mjs.
//
// What it does, per organism in src/data.js:
//   1. GET  v2/taxon/{genus}/{species}      → the BacDive IDs for that species
//   2. GET  v2/fetch/{id;id;…}              → full strain records
//   3. maps BacDive fields onto this game's identifier vocabulary and aggregates
//      across strains (unanimous → that value; conflicting +/- → "Variable")
//   4. keeps only the fields that are blank in the current profile.
//
// Outputs (in scripts/):
//   • bacdive-proposals.md    — human-readable review table (value + evidence)
//   • bacdive-proposals.json  — { "Genus species": { key: value, … }, … }
//   • profiles.bacdive.mjs    — [only with --write] gap-fill module that
//                               finalize.mjs merges UNDER the curated profiles
//                               (curated always wins), so a rebuild picks it up.
//
// Options:
//   --limit N         only the first N organisms (smoke test)
//   --only "G sp"     comma-separated binomials to restrict to
//   --max-strains M   cap strains fetched per species (default 40)
//   --delay MS        pause between species (default 350ms; be polite)
//   --predictions     include BacDive's predicted values (default: measured only)
//   --write           also write scripts/profiles.bacdive.mjs
//   --base URL        override API base (default https://api.bacdive.dsmz.de/v2/)
//
// NOTE: this environment blocks egress to api.bacdive.dsmz.de, so run it where
// BacDive is reachable (your machine / CI). No API key needed.

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFileSync } from 'node:fs';
import { BACTERIA } from '../src/data.js';
import { IDENTIFIERS } from '../src/identifiers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// ── CLI ──────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name, def) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const LIMIT = opt('--limit') ? Number(opt('--limit')) : Infinity;
const ONLY = opt('--only') ? opt('--only').split(',').map((s) => s.trim().toLowerCase()) : null;
const MAX_STRAINS = Number(opt('--max-strains', '40'));
const DELAY = Number(opt('--delay', '350'));
const PREDICTIONS = flag('--predictions');
const WRITE = flag('--write');
const BASE = opt('--base', 'https://api.bacdive.dsmz.de/v2/').replace(/\/?$/, '/');

const LABEL = Object.fromEntries(IDENTIFIERS.map((s) => [s.key, s.label]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── HTTP (public v2; retry on 429/5xx) ───────────────────────────────────────
async function api(path, attempt = 0) {
  const url = path.startsWith('http') ? path : BASE + path;
  const withPred = PREDICTIONS ? url + (url.includes('?') ? '&' : '?') + 'predictions=1' : url;
  let resp;
  try {
    resp = await fetch(withPred, {
      headers: { Accept: 'application/json', 'User-Agent': 'Phylotype/1.0 (educational; BacDive API v2)' },
    });
  } catch (err) {
    if (attempt < 5) { await sleep(1000 * 2 ** attempt); return api(path, attempt + 1); }
    throw err;
  }
  if ([429, 500, 502, 503, 504].includes(resp.status) && attempt < 5) {
    await sleep(1000 * 2 ** attempt);
    return api(path, attempt + 1);
  }
  if (!resp.ok) return { _error: resp.status };
  return resp.json();
}

// ── BacDive field → game vocabulary mapping ──────────────────────────────────
// A "+/positive/yes" → P, "-/negative/no" → N, ambiguous → V.
function pnv(raw) {
  if (raw == null) return null;
  const s = String(raw).trim().toLowerCase();
  if (['+', 'positive', 'yes', 'true', 'pos'].includes(s)) return 'P';
  if (['-', 'negative', 'no', 'false', 'neg'].includes(s)) return 'N';
  if (['+/-', '-/+', 'variable', 'v', '(+)', '(-)', 'weak'].includes(s)) return 'V';
  return null;
}

// Recursively collect every value stored under a key matching `pred`.
function collect(node, pred, out = []) {
  if (Array.isArray(node)) { for (const x of node) collect(x, pred, out); return out; }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (pred(k.toLowerCase())) out.push(v);
      collect(v, pred, out);
    }
  }
  return out;
}
const firstString = (vals) => vals.find((v) => typeof v === 'string');

// Enzyme/metabolite rows can be a single object or an array of them.
function rows(vals) {
  const out = [];
  for (const v of vals) {
    if (Array.isArray(v)) out.push(...v.filter((x) => x && typeof x === 'object'));
    else if (v && typeof v === 'object') out.push(v);
  }
  return out;
}

const SUGARS = { glucose: 'Glucose', 'd-glucose': 'Glucose', lactose: 'Lactose', 'd-lactose': 'Lactose',
  maltose: 'Maltose', 'd-maltose': 'Maltose', sucrose: 'Sucrose', 'd-sucrose': 'Sucrose',
  mannitol: 'Mannitol', 'd-mannitol': 'Mannitol' };

// Extract a per-field reading from ONE BacDive strain record.
function readStrain(rec) {
  const r = {};
  const gram = firstString(collect(rec, (k) => k === 'gram stain'));
  if (gram) { const g = gram.toLowerCase();
    r.gram = g.includes('posi') ? 'Positive' : g.includes('nega') ? 'Negative' : g.includes('vari') ? 'Variable' : null; }
  const shape = firstString(collect(rec, (k) => k === 'cell shape'));
  if (shape) { const s = shape.toLowerCase();
    r.shape = s.includes('coccobac') ? ['Cocci', 'Bacilli']
      : s.includes('rod') || s.includes('bacill') || s.includes('filament') ? ['Bacilli']
      : s.includes('cocc') || s.includes('sphere') || s.includes('ovoid') ? ['Cocci']
      : s.includes('spiral') || s.includes('curved') || s.includes('vibrio') || s.includes('helical') ? ['Spiral'] : null; }
  const mot = firstString(collect(rec, (k) => k === 'motility'));
  if (mot) r.motility = /yes|motile|\+/.test(mot.toLowerCase()) && !/non/.test(mot.toLowerCase()) ? 'Motile' : 'Non-motile';
  const spore = firstString(collect(rec, (k) => k.includes('spore formation')));
  if (spore) r.spores = /yes|\+/.test(spore.toLowerCase()) ? 'Positive' : /no|-/.test(spore.toLowerCase()) ? 'Negative' : null;
  const oxy = firstString(collect(rec, (k) => k === 'oxygen tolerance'));
  if (oxy) { const o = oxy.toLowerCase();
    r.atmosphere = o.includes('facultative') ? 'Facultative'
      : o.includes('microaero') ? 'Microaerophilic'
      : o.includes('obligate anaerobe') || o === 'anaerobe' || o.includes('anaerob') ? 'Anaerobe'
      : o.includes('aerobe') || o.includes('aerobic') ? 'Aerobe' : null; }
  const haem = firstString(collect(rec, (k) => k.includes('hemolysis') || k.includes('haemolysis')));
  if (haem) { const h = haem.toLowerCase();
    r.haemolysis = h.includes('beta') ? 'Beta' : h.includes('alpha') ? 'Alpha' : h.includes('gamma') || h.includes('non') ? 'Gamma' : null; }

  // Enzymes: [{value|enzyme|metabolite, activity}]
  const enz = rows(collect(rec, (k) => k === 'enzymes' || k === 'enzyme'));
  const enzMap = { catalase: 'catalase', oxidase: 'oxidase', 'cytochrome oxidase': 'oxidase',
    urease: 'urease', coagulase: 'coagulase' };
  for (const e of enz) {
    const name = String(e.value ?? e.enzyme ?? e.metabolite ?? '').toLowerCase();
    const act = pnv(e.activity ?? e.value);
    if (!act) continue;
    for (const [needle, key] of Object.entries(enzMap)) if (name.includes(needle)) r[key] = act === 'P' ? 'Positive' : act === 'N' ? 'Negative' : 'Variable';
    if (name.includes('esculin') || name.includes('aesculin') || name.includes('beta-glucosidase')) r.aesculin = act === 'P' ? 'Positive' : act === 'N' ? 'Negative' : 'Variable';
    if (name.includes('pyrrolidonyl') || name.includes('pyrazinamid')) r.pyr = act === 'P' ? 'Positive' : act === 'N' ? 'Negative' : 'Variable';
    if (name.includes('nitrate reductase')) r.nitrate = act === 'P' ? 'Reducing' : act === 'N' ? 'Non-reducing' : 'Variable';
  }

  // Metabolite production: indole (→indole), acetoin (→Voges-Proskauer)
  const prod = rows(collect(rec, (k) => k === 'metabolite production'));
  for (const p of prod) {
    const name = String(p.metabolite ?? '').toLowerCase();
    const yes = pnv(p.production ?? p['production'] ?? p.activity);
    if (yes == null) continue;
    if (name.includes('indole')) r.indole = yes === 'P' ? 'Positive' : yes === 'N' ? 'Negative' : 'Variable';
    if (name.includes('acetoin')) r.vp = yes === 'P' ? 'Positive' : yes === 'N' ? 'Negative' : 'Variable';
  }

  // Metabolite utilization: citrate (→citrate), acid from sugars (→fermentation)
  const util = rows(collect(rec, (k) => k === 'metabolite utilization'));
  const ferm = new Set();
  for (const u of util) {
    const name = String(u.metabolite ?? '').toLowerCase();
    const act = pnv(u['utilization activity'] ?? u.activity);
    const kind = String(u['kind of utilization tested'] ?? '').toLowerCase();
    if (act == null) continue;
    if (name.includes('citrate') && /carbon|assimil|utili/.test(kind || 'carbon')) r.citrate = act === 'P' ? 'Positive' : act === 'N' ? 'Negative' : 'Variable';
    if (kind.includes('acid') && SUGARS[name] && act === 'P') ferm.add(SUGARS[name]);
  }
  if (ferm.size) r.fermentation = [...ferm];
  return r;
}

// Aggregate per-field readings across many strains into one proposal + evidence.
function aggregate(readings) {
  const proposal = {}, evidence = {};
  const multi = new Set(['shape', 'fermentation']);
  const keys = new Set(readings.flatMap((r) => Object.keys(r)));
  for (const key of keys) {
    if (multi.has(key)) {
      const tally = new Map(); let n = 0;
      for (const r of readings) if (r[key]) { n++; for (const item of r[key]) tally.set(item, (tally.get(item) || 0) + 1); }
      const chosen = [...tally.entries()].filter(([, c]) => c * 2 >= n).map(([v]) => v); // in ≥50% reporting strains
      if (chosen.length) { proposal[key] = chosen; evidence[key] = `${n} strain(s): ${[...tally].map(([v, c]) => `${v}×${c}`).join(', ')}`; }
      continue;
    }
    const counts = {};
    for (const r of readings) if (r[key]) counts[r[key]] = (counts[r[key]] || 0) + 1;
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (!entries.length) continue;
    const total = entries.reduce((a, [, c]) => a + c, 0);
    // Positive/Negative disagreement on a P/N field → Variable.
    const hasP = counts.Positive || counts.Reducing, hasN = counts.Negative || counts['Non-reducing'];
    let value = entries[0][0];
    if (hasP && hasN) value = key === 'nitrate' ? 'Variable' : 'Variable';
    proposal[key] = value;
    evidence[key] = `${total} strain(s): ${entries.map(([v, c]) => `${v}×${c}`).join(', ')}`;
  }
  return { proposal, evidence };
}

// ── Self-test (offline mapping check; no network) ────────────────────────────
// `node scripts/fetch-bacdive.mjs --selftest` exercises readStrain/aggregate on
// a synthetic BacDive-shaped record so the mapping can be verified without API
// access. Field names mirror the BacDive v2 record structure.
if (flag('--selftest')) {
  const strainA = {
    Morphology: { 'cell morphology': { 'gram stain': 'negative', 'cell shape': 'rod-shaped', motility: 'yes' } },
    'Culture and growth conditions': { 'oxygen tolerance': { 'oxygen tolerance': 'facultative anaerobe' } },
    'Physiology and metabolism': {
      'spore formation': { 'spore formation': 'no' },
      enzymes: [
        { value: 'catalase', activity: '+' }, { value: 'cytochrome oxidase', activity: '-' },
        { value: 'urease', activity: '-' }, { value: 'nitrate reductase', activity: '+' },
      ],
      'metabolite production': [{ metabolite: 'indole', production: 'yes' }, { metabolite: 'acetoin', production: 'no' }],
      'metabolite utilization': [
        { metabolite: 'citrate', 'utilization activity': '-', 'kind of utilization tested': 'carbon source' },
        { metabolite: 'D-glucose', 'utilization activity': '+', 'kind of utilization tested': 'builds acid from' },
        { metabolite: 'lactose', 'utilization activity': '+', 'kind of utilization tested': 'builds acid from' },
      ],
    },
  };
  const strainB = JSON.parse(JSON.stringify(strainA));
  strainB['Physiology and metabolism'].enzymes[2].activity = '+'; // urease disagrees → Variable
  const a = readStrain(strainA), b = readStrain(strainB);
  console.log('readStrain(A):', JSON.stringify(a));
  console.log('aggregate(A,B):', JSON.stringify(aggregate([a, b]).proposal));
  const ok = a.gram === 'Negative' && a.shape[0] === 'Bacilli' && a.motility === 'Motile' &&
    a.spores === 'Negative' && a.atmosphere === 'Facultative' && a.catalase === 'Positive' &&
    a.oxidase === 'Negative' && a.nitrate === 'Reducing' && a.indole === 'Positive' && a.vp === 'Negative' &&
    a.citrate === 'Negative' && JSON.stringify(a.fermentation) === JSON.stringify(['Glucose', 'Lactose']) &&
    aggregate([a, b]).proposal.urease === 'Variable';
  console.log(ok ? '\nSELFTEST PASS ✓' : '\nSELFTEST FAIL ✗');
  process.exit(ok ? 0 : 1);
}

// ── Main ─────────────────────────────────────────────────────────────────────
function blanksOf(rec) {
  return IDENTIFIERS.filter((s) => { const v = rec.id ? rec.id[s.key] : undefined; return v === undefined || v === null; }).map((s) => s.key);
}

const targets = BACTERIA
  .filter((r) => !ONLY || ONLY.includes(`${r.genus} ${r.species}`.toLowerCase()))
  .slice(0, LIMIT);

console.log(`BacDive gap-fill · ${targets.length} organisms · base ${BASE}`);
if (PREDICTIONS) console.log('including BacDive predictions');

const proposalsJson = {};
const reviewRows = [];
let hits = 0, misses = 0;

for (const [i, rec] of targets.entries()) {
  const name = `${rec.genus} ${rec.species}`;
  const blanks = new Set(blanksOf(rec));
  if (!blanks.size) continue;
  process.stdout.write(`[${i + 1}/${targets.length}] ${name} … `);

  // 1) taxon → ids (follow pagination up to MAX_STRAINS)
  let ids = [];
  let res = await api(`taxon/${encodeURIComponent(rec.genus)}/${encodeURIComponent(rec.species)}`);
  while (res && Array.isArray(res.results) && ids.length < MAX_STRAINS) {
    ids.push(...res.results.map((x) => (typeof x === 'object' ? x.id ?? x : x)));
    if (!res.next) break;
    res = await api(res.next);
  }
  ids = ids.filter(Boolean).slice(0, MAX_STRAINS);
  if (!ids.length) { console.log('no BacDive match'); misses++; await sleep(DELAY); continue; }

  // 2) fetch records (chunked)
  const records = [];
  for (let j = 0; j < ids.length; j += 100) {
    const chunk = ids.slice(j, j + 100).join(';');
    const data = await api(`fetch/${chunk}`);
    const arr = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : Object.values(data || {});
    for (const e of arr) if (e && typeof e === 'object') records.push(e);
  }

  // 3) read + aggregate, 4) keep only blanks
  const { proposal, evidence } = aggregate(records.map(readStrain));
  const filled = {};
  for (const [k, v] of Object.entries(proposal)) if (blanks.has(k)) filled[k] = v;

  if (Object.keys(filled).length) {
    proposalsJson[name] = filled;
    for (const [k, v] of Object.entries(filled))
      reviewRows.push(`| ${name} | ${LABEL[k]} | ${Array.isArray(v) ? v.join(', ') : v} | ${evidence[k] || ''} | ${ids.slice(0, 6).join(', ')}${ids.length > 6 ? '…' : ''} |`);
    hits++;
    console.log(`${records.length} strain(s) → ${Object.keys(filled).length} cell(s) filled`);
  } else {
    console.log(`${records.length} strain(s), nothing new`);
  }
  await sleep(DELAY);
}

// ── Write outputs ────────────────────────────────────────────────────────────
const md =
  `# BacDive gap-fill proposals\n\n` +
  `_Source: BacDive API v2 (bacdive.dsmz.de). Only blank cells are proposed; curated values are untouched. Review before applying._\n\n` +
  `Organisms with proposals: **${hits}** · no BacDive match: **${misses}**.\n\n` +
  `| Organism | Test | Proposed | Evidence (across strains) | BacDive IDs |\n|---|---|---|---|---|\n` +
  reviewRows.join('\n') + '\n';
writeFileSync(join(root, 'scripts', 'bacdive-proposals.md'), md);
writeFileSync(join(root, 'scripts', 'bacdive-proposals.json'), JSON.stringify(proposalsJson, null, 2) + '\n');
console.log(`\nWrote scripts/bacdive-proposals.md and .json (${hits} organisms).`);

if (WRITE) {
  // Guard: never overwrite an existing gap-fill module with an empty one. A run
  // that reaches no organisms (e.g. BacDive unreachable) must not wipe data a
  // previous run already fetched — so only (re)write when we actually have fills.
  if (!Object.keys(proposalsJson).length) {
    console.log('No proposals this run — leaving any existing scripts/profiles.bacdive.mjs untouched.');
  } else {
    const body =
      `// AUTO-GENERATED by scripts/fetch-bacdive.mjs from BacDive API v2.\n` +
      `// Gap-fill only: finalize.mjs merges these UNDER scripts/profiles.mjs, so any\n` +
      `// curated value always wins. Delete this file to drop the BacDive-sourced fills.\n` +
      `export const BACDIVE_PROFILES = ${JSON.stringify(proposalsJson, null, 2)};\n`;
    writeFileSync(join(root, 'scripts', 'profiles.bacdive.mjs'), body);
    console.log('Wrote scripts/profiles.bacdive.mjs (merged on next `node scripts/build-dataset.mjs`).');
  }
}
