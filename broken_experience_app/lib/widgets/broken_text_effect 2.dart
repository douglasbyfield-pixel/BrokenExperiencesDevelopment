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
    _originalCharacters = widget.text.split('');
    _currentCharacters = List.from(_originalCharacters);
    _isGlitching = List.filled(_originalCharacters.length, false);

    _controller = AnimationController(
      duration: widget.animationDuration,
      vsync: this,
    );

    _delayController = AnimationController(
      duration: widget.delayBetweenAnimations,
      vsync: this,
    );

    _animation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    _animation.addListener(_updateGlitch);
    _controller.addStatusListener(_onAnimationComplete);

    // Start the animation cycle
    _startAnimationCycle();
  }

  void _startAnimationCycle() async {
    while (mounted) {
      await Future.delayed(widget.delayBetweenAnimations);
      if (mounted) {
        _triggerGlitch();
      }
    }
  }

  void _triggerGlitch() {
    if (_controller.isAnimating) return;

    // Reset glitching states
    _isGlitching = List.filled(_originalCharacters.length, false);
    
    // Randomly select characters to glitch
    for (int i = 0; i < _originalCharacters.length; i++) {
      if (_originalCharacters[i] != ' ') {
        _isGlitching[i] = _random.nextDouble() < 0.6; // 60% chance to glitch
      }
    }

    _controller.forward(from: 0.0);
  }

  void _updateGlitch() {
    if (!mounted) return;
    
    setState(() {
      for (int i = 0; i < _originalCharacters.length; i++) {
        if (_isGlitching[i]) {
          if (_animation.value < 0.7) {
            // Glitch phase - show random characters
            _currentCharacters[i] = _getRandomGlitchChar();
          } else {
            // Recovery phase - gradually return to original
            double recoveryProgress = (_animation.value - 0.7) / 0.3;
            if (_random.nextDouble() < recoveryProgress) {
              _currentCharacters[i] = _originalCharacters[i];
            } else {
              _currentCharacters[i] = _getRandomGlitchChar();
            }
          }
        }
      }
    });
  }

  String _getRandomGlitchChar() {
    return _glitchCharacters[_random.nextInt(_glitchCharacters.length)];
  }

  void _onAnimationComplete(AnimationStatus status) {
    if (status == AnimationStatus.completed) {
      // Ensure all characters are back to original
      setState(() {
        _currentCharacters = List.from(_originalCharacters);
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _delayController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(
            (_animation.value < 0.7) 
                ? (_random.nextDouble() - 0.5) * widget.glitchIntensity * _animation.value
                : 0.0,
            (_animation.value < 0.7)
                ? (_random.nextDouble() - 0.5) * widget.glitchIntensity * _animation.value * 0.5
                : 0.0,
          ),
          child: RichText(
            text: TextSpan(
              children: _currentCharacters.asMap().entries.map((entry) {
                int index = entry.key;
                String char = entry.value;
                
                return TextSpan(
                  text: char,
                  style: (widget.style ?? Theme.of(context).textTheme.headlineSmall)?.copyWith(
                    color: _isGlitching[index] && _animation.value < 0.7
                        ? _getGlitchColor()
                        : null,
                    shadows: _isGlitching[index] && _animation.value < 0.7
                        ? [
                            Shadow(
                              color: Colors.red.withOpacity(0.7),
                              offset: const Offset(-1, 0),
                            ),
                            Shadow(
                              color: Colors.blue.withOpacity(0.7),
                              offset: const Offset(1, 0),
                            ),
                          ]
                        : null,
                  ),
                );
              }).toList(),
            ),
          ),
        );
      },
    );
  }

  Color _getGlitchColor() {
    List<Color> colors = [
      Colors.red,
      Colors.blue,
      Colors.green,
      Colors.purple,
      Colors.orange,
      Colors.cyan,
    ];
    return colors[_random.nextInt(colors.length)];
  }
}