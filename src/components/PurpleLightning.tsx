import { useEffect, useRef, useState, useCallback } from 'react';
import { playLightningCrackSound } from '@/utils/audioEffects';

interface PurpleLightningProps {
  interactive?: boolean;
  frequencySeconds?: number;
  intensity?: 'low' | 'medium' | 'high';
}

interface Point {
  x: number;
  y: number;
}

export function PurpleLightning({
  interactive = true,
  frequencySeconds = 6,
  intensity = 'medium',
}: PurpleLightningProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const animFrameId = useRef<number | null>(null);

  // Generate recursive lightning branch
  const generateLightningPath = useCallback(
    (start: Point, end: Point, roughness = 1.8, iterations = 5): Point[] => {
      let points = [start, end];

      for (let i = 0; i < iterations; i++) {
        const newPoints: Point[] = [];
        for (let j = 0; j < points.length - 1; j++) {
          const p1 = points[j];
          const p2 = points[j + 1];
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;

          const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const offset = (Math.random() - 0.5) * distance * (roughness / (i + 1.2));

          // Normal vector
          const normalX = -(p2.y - p1.y) / distance;
          const normalY = (p2.x - p1.x) / distance;

          newPoints.push(p1);
          newPoints.push({
            x: midX + normalX * offset,
            y: midY + normalY * offset,
          });
        }
        newPoints.push(points[points.length - 1]);
        points = newPoints;
      }
      return points;
    },
    []
  );

  const drawBolt = useCallback(
    (ctx: CanvasRenderingContext2D, points: Point[], alpha: number, isSub = false) => {
      if (points.length === 0) return;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      // Outer purple monarch aura
      ctx.strokeStyle = `rgba(147, 51, 234, ${alpha * (isSub ? 0.4 : 0.6)})`;
      ctx.lineWidth = isSub ? 4 : 8;
      ctx.shadowColor = '#9333ea';
      ctx.shadowBlur = isSub ? 10 : 22;
      ctx.stroke();

      // Middle bright violet beam
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = `rgba(192, 132, 252, ${alpha * (isSub ? 0.7 : 0.9)})`;
      ctx.lineWidth = isSub ? 2 : 3.5;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = isSub ? 6 : 14;
      ctx.stroke();

      // Core white electricity
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
      ctx.lineWidth = isSub ? 1 : 1.5;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 4;
      ctx.stroke();

      ctx.restore();
    },
    []
  );

  const triggerLightningStrike = useCallback(
    (customTarget?: Point) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Random strike configuration
      const startX = Math.random() * w * 0.8 + w * 0.1;
      const start: Point = { x: startX, y: 0 };
      const end: Point = customTarget || {
        x: startX + (Math.random() - 0.5) * w * 0.5,
        y: Math.random() * h * 0.65 + h * 0.2,
      };

      const mainBolt = generateLightningPath(start, end, 1.6, 5);

      // 2-3 Sub branches
      const branches: Point[][] = [];
      const branchCount = Math.floor(Math.random() * 3) + 1;
      for (let b = 0; b < branchCount; b++) {
        const branchIndex = Math.floor(Math.random() * (mainBolt.length - 8)) + 4;
        const branchStart = mainBolt[branchIndex];
        const branchEnd: Point = {
          x: branchStart.x + (Math.random() - 0.5) * 160,
          y: branchStart.y + Math.random() * 140 + 40,
        };
        branches.push(generateLightningPath(branchStart, branchEnd, 1.9, 4));
      }

      // Flash & sound
      setIsFlashing(true);
      if (intensity !== 'low') {
        playLightningCrackSound();
      }

      let frame = 0;
      const totalFrames = 14;

      const animateStrike = () => {
        frame++;
        ctx.clearRect(0, 0, w, h);

        if (frame < totalFrames) {
          // Flickering decay
          const alpha =
            frame === 1
              ? 1
              : frame === 2
              ? 0.4
              : frame === 3
              ? 0.95
              : Math.max(0, 1 - frame / totalFrames);

          drawBolt(ctx, mainBolt, alpha);
          branches.forEach((branch) => drawBolt(ctx, branch, alpha * 0.7, true));

          animFrameId.current = requestAnimationFrame(animateStrike);
        } else {
          ctx.clearRect(0, 0, w, h);
          setIsFlashing(false);
        }
      };

      animateStrike();
    },
    [drawBolt, generateLightningPath, intensity]
  );

  // Resize canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Periodic random strikes
  useEffect(() => {
    const timer = setInterval(() => {
      // 60% chance to strike every interval cycle
      if (Math.random() > 0.35) {
        triggerLightningStrike();
      }
    }, frequencySeconds * 1000);

    return () => {
      clearInterval(timer);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [frequencySeconds, triggerLightningStrike]);

  return (
    <>
      {/* Screen flash on strike */}
      <div
        className={`fixed inset-0 pointer-events-none z-40 transition-opacity duration-150 ${
          isFlashing ? 'opacity-20 bg-primary-600' : 'opacity-0'
        }`}
      />

      {/* Lightning Canvas */}
      <canvas
        ref={canvasRef}
        onClick={(e) => {
          if (!interactive) return;
          const rect = e.currentTarget.getBoundingClientRect();
          triggerLightningStrike({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }}
        className="fixed inset-0 pointer-events-none z-30"
      />
    </>
  );
}
