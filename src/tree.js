// Animated SVG dendrogram renderer.
//
// The confirmed lineage (green trunk) plus the mystery frontier are always
// drawn. Wrong guesses are *collapsed*: each point where a guess leaves the
// correct path shows a cluster of clickable pills (one per wrong branch) anchored
// to the trunk, instead of a sprawling sub-tree. A freshly-made wrong guess is
// revealed in full for a couple of seconds so you can see where it landed, then
// it folds back into its pill. Clicking a pill expands/collapses that branch.
//
// Nodes and their connecting branches tween together via a single rAF loop; the
// pill clusters (HTML inside <foreignObject>) are rebuilt each render.

import { RANKS, RANK_LABELS } from './game.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const XHTML = 'http://www.w3.org/1999/xhtml';
const ML = 90, MR = 40, MT = 38, MB = 48;   // margins (MB fits the leaf label)
const COL = 100, ROW = 82;                    // grid spacing
const DUR = 560;                              // node animation ms
const REVEAL_MS = 2000;                       // fresh wrong guess stays open this long
const PILL_GAP = 34, PILL_W = 210;            // pill-zone geometry

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
    this.gPills = el('g', { class: 'pills' });
    svg.append(this.gGuides, this.gLabels, this.gEdges, this.gNodes, this.gPills);
    this.nodeEls = new Map(); // id -> { g, circle, label }
    this.edgeEls = new Map(); // childId -> path
    this.prevPos = new Map(); // id -> {x, y}
    this.raf = null;
    this.expanded = new Set(); // wrong-branch node ids the user pinned open
    this.reveal = null;        // wrong-branch node id temporarily open (fresh guess)
    this.revealTimer = null;
    this._root = null;         // last full tree handed to update()
  }

  // Split the full tree into (a) a pruned tree of nodes we actually draw — the
  // green trunk, the mystery node, and any open wrong branches — and (b) the
  // pill clusters that stand in for the collapsed wrong branches.
  _collapse(root) {
    const isOpen = (id) => this.expanded.has(id) || id === this.reveal;
    const pills = [];
    const clone = (n) => {
      const copy = { ...n, children: [] };
      const wrong = [];
      for (const c of n.children || []) {
        if (c.state === 'correct' || c.state === 'mystery') copy.children.push(clone(c));
        else wrong.push(c); // a branch leaving the correct path here
      }
      if (n.state === 'correct') {
        const items = [];
        for (const c of wrong) {
          const open = isOpen(c.id);
          items.push({ id: c.id, name: c.name, rank: c.rank, open });
          if (open) copy.children.push(clone(c));
        }
        if (items.length) pills.push({ parentId: n.id, childRankIndex: n.rankIndex + 1, items });
      } else {
        // Already inside an open wrong branch: draw all of its descendants.
        for (const c of wrong) copy.children.push(clone(c));
      }
      return copy;
    };
    return { root: clone(root), pills };
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

  _drawStatic(cols, extraRight) {
    const width = ML + cols * COL + extraRight + MR;
    const height = MT + (RANKS.length - 1) * ROW + MB;
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    // Render at intrinsic size so a small tree stays compact and centred instead
    // of being stretched to fill the panel width (which balloons its height).
    this.svg.setAttribute('width', width);
    this.svg.setAttribute('height', height);
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

  // What to keep centred: a freshly revealed wrong branch if one is open,
  // otherwise the deepest confirmed (green) node.
  _focus(nodes) {
    if (this.reveal) {
      const r = nodes.find((n) => n.id === this.reveal);
      if (r) return r;
    }
    let f = null;
    for (const n of nodes) {
      if (n.state === 'correct' && (!f || n.rankIndex > f.rankIndex)) f = n;
    }
    return f;
  }

  // Scroll the tree's own viewport (never the page) so the focus node is framed:
  // horizontally centred, and placed just above the vertical middle.
  _scrollToFocus(focus) {
    const sc = this.svg.parentElement;
    if (!focus || !sc) return;
    const scRect = sc.getBoundingClientRect();
    const svgRect = this.svg.getBoundingClientRect();
    if (!svgRect.width || !svgRect.height) return;
    const originLeft = sc.scrollLeft + (svgRect.left - scRect.left);
    const originTop = sc.scrollTop + (svgRect.top - scRect.top);
    const clamp = (v, max) => Math.max(0, Math.min(v, Math.max(0, max)));
    const to = {
      left: clamp(originLeft + focus.x - sc.clientWidth / 2, sc.scrollWidth - sc.clientWidth),
      top: clamp(originTop + focus.y - sc.clientHeight * 0.42, sc.scrollHeight - sc.clientHeight),
      behavior: reduceMotion() ? 'auto' : 'smooth',
    };
    try { sc.scrollTo(to); }
    catch { sc.scrollLeft = to.left; sc.scrollTop = to.top; }
  }

  // Public entry point. `revealId` (optional) is the node where the newest guess
  // first left the correct path; it is shown expanded for REVEAL_MS then folds.
  update(root, revealId) {
    this._root = root;
    if (revealId && !this.expanded.has(revealId)) {
      this.reveal = revealId;
      if (this.revealTimer) clearTimeout(this.revealTimer);
      this.revealTimer = setTimeout(() => {
        this.revealTimer = null;
        this.reveal = null;
        if (this._root) this._render();
      }, REVEAL_MS);
    }
    this._render();
  }

  _togglePill(id) {
    // A click always pins the branch's state, cancelling any pending auto-fold.
    if (this.revealTimer && this.reveal === id) { clearTimeout(this.revealTimer); this.revealTimer = null; }
    if (this.reveal === id) this.reveal = null;
    if (this.expanded.has(id)) this.expanded.delete(id);
    else this.expanded.add(id);
    this._render();
  }

  _render() {
    const { root, pills } = this._collapse(this._root);
    const { nodes, cols } = this._layout(root);
    const extraRight = pills.length ? PILL_GAP + PILL_W : 0;
    this._drawStatic(cols, extraRight);

    const targets = new Map();
    const parentOf = new Map();
    for (const n of nodes) {
      targets.set(n.id, { x: n.x, y: n.y });
      parentOf.set(n.id, n.parentId);
      this._ensureNode(n);
    }
    // Prune anything no longer visible (collapsed branches, stale nodes).
    for (const id of [...this.nodeEls.keys()]) {
      if (!targets.has(id)) { this.nodeEls.get(id).g.remove(); this.nodeEls.delete(id); this.prevPos.delete(id); }
    }
    for (const id of [...this.edgeEls.keys()]) {
      if (!targets.has(id)) { this.edgeEls.get(id).remove(); this.edgeEls.delete(id); }
    }

    this._drawPills(pills, nodes, cols);
    this._scrollToFocus(this._focus(nodes));

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

  // Draw the collapsed wrong branches as clusters of clickable pills in a zone to
  // the right of the tree, each connected back to its divergence point.
  _drawPills(pills, nodes, cols) {
    this.gPills.replaceChildren();
    if (!pills.length) return;
    const pos = new Map(nodes.map((n) => [n.id, { x: n.x, y: n.y }]));
    const pillX = ML + cols * COL + PILL_GAP;
    for (const cl of pills) {
      const parent = pos.get(cl.parentId);
      if (!parent) continue;
      const cy = MT + cl.childRankIndex * ROW;
      const rows = Math.max(1, Math.ceil(cl.items.length / 2));
      const h = 26 + rows * 30;

      const link = el('path', { class: 'pill-link', d: this._edgePath(parent.x, parent.y, pillX + 4, cy) });
      this.gPills.append(link);

      const fo = el('foreignObject', { x: pillX, y: cy - h / 2, width: PILL_W, height: h });
      const wrap = document.createElementNS(XHTML, 'div');
      wrap.setAttribute('class', 'pill-cluster');
      const head = document.createElementNS(XHTML, 'span');
      head.setAttribute('class', 'pill-rank');
      head.textContent = `${RANK_LABELS[RANKS[cl.childRankIndex]] || ''} · not on path`;
      wrap.append(head);
      for (const it of cl.items) {
        const b = document.createElementNS(XHTML, 'button');
        b.setAttribute('type', 'button');
        b.setAttribute('class', `pill${it.open ? ' open' : ''}`);
        b.setAttribute('title', it.open ? `Collapse ${it.name}` : `Expand ${it.name}`);
        const italic = it.rank === 'genus' || it.rank === 'species';
        b.innerHTML = `<span class="pill-dot"></span><span class="pill-name${italic ? ' italic' : ''}"></span>`;
        b.querySelector('.pill-name').textContent = it.name;
        b.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); this._togglePill(it.id); });
        wrap.append(b);
      }
      fo.append(wrap);
      this.gPills.append(fo);
    }
  }

  reset() {
    this.gNodes.replaceChildren();
    this.gEdges.replaceChildren();
    this.gPills.replaceChildren();
    this.nodeEls.clear();
    this.edgeEls.clear();
    this.prevPos.clear();
    this.expanded.clear();
    this.reveal = null;
    if (this.revealTimer) { clearTimeout(this.revealTimer); this.revealTimer = null; }
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}
