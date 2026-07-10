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

function mapRows(rows, bundled) {
  const idx = new Map(bundled.map((r) => [`${r.genus} ${r.species}`.toLowerCase(), r]));
  const c = SUPABASE.columns;
  const ic = SUPABASE.identifierColumns || {};
  const out = [];
  const seen = new Set();

  for (const row of rows) {
    const genus = String(row[c.genus] || '').trim();
    const species = String(row[c.species] || '').trim();
    if (!genus) continue;
    const key = `${genus} ${species}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const b = idx.get(key);

    const rec = {
      kingdom: 'Bacteria',
      phylum: row[c.phylum] || b?.phylum || '',
      class: row[c.class] || b?.class || '',
      order: row[c.order] || b?.order || '',
      family: row[c.family] || b?.family || '',
      genus, species,
      notes: row[c.notes] || b?.notes || '',
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

    // Taxonomy modes need a full lineage; skip rows we can't complete.
    if (rec.phylum && rec.class && rec.order && rec.family) out.push(rec);
  }
  return out;
}
