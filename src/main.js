import { Game, RANK_LABELS, RANKS } from './game.js';
import { TreeView } from './tree.js';
import { META } from './data.js';

const $ = (sel) => document.querySelector(sel);

const game = new Game();
const tree = new TreeView($('#tree'));

const els = {
  genus: $('#genus-input'),
  species: $('#species-input'),
  genusList: $('#genus-list'),
  speciesList: $('#species-list'),
  form: $('#guess-form'),
  message: $('#message'),
  revealed: $('#revealed'),
  guessCount: $('#guess-count'),
  history: $('#history'),
  submit: $('#submit-btn'),
  giveUp: $('#giveup-btn'),
  newGame: $('#newgame-btn'),
  poolInfo: $('#pool-info'),
  modal: $('#win-modal'),
  modalBody: $('#win-body'),
  modalTitle: $('#win-title'),
  modalClose: $('#win-close'),
  modalNew: $('#win-newgame'),
  help: $('#help-modal'),
  helpOpen: $('#help-btn'),
  helpClose: $('#help-close'),
};

// ── Lightweight accessible combobox ─────────────────────────────────────────
function attachCombobox(input, listEl, getItems, onSelect) {
  let active = -1;
  const close = () => { listEl.hidden = true; listEl.replaceChildren(); active = -1; };
  const open = () => {
    const items = getItems(input.value).slice(0, 40);
    listEl.replaceChildren();
    if (!items.length) return close();
    items.forEach((it, i) => {
      const li = document.createElement('li');
      li.className = 'combo-item';
      li.setAttribute('role', 'option');
      li.innerHTML = `<span class="combo-value">${it.value}</span>` +
        (it.hint ? `<span class="combo-hint">${it.hint}</span>` : '');
      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        input.value = it.value;
        close();
        onSelect && onSelect(it.value);
      });
      li.addEventListener('mousemove', () => setActive(i));
      listEl.append(li);
    });
    listEl.hidden = false;
  };
  const setActive = (i) => {
    const opts = [...listEl.children];
    opts.forEach((o) => o.classList.remove('active'));
    active = i;
    if (opts[i]) { opts[i].classList.add('active'); opts[i].scrollIntoView({ block: 'nearest' }); }
  };
  input.addEventListener('input', open);
  input.addEventListener('focus', open);
  input.addEventListener('blur', () => setTimeout(close, 120));
  input.addEventListener('keydown', (e) => {
    if (listEl.hidden && (e.key === 'ArrowDown')) return open();
    const opts = [...listEl.children];
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(active + 1, opts.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(active - 1, 0)); }
    else if (e.key === 'Enter' && active >= 0 && opts[active]) {
      e.preventDefault();
      input.value = opts[active].querySelector('.combo-value').textContent;
      close();
      onSelect && onSelect(input.value);
    } else if (e.key === 'Escape') close();
  });
  return { close };
}

const genusItems = (q) => {
  const s = q.trim().toLowerCase();
  const starts = [], contains = [];
  for (const g of game.genera) {
    const lg = g.toLowerCase();
    if (lg.startsWith(s)) starts.push(g);
    else if (s && lg.includes(s)) contains.push(g);
  }
  return [...starts, ...contains].map((g) => {
    const recs = game.speciesFor(g);
    return { value: g, hint: `${recs.length} sp · ${recs[0]?.family || ''}` };
  });
};

const speciesItems = (q) => {
  const recs = game.speciesFor(els.genus.value);
  const s = q.trim().toLowerCase();
  return recs
    .filter((r) => !s || r.species.toLowerCase().includes(s))
    .map((r) => ({ value: r.species, hint: r.notes }));
};

attachCombobox(els.genus, els.genusList, genusItems, () => {
  els.species.value = '';
  els.species.focus();
});
attachCombobox(els.species, els.speciesList, speciesItems);

// ── Rendering ───────────────────────────────────────────────────────────────
function renderRevealed() {
  els.revealed.replaceChildren();
  const depth = game.confirmedDepth;
  RANKS.forEach((rank, i) => {
    const chip = document.createElement('div');
    const known = i < depth;
    chip.className = `chip ${known ? 'known' : 'unknown'}${rank === 'genus' || rank === 'species' ? ' italic' : ''}`;
    const name = known ? game.targetLineage[i] : '?';
    chip.innerHTML = `<span class="chip-rank">${RANK_LABELS[rank]}</span><span class="chip-name">${name}</span>`;
    els.revealed.append(chip);
  });
}

function renderHistory() {
  els.history.replaceChildren();
  [...game.guesses].reverse().forEach((g) => {
    const row = document.createElement('li');
    row.className = 'history-row' + (g.win ? ' win' : '');
    const deepest = g.common > 0 ? RANK_LABELS[RANKS[g.common - 1]] : 'none';
    row.innerHTML =
      `<span class="h-num">${g.id}</span>` +
      `<span class="h-name"><i>${g.genus}</i> ${g.species || ''}</span>` +
      `<span class="h-match">${g.win ? 'correct!' : `↳ ${deepest}`}</span>`;
    els.history.append(row);
  });
}

function render() {
  tree.update(game.buildTree());
  renderRevealed();
  renderHistory();
  els.guessCount.textContent = game.guesses.length;
}

function setMessage(text, kind = '') {
  els.message.textContent = text;
  els.message.className = `message ${kind}`;
}

// ── Actions ─────────────────────────────────────────────────────────────────
function handleGuess(e) {
  e && e.preventDefault();
  if (game.won) return;
  const res = game.submitGuess(els.genus.value, els.species.value);
  if (!res) return;
  if (res.error) return setMessage(res.error, 'error');

  render();
  els.genus.value = '';
  els.species.value = '';
  els.genus.focus();

  if (res.win) return finishWin();

  const matched = res.matchedRank ? RANK_LABELS[res.matchedRank] : null;
  if (matched && res.matchedRank !== 'kingdom') {
    setMessage(`✓ ${matched} confirmed: ${game.targetLineage[RANKS.indexOf(res.matchedRank)]}. The dendrogram advanced!`, 'good');
  } else {
    setMessage(`Only the Kingdom lines up so far — that lineage branches away above Phylum. Try another genus.`, 'warn');
  }
}

function finishWin() {
  const t = game.target;
  els.modalTitle.textContent = 'Solved!';
  const lineage = RANKS.map((r, i) =>
    `<div class="win-rank"><span>${RANK_LABELS[r]}</span><b class="${r === 'genus' || r === 'species' ? 'italic' : ''}">${game.targetLineage[i]}</b></div>`,
  ).join('');
  els.modalBody.innerHTML =
    `<p class="win-lead">You identified <b class="italic">${t.genus} ${t.species}</b> in ` +
    `<b>${game.guesses.length}</b> guess${game.guesses.length === 1 ? '' : 'es'}.</p>` +
    (t.notes ? `<p class="win-notes">${t.notes}</p>` : '') +
    `<div class="win-lineage">${lineage}</div>`;
  openModal(els.modal);
  els.submit.disabled = true;
  setMessage(`Solved in ${game.guesses.length} guesses!`, 'good');
}

function giveUp() {
  if (game.won) return;
  game.won = true;
  game.confirmedDepth = RANKS.length;
  render();
  els.modalTitle.textContent = 'The answer';
  const t = game.target;
  const lineage = RANKS.map((r, i) =>
    `<div class="win-rank"><span>${RANK_LABELS[r]}</span><b class="${r === 'genus' || r === 'species' ? 'italic' : ''}">${game.targetLineage[i]}</b></div>`,
  ).join('');
  els.modalBody.innerHTML =
    `<p class="win-lead">It was <b class="italic">${t.genus} ${t.species}</b>.</p>` +
    (t.notes ? `<p class="win-notes">${t.notes}</p>` : '') +
    `<div class="win-lineage">${lineage}</div>`;
  openModal(els.modal);
  els.submit.disabled = true;
}

function newGame() {
  game.newGame();
  tree.reset();
  els.submit.disabled = false;
  els.genus.value = '';
  els.species.value = '';
  closeModal(els.modal);
  render();
  setMessage('New bacterium chosen. Kingdom is Bacteria — guess a genus and species.', '');
  els.genus.focus();
}

// ── Modals ──────────────────────────────────────────────────────────────────
function openModal(m) { m.hidden = false; requestAnimationFrame(() => m.classList.add('open')); }
function closeModal(m) { m.classList.remove('open'); setTimeout(() => (m.hidden = true), 220); }

els.form.addEventListener('submit', handleGuess);
els.giveUp.addEventListener('click', giveUp);
els.newGame.addEventListener('click', newGame);
els.modalNew.addEventListener('click', newGame);
els.modalClose.addEventListener('click', () => closeModal(els.modal));
els.helpOpen.addEventListener('click', () => openModal(els.help));
els.helpClose.addEventListener('click', () => closeModal(els.help));
[els.modal, els.help].forEach((m) =>
  m.addEventListener('click', (e) => { if (e.target === m) closeModal(m); }),
);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeModal(els.modal); closeModal(els.help); }
});

// ── Boot ────────────────────────────────────────────────────────────────────
els.poolInfo.textContent = `${META.count} pathogens · ${META.genera} genera · ${META.phyla} phyla`;
render();
setMessage('Kingdom is Bacteria. Guess a genus and species to grow the tree toward the answer.', '');
