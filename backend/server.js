// server.js
const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

// Store game state (e.g., target number and players)
let targetNumber = Math.floor(Math.random() * 100) + 1;
let players = {};

server.on('connection', (socket) => {
  console.log('New player connected.');

  // Broadcast new target number to all players
  socket.send(JSON.stringify({ type: 'init', targetNumber }));

  socket.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'guess') {
      const { playerName, guess } = data;
      let feedbackMessage = '';

      if (guess === targetNumber) {
        feedbackMessage = `Congratulations ${playerName}, you guessed the correct number!`;
        targetNumber = Math.floor(Math.random() * 100) + 1; // Reset target number
      } else if (guess < targetNumber) {
        feedbackMessage = 'Too low!';
      } else {
        feedbackMessage = 'Too high!';
      }

      // Update players state
      players[playerName] = { guess, feedback: feedbackMessage };

      // Broadcast updated game state to all connected players
      const broadcastData = JSON.stringify({
        type: 'update',
        players,
        feedback: feedbackMessage,
      });

      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(broadcastData);
        }
      });
    }
  });

  socket.on('close', () => {
    console.log('Player disconnected.');
  });
});
