import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';

class ChatResponse {
  final String mode;
  final String emotionalResponse;
  final List<Map<String, String>> tasks;
  final String nextSuggestion;

  ChatResponse({
    required this.mode,
    required this.emotionalResponse,
    required this.tasks,
    required this.nextSuggestion,
  });

  factory ChatResponse.fromJson(Map<String, dynamic> j) {
    final rawTasks = (j['tasks'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    return ChatResponse(
      mode: j['mode'] ?? 'companion',
      emotionalResponse: j['emotional_response'] ?? '',
      tasks: rawTasks
          .map((t) => {
            return {
              'title': (t['title'] ?? '').toString(),
              'detail': (t['detail'] ?? '').toString(),
            };
          })
          .toList(),
      nextSuggestion: j['next_suggestion'] ?? '',
    );
  }
}

class ApiService {
  final String baseUrl;

  ApiService({String? baseUrl}) : baseUrl = baseUrl ?? kApiBaseUrl;

  Future<ChatResponse> chat({
    required String transcript,
    String personality = 'friend',
    List<Map<String, String>> history = const [],
    String memory = '',
  }) async {
    final uri = Uri.parse('$baseUrl/chat');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'transcript': transcript,
        'personality': personality,
        'history': history,
        'memory': memory,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Backend error ${response.statusCode}: ${response.body}');
    }

    return ChatResponse.fromJson(jsonDecode(response.body));
  }

  Future<bool> healthCheck() async {
    try {
      final resp = await http
          .get(Uri.parse('$baseUrl/health'))
          .timeout(const Duration(seconds: 5));
      return resp.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
