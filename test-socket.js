const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3001';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  console.log('=== Test: wordFound se propaga a todos los jugadores ===\n');

  const socket1 = io(SERVER_URL, { autoConnect: false });
  const socket2 = io(SERVER_URL, { autoConnect: false });

  let gameId = null;
  let player2ReceivedWordFound = false;
  let wordFoundData = null;
  let testPassed = false;

  socket1.on('connect', () => console.log('Socket1 conectado'));
  socket1.on('connect_error', (err) => console.log('Socket1 error:', err.message));
  socket2.on('connect', () => console.log('Socket2 conectado'));
  socket2.on('connect_error', (err) => console.log('Socket2 error:', err.message));

  socket1.connect();
  await new Promise(r => socket1.on('connect', r));

  console.log('✓ Jugador 1 conectado');

  const createResult = await new Promise((resolve) => {
    socket1.emit('createGame', {
      nickname: 'Jugador1',
      avatar: 'default',
      gridSize: 10,
      language: 'es'
    }, resolve);
  });

  gameId = createResult.gameId;
  console.log(`✓ Partida creada: ${gameId}`);

  await new Promise((resolve) => {
    socket1.emit('joinGame', { gameId, userData: { nickname: 'Jugador1' } }, () => {
      console.log('✓ Jugador 1 joined a la partida');
      resolve();
    });
  });

  socket2.connect();
  await new Promise(r => socket2.on('connect', r));
  console.log('✓ Jugador 2 conectado');

  await new Promise((resolve) => {
    socket2.emit('joinGame', { gameId, userData: { nickname: 'Jugador2' } }, (resp) => {
      console.log('✓ Jugador 2 joined a la partida:', resp.success ? 'OK' : resp.error);
      resolve();
    });
  });

  console.log('\n--- Iniciando partida ---');

  socket1.emit('startGame', gameId);

  const data = await new Promise((resolve) => {
    socket1.on('gameStarted', (data) => {
      console.log('✓ Juego iniciado');
      resolve(data);
    });
  });

  console.log(`  Palabras disponibles: ${data.words.slice(0, 3).map(w => w.word).join(', ')}`);

  const wordToFind = data.words.find(w => !w.foundBy)?.word;
  if (!wordToFind) {
    console.log('✗ No hay palabras');
    process.exit(1);
  }

  console.log(`\n--- Jugador 1 encuentra: ${wordToFind} ---`);
  
  const wordObj = data.words.find(w => w.word === wordToFind);
  socket1.emit('selectWord', {
    gameId,
    playerIndex: 0,
    coordinates: wordObj?.coordinates || [],
    word: wordToFind
  });

  console.log('\n--- Esperando evento en Jugador 2 ---');

  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout esperando wordFound')), 5000)
  );

  const wordFoundPromise = new Promise((resolve) => {
    socket2.on('wordFound', (data) => {
      console.log('✓ Jugador 2 recibió wordFound!');
      console.log('  word:', data.word);
      console.log('  nickname:', data.nickname);
      console.log('  points:', data.points);
      wordFoundData = data;
      player2ReceivedWordFound = true;
      resolve();
    });
  });

  try {
    await Promise.race([wordFoundPromise, timeoutPromise]);
    testPassed = true;
  } catch (e) {
    console.log('✗ Timeout: Jugador 2 no recibió wordFound');
  }

  console.log('\n=== RESULTADO:', testPassed ? '✅ TEST PASÓ' : '❌ TEST FALLÓ', '===');

  socket1.disconnect();
  socket2.disconnect();

  process.exit(testPassed ? 0 : 1);
}

runTest().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});