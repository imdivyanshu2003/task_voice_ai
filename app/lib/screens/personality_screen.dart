import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme.dart';
import '../models/personality.dart';
import '../state/app_state.dart';

class PersonalityScreen extends StatefulWidget {
  const PersonalityScreen({super.key});

  @override
  State<PersonalityScreen> createState() => _PersonalityScreenState();
}

class _PersonalityScreenState extends State<PersonalityScreen> {
  String _selected = 'friend';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Choose your\nSaathi',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                      height: 1.15,
                    ),
              ).animate().fadeIn(duration: 400.ms),
              const SizedBox(height: 8),
              Text(
                'This shapes how your AI talks to you.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: SaathiTheme.muted,
                    ),
              ),
              const SizedBox(height: 32),
              Expanded(
                child: ListView.separated(
                  itemCount: kPersonalities.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 14),
                  itemBuilder: (context, i) {
                    final p = kPersonalities[i];
                    final chosen = p.key == _selected;
                    return GestureDetector(
                      onTap: () => setState(() => _selected = p.key),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: chosen
                              ? p.tint.withOpacity(0.15)
                              : SaathiTheme.surface,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: chosen ? p.tint : Colors.transparent,
                            width: 2,
                          ),
                        ),
                        child: Row(
                          children: [
                            Text(p.emoji, style: const TextStyle(fontSize: 32)),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    p.name,
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleMedium
                                        ?.copyWith(fontWeight: FontWeight.w700),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    p.tagline,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(color: SaathiTheme.muted),
                                  ),
                                ],
                              ),
                            ),
                            if (chosen)
                              Icon(Icons.check_circle, color: p.tint, size: 28),
                          ],
                        ),
                      ),
                    ).animate().fadeIn(delay: (100 * i).ms, duration: 400.ms).slideX(begin: 0.05);
                  },
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    final state = context.read<AppState>();
                    await state.selectPersonality(_selected);
                    if (!context.mounted) return;
                    Navigator.pushReplacementNamed(context, '/permissions');
                  },
                  child: const Text('Continue'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
