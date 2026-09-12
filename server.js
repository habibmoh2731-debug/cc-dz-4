const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Stockage dynamique des questions et de l'état du jeu
let questionsDatabase = [
  {
    id: 1,
    question: "Quelle est la capitale de la France ?",
    propositions: ["Lyon", "Marseille", "Paris", "Bordeaux"],
    reponseCorrecte: 2,
    tempsLimiteSec: 15
  }
];

let gameState = {
  roomCode: Math.floor(1000 + Math.random() * 9000).toString(),
  questionIndex: -1,
  joueurs: {},
  timer: null,
  timeLeft: 0
};

// Routes d'accès aux pages HTML
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'joueur.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'moderateur.html')));
app.get('/editeur', (req, res) => res.sendFile(path.join(__dirname, 'public', 'editeur.html')));

// API pour l'éditeur
app.get('/api/questions', (req, res) => res.json(questionsDatabase));
app.post('/api/questions', (req, res) => {
  const newQ = { id: Date.now(), ...req.body };
  questionsDatabase.push(newQ);
  res.json(newQ);
});
app.put('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  questionsDatabase = questionsDatabase.map(q => q.id == id ? { ...q, ...req.body } : q);
  res.json({ success: true });
});
app.delete('/api/questions/:id', (req, res) => {
  questionsDatabase = questionsDatabase.filter(q => q.id != req.params.id);
  res.json({ success: true });
});

// Socket.IO : Gestion de la communication en temps réel
io.on('connection', (socket) => {
  socket.emit('initAdmin', { roomCode: gameState.roomCode });

  // Rejoint la partie (Joueur)
  socket.on('joinGame', ({ pseudo, code }) => {
    if (code !== gameState.roomCode) {
      return socket.emit('joinError', 'Code PIN incorrect !');
    }
    gameState.joueurs[socket.id] = { id: socket.id, pseudo, score: 0, aRepondu: false };
    socket.emit('joinSuccess', { pseudo });
    io.emit('updateJoueursList', Object.values(gameState.joueurs));
  });

  // Chargement d'un pack de questions depuis le modérateur
  socket.on('loadQuestionsPack', (nouvellesQuestions) => {
    if (Array.isArray(nouvellesQuestions) && nouvellesQuestions.length > 0) {
      questionsDatabase = nouvellesQuestions;
      gameState.questionIndex = -1;
      io.emit('updateJoueursList', Object.values(gameState.joueurs));
    }
  });

  // Lancement de la question suivante
  socket.on('nextQuestion', () => {
    clearInterval(gameState.timer);
    gameState.questionIndex++;

    if (gameState.questionIndex >= questionsDatabase.length) {
      io.emit('finDePartie', Object.values(gameState.joueurs));
      return;
    }

    const currentQ = questionsDatabase[gameState.questionIndex];
    gameState.timeLeft = currentQ.tempsLimiteSec || 15;

    // Réinitialise l'état de réponse des joueurs
    Object.keys(gameState.joueurs).forEach(id => {
      gameState.joueurs[id].aRepondu = false;
    });

    io.emit('nouvelleQuestion', {
      id: gameState.questionIndex + 1,
      totalQuestions: questionsDatabase.length,
      question: currentQ.question,
      propositions: currentQ.propositions,
      tempsLimiteSec: gameState.timeLeft
    });

    // Chronomètre
    gameState.timer = setInterval(() => {
      gameState.timeLeft--;
      io.emit('tickTimer', gameState.timeLeft);

      if (gameState.timeLeft <= 0) {
        clearInterval(gameState.timer);
        io.emit('revelerReponse', { reponseCorrecte: currentQ.reponseCorrecte });
        io.emit('updateJoueursList', Object.values(gameState.joueurs));
      }
    }, 1000);
  });

  // Soumission d'une réponse
  socket.on('submitAnswer', (indexChoisi) => {
    const joueur = gameState.joueurs[socket.id];
    const currentQ = questionsDatabase[gameState.questionIndex];

    if (joueur && !joueur.aRepondu && gameState.timeLeft > 0 && currentQ) {
      joueur.aRepondu = true;
      if (parseInt(indexChoisi) === parseInt(currentQ.reponseCorrecte)) {
        joueur.score += 100 + gameState.timeLeft * 10; // Bonus de rapidité
      }
      socket.emit('reponseEnregistree');
      io.emit('updateJoueursList', Object.values(gameState.joueurs));
    }
  });

  // Réinitialisation de la partie
  socket.on('restartQuiz', () => {
    clearInterval(gameState.timer);
    gameState.questionIndex = -1;
    gameState.roomCode = Math.floor(1000 + Math.random() * 9000).toString();
    Object.keys(gameState.joueurs).forEach(id => { gameState.joueurs[id].score = 0; });
    io.emit('codeUpdated', gameState.roomCode);
    io.emit('updateJoueursList', Object.values(gameState.joueurs));
    io.emit('partieReinitialisee');
  });

  // Déconnexion
  socket.on('disconnect', () => {
    delete gameState.joueurs[socket.id];
    io.emit('updateJoueursList', Object.values(gameState.joueurs));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Serveur prêt sur http://localhost:${PORT}`));