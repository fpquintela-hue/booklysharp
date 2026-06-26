'use client';

import { useRef, useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

const frameCount = 23;
const framePaths = Array.from({ length: frameCount }, (_, i) => 
  `/assets/hero-animation/ezgif-frame-${(i + 1).toString().padStart(3, '0')}.png`
);

export function HeroScrollAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // We track the scroll progress of this specific container.
  // Using 'start center' means the animation starts when the top of the container hits the middle of the viewport.
  // 'end start' means it ends when the bottom of the container hits the top of the viewport.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end start"] 
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Map scroll progress (0 to 1) to frame index (0 to 22)
    const nextIndex = Math.min(
      frameCount - 1,
      Math.max(0, Math.floor(latest * frameCount))
    );
    setCurrentIndex(nextIndex);
  });

  return (
    <div ref={containerRef} className="relative w-full aspect-[1280/860] overflow-hidden">
      {framePaths.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={`Animation frame ${index + 1}`}
          // We use standard img tags for frame sequences as it's more performant 
          // than next/image for rapid swapping.
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-75 ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          // Eager load the first few frames to ensure smooth initial scrolling
          loading={index < 5 ? "eager" : "lazy"}
          // Decode asynchronously so the main thread isn't blocked by image decoding
          decoding="async"
        />
      ))}
    </div>
  );
}
