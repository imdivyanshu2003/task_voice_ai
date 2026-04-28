import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme.dart';
import '../state/app_state.dart';
import '../models/personality.dart';

class MemoryScreen extends StatelessWidget {
  const MemoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AppState>(
      builder: (context, state, _) {
        final facts = state.memory.getFacts();
        final currentP = kPersonalities.firstWhere(
          (p) => p.key == state.personality,
          orElse: () => kPersonalities.first,
        );

        return Scaffold(
          appBar: AppBar(
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded),
              onPressed: () => Navigator.pop(context),
            ),
            title: Text(
              'Memory & Settings',
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.w700),
            ),
          ),
          body: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              // ── Current personality ──
              _card(
                context,
                icon: Icons.person_outline_rounded,
                title: 'Personality',
                subtitle: '${currentP.emoji} ${currentP.name}',
                trailing: TextButton(
                  onPressed: () => _showPersonalityPicker(context, state),
                  child: const Text('Change'),
                ),
              ),
              const SizedBox(height: 14),

              // ── Stats ──
              _card(
                context,
                icon: Icons.insights_rounded,
                title: 'Stats',
                subtitle:
                    '${state.messages.length} messages • ${state.tasksTotal} tasks',
              ),
              const SizedBox(height: 14),

              // ── Saved facts ──
              _card(
                context,
                icon: Icons.psychology_outlined,
                title: 'What Saathi remembers',
                subtitle: facts.isEmpty
                    ? 'Nothing saved yet.'
                    : facts.take(5).join('\n'),
              ),
              const SizedBox(height: 28),

              // ── Danger zone ──
              Text(
                'Privacy Controls',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: SaathiTheme.accent,
                    ),
              ),
              const SizedBox(height: 12),
              _dangerButton(
                context,
                label: 'Clear chat history',
                onTap: () => _confirm(context, 'Clear all chat messages?', () {
                  state.clearChatHistory();
                }),
              ),
              _dangerButton(
                context,
                label: 'Clear all tasks',
                onTap: () => _confirm(context, 'Delete all tasks?', () {
                  state.clearAllTasks();
                }),
              ),
              _dangerButton(
                context,
                label: 'Clear memory (what Saathi knows)',
                onTap: () => _confirm(
                  context,
                  'Saathi will forget everything about you. Continue?',
                  () => state.clearMemoryFacts(),
                ),
              ),
              _dangerButton(
                context,
                label: 'Delete ALL data',
                destructive: true,
                onTap: () => _confirm(
                  context,
                  'This erases everything — chats, tasks, memory. Cannot undo.',
                  () => state.clearAllData(),
                ),
              ),
              const SizedBox(height: 40),

              // ── Trust message ──
              Center(
                child: Text(
                  'Your data stays on this device.\nNo tracking. No creepy stuff.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: SaathiTheme.muted,
                        height: 1.5,
                      ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _card(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    Widget? trailing,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: SaathiTheme.surface,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: SaathiTheme.primary, size: 22),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context)
                      .textTheme
                      .titleSmall
                      ?.copyWith(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(color: SaathiTheme.muted, height: 1.4),
                ),
              ],
            ),
          ),
          if (trailing != null) trailing,
        ],
      ),
    );
  }

  Widget _dangerButton(
    BuildContext context, {
    required String label,
    required VoidCallback onTap,
    bool destructive = false,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: OutlinedButton(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          foregroundColor: destructive ? Colors.red : SaathiTheme.muted,
          side: BorderSide(
            color: destructive ? Colors.red.withOpacity(0.4) : SaathiTheme.surfaceAlt,
          ),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        ),
        child: Align(
          alignment: Alignment.centerLeft,
          child: Text(label),
        ),
      ),
    );
  }

  void _confirm(BuildContext context, String message, VoidCallback onYes) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: SaathiTheme.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Are you sure?'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              onYes();
            },
            child: const Text('Yes', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _showPersonalityPicker(BuildContext context, AppState state) {
    showModalBottomSheet(
      context: context,
      backgroundColor: SaathiTheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Choose Personality',
              style: Theme.of(context)
                  .textTheme
                  .titleMedium
                  ?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 16),
            ...kPersonalities.map(
              (p) => ListTile(
                leading: Text(p.emoji, style: const TextStyle(fontSize: 28)),
                title: Text(p.name),
                subtitle: Text(p.tagline,
                    style: const TextStyle(color: SaathiTheme.muted, fontSize: 12)),
                trailing: p.key == state.personality
                    ? const Icon(Icons.check_circle, color: SaathiTheme.primary)
                    : null,
                onTap: () {
                  state.selectPersonality(p.key);
                  Navigator.pop(context);
                },
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
