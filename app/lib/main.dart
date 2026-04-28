import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import 'theme.dart';
import 'state/app_state.dart';
import 'screens/splash_screen.dart';
import 'screens/welcome_screen.dart';
import 'screens/personality_screen.dart';
import 'screens/permissions_screen.dart';
import 'screens/home_screen.dart';
import 'screens/tasks_screen.dart';
import 'screens/memory_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const SaathiApp());
}

class SaathiApp extends StatelessWidget {
  const SaathiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppState()..init(),
      child: Consumer<AppState>(
        builder: (context, state, _) {
          return MaterialApp(
            title: 'Saathi',
            debugShowCheckedModeBanner: false,
            theme: SaathiTheme.dark,
            initialRoute: _initialRoute(state),
            routes: {
              '/splash': (_) => const SplashScreen(),
              '/welcome': (_) => const WelcomeScreen(),
              '/personality': (_) => const PersonalityScreen(),
              '/permissions': (_) => const PermissionsScreen(),
              '/home': (_) => const HomeScreen(),
              '/tasks': (_) => const TasksScreen(),
              '/memory': (_) => const MemoryScreen(),
            },
          );
        },
      ),
    );
  }

  String _initialRoute(AppState state) {
    if (!state.ready) return '/splash';
    if (state.isOnboarded) return '/home';
    return '/splash';
  }
}
