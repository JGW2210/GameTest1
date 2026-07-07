// Game state and taxonomic comparison logic.
import { BACTERIA } from './data.js';

export const RANKS = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];
export const RANK_LABELS = {
  kingdom: 'Kingdom', phylum: 'Phylum', class: 'Class', order: 'Order',
  family: 'Family', genus: 'Genus', species: 'Species',
};

const eq = (a, b) => (a || '').toLowerCase() === (b || '').toLowerCase();
const lineageOf = (rec) => RANKS.map((r) => rec[r]);

export class Game {
  constructor(data = BACTERIA) {
    this.data = data;
    // One representative lineage per genus (every rank above genus is fixed).
    this.genusIndex = new Map();
    this.speciesByGenus = new Map();
    for (const rec of data) {
      if (!this.genusIndex.has(rec.genus)) this.genusIndex.set(rec.genus, rec);
      if (!this.speciesByGenus.has(rec.genus)) this.speciesByGenus.set(rec.genus, []);
      this.speciesByGenus.get(rec.genus).push(rec);
    }
    this.genera = [...this.genusIndex.keys()].sort();
    this.newGame();
  }

  newGame(target) {
    this.target = target || this.data[Math.floor(Math.random() * this.data.length)];
    this.targetLineage = lineageOf(this.target);
    this.guesses = [];
    this.confirmedDepth = 1; // Kingdom (Bacteria) is given for free.
    this.won = false;
    return this.target;
  }

  hasGenus(name) {
    return this.genusIndex.has(this._canonGenus(name));
  }

  // Resolve user input to a known genus (case-insensitive), returning the
  // canonical spelling or null.
  _canonGenus(name) {
    const n = (name || '').trim().toLowerCase();
    for (const g of this.genera) if (g.toLowerCase() === n) return g;
    return null;
  }

  // Known species (with notes) for a genus, for autocomplete hints.
  speciesFor(genus) {
    const g = this._canonGenus(genus);
    return g ? this.speciesByGenus.get(g) : [];
  }

  submitGuess(genusInput, speciesInput) {
    if (this.won) return null;
    const genus = this._canonGenus(genusInput);
    if (!genus) return { error: `Unknown genus "${genusInput}". Pick one from the list.` };

    const rec = this.genusIndex.get(genus);
    const species = (speciesInput || '').trim();
    // The guessed lineage: genus fixes everything above it; species is as typed.
    const lineage = [...lineageOf(rec).slice(0, 6), species];

    let common = 0;
    while (common < RANKS.length && eq(lineage[common], this.targetLineage[common])) common++;

    const win = common === RANKS.length;
    this.confirmedDepth = Math.max(this.confirmedDepth, common);
    if (win) this.won = true;

    const guess = {
      id: this.guesses.length + 1,
      genus, species, lineage, common, win,
    };
    this.guesses.push(guess);
    return {
      guess,
      win,
      // Ranks now known to be correct (names revealed to the player).
      revealed: RANKS.slice(0, this.confirmedDepth).map((rank, i) => ({
        rank, label: RANK_LABELS[rank], name: this.targetLineage[i],
      })),
      // The deepest rank this specific guess matched.
      matchedRank: common > 0 ? RANKS[common - 1] : null,
    };
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
            guessId: g.id,
            children: [], _childMap: new Map(),
          };
          node._childMap.set(id, child);
          node.children.push(child);
        } else {
          // Re-evaluate correctness (confirmedDepth may have grown).
          child.state = onTruePath(path, ri) ? 'correct' : (child.state === 'correct' ? 'correct' : 'wrong');
          if (ri === RANKS.length - 1 && g.win) child.win = true;
        }
        node = child;
      }
    }

    // Plant the mystery "?" node at the frontier of confirmed knowledge.
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

    // Order children: true path first, mystery next, wrong branches after.
    const rank = (c) => (c.state === 'correct' ? 0 : c.state === 'mystery' ? 1 : 2);
    const sortRec = (n) => {
      n.children.sort((a, b) => rank(a) - rank(b) || (a.guessId || 0) - (b.guessId || 0));
      n.children.forEach(sortRec);
    };
    sortRec(root);
    return root;
  }
}
