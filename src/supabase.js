// Supabase data adapter (optional). Loads user bacteria lists from the
// SpeciesDoc project via the REST API and maps them onto the game's record
// shape, falling back to bundled facts (taxonomy + lab profile) by binomial
// name when a row doesn't supply them itself.

import { SUPABASE } from './config.js';
import { coerceValue, IDENTIFIERS } from './identifiers.js';

export function supabaseConfigured() {
  return !!(SUPABASE.enabled && SUPABASE.url && SUPABASE.anonKey);
}

async function rest(query) {
  const res = await fetch(`${SUPABASE.url.replace(/\/$/, '')}/rest/v1/${query}`, {
    headers: { apikey: SUPABASE.anonKey, Authorization: `Bearer ${SUPABASE.anonKey}` },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.json();
}

// Distinct named lists, if a grouping column is configured.
export async function fetchListNames() {
  const col = SUPABASE.columns.list;
  if (!col) return [];
  const rows = await rest(`${SUPABASE.table}?select=${col}`);
  return [...new Set(rows.map((r) => r[col]).filter(Boolean))].sort();
}

// Fetch and map records for a given list value (or all rows if no list column).
export async function fetchSupabaseRecords(listValue, bundled) {
  const c = SUPABASE.columns;
  let q = `${SUPABASE.table}?select=*`;
  if (c.list && listValue) q += `&${c.list}=eq.${encodeURIComponent(listValue)}`;
  const rows = await rest(q);
  return mapRows(rows, bundled);
}

const LINEAGE_RANKS = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];

// Interpret a jsonb lineage into { rank: name } pairs. Handles a rank-keyed
// object ({phylum:'…', class:'…'}), a positional array (kingdom→species order),
// and an array of {rank,name}-style objects.
export function parseLineage(raw) {
  if (!raw) return {};
  let obj = raw;
  if (typeof raw === 'string') { try { obj = JSON.parse(raw); } catch { return {}; } }
  const out = {};
  if (Array.isArray(obj)) {
    if (obj.length && typeof obj[0] === 'object' && obj[0] !== null) {
      for (const it of obj) {
        const rank = String(it.rank ?? it.level ?? it.key ?? '').toLowerCase();
        const name = it.name ?? it.value ?? it.taxon ?? it.scientificName;
        if (LINEAGE_RANKS.includes(rank) && name) out[rank] = String(name).trim();
      }
    } else {
      obj.forEach((name, i) => { if (LINEAGE_RANKS[i] && name) out[LINEAGE_RANKS[i]] = String(name).trim(); });
    }
  } else if (typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      const lk = k.toLowerCase();
      if (LINEAGE_RANKS.includes(lk) && obj[k]) out[lk] = String(obj[k]).trim();
    }
  }
  return out;
}

export function mapRows(rows, bundled) {
  const idx = new Map(bundled.map((r) => [`${r.genus} ${r.species}`.toLowerCase(), r]));
  const c = SUPABASE.columns;
  const ic = SUPABASE.identifierColumns || {};
  const get = (row, col) => (col ? row[col] : undefined);
  const out = [];
  const seen = new Set();

  for (const row of rows) {
    const genus = String(get(row, c.genus) || '').trim();
    const species = String(get(row, c.species) || '').trim();
    if (!genus) continue;
    const key = `${genus} ${species}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const b = idx.get(key);
    const lin = c.lineageColumn ? parseLineage(get(row, c.lineageColumn)) : {};

    const rank = (colKey) => get(row, c[colKey]) || lin[colKey] || b?.[colKey] || '';
    const rec = {
      kingdom: 'Bacteria',
      phylum: rank('phylum'),
      class: rank('class'),
      order: rank('order'),
      family: rank('family'),
      genus, species,
      notes: get(row, c.notes) || b?.notes || '',
    };

    // Identifier profile: from row columns if mapped, else bundled profile.
    let id = null;
    if (Object.keys(ic).length) {
      id = {};
      for (const spec of IDENTIFIERS) {
        const col = ic[spec.key];
        if (!col || row[col] == null) continue;
        if (spec.type === 'multi') {
          const parts = Array.isArray(row[col]) ? row[col] : String(row[col]).split(/[;,]/);
          const vals = parts.map((s) => coerceValue(String(s).trim())).filter(Boolean);
          if (vals.length) id[spec.key] = vals;
        } else {
          const v = coerceValue(row[col]);
          if (v !== undefined) id[spec.key] = v;
        }
      }
      if (!Object.keys(id).length) id = null;
    }
    if (!id && b?.id) id = b.id;
    if (id) rec.id = id;

    // Keep a row if it can play SOMETHING: a full lineage (taxonomic/combined)
    // or a lab profile (identifier). The game's per-mode pool filters further.
    const hasLineage = rec.phylum && rec.class && rec.order && rec.family;
    if (hasLineage || rec.id) out.push(rec);
  }
  return out;
}
