'use client';

import React, { useEffect, useRef, useCallback, useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  speedX: number;
  speedY: number;
  wobble: number;
  wobbleSpeed: number;
}

const BokehAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  const colors = useMemo(() => ['#FFD700', '#FFA500', '#CCCCCC'], []); // Bright yellow, golden amber, soft grey

  const createParticle = useCallback((id: number, width: number, height: number): Particle => {
    const size = Math.random() * 100 + 20; // 20-120px
    return {
      id,
      x: Math.random() * (width + 200) - 100, // Start slightly off-screen
      y: Math.random() * height,
      size,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.3 + 0.4, // 0.4-0.7
      speedX: (Math.random() - 0.5) * (size > 60 ? 0.3 : 0.8), // Larger particles move slower
      speedY: (Math.random() - 0.5) * 0.2, // Subtle vertical oscillation
      wobble: 0,
      wobbleSpeed: Math.random() * 0.02 + 0.01,
    };
  }, [colors]);

  const initializeParticles = useCallback((width: number, height: number) => {
    const particleCount = Math.floor(Math.random() * 21) + 30; // 30-50 particles
    particlesRef.current = Array.from({ length: particleCount }, (_, i) =>
      createParticle(i, width, height)
    );
  }, [createParticle]);

  const updateParticles = useCallback((width: number, height: number) => {
    particlesRef.current.forEach((particle) => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY + Math.sin(particle.wobble) * 0.5;
      particle.wobble += particle.wobbleSpeed;

      // Wrap around horizontally
      if (particle.x > width + 100) {
        particle.x = -100;
      } else if (particle.x < -100) {
        particle.x = width + 100;
      }

      // Wrap around vertically
      if (particle.y > height + 50) {
        particle.y = -50;
      } else if (particle.y < -50) {
        particle.y = height + 50;
      }

      // Subtle opacity animation
      particle.opacity += (Math.random() - 0.5) * 0.005;
      particle.opacity = Math.max(0.2, Math.min(0.8, particle.opacity));
    });
  }, []);

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Create gradient background
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
    gradient.addColorStop(0, '#FEFEFE');
    gradient.addColorStop(1, '#F5F5F5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Sort particles by size for depth effect (larger = background, smaller = foreground)
    const sortedParticles = [...particlesRef.current].sort((a, b) => b.size - a.size);

    sortedParticles.forEach((particle) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const distanceFromCenter = Math.sqrt(
        Math.pow(particle.x - centerX, 2) + Math.pow(particle.y - centerY, 2)
      );
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
      const centralFactor = 1 - (distanceFromCenter / maxDistance);

      // Adjust opacity based on distance from center (brighter in center)
      const adjustedOpacity = particle.opacity * (0.3 + centralFactor * 0.7);
      
      // Create blur effect based on size (larger = more blurred)
      const blurAmount = Math.max(2, particle.size * 0.3);
      
      ctx.save();
      ctx.globalAlpha = adjustedOpacity;
      
      // Create glow effect for yellow particles
      if (particle.color === '#FFD700') {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = blurAmount * 1.5;
      } else {
        ctx.shadowBlur = blurAmount;
        ctx.shadowColor = particle.color;
      }

      // Create gradient for each particle
      const particleGradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size / 2
      );
      particleGradient.addColorStop(0, particle.color);
      particleGradient.addColorStop(0.7, particle.color + '80'); // Semi-transparent
      particleGradient.addColorStop(1, particle.color + '00'); // Fully transparent

      ctx.fillStyle = particleGradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    
    updateParticles(width, height);
    drawParticles(ctx, width, height);
    
    animationRef.current = requestAnimationFrame(animate);
  }, [updateParticles, drawParticles]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initializeParticles(canvas.width, canvas.height);
  }, [initializeParticles]);

  useEffect(() => {
    handleResize();
    animate();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, handleResize]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
};

export default BokehAnimation;