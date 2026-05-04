import React from 'react';
import { themes, getTheme } from '../config/themes';

function ThemeSelector({ currentTheme, onSelectTheme }) {
  const availableThemes = Object.values(themes);

  return (
    <div className="form-group">
      <label>Selecciona tu tema</label>
      <div className="themes-grid">
        {availableThemes.map((theme) => (
          <div
            key={theme.name}
            className={`theme-card ${currentTheme === theme.name ? 'selected' : ''}`}
            onClick={() => onSelectTheme(theme.name)}
          >
            <div
              className="theme-preview"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
              }}
            />
            <span>{theme.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ThemeSelector;
