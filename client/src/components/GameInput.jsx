import React from 'react';

function GameInput({ label, type = 'text', value, onChange, placeholder, selectOptions = [] }) {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      {selectOptions.length > 0 ? (
        <select value={value} onChange={onChange}>
          {selectOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default GameInput;
