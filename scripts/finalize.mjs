// Shared post-processing for both data pipelines (build-dataset + fetch-gbif):
// cap species per genus, attach lab profiles, sort, and write the outputs.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { PROFILES } from './profiles.mjs';
import { coerceValue, IDENTIFIERS } from '../src/identifiers.js';

export const MAX_PER_GENUS = 4;

// Normalize a raw profile object onto the canonical identifier vocabulary.
function cleanProfile(raw) {
  const out = {};
  for (const spec of IDENTIFIERS) {
    if (!(spec.key in raw)) continue;
    const v = coerceValue(raw[spec.key]);
    if (v === undefined) continue;
    out[spec.key] = spec.type === 'multi' ? (Array.isArray(v) ? v : [v]) : v;
  }
  return out;
}

const CLEAN_PROFILES = Object.fromEntries(
  Object.entries(PROFILES).map(([k, v]) => [k, cleanProfile(v)]),
);

// Cap each genus at MAX_PER_GENUS species. Species that carry a lab profile are
// preferred (so the Identifier/Combined pools stay rich), then alphabetical.
export function capGenera(records, max = MAX_PER_GENUS) {
  const byGenus = new Map();
  for (const r of records) {
    if (!byGenus.has(r.genus)) byGenus.set(r.genus, []);
    byGenus.get(r.genus).push(r);
  }
  const kept = [];
  for (const list of byGenus.values()) {
    list.sort((a, b) => {
      const pa = CLEAN_PROFILES[`${a.genus} ${a.species}`] ? 0 : 1;
      const pb = CLEAN_PROFILES[`${b.genus} ${b.species}`] ? 0 : 1;
      return pa - pb || a.species.localeCompare(b.species);
    });
    kept.push(...list.slice(0, max));
  }
  return kept;
}

// Attach a `id` profile (if we have one) to each record.
export function attachProfiles(records) {
  for (const r of records) {
    const prof = CLEAN_PROFILES[`${r.genus} ${r.species}`];
    if (prof) r.id = prof;
  }
  return records;
}

export function finalize(records) {
  let out = capGenera(records);
  out = attachProfiles(out);
  out.sort((a, b) => `${a.genus} ${a.species}`.localeCompare(`${b.genus} ${b.species}`));
  return out;
}

export function summarize(records, source) {
  return {
    count: records.length,
    phyla: new Set(records.map((r) => r.phylum)).size,
    genera: new Set(records.map((r) => r.genus)).size,
    profiled: records.filter((r) => r.id).length,
    source,
    generatedAt: new Date().toISOString(),
  };
}

export function writeOutputs(root, records, source) {
  const meta = summarize(records, source);
  mkdirSync(join(root, 'data'), { recursive: true });
  writeFileSync(
    join(root, 'data', 'bacteria.json'),
    JSON.stringify({ meta, records }, null, 2) + '\n',
  );
  const banner =
    `// AUTO-GENERATED — do not edit by hand. Regenerate with a scripts/*.mjs pipeline.\n`;
  writeFileSync(
    join(root, 'src', 'data.js'),
    banner +
      `export const META = ${JSON.stringify(meta, null, 2)};\n\n` +
      `export const BACTERIA = ${JSON.stringify(records, null, 2)};\n`,
  );
  return meta;
}
