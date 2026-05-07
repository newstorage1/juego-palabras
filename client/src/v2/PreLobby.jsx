import React, { useState } from 'react';
import './V2.css';

const AVAILABLE_AVATARS = ['👤', '🦁', '🐯', '🐼', '🐨', '🦊', '🐶', '🐱', '🐸', '🦄'];

export default function PreLobby({ onEnter }) {
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [gameMode, setGameMode] = useState('individual');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!nickname.trim()) {
      newErrors.nickname = 'El nickname es obligatorio';
    } else if (nickname.length < 3 || nickname.length > 15) {
      newErrors.nickname = 'El nickname debe tener entre 3 y 15 caracteres';
    }

    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum)) {
      newErrors.age = 'La edad es obligatoria';
    } else if (ageNum < 1 || ageNum > 120) {
      newErrors.age = 'La edad debe estar entre 1 y 120 años';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    const userData = {
      nickname: nickname.trim(),
      age: parseInt(age),
      avatar,
      gameMode: parseInt(age) < 13 ? 'individual' : gameMode,
      partidasGanadas: 0,
      mejorPuntaje: 0
    };

    onEnter(userData);
  };

  const isMinor = parseInt(age) < 13 && parseInt(age) > 0;

  return (
    <div className="prelobby-container">
      <div className="prelobby-card">
        <h1>🎮 Sopa de Letras - Versión 2</h1>
        <p className="prelobby-subtitle">Configura tu perfil para comenzar</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Tu apodo (3-15 caracteres)"
              maxLength={15}
            />
            {errors.nickname && <span className="error">{errors.nickname}</span>}
          </div>

          <div className="form-group">
            <label>Edad</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Tu edad"
              min={1}
              max={120}
            />
            {errors.age && <span className="error">{errors.age}</span>}
            {isMinor && (
              <span className="info">
                ⚠️ Solo puedes jugar en modo individual
              </span>
            )}
          </div>

          <div className="form-group">
            <label>Avatar</label>
            <div className="avatar-grid">
              {AVAILABLE_AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  className={`avatar-option ${avatar === av ? 'selected' : ''}`}
                  onClick={() => setAvatar(av)}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {parseInt(age) >= 13 && (
            <div className="form-group">
              <label>Modo de Juego</label>
              <div className="mode-selector">
                <button
                  type="button"
                  className={`mode-option ${gameMode === 'individual' ? 'selected' : ''}`}
                  onClick={() => setGameMode('individual')}
                >
                  <span className="mode-icon">🔵</span>
                  <span className="mode-label">Individual</span>
                  <span className="mode-desc">Juega solo contra el tiempo</span>
                </button>
                <button
                  type="button"
                  className={`mode-option ${gameMode === 'multijugador' ? 'selected' : ''}`}
                  onClick={() => setGameMode('multijugador')}
                >
                  <span className="mode-icon">🟢</span>
                  <span className="mode-label">Multijugador</span>
                  <span className="mode-desc">Juega con otros jugadores</span>
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-enter">
            Entrar →
          </button>
        </form>
      </div>
    </div>
  );
}