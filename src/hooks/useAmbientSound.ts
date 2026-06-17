import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { AmbientSound } from '@/types';

export const ambientSounds: AmbientSound[] = [
  { id: 'none', name: 'None', icon: '🔇', color: '#6b7280', type: 'whiteNoise' },
  { id: 'whitenoise', name: 'White Noise', icon: '📡', color: '#8b5cf6', type: 'whiteNoise' },
  { id: 'rain', name: 'Rain', icon: '🌧️', color: '#3b82f6', type: 'rain' },
  { id: 'forest', name: 'Forest', icon: '🌲', color: '#10b981', type: 'forest' },
  { id: 'waves', name: 'Ocean Waves', icon: '🌊', color: '#06b6d4', type: 'waves' },
  { id: 'lofi', name: 'Lo-fi Beats', icon: '🎵', color: '#f59e0b', type: 'lofi' },
];

export function useAmbientSound() {
  const [activeSoundId, setActiveSoundId] = useLocalStorage<string>('ambientSoundId', 'none');
  const [volume, setVolume] = useLocalStorage<number>('ambientSoundVolume', 0.3);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodesRef = useRef<AudioNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        void audioContextRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAll = useCallback(() => {
    sourceNodesRef.current.forEach(node => {
      try {
        if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
          node.stop();
        }
        node.disconnect();
      } catch {
        // Already stopped
      }
    });
    sourceNodesRef.current = [];
    setIsPlaying(false);
  }, []);

  const createWhiteNoise = useCallback((ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }, []);

  const createRain = useCallback((ctx: AudioContext) => {
    // Rain is filtered noise with a rolling-off high end
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Low-pass filter to soften the noise into rain
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.Q.setValueAtTime(0.5, ctx.currentTime);

    source.connect(filter);
    return { source, filter };
  }, []);

  const createForest = useCallback((ctx: AudioContext) => {
    // Forest ambient: filtered noise with some gentle modulation
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Slightly colored noise
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(0.8, ctx.currentTime);

    // Gentle amplitude modulation for natural feel
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.3, ctx.currentTime);
    lfo.connect(lfoGain);

    source.connect(filter);
    lfo.start();
    return { source, filter, lfoGain, lfo };
  }, []);

  const createWaves = useCallback((ctx: AudioContext) => {
    // Ocean waves: modulated noise with rhythmic swell
    const bufferSize = ctx.sampleRate * 6;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Low-pass filter for muted wave sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    filter.Q.setValueAtTime(1.0, ctx.currentTime);

    // LFO to create wave-like swell
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.4, ctx.currentTime);
    lfo.connect(lfoGain);

    source.connect(filter);
    lfo.start();
    return { source, filter, lfoGain, lfo };
  }, []);

  const createLofi = useCallback((ctx: AudioContext) => {
    // Simple lofi-like ambient: a soft chord with some filtering
    const frequencies = [261.63, 329.63, 392.00, 523.25]; // C major chord
    const oscillators: OscillatorNode[] = [];

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Slight detune for warmth
      osc.detune.setValueAtTime(Math.random() * 10 - 5, ctx.currentTime);

      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0.08 / frequencies.length, ctx.currentTime);

      // Slow vibrato — tracked in oscillators for proper cleanup
      const vibrato = ctx.createOscillator();
      vibrato.type = 'sine';
      vibrato.frequency.setValueAtTime(2 + Math.random(), ctx.currentTime);
      const vibratoGain = ctx.createGain();
      vibratoGain.gain.setValueAtTime(3, ctx.currentTime);
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);

      osc.connect(noteGain);
      osc.start();
      vibrato.start();
      oscillators.push(osc, vibrato);
    });

    return { oscillators, source: oscillators[0] };
  }, []);

  const play = useCallback((soundId: string) => {
    stopAll();
    if (soundId === 'none') {
      setActiveSoundId('none');
      return;
    }

    const sound = ambientSounds.find(s => s.id === soundId);
    if (!sound) return;

    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = audioContextRef.current || new AudioContextClass();
    audioContextRef.current = ctx;

    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.connect(ctx.destination);
    gainNodeRef.current = gainNode;

    type NodeWithFilter = AudioNode & { frequency?: AudioParam; Q?: AudioParam };
    const nodes: NodeWithFilter[] = [gainNode];

    switch (sound.type) {
      case 'whiteNoise': {
        const source = createWhiteNoise(ctx);
        source.connect(gainNode);
        source.start();
        nodes.push(source);
        break;
      }
      case 'rain': {
        const { source, filter } = createRain(ctx);
        filter.connect(gainNode);
        source.start();
        nodes.push(source, filter);
        break;
      }
      case 'forest': {
        const { source, filter, lfoGain, lfo } = createForest(ctx);
        filter.connect(gainNode);
        lfoGain.connect(gainNode.gain as unknown as AudioNode);
        source.start();
        nodes.push(source, filter, lfo, lfoGain);
        break;
      }
      case 'waves': {
        const { source, filter, lfoGain, lfo } = createWaves(ctx);
        filter.connect(gainNode);
        lfoGain.connect(gainNode.gain as unknown as AudioNode);
        source.start();
        nodes.push(source, filter, lfo, lfoGain);
        break;
      }
      case 'lofi': {
        const { oscillators } = createLofi(ctx);
        oscillators.forEach(osc => {
          const noteGain = ctx.createGain();
          noteGain.gain.setValueAtTime(0.08 / 4, ctx.currentTime);
          osc.connect(noteGain);
          noteGain.connect(gainNode);
          nodes.push(osc, noteGain);
        });
        break;
      }
    }

    // Store source nodes for cleanup (filter out non-stoppable nodes)
    sourceNodesRef.current = nodes.filter(n => 
      n instanceof OscillatorNode || n instanceof AudioBufferSourceNode
    ) as AudioNode[];
    
    setActiveSoundId(soundId);
    setIsPlaying(true);
  }, [stopAll, volume, setActiveSoundId, createWhiteNoise, createRain, createForest, createWaves, createLofi]);

  const toggleSound = useCallback((soundId: string) => {
    if (isPlaying && activeSoundId === soundId) {
      stopAll();
      setActiveSoundId('none');
    } else {
      play(soundId);
    }
  }, [isPlaying, activeSoundId, stopAll, setActiveSoundId, play]);

  const updateVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVolume, audioContextRef.current?.currentTime || 0);
    }
  }, [setVolume]);

  return {
    activeSoundId,
    isPlaying,
    volume,
    play,
    toggleSound,
    stopAll,
    updateVolume,
    setActiveSoundId,
    ambientSounds,
  };
}
