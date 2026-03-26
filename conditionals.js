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
  if (pill)   pill.classList.add('active');

  // Scroll active pill into view on the horizontal scroller
  if (pill) {
    pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  currentLesson = index;

  const pct = Math.round(((index + 1) / totalLessons) * 100);
  document.getElementById('progressBar').style.width = pct + '%';

  document.getElementById('lessons').scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (index === 6) {
    updateScore();
    runGradeCalc();
    runBuilder();
  }
}

// ===== COPY CODE =====
function copyCode(btn) {
  const pre = btn.previousElementSibling;
  const plain = pre ? pre.innerText : '';
  navigator.clipboard.writeText(plain).then(() => {
    btn.textContent = '✅ Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '📋 Copy';
      btn.classList.remove('copied');
    }, 2000);
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
    feedback.textContent = '❌ Not quite — the correct answer is highlighted.';
    feedback.className = 'quiz-feedback err';
    allBtns.forEach(b => {
      if (b.getAttribute('onclick') && b.getAttribute('onclick').includes("'correct'")) {
        b.classList.add('correct');
      }
    });
  }
}

// ===== OPERATOR DEMO =====
function runOpDemo() {
  const a = parseFloat(document.getElementById('op-a').value);
  const b = parseFloat(document.getElementById('op-b').value);
  const container = document.getElementById('op-results');

  if (isNaN(a) || isNaN(b)) { container.innerHTML = ''; return; }

  const ops = [
    { sym: '==', label: 'equals',              res: a === b },
    { sym: '!=', label: 'not equals',           res: a !== b },
    { sym: '>',  label: 'greater than',         res: a > b },
    { sym: '<',  label: 'less than',            res: a < b },
    { sym: '>=', label: 'greater or equal',     res: a >= b },
    { sym: '<=', label: 'less or equal',        res: a <= b },
  ];

  container.innerHTML = ops.map(op => `
    <div class="op-tag">
      <span>${a}</span>
      <span class="op-sym">${escHtml(op.sym)}</span>
      <span>${b}</span>
      <span>=</span>
      <span class="${op.res ? 'res-t' : 'res-f'}">${op.res ? 'True' : 'False'}</span>
    </div>`).join('');
}

// ===== GRADE CALCULATOR =====
function runGradeCalc() {
  const raw   = document.getElementById('pg-score');
  if (!raw) return;
  const score = Math.min(100, Math.max(0, parseFloat(raw.value) || 0));

  const badgeEl = document.getElementById('grade-badge');
  const msgEl   = document.getElementById('grade-msg');
  const codeEl  = document.getElementById('pg-code');

  let grade, msg, color;

  if (score >= 90) {
    grade = 'A'; msg = '🌟 Excellent work! You\'re a star!';       color = '#3ecf8e';
  } else if (score >= 80) {
    grade = 'B'; msg = '😊 Great job! Keep it up!';                color = '#6eb5ff';
  } else if (score >= 70) {
    grade = 'C'; msg = '👍 Good effort! A little more practice!';   color = '#f9a834';
  } else if (score >= 60) {
    grade = 'D'; msg = '😬 You passed, but study a bit more!';      color = '#f97316';
  } else {
    grade = 'F'; msg = '📚 Don\'t give up — review the material!';  color = '#f04e4e';
  }

  badgeEl.textContent = grade;
  badgeEl.style.background = `linear-gradient(135deg, ${color}, #f9a834)`;
  badgeEl.style.webkitBackgroundClip = 'text';
  badgeEl.style.webkitTextFillColor = 'transparent';
  msgEl.textContent = msg;

  codeEl.innerHTML =
`<code><span class="var-name">score</span> <span class="op">=</span> <span class="num">${score}</span>

<span class="kw">if</span> <span class="var-name">score</span> <span class="op">&gt;=</span> <span class="num">90</span><span class="colon">:</span>
    <span class="kw">print</span>(<span class="str">"Grade: A"</span>)${score >= 90 ? '   <span class="comment">← runs!</span>' : ''}
<span class="kw">elif</span> <span class="var-name">score</span> <span class="op">&gt;=</span> <span class="num">80</span><span class="colon">:</span>
    <span class="kw">print</span>(<span class="str">"Grade: B"</span>)${score >= 80 && score < 90 ? '   <span class="comment">← runs!</span>' : ''}
<span class="kw">elif</span> <span class="var-name">score</span> <span class="op">&gt;=</span> <span class="num">70</span><span class="colon">:</span>
    <span class="kw">print</span>(<span class="str">"Grade: C"</span>)${score >= 70 && score < 80 ? '   <span class="comment">← runs!</span>' : ''}
<span class="kw">elif</span> <span class="var-name">score</span> <span class="op">&gt;=</span> <span class="num">60</span><span class="colon">:</span>
    <span class="kw">print</span>(<span class="str">"Grade: D"</span>)${score >= 60 && score < 70 ? '   <span class="comment">← runs!</span>' : ''}
<span class="kw">else</span><span class="colon">:</span>
    <span class="kw">print</span>(<span class="str">"Grade: F"</span>)${score < 60 ? '   <span class="comment">← runs!</span>' : ''}</code>`;
}

// ===== CONDITION BUILDER =====
function runBuilder() {
  const aEl  = document.getElementById('bd-a');
  const bEl  = document.getElementById('bd-b');
  const opEl = document.getElementById('bd-op');
  const res  = document.getElementById('builder-result');
  if (!aEl || !bEl || !opEl || !res) return;

  const a  = parseFloat(aEl.value);
  const b  = parseFloat(bEl.value);
  const op = opEl.value;

  if (isNaN(a) || isNaN(b)) { res.textContent = ''; res.className = 'builder-result'; return; }

  let result;
  switch (op) {
    case '==': result = a === b; break;
    case '!=': result = a !== b; break;
    case '>':  result = a > b;   break;
    case '<':  result = a < b;   break;
    case '>=': result = a >= b;  break;
    case '<=': result = a <= b;  break;
    default:   result = false;
  }

  const display = result ? 'True ✅' : 'False ❌';
  res.textContent = `${a} ${op} ${b}  →  ${display}`;
  res.className = `builder-result ${result ? 'true-res' : 'false-res'}`;
}

// ===== SCORE =====
function updateScore() {
  const scoreEl = document.getElementById('score-correct');
  const msgEl   = document.getElementById('score-msg');
  const starsEl = document.getElementById('stars');
  if (!scoreEl) return;

  scoreEl.textContent = correctAnswers;

  const msgs  = [
    'Keep going — complete a quiz! 💪',
    'Nice start! Keep learning! 📚',
    'Getting there! Great work! 🌟',
    'Almost perfect! Superstar! 🚀',
    'Perfect! You\'re a conditionals master! 🏆',
    'Perfect! You\'re a conditionals master! 🏆',
  ];
  const starIcons = ['', '⭐', '⭐⭐', '⭐⭐⭐', '🌟🌟🌟', '🌟🌟🌟'];

  const idx = Math.min(correctAnswers, 5);
  msgEl.textContent = msgs[idx];
  starsEl.textContent = starIcons[idx];
}

// ===== HELPERS =====
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('progressBar').style.width =
    Math.round((1 / totalLessons) * 100) + '%';
  runOpDemo();
  runGradeCalc();
  runBuilder();
});
