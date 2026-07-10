// ── Supabase configuration ───────────────────────────────────────────────────
//
// The game plays perfectly on its bundled dataset with NO configuration. To let
// players load bacteria lists from your SpeciesDoc Supabase project instead,
// fill this in and set `enabled: true`.
//
// The anon (public) key is designed to live in frontend code — keep Row Level
// Security enabled on your tables so it only exposes what you intend.

export const SUPABASE = {
  enabled: true,

  url: 'https://kgggfjxssnpovejwdrgu.supabase.co',
  anonKey: 'sb_publishable_0sTcB32Xn8PsEU7M1OJhhg_zYS_iwVE', // publishable/anon key — safe in frontend with RLS
  table: 'species', // SpeciesDoc bacteria table (viruses/parasites live elsewhere)

  // Map YOUR table's columns to the game's fields. Only genus + species are
  // required; taxonomy columns are optional — when missing, the game fills the
  // lineage from its bundled facts by matching the binomial name.
  columns: {
    genus: 'genus',
    species: 'species',
    // The SpeciesDoc `species` table keeps taxonomy in a single jsonb column
    // rather than one column per rank, so the per-rank fields are null and the
    // lineage is read from `lineageColumn` instead (falling back to bundled
    // facts by name for anything missing).
    kingdom: null, phylum: null, class: null, order: null, family: null,
    lineageColumn: 'lineage',
    notes: 'other_notes',
    // Set to 'owner' to expose one selectable list per user (labelled by the
    // owner uuid); left null to load all accessible rows as a single list.
    list: null,
  },

  // The `species` table already stores every lab identifier, so map them all.
  // Multi-value columns (shape, fermentation) may be comma/semicolon separated.
  identifierColumns: {
    gram: 'gram',
    shape: 'distinctive_shape',
    motility: 'motility',
    spores: 'spores',
    oxidase: 'oxidase',
    catalase: 'catalase',
    coagulase: 'coagulase',
    dnase: 'dnase',
    aesculin: 'aesculin',
    pyr: 'pyr_pyz',
    tributyrin: 'tributyrin',
    indole: 'indole',
    methylRed: 'methyl_red',
    vp: 'voges_proskauer',
    citrate: 'citrate',
    fermentation: 'fermentation',
    of: 'hugh_leifson_of',
    haemolysis: 'haemolysis',
    atmosphere: 'atmosphere',
  },
};
