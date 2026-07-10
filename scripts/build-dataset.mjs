// Build the bundled dataset from the curated seed.
//
//   node scripts/build-dataset.mjs
//
// Flattens scripts/seed-taxa.mjs, pushes every record through the updated
// nomenclature normalizer, caps each genus at 4 species, attaches lab profiles,
// and writes:
//   • data/bacteria.json  — portable dataset
//   • src/data.js         — ES module the browser game imports directly
//
// The output schema is identical to what scripts/fetch-gbif.mjs produces from a
// live GBIF pull, so the two data paths are interchangeable.

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SEED } from './seed-taxa.mjs';
import { normalizeRecord } from '../src/normalize.mjs';
import { finalize, writeOutputs } from './finalize.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function buildRecords() {
  const records = [];
  const seen = new Set();
  for (const group of SEED) {
    for (const [genus, species, notes] of group.taxa) {
      const rec = normalizeRecord({
        kingdom: 'Bacteria',
        phylum: group.phylum,
        class: group.klass,
        order: group.order,
        family: group.family,
        genus,
        species,
        notes: notes || '',
      });
      const key = `${rec.genus} ${rec.species}`;
      if (seen.has(key)) continue; // de-duplicate after normalization
      seen.add(key);
      records.push(rec);
    }
  }
  return records;
}

const records = finalize(buildRecords());
const meta = writeOutputs(root, records, 'curated-seed');
console.log(
  `Built ${meta.count} records · ${meta.genera} genera · ${meta.phyla} phyla · ${meta.profiled} with lab profiles`,
);
