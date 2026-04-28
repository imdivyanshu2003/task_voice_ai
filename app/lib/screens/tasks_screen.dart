import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme.dart';
import '../state/app_state.dart';
import '../widgets/task_tile.dart';

class TasksScreen extends StatelessWidget {
  const TasksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AppState>(
      builder: (context, state, _) {
        final pending = state.tasks.where((t) => !t.done).toList();
        final done = state.tasks.where((t) => t.done).toList();
        final progress = state.tasksTotal > 0
            ? state.tasksDoneCount / state.tasksTotal
            : 0.0;

        return Scaffold(
          appBar: AppBar(
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded),
              onPressed: () => Navigator.pop(context),
            ),
            title: Text(
              'Tasks',
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.w700),
            ),
            actions: [
              if (state.tasksTotal > 0)
                IconButton(
                  icon: const Icon(Icons.delete_sweep_outlined),
                  tooltip: 'Clear done tasks',
                  onPressed: () async {
                    for (final t in done) {
                      await state.deleteTask(t.id);
                    }
                  },
                ),
            ],
          ),
          body: state.tasks.isEmpty
              ? Center(
                  child: Text(
                    'No tasks yet.\nTalk to Saathi to get started.',
                    textAlign: TextAlign.center,
                    style: Theme.of(context)
                        .textTheme
                        .bodyLarge
                        ?.copyWith(color: SaathiTheme.muted),
                  ),
                )
              : ListView(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  children: [
                    // Progress bar
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: SaathiTheme.surface,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                'Progress',
                                style: Theme.of(context)
                                    .textTheme
                                    .titleSmall
                                    ?.copyWith(fontWeight: FontWeight.w600),
                              ),
                              const Spacer(),
                              Text(
                                '${state.tasksDoneCount}/${state.tasksTotal}',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(color: SaathiTheme.muted),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: LinearProgressIndicator(
                              value: progress,
                              minHeight: 8,
                              backgroundColor: SaathiTheme.surfaceAlt,
                              valueColor: const AlwaysStoppedAnimation(
                                  SaathiTheme.success),
                            ),
                          ),
                        ],
                      ),
                    ).animate().fadeIn(duration: 300.ms),
                    const SizedBox(height: 20),

                    // Pending
                    if (pending.isNotEmpty) ...[
                      _sectionLabel(context, 'To Do', pending.length),
                      const SizedBox(height: 8),
                      ...pending.map(
                        (t) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: TaskTile(
                            task: t,
                            onToggle: () => state.toggleTask(t.id),
                            onDelete: () => state.deleteTask(t.id),
                          ),
                        ),
                      ),
                    ],

                    // Done
                    if (done.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      _sectionLabel(context, 'Done', done.length),
                      const SizedBox(height: 8),
                      ...done.map(
                        (t) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: TaskTile(
                            task: t,
                            onToggle: () => state.toggleTask(t.id),
                            onDelete: () => state.deleteTask(t.id),
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 40),
                  ],
                ),
        );
      },
    );
  }

  Widget _sectionLabel(BuildContext context, String label, int count) {
    return Text(
      '$label ($count)',
      style: Theme.of(context).textTheme.labelLarge?.copyWith(
            color: SaathiTheme.muted,
            fontWeight: FontWeight.w600,
          ),
    );
  }
}
