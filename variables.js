// ===== STATE =====
let currentLesson = 0;
const totalLessons = 6;
let correctAnswers = 0;
const quizAnswered = {};

// ===== NAVIGATION =====
function goToLesson(index) {
    // Hide current
    document.querySelectorAll('.lesson').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));

    // Show target
    document.getElementById('lesson-' + index).classList.add('active');
    document.querySelector('[data-lesson="' + index + '"]').classList.add('active');
    currentLesson = index;

    // Update progress bar
    const pct = Math.round(((index + 1) / totalLessons) * 100);
    document.getElementById('progressBar').style.width = pct + '%';

    // Scroll to lessons area (smooth)
    document.getElementById('lessons').scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Update score display if we're on lesson 5
    if (index === 5) updateScore();
}

// ===== BOX TOGGLE ANIMATION =====
function toggleBox() {
    document.getElementById('animBox').classList.toggle('open');
}

// ===== COPY CODE =====
function copyCode(btn) {
    const code = btn.previousElementSibling.textContent;
    // Strip HTML tags introduced by span syntax
    const plain = code.replace(/<[^>]*>/g, '');
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
    if (quizAnswered[quizId]) return; // Already answered
    quizAnswered[quizId] = true;

    const feedback = document.getElementById(quizId + '-feedback');
    const allBtns = btn.closest('.quiz-options').querySelectorAll('.quiz-btn');

    // Disable all buttons
    allBtns.forEach(b => b.disabled = true);

    if (result === 'correct') {
        btn.classList.add('correct');
        feedback.textContent = '🎉 Correct! Great job!';
        feedback.className = 'quiz-feedback ok';
        correctAnswers++;
    } else {
        btn.classList.add('wrong');
        feedback.textContent = '❌ Not quite! The correct answer is highlighted.';
        feedback.className = 'quiz-feedback err';
        // Highlight correct answer
        allBtns.forEach(b => {
            if (b.getAttribute('onclick').includes("'correct'")) {
                b.classList.add('correct');
            }
        });
    }
}

// ===== PLAYGROUND =====
function updatePlayground() {
    const varName = document.getElementById('pg-var-name').value.trim();
    const valType = document.getElementById('pg-val-type').value;
    const value = document.getElementById('pg-value').value.trim();

    const codeEl = document.getElementById('pg-code');
    const statusEl = document.getElementById('pg-status');

    if (!varName) {
        codeEl.innerHTML = '<code>...</code>';
        statusEl.textContent = '';
        return;
    }

    // Validate variable name
    const nameValid = isValidVarName(varName);

    let valueDisplay = value || '<your_value>';

    // Format value display based on type
    if (valType === 'str') {
        const v = value || 'hello';
        valueDisplay = `<span class="str">"${v}"</span>`;
    } else if (valType === 'int') {
        const v = value || '0';
        valueDisplay = `<span class="num">${v}</span>`;
    } else if (valType === 'float') {
        const v = value || '0.0';
        valueDisplay = `<span class="num">${v}</span>`;
    } else if (valType === 'bool') {
        valueDisplay = `<span class="kw">True</span>`;
        document.getElementById('pg-value').value = 'True';
        document.getElementById('pg-value-row').style.display = 'none';
    }

    if (valType !== 'bool') {
        document.getElementById('pg-value-row').style.display = '';
    }

    const nameColor = nameValid ? 'var-name' : 'comment';
    const codeHTML = `<code><span class="${nameColor}">${escHtml(varName)}</span> <span class="op">=</span> ${valueDisplay}
<span class="kw">print</span>(<span class="${nameColor}">${escHtml(varName)}</span>)</code>`;

    codeEl.innerHTML = codeHTML;

    if (nameValid) {
        statusEl.textContent = '✅ Valid variable name!';
        statusEl.className = 'pg-status ok';
    } else {
        statusEl.textContent = '❌ Invalid variable name — see Naming Rules';
        statusEl.className = 'pg-status err';
    }
}

function runPlayground() {
    const varName = document.getElementById('pg-var-name').value.trim();
    const valType = document.getElementById('pg-val-type').value;
    const value = document.getElementById('pg-value').value.trim();
    const resultEl = document.getElementById('pg-result');

    if (!varName) {
        resultEl.textContent = '⚠️ Please enter a variable name first!';
        resultEl.className = 'pg-result err';
        return;
    }

    if (!isValidVarName(varName)) {
        resultEl.textContent = '❌ Your variable name is not valid. Check the naming rules!';
        resultEl.className = 'pg-result err';
        return;
    }

    // Simulate output
    let output = value;
    if (valType === 'str') output = value || 'hello';
    else if (valType === 'int') output = isNaN(Number(value)) ? '0' : value;
    else if (valType === 'float') output = isNaN(parseFloat(value)) ? '0.0' : value;
    else if (valType === 'bool') output = 'True';

    const typeLabel = { str: 'str', int: 'int', float: 'float', bool: 'bool' }[valType];

    resultEl.innerHTML = `✅ <strong>Output:</strong> ${escHtml(output)} &nbsp;|&nbsp; <code>type(${escHtml(varName)})</code> → <code>&lt;class '${typeLabel}'&gt;</code>`;
    resultEl.className = 'pg-result ok';
}

// ===== HELPERS =====
function isValidVarName(name) {
    if (!name) return false;
    const PYTHON_KEYWORDS = [
        'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break',
        'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally',
        'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal',
        'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
        'print', 'input', 'type', 'len', 'range', 'list', 'dict', 'set', 'tuple'
    ];
    if (PYTHON_KEYWORDS.includes(name)) return false;
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

function escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ===== SCORE =====
function updateScore() {
    const scoreEl = document.getElementById('score-correct');
    const msgEl = document.getElementById('score-msg');
    const starsEl = document.getElementById('stars');

    scoreEl.textContent = correctAnswers;

    const msgs = [
        'Keep going — you can do it! 💪',
        'Nice start! Keep learning! 📚',
        'Halfway there! Great work! 🌟',
        'Almost perfect! Amazing! 🚀',
        'Perfect Score! You\'re a Python Pro! 🏆'
    ];

    const starCounts = [1, 1, 2, 3, 3];
    const starColors = ['⭐', '⭐', '⭐⭐', '⭐⭐⭐', '🌟🌟🌟'];

    const idx = Math.min(correctAnswers, 4);
    msgEl.textContent = msgs[idx];
    starsEl.textContent = starColors[idx];
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    // Set progress bar to first lesson
    document.getElementById('progressBar').style.width = Math.round((1 / totalLessons) * 100) + '%';
});
