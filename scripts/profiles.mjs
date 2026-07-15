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
};
