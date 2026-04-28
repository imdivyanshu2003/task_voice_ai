import 'dart:convert';

class TaskItem {
  final String id;
  final String title;
  final String detail;
  bool done;
  final DateTime createdAt;

  TaskItem({
    String? id,
    required this.title,
    this.detail = '',
    this.done = false,
    DateTime? createdAt,
  })  : id = id ?? DateTime.now().microsecondsSinceEpoch.toString(),
        createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'detail': detail,
        'done': done,
        'createdAt': createdAt.toIso8601String(),
      };

  factory TaskItem.fromJson(Map<String, dynamic> j) => TaskItem(
        id: j['id'],
        title: j['title'] ?? '',
        detail: j['detail'] ?? '',
        done: j['done'] ?? false,
        createdAt: DateTime.tryParse(j['createdAt'] ?? '') ?? DateTime.now(),
      );

  String encode() => jsonEncode(toJson());
  static TaskItem decode(String s) => TaskItem.fromJson(jsonDecode(s));
}
