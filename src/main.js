import { Game, MODES, RANK_LABELS, RANKS } from './game.js';
import { TreeView } from './tree.js';
import { IdGrid } from './idgrid.js';
import { Quiz, QuizView } from './quiz.js';
import { BACTERIA, META } from './data.js';
import { supabaseConfigured, fetchLists, fetchSupabaseRecords } from './supabase.js';

const $ = (sel) => document.querySelector(sel);

const game = new Game(BACTERIA);
const tree = new TreeView($('#tree'));
const idgrid = new IdGrid($('#idgrid'));
const quizView = new QuizView($('#quiz'));
let lastGuessId = 0;
let bmsMode = false;

const els = {
  genus: $('#genus-input'), species: $('#species-input'),
  genusList: $('#genus-list'), speciesList: $('#species-list'),
  form: $('#guess-form'), message: $('#message'),
  revealed: $('#revealed'), guessCount: $('#guess-count'), history: $('#history'),
  submit: $('#submit-btn'), giveUp: $('#giveup-btn'), newGame: $('#newgame-btn'),
  bms: $('#bms-btn'),
  poolInfo: $('#pool-info'), progress: $('#progress'),
  modeTabs: $('#mode-tabs'), source: $('#source-select'), sourceStatus: $('#source-status'),
  lastGuess: $('#last-guess'),
  modal: $('#win-modal'), modalBody: $('#win-body'), modalTitle: $('#win-title'),
  modalClose: $('#win-close'), modalNew: $('#win-newgame'),
  help: $('#help-modal'), helpOpen: $('#help-btn'), helpClose: $('#help-close'),
  bmsModal: $('#bms-modal'), bmsModalBody: $('#bms-modal-body'), bmsModalClose: $('#bms-modal-close'),
};

const MALDI_LABEL = 'MALDI-TOF';
const LOW_CONF_LABEL = 'No ID, low confidence.';

// ── Combobox ────────────────────────────────────────────────────────────────
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
      li.addEventListener('mousedown', (e) => { e.preventDefault(); input.value = it.value; close(); onSelect && onSelect(it.value); });
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
    if (listEl.hidden && e.key === 'ArrowDown') return open();
    const opts = [...listEl.children];
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(active + 1, opts.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(active - 1, 0)); }
    else if (e.key === 'Enter' && active >= 0 && opts[active]) {
      e.preventDefault();
      input.value = opts[active].querySelector('.combo-value').textContent;
      close(); onSelect && onSelect(input.value);
    } else if (e.key === 'Escape') close();
  });
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
  return recs.filter((r) => !s || r.species.toLowerCase().includes(s)).map((r) => ({ value: r.species, hint: r.notes }));
};

attachCombobox(els.genus, els.genusList, genusItems, () => { els.species.value = ''; els.species.focus(); });
attachCombobox(els.species, els.speciesList, speciesItems);

// ── Rendering ─────────────────────────────────────────────────────────────
function renderRevealed() {
  els.revealed.replaceChildren();
  const depth = game.confirmedDepth;
  RANKS.forEach((rank, i) => {
    const chip = document.createElement('div');
    const known = i < depth;
    chip.className = `chip ${known ? 'known' : 'unknown'}${rank === 'genus' || rank === 'species' ? ' italic' : ''}`;
    chip.innerHTML = `<span class="chip-rank">${RANK_LABELS[rank]}</span><span class="chip-name">${known ? game.targetLineage[i] : '?'}</span>`;
    els.revealed.append(chip);
  });
}
function renderProgress() {
  const { total, green } = game.gridScored();
  els.progress.textContent = total ? `${green} / ${total} identifiers confirmed` : '';
  if (els.lastGuess) {
    const last = game.guesses[game.guesses.length - 1];
    els.lastGuess.innerHTML = last
      ? `showing <i>${last.genus} ${last.species || ''}</i>`
      : '';
  }
}
function renderHistory() {
  els.history.replaceChildren();
  [...game.guesses].reverse().forEach((g) => {
    const row = document.createElement('li');
    row.className = 'history-row' + (g.win ? ' win' : '');
    const deepest = g.common > 0 ? RANK_LABELS[RANKS[g.common - 1]] : 'none';
    row.innerHTML = `<span class="h-num">${g.id}</span>` +
      `<span class="h-name"><i>${g.genus}</i> ${g.species || ''}</span>` +
      `<span class="h-match">${g.win ? 'correct!' : `↳ ${deepest}`}</span>`;
    els.history.append(row);
  });
}
function render(revealId = null) {
  document.body.dataset.mode = game.mode;
  if (game.mode === 'quiz') return; // quiz drives its own view (see startQuiz)
  const cfg = game.cfg();
  if (cfg.tree) tree.update(game.buildTree(), revealId);
  if (cfg.grid) idgrid.update(game.confirmedRows(), game.lastGuessRows());
  renderRevealed();
  renderProgress();
  renderHistory();
  els.guessCount.textContent = game.guesses.length;
}
function setMessage(text, kind = '') { els.message.textContent = text; els.message.className = `message ${kind}`; }

// The tree node id where a guess first left the correct path (matches the id
// scheme in Game.buildTree). Null for a fully-correct/winning guess.
function firstWrongId(guess) {
  const c = guess.common;
  if (c < 1 || c >= RANKS.length) return null;
  return `${RANKS[c]}:${guess.lineage.slice(0, c + 1).join('>')}`;
}

// ── BMS mode ─────────────────────────────────────────────────────────────────
// A toggle that, once you've had your first guess, roasts you for every wrong
// answer — teasing the player for their (evidently lacking) microbiology knowledge.
const BMS_TAUNTS = [
  'Wrong again. Did you sleep through every microbiology lecture?',
  'Still not it. And you call yourself a biomedical scientist?',
  'Nope. A first-year student would have narrowed that down by now.',
  'Incorrect. Have you considered that the textbook is there to be read?',
  'Missed it. The MALDI-TOF is starting to feel like your only friend.',
  'Not even close. Were you revising, or just staring at the agar?',
  'Wrong. That guess would not survive a viva.',
  'Try again — clearly the Gram stain is not the only thing that is unclear here.',
  'Still guessing? Bergey’s Manual is weeping.',
  'Incorrect. Your consultant would like a quiet word.',
  'No. Perhaps identification is not your calling.',
  'Wrong. Even the negative control is embarrassed for you.',
];
function bmsTaunt() {
  return BMS_TAUNTS[Math.floor(Math.random() * BMS_TAUNTS.length)];
}

// In BMS mode the MALDI-TOF reveal is disabled: a real biomedical scientist
// works the bench instead of letting the mass spec do the thinking. Clicking it
// throws up a jeer; closing that leaves the button reading "No ID, low confidence."
const BMS_REVEAL_JEERS = [
  'Reaching for the MALDI-TOF already? A real biomedical scientist works the bench first.',
  'Straight to the mass spec — because reading a Gram stain is apparently too much effort.',
  'Giving up and letting the machine think for you? Bold, for someone this unsure.',
  'The MALDI-TOF confirms an identification; it does not rescue people who never learned the biochemistry.',
  'No. Earn it. The spectrometer is not your comfort blanket.',
];
function resetRevealButton() { els.giveUp.textContent = MALDI_LABEL; }
function setBmsMode(on) {
  bmsMode = on;
  els.bms.classList.toggle('primary', on);
  els.bms.classList.toggle('ghost', !on);
  els.bms.setAttribute('aria-pressed', String(on));
  els.bms.textContent = `BMS mode: ${on ? 'on' : 'off'}`;
  resetRevealButton(); // toggling either way restores a clean MALDI-TOF button
}
function bmsRefuseReveal() {
  els.bmsModalBody.textContent =
    BMS_REVEAL_JEERS[Math.floor(Math.random() * BMS_REVEAL_JEERS.length)];
  openModal(els.bmsModal);
}
function closeBmsModal() {
  closeModal(els.bmsModal);
  els.giveUp.textContent = LOW_CONF_LABEL; // no result, no confidence — sign it off yourself
}

// ── Actions ─────────────────────────────────────────────────────────────────
function handleGuess(e) {
  e && e.preventDefault();
  if (game.won) return;
  const res = game.submitGuess(els.genus.value, els.species.value);
  if (!res) return;
  if (res.error) return setMessage(res.error, 'error');

  lastGuessId = res.guess.id;
  render(firstWrongId(res.guess));
  els.genus.value = ''; els.species.value = ''; els.genus.focus();
  if (res.win) return finishWin();

  const bits = [];
  if (game.cfg().tree) {
    const matched = res.matchedRank;
    bits.push(matched && matched !== 'kingdom'
      ? `✓ ${RANK_LABELS[matched]} confirmed: ${game.targetLineage[RANKS.indexOf(matched)]}.`
      : `Only Kingdom matches so far — that lineage branches away above Phylum.`);
  }
  if (game.cfg().grid && res.idResult) {
    const { green } = game.gridScored();
    bits.push(res.idResult.newlyGreen
      ? `${res.idResult.newlyGreen} new identifier${res.idResult.newlyGreen === 1 ? '' : 's'} locked (${green} total).`
      : `No new identifiers locked this round.`);
  }
  // BMS mode: roast every wrong guess made after the first attempt.
  if (bmsMode && res.guess.id >= 2) {
    return setMessage(`${bmsTaunt()} ${bits.join(' ')}`.trim(), 'bms');
  }
  setMessage(bits.join(' '), res.matchedRank && res.matchedRank !== 'kingdom' ? 'good' : 'warn');
}

function lineageHTML() {
  return RANKS.map((r, i) =>
    `<div class="win-rank"><span>${RANK_LABELS[r]}</span><b class="${r === 'genus' || r === 'species' ? 'italic' : ''}">${game.targetLineage[i]}</b></div>`).join('');
}
function finishWin() {
  const t = game.target;
  els.modalTitle.textContent = 'Solved!';
  els.modalBody.innerHTML =
    `<p class="win-lead">You identified <b class="italic">${t.genus} ${t.species}</b> in <b>${game.guesses.length}</b> guess${game.guesses.length === 1 ? '' : 'es'}.</p>` +
    (t.notes ? `<p class="win-notes">${t.notes}</p>` : '') +
    `<div class="win-lineage">${lineageHTML()}</div>`;
  openModal(els.modal); els.submit.disabled = true;
  setMessage(`Solved in ${game.guesses.length} guesses!`, 'good');
}
function giveUp() {
  if (game.won) return;
  if (bmsMode) return bmsRefuseReveal(); // BMS mode: the reveal is off-limits
  game.reveal();
  render();
  const t = game.target;
  els.modalTitle.textContent = 'The answer';
  els.modalBody.innerHTML =
    `<p class="win-lead">It was <b class="italic">${t.genus} ${t.species}</b>.</p>` +
    (t.notes ? `<p class="win-notes">${t.notes}</p>` : '') +
    `<div class="win-lineage">${lineageHTML()}</div>`;
  openModal(els.modal); els.submit.disabled = true;
}
function newGame() {
  game.newGame();
  lastGuessId = 0;
  tree.reset(); idgrid.reset();
  els.submit.disabled = false;
  els.genus.value = ''; els.species.value = '';
  resetRevealButton();
  closeModal(els.modal);
  refreshView();
}
function modeIntro() {
  if (game.mode === 'identifier') return 'Kingdom is Bacteria. Guess organisms to fill the identifier grid — matched results lock green.';
  if (game.mode === 'combined') return 'Kingdom is Bacteria. Each guess grows the tree and updates the identifier grid.';
  if (game.mode === 'quiz') return 'Answer 20 multiple-choice questions drawn from the logged lab data.';
  return 'Kingdom is Bacteria. Guess a genus and species to grow the tree toward the answer.';
}

// Build a fresh 20-question quiz from the active dataset and render it. The Quiz
// filters to organisms carrying logged identifier data itself.
function startQuiz() {
  quizView.render(new Quiz(game.data));
}

// Refresh whichever surface the current mode owns after a mode / dataset / new-game
// change: the guess-driven modes render normally; quiz mode builds its own view.
function refreshView() {
  if (game.mode === 'quiz') {
    render();
    startQuiz();
    setMessage(modeIntro(), '');
  } else {
    quizView.reset();
    render();
    setMessage(modeIntro(), '');
    els.genus.focus();
  }
}

// ── Mode tabs ────────────────────────────────────────────────────────────────
function buildModeTabs() {
  els.modeTabs.replaceChildren();
  for (const [key, cfg] of Object.entries(MODES)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mode-tab' + (key === game.mode ? ' active' : '');
    b.dataset.mode = key;
    b.textContent = cfg.label;
    b.addEventListener('click', () => {
      if (game.mode === key) return;
      game.setMode(key);
      lastGuessId = 0; tree.reset(); idgrid.reset();
      els.submit.disabled = false; resetRevealButton();
      [...els.modeTabs.children].forEach((c) => c.classList.toggle('active', c.dataset.mode === key));
      updatePoolInfo();
      refreshView();
    });
    els.modeTabs.append(b);
  }
}

// ── Data source ──────────────────────────────────────────────────────────────
let bundled = BACTERIA;
function updatePoolInfo() {
  const pool = game.pool();
  els.poolInfo.textContent = `${pool.length} organisms · ${game.genera.length} genera` +
    (game.needsProfile() ? ' (with lab data)' : '');
}
async function initSource() {
  els.source.replaceChildren();
  const opt = (v, t) => { const o = document.createElement('option'); o.value = v; o.textContent = t; return o; };
  els.source.append(opt('bundled', `Bundled set (${BACTERIA.length})`));

  if (!supabaseConfigured()) {
    els.sourceStatus.textContent = 'Supabase not configured — see src/config.js to load SpeciesDoc lists.';
    els.source.disabled = BACTERIA.length === 0;
    return;
  }
  try {
    els.source.append(opt('sb:*', 'SpeciesDoc: all entries'));
    const lists = await fetchLists();
    lists.forEach((l) => els.source.append(opt(`sb:${l.value}`, `SpeciesDoc — ${l.label} (${l.count})`)));
    els.sourceStatus.textContent = lists.length
      ? `Supabase connected · ${lists.length} list${lists.length === 1 ? '' : 's'}.`
      : 'Supabase connected.';
  } catch (err) {
    els.sourceStatus.textContent = `Supabase error: ${err.message}`;
  }
}
els.source && els.source.addEventListener('change', async () => {
  const val = els.source.value;
  if (val === 'bundled') {
    game.setDataset(bundled);
    els.sourceStatus.textContent = 'Using the bundled set.';
  } else {
    const listValue = val === 'sb:*' ? null : val.slice(3);
    els.sourceStatus.textContent = 'Loading from Supabase…';
    try {
      const recs = await fetchSupabaseRecords(listValue, bundled);
      if (!recs.length) { els.sourceStatus.textContent = 'That list has no usable entries — kept current set.'; return; }
      game.setDataset(recs);
      els.sourceStatus.textContent = `Loaded ${recs.length} organisms from Supabase.`;
    } catch (err) { els.sourceStatus.textContent = `Supabase error: ${err.message}`; return; }
  }
  lastGuessId = 0; tree.reset(); idgrid.reset();
  els.submit.disabled = false; resetRevealButton();
  updatePoolInfo(); refreshView();
});

// ── Modals ──────────────────────────────────────────────────────────────────
function openModal(m) { m.hidden = false; requestAnimationFrame(() => m.classList.add('open')); }
function closeModal(m) { m.classList.remove('open'); setTimeout(() => (m.hidden = true), 220); }

els.form.addEventListener('submit', handleGuess);
els.giveUp.addEventListener('click', giveUp);
els.bms.addEventListener('click', () => setBmsMode(!bmsMode));
els.newGame.addEventListener('click', newGame);
els.modalNew.addEventListener('click', newGame);
els.modalClose.addEventListener('click', () => closeModal(els.modal));
els.helpOpen.addEventListener('click', () => openModal(els.help));
els.helpClose.addEventListener('click', () => closeModal(els.help));
els.bmsModalClose.addEventListener('click', closeBmsModal);
[els.modal, els.help].forEach((m) => m.addEventListener('click', (e) => { if (e.target === m) closeModal(m); }));
els.bmsModal.addEventListener('click', (e) => { if (e.target === els.bmsModal) closeBmsModal(); });
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  closeModal(els.modal); closeModal(els.help);
  if (!els.bmsModal.hidden) closeBmsModal();
});

// ── Boot ────────────────────────────────────────────────────────────────────
buildModeTabs();
updatePoolInfo();
render();
setMessage(modeIntro(), '');
initSource();
