import 'dart:convert';

class Message {
  final String role; // "user" | "assistant"
  final String content;
  final DateTime createdAt;
  final String mode; // "companion" | "action" | "mixed" | "user"

  Message({
    required this.role,
    required this.content,
    required this.createdAt,
    this.mode = 'user',
  });

  Map<String, dynamic> toJson() => {
        'role': role,
        'content': content,
        'createdAt': createdAt.toIso8601String(),
        'mode': mode,
      };

  factory Message.fromJson(Map<String, dynamic> j) => Message(
        role: j['role'] ?? 'user',
        content: j['content'] ?? '',
        createdAt: DateTime.tryParse(j['createdAt'] ?? '') ?? DateTime.now(),
        mode: j['mode'] ?? 'user',
      );

  String encode() => jsonEncode(toJson());
  static Message decode(String s) => Message.fromJson(jsonDecode(s));
}
