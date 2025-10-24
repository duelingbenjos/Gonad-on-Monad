"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  image: HTMLImageElement;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  size?: number;
  opacity?: number;
}

interface Laser {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
  maxLife: number;
  color: string;
  width: number;
  targetParticle?: Particle;
  lockFrames?: number; // frames to show crosshair before registering hit
}

interface Fragment {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export interface GonadStarfieldRef {
  explode: () => void;
}

export interface GonadStarfieldProps {
  onTargetDestroyed?: (delta: number) => void;
}

interface GameState {
  showClearMessage: boolean;
  clearMessageStartTime: number;
}

interface HitText {
  x: number;
  y: number;
  text: string;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
  color: string;
  flashPhase: number;
}

interface VictoryText {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export const GonadStarfield = forwardRef<GonadStarfieldRef, GonadStarfieldProps>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const gonadImageRef = useRef<HTMLImageElement>();
  const lasersRef = useRef<Laser[]>([]);
  const fragmentsRef = useRef<Fragment[]>([]);
  const hitTextsRef = useRef<HitText[]>([]);
  const victoryTextsRef = useRef<VictoryText[]>([]);
  const crosshairTargetsRef = useRef<Particle[]>([]);
  const crosshairUpdateCountdownRef = useRef<number>(0);
  const animationIdRef = useRef<number>();
  const explosionSounds = useRef<HTMLAudioElement[]>([]);
  const hasLasersFired = useRef(false);
  const gameState = useRef<GameState>({
    showClearMessage: false,
    clearMessageStartTime: 0
  });

  // List of explosion sound files
  const explosionSoundFiles = [
    'massive-explosion-2-397983.mp3',
    'large-underwater-explosion-190270.mp3'
  ];

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

  // Explosion particles function removed to eliminate lag

  const createLasers = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    hasLasersFired.current = true; // Mark that lasers have been fired
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 150; // 15% higher than before (was -100, now -150)
    
    // Prefer current crosshair targets when available
    const crosshairTargets = crosshairTargetsRef.current.filter(Boolean);
    // Get all available dickbutt particles (non-GONAD particles) from starfield
    const dickbutts = particlesRef.current.filter(p => 
      p.image !== gonadImageRef.current && 
      p.z > 1 // Only target particles that are visible in starfield
    );
    
    const colors = ['#FF0040', '#00FF40', '#4000FF', '#FF4000', '#40FF00', '#FF0080', '#80FF00', '#0080FF'];
    
    // Target up to 5 particles, preferring locked crosshair targets
    const targetCount = Math.min(5, dickbutts.length);
    const selected: Particle[] = [];
    for (let i = 0; i < crosshairTargets.length && selected.length < targetCount; i++) {
      const t = crosshairTargets[i];
      if (t && dickbutts.includes(t)) selected.push(t);
    }
    if (selected.length < targetCount) {
      const picked = new Set<number>();
      while (selected.length < targetCount) {
        const idx = Math.floor(Math.random() * dickbutts.length);
        if (!picked.has(idx)) {
          picked.add(idx);
          const cand = dickbutts[idx];
          if (cand && !selected.includes(cand)) selected.push(cand);
        }
      }
    }

    // Create targeting lasers for selected dickbutts
    for (let i = 0; i < selected.length; i++) {
      const targetParticle = selected[i];
      if (!targetParticle) continue;
      
      // Calculate target screen position using NORMAL starfield coordinates
      const targetX = (targetParticle.x / targetParticle.z) * 300 + canvas.width / 2;
      const targetY = (targetParticle.y / targetParticle.z) * 300 + canvas.height / 2 - 250;
      
      const laser: Laser = {
        x1: centerX,
        y1: centerY,
        x2: targetX,
        y2: targetY,
        life: 40 + Math.random() * 30, // Longer-lived
        maxLife: 40 + Math.random() * 30,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: Math.random() * 12 + 10, // Much thicker (was 8+6, now 12+10)
        targetParticle: targetParticle,
        lockFrames: 18 + Math.floor(Math.random() * 18), // 18-36 frames (~0.3-0.6s)
      };
      
      lasersRef.current.push(laser);
    }
  };

  const createFragments = (particle: Particle, hitX: number, hitY: number) => {
    // Create 8-12 fragments when a dickbutt gets hit
    const fragmentCount = 8 + Math.floor(Math.random() * 5);
    const colors = ['#FF6B35', '#F7931E', '#FFE135', '#FF073A', '#C147E9', '#00D4AA'];
    
    for (let i = 0; i < fragmentCount; i++) {
      const angle = (Math.PI * 2 * i) / fragmentCount + Math.random() * 0.5;
      const speed = Math.random() * 8 + 4;
      
      const fragment: Fragment = {
        x: hitX,
        y: hitY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 20,
        maxLife: 30 + Math.random() * 20,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      
      fragmentsRef.current.push(fragment);
    }
  };

  const createHitText = (x: number, y: number) => {
    const hitWords = ['BANG!', 'SMASH!', 'BOOM!', 'POW!', 'ZAP!', 'WHAM!', 'BLAM!', 'CRASH!', 'CUM!', 'THIQQ'];
    const word = hitWords[Math.floor(Math.random() * hitWords.length)];
    const colors = ['#FF0040', '#00FF40', '#4000FF', '#FF4000', '#FFFF00', '#FF0080', '#80FF00'];
    
    const hitText: HitText = {
      x: x,
      y: y,
      text: word,
      life: 450, // Much longer life (was 300, now 450 = 7.5 seconds at 60fps)
      maxLife: 450,
      vx: (Math.random() - 0.5) * 0.5, // Half speed again (was * 1, now * 0.5)
      vy: -0.25 - Math.random() * 0.25, // Half speed again (was -0.5 - rand * 0.5, now -0.25 - rand * 0.25)
      color: colors[Math.floor(Math.random() * colors.length)],
      flashPhase: 0
    };
    
    hitTextsRef.current.push(hitText);
  };

  const createVictoryExplosion = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 200; // Higher on screen (was -150, now -200)
    const textCount = 10; // Reduced to 10 texts
    
    for (let i = 0; i < textCount; i++) {
      const angle = (Math.PI * 2 * i) / textCount + Math.random() * 0.3;
      const speed = 0.375 + Math.random() * 0.5; // Much slower again (was 0.75+1, now 0.375+0.5 = half speed again)
      
      const victoryText: VictoryText = {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 500, // Much longer life (was 120, now 300 = 5 seconds)
        maxLife: 500,
        size: 50 + Math.random() * 30 // Much bigger (was 30+20, now 50+30)
      };
      
      victoryTextsRef.current.push(victoryText);
    }
    
    // Respawn dickbutts after victory display + 5 seconds
    setTimeout(() => {
      // Reset victory state
      gameState.current.showClearMessage = false;
      victoryTextsRef.current = [];
      hasLasersFired.current = false;
      
      // Add some new dickbutts
      const newDickbuttCount = 30 + Math.random() * 40; // Increased from 15+10 to 30+20
      for (let i = 0; i < newDickbuttCount; i++) {
        createParticle();
      }
    }, 10000);
  };

  // Create a single particle
  const createParticle = () => {
    const canvas = canvasRef.current;
    if (!canvas || imagesRef.current.length === 0) return;

    const particle: Particle = {
      x: Math.random() * canvas.width - canvas.width / 2,
      y: Math.random() * canvas.height - canvas.height / 2,
      z: Math.random() * 1000 + 500, // Start far away
      image: imagesRef.current[Math.floor(Math.random() * imagesRef.current.length)],
      speed: Math.random() * 2 + 0.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      opacity: 0, // Start invisible for fade-in effect
    };

    particlesRef.current.push(particle);
  };

  // Initialize particles
  const initParticles = () => {
    const particleCount = 70; // Increased from 50 to 100 for more dickbutts
    particlesRef.current = [];

    for (let i = 0; i < particleCount; i++) {
      createParticle();
      // For initial particles, start with a random fade-in progress to stagger the effect
      if (particlesRef.current.length > 0) {
        const lastParticle = particlesRef.current[particlesRef.current.length - 1];
        lastParticle.opacity = Math.random() * 0.3; // Start with 0-30% opacity for variety
      }
    }
  };

  // Load explosion sounds
  const loadExplosionSounds = () => {
    explosionSounds.current = explosionSoundFiles.map(filename => {
      const audio = new Audio(`/sounds/${filename}`);
      audio.preload = 'auto';
      audio.volume = 0.3; // Set volume to 30% to avoid being too loud
      return audio;
    });
  };

  // Play random explosion sound
  const playRandomExplosionSound = () => {
    if (explosionSounds.current.length > 0) {
      const randomIndex = Math.floor(Math.random() * explosionSounds.current.length);
      const selectedSound = explosionSounds.current[randomIndex];
      
      // Reset and play the sound
      selectedSound.currentTime = 0;
      selectedSound.play().catch(error => {
        console.log('Audio play failed:', error);
      });
    }
  };

  // Expose explosion method
  useImperativeHandle(ref, () => ({
    explode: () => {
      // Play random explosion sound immediately
      playRandomExplosionSound();
      
      // Just fire lasers - no heavy explosion effects
      createLasers();
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true } as any) as CanvasRenderingContext2D | null;
    if (!ctx) return;

    // Prefer cheaper filtering during motion
    ctx.imageSmoothingEnabled = true;
    // Low quality is visually fine at motion and cheaper
    (ctx as any).imageSmoothingQuality = 'low';

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Debounce resize to next animation frame
    let resizeRaf: number | null = null;
    const onResize = () => {
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        resizeCanvas();
        resizeRaf = null;
      });
    };

    resizeCanvas();
    window.addEventListener('resize', onResize);

    // Resume animation when tab becomes visible
    const onVisibilityChange = () => {
      if (!document.hidden && !animationIdRef.current) {
        animationIdRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

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

      // Load GONAD logo for explosion
      const gonadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = '/gonad.png';
      });

      try {
        imagesRef.current = await Promise.all(imagePromises);
        gonadImageRef.current = await gonadPromise;
        initParticles();
        animate();
      } catch (error) {
        console.error('Failed to load images:', error);
      }
    };

    // Lightweight crosshair renderer (fixed-size, equal protrusion, small center gap)
    const drawCrosshair = (x: number, y: number, _baseSize: number, color: string) => {
      const radius = 14;           // fixed circle radius in px
      const protrusion = 6;        // how far lines extend outside the circle
      const centerGap = 4;         // gap around the center so target remains visible

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.95;

      // Outer circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Horizontal arms (equal protrusion each side, gap at center)
      ctx.beginPath();
      // left arm
      ctx.moveTo(x - (radius + protrusion), y);
      ctx.lineTo(x - centerGap * 0.5, y);
      // right arm
      ctx.moveTo(x + centerGap * 0.5, y);
      ctx.lineTo(x + (radius + protrusion), y);
      ctx.stroke();

      // Vertical arms
      ctx.beginPath();
      // top arm
      ctx.moveTo(x, y - (radius + protrusion));
      ctx.lineTo(x, y - centerGap * 0.5);
      // bottom arm
      ctx.moveTo(x, y + centerGap * 0.5);
      ctx.lineTo(x, y + (radius + protrusion));
      ctx.stroke();

      ctx.restore();
    };

    const projectParticle = (p: Particle) => {
      const screenX = (p.x / p.z) * 300 + canvas.width / 2;
      const screenY = (p.y / p.z) * 300 + canvas.height / 2 - 250;
      const scale = (1000 - p.z) / 1000;
      const size = Math.max(scale * 120, 8);
      return { screenX, screenY, size };
    };

    const isOnScreen = (p: Particle) => {
      const { screenX, screenY } = projectParticle(p);
      return !(screenX < -200 || screenX > canvas.width + 200 || screenY < -200 || screenY > canvas.height + 200);
    };

    const desiredCrosshairCount = 5;

    const updateCrosshairTargets = () => {
      if (!document.documentElement.classList.contains('game')) {
        crosshairTargetsRef.current = [];
        return;
      }
      const candidates = particlesRef.current.filter(p => p.image !== gonadImageRef.current && p.z > 1 && isOnScreen(p));
      if (candidates.length === 0) {
        crosshairTargetsRef.current = [];
        return;
      }
      const kept: Particle[] = [];
      for (const t of crosshairTargetsRef.current) {
        if (t && candidates.includes(t)) kept.push(t);
        if (kept.length >= desiredCrosshairCount) break;
      }
      if (kept.length < desiredCrosshairCount) {
        const remaining = desiredCrosshairCount - kept.length;
        const picked = new Set<number>();
        while (picked.size < Math.min(remaining, candidates.length)) {
          const idx = Math.floor(Math.random() * candidates.length);
          if (!picked.has(idx)) {
            picked.add(idx);
            const cand = candidates[idx];
            if (!kept.includes(cand)) kept.push(cand);
            if (kept.length >= desiredCrosshairCount) break;
          }
        }
      }
      crosshairTargetsRef.current = kept;
    };

    // Animation loop
    const animate = () => {
      const now = Date.now();
      
      // Simple clear (no heavy flashing)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update crosshair targets periodically in game mode
      if (document.documentElement.classList.contains('game')) {
        if (crosshairUpdateCountdownRef.current <= 0) {
          updateCrosshairTargets();
          crosshairUpdateCountdownRef.current = 12; // ~5 updates/sec at 60fps
        } else {
          crosshairUpdateCountdownRef.current--;
        }
      } else if (crosshairTargetsRef.current.length) {
        crosshairTargetsRef.current = [];
      }

      // Clean up old lasers and fragments periodically
      if (lasersRef.current.length === 0 && fragmentsRef.current.length === 0) {
        hasLasersFired.current = false;
      }

      // Update and draw particles (simplified - no explosion particles)
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const particle = particlesRef.current[i];

        // Normal starfield physics only
        particle.z -= particle.speed;
        particle.rotation += particle.rotationSpeed;

        // Fade-in effect for new particles
        if (particle.opacity !== undefined && particle.opacity < 1) {
          particle.opacity = Math.min(particle.opacity + 0.02, 1); // Fade in over ~50 frames (about 0.83 seconds)
        }

        // Reset particle if it gets too close
        if (particle.z <= 1) {
            particlesRef.current.splice(i, 1);
            createParticle();
            // Reset clear message since new targets are available
            if (gameState.current.showClearMessage) {
              gameState.current.showClearMessage = false;
            }
            continue;
          }

        // Calculate position and size (normal starfield only)
        const scale = (1000 - particle.z) / 1000;
        const screenX = (particle.x / particle.z) * 300 + canvas.width / 2;
        const screenY = (particle.y / particle.z) * 300 + canvas.height / 2 - 250;
        const size = Math.max(scale * 120, 8);
        
        // Combine distance-based opacity with fade-in effect
        const distanceOpacity = Math.min(scale * 2, 0.8);
        const fadeInOpacity = particle.opacity !== undefined ? particle.opacity : 1;
        const opacity = distanceOpacity * fadeInOpacity;

        // Skip if particle is off-screen
        if (screenX < -200 || screenX > canvas.width + 200 || 
            screenY < -200 || screenY > canvas.height + 200) {
          continue;
        }

        // Draw particle using setTransform (cheaper than save/restore + translate/rotate)
        const cos = Math.cos(particle.rotation);
        const sin = Math.sin(particle.rotation);
        ctx.setTransform(cos, sin, -sin, cos, screenX, screenY);
        ctx.globalAlpha = opacity;
        ctx.drawImage(
          particle.image,
          -size / 2,
          -size / 2,
          size,
          size
        );
        // Reset transform and alpha
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
      }

      // Hit detection and laser updates
      for (let i = lasersRef.current.length - 1; i >= 0; i--) {
        const laser = lasersRef.current[i];
        
        laser.life--;
        
        // If in game mode, draw crosshair over current target position
        if (laser.targetParticle && document.documentElement.classList.contains('game')) {
          const p = laser.targetParticle;
          // Project current position like the starfield sprites
          const screenX = (p.x / p.z) * 300 + canvas.width / 2;
          const screenY = (p.y / p.z) * 300 + canvas.height / 2 - 250;
          const scale = (1000 - p.z) / 1000;
          const size = Math.max(scale * 120, 8);
          // Skip if offscreen
          if (!(screenX < -200 || screenX > canvas.width + 200 || screenY < -200 || screenY > canvas.height + 200)) {
            drawCrosshair(screenX, screenY, size, '#FFD700');
          }
        }

        // Check for hits with target particle (during most of laser life).
        // Defer hit while lockFrames > 0 so crosshair is visible first.
        if (laser.targetParticle && laser.life > laser.maxLife * 0.1) {
          if (typeof laser.lockFrames === 'number' && laser.lockFrames > 0) {
            laser.lockFrames--;
          } else {
          const targetIndex = particlesRef.current.indexOf(laser.targetParticle);
          if (targetIndex !== -1) {
            // Create fragments at hit location
            createFragments(laser.targetParticle, laser.x2, laser.y2);
            // Create hit text at impact location
            createHitText(laser.x2, laser.y2);
            // Remove the hit particle
            particlesRef.current.splice(targetIndex, 1);
            // Mark laser as hit (don't remove immediately for visual effect)
            laser.targetParticle = undefined;
            // HUD and API calls disabled for deployment
            // Reset clear message state if showing (new targets destroyed)
            if (gameState.current.showClearMessage) {
              gameState.current.showClearMessage = false;
            }
          }
          }
        }
        
        if (laser.life <= 0) {
          lasersRef.current.splice(i, 1);
          continue;
        }
        
        
        const laserOpacity = Math.min(laser.life / laser.maxLife, 0.9);
        
        // Simplified single-pass laser with gradient, no shadow blurs
        ctx.save();
        const grad = ctx.createLinearGradient(laser.x1, laser.y1, laser.x2, laser.y2);
        grad.addColorStop(0.0, 'rgba(255,255,255,0.0)');
        grad.addColorStop(0.15, '#FFFFFF');
        grad.addColorStop(0.5, laser.color);
        grad.addColorStop(0.85, '#FFFFFF');
        grad.addColorStop(1.0, 'rgba(255,255,255,0.0)');
        ctx.globalAlpha = laserOpacity;
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(2, laser.width * 0.85);
        ctx.lineCap = 'round';
        const prevComp = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();
        ctx.globalCompositeOperation = prevComp;
        ctx.restore();
      }

      // Always draw crosshairs for currently selected targets in game mode
      if (document.documentElement.classList.contains('game') && crosshairTargetsRef.current.length) {
        for (const t of crosshairTargetsRef.current) {
          const { screenX, screenY, size } = projectParticle(t);
          if (!(screenX < -200 || screenX > canvas.width + 200 || screenY < -200 || screenY > canvas.height + 200)) {
            drawCrosshair(screenX, screenY, size, '#FFD700');
          }
        }
      }

      // Draw fragments
      for (let i = fragmentsRef.current.length - 1; i >= 0; i--) {
        const fragment = fragmentsRef.current[i];
        
        // Update fragment physics
        fragment.x += fragment.vx;
        fragment.y += fragment.vy;
        fragment.vy += 0.3; // Gravity
        fragment.life--;
        
        if (fragment.life <= 0) {
          fragmentsRef.current.splice(i, 1);
          continue;
        }
        
        const fragmentOpacity = fragment.life / fragment.maxLife;
        
        ctx.save();
        ctx.globalAlpha = fragmentOpacity;
        ctx.fillStyle = fragment.color;
        // No shadow blur to reduce GPU cost
        ctx.beginPath();
        ctx.arc(fragment.x, fragment.y, fragment.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw hit texts
      for (let i = hitTextsRef.current.length - 1; i >= 0; i--) {
        const hitText = hitTextsRef.current[i];
        
        // Update hit text physics
        hitText.x += hitText.vx;
        hitText.y += hitText.vy;
        hitText.vy += 0; // Ultra light gravity (was 0.05, now 0.025)
        hitText.life--;
        hitText.flashPhase++;
        
        if (hitText.life <= 0) {
          hitTextsRef.current.splice(i, 1);
          continue;
        }
        
        // Flashing behavior: flash rapidly for first 150 frames, then steady for 150 frames, then fade for 150 frames
        let textOpacity = 1.0;
        if (hitText.life > 300) {
          // Flashing phase (first 150 frames)
          textOpacity = Math.sin(hitText.flashPhase * 0.8) > 0 ? 1.0 : 0.3;
        } else if (hitText.life > 150) {
          // Steady phase (middle 150 frames)
          textOpacity = 0.9;
        } else {
          // Fade phase (last 150 frames)
          textOpacity = hitText.life / 150;
        }
        
        const textScale = Math.min(1.5, (hitText.maxLife - hitText.life) / 15); // Bigger initial scale
        
        ctx.save();
        ctx.globalAlpha = textOpacity;
        ctx.font = `bold ${40 * textScale}px Medodica, Arial`; // Bigger text (was 30, now 40)
        ctx.fillStyle = hitText.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3; // Thicker stroke
        ctx.textAlign = 'center';
        // Remove shadow blur to lighten rendering
        ctx.strokeText(hitText.text, hitText.x, hitText.y);
        ctx.fillText(hitText.text, hitText.x, hitText.y);
        ctx.restore();
      }

      // Draw victory texts
      for (let i = victoryTextsRef.current.length - 1; i >= 0; i--) {
        const victoryText = victoryTextsRef.current[i];
        
        // Update victory text physics - no gravity, just fly outward
        victoryText.x += victoryText.vx;
        victoryText.y += victoryText.vy;
        // Removed gravity - texts now fly in straight lines
        victoryText.life--;
        
        if (victoryText.life <= 0) {
          victoryTextsRef.current.splice(i, 1);
          continue;
        }
        
        const victoryOpacity = Math.min(1.0, victoryText.life / victoryText.maxLife);
        const victoryScale = Math.min(1.5, (victoryText.maxLife - victoryText.life) / 40); // Slower scale-up
        
        ctx.save();
        ctx.globalAlpha = victoryOpacity;
        ctx.font = `bold ${victoryText.size * victoryScale}px Medodica, Arial`;
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 4; // Thicker stroke
        ctx.textAlign = 'center';
        // Reduced glow cost: no shadow blur
        ctx.strokeText('NICE JOB!', victoryText.x, victoryText.y);
        ctx.fillText('NICE JOB!', victoryText.x, victoryText.y);
        ctx.restore();
      }

      // Check if all dickbutts are cleared
      const remainingDickbutts = particlesRef.current.filter(p => 
        p.image !== gonadImageRef.current && 
        !p.size && // Filter out explosion particles
        p.z > 1
      );

      // Trigger victory explosion if all dickbutts cleared and lasers were fired
      if (remainingDickbutts.length === 0 && lasersRef.current.length === 0 && 
          hasLasersFired.current && !gameState.current.showClearMessage) {
        gameState.current.showClearMessage = true;
        createVictoryExplosion();
      }

      // Schedule next frame only when visible
      if (!document.hidden) {
        animationIdRef.current = requestAnimationFrame(animate);
      } else {
        animationIdRef.current = undefined;
      }
    };

    loadImages();
    loadExplosionSounds();

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

    return (
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 touch-none"
        style={{ background: 'transparent' }}
      />
    );
  });

GonadStarfield.displayName = 'GonadStarfield';
