// Base de données locale de 20 questions
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

// Configuration
const EMOJIS = ["🦁", "🦊", "🐯", "🦅", "🐼", "🐸", "🦄", "🐺", "🦉", "🚀"];
const ACCESS_CODES = { moderator: "admin123", editor: "edit123", player: "" };

let currentRole = "player";
let currentQuestionIndex = 0;
let timerInterval = null;
let timeLeft = 15;
let myScore = 0;
let myEmoji = "";
let myNickname = "زائر";
let playersList = [];

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  loadConfig();
});

function updatePasscodeLabel() {
  const role = document.getElementById('role-select').value;
  const nameInput = document.getElementById('player-nickname');
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

  document.body.classList.remove('is-mod', 'is-player');
  if (role === 'moderator') document.body.classList.add('is-mod');
  if (role === 'player') document.body.classList.add('is-player');

  document.getElementById('login-modal').classList.add('hidden');

  if (role === 'editor') {
    openEditorSpace();
  } else {
    document.getElementById('live-space').classList.remove('hidden');
    addChatMessage("نظام", `${myEmoji} انضم ${myNickname} إلى البث!`);
  }
}

function loadConfig() {
  const title = localStorage.getItem('cfg_title') || "مسابقة مقهى الثقافة";
  const logo = localStorage.getItem('cfg_logo') || "logo.png";
  const quote = localStorage.getItem('cfg_quote') || "فنجان قهوة ومعرفة ☕";
  const welcome = localStorage.getItem('cfg_welcome') || "أهلاً بكم في المسابقة التفاعلية!";

  document.getElementById('display-title').innerText = title;
  document.getElementById('display-logo').src = logo;
  document.getElementById('display-quote').innerText = quote;
  document.getElementById('display-welcome').innerText = welcome;
}

function openEditorSpace() {
  document.getElementById('editor-space').classList.remove('hidden');
  const container = document.getElementById('editor-questions-list');
  container.innerHTML = "";

  defaultQuestions.forEach((q, idx) => {
    container.innerHTML += `
      <div style="border:1px solid #000; padding:8px; margin-bottom:8px; border-radius:6px;">
        <strong>س${idx+1}:</strong> <input type="text" value="${q.question}" id="eq-${idx}">
      </div>
    `;
  });
}

function saveEditorSettings() {
  localStorage.setItem('cfg_title', document.getElementById('cfg-title').value);
  localStorage.setItem('cfg_logo', document.getElementById('cfg-logo').value);
  localStorage.setItem('cfg_quote', document.getElementById('cfg-quote').value);
  localStorage.setItem('cfg_welcome', document.getElementById('cfg-welcome').value);
  alert("💾 تم حفظ الإعدادات بنجاح!");
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

  if (currentQuestionIndex >= defaultQuestions.length) {
    endGame();
    return;
  }

  const q = defaultQuestions[currentQuestionIndex];
  document.getElementById('q-num').innerText = currentQuestionIndex + 1;
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
    myScore += timeLeft; // Bonus de rapidité
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
  const allBtns = document.querySelectorAll('.option-btn');
  if (allBtns[correctIdx]) allBtns[correctIdx].classList.add('correct');

  const revealBox = document.getElementById('answer-reveal');
  document.getElementById('correct-answer-text').innerText = defaultQuestions[currentQuestionIndex].options[correctIdx];
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

  // Simulation classement joueurs
  playersList = [
    { name: myNickname, emoji: myEmoji, score: myScore },
    { name: "أميرة", emoji: "🦊", score: Math.floor(Math.random()*150) },
    { name: "كريم", emoji: "🦅", score: Math.floor(Math.random()*150) },
    { name: "ياسين", emoji: "🦁", score: Math.floor(Math.random()*150) },
    { name: "سارة", emoji: "🐼", score: Math.floor(Math.random()*100) }
  ].sort((a, b) => b.score - a.score);

  // Remplissage Podium
  for (let i = 1; i <= 4; i++) {
    const p = playersList[i-1] || { name: "---", emoji: "👤", score: 0 };
    document.getElementById(`pod${i}-name`).innerText = p.name;
    document.getElementById(`pod${i}-emoji`).innerText = p.emoji;
    document.getElementById(`pod${i}-score`).innerText = p.score + " ن";
  }

  // Classement général
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = "";
  playersList.forEach((p, idx) => {
    list.innerHTML += `<li><span>#${idx+1} ${p.emoji} ${p.name}</span><strong>${p.score} ن</strong></li>`;
  });
}

function resetEntireGame() {
  location.reload();
}

function logout() {
  location.reload();
}