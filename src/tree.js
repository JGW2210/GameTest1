// Animated SVG dendrogram renderer.
//
// The tree only ever grows, so on each update we reuse existing node/edge DOM,
// animate everything from its previous position to the freshly laid-out one, and
// let brand-new nodes sprout out of their parent — a single requestAnimationFrame
// tween keeps nodes and their connecting branches perfectly in sync.

import { RANKS, RANK_LABELS } from './game.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const ML = 96, MR = 44, MT = 46, MB = 44; // margins
const COL = 104, ROW = 96;                 // grid spacing
const DUR = 560;                           // animation ms

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const el = (name, attrs = {}) => {
  const e = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};
const reduceMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export class TreeView {
  constructor(svg) {
    this.svg = svg;
    this.gGuides = el('g', { class: 'guides' });
    this.gLabels = el('g', { class: 'rank-labels' });
    this.gEdges = el('g', { class: 'edges' });
    this.gNodes = el('g', { class: 'nodes' });
    svg.append(this.gGuides, this.gLabels, this.gEdges, this.gNodes);
    this.nodeEls = new Map(); // id -> { g, circle, label }
    this.edgeEls = new Map(); // childId -> path
    this.prevPos = new Map(); // id -> {x, y}
    this.raf = null;
  }

  // Assign grid columns (x) to every node: leaves get sequential slots, parents
  // sit above the mean of their children.
  _layout(root) {
    let leaf = 0;
    const nodes = [];
    const walk = (n, parentId) => {
      n.parentId = parentId;
      nodes.push(n);
      if (!n.children || n.children.length === 0) {
        n.col = leaf++;
      } else {
        n.children.forEach((c) => walk(c, n.id));
        n.col = (n.children[0].col + n.children[n.children.length - 1].col) / 2;
      }
    };
    walk(root, null);
    const cols = Math.max(1, leaf);
    for (const n of nodes) {
      n.x = ML + n.col * COL + COL / 2;
      n.y = MT + n.rankIndex * ROW;
    }
    return { nodes, cols };
  }

  _edgePath(x1, y1, x2, y2) {
    const my = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${my} ${x2} ${my} ${x2} ${y2}`;
  }

  _ensureNode(n) {
    let rec = this.nodeEls.get(n.id);
    if (!rec) {
      const g = el('g', { class: 'node', 'data-rank': n.rank });
      const shape = el('circle', { r: n.state === 'mystery' ? 17 : 19, cx: 0, cy: 0 });
      const label = el('text', { class: 'node-label', x: 0, y: 36, 'text-anchor': 'middle' });
      const inner = el('text', { class: 'node-inner', x: 0, y: 5, 'text-anchor': 'middle' });
      g.append(shape, inner, label);
      const title = el('title');
      g.append(title);
      this.gNodes.append(g);
      rec = { g, shape, label, inner, title, isNew: true };
      this.nodeEls.set(n.id, rec);
    } else {
      rec.isNew = false;
    }
    // State + text (CSS handles colour transitions).
    rec.g.setAttribute('class', `node state-${n.state}${n.win ? ' win' : ''}${n.isLeaf ? ' leaf' : ''}`);
    const italic = n.rank === 'genus' || n.rank === 'species';
    rec.label.setAttribute('class', `node-label${italic ? ' italic' : ''}`);
    rec.label.textContent = n.state === 'mystery' ? '' : n.name;
    rec.inner.textContent = n.state === 'mystery' ? '?' : '';
    rec.title.textContent =
      n.state === 'mystery'
        ? `Unknown ${RANK_LABELS[n.rank]} — the true answer branches here`
        : `${RANK_LABELS[n.rank]}: ${n.name}`;
    return rec;
  }

  _ensureEdge(id) {
    let p = this.edgeEls.get(id);
    if (!p) {
      p = el('path', { class: 'edge' });
      this.gEdges.append(p);
      this.edgeEls.set(id, p);
      p._isNew = true;
    } else {
      p._isNew = false;
    }
    return p;
  }

  _drawStatic(cols) {
    const width = ML + cols * COL + MR;
    const height = MT + (RANKS.length - 1) * ROW + MB;
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMin meet');

    // Rank rows + labels (rebuilt cheaply each update).
    this.gGuides.replaceChildren();
    this.gLabels.replaceChildren();
    RANKS.forEach((rank, i) => {
      const y = MT + i * ROW;
      this.gGuides.append(el('line', { class: 'guide', x1: ML - 8, y1: y, x2: width - MR + 8, y2: y }));
      const t = el('text', { class: 'rank-label', x: 12, y: y + 4 });
      t.textContent = RANK_LABELS[rank];
      this.gLabels.append(t);
    });
    return { width, height };
  }

  update(root) {
    const { nodes, cols } = this._layout(root);
    this._drawStatic(cols);

    const targets = new Map();
    const parentOf = new Map();
    for (const n of nodes) {
      targets.set(n.id, { x: n.x, y: n.y });
      parentOf.set(n.id, n.parentId);
      this._ensureNode(n);
    }
    // Prune anything no longer present (defensive; tree normally only grows).
    for (const id of [...this.nodeEls.keys()]) {
      if (!targets.has(id)) { this.nodeEls.get(id).g.remove(); this.nodeEls.delete(id); }
    }
    for (const id of [...this.edgeEls.keys()]) {
      if (!targets.has(id)) { this.edgeEls.get(id).remove(); this.edgeEls.delete(id); }
    }

    // Starting positions: existing nodes keep their spot; new nodes sprout from
    // their parent's target so branches visibly grow outward.
    const froms = new Map();
    const isNew = new Map();
    for (const n of nodes) {
      const prev = this.prevPos.get(n.id);
      if (prev) { froms.set(n.id, prev); isNew.set(n.id, false); }
      else {
        const pt = targets.get(parentOf.get(n.id)) || targets.get(n.id);
        froms.set(n.id, { ...pt });
        isNew.set(n.id, true);
      }
    }

    const cur = new Map();
    const applyFrame = (t) => {
      const e = easeInOut(t);
      for (const n of nodes) {
        const f = froms.get(n.id), to = targets.get(n.id);
        const x = lerp(f.x, to.x, e), y = lerp(f.y, to.y, e);
        cur.set(n.id, { x, y });
        const rec = this.nodeEls.get(n.id);
        const s = isNew.get(n.id) ? lerp(0.2, 1, e) : 1;
        rec.g.setAttribute('transform', `translate(${x} ${y}) scale(${s})`);
        rec.g.style.opacity = isNew.get(n.id) ? e : 1;
      }
      for (const n of nodes) {
        if (!n.parentId) continue;
        const p = this._ensureEdge(n.id);
        const a = cur.get(n.parentId), b = cur.get(n.id);
        p.setAttribute('d', this._edgePath(a.x, a.y, b.x, b.y));
        p.setAttribute('class', `edge state-${n.state}`);
      }
    };

    if (this.raf) cancelAnimationFrame(this.raf);
    if (reduceMotion()) {
      applyFrame(1);
      this.prevPos = targets;
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / DUR);
      applyFrame(t);
      if (t < 1) this.raf = requestAnimationFrame(step);
      else { this.prevPos = targets; this.raf = null; }
    };
    this.raf = requestAnimationFrame(step);
  }

  reset() {
    this.gNodes.replaceChildren();
    this.gEdges.replaceChildren();
    this.nodeEls.clear();
    this.edgeEls.clear();
    this.prevPos.clear();
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}
