// Updated bacterial nomenclature normalizer.
//
// GBIF's backbone (and most legacy datasets) still carry pre-2021 phylum and
// class names. In 2021 the International Code of Nomenclature of Prokaryotes
// (ICNP) validly published a set of phylum names with the standard "-ota"
// suffix, and several higher taxa were reclassified. This module rewrites those
// outdated rank names to their current, valid equivalents so every record in
// the game speaks the same modern taxonomic language — regardless of whether it
// came from the bundled seed or was pulled live from GBIF.
//
// Scope: this is deliberately curated around the lineages that pathogenic
// bacteria actually occupy. It is not a complete map of all prokaryote taxa.

// Phylum renames (ICNP 2021, "-ota" suffix reform).
export const PHYLUM_MAP = {
  Proteobacteria: 'Pseudomonadota',
  Firmicutes: 'Bacillota',
  Actinobacteria: 'Actinomycetota',
  Bacteroidetes: 'Bacteroidota',
  Spirochaetes: 'Spirochaetota',
  Chlamydiae: 'Chlamydiota',
  Tenericutes: 'Mycoplasmatota',
  Fusobacteria: 'Fusobacteriota',
  Epsilonbacteraeota: 'Campylobacterota',
  'Deinococcus-Thermus': 'Deinococcota',
  Cyanobacteria: 'Cyanobacteriota',
  Synergistetes: 'Synergistota',
  Verrucomicrobia: 'Verrucomicrobiota',
  Planctomycetes: 'Planctomycetota',
  Acidobacteria: 'Acidobacteriota',
  Chlorobi: 'Chlorobiota',
  Nitrospirae: 'Nitrospirota',
  Aquificae: 'Aquificota',
  Thermotogae: 'Thermotogota',
  Gemmatimonadetes: 'Gemmatimonadota',
};

// Class renames.
export const CLASS_MAP = {
  Actinobacteria: 'Actinomycetia', // class shares the old phylum spelling
  Actinomycetes: 'Actinomycetia',
};

// Order renames.
export const ORDER_MAP = {
  Corynebacteriales: 'Mycobacteriales', // subsumed under Mycobacteriales (LPSN)
};

// A small set of well-established genus reclassifications. These change the
// accepted binomial, which is exactly the kind of "outdated name" a live GBIF
// pull can still return.
export const GENUS_MAP = {
  // "Genus species": ["NewGenus", "newSpecies"]
  'Propionibacterium acnes': ['Cutibacterium', 'acnes'],
  'Clostridium difficile': ['Clostridioides', 'difficile'],
  'Enterobacter aerogenes': ['Klebsiella', 'aerogenes'],
  'Rhodococcus equi': ['Rhodococcus', 'hoagii'],
};

const RANKS = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];

// Normalize a single taxonomic record in place-safe fashion, returning a new
// object. Accepts { kingdom, phylum, class, order, family, genus, species, ... }
// and preserves any extra fields (e.g. notes).
export function normalizeRecord(rec) {
  const out = { ...rec };

  // Kingdom is always Bacteria for this game.
  out.kingdom = 'Bacteria';

  // Cross-rank reclassification: the former class Epsilonproteobacteria was
  // elevated to its own phylum, Campylobacterota (class Campylobacteria).
  if (out.class === 'Epsilonproteobacteria' || out.phylum === 'Epsilonbacteraeota') {
    out.phylum = 'Campylobacterota';
    out.class = 'Campylobacteria';
  }

  if (out.phylum && PHYLUM_MAP[out.phylum]) out.phylum = PHYLUM_MAP[out.phylum];
  if (out.class && CLASS_MAP[out.class]) out.class = CLASS_MAP[out.class];
  if (out.order && ORDER_MAP[out.order]) out.order = ORDER_MAP[out.order];

  // Genus / species reclassification.
  const binomial = `${out.genus} ${out.species}`;
  if (GENUS_MAP[binomial]) {
    const [g, s] = GENUS_MAP[binomial];
    out.genus = g;
    out.species = s;
  }

  // Trim & tidy every rank string.
  for (const r of RANKS) {
    if (typeof out[r] === 'string') out[r] = out[r].trim();
  }
  return out;
}

export { RANKS };
