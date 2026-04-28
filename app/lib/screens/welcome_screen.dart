import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Spacer(flex: 2),
              Text(
                'This is not\njust AI.',
                style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                      fontWeight: FontWeight.w800,
                      height: 1.15,
                    ),
              ).animate().fadeIn(duration: 500.ms).slideX(begin: -0.05),
              const SizedBox(height: 16),
              Text(
                'This understands you.\nAnd helps you move forward.',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: SaathiTheme.muted,
                      height: 1.5,
                    ),
              ).animate().fadeIn(delay: 300.ms, duration: 500.ms),
              const Spacer(flex: 3),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pushReplacementNamed(context, '/personality'),
                  child: const Text('Start'),
                ),
              ).animate().fadeIn(delay: 600.ms, duration: 400.ms).slideY(begin: 0.1),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
