import { useRef, useCallback, useEffect } from 'react';

const SOUND_PATHS = {
  click: '/sounds/click.mp3',
  selectLetter: '/sounds/select_letter.mp3',
  wordFound: '/sounds/word_found.mp3',
  opponentWord: '/sounds/opponent_word.mp3',
  victory: '/sounds/victory.mp3',
  defeat: '/sounds/defeat.mp3',
  gameStart: '/sounds/game_start.mp3',
};

export function useSounds(enabled = true) {
  const audioContextRef = useRef(null);
  const buffersRef = useRef({});
  const loadedRef = useRef(false);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const loadSound = useCallback(async (name) => {
    if (!enabled || loadedRef.current) return;
    
    const ctx = getAudioContext();
    if (buffersRef.current[name]) return;

    try {
      const response = await fetch(SOUND_PATHS[name]);
      if (!response.ok) return;
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      buffersRef.current[name] = audioBuffer;
    } catch (e) {
      console.log(`Sound ${name} not available:`, e.message);
    }
  }, [enabled, getAudioContext]);

  const preloadSounds = useCallback(async () => {
    if (!enabled || loadedRef.current) return;
    
    const soundNames = Object.keys(SOUND_PATHS);
    await Promise.all(soundNames.map(name => loadSound(name)));
    loadedRef.current = true;
  }, [enabled, loadSound]);

  useEffect(() => {
    if (enabled && !loadedRef.current) {
      const timer = setTimeout(() => {
        preloadSounds();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [enabled, preloadSounds]);

  const playSound = useCallback((name) => {
    if (!enabled) return;
    
    const ctx = getAudioContext();
    const buffer = buffersRef.current[name];
    
    if (buffer) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch (e) {
        console.log('Error playing sound:', e.message);
      }
    }
  }, [enabled, getAudioContext]);

  const playClick = useCallback(() => playSound('click'), [playSound]);
  const playSelectLetter = useCallback(() => playSound('selectLetter'), [playSound]);
  const playWordFound = useCallback(() => playSound('wordFound'), [playSound]);
  const playOpponentWord = useCallback(() => playSound('opponentWord'), [playSound]);
  const playVictory = useCallback(() => playSound('victory'), [playSound]);
  const playDefeat = useCallback(() => playSound('defeat'), [playSound]);
  const playGameStart = useCallback(() => playSound('gameStart'), [playSound]);

  return {
    playClick,
    playSelectLetter,
    playWordFound,
    playOpponentWord,
    playVictory,
    playDefeat,
    playGameStart,
    preloadSounds,
  };
}