// Game state: taxonomic comparison + phenotypic identifier grid.
import { BACTERIA } from './data.js';
import { IDENTIFIERS, compareIdentifier } from './identifiers.js';

export const RANKS = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];
export const RANK_LABELS = {
  kingdom: 'Kingdom', phylum: 'Phylum', class: 'Class', order: 'Order',
  family: 'Family', genus: 'Genus', species: 'Species',
};

// mode → which surfaces it uses and whether it needs a lab profile.
export const MODES = {
  taxonomy: { label: 'Taxonomic', tree: true, grid: false, needsProfile: false },
  identifier: { label: 'Identifier', tree: false, grid: true, needsProfile: true },
  combined: { label: 'Combined', tree: true, grid: true, needsProfile: true },
};

const eq = (a, b) => (a || '').toLowerCase() === (b || '').toLowerCase();
const lineageOf = (rec) => RANKS.map((r) => rec[r]);

export class Game {
  constructor(data = BACTERIA) {
    this.mode = 'taxonomy';
    this.setDataset(data);
  }

  // Swap the underlying pool (e.g. a list loaded from Supabase). Rebuilds the
  // lineage/autocomplete indexes and starts a fresh game.
  setDataset(data) {
    this.data = data;
    this.genusIndex = new Map();       // genus → representative record (lineage)
    for (const rec of data) {
      if (!this.genusIndex.has(rec.genus)) this.genusIndex.set(rec.genus, rec);
    }
    this.newGame();
  }

  cfg() { return MODES[this.mode]; }
  needsProfile() { return this.cfg().needsProfile; }

  // Records available to guess/target in the current mode. Taxonomic surfaces
  // require a full lineage; identifier surfaces require a lab profile.
  pool() {
    const cfg = this.cfg();
    const hasLineage = (r) => r.phylum && r.class && r.order && r.family;
    return this.data.filter((r) => {
      if (cfg.needsProfile && !r.id) return false;
      if (cfg.tree && !hasLineage(r)) return false;
      return true;
    });
  }

  setMode(mode) {
    if (!MODES[mode]) return;
    this.mode = mode;
    this.newGame();
  }

  newGame(target) {
    const pool = this.pool();
    this.target = target || pool[Math.floor(Math.random() * pool.length)] || this.data[0];
    this.targetLineage = lineageOf(this.target);
    this.guesses = [];
    this.confirmedDepth = 1; // Kingdom (Bacteria) is given for free.
    this.won = false;

    // Autocomplete data, limited to the current pool.
    const genera = new Set(pool.map((r) => r.genus));
    this.genera = [...genera].sort();
    this.speciesByGenus = new Map();
    for (const rec of pool) {
      if (!this.speciesByGenus.has(rec.genus)) this.speciesByGenus.set(rec.genus, []);
      this.speciesByGenus.get(rec.genus).push(rec);
    }

    // Fresh identifier grid.
    this.idState = {};
    for (const spec of IDENTIFIERS) {
      this.idState[spec.key] = { locked: false, state: 'empty', value: null, guessId: 0 };
    }
    return this.target;
  }

  _canonGenus(name) {
    const n = (name || '').trim().toLowerCase();
    for (const g of this.genera) if (g.toLowerCase() === n) return g;
    return null;
  }

  speciesFor(genus) {
    const g = this._canonGenus(genus);
    return g ? (this.speciesByGenus.get(g) || []) : [];
  }

  submitGuess(genusInput, speciesInput) {
    if (this.won) return null;
    const genus = this._canonGenus(genusInput);
    if (!genus) return { error: `Unknown genus "${genusInput}". Pick one from the list.` };

    const species = (speciesInput || '').trim();
    const lineageRec = this.genusIndex.get(genus);
    const rec = this.data.find((r) => eq(r.genus, genus) && eq(r.species, species)) || null;

    if (this.needsProfile() && (!rec || !rec.id)) {
      return { error: `No lab profile for "${genus} ${species || '…'}". Choose a highlighted organism.` };
    }

    // Taxonomic comparison (genus fixes the lineage above it; species is as typed).
    const lineage = [...lineageOf(lineageRec).slice(0, 6), species];
    let common = 0;
    while (common < RANKS.length && eq(lineage[common], this.targetLineage[common])) common++;

    const win = common === RANKS.length;
    this.confirmedDepth = Math.max(this.confirmedDepth, common);
    if (win) this.won = true;

    const guess = { id: this.guesses.length + 1, genus, species, lineage, common, win, rec };
    this.guesses.push(guess);

    // Identifier grid update (only unlocked cells change; greens stay locked).
    let idResult = null;
    if (this.cfg().grid) idResult = this._updateGrid(rec, guess.id);

    return {
      guess,
      win,
      revealed: RANKS.slice(0, this.confirmedDepth).map((rank, i) => ({
        rank, label: RANK_LABELS[rank], name: this.targetLineage[i],
      })),
      matchedRank: common > 0 ? RANKS[common - 1] : null,
      idResult,
    };
  }

  _updateGrid(rec, guessId) {
    const changed = [];
    let newlyGreen = 0;
    for (const spec of IDENTIFIERS) {
      const st = this.idState[spec.key];
      if (st.locked) continue;
      const gVal = rec.id ? rec.id[spec.key] : undefined;
      const tVal = this.target.id ? this.target.id[spec.key] : undefined;
      const state = compareIdentifier(gVal, tVal, spec);
      st.state = state;
      st.value = gVal ?? null;
      st.guessId = guessId;
      if (state === 'green') { st.locked = true; st.value = tVal; newlyGreen++; }
      changed.push(spec.key);
    }
    return { changed, newlyGreen };
  }

  // Reveal everything (used by "Reveal answer").
  reveal() {
    this.won = true;
    this.confirmedDepth = RANKS.length;
    for (const spec of IDENTIFIERS) {
      const tVal = this.target.id ? this.target.id[spec.key] : undefined;
      const st = this.idState[spec.key];
      if (tVal !== undefined) { st.locked = true; st.value = tVal; st.state = 'green'; }
    }
  }

  // Grid rows for rendering, grouped by section.
  gridRows() {
    return IDENTIFIERS.map((spec) => ({
      spec,
      ...this.idState[spec.key],
      target: this.target.id ? this.target.id[spec.key] : undefined,
    }));
  }

  // The identifiers confirmed (locked green) to match the target so far — the
  // accumulated "known correct" set. Everything else reads as still unknown.
  confirmedRows() {
    return IDENTIFIERS.map((spec) => {
      const st = this.idState[spec.key];
      return {
        spec,
        locked: st.locked,
        state: st.locked ? 'green' : 'empty',
        value: st.locked ? st.value : null,
        guessId: st.locked ? st.guessId : 0,
      };
    });
  }

  // The last guessed organism's full identifier profile, scored against the
  // target — independent of what is locked, so it can be shown side-by-side.
  lastGuessRows() {
    const last = this.guesses[this.guesses.length - 1];
    const rec = last && last.rec;
    const tId = this.target && this.target.id;
    return IDENTIFIERS.map((spec) => {
      const gVal = rec && rec.id ? rec.id[spec.key] : undefined;
      if (!rec || gVal === undefined) {
        return { spec, state: 'empty', value: null, guessId: last ? last.id : 0 };
      }
      const tVal = tId ? this.target.id[spec.key] : undefined;
      return { spec, state: compareIdentifier(gVal, tVal, spec), value: gVal, guessId: last.id };
    });
  }

  gridScored() {
    // How many identifiers are known for the target (scorable).
    if (!this.target.id) return { total: 0, green: 0 };
    let total = 0, green = 0;
    for (const spec of IDENTIFIERS) {
      if (this.target.id[spec.key] === undefined) continue;
      total++;
      if (this.idState[spec.key].locked) green++;
    }
    return { total, green };
  }

  // Build the dendrogram as a tree of nodes for the renderer.
  buildTree() {
    const root = {
      id: 'k:Bacteria', rank: 'kingdom', rankIndex: 0, name: 'Bacteria',
      state: 'correct', children: [], _childMap: new Map(),
    };
    const onTruePath = (path, rankIndex) => {
      if (rankIndex >= this.confirmedDepth) return false;
      for (let i = 0; i <= rankIndex; i++) if (!eq(path[i], this.targetLineage[i])) return false;
      return true;
    };

    for (const g of this.guesses) {
      let node = root;
      const path = g.lineage;
      for (let ri = 1; ri < RANKS.length; ri++) {
        const name = path[ri];
        if (!name) break;
        const id = `${RANKS[ri]}:${path.slice(0, ri + 1).join('>')}`;
        let child = node._childMap.get(id);
        if (!child) {
          child = {
            id, rank: RANKS[ri], rankIndex: ri, name,
            state: onTruePath(path, ri) ? 'correct' : 'wrong',
            isLeaf: ri === RANKS.length - 1,
            win: ri === RANKS.length - 1 && g.win,
            guessId: g.id, children: [], _childMap: new Map(),
          };
          node._childMap.set(id, child);
          node.children.push(child);
        } else {
          child.state = onTruePath(path, ri) ? 'correct' : (child.state === 'correct' ? 'correct' : 'wrong');
          if (ri === RANKS.length - 1 && g.win) child.win = true;
        }
        node = child;
      }
    }

    if (!this.won && this.confirmedDepth < RANKS.length) {
      let node = root;
      for (let ri = 1; ri < this.confirmedDepth; ri++) {
        const id = `${RANKS[ri]}:${this.targetLineage.slice(0, ri + 1).join('>')}`;
        node = node._childMap.get(id) || node;
      }
      const mri = this.confirmedDepth;
      const mid = `mystery:${mri}`;
      if (!node._childMap.has(mid)) {
        const mystery = {
          id: mid, rank: RANKS[mri], rankIndex: mri, name: '?',
          state: 'mystery', isLeaf: false, children: [], _childMap: new Map(),
        };
        node._childMap.set(mid, mystery);
        node.children.push(mystery);
      }
    }

    const order = (c) => (c.state === 'correct' ? 0 : c.state === 'mystery' ? 1 : 2);
    const sortRec = (n) => {
      n.children.sort((a, b) => order(a) - order(b) || (a.guessId || 0) - (b.guessId || 0));
      n.children.forEach(sortRec);
    };
    sortRec(root);
    return root;
  }
}
