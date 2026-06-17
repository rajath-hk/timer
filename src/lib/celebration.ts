import confetti from 'canvas-confetti';

export function triggerSessionCompleteCelebration(mode: 'focus' | 'shortBreak' | 'longBreak') {
  if (mode === 'focus') {
    // Main burst from center
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#4062ff', '#6b8cff', '#c8d1ff', '#e4e9ff', '#ffd700'],
      shapes: ['circle', 'square'],
    });

    // Side bursts
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
      });
    }, 150);

    // Final sparkle
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#ff6b6b', '#ffd93d', '#6b8cff'],
        startVelocity: 30,
        decay: 0.92,
      });
    }, 400);
  } else {
    // Gentle celebration for breaks
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: mode === 'shortBreak' 
        ? ['#10b981', '#34d399', '#a7f3d0']
        : ['#f59e0b', '#fbbf24', '#fde68a'],
      shapes: ['circle'],
    });
  }
}

export function triggerAchievementCelebration() {
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.5 },
    colors: ['#ffd700', '#ff6b6b', '#4062ff', '#10b981', '#f59e0b'],
    shapes: ['star', 'circle'],
    scalar: 1.2,
  });

  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.4 },
      startVelocity: 20,
      decay: 0.94,
      colors: ['#ffd700', '#ffecb3'],
    });
  }, 200);
}
