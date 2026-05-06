import React, { useState, useEffect, useRef } from 'react';

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const lastUpdateRef = useRef(Date.now());
  const gameId = 'SOPA-8AE';

  // Conexión inicial y polling HTTP
  useEffect(() => {
    fetch('http://localhost:3001/health')
      .then(() => setConnected(true))
      .catch(() => setConnected(false));

    // Polling cada segundo para recibir mensajes
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/chat/${gameId}`);
        const data = await res.json();
        
        if (data.messages && data.messages.length > 0) {
          const currentLen = messages.length;
          const newLen = data.messages.length;
          
          if (newLen > currentLen) {
            console.log('📬 Nuevos mensajes:', newLen - currentLen);
            setMessages(data.messages);
          }
        }
      } catch (e) {
        // Ignorar errores de polling
      }
    }, 1000);

    // Generar ID temporal
    setSocketId('temp-' + Date.now());

    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    try {
      await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          message: input,
          playerId: socketId,
          nickname: 'Jugador'
        })
      });
      setInput('');
    } catch (e) {
      console.error('Error:', e);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: '50px auto' }}>
      <h2>💬 Chat HTTP</h2>
      
      <div style={{ padding: 10, background: connected ? '#d4edda' : '#f8d7da' }}>
        {connected ? '✅ Servidor disponible' : '❌ Sin conexión'}
      </div>

      <div style={{ height: 300, border: '1px solid #ccc', padding: 10, overflow: 'auto' }}>
        {messages.map((m, i) => (
          <div key={i}><b>{m.nickname}:</b> {m.message}</div>
        ))}
        {messages.length === 0 && <em>Sin mensajes - esperando...</em>}
      </div>

      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} />
      <button onClick={sendMessage}>Enviar</button>
      
      <div style={{ marginTop: 20 }}>Mensajes: {messages.length}</div>
    </div>
  );
}