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
  table: 'bacteria', // TODO: set to your actual table name (see note below)

  // Map YOUR table's columns to the game's fields. Only genus + species are
  // required; taxonomy columns are optional — when missing, the game fills the
  // lineage from its bundled facts by matching the binomial name.
  columns: {
    genus: 'genus',
    species: 'species',
    kingdom: 'kingdom',
    phylum: 'phylum',
    class: 'class',
    order: 'order',
    family: 'family',
    notes: 'notes',
    // Optional column that groups rows into named, selectable lists
    // (e.g. 'list_name' or 'user_id'). Leave null for a single flat list.
    list: null,
  },

  // OPTIONAL: if your rows already store lab results, map game identifier keys
  // to your columns here (game key → your column name). Multi-value columns
  // (shape, fermentation) may be comma/semicolon separated. Leave empty to use
  // the game's bundled profiles instead.
  //   gram, shape, motility, spores, oxidase, catalase, coagulase, dnase,
  //   aesculin, pyr, tributyrin, indole, methylRed, vp, citrate, fermentation,
  //   of, haemolysis, atmosphere
  identifierColumns: {
    // gram: 'gram_stain',
    // catalase: 'catalase',
  },
};
