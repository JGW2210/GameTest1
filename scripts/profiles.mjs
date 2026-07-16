// Hand-authored phenotypic / biochemical profiles for a curated core of classic,
// well-characterised pathogens. Keyed by CURRENT binomial (post-normalization,
// e.g. "Clostridioides difficile", "Cutibacterium acnes"). Merged into the
// dataset by scripts/build-dataset.mjs; the Identifier and Combined game modes
// draw from organisms that have an entry here.
//
// Only confidently-known results are filled in; anything omitted renders as a
// neutral (grey) cell and does not count toward the match. Values use the
// canonical vocabulary from ../src/identifiers.js.
//
// nitrate reduction uses 'Reducing' / 'Non-reducing' / 'Variable'; urease uses
// the Positive / Negative / Variable (P / N / V) vocabulary.

import { P, N, V } from '../src/identifiers.js';

const RED = 'Reducing';
const NONRED = 'Non-reducing';

export const PROFILES = {
  // ── Staphylococci ────────────────────────────────────────────────────────
  'Staphylococcus aureus': {
    gram: P, shape: ['Cocci', 'Clusters'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: P, coagulase: P, dnase: P, pyr: N,
    indole: N, methylRed: P, vp: P, citrate: N, nitrate: RED, urease: P,
    fermentation: ['Glucose', 'Mannitol', 'Maltose', 'Sucrose', 'Lactose'], of: 'Fermentative',
    haemolysis: 'Beta', atmosphere: 'Facultative',
  },
  'Staphylococcus epidermidis': {
    gram: P, shape: ['Cocci', 'Clusters'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: P, coagulase: N, dnase: N, nitrate: RED, urease: P,
    fermentation: ['Glucose'], of: 'Fermentative', haemolysis: 'Gamma', atmosphere: 'Facultative',
  },
  'Staphylococcus saprophyticus': {
    gram: P, shape: ['Cocci', 'Clusters'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: P, coagulase: N, dnase: N, nitrate: NONRED, urease: P,
    of: 'Fermentative', haemolysis: 'Gamma', atmosphere: 'Facultative',
  },

  // ── Streptococci / Enterococci ───────────────────────────────────────────
  'Streptococcus pyogenes': {
    gram: P, shape: ['Cocci', 'Chains'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: N, pyr: P, nitrate: NONRED, urease: N,
    fermentation: ['Glucose'], of: 'Fermentative', haemolysis: 'Beta', atmosphere: 'Capnophilic',
  },
  'Streptococcus agalactiae': {
    gram: P, shape: ['Cocci', 'Chains'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: N, pyr: N, nitrate: NONRED, urease: N,
    fermentation: ['Glucose'], of: 'Fermentative', haemolysis: 'Beta', atmosphere: 'Facultative',
  },
  'Streptococcus pneumoniae': {
    gram: P, shape: ['Diplococci'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: N, nitrate: NONRED, urease: N,
    fermentation: ['Glucose'], of: 'Fermentative', haemolysis: 'Alpha', atmosphere: 'Capnophilic',
  },
  'Streptococcus mutans': {
    gram: P, shape: ['Cocci', 'Chains'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: N, nitrate: NONRED, urease: N,
    fermentation: ['Glucose', 'Sucrose', 'Mannitol', 'Lactose'], of: 'Fermentative',
    haemolysis: 'Gamma', atmosphere: 'Facultative',
  },
  'Enterococcus faecalis': {
    gram: P, shape: ['Cocci', 'Chains'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: N, aesculin: P, pyr: P, nitrate: V, urease: N,
    fermentation: ['Glucose'], of: 'Fermentative', haemolysis: 'Gamma', atmosphere: 'Facultative',
  },
  'Enterococcus faecium': {
    gram: P, shape: ['Cocci', 'Chains'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: N, aesculin: P, pyr: P, nitrate: V, urease: N,
    fermentation: ['Glucose'], of: 'Fermentative', haemolysis: 'Gamma', atmosphere: 'Facultative',
  },

  // ── Gram-positive rods ───────────────────────────────────────────────────
  'Listeria monocytogenes': {
    gram: P, shape: ['Bacilli'], motility: 'Temp-variable', spores: N,
    oxidase: N, catalase: P, aesculin: P, nitrate: NONRED, urease: N,
    fermentation: ['Glucose'], of: 'Fermentative', haemolysis: 'Beta', atmosphere: 'Facultative',
  },
  'Corynebacterium diphtheriae': {
    gram: P, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: P, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Maltose'], of: 'Fermentative', haemolysis: 'Gamma', atmosphere: 'Facultative',
  },
  'Bacillus anthracis': {
    gram: P, shape: ['Bacilli', 'Chains'], motility: 'Non-motile', spores: P,
    oxidase: N, catalase: P, nitrate: RED, urease: N,
    fermentation: ['Glucose'], of: 'Fermentative', haemolysis: 'Gamma', atmosphere: 'Facultative',
  },
  'Bacillus cereus': {
    gram: P, shape: ['Bacilli', 'Chains'], motility: 'Motile', spores: P,
    oxidase: N, catalase: P, nitrate: RED, urease: N,
    fermentation: ['Glucose'], of: 'Fermentative', haemolysis: 'Beta', atmosphere: 'Facultative',
  },
  'Clostridium perfringens': {
    gram: P, shape: ['Bacilli'], motility: 'Non-motile', spores: P,
    oxidase: N, catalase: N, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Lactose', 'Sucrose', 'Maltose'], of: 'Fermentative',
    haemolysis: 'Beta', atmosphere: 'Anaerobe',
  },
  'Clostridium tetani': {
    gram: P, shape: ['Bacilli'], motility: 'Motile', spores: P,
    oxidase: N, catalase: N, nitrate: NONRED, urease: N,
    of: 'Non-reactive', haemolysis: 'Beta', atmosphere: 'Anaerobe',
  },
  'Clostridium botulinum': {
    gram: P, shape: ['Bacilli'], motility: 'Motile', spores: P,
    oxidase: N, catalase: N, nitrate: NONRED, urease: N,
    fermentation: ['Glucose'], atmosphere: 'Anaerobe',
  },
  'Clostridioides difficile': {
    gram: P, shape: ['Bacilli'], motility: 'Motile', spores: P,
    oxidase: N, catalase: N, nitrate: NONRED, urease: N,
    fermentation: ['Glucose'], atmosphere: 'Anaerobe',
  },
  'Cutibacterium acnes': {
    gram: P, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    catalase: P, indole: P, nitrate: RED, urease: N, atmosphere: 'Anaerobe',
  },
  'Actinomyces israelii': {
    gram: P, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    catalase: N, nitrate: V, urease: N, atmosphere: 'Anaerobe',
  },

  // ── Acid-fast ────────────────────────────────────────────────────────────
  'Mycobacterium tuberculosis': {
    gram: 'Acid-fast', shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    catalase: V, nitrate: RED, urease: P, atmosphere: 'Aerobe',
  },
  'Mycobacterium leprae': {
    gram: 'Acid-fast', shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    atmosphere: 'Aerobe',
  },
  'Nocardia asteroides': {
    gram: P, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    catalase: P, nitrate: RED, urease: P, atmosphere: 'Aerobe',
  },

  // ── Enterobacterales ─────────────────────────────────────────────────────
  'Escherichia coli': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, indole: P, methylRed: P, vp: N, citrate: N, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Lactose', 'Maltose', 'Mannitol'], of: 'Fermentative',
    haemolysis: 'Variable', atmosphere: 'Facultative',
  },
  'Klebsiella pneumoniae': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: P, indole: N, methylRed: N, vp: P, citrate: P, nitrate: RED, urease: P,
    fermentation: ['Glucose', 'Lactose', 'Sucrose', 'Maltose'], of: 'Fermentative',
    haemolysis: 'Gamma', atmosphere: 'Facultative',
  },
  'Enterobacter cloacae': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, indole: N, methylRed: N, vp: P, citrate: P, nitrate: RED, urease: V,
    fermentation: ['Glucose', 'Lactose', 'Sucrose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Salmonella enterica': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, indole: N, methylRed: P, vp: N, citrate: V, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Maltose', 'Mannitol'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Shigella flexneri': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: P, indole: V, methylRed: P, vp: N, citrate: N, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Maltose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Shigella dysenteriae': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: N, indole: V, methylRed: P, vp: N, citrate: N, nitrate: RED, urease: N,
    fermentation: ['Glucose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Proteus mirabilis': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, indole: N, methylRed: P, vp: N, citrate: V, nitrate: RED, urease: P,
    fermentation: ['Glucose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Proteus vulgaris': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, indole: P, methylRed: P, vp: N, nitrate: RED, urease: P,
    fermentation: ['Glucose', 'Sucrose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Yersinia pestis': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: P, indole: N, nitrate: RED, urease: N,
    of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Yersinia enterocolitica': {
    gram: N, shape: ['Bacilli'], motility: 'Temp-variable', spores: N,
    oxidase: N, catalase: P, indole: V, nitrate: RED, urease: P,
    of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Serratia marcescens': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, dnase: P, indole: N, vp: P, citrate: P, nitrate: RED, urease: N,
    fermentation: ['Glucose'], of: 'Fermentative', atmosphere: 'Facultative',
  },

  // ── Vibrio / Aeromonas ───────────────────────────────────────────────────
  'Vibrio cholerae': {
    gram: N, shape: ['Bacilli', 'Spiral'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, indole: P, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Sucrose', 'Mannitol'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Vibrio parahaemolyticus': {
    gram: N, shape: ['Bacilli', 'Spiral'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, indole: P, nitrate: RED, urease: V,
    fermentation: ['Glucose', 'Mannitol'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Aeromonas hydrophila': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, indole: P, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Sucrose'], of: 'Fermentative', haemolysis: 'Beta', atmosphere: 'Facultative',
  },

  // ── Non-fermenters ───────────────────────────────────────────────────────
  'Pseudomonas aeruginosa': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, citrate: P, nitrate: RED, urease: V,
    fermentation: [], of: 'Oxidative', haemolysis: 'Beta', atmosphere: 'Aerobe',
  },
  'Stenotrophomonas maltophilia': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, dnase: P, nitrate: NONRED, urease: N,
    of: 'Oxidative', atmosphere: 'Aerobe',
  },
  'Acinetobacter baumannii': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: P, nitrate: NONRED, urease: N,
    of: 'Oxidative', atmosphere: 'Aerobe',
  },
  'Moraxella catarrhalis': {
    gram: N, shape: ['Diplococci'], motility: 'Non-motile', spores: N,
    oxidase: P, catalase: P, dnase: P, nitrate: RED, urease: N,
    of: 'Non-reactive', atmosphere: 'Aerobe',
  },

  // ── Fastidious Gram-negatives ────────────────────────────────────────────
  'Neisseria meningitidis': {
    gram: N, shape: ['Diplococci'], motility: 'Non-motile', spores: N,
    oxidase: P, catalase: P, nitrate: NONRED, urease: N,
    fermentation: ['Glucose', 'Maltose'], of: 'Fermentative', haemolysis: 'Gamma', atmosphere: 'Capnophilic',
  },
  'Neisseria gonorrhoeae': {
    gram: N, shape: ['Diplococci'], motility: 'Non-motile', spores: N,
    oxidase: P, catalase: P, nitrate: NONRED, urease: N,
    fermentation: ['Glucose'], of: 'Fermentative', haemolysis: 'Gamma', atmosphere: 'Capnophilic',
  },
  'Haemophilus influenzae': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: P, catalase: P, nitrate: RED, urease: V,
    fermentation: ['Glucose'], of: 'Fermentative', haemolysis: 'Gamma', atmosphere: 'Capnophilic',
  },
  'Bordetella pertussis': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: P, catalase: P, nitrate: NONRED, urease: N,
    of: 'Non-reactive', atmosphere: 'Aerobe',
  },
  'Brucella melitensis': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: P, catalase: P, nitrate: RED, urease: P,
    of: 'Non-reactive', atmosphere: 'Capnophilic',
  },
  'Francisella tularensis': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: V, nitrate: NONRED, urease: N, atmosphere: 'Aerobe',
  },
  'Legionella pneumophila': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: V, catalase: P, nitrate: NONRED, urease: N,
    of: 'Non-reactive', atmosphere: 'Aerobe',
  },

  // ── Curved / spiral ──────────────────────────────────────────────────────
  'Campylobacter jejuni': {
    gram: N, shape: ['Spiral'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, nitrate: RED, urease: N,
    of: 'Non-reactive', atmosphere: 'Microaerophilic',
  },
  'Helicobacter pylori': {
    gram: N, shape: ['Spiral'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, nitrate: NONRED, urease: P,
    of: 'Non-reactive', atmosphere: 'Microaerophilic',
  },

  // ── Anaerobes ────────────────────────────────────────────────────────────
  'Bacteroides fragilis': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    catalase: V, aesculin: P, nitrate: NONRED, urease: N,
    of: 'Fermentative', atmosphere: 'Anaerobe',
  },
  'Fusobacterium nucleatum': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    catalase: N, indole: P, nitrate: NONRED, urease: N, atmosphere: 'Anaerobe',
  },
  'Prevotella melaninogenica': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    catalase: N, indole: N, nitrate: NONRED, urease: N, atmosphere: 'Anaerobe',
  },

  // ── Spirochaetes / intracellular / wall-less ─────────────────────────────
  'Treponema pallidum': {
    gram: 'Other', shape: ['Spiral'], motility: 'Motile', spores: N, atmosphere: 'Microaerophilic',
  },
  'Borrelia burgdorferi': {
    gram: N, shape: ['Spiral'], motility: 'Motile', spores: N, atmosphere: 'Microaerophilic',
  },
  'Leptospira interrogans': {
    gram: 'Other', shape: ['Spiral'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, atmosphere: 'Aerobe',
  },
  'Chlamydia trachomatis': {
    gram: 'Other', shape: ['Cocci'], motility: 'Non-motile', spores: N, atmosphere: 'Other',
  },
  'Rickettsia rickettsii': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N, atmosphere: 'Aerobe',
  },
  'Mycoplasma pneumoniae': {
    gram: 'Other', shape: ['Other'], motility: 'Non-motile', spores: N,
    catalase: N, urease: N, fermentation: ['Glucose'], atmosphere: 'Facultative',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Expanded coverage — reference-derived profiles (standard clinical
  // microbiology: Manual of Clinical Microbiology, Bergey's, Koneman's). Fields
  // are only filled where the result is well-established and characteristic;
  // uncertain tests are omitted (rendered neutral). Cross-check against BacDive
  // (bacdive.dsmz.de) for strain-level nuance before treating any as gospel.
  // ══════════════════════════════════════════════════════════════════════════

  // ── Additional staphylococci / streptococci / enterococci ────────────────
  'Staphylococcus haemolyticus': {
    gram: P, shape: ['Cocci', 'Clusters'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: P, coagulase: N, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Maltose', 'Sucrose'], of: 'Fermentative', haemolysis: 'Beta', atmosphere: 'Facultative',
  },
  'Enterococcus gallinarum': {
    gram: P, shape: ['Cocci', 'Chains'], motility: 'Motile', spores: N,
    oxidase: N, catalase: N, aesculin: P, pyr: P, nitrate: V, urease: N,
    fermentation: ['Glucose', 'Mannitol'], of: 'Fermentative', haemolysis: 'Gamma', atmosphere: 'Facultative',
  },
  'Aerococcus urinae': {
    gram: P, shape: ['Cocci', 'Clusters'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: N, pyr: N, aesculin: N, nitrate: NONRED, urease: N,
    of: 'Fermentative', haemolysis: 'Alpha', atmosphere: 'Facultative',
  },
  'Abiotrophia defectiva': {
    gram: P, shape: ['Cocci', 'Chains'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: N, pyr: P, nitrate: NONRED, urease: N,
    of: 'Fermentative', haemolysis: 'Alpha', atmosphere: 'Capnophilic',
  },
  'Granulicatella adiacens': {
    gram: P, shape: ['Cocci', 'Chains'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: N, pyr: P, nitrate: NONRED, urease: N,
    of: 'Fermentative', haemolysis: 'Alpha', atmosphere: 'Capnophilic',
  },
  'Finegoldia magna': {
    gram: P, shape: ['Cocci', 'Clusters'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: N, indole: N, nitrate: NONRED, urease: N, atmosphere: 'Anaerobe',
  },
  'Micrococcus luteus': {
    gram: P, shape: ['Cocci', 'Clusters'], motility: 'Non-motile', spores: N,
    oxidase: P, catalase: P, nitrate: NONRED, urease: V,
    fermentation: [], of: 'Oxidative', haemolysis: 'Gamma', atmosphere: 'Aerobe',
  },

  // ── Additional Gram-positive rods / actinomycetes ────────────────────────
  'Bacillus subtilis': {
    gram: P, shape: ['Bacilli', 'Chains'], motility: 'Motile', spores: P,
    oxidase: V, catalase: P, aesculin: P, vp: P, citrate: P, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Sucrose', 'Maltose', 'Mannitol'], of: 'Fermentative', haemolysis: 'Gamma', atmosphere: 'Aerobe',
  },
  'Bacillus thuringiensis': {
    gram: P, shape: ['Bacilli', 'Chains'], motility: 'Motile', spores: P,
    oxidase: N, catalase: P, vp: P, nitrate: RED, urease: N,
    fermentation: ['Glucose'], of: 'Fermentative', haemolysis: 'Beta', atmosphere: 'Facultative',
  },
  'Clostridium septicum': {
    gram: P, shape: ['Bacilli'], motility: 'Motile', spores: P,
    oxidase: N, catalase: N, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Lactose', 'Maltose'], of: 'Fermentative', haemolysis: 'Beta', atmosphere: 'Anaerobe',
  },
  'Listeria ivanovii': {
    gram: P, shape: ['Bacilli'], motility: 'Temp-variable', spores: N,
    oxidase: N, catalase: P, aesculin: P, nitrate: NONRED, urease: N,
    fermentation: ['Glucose'], of: 'Fermentative', haemolysis: 'Beta', atmosphere: 'Facultative',
  },
  'Corynebacterium ulcerans': {
    gram: P, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: P, urease: P, nitrate: NONRED,
    fermentation: ['Glucose', 'Maltose'], of: 'Fermentative', haemolysis: 'Beta', atmosphere: 'Facultative',
  },
  'Corynebacterium jeikeium': {
    gram: P, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: P, urease: N, nitrate: NONRED, atmosphere: 'Aerobe',
  },
  'Actinomyces naeslundii': {
    gram: P, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    catalase: N, urease: P, nitrate: RED,
    fermentation: ['Glucose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Rhodococcus hoagii': {
    gram: P, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: P, urease: P, nitrate: RED,
    fermentation: [], of: 'Oxidative', atmosphere: 'Aerobe',
  },
  'Nocardia brasiliensis': {
    gram: P, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    catalase: P, urease: P, nitrate: RED, atmosphere: 'Aerobe',
  },
  'Gardnerella vaginalis': {
    gram: 'Variable', shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: N, nitrate: NONRED, urease: N,
    fermentation: ['Glucose', 'Maltose'], of: 'Fermentative', haemolysis: 'Beta', atmosphere: 'Facultative',
  },

  // ── Additional acid-fast ─────────────────────────────────────────────────
  'Mycobacterium avium': {
    gram: 'Acid-fast', shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    catalase: P, nitrate: NONRED, urease: N, atmosphere: 'Aerobe',
  },
  'Mycobacterium abscessus': {
    gram: 'Acid-fast', shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    catalase: P, nitrate: NONRED, urease: P, atmosphere: 'Aerobe',
  },

  // ── Enterobacterales (rich, well-characterised biochemistry) ─────────────
  'Citrobacter freundii': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, indole: V, methylRed: P, vp: N, citrate: P, nitrate: RED, urease: V,
    fermentation: ['Glucose', 'Lactose', 'Maltose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Citrobacter koseri': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, indole: P, methylRed: P, vp: N, citrate: P, nitrate: RED, urease: V,
    fermentation: ['Glucose', 'Lactose', 'Maltose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Klebsiella oxytoca': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: P, indole: P, methylRed: N, vp: P, citrate: P, nitrate: RED, urease: P,
    fermentation: ['Glucose', 'Lactose', 'Sucrose', 'Maltose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Klebsiella aerogenes': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, indole: N, methylRed: N, vp: P, citrate: P, nitrate: RED,
    fermentation: ['Glucose', 'Lactose', 'Sucrose', 'Maltose', 'Mannitol'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Enterobacter hormaechei': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, indole: N, vp: P, citrate: P, nitrate: RED, urease: V,
    fermentation: ['Glucose', 'Lactose', 'Sucrose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Cronobacter sakazakii': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, indole: N, vp: P, citrate: P, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Sucrose', 'Maltose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Hafnia alvei': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, indole: N, vp: V, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Maltose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Morganella morganii': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, indole: P, methylRed: P, vp: N, citrate: N, nitrate: RED, urease: P,
    fermentation: ['Glucose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Providencia rettgeri': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, indole: P, citrate: P, nitrate: RED, urease: P,
    fermentation: ['Glucose', 'Mannitol'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Providencia stuartii': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, indole: P, citrate: P, nitrate: RED, urease: V,
    fermentation: ['Glucose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Edwardsiella tarda': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, indole: P, methylRed: P, vp: N, citrate: N, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Maltose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Salmonella bongori': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, indole: N, methylRed: P, vp: N, citrate: V, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Mannitol', 'Maltose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Shigella boydii': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: P, indole: V, methylRed: P, vp: N, citrate: N, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Mannitol'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Shigella sonnei': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: P, indole: N, methylRed: P, vp: N, citrate: N, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Mannitol'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Escherichia albertii': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: P, indole: N, methylRed: P, vp: N, citrate: N, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Mannitol'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Escherichia fergusonii': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: P, indole: P, methylRed: P, vp: N, citrate: P, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Mannitol', 'Maltose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Yersinia pseudotuberculosis': {
    gram: N, shape: ['Bacilli'], motility: 'Temp-variable', spores: N,
    oxidase: N, catalase: P, indole: N, vp: N, citrate: N, nitrate: RED, urease: P,
    fermentation: ['Glucose', 'Maltose', 'Mannitol'], of: 'Fermentative', atmosphere: 'Facultative',
  },

  // ── Vibrio / Aeromonas ───────────────────────────────────────────────────
  'Vibrio vulnificus': {
    gram: N, shape: ['Bacilli', 'Spiral'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, indole: P, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Lactose'], of: 'Fermentative', haemolysis: 'Beta', atmosphere: 'Facultative',
  },
  'Vibrio alginolyticus': {
    gram: N, shape: ['Bacilli', 'Spiral'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, indole: P, vp: P, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Sucrose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Aeromonas caviae': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, indole: P, aesculin: P, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Sucrose'], of: 'Fermentative', haemolysis: 'Gamma', atmosphere: 'Facultative',
  },

  // ── Non-fermenters / oxidisers ───────────────────────────────────────────
  'Pseudomonas fluorescens': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, citrate: P, nitrate: NONRED, urease: N,
    fermentation: [], of: 'Oxidative', atmosphere: 'Aerobe',
  },
  'Pseudomonas putida': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, citrate: P, nitrate: NONRED, urease: N,
    fermentation: [], of: 'Oxidative', atmosphere: 'Aerobe',
  },
  'Acinetobacter lwoffii': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: P, nitrate: NONRED, urease: N,
    fermentation: [], of: 'Non-reactive', atmosphere: 'Aerobe',
  },
  'Achromobacter xylosoxidans': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, citrate: P, nitrate: RED, urease: N,
    of: 'Oxidative', atmosphere: 'Aerobe',
  },
  'Elizabethkingia meningoseptica': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: P, catalase: P, indole: P, aesculin: P, nitrate: NONRED, urease: N,
    of: 'Oxidative', atmosphere: 'Aerobe',
  },
  'Burkholderia cepacia': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, citrate: P, nitrate: V, urease: N,
    of: 'Oxidative', atmosphere: 'Aerobe',
  },
  'Burkholderia pseudomallei': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, citrate: P, nitrate: RED, urease: N,
    of: 'Oxidative', atmosphere: 'Aerobe',
  },
  'Burkholderia mallei': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: V, catalase: P, nitrate: RED, urease: N,
    of: 'Oxidative', atmosphere: 'Aerobe',
  },
  'Legionella longbeachae': {
    gram: N, shape: ['Bacilli'], motility: 'Motile', spores: N,
    oxidase: V, catalase: P, nitrate: NONRED, urease: N,
    of: 'Non-reactive', atmosphere: 'Aerobe',
  },

  // ── Fastidious Gram-negatives (HACEK, Pasteurella, Brucella, Bordetella) ──
  'Haemophilus parainfluenzae': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: P, catalase: V, nitrate: RED, urease: V,
    fermentation: ['Glucose'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Haemophilus ducreyi': {
    gram: N, shape: ['Cocci', 'Bacilli', 'Chains'], motility: 'Non-motile', spores: N,
    oxidase: P, catalase: N, nitrate: RED, urease: N, atmosphere: 'Capnophilic',
  },
  'Aggregatibacter actinomycetemcomitans': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: V, catalase: P, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Mannitol'], of: 'Fermentative', atmosphere: 'Capnophilic',
  },
  'Aggregatibacter aphrophilus': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: N, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Lactose', 'Sucrose', 'Maltose'], of: 'Fermentative', atmosphere: 'Capnophilic',
  },
  'Cardiobacterium hominis': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: P, catalase: N, indole: P, nitrate: NONRED, urease: N,
    fermentation: ['Glucose', 'Sucrose', 'Mannitol'], of: 'Fermentative', atmosphere: 'Capnophilic',
  },
  'Eikenella corrodens': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: P, catalase: N, nitrate: RED, urease: N,
    of: 'Non-reactive', atmosphere: 'Capnophilic',
  },
  'Kingella kingae': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: P, catalase: N, nitrate: NONRED, urease: N,
    fermentation: ['Glucose', 'Maltose'], of: 'Fermentative', haemolysis: 'Beta', atmosphere: 'Capnophilic',
  },
  'Pasteurella multocida': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: P, catalase: P, indole: P, nitrate: RED, urease: N,
    fermentation: ['Glucose', 'Sucrose', 'Mannitol'], of: 'Fermentative', atmosphere: 'Facultative',
  },
  'Capnocytophaga canimorsus': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: P, catalase: P, nitrate: NONRED,
    fermentation: ['Glucose'], of: 'Fermentative', atmosphere: 'Capnophilic',
  },
  'Streptobacillus moniliformis': {
    gram: N, shape: ['Bacilli', 'Chains'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: N, nitrate: NONRED, urease: N,
    fermentation: ['Glucose', 'Maltose'], of: 'Fermentative', atmosphere: 'Capnophilic',
  },
  'Neisseria lactamica': {
    gram: N, shape: ['Diplococci'], motility: 'Non-motile', spores: N,
    oxidase: P, catalase: P, nitrate: NONRED, urease: N,
    fermentation: ['Glucose', 'Maltose', 'Lactose'], of: 'Fermentative', atmosphere: 'Capnophilic',
  },
  'Brucella abortus': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: P, catalase: P, urease: P, nitrate: RED,
    of: 'Non-reactive', atmosphere: 'Capnophilic',
  },
  'Brucella suis': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: P, catalase: P, urease: P, nitrate: RED,
    of: 'Non-reactive', atmosphere: 'Aerobe',
  },
  'Bordetella bronchiseptica': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, citrate: P, urease: P, nitrate: RED,
    of: 'Non-reactive', atmosphere: 'Aerobe',
  },
  'Bordetella parapertussis': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: P, urease: P, nitrate: NONRED,
    of: 'Non-reactive', atmosphere: 'Aerobe',
  },

  // ── Curved / spiral (Campylobacter, Helicobacter, Arcobacter) ────────────
  'Campylobacter coli': {
    gram: N, shape: ['Spiral'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, nitrate: RED, urease: N,
    of: 'Non-reactive', atmosphere: 'Microaerophilic',
  },
  'Campylobacter fetus': {
    gram: N, shape: ['Spiral'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, nitrate: RED, urease: N,
    of: 'Non-reactive', atmosphere: 'Microaerophilic',
  },
  'Helicobacter cinaedi': {
    gram: N, shape: ['Spiral'], motility: 'Motile', spores: N,
    oxidase: P, catalase: P, nitrate: RED, urease: N,
    of: 'Non-reactive', atmosphere: 'Microaerophilic',
  },
  'Arcobacter butzleri': {
    gram: N, shape: ['Spiral'], motility: 'Motile', spores: N,
    oxidase: P, catalase: V, nitrate: RED, urease: N,
    of: 'Non-reactive', atmosphere: 'Microaerophilic',
  },

  // ── Anaerobes ────────────────────────────────────────────────────────────
  'Bacteroides thetaiotaomicron': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    catalase: V, aesculin: P, indole: N, nitrate: NONRED, urease: N,
    fermentation: ['Glucose', 'Lactose', 'Sucrose', 'Maltose', 'Mannitol'], of: 'Fermentative', atmosphere: 'Anaerobe',
  },
  'Prevotella intermedia': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    catalase: N, indole: P, aesculin: N, nitrate: NONRED, urease: N,
    of: 'Fermentative', atmosphere: 'Anaerobe',
  },
  'Porphyromonas gingivalis': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    catalase: N, indole: P, aesculin: N, nitrate: NONRED, urease: N,
    of: 'Non-reactive', atmosphere: 'Anaerobe',
  },
  'Tannerella forsythia': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    catalase: N, indole: N, nitrate: NONRED, atmosphere: 'Anaerobe',
  },
  'Fusobacterium necrophorum': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    catalase: N, indole: P, aesculin: N, nitrate: NONRED, urease: N,
    of: 'Fermentative', haemolysis: 'Beta', atmosphere: 'Anaerobe',
  },
  'Leptotrichia buccalis': {
    gram: N, shape: ['Bacilli'], motility: 'Non-motile', spores: N,
    catalase: N, indole: N, nitrate: NONRED,
    fermentation: ['Glucose', 'Maltose', 'Sucrose'], of: 'Fermentative', atmosphere: 'Anaerobe',
  },
  'Veillonella parvula': {
    gram: N, shape: ['Cocci', 'Diplococci'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: N, indole: N, nitrate: RED, urease: N,
    of: 'Non-reactive', atmosphere: 'Anaerobe',
  },

  // ── Spirochaetes / intracellular / wall-less ─────────────────────────────
  // Obligate intracellular, wall-less, or unculturable-on-standard-media taxa:
  // profiled by morphology + atmosphere only, as the routine biochemical panel
  // does not apply (matches the existing Rickettsia / Treponema entries).
  'Borrelia hermsii': {
    gram: N, shape: ['Spiral'], motility: 'Motile', spores: N, atmosphere: 'Microaerophilic',
  },
  'Borrelia recurrentis': {
    gram: N, shape: ['Spiral'], motility: 'Motile', spores: N, atmosphere: 'Microaerophilic',
  },
  'Treponema denticola': {
    gram: 'Other', shape: ['Spiral'], motility: 'Motile', spores: N, atmosphere: 'Anaerobe',
  },
  'Brachyspira pilosicoli': {
    gram: N, shape: ['Spiral'], motility: 'Motile', spores: N,
    oxidase: N, catalase: N, atmosphere: 'Anaerobe',
  },
  'Bartonella bacilliformis': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Motile', spores: N,
    oxidase: N, catalase: N, atmosphere: 'Aerobe',
  },
  'Bartonella henselae': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: N, atmosphere: 'Capnophilic',
  },
  'Bartonella quintana': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N,
    oxidase: N, catalase: N, atmosphere: 'Capnophilic',
  },
  'Coxiella burnetii': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N, atmosphere: 'Other',
  },
  'Chlamydia pneumoniae': {
    gram: 'Other', shape: ['Cocci'], motility: 'Non-motile', spores: N, atmosphere: 'Other',
  },
  'Chlamydia psittaci': {
    gram: 'Other', shape: ['Cocci'], motility: 'Non-motile', spores: N, atmosphere: 'Other',
  },
  'Rickettsia conorii': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N, atmosphere: 'Aerobe',
  },
  'Rickettsia prowazekii': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N, atmosphere: 'Aerobe',
  },
  'Rickettsia typhi': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N, atmosphere: 'Aerobe',
  },
  'Orientia tsutsugamushi': {
    gram: N, shape: ['Cocci', 'Bacilli'], motility: 'Non-motile', spores: N, atmosphere: 'Aerobe',
  },
  'Ehrlichia chaffeensis': {
    gram: N, shape: ['Cocci'], motility: 'Non-motile', spores: N, atmosphere: 'Other',
  },
  'Anaplasma phagocytophilum': {
    gram: N, shape: ['Cocci'], motility: 'Non-motile', spores: N, atmosphere: 'Other',
  },
  'Mycoplasma hominis': {
    gram: 'Other', shape: ['Other'], motility: 'Non-motile', spores: N,
    catalase: N, urease: N, atmosphere: 'Facultative',
  },
  'Mycoplasma genitalium': {
    gram: 'Other', shape: ['Other'], motility: 'Non-motile', spores: N,
    catalase: N, urease: N, atmosphere: 'Facultative',
  },
  'Ureaplasma urealyticum': {
    gram: 'Other', shape: ['Other'], motility: 'Non-motile', spores: N,
    catalase: N, urease: P, atmosphere: 'Facultative',
  },
};
