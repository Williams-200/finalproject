// ============================================================
// LOOPS.JS  —  Navigation, loop visualiser, range explorer,
//              nested grid, for/while builders, quiz, score
// ============================================================

// ===== STATE =====
let currentLesson = 0;
const totalLessons = 8;
let correctAnswers = 0;
const quizAnswered = {};

// Loop visualiser state
let vizTimer = null;
let vizStep  = -1;
const vizItems = ['🍎 apple', '🍌 banana', '🍒 cherry', '🥭 mango'];

// ===== NAVIGATION =====
function goToLesson(index) {
  document.querySelectorAll('.lesson').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));

  const target = document.getElementById('lesson-' + index);
  const pill   = document.querySelector('[data-lesson="' + index + '"]');
  if (target) target.classList.add('active');
  if (pill) {
    pill.classList.add('active');
    pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  currentLesson = index;
  const pct = Math.round(((index + 1) / totalLessons) * 100);
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('lessons').scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Init lesson-specific widgets
  if (index === 2) { runRangeExplorer(); }
  if (index === 4) { buildNestedGrid(); }
  if (index === 7) { updateForLoop(); runWhileLoop(); updateScore(); }

  // Stop visualiser if leaving lesson 1
  if (index !== 1) stopLoopViz();
}

// ===== COPY CODE =====
function copyCode(btn) {
  const pre = btn.previousElementSibling;
  const plain = pre ? pre.innerText : '';
  navigator.clipboard.writeText(plain).then(() => {
    btn.textContent = '✅ Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '📋 Copy'; btn.classList.remove('copied'); }, 2000);
  });
}

// ===== QUIZ =====
function checkQuiz(quizId, btn, result) {
  if (quizAnswered[quizId]) return;
  quizAnswered[quizId] = true;

  const feedback = document.getElementById(quizId + '-feedback');
  const allBtns  = btn.closest('.quiz-options').querySelectorAll('.quiz-btn');
  allBtns.forEach(b => (b.disabled = true));

  if (result === 'correct') {
    btn.classList.add('correct');
    feedback.textContent = '🎉 Correct! Great job!';
    feedback.className = 'quiz-feedback ok';
    correctAnswers++;
  } else {
    btn.classList.add('wrong');
    feedback.textContent = '❌ Not quite — the correct answer is highlighted!';
    feedback.className = 'quiz-feedback err';
    allBtns.forEach(b => {
      if (b.getAttribute('onclick') && b.getAttribute('onclick').includes("'correct'"))
        b.classList.add('correct');
    });
  }
}

// ===== LOOP VISUALISER =====
function startLoopViz() {
  stopLoopViz();
  resetLoopVizUI();
  const btn = document.getElementById('playBtn');
  if (btn) btn.disabled = true;

  const items = document.querySelectorAll('.lv-item');
  const output = document.getElementById('lv-output');
  let step = 0;

  output.textContent = '⏳ Running loop…';

  vizTimer = setInterval(() => {
    if (step > 0) items[step - 1].classList.replace('active', 'done');
    if (step < items.length) {
      items[step].classList.add('active');
      output.textContent = `🔄 Printing: "${vizItems[step]}"`;
      step++;
    } else {
      output.textContent = '✅ Loop finished! All items printed.';
      clearInterval(vizTimer);
      if (btn) btn.disabled = false;
    }
  }, 900);
}

function stopLoopViz() {
  if (vizTimer) { clearInterval(vizTimer); vizTimer = null; }
}

function resetLoopViz() {
  stopLoopViz();
  resetLoopVizUI();
  const playBtn = document.getElementById('playBtn');
  if (playBtn) playBtn.disabled = false;
  const output = document.getElementById('lv-output');
  if (output) output.textContent = '▶ Press Play to start the loop!';
}

function resetLoopVizUI() {
  document.querySelectorAll('.lv-item').forEach(el => {
    el.classList.remove('active', 'done');
  });
}

// ===== RANGE EXPLORER =====
function runRangeExplorer() {
  const startEl = document.getElementById('re-start');
  const stopEl  = document.getElementById('re-stop');
  const stepEl  = document.getElementById('re-step');
  const output  = document.getElementById('re-output');
  const codeEl  = document.getElementById('re-code');
  if (!startEl || !stopEl || !stepEl) return;

  const start = parseInt(startEl.value) || 0;
  const stop  = parseInt(stopEl.value)  || 5;
  const step  = Math.max(1, parseInt(stepEl.value) || 1);

  const nums = [];
  for (let i = start; i < stop; i += step) {
    nums.push(i);
    if (nums.length > 50) { nums.push('…'); break; } // safety cap
  }

  output.innerHTML = nums.map(n =>
    `<span class="re-num">${n}</span>`
  ).join('');

  const args = (start === 0 && step === 1)
    ? stop
    : (step === 1)
      ? `${start}, ${stop}`
      : `${start}, ${stop}, ${step}`;

  codeEl.textContent = `range(${args})  →  ${nums.length} number${nums.length !== 1 ? 's' : ''}`;
}

// ===== NESTED GRID =====
function buildNestedGrid() {
  const rowsEl = document.getElementById('n-rows');
  const colsEl = document.getElementById('n-cols');
  const grid   = document.getElementById('nested-grid');
  const codeEl = document.getElementById('nested-code');
  if (!rowsEl || !colsEl || !grid) return;

  const rows = Math.min(6, Math.max(1, parseInt(rowsEl.value) || 3));
  const cols = Math.min(8, Math.max(1, parseInt(colsEl.value) || 4));

  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.innerHTML = '';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.className = 'nested-cell';
      cell.textContent = `(${r},${c})`;
      grid.appendChild(cell);
    }
  }

  if (codeEl) {
    codeEl.innerHTML =
`<code><span style="color:#c084fc">for</span> <span style="color:#7dd3fc">row</span> <span style="color:#c084fc">in</span> <span style="color:#c084fc">range</span>(<span style="color:#fdba74">${rows}</span>):
    <span style="color:#c084fc">for</span> <span style="color:#7dd3fc">col</span> <span style="color:#c084fc">in</span> <span style="color:#c084fc">range</span>(<span style="color:#fdba74">${cols}</span>):
        <span style="color:#c084fc">print</span>(row, col)
<span style="color:#475569"># Total iterations: ${rows} × ${cols} = ${rows * cols}</span></code>`;
  }
}

// ===== FOR LOOP BUILDER =====
function updateForLoop() {
  const typeEl  = document.getElementById('loop-type');
  const codeEl  = document.getElementById('fl-code');
  const outEl   = document.getElementById('fl-output');
  if (!typeEl || !codeEl || !outEl) return;

  const type = typeEl.value;

  // Show / hide option panels
  document.getElementById('loop-list-opts').style.display   = type === 'list'   ? '' : 'none';
  document.getElementById('loop-range-opts').style.display  = type === 'range'  ? '' : 'none';
  document.getElementById('loop-string-opts').style.display = type === 'string' ? '' : 'none';

  let items = [];
  let codeStr = '';

  if (type === 'list') {
    const raw = (document.getElementById('loop-items').value || 'cat, dog, fish');
    items = raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 20);
    codeStr =
      `<code><span class="var-name">items</span> <span class="op">=</span> [${items.map(i => `<span class="str">"${escHtml(i)}"</span>`).join(', ')}]\n\n` +
      `<span class="kw">for</span> <span class="var-name">item</span> <span class="kw">in</span> <span class="var-name">items</span><span class="colon">:</span>\n` +
      `    <span class="kw">print</span>(<span class="var-name">item</span>)</code>`;
  } else if (type === 'range') {
    const start = parseInt(document.getElementById('fl-start').value) || 0;
    const stop  = parseInt(document.getElementById('fl-stop').value)  || 5;
    const step  = Math.max(1, parseInt(document.getElementById('fl-step').value) || 1);
    for (let i = start; i < stop; i += step) {
      items.push(i);
      if (items.length > 30) { items.push('…'); break; }
    }
    const args = (start === 0 && step === 1) ? stop : (step === 1) ? `${start}, ${stop}` : `${start}, ${stop}, ${step}`;
    codeStr =
      `<code><span class="kw">for</span> <span class="var-name">i</span> <span class="kw">in</span> <span class="kw">range</span>(<span class="num">${args}</span>)<span class="colon">:</span>\n` +
      `    <span class="kw">print</span>(<span class="var-name">i</span>)</code>`;
  } else {
    const str = (document.getElementById('loop-string').value || 'Python').slice(0, 20);
    items = str.split('');
    codeStr =
      `<code><span class="kw">for</span> <span class="var-name">letter</span> <span class="kw">in</span> <span class="str">"${escHtml(str)}"</span><span class="colon">:</span>\n` +
      `    <span class="kw">print</span>(<span class="var-name">letter</span>)</code>`;
  }

  codeEl.innerHTML = codeStr;
  outEl.innerHTML  = items.slice(0, 30).map(item =>
    `<span class="out-line">${escHtml(String(item))}</span>`
  ).join('');
}

// ===== WHILE LOOP SIMULATOR =====
function runWhileLoop() {
  const startEl = document.getElementById('wl-start');
  const limitEl = document.getElementById('wl-limit');
  const stepEl  = document.getElementById('wl-step');
  const codeEl  = document.getElementById('wl-code');
  const outEl   = document.getElementById('wl-output');
  if (!startEl || !limitEl || !stepEl || !codeEl || !outEl) return;

  const start = parseInt(startEl.value) || 1;
  const limit = parseInt(limitEl.value) || 5;
  const step  = Math.max(1, parseInt(stepEl.value) || 1);

  codeEl.innerHTML =
    `<code><span class="var-name">count</span> <span class="op">=</span> <span class="num">${start}</span>\n\n` +
    `<span class="kw">while</span> <span class="var-name">count</span> <span class="op">&lt;=</span> <span class="num">${limit}</span><span class="colon">:</span>\n` +
    `    <span class="kw">print</span>(<span class="var-name">count</span>)\n` +
    `    <span class="var-name">count</span> <span class="op">+=</span> <span class="num">${step}</span></code>`;

  const values = [];
  let v = start;
  while (v <= limit) {
    values.push(v);
    v += step;
    if (values.length > 50) { values.push('… (too many)'); break; }
  }

  if (values.length === 0) {
    outEl.innerHTML = `<span class="out-warn">⚠️ Loop doesn't run (start > limit)</span>`;
  } else {
    outEl.innerHTML = values.map(n => `<span class="out-line">${escHtml(String(n))}</span>`).join('');
  }
}

// ===== SCORE =====
function updateScore() {
  const scoreEl = document.getElementById('score-correct');
  const msgEl   = document.getElementById('score-msg');
  const starsEl = document.getElementById('stars');
  if (!scoreEl) return;

  scoreEl.textContent = correctAnswers;

  const msgs = [
    'Start the quizzes to earn stars! 🌟',
    'Nice start! Keep learning! 📚',
    'You\'re getting it! Great work! 🌟',
    'Halfway! You\'re doing great! 🚀',
    'Almost there! Keep going! 💪',
    'One more quiz to go! 🔥',
    'Perfect score! Loop master! 🏆',
  ];
  const icons = ['', '⭐', '⭐⭐', '⭐⭐', '🌟🌟', '🌟🌟🌟', '🏆🌟🌟🌟'];

  const idx = Math.min(correctAnswers, 6);
  msgEl.textContent = msgs[idx];
  starsEl.textContent = icons[idx];
}

// ===== HELPERS =====
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('progressBar').style.width =
    Math.round((1 / totalLessons) * 100) + '%';
  runRangeExplorer();
  buildNestedGrid();
  updateForLoop();
  runWhileLoop();
});
