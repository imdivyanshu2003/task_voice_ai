import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme.dart';
import '../state/app_state.dart';
import '../widgets/mic_button.dart';
import '../widgets/chat_bubble.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ScrollController _scrollCtrl = ScrollController();
  final TextEditingController _textCtrl = TextEditingController();
  bool _showTextField = false;

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AppState>(
      builder: (context, state, _) {
        _scrollToBottom();
        return Scaffold(
          appBar: AppBar(
            title: Text(
              'Saathi',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.check_box_outlined),
                tooltip: 'Tasks',
                onPressed: () => Navigator.pushNamed(context, '/tasks'),
              ),
              IconButton(
                icon: const Icon(Icons.settings_outlined),
                tooltip: 'Memory',
                onPressed: () => Navigator.pushNamed(context, '/memory'),
              ),
            ],
          ),
          body: Column(
            children: [
              // ── Chat messages ──
              Expanded(
                child: state.messages.isEmpty
                    ? _buildEmptyState(context, state)
                    : ListView.builder(
                        controller: _scrollCtrl,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        itemCount: state.messages.length,
                        itemBuilder: (context, i) => ChatBubble(
                          message: state.messages[i],
                        ),
                      ),
              ),

              // ── Partial transcript while listening ──
              if (state.isListening && state.partialTranscript.isNotEmpty)
                Container(
                  width: double.infinity,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                  color: SaathiTheme.surfaceAlt,
                  child: Text(
                    state.partialTranscript,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: SaathiTheme.accent,
                          fontStyle: FontStyle.italic,
                        ),
                  ),
                ),

              // ── Last response tasks (quick view) ──
              if (state.lastResponse != null &&
                  state.lastResponse!.tasks.isNotEmpty &&
                  !state.isProcessing)
                Container(
                  width: double.infinity,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'New tasks added:',
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: SaathiTheme.success,
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                      const SizedBox(height: 4),
                      ...state.lastResponse!.tasks.take(4).map(
                            (t) => Padding(
                              padding: const EdgeInsets.only(bottom: 2),
                              child: Text(
                                '• ${t['title']}',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(color: SaathiTheme.muted),
                              ),
                            ),
                          ),
                      if (state.lastResponse!.nextSuggestion.isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Text(
                          state.lastResponse!.nextSuggestion,
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(color: SaathiTheme.primary),
                        ),
                      ],
                    ],
                  ),
                ).animate().fadeIn(duration: 300.ms),

              // ── Input area ──
              _buildInputArea(context, state),
            ],
          ),
        );
      },
    );
  }

  Widget _buildEmptyState(BuildContext context, AppState state) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: SaathiTheme.primary.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.mic_none_rounded,
                  size: 48, color: SaathiTheme.primary),
            ).animate().scale(duration: 600.ms, curve: Curves.easeOutBack),
            const SizedBox(height: 24),
            Text(
              'Bol ke dekho…',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ).animate().fadeIn(delay: 300.ms, duration: 400.ms),
            const SizedBox(height: 8),
            Text(
              'Tap the mic and start talking.\nSaathi will understand.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: SaathiTheme.muted,
                    height: 1.5,
                  ),
            ).animate().fadeIn(delay: 500.ms, duration: 400.ms),
          ],
        ),
      ),
    );
  }

  Widget _buildInputArea(BuildContext context, AppState state) {
    return Container(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        bottom: MediaQuery.of(context).padding.bottom + 16,
        top: 12,
      ),
      decoration: BoxDecoration(
        color: SaathiTheme.bg,
        border: Border(
          top: BorderSide(color: SaathiTheme.surfaceAlt, width: 1),
        ),
      ),
      child: Row(
        children: [
          // Toggle text input
          IconButton(
            icon: Icon(
              _showTextField ? Icons.mic_rounded : Icons.keyboard_rounded,
              color: SaathiTheme.muted,
            ),
            onPressed: () => setState(() => _showTextField = !_showTextField),
          ),
          if (_showTextField) ...[
            Expanded(
              child: TextField(
                controller: _textCtrl,
                style:
                    Theme.of(context).textTheme.bodyMedium?.copyWith(color: SaathiTheme.text),
                decoration: InputDecoration(
                  hintText: 'Type something…',
                  hintStyle: TextStyle(color: SaathiTheme.muted),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(28),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                  fillColor: SaathiTheme.surface,
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                ),
                onSubmitted: (t) {
                  if (t.trim().isNotEmpty) {
                    state.sendMessage(t.trim());
                    _textCtrl.clear();
                  }
                },
              ),
            ),
            const SizedBox(width: 8),
            IconButton(
              icon: const Icon(Icons.send_rounded, color: SaathiTheme.primary),
              onPressed: () {
                if (_textCtrl.text.trim().isNotEmpty) {
                  state.sendMessage(_textCtrl.text.trim());
                  _textCtrl.clear();
                }
              },
            ),
          ] else ...[
            const Spacer(),
            MicButton(
              isListening: state.isListening,
              isProcessing: state.isProcessing,
              onTap: () {
                if (state.isProcessing) return;
                if (state.isListening) {
                  state.stopListening();
                } else {
                  state.startListening();
                }
              },
            ),
            const Spacer(),
            const SizedBox(width: 48), // balance
          ],
        ],
      ),
    );
  }

  @override
  void dispose() {
    _scrollCtrl.dispose();
    _textCtrl.dispose();
    super.dispose();
  }
}
