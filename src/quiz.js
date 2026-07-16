// Quiz mode — 20 random multiple-choice questions drawn from the logged lab
// (identifier) data of the current bacteria pool.
//
// Each question asks for one identifier of one organism, e.g.
//   "What is the Gram stain result for Staphylococcus aureus?"
// with answer options drawn from that identifier's possible values (plus, for
// multi-value identifiers, value-sets actually seen across the pool).
//
// The quiz builds from whatever pool is active (bundled or a Supabase list). A
// list may not carry enough logged data to fill 20 questions — the quiz simply
// serves as many as it can, and the view explains when a list is too sparse.

import { IDENTIFIERS, displayValue } from './identifiers.js';

export const QUIZ_SIZE = 20;
const PER_ORG_CAP = 2; // keep variety: at most N questions about one organism (relaxed if the pool is small)

// Natural-language prompt per identifier; a generic template covers the rest.
const PROMPTS = {
  gram: (n) => `What is the Gram stain result for <i>${n}</i>?`,
  shape: (n) => `What is the characteristic cellular shape of <i>${n}</i>?`,
  motility: (n) => `What is the motility of <i>${n}</i>?`,
  spores: (n) => `What is the spore-forming result for <i>${n}</i>?`,
  oxidase: (n) => `What is the oxidase result for <i>${n}</i>?`,
  catalase: (n) => `What is the catalase result for <i>${n}</i>?`,
  coagulase: (n) => `What is the coagulase result for <i>${n}</i>?`,
  aesculin: (n) => `What is the aesculin hydrolysis result for <i>${n}</i>?`,
  pyr: (n) => `What is the PYR / PYZ result for <i>${n}</i>?`,
  indole: (n) => `What is the indole result for <i>${n}</i>?`,
  methylRed: (n) => `What is the methyl red result for <i>${n}</i>?`,
  vp: (n) => `What is the Voges-Proskauer result for <i>${n}</i>?`,
  citrate: (n) => `What is the citrate utilisation result for <i>${n}</i>?`,
  nitrate: (n) => `What is the nitrate reduction result for <i>${n}</i>?`,
  urease: (n) => `What is the urease result for <i>${n}</i>?`,
  fermentation: (n) => `Which sugars does <i>${n}</i> ferment?`,
  of: (n) => `What is the Hugh–Leifson (O/F) result for <i>${n}</i>?`,
  haemolysis: (n) => `What type of haemolysis does <i>${n}</i> show?`,
  atmosphere: (n) => `What are the atmospheric growth requirements of <i>${n}</i>?`,
};
const promptFor = (spec, name) =>
  (PROMPTS[spec.key] || ((n) => `What is the ${spec.label} result for <i>${n}</i>?`))(name);

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const orgKey = (rec) => `${rec.genus} ${rec.species}`.trim();
// Canonical label for a multi-value identifier so a value-set compares/renders
// consistently regardless of the order it was stored in.
const multiLabel = (val) => [...val].sort().join(', ');

export class Quiz {
  constructor(data = []) {
    this.build(data);
  }

  build(data) {
    const withId = data.filter((r) => r.id && Object.keys(r.id).length);

    // Distinct value-sets seen per multi-value identifier, for realistic distractors.
    this._multiPools = {};
    for (const spec of IDENTIFIERS) {
      if (spec.type !== 'multi') continue;
      const set = new Set();
      for (const rec of withId) {
        const v = rec.id[spec.key];
        if (Array.isArray(v) && v.length) set.add(multiLabel(v));
      }
      this._multiPools[spec.key] = [...set];
    }

    // Every scorable (organism, identifier) pair is a candidate question.
    const candidates = [];
    for (const rec of withId) {
      for (const spec of IDENTIFIERS) {
        const v = rec.id[spec.key];
        if (v == null) continue;
        if (spec.type === 'multi' && (!Array.isArray(v) || !v.length)) continue;
        candidates.push({ rec, spec });
      }
    }

    const picked = this._select(candidates, QUIZ_SIZE);
    this.questions = picked.map((c) => this._makeQuestion(c));
    this.total = this.questions.length;
    this.index = 0;
    this.score = 0;
  }

  // Prefer spreading questions across organisms; relax the per-organism cap if
  // that leaves us short of the target count.
  _select(candidates, size) {
    const shuffled = shuffle(candidates);
    const chosen = [];
    const perOrg = new Map();
    for (const c of shuffled) {
      if (chosen.length >= size) break;
      const key = orgKey(c.rec);
      const n = perOrg.get(key) || 0;
      if (n >= PER_ORG_CAP) continue;
      perOrg.set(key, n + 1);
      chosen.push(c);
    }
    if (chosen.length < size) {
      for (const c of shuffled) {
        if (chosen.length >= size) break;
        if (!chosen.includes(c)) chosen.push(c);
      }
    }
    return chosen;
  }

  _makeQuestion({ rec, spec }) {
    const name = orgKey(rec);
    const raw = rec.id[spec.key];
    const correct = spec.type === 'multi' ? multiLabel(raw) : displayValue(raw);
    const options = spec.type === 'multi'
      ? this._multiOptions(spec, correct)
      : this._singleOptions(spec, correct);
    return {
      prompt: promptFor(spec, name),
      name,
      spec,
      options,
      correct,
      chosen: null,      // option string the player picked
      wasCorrect: null,
    };
  }

  _singleOptions(spec, correct) {
    const distractors = shuffle(spec.values.filter((v) => v !== correct)).slice(0, 3);
    return shuffle([correct, ...distractors]);
  }

  _multiOptions(spec, correct) {
    const distractors = shuffle((this._multiPools[spec.key] || []).filter((s) => s !== correct)).slice(0, 3);
    // Top up from single canonical values if the pool didn't offer enough variety.
    if (distractors.length < 3) {
      for (const v of shuffle(spec.values.filter((v) => v !== 'Other'))) {
        if (distractors.length >= 3) break;
        if (v !== correct && !distractors.includes(v)) distractors.push(v);
      }
    }
    return shuffle([correct, ...distractors]);
  }

  current() { return this.questions[this.index] || null; }
  isAnswered() { const q = this.current(); return !!q && q.chosen != null; }
  get done() { return this.index >= this.total; }

  // Record the player's choice for the current question. No-op if already answered.
  answer(option) {
    const q = this.current();
    if (!q || q.chosen != null) return q;
    q.chosen = option;
    q.wasCorrect = option === q.correct;
    if (q.wasCorrect) this.score++;
    return q;
  }

  // Advance to the next question; returns false when the quiz is finished.
  next() {
    if (this.index < this.total) this.index++;
    return !this.done;
  }
}

// ── View ─────────────────────────────────────────────────────────────────────
// Renders one question at a time, then a results summary. Kept separate from the
// Quiz logic, mirroring TreeView / IdGrid.
export class QuizView {
  constructor(root) {
    this.root = root;
    this.quiz = null;
  }

  render(quiz) {
    this.quiz = quiz;
    if (!quiz || !quiz.total) return this._renderEmpty();
    if (quiz.done) return this._renderResults();
    this._renderQuestion();
  }

  reset() { this.root.replaceChildren(); }

  _renderEmpty() {
    this.root.replaceChildren();
    const box = document.createElement('div');
    box.className = 'quiz-card quiz-empty';
    box.innerHTML =
      `<h2>Not enough lab data</h2>` +
      `<p>This pool doesn't carry enough logged identifier results to build a quiz. ` +
      `Try the bundled set or pick another Data source with lab profiles.</p>`;
    this.root.append(box);
  }

  _renderQuestion() {
    const quiz = this.quiz;
    const q = quiz.current();
    this.root.replaceChildren();

    const card = document.createElement('div');
    card.className = 'quiz-card';

    const pct = Math.round((quiz.index / quiz.total) * 100);
    const head = document.createElement('div');
    head.className = 'quiz-head';
    head.innerHTML =
      `<div class="quiz-meta"><span class="quiz-count">Question ${quiz.index + 1} of ${quiz.total}</span>` +
      `<span class="quiz-score">Score: ${quiz.score}</span></div>` +
      `<div class="quiz-bar"><span style="width:${pct}%"></span></div>`;
    card.append(head);

    const prompt = document.createElement('p');
    prompt.className = 'quiz-prompt';
    prompt.innerHTML = q.prompt;
    card.append(prompt);

    if (q.spec.type === 'multi') {
      const hint = document.createElement('p');
      hint.className = 'quiz-hint';
      hint.textContent = 'Multiple results may be combined into one answer.';
      card.append(hint);
    }

    const opts = document.createElement('div');
    opts.className = 'quiz-options';
    q.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => this._choose(opt));
      opts.append(btn);
    });
    card.append(opts);

    const foot = document.createElement('div');
    foot.className = 'quiz-foot';
    foot.innerHTML = `<p class="quiz-feedback" id="quiz-feedback"></p>`;
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'btn primary quiz-next';
    next.textContent = quiz.index + 1 >= quiz.total ? 'See results' : 'Next question';
    next.hidden = true;
    next.addEventListener('click', () => { quiz.next(); this.render(quiz); });
    foot.append(next);
    card.append(foot);

    this.root.append(card);

    // If the player revisits an already-answered question (shouldn't normally
    // happen, but keeps state consistent), re-show its resolved state.
    if (q.chosen != null) this._showResolved(q, next);
  }

  _choose(option) {
    const q = this.quiz.current();
    if (q.chosen != null) return;
    this.quiz.answer(option);
    const next = this.root.querySelector('.quiz-next');
    this._showResolved(q, next);
  }

  _showResolved(q, nextBtn) {
    const buttons = [...this.root.querySelectorAll('.quiz-option')];
    buttons.forEach((btn) => {
      btn.disabled = true;
      if (btn.textContent === q.correct) btn.classList.add('correct');
      if (btn.textContent === q.chosen && !q.wasCorrect) btn.classList.add('wrong');
    });
    const fb = this.root.querySelector('#quiz-feedback');
    if (fb) {
      fb.textContent = q.wasCorrect
        ? 'Correct!'
        : `Not quite — the answer is ${q.correct}.`;
      fb.className = `quiz-feedback ${q.wasCorrect ? 'good' : 'bad'}`;
    }
    if (nextBtn) { nextBtn.hidden = false; nextBtn.focus(); }
  }

  _renderResults() {
    const quiz = this.quiz;
    this.root.replaceChildren();
    const card = document.createElement('div');
    card.className = 'quiz-card quiz-results';

    const pct = quiz.total ? Math.round((quiz.score / quiz.total) * 100) : 0;
    const verdict =
      pct >= 90 ? 'Consultant-grade.' :
      pct >= 70 ? 'Solid bench work.' :
      pct >= 50 ? 'A passable ID — keep reading.' :
      'Back to Bergey’s Manual with you.';

    const head = document.createElement('div');
    head.className = 'quiz-results-head';
    head.innerHTML =
      `<h2>Quiz complete</h2>` +
      `<p class="quiz-final">You scored <b>${quiz.score}</b> / <b>${quiz.total}</b> (${pct}%).</p>` +
      `<p class="quiz-verdict">${verdict}</p>`;
    card.append(head);

    const list = document.createElement('ol');
    list.className = 'quiz-review';
    quiz.questions.forEach((q) => {
      const li = document.createElement('li');
      li.className = 'quiz-review-row ' + (q.wasCorrect ? 'good' : 'bad');
      const yours = q.chosen == null ? '—' : q.chosen;
      li.innerHTML =
        `<span class="qr-mark">${q.wasCorrect ? '✓' : '✗'}</span>` +
        `<span class="qr-body"><span class="qr-prompt">${q.prompt}</span>` +
        `<span class="qr-ans">Answer: <b>${q.correct}</b>` +
        (q.wasCorrect ? '' : ` · you chose <i>${yours}</i>`) + `</span></span>`;
      list.append(li);
    });
    card.append(list);
    this.root.append(card);
  }
}
