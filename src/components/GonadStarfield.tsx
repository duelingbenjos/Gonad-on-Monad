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

export const GonadStarfield = forwardRef<GonadStarfieldRef>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const gonadImageRef = useRef<HTMLImageElement>();
  const lasersRef = useRef<Laser[]>([]);
  const fragmentsRef = useRef<Fragment[]>([]);
  const hitTextsRef = useRef<HitText[]>([]);
  const victoryTextsRef = useRef<VictoryText[]>([]);
  const animationIdRef = useRef<number>();
  const explosionMode = useRef(false);
  const explosionEndTime = useRef(0);
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

  // Define explosion functions outside useEffect so they're accessible
  const createExplosionParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas || !gonadImageRef.current || imagesRef.current.length === 0) return;
    
    // Don't clear particles immediately - let lasers target existing ones first
    // Clear will happen after laser targeting is done
    
    // Create GONAD logos (fewer, bigger)
    const newParticles: Particle[] = [];
    for (let i = 0; i < 75; i++) {
      const angle = (Math.PI * 2 * i) / 75 + Math.random() * 0.5;
      
      const particle: Particle = {
        x: Math.cos(angle) * (Math.random() * 50), // Start near center
        y: Math.sin(angle) * (Math.random() * 50),
        z: 100 + Math.random() * 200,
        image: gonadImageRef.current,
        speed: (Math.random() * 8 + 4),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        size: Math.random() * 80 + 40,
        opacity: 1,
      };
      
      newParticles.push(particle);
    }

    // Add new particles to existing ones instead of replacing
    particlesRef.current.push(...newParticles);
  };

  const createLasers = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    hasLasersFired.current = true; // Mark that lasers have been fired
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 150; // 15% higher than before (was -100, now -150)
    
    // Get all available dickbutt particles (non-GONAD particles) from NORMAL starfield
    const dickbutts = particlesRef.current.filter(p => 
      p.image !== gonadImageRef.current && 
      !p.size && // Filter out explosion particles
      p.z > 1 // Only target particles that are visible in normal starfield
    );
    
    const colors = ['#FF0040', '#00FF40', '#4000FF', '#FF4000', '#40FF00', '#FF0080', '#80FF00', '#0080FF'];
    
    // Target up to 5 random dickbutts, or all available if less than 5
    const targetCount = Math.min(5, dickbutts.length);
    const shuffledDickbutts = [...dickbutts].sort(() => Math.random() - 0.5); // Shuffle array
    
    // Create targeting lasers for randomly selected dickbutts
    for (let i = 0; i < targetCount; i++) {
      const targetParticle = shuffledDickbutts[i];
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
    const hitWords = ['BANG!', 'SMASH!', 'BOOM!', 'POW!', 'ZAP!', 'WHAM!', 'BLAM!', 'CRASH!'];
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
    const textCount = 20; // More texts (was 12, now 20)
    
    for (let i = 0; i < textCount; i++) {
      const angle = (Math.PI * 2 * i) / textCount + Math.random() * 0.3;
      const speed = 0.375 + Math.random() * 0.5; // Much slower again (was 0.75+1, now 0.375+0.5 = half speed again)
      
      const victoryText: VictoryText = {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 300, // Much longer life (was 120, now 300 = 5 seconds)
        maxLife: 300,
        size: 50 + Math.random() * 30 // Much bigger (was 30+20, now 50+30)
      };
      
      victoryTextsRef.current.push(victoryText);
    }
    
    // Respawn dickbutts after a longer delay
    setTimeout(() => {
      // Reset victory state
      gameState.current.showClearMessage = false;
      victoryTextsRef.current = [];
      hasLasersFired.current = false;
      
      // Add some new dickbutts
      const newDickbuttCount = 15 + Math.random() * 10;
      for (let i = 0; i < newDickbuttCount; i++) {
        createParticle();
      }
    }, 4000); // Longer delay (was 2000, now 4000)
  };

  // Create a single particle
  const createParticle = () => {
    const canvas = canvasRef.current;
    if (!canvas || imagesRef.current.length === 0) return;

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

  // Initialize particles
  const initParticles = () => {
    const particleCount = 50;
    particlesRef.current = [];

    for (let i = 0; i < particleCount; i++) {
      createParticle();
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
      
      // Don't immediately enter explosion mode - just fire lasers first
      createLasers();
      
      // Add some GONAD logos after a short delay
      setTimeout(() => {
        createExplosionParticles();
      }, 200);
    }
  }));

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

    // Animation loop
    const animate = () => {
      const now = Date.now();
      const isExploding = explosionMode.current && now < explosionEndTime.current;
      
      // Simple clear (no heavy flashing)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Clean up old lasers and fragments periodically
      if (lasersRef.current.length === 0 && fragmentsRef.current.length === 0) {
        hasLasersFired.current = false;
      }

      // Reset to normal mode after explosion
      if (explosionMode.current && now >= explosionEndTime.current) {
        explosionMode.current = false;
        lasersRef.current = [];
        fragmentsRef.current = [];
        hasLasersFired.current = false;
        initParticles(); // Reset to normal particles
      }

      // Update and draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const particle = particlesRef.current[i];

        // Check if this is an explosion particle (has custom size) or normal starfield
        if (particle.size && particle.opacity !== undefined) {
          // Explosion particle physics - fly outward
          particle.x += Math.cos(Math.atan2(particle.y, particle.x)) * particle.speed;
          particle.y += Math.sin(Math.atan2(particle.y, particle.x)) * particle.speed;
          particle.z += particle.speed * 0.5;
          particle.rotation += particle.rotationSpeed;
          
          // Fade out over time
          particle.opacity -= 0.02;
          if (particle.opacity <= 0) {
            particlesRef.current.splice(i, 1);
            continue;
          }
        } else {
          // Normal starfield physics
          particle.z -= particle.speed;
          particle.rotation += particle.rotationSpeed;

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
        }

        let screenX, screenY, size, opacity;

        if (particle.size && particle.opacity !== undefined) {
          // Explosion particle positioning
          screenX = canvas.width / 2 + particle.x;
          screenY = canvas.height / 2 - 100 + particle.y;
          size = particle.size;
          opacity = particle.opacity;
        } else {
          // Normal starfield positioning
          const scale = (1000 - particle.z) / 1000;
          screenX = (particle.x / particle.z) * 300 + canvas.width / 2;
          screenY = (particle.y / particle.z) * 300 + canvas.height / 2 - 250;
          size = Math.max(scale * 120, 8);
          opacity = Math.min(scale * 2, 0.8);
        }

        // Skip if particle is off-screen
        if (screenX < -200 || screenX > canvas.width + 200 || 
            screenY < -200 || screenY > canvas.height + 200) {
          continue;
        }

        // Draw particle (no heavy glow effects)
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

      // Hit detection and laser updates
      for (let i = lasersRef.current.length - 1; i >= 0; i--) {
        const laser = lasersRef.current[i];
        
        laser.life--;
        
        // Check for hits with target particle (during most of laser life)
        if (laser.targetParticle && laser.life > laser.maxLife * 0.1) {
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
            // Reset clear message state if showing (new targets destroyed)
            if (gameState.current.showClearMessage) {
              gameState.current.showClearMessage = false;
            }
          }
        }
        
        if (laser.life <= 0) {
          lasersRef.current.splice(i, 1);
          continue;
        }
        
        
        const laserOpacity = Math.min(laser.life / laser.maxLife, 0.9);
        
        ctx.save();
        
        // Draw multiple layers for super visible lasers
        // Outer glow layer
        ctx.globalAlpha = laserOpacity * 0.3;
        ctx.strokeStyle = laser.color;
        ctx.shadowColor = laser.color;
        ctx.shadowBlur = 30;
        ctx.lineWidth = laser.width + 8;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();
        
        // Main laser beam
        ctx.globalAlpha = laserOpacity;
        ctx.shadowBlur = 20;
        ctx.lineWidth = laser.width;
        
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();
        
        // Inner bright core
        ctx.globalAlpha = laserOpacity * 1.2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.shadowBlur = 10;
        ctx.lineWidth = laser.width * 0.3;
        
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();
        
        ctx.restore();
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
        ctx.shadowColor = fragment.color;
        ctx.shadowBlur = 8;
        
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
        hitText.vy += 0.025; // Ultra light gravity (was 0.05, now 0.025)
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
        ctx.shadowColor = hitText.color;
        ctx.shadowBlur = 15; // More shadow
        
        ctx.strokeText(hitText.text, hitText.x, hitText.y);
        ctx.fillText(hitText.text, hitText.x, hitText.y);
        ctx.restore();
      }

      // Draw victory texts
      for (let i = victoryTextsRef.current.length - 1; i >= 0; i--) {
        const victoryText = victoryTextsRef.current[i];
        
        // Update victory text physics
        victoryText.x += victoryText.vx;
        victoryText.y += victoryText.vy;
        victoryText.vy += 0.01; // Extremely light gravity (was 0.02, now 0.01)
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
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 25; // More glow
        
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

      animationIdRef.current = requestAnimationFrame(animate);
    };

    loadImages();
    loadExplosionSounds();

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
        className="fixed inset-0 pointer-events-none z-0 touch-none"
        style={{ background: 'transparent' }}
      />
    );
  });

GonadStarfield.displayName = 'GonadStarfield';
