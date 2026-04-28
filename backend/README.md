# Saathi Backend

Node.js + Express proxy to OpenAI. Keeps your API key off the device.

## Setup (Windows PowerShell)

```powershell
cd backend
npm install
copy .env.example .env
# open .env and paste your OPENAI_API_KEY
npm run dev
```

Health check: http://localhost:8787/health

## Endpoints

- `POST /chat` — main brain. Returns `{ mode, emotional_response, tasks[], next_suggestion }`
- `POST /memory/summarize` — optional helper to compress user facts into a memory blob.

## Exposing to your phone (for Flutter dev)

If you run the Flutter app on a real Android device, the device can't reach `localhost`. Two options:

1. **Same Wi-Fi**: find your PC's LAN IP (`ipconfig`), e.g. `192.168.1.42`, then in the Flutter app set `API_BASE_URL=http://192.168.1.42:8787`.
2. **ngrok**: `ngrok http 8787` → use the https URL.
