let defaultQuestions = [
  { question: "ما هي عاصمة الجزائر؟", options: ["وهران", "الجزائر العاصمة", "قسنطينة", "عنابة"], answer: 1 },
  { question: "كم عدد ولايات الجزائر؟", options: ["48", "58", "50", "60"], answer: 1 },
  { question: "ما هو أطول نهر في العالم؟", options: ["الأمازون", "النيل", "المسيسيبي", "الراين"], answer: 1 },
  { question: "ما هي أطول سلسلة جبال في العالم؟", options: ["الهيمالايا", "الأنديز", "الألب", "الأطلس"], answer: 1 },
  { question: "ما هي أكبر دولة مساحة في العالم؟", options: ["كندا", "الصين", "روسيا", "أمريكا"], answer: 2 },
  { question: "ما هو أسرع حيوان بري؟", options: ["الفهد", "الأسد", "النمر", "الظبي"], answer: 0 },
  { question: "أكبر محيط في العالم؟", options: ["الأطلسي", "الهادئ", "الهندي", "المتجمد"], answer: 1 },
  { question: "من فاتح الأندلس؟", options: ["عقبة بن نافع", "طارق بن زياد", "خالد بن الوليد", "صلاح الدين"], answer: 1 },
  { question: "أصلد عنصر طبيعي على الأرض؟", options: ["الحديد", "الذهب", "الألماس", "الفولاذ"], answer: 2 },
  { question: "رمز العنصر الكيميائي للماء؟", options: ["O2", "H2O", "CO2", "NaCl"], answer: 1 },
  { question: "ما هو كوكب الأحمر؟", options: ["الزهرة", "المشتري", "المريخ", "زحل"], answer: 2 },
  { question: "كم عدد قارات العالم؟", options: ["5", "6", "7", "8"], answer: 2 },
  { question: "أكبر حيوان على وجه الأرض؟", options: ["الفيل", "الحوت الأزرق", "القرش الأبيض", "الزرافة"], answer: 1 },
  { question: "ماهي العملة الرسمية في الجزائر؟", options: ["الدرهم", "الدينار", "الريال", "الجنيه"], answer: 1 },
  { question: "كم دقيقة في الساعة؟", options: ["50", "60", "100", "90"], answer: 1 },
  { question: "ما هي أكبر قارة في العالم؟", options: ["إفريقيا", "آسيا", "أوروبا", "أمريكا الشمالية"], answer: 1 },
  { question: "ما هو اللوح الشمس الذي ينير الأرض؟", options: ["القمر", "الشمس", "النجم", "المريخ"], answer: 1 },
  { question: "في أي قارة تقع الجزائر؟", options: ["آسيا", "إفريقيا", "أوروبا", "أستراليا"], answer: 1 },
  { question: "كم عدد أضلاع المثلث؟", options: ["3", "4", "5", "6"], answer: 0 },
  { question: "ما هو الصوت العلمي للأسد؟", options: ["صهيل", "زئير", "مواء", "نهيق"], answer: 1 }
];

const EMOJIS = ["🦁", "🦊", "🐯", "🦅", "🐼", "🐸", "🦄", "🐺", "🦉", "🚀"];
const ACCESS_CODES = { moderator: "admin123", editor: "edit123", player: "" };

let currentRole = "player";
let currentQuestionIndex = 0;
let timerInterval = null;
let timeLeft = 15;
let myScore = 0;
let myEmoji = "";
let myNickname = "زائر";
let questionsData = JSON.parse(localStorage.getItem('custom_questions')) || defaultQuestions;

document.addEventListener('DOMContentLoaded', () => {
  loadConfig();
});

function updatePasscodeLabel() {
  const role = document.getElementById('role-select').value;
  const nameInput = document.getElementById('player-nickname');
  const codeInput = document.getElementById('access-code');

  codeInput.style.display = (role === 'player') ? 'none' : 'block';
  nameInput.style.display = (role === 'player') ? 'block' : 'none';
}

function authenticateUser() {
  const role = document.getElementById('role-select').value;
  const code = document.getElementById('access-code').value;
  const name = document.getElementById('player-nickname').value.trim();

  if (role !== 'player' && code !== ACCESS_CODES[role]) {
    alert("❌ رمز الدخول غير صحيح!");
    return;
  }

  currentRole = role;
  myNickname = name || (role === 'player' ? "لاعب_" + Math.floor(Math.random()*100) : role);
  myEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

  document.getElementById('login-modal').classList.add('hidden');

  if (role === 'editor') {
    openEditorSpace();
  } else {
    document.getElementById('live-space').classList.remove('hidden');
    addChatMessage("نظام", `${myEmoji} انضم ${myNickname} إلى البث!`);
  }
}

function loadConfig() {
  document.getElementById('display-title').innerText = localStorage.getItem('cfg_title') || "مسابقة مقهى الثقافة";
  document.getElementById('display-logo').src = localStorage.getItem('cfg_logo') || "logo.png";
  document.getElementById('display-quote').innerText = localStorage.getItem('cfg_quote') || "فنجان قهوة ومعرفة ☕";
  document.getElementById('display-welcome').innerText = localStorage.getItem('cfg_welcome') || "أهلاً بكم في المسابقة التفاعلية!";
}

function openEditorSpace() {
  document.getElementById('editor-space').classList.remove('hidden');
  renderEditorQuestions();
}

function renderEditorQuestions() {
  const container = document.getElementById('editor-questions-list');
  container.innerHTML = "";

  questionsData.forEach((q, idx) => {
    const qCard = document.createElement('div');
    qCard.style.cssText = "border:2px solid #000; padding:12px; margin-bottom:12px; border-radius:8px; background:#f9fafb;";
    
    let optionsHTML = "";
    q.options.forEach((opt, optIdx) => {
      const isChecked = (q.answer === optIdx) ? "checked" : "";
      optionsHTML += `
        <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
          <input type="radio" name="correct-${idx}" value="${optIdx}" ${isChecked} style="width:auto; margin:0;">
          <input type="text" class="opt-input-${idx}" value="${opt}" placeholder="الخيار ${optIdx+1}" style="margin:0;">
        </div>
      `;
    });

    qCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <strong>السؤال ${idx + 1}</strong>
        <button onclick="removeQuestion(${idx})" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">حذف 🗑️</button>
      </div>
      <input type="text" id="q-text-${idx}" value="${q.question}" placeholder="نص السؤال..." style="margin-bottom:8px;">
      <label style="font-size:0.85rem; font-weight:bold;">الخيارات (حدد الإجابة الصحيحة):</label>
      ${optionsHTML}
    `;

    container.appendChild(qCard);
  });
}

function addNewQuestionField() {
  questionsData.push({ question: "سؤال جديد", options: ["خيار 1", "خيار 2", "خيار 3", "خيار 4"], answer: 0 });
  renderEditorQuestions();
}

function removeQuestion(index) {
  if (confirm("هل أنت تأكد من حذف هذا السؤال؟")) {
    questionsData.splice(index, 1);
    renderEditorQuestions();
  }
}

function saveEditorSettings() {
  localStorage.setItem('cfg_title', document.getElementById('cfg-title').value);
  localStorage.setItem('cfg_logo', document.getElementById('cfg-logo').value);
  localStorage.setItem('cfg_quote', document.getElementById('cfg-quote').value);
  localStorage.setItem('cfg_welcome', document.getElementById('cfg-welcome').value);
  localStorage.setItem('cfg_timer', document.getElementById('cfg-timer').value);

  const updatedQuestions = [];
  questionsData.forEach((_, idx) => {
    const qText = document.getElementById(`q-text-${idx}`).value;
    const optionInputs = document.querySelectorAll(`.opt-input-${idx}`);
    const selectedAnswer = document.querySelector(`input[name="correct-${idx}"]:checked`);
    const options = [];
    optionInputs.forEach(input => options.push(input.value));

    updatedQuestions.push({
      question: qText,
      options: options,
      answer: selectedAnswer ? parseInt(selectedAnswer.value) : 0
    });
  });

  localStorage.setItem('custom_questions', JSON.stringify(updatedQuestions));
  alert("💾 تم حفظ جميع الأسئلة والإعدادات بنجاح!");
  location.reload();
}

function startGame() {
  document.getElementById('welcome-card').classList.add('hidden');
  document.getElementById('quiz-area').classList.remove('hidden');
  currentQuestionIndex = 0;
  myScore = 0;
  showQuestion();
}

function showQuestion() {
  clearInterval(timerInterval);
  document.getElementById('answer-reveal').classList.add('hidden');

  const activeQuestions = JSON.parse(localStorage.getItem('custom_questions')) || defaultQuestions;

  if (currentQuestionIndex >= activeQuestions.length) {
    endGame();
    return;
  }

  const q = activeQuestions[currentQuestionIndex];
  document.getElementById('q-num').innerText = `${currentQuestionIndex + 1} / ${activeQuestions.length}`;
  document.getElementById('question-text').innerText = q.question;

  const grid = document.getElementById('options-grid');
  grid.innerHTML = "";

  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = "option-btn";
    btn.innerText = opt;
    btn.onclick = () => handleAnswer(idx, q.answer, btn);
    grid.appendChild(btn);
  });

  startTimer(q.answer);
}

function startTimer(correctIdx) {
  const timerConfig = parseInt(localStorage.getItem('cfg_timer')) || 15;
  timeLeft = timerConfig;
  document.getElementById('timer').innerText = timeLeft;

  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').innerText = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      revealAnswer(correctIdx);
    }
  }, 1000);
}

function handleAnswer(selectedIdx, correctIdx, btn) {
  clearInterval(timerInterval);
  disableOptions();

  if (selectedIdx === correctIdx) {
    btn.classList.add('correct');
    myScore += timeLeft;
    document.getElementById('my-score').innerText = myScore;
  } else {
    btn.classList.add('wrong');
  }

  revealAnswer(correctIdx);
}

function disableOptions() {
  document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
}

function revealAnswer(correctIdx) {
  disableOptions();
  const activeQuestions = JSON.parse(localStorage.getItem('custom_questions')) || defaultQuestions;
  const allBtns = document.querySelectorAll('.option-btn');
  if (allBtns[correctIdx]) allBtns[correctIdx].classList.add('correct');

  const revealBox = document.getElementById('answer-reveal');
  document.getElementById('correct-answer-text').innerText = activeQuestions[currentQuestionIndex].options[correctIdx];
  revealBox.classList.remove('hidden');
}

function nextQuestion() {
  currentQuestionIndex++;
  showQuestion();
}

function sendChatMessage(e) {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  if (input.value.trim() !== "") {
    addChatMessage(myEmoji + " " + myNickname, input.value.trim());
    input.value = "";
  }
}

function addChatMessage(author, msg) {
  const box = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = "chat-msg";
  div.innerHTML = `<strong>${author}:</strong> ${msg}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function endGame() {
  document.getElementById('live-space').classList.add('hidden');
  document.getElementById('results-space').classList.remove('hidden');

  const playersList = [
    { name: myNickname, emoji: myEmoji, score: myScore },
    { name: "أميرة", emoji: "🦊", score: Math.floor(Math.random()*150) },
    { name: "كريم", emoji: "🦅", score: Math.floor(Math.random()*150) },
    { name: "ياسين", emoji: "🦁", score: Math.floor(Math.random()*150) },
    { name: "سارة", emoji: "🐼", score: Math.floor(Math.random()*100) }
  ].sort((a, b) => b.score - a.score);

  for (let i = 1; i <= 4; i++) {
    const p = playersList[i-1] || { name: "---", emoji: "👤", score: 0 };
    document.getElementById(`pod${i}-name`).innerText = p.name;
    document.getElementById(`pod${i}-emoji`).innerText = p.emoji;
    document.getElementById(`pod${i}-score`).innerText = p.score + " ن";
  }

  const list = document.getElementById('leaderboard-list');
  list.innerHTML = "";
  playersList.forEach((p, idx) => {
    list.innerHTML += `<li><span>#${idx+1} ${p.emoji} ${p.name}</span><strong>${p.score} ن</strong></li>`;
  });
}

function resetEntireGame() { location.reload(); }
function logout() { location.reload(); }