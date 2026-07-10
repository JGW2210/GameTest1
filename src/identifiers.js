// Phenotypic / biochemical identifier schema + comparison logic.
//
// Used by the browser (Identifier and Combined game modes) and by the Node
// build step that merges lab profiles into the dataset. Kept as .js (not .mjs)
// so browsers serve it with the right MIME type on GitHub Pages while Node still
// imports it as ESM.

export const P = 'Positive';
export const N = 'Negative';
export const V = 'Variable';

// Ordered list of identifiers shown in the grid, grouped into sections.
export const IDENTIFIERS = [
  { key: 'gram', label: 'Gram stain', group: 'Morphology', type: 'single',
    values: ['Positive', 'Negative', 'Variable', 'Acid-fast', 'Other'] },
  { key: 'shape', label: 'Shape', group: 'Morphology', type: 'multi',
    values: ['Cocci', 'Bacilli', 'Diplococci', 'Chains', 'Clusters', 'Spiral'] },
  { key: 'motility', label: 'Motility', group: 'Morphology', type: 'single',
    values: ['Motile', 'Non-motile', 'Temp-variable'] },
  { key: 'spores', label: 'Spores', group: 'Morphology', type: 'single',
    values: ['Positive', 'Negative', 'Variable'] },

  { key: 'oxidase', label: 'Oxidase', group: 'Enzymes', type: 'single', values: [P, N, V] },
  { key: 'catalase', label: 'Catalase', group: 'Enzymes', type: 'single', values: [P, N, V] },
  { key: 'coagulase', label: 'Coagulase', group: 'Enzymes', type: 'single', values: [P, N, V] },
  { key: 'dnase', label: 'DNase', group: 'Enzymes', type: 'single', values: [P, N, V] },
  { key: 'aesculin', label: 'Aesculin', group: 'Enzymes', type: 'single', values: [P, N, V] },
  { key: 'pyr', label: 'PYR / PYZ', group: 'Enzymes', type: 'single', values: [P, N, V] },
  { key: 'tributyrin', label: 'Tributyrin', group: 'Enzymes', type: 'single', values: [P, N, V] },

  { key: 'indole', label: 'Indole', group: 'Biochemical', type: 'single', values: [P, N, V] },
  { key: 'methylRed', label: 'Methyl red', group: 'Biochemical', type: 'single', values: [P, N, V] },
  { key: 'vp', label: 'Voges-Proskauer', group: 'Biochemical', type: 'single', values: [P, N, V] },
  { key: 'citrate', label: 'Citrate', group: 'Biochemical', type: 'single', values: [P, N, V] },

  { key: 'fermentation', label: 'Fermentation', group: 'Metabolism', type: 'multi',
    values: ['Glucose', 'Lactose', 'Maltose', 'Sucrose', 'Mannitol', 'Other'] },
  { key: 'of', label: 'Hugh–Leifson (O/F)', group: 'Metabolism', type: 'single',
    values: ['Oxidative', 'Fermentative', 'Non-reactive'] },

  { key: 'haemolysis', label: 'Haemolysis', group: 'Culture', type: 'single',
    values: ['Alpha', 'Beta', 'Gamma'] },
  { key: 'atmosphere', label: 'Atmosphere', group: 'Culture', type: 'single',
    values: ['Aerobe', 'Anaerobe', 'Facultative', 'Microaerophilic', 'Capnophilic', 'Other'] },
];

export const ID_GROUPS = ['Morphology', 'Enzymes', 'Biochemical', 'Metabolism', 'Culture'];
export const ID_SPEC = Object.fromEntries(IDENTIFIERS.map((s) => [s.key, s]));

// Loose-string coercion so external (e.g. Supabase) rows with "+", "pos",
// "neg", "beta-haemolytic" etc. normalise onto the canonical vocabulary.
const COERCE = {
  '+': P, pos: P, positive: P, p: P,
  '-': N, neg: N, negative: N, n: N,
  var: V, variable: V, v: V,
  motile: 'Motile', 'non-motile': 'Non-motile', nonmotile: 'Non-motile',
  'temp-variable': 'Temp-variable', 'temperature-variable': 'Temp-variable',
  'acid-fast': 'Acid-fast', acidfast: 'Acid-fast',
  o: 'Oxidative', oxidative: 'Oxidative', f: 'Fermentative', fermentative: 'Fermentative',
  'non-reactive': 'Non-reactive', nonreactive: 'Non-reactive', inert: 'Non-reactive',
  alpha: 'Alpha', a: 'Alpha', beta: 'Beta', b: 'Beta', gamma: 'Gamma', g: 'Gamma',
  aerobe: 'Aerobe', aerobic: 'Aerobe', anaerobe: 'Anaerobe', anaerobic: 'Anaerobe',
  facultative: 'Facultative', microaerophilic: 'Microaerophilic', capnophilic: 'Capnophilic',
};

export function coerceValue(raw) {
  if (raw == null) return undefined;
  if (Array.isArray(raw)) return raw.map((x) => coerceValue(x)).filter(Boolean);
  const s = String(raw).trim();
  if (!s) return undefined;
  const c = COERCE[s.toLowerCase()];
  if (c) return c;
  return s.charAt(0).toUpperCase() + s.slice(1); // Title-ish case
}

const isVarToken = (v) => v === 'Variable' || v === 'Temp-variable';
const setEq = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

// Compare a guessed organism's identifier value against the target's.
// Returns 'green' (exact), 'orange' (partial / variable overlap), 'red' (no
// match), or 'neutral' (not scorable because a value is unknown).
export function compareIdentifier(guessVal, targetVal, spec) {
  if (spec.type === 'multi') {
    if (targetVal === undefined || guessVal === undefined) return 'neutral';
    const A = new Set(guessVal), B = new Set(targetVal);
    if (setEq(A, B)) return 'green';
    let inter = 0;
    for (const x of A) if (B.has(x)) inter++;
    return inter > 0 ? 'orange' : 'red';
  }
  if (targetVal == null || targetVal === '') return 'neutral';
  if (guessVal == null || guessVal === '') return 'neutral';
  if (guessVal === targetVal) return 'green';
  if (isVarToken(guessVal) || isVarToken(targetVal)) return 'orange';
  return 'red';
}

// Human-readable rendering of a value (arrays -> comma list).
export function displayValue(v) {
  if (v == null) return '—';
  return Array.isArray(v) ? (v.length ? v.join(', ') : 'None') : v;
}
