import confetti from 'canvas-confetti';

export function fireConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#9b59b6', '#3498db', '#f1c40f', '#e74c3c', '#2ecc71'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#9b59b6', '#3498db', '#f1c40f', '#e74c3c', '#2ecc71'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

export function fireBigConfetti() {
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#9b59b6', '#3498db', '#f1c40f', '#e74c3c', '#2ecc71', '#ff69b4'],
  });
}

export default fireConfetti;
