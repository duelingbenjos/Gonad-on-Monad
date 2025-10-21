import React, { useEffect, useRef, useState } from 'react';

interface TunnelAnimationProps {
  width?: number;
  height?: number;
  className?: string;
}

interface ImageItem {
  image: HTMLImageElement;
  z: number;
  rotation: number;
  scale: number;
  opacity: number;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
}

export const TunnelAnimation: React.FC<TunnelAnimationProps> = ({
  width = 400,
  height = 400,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const itemsRef = useRef<ImageItem[]>([]);

  // Image paths
  const imagePaths = [
    '/gonad.png',
    '/images/gonad-hero-frame/dickbutt-1d0d6930-clear.png',
    '/images/gonad-hero-frame/dickbutt-1cc60f1d-clear.png',
    '/images/gonad-hero-frame/dickbutt-1c749f7b-clear.png',
    '/images/gonad-hero-frame/dickbutt-1c8e7fa-clear.png',
    '/images/gonad-hero-frame/dickbutt-1bd066f6-clear.png',
    '/images/gonad-hero-frame/dickbutt-1b56741a-clear.png',
    '/images/gonad-hero-frame/dickbutt-1b9f22c2-clear.png',
    '/images/gonad-hero-frame/dickbutt-1af98273-clear.png',
    '/images/gonad-hero-frame/dickbutt-1a8806fc-clear.png',
    '/images/gonad-hero-frame/dickbutt-1a0b4e68-clear.png',
    '/images/gonad-hero-frame/dickbutt-1a7cad42-clear.png'
  ];

  // Load images
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = imagePaths.map((path) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = path;
        });
      });

      try {
        const loadedImages = await Promise.all(imagePromises);
        imagesRef.current = loadedImages;
        
        // Initialize items with trajectories toward frame edges
        itemsRef.current = [];
        for (let i = 0; i < 30; i++) {
          const randomImage = loadedImages[Math.floor(Math.random() * loadedImages.length)];
          
          // Random origin point within a reasonable range
          const originAngle = Math.random() * Math.PI * 2;
          const originDistance = Math.random() * 100 + 30; // 30-130 pixels from center
          const originX = Math.cos(originAngle) * originDistance;
          const originY = Math.sin(originAngle) * originDistance;
          
          // Target point toward edges of the diamond frame
          const targetAngle = Math.random() * Math.PI * 2;
          const targetDistance = Math.random() * 200 + 150; // 150-350 pixels from center (toward edges)
          const targetX = Math.cos(targetAngle) * targetDistance;
          const targetY = Math.sin(targetAngle) * targetDistance;
          
          itemsRef.current.push({
            image: randomImage,
            z: Math.random() * 6 + 2, // Start further back (2-8) for slower approach
            rotation: Math.random() * 360,
            scale: 2.0 + Math.random() * 2.0, // Much larger base size (2-4x)
            opacity: 1.0, // Full opacity, no transparency
            originX: originX,
            originY: originY,
            targetX: targetX,
            targetY: targetY
          });
        }
        
        setImagesLoaded(true);
      } catch (error) {
        console.error('Failed to load images:', error);
      }
    };

    loadImages();
  }, []);

  // Animation loop
  useEffect(() => {
    if (!imagesLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;

    const animate = () => {
      frameCount++;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Save context for clipping
      ctx.save();
      
      // Create diamond-shaped clipping path (rotated square)
      const centerX = width / 2;
      const centerY = height / 2;
      const size = Math.min(width, height) * 0.4;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - size);
      ctx.lineTo(centerX + size, centerY);
      ctx.lineTo(centerX, centerY + size);
      ctx.lineTo(centerX - size, centerY);
      ctx.closePath();
      ctx.clip();

      // Sort items by z-depth (furthest first)
      const sortedItems = [...itemsRef.current].sort((a, b) => b.z - a.z);

      // Draw tunnel effect
      sortedItems.forEach((item, index) => {
        // Move item towards viewer (much slower speed)
        item.z -= 0.005;
        
        // Reset item when it passes through the viewport
        if (item.z <= -2) { // Allow images to go past the viewport
          item.z = 6 + Math.random() * 3; // Spawn further back (6-9)
          item.rotation = Math.random() * 360;
          item.scale = 2.0 + Math.random() * 2.0; // Much larger base size
          item.opacity = 1.0; // Full opacity, no transparency
          // Pick a new random image
          item.image = imagesRef.current[Math.floor(Math.random() * imagesRef.current.length)];
          
          // Assign new origin and target points
          const originAngle = Math.random() * Math.PI * 2;
          const originDistance = Math.random() * 100 + 30;
          item.originX = Math.cos(originAngle) * originDistance;
          item.originY = Math.sin(originAngle) * originDistance;
          
          const targetAngle = Math.random() * Math.PI * 2;
          const targetDistance = Math.random() * 200 + 150;
          item.targetX = Math.cos(targetAngle) * targetDistance;
          item.targetY = Math.sin(targetAngle) * targetDistance;
        }

        // Calculate straight-line movement from origin to target (toward edges)
        const perspective = Math.max(1 / Math.max(item.z, 0.1), 0.1); // Prevent division by zero and cap perspective
        // Linear interpolation from origin point to target point based on z-depth
        const progress = 1 - (item.z + 2) / (9 + 2); // Adjusted progress range to account for negative z
        const x = centerX + item.originX + (item.targetX - item.originX) * progress;
        const y = centerY + item.originY + (item.targetY - item.originY) * progress;
        
        // Cap the maximum scale to prevent images from taking over the entire viewport
        const maxScale = Math.min(width, height) * 0.3; // Max 30% of viewport
        const calculatedScale = perspective * item.scale * 120; // Reduced multiplier
        const scale = Math.min(calculatedScale, maxScale);
        
        const alpha = 1.0; // No transparency

        if (scale > 0.5 && alpha > 0.1) {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(x, y);
          ctx.rotate(item.rotation * Math.PI / 180); // Static rotation - no frameCount
          
          const drawWidth = scale;
          const drawHeight = scale;
          
          ctx.drawImage(
            item.image,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight
          );
          
          ctx.restore();
        }
      });

      // Restore context
      ctx.restore();

      // Draw diamond frame border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - size);
      ctx.lineTo(centerX + size, centerY);
      ctx.lineTo(centerX, centerY + size);
      ctx.lineTo(centerX - size, centerY);
      ctx.closePath();
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [imagesLoaded, width, height]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
      {!imagesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
          <div className="text-white/60">Loading...</div>
        </div>
      )}
    </div>
  );
};
