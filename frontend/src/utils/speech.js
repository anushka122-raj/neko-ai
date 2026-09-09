// src/utils/speech.js

export function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;     // speed of speech
  utterance.pitch = 1.2;  // slightly higher pitch for friendly tone
  speechSynthesis.speak(utterance);
}
