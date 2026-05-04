import React from 'react';

const avatars = [
  { value: 'default', label: '👤' },
  { value: '🦁', label: '🦁' },
  { value: '🐯', label: '🐯' },
  { value: '🐼', label: '🐼' },
  { value: '🐨', label: '🐨' },
  { value: '🦊', label: '🦊' },
  { value: '🐶', label: '🐶' },
  { value: '🐱', label: '🐱' },
  { value: '🐰', label: '🐰' },
  { value: '🐹', label: '🐹' },
  { value: '🐻', label: '🐻' },
  { value: '🐷', label: '🐷' },
  { value: '🐸', label: '🐸' },
  { value: '🐵', label: '🐵' },
  { value: '🐔', label: '🐔' },
  { value: '🐧', label: '🐧' },
  { value: '🐦', label: '🐦' },
  { value: '🦆', label: '🦆' },
  { value: '🦅', label: '🦅' },
  { value: '🦉', label: '🦉' }
];

function AvatarSelector({ currentAvatar, onSelectAvatar }) {
  return (
    <div className="form-group">
      <label>Avatar</label>
      <select
        value={currentAvatar}
        onChange={(e) => onSelectAvatar(e.target.value)}
      >
        {avatars.map((avatar) => (
          <option key={avatar.value} value={avatar.value}>
            {avatar.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default AvatarSelector;
