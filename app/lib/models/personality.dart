import 'package:flutter/material.dart';

class Personality {
  final String key;
  final String name;
  final String tagline;
  final String emoji;
  final Color tint;

  const Personality({
    required this.key,
    required this.name,
    required this.tagline,
    required this.emoji,
    required this.tint,
  });
}

const List<Personality> kPersonalities = [
  Personality(
    key: 'friend',
    name: 'Friend',
    tagline: 'Warm, real, no judgement.',
    emoji: '🤝',
    tint: Color(0xFFFFB48A),
  ),
  Personality(
    key: 'mentor',
    name: 'Mentor',
    tagline: 'Calm, sharp, asks the right question.',
    emoji: '🧠',
    tint: Color(0xFFB39DFF),
  ),
  Personality(
    key: 'bhakti',
    name: 'Bhakti Guide',
    tagline: 'Gentle, reflective, rooted.',
    emoji: '🙏',
    tint: Color(0xFFFFD479),
  ),
  Personality(
    key: 'hustler',
    name: 'Hustler Coach',
    tagline: 'Direct, action-first, ship it.',
    emoji: '🚀',
    tint: Color(0xFF7BD389),
  ),
];
