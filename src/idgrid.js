// Identifier grid renderer.
//
// Two grids are shown side-by-side (they stack when the panel is narrow):
//   • Confirmed — identifiers proven to match the target (locked greens); every
//     other cell reads as still unknown.
//   • Last guess — the last guessed organism's full profile, each cell coloured
//     green (exact) / orange (partial) / red (no match) / grey (untested).
// This lets you compare what you *know* against what your latest guess showed.
//
// Cells flow in one dense, wrapping grid per side (positional wrapping) to pack
// tightly; a thin coloured top edge marks each identifier group.

import { IDENTIFIERS, displayValue } from './identifiers.js';

export class IdGrid {
  constructor(root) {
    this.root = root;
    this.confirmed = new Map(); // key -> { cell, value }
    this.guess = new Map();
    this.prevC = new Map();     // key -> "state:value" for flip detection
    this.prevG = new Map();
    this._build();
  }

  _cell(spec, store) {
    const cell = document.createElement('div');
    cell.className = 'idcell state-empty';
    cell.dataset.key = spec.key;
    cell.dataset.group = spec.group;
    cell.innerHTML =
      `<div class="idcell-label">${spec.label}</div>` +
      `<div class="idcell-value">—</div>` +
      `<div class="idcell-lock" aria-hidden="true">🔒</div>`;
    store.set(spec.key, { cell, value: cell.querySelector('.idcell-value') });
    return cell;
  }

  _col(title, sub, store) {
    const col = document.createElement('div');
    col.className = 'idgrid-col';
    const head = document.createElement('div');
    head.className = 'idgrid-col-head';
    head.innerHTML =
      `<span class="idgrid-col-title">${title}</span>` +
      (sub ? `<span class="idgrid-col-sub">${sub}</span>` : '');
    col.append(head);
    const grid = document.createElement('div');
    grid.className = 'id-grid';
    for (const spec of IDENTIFIERS) grid.append(this._cell(spec, store));
    col.append(grid);
    return col;
  }

  _build() {
    this.root.replaceChildren();
    const split = document.createElement('div');
    split.className = 'idgrid-split';
    split.append(
      this._col('Confirmed', 'proven to match', this.confirmed),
      this._col('Last guess', 'your latest organism', this.guess),
    );
    this.root.append(split);
  }

  reset() {
    for (const [store, prev] of [[this.confirmed, this.prevC], [this.guess, this.prevG]]) {
      prev.clear();
      for (const spec of IDENTIFIERS) {
        const c = store.get(spec.key);
        c.cell.className = 'idcell state-empty';
        c.value.textContent = '—';
      }
    }
  }

  _apply(rows, store, prev, side) {
    for (const row of rows) {
      const c = store.get(row.spec.key);
      if (!c) continue;
      const isEmpty = row.state === 'empty';
      c.cell.className = `idcell state-${row.state}${row.locked ? ' locked' : ''}`;
      c.value.textContent = isEmpty ? '—' : displayValue(row.value);
      c.cell.title = row.locked
        ? `${row.spec.label}: ${displayValue(row.value)} (confirmed)`
        : isEmpty
          ? side === 'confirmed'
            ? `${row.spec.label}: not confirmed yet`
            : `${row.spec.label}: your last guess had no value`
          : `${row.spec.label}: ${displayValue(row.value)}`;

      const sig = `${row.state}:${displayValue(row.value)}`;
      if (prev.has(row.spec.key) && prev.get(row.spec.key) !== sig && !isEmpty) {
        c.cell.classList.remove('flip');
        void c.cell.offsetWidth; // restart animation
        c.cell.classList.add('flip');
      }
      prev.set(row.spec.key, sig);
    }
  }

  update(confirmedRows, guessRows) {
    this._apply(confirmedRows, this.confirmed, this.prevC, 'confirmed');
    this._apply(guessRows, this.guess, this.prevG, 'guess');
  }
}
