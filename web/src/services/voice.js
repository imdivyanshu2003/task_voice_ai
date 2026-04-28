// Web Speech API wrappers. Works on Chrome (Android + desktop) and Edge.
// iOS Safari support is partial — we degrade to text input.

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

export function isSttSupported() {
  return !!SR;
}

export function isTtsSupported() {
  return "speechSynthesis" in window;
}

export class VoiceController {
  constructor() {
    this.recognition = null;
    this.isListening = false;
  }

  start({ onPartial, onFinal, onError, lang = "hi-IN" }) {
    if (!SR) {
      onError?.(new Error("Speech recognition not supported in this browser."));
      return;
    }
    if (this.isListening) return;

    const r = new SR();
    r.lang = lang;
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;

    let finalText = "";

    r.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interim += transcript;
        }
      }
      onPartial?.((finalText + " " + interim).trim());
    };

    r.onerror = (e) => {
      this.isListening = false;
      onError?.(new Error(e.error || "Speech recognition error"));
    };

    r.onend = () => {
      this.isListening = false;
      const text = finalText.trim();
      if (text) onFinal?.(text);
    };

    r.start();
    this.recognition = r;
    this.isListening = true;
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
    }
  }

  abort() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
    }
    this.isListening = false;
  }
}

export function speak(text, { lang = "hi-IN", rate = 0.95, pitch = 1.0 } = {}) {
  if (!isTtsSupported() || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.pitch = pitch;
    window.speechSynthesis.speak(u);
  } catch (e) {
    console.warn("TTS failed", e);
  }
}

export function stopSpeaking() {
  if (isTtsSupported()) window.speechSynthesis.cancel();
}
