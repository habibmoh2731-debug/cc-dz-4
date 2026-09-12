const socket = io();
let totalScore = 0;
let aRepondu = false;

function rejoindrePartie() {
  const pseudo = document.getElementById('pseudoInput').value.trim();
  const code = document.getElementById('codeInput').value.trim();
  if (!pseudo || !code) return alert("Remplis tous les champs !");
  socket.emit('joinRoom', { pseudo, code });
}

socket.on('joinedSuccess', () => {
  document.getElementById('loginBlock').classList.add('hidden');
  document.getElementById('gameBlock').classList.remove('hidden');
  document.getElementById('emojiBar').classList.remove('hidden');
});

socket.on('erreur', (msg) => alert(msg));

socket.on('nouvelleQuestion', (q) => {
  aRepondu = false;
  document.getElementById('answerRevealBlock').classList.add('hidden');
  document.getElementById('podiumBlock').classList.add('hidden');
  document.getElementById('gameBlock').classList.remove('hidden');

  for (let i = 0; i < 4; i++) {
    const btn = document.getElementById(`opt${i}Btn`);
    btn.disabled = false;
    btn.className = "option-btn bg-white border-2 border-black p-3 rounded-xl font-bold text-sm text-left";
  }

  document.getElementById('questionNum').innerText = `Question ${q.id} / ${q.totalQuestions}`;
  document.getElementById('questionText').innerText = q.question;
  document.getElementById('opt0').innerText = q.propositions[0] || '---';
  document.getElementById('opt1').innerText = q.propositions[1] || '---';
  document.getElementById('opt2').innerText = q.propositions[2] || '---';
  document.getElementById('opt3').innerText = q.propositions[3] || '---';
});

function envoyerReponse(index) {
  if (aRepondu) return;
  aRepondu = true;
  for (let i = 0; i < 4; i++) document.getElementById(`opt${i}Btn`).disabled = true;
  socket.emit('submitReponse', { reponseIndex: index });
}

socket.on('reponseResultat', (res) => {
  if (res && res.correct) {
    totalScore += Number(res.points) || 0;
    document.getElementById('userScore').innerText = `${totalScore} pts`;
  }
});

socket.on('revelerReponse', (data) => {
  const correctBtn = document.getElementById(`opt${data.reponseCorrecte}Btn`);
  if (correctBtn) {
    correctBtn.className = "option-btn bg-emerald-400 border-2 border-black p-3 rounded-xl font-black text-sm text-left text-black";
  }
  document.getElementById('correctAnswerText').innerText = data.texteReponse;
  document.getElementById('answerRevealBlock').classList.remove('hidden');
});

// ÉCRAN FIN DE PARTIE & PODIUM TOP 4
socket.on('finDePartie', ({ top4, classementComplet }) => {
  document.getElementById('gameBlock').classList.add('hidden');
  document.getElementById('podiumBlock').classList.remove('hidden');

  // Génération du Top 4 visuel
  const container = document.getElementById('top4Container');
  container.innerHTML = '';

  const ordresPodium = [1, 0, 2, 3]; // Affichage visuel : 2ème, 1er, 3ème, 4ème
  const hauteurs = ['h-28', 'h-36', 'h-20', 'h-14'];
  const couleurs = ['bg-amber-300', 'bg-yellow-400', 'bg-amber-600', 'bg-stone-300'];
  const medailles = ['🥇', '🥈', '🥉', '4️⃣'];

  ordresPodium.forEach((posIndex) => {
    const p = top4[posIndex];
    const div = document.createElement('div');
    div.className = `flex flex-col justify-end items-center ${hauteurs[posIndex]} ${couleurs[posIndex]} border-2 border-black rounded-t-xl p-1 w-full text-center`;
    
    if (p) {
      div.innerHTML = `
        <span class="text-xs font-black">${medailles[posIndex]}</span>
        <span class="text-[10px] font-bold truncate w-full">${p.pseudo}</span>
        <span class="text-[9px] font-black">${p.score}p</span>
      `;
    } else {
      div.innerHTML = `<span class="text-[10px] font-bold text-gray-500">---</span>`;
    }
    container.appendChild(div);
  });

  // Génération de la liste complète
  const list = document.getElementById('leaderboardList');
  list.innerHTML = '';
  classementComplet.forEach((p, idx) => {
    list.innerHTML += `
      <li class="flex justify-between items-center border-b pb-0.5">
        <span class="font-bold">#${idx + 1} ${p.pseudo}</span>
        <span class="font-black text-amber-700">${p.score} pts</span>
      </li>
    `;
  });
});

socket.on('quizReset', () => {
  totalScore = 0;
  aRepondu = false;
  document.getElementById('userScore').innerText = `0 pts`;
  document.getElementById('questionNum').innerText = "En attente...";
  document.getElementById('questionText').innerText = "Le modérateur va relancer !";
  document.getElementById('podiumBlock').classList.add('hidden');
  document.getElementById('gameBlock').classList.remove('hidden');
});

function envoyerEmoji(emoji) { socket.emit('sendEmoji', emoji); }

socket.on('newEmoji', ({ emoji }) => {
  const el = document.createElement('div');
  el.innerText = emoji;
  el.className = 'emoji-volant';
  el.style.left = Math.random() * 70 + 15 + '%';
  el.style.bottom = '80px';
  document.querySelector('.max-w-sm').appendChild(el);
  setTimeout(() => el.remove(), 2000);
});