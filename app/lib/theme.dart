import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class SaathiTheme {
  // Warm, calm palette — emotional + premium feel.
  static const Color bg = Color(0xFF0E0B1A);
  static const Color surface = Color(0xFF1A1530);
  static const Color surfaceAlt = Color(0xFF231C40);
  static const Color primary = Color(0xFFB39DFF); // soft lavender
  static const Color accent = Color(0xFFFFB48A); // warm peach
  static const Color text = Color(0xFFF5F2FF);
  static const Color muted = Color(0xFF9C95B8);
  static const Color success = Color(0xFF7BD389);

  static ThemeData get dark {
    final base = ThemeData.dark(useMaterial3: true);
    return base.copyWith(
      scaffoldBackgroundColor: bg,
      colorScheme: const ColorScheme.dark(
        surface: surface,
        primary: primary,
        secondary: accent,
        onSurface: text,
      ),
      textTheme: GoogleFonts.interTextTheme(base.textTheme).apply(
        bodyColor: text,
        displayColor: text,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.black,
          minimumSize: const Size.fromHeight(56),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 16),
        ),
      ),
      cardTheme: CardTheme(
        color: surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        elevation: 0,
      ),
    );
  }
}
