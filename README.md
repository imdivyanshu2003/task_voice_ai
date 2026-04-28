# Saathi AI — Emotion + Action Companion

> "Not just someone who listens… but someone who understands AND helps you move forward."

**Stack:** Flutter (Android) + Node.js backend + OpenAI GPT + Device STT/TTS

---

## Architecture

```
User speaks → Device STT → transcript → Backend (Node/Express) → OpenAI GPT → JSON response
                                                                                ├── emotional_response
                                                                                ├── tasks[]
                                                                                └── next_suggestion
              Device TTS ← emotional_response
              Local storage ← tasks, messages, memory
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20 | https://nodejs.org |
| Flutter | ≥ 3.19 | https://docs.flutter.dev/get-started/install/windows |
| Android Studio | Latest | https://developer.android.com/studio |
| OpenAI API key | — | https://platform.openai.com/api-keys |

---

## 1. Backend Setup

```powershell
cd backend
npm install
copy .env.example .env
```

Open `backend/.env` and paste your OpenAI key:
```
OPENAI_API_KEY=sk-your-real-key-here
```

Start the server:
```powershell
npm run dev
```

Verify: http://localhost:8787/health

---

## 2. Flutter App Setup

### Generate platform files (one time)

```powershell
cd app
flutter create --org com.saathi --project-name saathi .
```

This generates `android/`, `ios/`, `web/`, etc. around your existing `lib/` and `pubspec.yaml`.

### Android permissions

Open `app/android/app/src/main/AndroidManifest.xml` and add these **inside** `<manifest>`, **before** `<application>`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
<uses-permission android:name="android.permission.INTERNET"/>
```

### Set API URL for your device

**Emulator:** default works (`http://10.0.2.2:8787` → host machine).

**Real device on same Wi-Fi:**  
Find your PC's IP: `ipconfig` → look for `IPv4 Address` (e.g. `192.168.1.42`).
Then run with:
```powershell
flutter run --dart-define=API_BASE_URL=http://192.168.1.42:8787
```

### Install deps and run

```powershell
cd app
flutter pub get
flutter run
```

---

## 3. Project Structure

```
backend/
  src/
    server.js          # Express server, /chat and /memory/summarize endpoints
    prompts.js         # Personality presets + system prompt builder
  .env.example         # Copy to .env, add your key
  package.json

app/
  lib/
    main.dart          # Entry point + routing
    config.dart        # API URL config
    theme.dart         # Dark theme + colors
    models/
      message.dart     # Chat message model
      task.dart        # Task model
      personality.dart # Personality presets
    services/
      api_service.dart     # HTTP client for backend
      voice_service.dart   # STT + TTS wrapper
      memory_service.dart  # SharedPreferences-based local storage
    state/
      app_state.dart   # Provider-based app state
    screens/
      splash_screen.dart
      welcome_screen.dart
      personality_screen.dart
      permissions_screen.dart
      home_screen.dart       # Main voice + chat hybrid screen
      tasks_screen.dart      # Task dashboard
      memory_screen.dart     # Memory & settings
    widgets/
      mic_button.dart
      task_tile.dart
      chat_bubble.dart
  pubspec.yaml
```

---

## 4. MVP Screens

| # | Screen | Route | Purpose |
|---|--------|-------|---------|
| 1 | Splash | `/splash` | Logo + tagline, auto-redirect |
| 2 | Welcome | `/welcome` | Value prop, CTA: Start |
| 3 | Personality | `/personality` | Choose AI personality |
| 4 | Permissions | `/permissions` | Mic permission + trust message |
| 5 | Home | `/home` | Voice + chat + AI response + task preview |
| 6 | Tasks | `/tasks` | Task dashboard with progress bar |
| 7 | Memory | `/memory` | View saved info, change personality, delete data |

---

## 5. How It Works

1. **User speaks** → Device SpeechRecognizer converts to text
2. **Transcript sent** to backend `/chat` with personality + chat history + memory summary
3. **GPT processes** with a system prompt that forces dual-mode output (companion vs action)
4. **JSON response** comes back: `{mode, emotional_response, tasks[], next_suggestion}`
5. **App displays** emotional response as chat bubble + adds tasks to local store
6. **Device TTS** speaks the emotional response aloud
7. **Memory** builds over time from user facts stored locally

---

## 6. Costs

- **OpenAI GPT-4o-mini**: ~$0.15/million input tokens, ~$0.60/million output tokens. Very cheap.
- **STT + TTS**: Free (on-device Android APIs)
- **Storage**: Free (local SharedPreferences)

---

## 7. Next Steps (Post-MVP)

- [ ] Firebase Firestore for cloud sync
- [ ] ElevenLabs for premium voice
- [ ] SerpAPI for research mode
- [ ] Push notifications for daily check-in
- [ ] Premium tier with advanced memory + custom personalities

---

राधे राधे 🙏
