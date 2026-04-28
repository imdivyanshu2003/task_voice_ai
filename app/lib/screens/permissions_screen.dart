import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme.dart';
import '../state/app_state.dart';

class PermissionsScreen extends StatefulWidget {
  const PermissionsScreen({super.key});

  @override
  State<PermissionsScreen> createState() => _PermissionsScreenState();
}

class _PermissionsScreenState extends State<PermissionsScreen> {
  bool _micGranted = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Spacer(),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: SaathiTheme.primary.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.mic_none_rounded, size: 48, color: SaathiTheme.primary),
              ).animate().scale(duration: 500.ms, curve: Curves.easeOutBack),
              const SizedBox(height: 32),
              Text(
                'One permission\nto start.',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                      height: 1.15,
                    ),
              ).animate().fadeIn(delay: 200.ms, duration: 400.ms),
              const SizedBox(height: 12),
              Text(
                'Saathi needs your microphone to listen.\nYour data stays private — always.',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: SaathiTheme.muted,
                      height: 1.5,
                    ),
              ).animate().fadeIn(delay: 400.ms, duration: 400.ms),
              const Spacer(flex: 2),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _handlePermission,
                  child: Text(_micGranted ? 'Let\'s go!' : 'Allow Microphone'),
                ),
              ).animate().fadeIn(delay: 600.ms, duration: 400.ms),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handlePermission() async {
    if (_micGranted) {
      _proceed();
      return;
    }

    final status = await Permission.microphone.request();
    if (status.isGranted) {
      setState(() => _micGranted = true);
      _proceed();
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Microphone permission is needed to use voice.')),
      );
    }
  }

  void _proceed() async {
    final state = context.read<AppState>();
    await state.completeOnboarding();
    // Reinit voice after permission granted
    await state.voice.init();
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, '/home');
  }
}
