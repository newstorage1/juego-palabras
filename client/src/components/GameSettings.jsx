import React from 'react';

function GameSettings({ settings, onUpdateSettings }) {
  const difficulties = [
    { value: 10, label: 'Fácil (10x10)' },
    { value: 15, label: 'Medio (15x15)' },
    { value: 20, label: 'Difícil (20x20)' }
  ];

  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' }
  ];

  const themes = [
    { value: 'default', label: 'Clásico' },
    { value: 'dark', label: 'Oscuro' },
    { value: 'neon', label: 'Neón' },
    { value: 'nature', label: 'Naturaleza' },
    { value: 'ocean', label: 'Océano' }
  ];

  return (
    <div className="lobby-card">
      <h2>⚙️ Configuración del Juego</h2>
      
      <div className="form-group">
        <label>Idioma</label>
        <select
          value={settings.language}
          onChange={(e) => onUpdateSettings({ language: e.target.value })}
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Dificultad (Tamaño)</label>
        <select
          value={settings.gridSize}
          onChange={(e) => onUpdateSettings({ gridSize: parseInt(e.target.value) })}
        >
          {difficulties.map((diff) => (
            <option key={diff.value} value={diff.value}>
              {diff.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Tiempo límite (minutos)</label>
        <select
          value={settings.timeLimitMinutes}
          onChange={(e) => onUpdateSettings({ timeLimitMinutes: parseInt(e.target.value) })}
        >
          {[5, 10, 15, 20, 30, 45, 60].map((time) => (
            <option key={time} value={time}>
              {time} minutos
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Tema</label>
        <select
          value={settings.theme}
          onChange={(e) => onUpdateSettings({ theme: e.target.value })}
        >
          {themes.map((theme) => (
            <option key={theme.value} value={theme.value}>
              {theme.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Modo de juego</label>
        <select
          value={settings.mode}
          onChange={(e) => onUpdateSettings({ mode: e.target.value })}
        >
          <option value="solo">Individual</option>
          <option value="multiplayer">Multijugador</option>
        </select>
      </div>
    </div>
  );
}

export default GameSettings;
