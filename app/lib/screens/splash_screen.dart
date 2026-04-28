import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 2200), () {
      if (!mounted) return;
      Navigator.of(context).pushReplacementNamed('/welcome');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [SaathiTheme.primary, SaathiTheme.accent],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: const Icon(Icons.auto_awesome, size: 48, color: Colors.white),
            )
                .animate()
                .scale(duration: 600.ms, curve: Curves.easeOutBack)
                .fadeIn(duration: 400.ms),
            const SizedBox(height: 28),
            Text(
              'Saathi',
              style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.5,
                  ),
            ).animate().fadeIn(delay: 400.ms, duration: 500.ms),
            const SizedBox(height: 8),
            Text(
              'Talk. Understand. Act.',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: SaathiTheme.muted,
                    letterSpacing: 0.8,
                  ),
            ).animate().fadeIn(delay: 700.ms, duration: 500.ms),
          ],
        ),
      ),
    );
  }
}
