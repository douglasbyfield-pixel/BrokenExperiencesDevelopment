import 'package:flutter/material.dart';
import 'dart:math' as math;

class ScreenCrackOverlay extends StatefulWidget {
  final Widget child;
  final bool isActive;
  final Duration animationDuration;

  const ScreenCrackOverlay({
    super.key,
    required this.child,
    this.isActive = false,
    this.animationDuration = const Duration(milliseconds: 500),
  });

  @override
  State<ScreenCrackOverlay> createState() => _ScreenCrackOverlayState();
}

class _ScreenCrackOverlayState extends State<ScreenCrackOverlay>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _crackAnimation;
  List<CrackLine> _cracks = [];
  math.Random _random = math.Random();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.animationDuration,
      vsync: this,
    );

    _crackAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );

    _generateCracks();
  }

  void _generateCracks() {
    _cracks.clear();
    final numCracks = 8 + _random.nextInt(5); // 8-12 cracks

    for (int i = 0; i < numCracks; i++) {
      _cracks.add(_generateCrackLine());
    }
  }

  CrackLine _generateCrackLine() {
    // Start from random edge point
    late Offset start;
    final edge = _random.nextInt(4);
    
    switch (edge) {
      case 0: // Top
        start = Offset(_random.nextDouble(), 0);
        break;
      case 1: // Right
        start = Offset(1, _random.nextDouble());
        break;
      case 2: // Bottom
        start = Offset(_random.nextDouble(), 1);
        break;
      case 3: // Left
        start = Offset(0, _random.nextDouble());
        break;
    }

    // Create branching crack
    final segments = <Offset>[];
    Offset current = start;
    segments.add(current);

    // Main crack line
    for (int i = 0; i < 5 + _random.nextInt(8); i++) {
      final angle = _random.nextDouble() * 2 * math.pi;
      final length = 0.05 + _random.nextDouble() * 0.15;
      
      current = Offset(
        (current.dx + math.cos(angle) * length).clamp(0.0, 1.0),
        (current.dy + math.sin(angle) * length).clamp(0.0, 1.0),
      );
      segments.add(current);
      
      // Random chance for branch
      if (_random.nextDouble() < 0.3) {
        final branchAngle = angle + (_random.nextDouble() - 0.5) * math.pi;
        final branchLength = 0.02 + _random.nextDouble() * 0.08;
        final branchEnd = Offset(
          (current.dx + math.cos(branchAngle) * branchLength).clamp(0.0, 1.0),
          (current.dy + math.sin(branchAngle) * branchLength).clamp(0.0, 1.0),
        );
        
        segments.add(branchEnd);
        segments.add(current); // Return to main line
      }
    }

    return CrackLine(
      segments: segments,
      opacity: 0.3 + _random.nextDouble() * 0.4,
      width: 0.5 + _random.nextDouble() * 1.5,
    );
  }

  @override
  void didUpdateWidget(ScreenCrackOverlay oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isActive != oldWidget.isActive) {
      if (widget.isActive) {
        _generateCracks();
        _controller.forward();
      } else {
        _controller.reverse();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        widget.child,
        if (widget.isActive)
          Positioned.fill(
            child: AnimatedBuilder(
              animation: _crackAnimation,
              builder: (context, child) {
                return CustomPaint(
                  painter: _CrackPainter(
                    cracks: _cracks,
                    progress: _crackAnimation.value,
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
}

class CrackLine {
  final List<Offset> segments;
  final double opacity;
  final double width;

  CrackLine({
    required this.segments,
    required this.opacity,
    required this.width,
  });
}

class _CrackPainter extends CustomPainter {
  final List<CrackLine> cracks;
  final double progress;

  _CrackPainter({
    required this.cracks,
    required this.progress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    for (final crack in cracks) {
      final paint = Paint()
        ..color = Colors.black.withOpacity(crack.opacity * progress)
        ..strokeWidth = crack.width
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round;

      final shadowPaint = Paint()
        ..color = Colors.grey.withOpacity(0.2 * progress)
        ..strokeWidth = crack.width + 1
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round;

      final path = Path();
      final shadowPath = Path();
      
      final visibleSegments = (crack.segments.length * progress).ceil();
      
      if (crack.segments.isNotEmpty && visibleSegments > 0) {
        final firstPoint = Offset(
          crack.segments[0].dx * size.width,
          crack.segments[0].dy * size.height,
        );
        
        path.moveTo(firstPoint.dx, firstPoint.dy);
        shadowPath.moveTo(firstPoint.dx + 1, firstPoint.dy + 1);
        
        for (int i = 1; i < visibleSegments && i < crack.segments.length; i++) {
          final point = Offset(
            crack.segments[i].dx * size.width,
            crack.segments[i].dy * size.height,
          );
          
          path.lineTo(point.dx, point.dy);
          shadowPath.lineTo(point.dx + 1, point.dy + 1);
        }
        
        // Draw shadow first
        canvas.drawPath(shadowPath, shadowPaint);
        // Draw crack
        canvas.drawPath(path, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _CrackPainter oldDelegate) {
    return progress != oldDelegate.progress || cracks != oldDelegate.cracks;
  }
}