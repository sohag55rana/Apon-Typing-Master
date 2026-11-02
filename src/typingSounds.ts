export type TypingSound = "key" | "error" | "word" | "finish";

export function playTypingSound(
  audioContext: AudioContext,
  sound: TypingSound,
): void {
  const notes =
    sound === "finish"
      ? [660, 830, 1040]
      : sound === "word"
        ? [880]
        : sound === "error"
          ? [180]
          : [560];
  const startTime = audioContext.currentTime;

  notes.forEach((frequency, index) => {
    const noteStart = startTime + index * 0.075;
    const duration = sound === "key" ? 0.035 : sound === "error" ? 0.12 : 0.1;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = sound === "error" ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    gain.gain.setValueAtTime(sound === "key" ? 0.035 : 0.065, noteStart);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      noteStart + duration,
    );
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + duration);
  });
}
