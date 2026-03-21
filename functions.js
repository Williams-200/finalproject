// ============================================================
// FUNCTIONS.JS  —  Navigation, argument builder, converter,
//                  lambda playground, function builder, quizzes
// ============================================================

// ===== STATE =====
let currentLesson = 0;
const totalLessons = 7;
let correctAnswers = 0;
const quizAnswered = {};

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

  // Init lesson-specific widgets on first open
  if (index === 2) runArgBuilder();
  if (index === 3) runConverter();
  if (index === 4) initLambdaPlay();
  if (index === 6) { loadTemplate(); updateScore(); }
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

// ===== ARGUMENT PLAYGROUND =====
function runArgBuilder() {
  const name    = escHtml(document.getElementById('ab-name').value    || 'Student');
  const grade   = escHtml(document.getElementById('ab-grade').value   || '8');
  const subject = escHtml(document.getElementById('ab-subject').value  || 'Math');

  const codeEl   = document.getElementById('ab-code');
  const resultEl = document.getElementById('ab-result');

  codeEl.innerHTML =
    `<code><span style="color:#c084fc">def</span> <span style="color:#60a5fa">describe_student</span>` +
    `(<span style="color:#34d399">name</span>, <span style="color:#34d399">grade</span>, <span style="color:#34d399">subject</span>):\n` +
    `    <span style="color:#c084fc">print</span>(name, <span style="color:#86efac">"is in grade"</span>, grade)\n` +
    `    <span style="color:#c084fc">print</span>(<span style="color:#86efac">"Favourite subject:"</span>, subject)\n\n` +
    `<span style="color:#60a5fa">describe_student</span>(<span style="color:#86efac">"${name}"</span>, <span style="color:#fdba74">${grade}</span>, <span style="color:#86efac">"${subject}"</span>)</code>`;

  resultEl.innerHTML =
    `${name} is in grade ${grade}<br>Favourite subject: ${subject}`;
}

// ===== TEMPERATURE CONVERTER =====
function runConverter() {
  const input  = document.getElementById('celsius-input');
  const result = document.getElementById('conv-result');
  const codeEl = document.getElementById('conv-code');
  if (!input || !result) return;

  const c = parseFloat(input.value);
  if (isNaN(c)) { result.textContent = '—'; return; }
  const f = Math.round(((c * 9 / 5) + 32) * 10) / 10;
  result.textContent = f;
  if (codeEl) codeEl.textContent = `celsius_to_fahrenheit(${c})  →  (${c} × 9/5) + 32 = ${f}`;
}

// ===== LAMBDA PLAYGROUND =====
const lambdaFuncs = {
  double: { label: 'double: x * 2',  inputs: ['x'], fn: (v) => v[0] * 2 },
  square: { label: 'square: x ** 2', inputs: ['x'], fn: (v) => Math.pow(v[0], 2) },
  add:    { label: 'add: x + y',     inputs: ['x','y'], fn: (v) => v[0] + v[1] },
  area:   { label: 'area: w * h',    inputs: ['w','h'], fn: (v) => v[0] * v[1] },
};

function initLambdaPlay() {
  const sel = document.getElementById('lp-func');
  if (!sel) return;
  buildLambdaInputs(sel.value);
}

function runLambdaPlay() {
  const sel = document.getElementById('lp-func');
  if (!sel) return;
  buildLambdaInputs(sel.value);
}

function buildLambdaInputs(key) {
  const fn       = lambdaFuncs[key];
  const container= document.getElementById('lp-inputs');
  if (!fn || !container) return;

  container.innerHTML = fn.inputs.map((p, i) =>
    `<div class="lp-input-group">
      <label>${p}</label>
      <input type="number" value="${i === 0 ? 5 : 3}" id="lp-in-${i}" oninput="calcLambda('${key}')" />
    </div>`
  ).join('');

  calcLambda(key);
}

function calcLambda(key) {
  const fn     = lambdaFuncs[key];
  const result = document.getElementById('lp-result');
  if (!fn || !result) return;

  const values = fn.inputs.map((_, i) => {
    const el = document.getElementById('lp-in-' + i);
    return el ? parseFloat(el.value) : 0;
  });

  if (values.some(isNaN)) { result.textContent = '—'; return; }

  const output = fn.fn(values);
  const params = fn.inputs.join(', ');
  const args   = values.join(', ');

  result.innerHTML =
    `<span style="color:#c084fc">lambda</span> ${params}: <em>expression</em>` +
    `&nbsp;&nbsp;→&nbsp;&nbsp;` +
    `λ(${args}) = <strong style="color:#f97316;font-size:1.2em">${output}</strong>`;
}

// ===== FUNCTION BUILDER =====
const templates = {
  greet: {
    inputs: [{ id: 'fb-inp-name', label: 'Name', type: 'text', default: 'Alice' }],
    build: (name, vals) => {
      const n = escHtml(vals['fb-inp-name'] || 'Alice');
      return {
        code: `def ${name}(name):\n    print("Hello,", name)\n    print("Welcome to Python! 🐍")\n\n${name}("${n}")`,
        run: [`Hello, ${n}`, `Welcome to Python! 🐍`],
      };
    }
  },
  add: {
    inputs: [
      { id: 'fb-inp-a', label: 'Number A', type: 'number', default: '12' },
      { id: 'fb-inp-b', label: 'Number B', type: 'number', default: '8' },
    ],
    build: (name, vals) => {
      const a = parseFloat(vals['fb-inp-a']) || 0;
      const b = parseFloat(vals['fb-inp-b']) || 0;
      return {
        code: `def ${name}(x, y):\n    return x + y\n\nresult = ${name}(${a}, ${b})\nprint("Answer:", result)`,
        run: [`Answer: ${a + b}`],
      };
    }
  },
  area: {
    inputs: [
      { id: 'fb-inp-w', label: 'Width',  type: 'number', default: '6' },
      { id: 'fb-inp-h', label: 'Height', type: 'number', default: '4' },
    ],
    build: (name, vals) => {
      const w = parseFloat(vals['fb-inp-w']) || 0;
      const h = parseFloat(vals['fb-inp-h']) || 0;
      return {
        code: `def ${name}(width, height):\n    return width * height\n\narea = ${name}(${w}, ${h})\nprint("Area:", area, "square units")`,
        run: [`Area: ${w * h} square units`],
      };
    }
  },
  grade: {
    inputs: [{ id: 'fb-inp-score', label: 'Score (0–100)', type: 'number', default: '85' }],
    build: (name, vals) => {
      const s = Math.min(100, Math.max(0, parseFloat(vals['fb-inp-score']) || 0));
      let g = s >= 90 ? 'A' : s >= 80 ? 'B' : s >= 70 ? 'C' : s >= 60 ? 'D' : 'F';
      return {
        code: `def ${name}(score):\n    if score >= 90:\n        return "A"\n    elif score >= 80:\n        return "B"\n    elif score >= 70:\n        return "C"\n    elif score >= 60:\n        return "D"\n    else:\n        return "F"\n\ngrade = ${name}(${s})\nprint("Grade:", grade)`,
        run: [`Grade: ${g}`],
      };
    }
  },
  power: {
    inputs: [
      { id: 'fb-inp-base', label: 'Base',     type: 'number', default: '3' },
      { id: 'fb-inp-exp',  label: 'Exponent', type: 'number', default: '4' },
    ],
    build: (name, vals) => {
      const base = parseFloat(vals['fb-inp-base']) || 0;
      const exp  = parseFloat(vals['fb-inp-exp'])  || 0;
      return {
        code: `def ${name}(base, exponent):\n    return base ** exponent\n\nresult = ${name}(${base}, ${exp})\nprint(f"${base} to the power ${exp} = {result}")`,
        run: [`${base} to the power ${exp} = ${Math.pow(base, exp)}`],
      };
    }
  },
};

function loadTemplate() {
  const tplKey  = document.getElementById('fb-template').value;
  const tpl     = templates[tplKey];
  const inputs  = document.getElementById('pg-inputs');
  const codeEl  = document.getElementById('fb-code');
  const outEl   = document.getElementById('fb-output');
  if (!tpl || !inputs) return;

  inputs.innerHTML = tpl.inputs.map(inp =>
    `<div class="pg-input-group">
      <label>${inp.label}:</label>
      <input type="${inp.type}" id="${inp.id}" value="${inp.default}" oninput="buildFunction()" />
    </div>`
  ).join('');

  buildFunction();
}

function buildFunction() {
  const tplKey = document.getElementById('fb-template').value;
  const tpl    = templates[tplKey];
  const name   = (document.getElementById('fb-name').value || 'my_function').trim().replace(/\s+/g,'_');
  const codeEl = document.getElementById('fb-code');
  const outEl  = document.getElementById('fb-output');
  if (!tpl || !codeEl) return;

  const vals = {};
  tpl.inputs.forEach(inp => {
    const el = document.getElementById(inp.id);
    if (el) vals[inp.id] = el.value;
  });

  const result = tpl.build(name, vals);
  codeEl.innerHTML = `<code>${syntaxHighlight(result.code)}</code>`;
  if (outEl) outEl.innerHTML = '';
  codeEl._result = result.run;
}

function runFunction() {
  const codeEl = document.getElementById('fb-code');
  const outEl  = document.getElementById('fb-output');
  if (!codeEl || !outEl) return;
  const lines = codeEl._result || [];
  outEl.innerHTML = lines.map(l => `<span style="color:#34d399">${escHtml(l)}</span>`).join('<br>');
}

// ===== SYNTAX HIGHLIGHTER (simple) =====
function syntaxHighlight(code) {
  return escHtml(code)
    .replace(/\b(def|return|if|elif|else|print|global|lambda)\b/g,
      '<span style="color:#c084fc;font-weight:700">$1</span>')
    .replace(/"([^"]*)"/g, '<span style="color:#86efac">"$1"</span>')
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#fdba74">$1</span>')
    .replace(/#.*$/gm, match => `<span style="color:#4a4570;font-style:italic">${match}</span>`);
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
    'You\'re on a roll! Keep going! 🌟',
    'More than halfway! Great work! 🚀',
    'Almost perfect! Just 1 more! 💪',
    'Perfect score! Function master! 🏆',
  ];
  const icons = ['', '⭐', '⭐⭐', '🌟🌟', '🌟🌟🌟', '🏆🌟🌟🌟'];

  const idx = Math.min(correctAnswers, 5);
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
  runArgBuilder();
  runConverter();
  initLambdaPlay();
  loadTemplate();
});
