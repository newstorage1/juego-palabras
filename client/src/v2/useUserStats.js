import { useState, useEffect } from 'react';

export default function useUserStats() {
  const [stats, setStats] = useState({
    partidasGanadas: 0,
    mejorPuntaje: 0
  });

  useEffect(() => {
    const saved = localStorage.getItem('v2_userData');
    if (saved) {
      const userData = JSON.parse(saved);
      setStats({
        partidasGanadas: userData.partidasGanadas || 0,
        mejorPuntaje: userData.mejorPuntaje || 0
      });
    }
  }, []);

  const updateStats = (finalScores, winnerId, socketId) => {
    const userData = JSON.parse(localStorage.getItem('v2_userData') || '{}');
    const playerScore = finalScores.find(p => p.id === socketId);
    
    if (!playerScore) return;

    let newStats = { ...stats };

    // Verificar si el usuario ganó
    if (winnerId === socketId) {
      newStats.partidasGanadas += 1;
    }

    // Verificar si el puntaje es mayor al mejor
    if (playerScore.score > newStats.mejorPuntaje) {
      newStats.mejorPuntaje = playerScore.score;
    }

    // Guardar en localStorage
    const updatedUserData = {
      ...userData,
      partidasGanadas: newStats.partidasGanadas,
      mejorPuntaje: newStats.mejorPuntaje
    };
    localStorage.setItem('v2_userData', JSON.stringify(updatedUserData));
    setStats(newStats);
  };

  return { stats, updateStats };
}