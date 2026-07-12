// Identifier grid renderer.
//
// Shows every phenotypic identifier as a cell coloured by match state:
//   green  = confirmed match (locked; shows the target's true value)
//   orange = partial match (variable overlap, or some shared items)
//   red    = no match (shows what the latest guess had)
//   grey   = not yet tested / not scorable
// Locked (green) cells never change again; every other cell always mirrors the
// most recent guess, so the grid reads as "confirmed answers + last guess".
//
// Cells flow in one dense, wrapping grid (positional wrapping) to pack tightly
// regardless of how many identifiers each group has; a thin coloured edge keeps
// the groups visually distinct without spending a whole row on a header.

import { IDENTIFIERS, displayValue } from './identifiers.js';

export class IdGrid {
  constructor(root) {
    this.root = root;
    this.cells = new Map();
    this.prev = new Map();
    this._build();
  }

  _build() {
    this.root.replaceChildren();
    const grid = document.createElement('div');
    grid.className = 'id-grid';
    for (const spec of IDENTIFIERS) {
      const cell = document.createElement('div');
      cell.className = 'idcell state-empty';
      cell.dataset.key = spec.key;
      cell.dataset.group = spec.group;
      cell.innerHTML =
        `<div class="idcell-label">${spec.label}</div>` +
        `<div class="idcell-value">—</div>` +
        `<div class="idcell-lock" aria-hidden="true">🔒</div>`;
      grid.append(cell);
      this.cells.set(spec.key, { cell, value: cell.querySelector('.idcell-value') });
    }
    this.root.append(grid);
  }

  reset() {
    this.prev.clear();
    for (const spec of IDENTIFIERS) {
      const c = this.cells.get(spec.key);
      c.cell.className = 'idcell state-empty';
      c.value.textContent = '—';
    }
  }

  // rows: game.gridRows(); currentGuessId animates only the cells this guess touched.
  update(rows, currentGuessId) {
    for (const row of rows) {
      const c = this.cells.get(row.spec.key);
      if (!c) continue;
      const isEmpty = row.state === 'empty';
      c.cell.className = `idcell state-${row.state}${row.locked ? ' locked' : ''}`;
      c.value.textContent = isEmpty ? '—' : displayValue(row.value);
      c.cell.title = row.locked
        ? `${row.spec.label}: ${displayValue(row.value)} (confirmed)`
        : isEmpty
          ? `${row.spec.label}: not yet tested`
          : `${row.spec.label}: your last guess had ${displayValue(row.value)}`;

      const changed = this.prev.get(row.spec.key) !== `${row.state}:${displayValue(row.value)}`;
      if (changed && row.guessId === currentGuessId && !isEmpty) {
        c.cell.classList.remove('flip');
        void c.cell.offsetWidth; // restart animation
        c.cell.classList.add('flip');
      }
      this.prev.set(row.spec.key, `${row.state}:${displayValue(row.value)}`);
    }
  }
}
