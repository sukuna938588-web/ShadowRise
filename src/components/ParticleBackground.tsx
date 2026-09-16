import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  baseOpacity: number;
  color: string;
  glowColor: string;
  layer: 1 | 2 | 3; // 1 = deep background, 2 = midground ash, 3 = foreground spark
  wobbleSpeed: number;
  wobbleAngle: number;
}

interface ManaOrb {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  angle: number;
  pulseSpeed: number;
  trail: { x: number; y: number }[];
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [isLowPower] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // DPR clamping for optimal mobile performance
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    // Parallax tracking
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = width / 2;
      const centerY = height / 2;
      mouseRef.current.targetX = (e.clientX - centerX) / centerX;
      mouseRef.current.targetY = (e.clientY - centerY) / centerY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const centerX = width / 2;
        const centerY = height / 2;
        mouseRef.current.targetX = (touch.clientX - centerX) / centerX;
        mouseRef.current.targetY = (touch.clientY - centerY) / centerY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Multi-layer particle pools
    const particleCount = isLowPower ? 40 : 85;
    const particles: Particle[] = [];

    const layerColors = {
      1: ['#6b21a8', '#3b82f6', '#4c1d95', '#1e1b4b'], // Deep star dust
      2: ['#a855f7', '#60a5fa', '#818cf8', '#c084fc'], // Midground mana embers
      3: ['#e9d5ff', '#93c5fd', '#38bdf8', '#f3e8ff'], // Foreground bright sparks
    };

    for (let i = 0; i < particleCount; i++) {
      const layer = i < particleCount * 0.45 ? 1 : i < particleCount * 0.8 ? 2 : 3;
      const palette = layerColors[layer];
      const color = palette[Math.floor(Math.random() * palette.length)];

      const size =
        layer === 1
          ? Math.random() * 1.5 + 0.5
          : layer === 2
          ? Math.random() * 2.8 + 1.2
          : Math.random() * 3.5 + 1.8;

      const speedY =
        layer === 1
          ? -(Math.random() * 0.2 + 0.08)
          : layer === 2
          ? -(Math.random() * 0.5 + 0.2)
          : -(Math.random() * 0.9 + 0.4);

      const opacity =
        layer === 1
          ? Math.random() * 0.35 + 0.15
          : layer === 2
          ? Math.random() * 0.5 + 0.25
          : Math.random() * 0.7 + 0.3;

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        speedY,
        speedX: (Math.random() - 0.5) * 0.2,
        opacity,
        baseOpacity: opacity,
        color,
        glowColor: layer === 3 ? '#c084fc' : color,
        layer,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
        wobbleAngle: Math.random() * Math.PI * 2,
      });
    }

    // Floating Mana Orbs
    const manaOrbs: ManaOrb[] = [
      {
        x: width * 0.25,
        y: height * 0.3,
        radius: 120,
        color: 'rgba(139, 92, 246, 0.16)',
        vx: 0.35,
        vy: 0.25,
        angle: 0,
        pulseSpeed: 0.015,
        trail: [],
      },
      {
        x: width * 0.75,
        y: height * 0.65,
        radius: 140,
        color: 'rgba(59, 130, 246, 0.14)',
        vx: -0.28,
        vy: -0.32,
        angle: Math.PI / 2,
        pulseSpeed: 0.012,
        trail: [],
      },
      {
        x: width * 0.5,
        y: height * 0.85,
        radius: 100,
        color: 'rgba(168, 85, 247, 0.12)',
        vx: 0.2,
        vy: -0.2,
        angle: Math.PI,
        pulseSpeed: 0.018,
        trail: [],
      },
      {
        x: width * 0.8,
        y: height * 0.2,
        radius: 90,
        color: 'rgba(6, 182, 212, 0.10)',
        vx: -0.25,
        vy: 0.22,
        angle: (Math.PI * 3) / 2,
        pulseSpeed: 0.014,
        trail: [],
      },
    ];

    let time = 0;
    let isTabActive = true;

    const handleVisibility = () => {
      isTabActive = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Render loop
    const render = () => {
      if (!isTabActive) {
        animId = requestAnimationFrame(render);
        return;
      }

      time += 0.012;

      // Smooth mouse parallax lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      // Ambient subtle organic drift even if no mouse movement
      const ambientFloatX = Math.sin(time * 0.5) * 0.15;
      const ambientFloatY = Math.cos(time * 0.4) * 0.15;

      const parallaxX = mouseRef.current.x + ambientFloatX;
      const parallaxY = mouseRef.current.y + ambientFloatY;

      // Clear with dark fantasy nebula gradient
      ctx.fillStyle = '#06060c';
      ctx.fillRect(0, 0, width, height);

      // Ethereal nebula backdrop
      const nebulaGrad = ctx.createRadialGradient(
        width * 0.5 + parallaxX * 25,
        height * 0.35 + parallaxY * 25,
        20,
        width * 0.5,
        height * 0.5,
        width * 0.85
      );
      nebulaGrad.addColorStop(0, 'rgba(30, 10, 60, 0.45)');
      nebulaGrad.addColorStop(0.4, 'rgba(15, 23, 42, 0.3)');
      nebulaGrad.addColorStop(0.8, 'rgba(10, 8, 20, 0.6)');
      nebulaGrad.addColorStop(1, 'rgba(6, 6, 12, 0.95)');
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, width, height);

      // Render Floating Mana Orbs & Energy Trails
      manaOrbs.forEach((orb) => {
        orb.x += orb.vx + Math.sin(time + orb.angle) * 0.4;
        orb.y += orb.vy + Math.cos(time + orb.angle) * 0.4;
        orb.angle += orb.pulseSpeed;

        // Bounce gently inside canvas bounds
        if (orb.x < -orb.radius) orb.x = width + orb.radius;
        if (orb.x > width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = height + orb.radius;
        if (orb.y > height + orb.radius) orb.y = -orb.radius;

        // Record energy trail points
        orb.trail.unshift({ x: orb.x, y: orb.y });
        if (orb.trail.length > 18) orb.trail.pop();

        // Draw curved energy trail
        if (orb.trail.length > 2) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(orb.trail[0].x, orb.trail[0].y);
          for (let t = 1; t < orb.trail.length - 1; t++) {
            const xc = (orb.trail[t].x + orb.trail[t + 1].x) / 2;
            const yc = (orb.trail[t].y + orb.trail[t + 1].y) / 2;
            ctx.quadraticCurveTo(orb.trail[t].x, orb.trail[t].y, xc, yc);
          }
          ctx.strokeStyle = orb.color;
          ctx.lineWidth = 14;
          ctx.lineCap = 'round';
          ctx.shadowColor = orb.color;
          ctx.shadowBlur = 30;
          ctx.globalAlpha = 0.5;
          ctx.stroke();
          ctx.restore();
        }

        // Draw pulsating mana orb
        const pulse = Math.sin(orb.angle) * 15;
        const currentRadius = Math.max(10, orb.radius + pulse);
        const orbGrad = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          currentRadius
        );
        orbGrad.addColorStop(0, orb.color);
        orbGrad.addColorStop(0.5, orb.color.replace('0.', '0.05'));
        orbGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Multi-Layer Floating Particles with Parallax
      particles.forEach((p) => {
        p.wobbleAngle += p.wobbleSpeed;
        p.x += p.speedX + Math.sin(p.wobbleAngle) * (p.layer === 3 ? 0.6 : 0.25);
        p.y += p.speedY;

        // Parallax offset per layer
        const layerParallaxFactor = p.layer === 1 ? 8 : p.layer === 2 ? 22 : 45;
        const drawX = p.x + parallaxX * layerParallaxFactor;
        const drawY = p.y + parallaxY * layerParallaxFactor;

        // Wrap around
        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;

        // Pulse opacity
        const flicker = Math.sin(p.wobbleAngle * 2) * 0.2;
        const currentOpacity = Math.max(0.1, Math.min(1, p.baseOpacity + flicker));

        ctx.save();
        ctx.globalAlpha = currentOpacity;
        ctx.fillStyle = p.color;

        // Foreground sparks have glowing aura
        if (p.layer === 3) {
          ctx.shadowColor = p.glowColor;
          ctx.shadowBlur = 12;
        } else if (p.layer === 2) {
          ctx.shadowColor = p.glowColor;
          ctx.shadowBlur = 6;
        }

        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Rising ethereal shadow mist at bottom
      const mistGrad = ctx.createLinearGradient(0, height - 180, 0, height);
      mistGrad.addColorStop(0, 'rgba(6, 6, 12, 0)');
      mistGrad.addColorStop(0.5, 'rgba(15, 10, 30, 0.4)');
      mistGrad.addColorStop(1, 'rgba(6, 6, 12, 0.85)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, height - 180, width, 180);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isLowPower]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          contain: 'strict',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
