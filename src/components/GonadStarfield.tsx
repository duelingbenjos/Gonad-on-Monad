"use client";

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  image: HTMLImageElement;
  speed: number;
  rotation: number;
  rotationSpeed: number;
}

export const GonadStarfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const animationIdRef = useRef<number>();

  // List of dickbutt image filenames
  const imageFilenames = [
    'dickbutt-1a0b4e68-clear.png',
    'dickbutt-1a557316-clear.png',
    'dickbutt-1a7cad42-clear.png',
    'dickbutt-1a8806fc-clear.png',
    'dickbutt-1aa07578-clear.png',
    'dickbutt-1ab58a2c-clear.png',
    'dickbutt-1ae8c526-clear.png',
    'dickbutt-1af98273-clear.png',
    'dickbutt-1b14992d-clear.png',
    'dickbutt-1b16abb9-clear.png',
    'dickbutt-1b1f2cfa-clear.png',
    'dickbutt-1b27bdd6-clear.png',
    'dickbutt-1b4745bf-clear.png',
    'dickbutt-1b529c4f-clear.png',
    'dickbutt-1b56741a-clear.png',
    'dickbutt-1b8b4d83-clear.png',
    'dickbutt-1b9f22c2-clear.png',
    'dickbutt-1bbdb2ed-clear.png',
    'dickbutt-1bd066f6-clear.png',
    'dickbutt-1be709ff-clear.png',
    'dickbutt-1c258b3e-clear.png',
    'dickbutt-1c749f7b-clear.png',
    'dickbutt-1c8e7fa-clear.png',
    'dickbutt-1caa0939-clear.png',
    'dickbutt-1cc60f1d-clear.png',
    'dickbutt-1d07a996-clear.png',
    'dickbutt-1d0d6930-clear.png',
    'dickbutt-1d528375-clear.png',
    'dickbutt-1d54ed4a-clear.png',
    'dickbutt-1d681df4-clear.png',
    'dickbutt-1de8caa8-clear.png',
    'dickbutt-1e3fd1a8-clear.png',
    'dickbutt-1e5f199e-clear.png',
    'dickbutt-1e681c8c-clear.png',
    'dickbutt-1e8de24-clear.png',
    'dickbutt-1eb465d0-clear.png',
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load images
    const loadImages = async () => {
      const imagePromises = imageFilenames.map((filename) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = `/images/gonad-hero-frame/${filename}`;
        });
      });

      try {
        imagesRef.current = await Promise.all(imagePromises);
        initParticles();
        animate();
      } catch (error) {
        console.error('Failed to load dickbutt images:', error);
      }
    };

    // Initialize particles
    const initParticles = () => {
      const particleCount = 50;
      particlesRef.current = [];

      for (let i = 0; i < particleCount; i++) {
        createParticle();
      }
    };

    const createParticle = () => {
      if (imagesRef.current.length === 0) return;

      const particle: Particle = {
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * 1000 + 100, // Start far away
        image: imagesRef.current[Math.floor(Math.random() * imagesRef.current.length)],
        speed: Math.random() * 2 + 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      };

      particlesRef.current.push(particle);
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const particle = particlesRef.current[i];

        // Move particle towards viewer
        particle.z -= particle.speed;
        particle.rotation += particle.rotationSpeed;

        // Reset particle if it gets too close
        if (particle.z <= 1) {
          particlesRef.current.splice(i, 1);
          createParticle();
          continue;
        }

        // Calculate screen position with perspective (emit from gonad logo position)
        const scale = (1000 - particle.z) / 1000;
        const screenX = (particle.x / particle.z) * 300 + canvas.width / 2;
        const screenY = (particle.y / particle.z) * 300 + canvas.height / 2 - 250; // Aligned with gonad logo

        // Skip if particle is off-screen
        if (screenX < -100 || screenX > canvas.width + 100 || 
            screenY < -100 || screenY > canvas.height + 100) {
          continue;
        }

        // Calculate size based on distance (made even larger - 100% increase)
        const size = Math.max(scale * 120, 8);

        // Set opacity based on distance (fade in as they approach)
        const opacity = Math.min(scale * 2, 0.8);

        // Draw particle
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(screenX, screenY);
        ctx.rotate(particle.rotation);
        ctx.drawImage(
          particle.image,
          -size / 2,
          -size / 2,
          size,
          size
        );
        ctx.restore();
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    loadImages();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};
