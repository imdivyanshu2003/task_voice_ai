import 'package:flutter/material.dart';
import '../models/message.dart';
import '../models/task.dart';
import '../services/api_service.dart';
import '../services/memory_service.dart';
import '../services/voice_service.dart';

class AppState extends ChangeNotifier {
  final ApiService api = ApiService();
  final VoiceService voice = VoiceService();
  final MemoryService memory = MemoryService();

  // ── Init ────────────────────────────────────────────
  bool ready = false;
  bool backendReachable = false;

  Future<void> init() async {
    await memory.init();
    await voice.init();
    backendReachable = await api.healthCheck();
    _messages = memory.getMessages();
    _tasks = memory.getTasks();
    ready = true;
    notifyListeners();
  }

  // ── Personality ─────────────────────────────────────
  String get personality => memory.personality;
  bool get isOnboarded => memory.isOnboarded;

  Future<void> selectPersonality(String key) async {
    await memory.setPersonality(key);
    notifyListeners();
  }

  Future<void> completeOnboarding() async {
    await memory.setOnboarded(true);
    notifyListeners();
  }

  // ── Messages ────────────────────────────────────────
  List<Message> _messages = [];
  List<Message> get messages => _messages;

  // ── Tasks ───────────────────────────────────────────
  List<TaskItem> _tasks = [];
  List<TaskItem> get tasks => _tasks;

  int get tasksDoneCount => _tasks.where((t) => t.done).length;
  int get tasksTotal => _tasks.length;

  Future<void> toggleTask(String id) async {
    await memory.toggleTask(id);
    _tasks = memory.getTasks();
    notifyListeners();
  }

  Future<void> deleteTask(String id) async {
    await memory.deleteTask(id);
    _tasks = memory.getTasks();
    notifyListeners();
  }

  // ── Voice ───────────────────────────────────────────
  bool isListening = false;
  String partialTranscript = '';
  bool isProcessing = false;
  ChatResponse? lastResponse;

  void startListening() {
    partialTranscript = '';
    isListening = true;
    notifyListeners();
    voice.startListening(
      onResult: (text) {
        partialTranscript = text;
        notifyListeners();
      },
      onDone: () {
        isListening = false;
        notifyListeners();
        if (partialTranscript.trim().isNotEmpty) {
          sendMessage(partialTranscript.trim());
        }
      },
    );
  }

  void stopListening() {
    voice.stopListening();
    isListening = false;
    notifyListeners();
    if (partialTranscript.trim().isNotEmpty) {
      sendMessage(partialTranscript.trim());
    }
  }

  // ── Send message to backend ─────────────────────────
  Future<void> sendMessage(String text) async {
    // Add user message
    final userMsg = Message(
      role: 'user',
      content: text,
      createdAt: DateTime.now(),
    );
    _messages.add(userMsg);
    await memory.addMessage(userMsg);
    isProcessing = true;
    notifyListeners();

    try {
      // Build history for context (last 8 turns)
      final history = _messages
          .where((m) => true)
          .toList()
          .reversed
          .take(8)
          .toList()
          .reversed
          .map((m) => {'role': m.role, 'content': m.content})
          .toList();

      final resp = await api.chat(
        transcript: text,
        personality: personality,
        history: history,
        memory: memory.getMemorySummary(),
      );

      lastResponse = resp;

      // Add assistant message
      final assistantMsg = Message(
        role: 'assistant',
        content: resp.emotionalResponse,
        createdAt: DateTime.now(),
        mode: resp.mode,
      );
      _messages.add(assistantMsg);
      await memory.addMessage(assistantMsg);

      // Add generated tasks
      if (resp.tasks.isNotEmpty) {
        final newTasks = resp.tasks
            .map((t) => TaskItem(title: t['title']!, detail: t['detail'] ?? ''))
            .toList();
        await memory.addTasks(newTasks);
        _tasks = memory.getTasks();
      }

      // Speak the response
      voice.speak(resp.emotionalResponse);
    } catch (e) {
      final errMsg = Message(
        role: 'assistant',
        content: 'Oops, couldn\'t connect: $e',
        createdAt: DateTime.now(),
        mode: 'companion',
      );
      _messages.add(errMsg);
      await memory.addMessage(errMsg);
    }

    isProcessing = false;
    notifyListeners();
  }

  // ── Memory management ───────────────────────────────
  Future<void> clearAllData() async {
    await memory.clearAll();
    _messages = [];
    _tasks = [];
    lastResponse = null;
    notifyListeners();
  }

  Future<void> clearChatHistory() async {
    await memory.clearMessages();
    _messages = [];
    notifyListeners();
  }

  Future<void> clearAllTasks() async {
    await memory.clearTasks();
    _tasks = [];
    notifyListeners();
  }

  Future<void> clearMemoryFacts() async {
    await memory.clearFacts();
    notifyListeners();
  }
}
