import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'dart:ui' as ui;

class BrokenTextEffect extends StatefulWidget {
  final String text;
  final TextStyle? style;
  final Duration animationDuration;
  final Duration delayBetweenAnimations;
  final double breakIntensity;

  const BrokenTextEffect({
    super.key,
    required this.text,
    this.style,
    this.animationDuration = const Duration(milliseconds: 800),
    this.delayBetweenAnimations = const Duration(seconds: 4),
    this.breakIntensity = 20.0,
  });

  @override
  State<BrokenTextEffect> createState() => _BrokenTextEffectState();
}

class CharacterFragment {
  final String character;
  final Offset originalPosition;
  Offset currentPosition;
  Offset velocity;
  double rotation;
  double rotationSpeed;
  double opacity;
  bool isActive;

  CharacterFragment({
    required this.character,
    required this.originalPosition,
  }) : currentPosition = originalPosition,
       velocity = Offset.zero,
       rotation = 0.0,
       rotationSpeed = 0.0,
       opacity = 1.0,
       isActive = false;
}

class _BrokenTextEffectState extends State<BrokenTextEffect>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _breakAnimation;
  late Animation<double> _rebuildAnimation;
  List<CharacterFragment> _fragments = [];
  math.Random _random = math.Random();
  bool _isBroken = false;

  @override
  void initState() {
    super.initState();
    
    _controller = AnimationController(
      duration: widget.animationDuration,
      vsync: this,
    );

    _breakAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.4, curve: Curves.easeInQuart),
      ),
    );

    _rebuildAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.6, 1.0, curve: Curves.easeOutBack),
      ),
    );

    _controller.addListener(_updateAnimation);
    _controller.addStatusListener(_onAnimationComplete);

    _initializeFragments();
    _startAnimationCycle();
  }

  void _initializeFragments() {
    _fragments.clear();
    // We'll calculate positions in the build method when we have context
  }

  void _startAnimationCycle() async {
    while (mounted) {
      await Future.delayed(widget.delayBetweenAnimations);
      if (mounted) {
        _triggerBreak();
      }
    }
  }

  void _triggerBreak() {
    if (_controller.isAnimating) return;
    _createFragments();
    _controller.forward(from: 0.0);
  }

  void _createFragments() {
    if (_fragments.isEmpty) return;
    
    for (int i = 0; i < _fragments.length; i++) {
      final fragment = _fragments[i];
      if (fragment.character.trim().isNotEmpty) {
        fragment.isActive = _random.nextDouble() < 0.8; // 80% chance to break
        if (fragment.isActive) {
          // Set random break velocity
          fragment.velocity = Offset(
            (_random.nextDouble() - 0.5) * widget.breakIntensity,
            (_random.nextDouble() - 0.5) * widget.breakIntensity,
          );
          fragment.rotationSpeed = (_random.nextDouble() - 0.5) * 10.0;
        }
      }
    }
  }

  void _updateAnimation() {
    if (!mounted) return;
    
    setState(() {
      final breakProgress = _breakAnimation.value;
      final rebuildProgress = _rebuildAnimation.value;
      
      for (final fragment in _fragments) {
        if (!fragment.isActive) continue;
        
        if (breakProgress > 0 && rebuildProgress == 0) {
          // Breaking phase
          fragment.currentPosition = fragment.originalPosition + (fragment.velocity * breakProgress);
          fragment.rotation += fragment.rotationSpeed * breakProgress;
          fragment.opacity = 1.0 - (breakProgress * 0.7);
        } else if (rebuildProgress > 0) {
          // Rebuilding phase
          final targetPosition = fragment.originalPosition;
          fragment.currentPosition = Offset.lerp(
            fragment.currentPosition,
            targetPosition,
            rebuildProgress,
          )!;
          fragment.rotation = fragment.rotation * (1.0 - rebuildProgress);
          fragment.opacity = 0.3 + (rebuildProgress * 0.7);
        }
      }
    });
  }

  void _onAnimationComplete(AnimationStatus status) {
    if (status == AnimationStatus.completed) {
      setState(() {
        for (final fragment in _fragments) {
          fragment.currentPosition = fragment.originalPosition;
          fragment.rotation = 0.0;
          fragment.opacity = 1.0;
          fragment.isActive = false;
        }
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return CustomPaint(
          painter: _BrokenTextPainter(
            text: widget.text,
            style: widget.style ?? Theme.of(context).textTheme.headlineSmall!,
            fragments: _fragments,
            onFragmentsInitialized: (fragments) {
              if (_fragments.isEmpty) {
                setState(() {
                  _fragments = fragments;
                });
              }
            },
          ),
          child: Container(
            width: constraints.maxWidth,
            height: (widget.style?.fontSize ?? 24) * 1.5,
          ),
        );
      },
    );
  }
}

class _BrokenTextPainter extends CustomPainter {
  final String text;
  final TextStyle style;
  final List<CharacterFragment> fragments;
  final Function(List<CharacterFragment>) onFragmentsInitialized;

  _BrokenTextPainter({
    required this.text,
    required this.style,
    required this.fragments,
    required this.onFragmentsInitialized,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final textPainter = TextPainter(
      textDirection: TextDirection.ltr,
    );

    if (fragments.isEmpty) {
      _initializeFragments(size);
      return;
    }

    // Draw fragments
    for (final fragment in fragments) {
      if (fragment.character.trim().isEmpty) continue;

      textPainter.text = TextSpan(
        text: fragment.character,
        style: style.copyWith(
          color: style.color?.withOpacity(fragment.opacity),
        ),
      );
      textPainter.layout();

      canvas.save();
      canvas.translate(fragment.currentPosition.dx, fragment.currentPosition.dy);
      canvas.rotate(fragment.rotation);
      
      // Add broken effect with cracks
      if (fragment.isActive) {
        final paint = Paint()
          ..color = Colors.red.withOpacity(0.3)
          ..strokeWidth = 1.0
          ..style = PaintingStyle.stroke;
          
        // Draw crack lines through the character
        final random = math.Random(fragment.character.hashCode);
        for (int i = 0; i < 3; i++) {
          final start = Offset(
            random.nextDouble() * textPainter.width,
            random.nextDouble() * textPainter.height,
          );
          final end = Offset(
            random.nextDouble() * textPainter.width,
            random.nextDouble() * textPainter.height,
          );
          canvas.drawLine(start, end, paint);
        }
      }
      
      textPainter.paint(canvas, Offset.zero);
      canvas.restore();
    }
  }

  void _initializeFragments(Size size) {
    final fragmentList = <CharacterFragment>[];
    final textPainter = TextPainter(textDirection: TextDirection.ltr);
    
    double currentX = 0;
    const double baseY = 0;
    
    for (int i = 0; i < text.length; i++) {
      final char = text[i];
      
      textPainter.text = TextSpan(text: char, style: style);
      textPainter.layout();
      
      fragmentList.add(CharacterFragment(
        character: char,
        originalPosition: Offset(currentX, baseY),
      ));
      
      currentX += textPainter.width;
    }
    
    onFragmentsInitialized(fragmentList);
  }

  @override
  bool shouldRepaint(covariant _BrokenTextPainter oldDelegate) {
    return fragments != oldDelegate.fragments || text != oldDelegate.text;
  }
}