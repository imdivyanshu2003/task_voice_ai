import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme.dart';

class MicButton extends StatelessWidget {
  final bool isListening;
  final bool isProcessing;
  final VoidCallback onTap;

  const MicButton({
    super.key,
    required this.isListening,
    required this.isProcessing,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        width: isListening ? 96 : 80,
        height: isListening ? 96 : 80,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(
            colors: isListening
                ? [const Color(0xFFFF6B6B), const Color(0xFFFF8E53)]
                : [SaathiTheme.primary, SaathiTheme.accent],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          boxShadow: [
            BoxShadow(
              color: (isListening ? const Color(0xFFFF6B6B) : SaathiTheme.primary)
                  .withOpacity(0.35),
              blurRadius: isListening ? 30 : 16,
              spreadRadius: isListening ? 4 : 0,
            ),
          ],
        ),
        child: isProcessing
            ? const Padding(
                padding: EdgeInsets.all(24),
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 3,
                ),
              )
            : Icon(
                isListening ? Icons.stop_rounded : Icons.mic_rounded,
                color: Colors.white,
                size: 36,
              ),
      ),
    );
  }
}
