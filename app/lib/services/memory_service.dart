import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/message.dart';
import '../models/task.dart';

/// Simple local-first memory — SharedPreferences backed, JSON encoded.
class MemoryService {
  static const _kMessages = 'saathi_messages';
  static const _kTasks = 'saathi_tasks';
  static const _kFacts = 'saathi_facts';
  static const _kPersonality = 'saathi_personality';
  static const _kOnboarded = 'saathi_onboarded';

  late SharedPreferences _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // ── Onboarding ──────────────────────────────────────
  bool get isOnboarded => _prefs.getBool(_kOnboarded) ?? false;
  Future<void> setOnboarded(bool v) => _prefs.setBool(_kOnboarded, v);

  // ── Personality ─────────────────────────────────────
  String get personality => _prefs.getString(_kPersonality) ?? 'friend';
  Future<void> setPersonality(String key) => _prefs.setString(_kPersonality, key);

  // ── Chat history ────────────────────────────────────
  List<Message> getMessages() {
    final raw = _prefs.getStringList(_kMessages) ?? [];
    return raw.map((s) => Message.decode(s)).toList();
  }

  Future<void> saveMessages(List<Message> msgs) {
    final list = msgs.map((m) => m.encode()).toList();
    return _prefs.setStringList(_kMessages, list);
  }

  Future<void> addMessage(Message msg) async {
    final msgs = getMessages()..add(msg);
    // Keep last 100 messages
    if (msgs.length > 100) msgs.removeRange(0, msgs.length - 100);
    await saveMessages(msgs);
  }

  // ── Tasks ───────────────────────────────────────────
  List<TaskItem> getTasks() {
    final raw = _prefs.getStringList(_kTasks) ?? [];
    return raw.map((s) => TaskItem.decode(s)).toList();
  }

  Future<void> saveTasks(List<TaskItem> tasks) {
    final list = tasks.map((t) => t.encode()).toList();
    return _prefs.setStringList(_kTasks, list);
  }

  Future<void> addTasks(List<TaskItem> newTasks) async {
    final existing = getTasks()..addAll(newTasks);
    await saveTasks(existing);
  }

  Future<void> toggleTask(String id) async {
    final tasks = getTasks();
    final idx = tasks.indexWhere((t) => t.id == id);
    if (idx != -1) {
      tasks[idx].done = !tasks[idx].done;
      await saveTasks(tasks);
    }
  }

  Future<void> deleteTask(String id) async {
    final tasks = getTasks()..removeWhere((t) => t.id == id);
    await saveTasks(tasks);
  }

  // ── User facts / memory blob ────────────────────────
  List<String> getFacts() => _prefs.getStringList(_kFacts) ?? [];

  Future<void> addFact(String fact) async {
    final facts = getFacts()..add(fact);
    if (facts.length > 50) facts.removeRange(0, facts.length - 50);
    await _prefs.setStringList(_kFacts, facts);
  }

  String getMemorySummary() {
    final facts = getFacts();
    return facts.isEmpty ? '' : facts.join('. ');
  }

  // ── Clear all ───────────────────────────────────────
  Future<void> clearAll() async {
    await _prefs.remove(_kMessages);
    await _prefs.remove(_kTasks);
    await _prefs.remove(_kFacts);
  }

  Future<void> clearMessages() => _prefs.remove(_kMessages);
  Future<void> clearTasks() => _prefs.remove(_kTasks);
  Future<void> clearFacts() => _prefs.remove(_kFacts);
}
