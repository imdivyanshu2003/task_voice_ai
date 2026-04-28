/// Backend base URL.
/// - Android emulator: use http://10.0.2.2:8787 to hit host machine.
/// - Real device on same Wi-Fi: replace with your PC's LAN IP, e.g. http://192.168.1.42:8787
/// - ngrok / production: use the https URL.
const String kApiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:8787',
);
