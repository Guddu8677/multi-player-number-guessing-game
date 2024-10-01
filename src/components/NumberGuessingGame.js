// src/components/NumberGuessingGame.js
import { useState, useEffect } from 'react';

const NumberGuessingGame = () => {
  const [playerName, setPlayerName] = useState('');
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [players, setPlayers] = useState({});
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Establish WebSocket connection when component mounts
    const ws = new WebSocket('ws://localhost:8080');

    // Store the socket in state
    setSocket(ws);

    // Listen for messages from the server
    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);

      if (data.type === 'init') {
        console.log(`Target number is: ${data.targetNumber}`);
      }

      if (data.type === 'update') {
        setPlayers(data.players);
        setFeedback(data.feedback);
      }
    };

    return () => {
      // Clean up WebSocket connection when component unmounts
      ws.close();
    };
  }, []);

  // Handle guess submission
  const handleGuess = () => {
    if (socket) {
      const num = parseInt(guess, 10);

      // Send player's guess to the server
      socket.send(
        JSON.stringify({
          type: 'guess',
          playerName,
          guess: num,
        })
      );
    }
  };

  return (
    <div>
      <h3>Multiplayer Guess the Number (Between 1 and 100)</h3>
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Enter your name"
      />
      <input
        type="number"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Enter your guess"
      />
      <button onClick={handleGuess}>Submit Guess</button>
      <p>{feedback}</p>

      <h4>Players and Their Guesses:</h4>
      <ul>
        {Object.keys(players).map((key) => (
          <li key={key}>
            {players[key].name}: {players[key].guess} ({players[key].feedback})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NumberGuessingGame;
