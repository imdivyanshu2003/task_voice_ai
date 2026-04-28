import 'package:flutter/foundation.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:flutter_tts/flutter_tts.dart';

class VoiceService {
  final stt.SpeechToText _speech = stt.SpeechToText();
  final FlutterTts _tts = FlutterTts();

  bool _sttReady = false;
  bool get isSttReady => _sttReady;

  Future<void> init() async {
    _sttReady = await _speech.initialize(
      onError: (e) => debugPrint('[STT] error: ${e.errorMsg}'),
    );

    await _tts.setLanguage('hi-IN');
    await _tts.setSpeechRate(0.48);
    await _tts.setPitch(1.0);
  }

  /// Start listening. [onResult] fires on every partial/final result.
  void startListening({
    required ValueChanged<String> onResult,
    required VoidCallback onDone,
    String localeId = 'hi_IN',
  }) {
    if (!_sttReady) return;
    _speech.listen(
      onResult: (result) {
        onResult(result.recognizedWords);
        if (result.finalResult) onDone();
      },
      localeId: localeId,
      listenMode: stt.ListenMode.dictation,
      cancelOnError: true,
    );
  }

  void stopListening() => _speech.stop();
  bool get isListening => _speech.isListening;

  /// Speak text aloud via device TTS.
  Future<void> speak(String text) async {
    await _tts.speak(text);
  }

  Future<void> stopSpeaking() async {
    await _tts.stop();
  }

  void dispose() {
    _speech.stop();
    _tts.stop();
  }
}
