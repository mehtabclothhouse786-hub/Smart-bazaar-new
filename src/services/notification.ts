// Web Audio API Order Notification Sound Generator and Browser Push Notification Helper

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playOrderSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Play a sequence of 3 pleasant bell tones (E5, G#5, B5 chime)
    const now = ctx.currentTime;
    const notes = [
      { freq: 659.25, time: 0, duration: 0.18 },   // E5
      { freq: 830.61, time: 0.15, duration: 0.18 }, // G#5
      { freq: 987.77, time: 0.30, duration: 0.45 }  // B5
    ];

    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(0.01, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.35, now + n.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.duration);
    });
  } catch (e) {
    console.warn('Audio notification play error:', e);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  // Wake audio context on permission request interaction
  getAudioContext();

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }

  return false;
}

export function sendBrowserNotification(title: string, body: string, icon?: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: icon || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=80',
        tag: 'smart-bazaar-order-' + Date.now()
      });
    } catch (e) {
      console.warn('Error sending browser notification:', e);
    }
  }
}
