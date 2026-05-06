import { useState, useEffect, useRef } from 'react';
import socket from '../socket';

export default function ChatTest({ gameId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('disconnected');
  const [socketId, setSocketId] = useState(null);
  const logRef = useRef([]);

  useEffect(() => {
    console.log("🆕 ChatTest: Iniciando...", gameId);
    setStatus(socket.connected ? 'connected' : 'connecting');

    const handleConnect = () => {
      console.log("🆕 ChatTest: Socket conectado");
      setStatus('connected');
      setSocketId(socket.id);
    };

    const handleDisconnect = () => {
      console.log("🆕 ChatTest: Socket desconectado");
      setStatus('disconnected');
      setSocketId(null);
    };

    const handleChat = (data) => {
      console.log("🆕 ChatTest: Mensaje recibido:", data);
      logRef.current = [...logRef.current, { type: 'received', data }];
      setMessages(prev => [...prev, data]);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on('connect', handleConnect);
    }

    socket.on('disconnect', handleDisconnect);
    socket.on('chatMessage', handleChat);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('chatMessage', handleChat);
    };
  }, [gameId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    console.log("🆕 ChatTest: Enviando mensaje:", input);
    
    socket.emit('chatMessage', {
      gameId,
      message: input,
      playerId: socketId,
      nickname: 'Test'
    }, (ack) => {
      console.log("🆕 ChatTest: ACK:", ack);
    });
    
    logRef.current = [...logRef.current, { type: 'sent', data: input }];
    setInput('');
  };

  return (
    <div style={{ padding: 20, border: '2px solid red', margin: 10 }}>
      <h3>🧪 Chat Test (Aislado)</h3>
      <div style={{ marginBottom: 10 }}>
        <strong>Status:</strong> {status} | <strong>Socket ID:</strong> {socketId}
      </div>
      <div style={{ marginBottom: 10 }}>
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe mensaje..."
          style={{ padding: 5, width: 200 }}
        />
        <button onClick={sendMessage} style={{ marginLeft: 5, padding: 5 }}>
          Enviar
        </button>
      </div>
      <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ccc', padding: 10 }}>
        {messages.length === 0 ? <em>No hay mensajes</em> : messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 5 }}>
            <strong>{m.nickname}:</strong> {m.message}
          </div>
        ))}
      </div>
      <details style={{ marginTop: 10 }}>
        <summary>Logs ({logRef.current.length})</summary>
        <pre style={{ fontSize: 10, maxHeight: 150, overflow: 'auto' }}>
          {JSON.stringify(logRef.current, null, 2)}
        </pre>
      </details>
    </div>
  );
}