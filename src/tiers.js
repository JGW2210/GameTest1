// Difficulty tiers for the bundled set. The full pool (151) is large; these
// let a player scope it to a friendlier size. Membership is cumulative:
//   Elementary ⊂ Expanded ⊂ Inclusive.
//
//   • Elementary (~40) — the classic, instructive teaching organisms with
//     distinctive, textbook lab results.
//   • Expanded  (~80)  — adds the more common clinical bacteria.
//   • Inclusive (all)  — the entire bundled set.

export const TIERS = [
  { key: 'elementary', label: 'Elementary' },
  { key: 'expanded', label: 'Expanded' },
  { key: 'inclusive', label: 'Inclusive' },
];

// The classic core taught in every microbiology course.
const ELEMENTARY = [
  'Staphylococcus aureus', 'Staphylococcus epidermidis', 'Staphylococcus saprophyticus',
  'Streptococcus pyogenes', 'Streptococcus agalactiae', 'Streptococcus pneumoniae',
  'Enterococcus faecalis',
  'Listeria monocytogenes', 'Corynebacterium diphtheriae',
  'Bacillus anthracis', 'Bacillus cereus',
  'Clostridium perfringens', 'Clostridium tetani', 'Clostridium botulinum', 'Clostridioides difficile',
  'Mycobacterium tuberculosis', 'Mycobacterium leprae',
  'Escherichia coli', 'Klebsiella pneumoniae', 'Salmonella enterica', 'Shigella flexneri',
  'Proteus mirabilis', 'Yersinia pestis', 'Serratia marcescens',
  'Vibrio cholerae', 'Campylobacter jejuni', 'Helicobacter pylori',
  'Pseudomonas aeruginosa', 'Acinetobacter baumannii',
  'Neisseria meningitidis', 'Neisseria gonorrhoeae', 'Haemophilus influenzae',
  'Bordetella pertussis', 'Legionella pneumophila', 'Moraxella catarrhalis',
  'Bacteroides fragilis',
  'Treponema pallidum', 'Borrelia burgdorferi', 'Chlamydia trachomatis', 'Mycoplasma pneumoniae',
];

// The more common clinical bacteria layered on top of the core.
const EXPANDED_ADD = [
  'Staphylococcus haemolyticus', 'Streptococcus mutans', 'Enterococcus faecium',
  'Cutibacterium acnes', 'Actinomyces israelii', 'Nocardia asteroides', 'Bacillus subtilis',
  'Corynebacterium ulcerans',
  'Klebsiella oxytoca', 'Klebsiella aerogenes', 'Citrobacter freundii', 'Citrobacter koseri',
  'Enterobacter cloacae', 'Morganella morganii', 'Proteus vulgaris', 'Providencia stuartii',
  'Shigella sonnei', 'Shigella dysenteriae', 'Yersinia enterocolitica', 'Cronobacter sakazakii',
  'Vibrio parahaemolyticus', 'Vibrio vulnificus', 'Aeromonas hydrophila',
  'Stenotrophomonas maltophilia', 'Burkholderia cepacia', 'Burkholderia pseudomallei',
  'Brucella melitensis', 'Francisella tularensis', 'Campylobacter coli', 'Pasteurella multocida',
  'Haemophilus parainfluenzae', 'Aggregatibacter actinomycetemcomitans', 'Eikenella corrodens',
  'Kingella kingae', 'Fusobacterium nucleatum', 'Prevotella melaninogenica', 'Gardnerella vaginalis',
  'Mycobacterium avium', 'Leptospira interrogans', 'Bartonella henselae',
];

const norm = (s) => s.trim().toLowerCase();
const ELEMENTARY_SET = new Set(ELEMENTARY.map(norm));
const EXPANDED_SET = new Set([...ELEMENTARY, ...EXPANDED_ADD].map(norm));

const binomial = (rec) => `${rec.genus} ${rec.species}`;

// The difficulty tier a record belongs to.
export function tierOf(rec) {
  const k = norm(binomial(rec));
  if (ELEMENTARY_SET.has(k)) return 'elementary';
  if (EXPANDED_SET.has(k)) return 'expanded';
  return 'inclusive';
}

// Filter a record list down to the given tier (cumulative). Unknown keys and
// 'inclusive' return the list unchanged.
export function poolForTier(records, tierKey) {
  if (tierKey === 'elementary') return records.filter((r) => ELEMENTARY_SET.has(norm(binomial(r))));
  if (tierKey === 'expanded') return records.filter((r) => EXPANDED_SET.has(norm(binomial(r))));
  return records;
}

// For validation/tests: the raw name lists.
export const TIER_NAMES = { elementary: ELEMENTARY, expandedAdd: EXPANDED_ADD };
