import React, { useState, useEffect } from 'react';
import socket from '../socket';

export default function ChatDebug({ gameId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const addLog = (msg) => setLogs(l => [...l, `${new Date().toLocaleTimeString()} - ${msg}`]);
    
    addLog('Iniciando ChatDebug...');
    addLog(`Socket connected: ${socket.connected}`);
    addLog(`Socket id: ${socket.id}`);

    const onConnect = () => addLog(`CONNECT - Socket connected: ${socket.connected}, id: ${socket.id}`);
    const onChat = (data) => {
      addLog(`RECV chatMessage: ${JSON.stringify(data)}`);
      setMessages(m => [...m, data]);
    };

    socket.on('connect', onConnect);
    socket.on('chatMessage', onChat);

    return () => {
      socket.off('connect', onConnect);
      socket.off('chatMessage', onChat);
    };
  }, []);

  const send = () => {
    if (!input.trim()) return;
    setLogs(l => [...l, `SENDING: ${input}`]);
    socket.emit('chatMessage', {
      gameId,
      message: input,
      playerId: socket.id,
      nickname: 'Test'
    });
    setInput('');
  };

  return (
    <div style={{ padding: 10, border: '3px solid red', margin: 10, background: '#fff5f5' }}>
      <h4>🧪 Chat Debug</h4>
      <div style={{ marginBottom: 5 }}>
        socket.connected: <strong>{socket.connected ? 'YES' : 'NO'}</strong> | id: <strong>{socket.id || 'none'}</strong>
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} placeholder="msg..." />
      <button onClick={send}>Send</button>
      <div style={{ marginTop: 10, maxHeight: 100, overflow: 'auto', fontSize: 11, background: '#eee', padding: 5 }}>
        {logs.map((l, i) => <div key={i}>{l}</div>)}
      </div>
      <div style={{ marginTop: 5, fontSize: 11 }}>
        Messages: {messages.length}
      </div>
    </div>
  );
}