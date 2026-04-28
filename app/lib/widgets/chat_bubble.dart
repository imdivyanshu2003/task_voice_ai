import 'package:flutter/material.dart';
import '../theme.dart';
import '../models/message.dart';

class ChatBubble extends StatelessWidget {
  final Message message;

  const ChatBubble({super.key, required this.message});

  bool get _isUser => message.role == 'user';

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: _isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.78,
        ),
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: _isUser
              ? SaathiTheme.primary.withOpacity(0.18)
              : SaathiTheme.surfaceAlt,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: Radius.circular(_isUser ? 18 : 4),
            bottomRight: Radius.circular(_isUser ? 4 : 18),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!_isUser && message.mode != 'user')
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      message.mode == 'companion'
                          ? Icons.favorite_rounded
                          : message.mode == 'action'
                              ? Icons.bolt_rounded
                              : Icons.auto_awesome,
                      size: 14,
                      color: message.mode == 'companion'
                          ? SaathiTheme.accent
                          : SaathiTheme.success,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      message.mode == 'companion'
                          ? 'companion'
                          : message.mode == 'action'
                              ? 'action'
                              : 'mixed',
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: SaathiTheme.muted,
                            fontSize: 10,
                          ),
                    ),
                  ],
                ),
              ),
            Text(
              message.content,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: SaathiTheme.text,
                    height: 1.4,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
