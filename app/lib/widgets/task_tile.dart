import 'package:flutter/material.dart';
import '../theme.dart';
import '../models/task.dart';

class TaskTile extends StatelessWidget {
  final TaskItem task;
  final VoidCallback onToggle;
  final VoidCallback? onDelete;

  const TaskTile({
    super.key,
    required this.task,
    required this.onToggle,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: Key(task.id),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => onDelete?.call(),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: Colors.red.withOpacity(0.2),
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Icon(Icons.delete_outline, color: Colors.red),
      ),
      child: GestureDetector(
        onTap: onToggle,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: SaathiTheme.surface,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 26,
                height: 26,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: task.done
                      ? SaathiTheme.success
                      : Colors.transparent,
                  border: Border.all(
                    color: task.done ? SaathiTheme.success : SaathiTheme.muted,
                    width: 2,
                  ),
                ),
                child: task.done
                    ? const Icon(Icons.check, size: 16, color: Colors.white)
                    : null,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      task.title,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            decoration: task.done
                                ? TextDecoration.lineThrough
                                : null,
                            color: task.done
                                ? SaathiTheme.muted
                                : SaathiTheme.text,
                          ),
                    ),
                    if (task.detail.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        task.detail,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: SaathiTheme.muted,
                            ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
