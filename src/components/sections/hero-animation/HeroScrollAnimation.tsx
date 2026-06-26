'use client';

import { useRef, useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

const frameCount = 23;
const framePaths = Array.from({ length: frameCount }, (_, i) => 
  `/assets/hero-animation/ezgif-frame-${(i + 1).toString().padStart(3, '0')}.png`
);

export function HeroScrollAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use global scroll since this is in the Hero section at the very top of the page
  const { scrollY } = useScroll();

  const [currentIndex, setCurrentIndex] = useState(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Animate over the first 600px of scrolling
    const scrollDistance = 600; 
    const progress = Math.min(1, Math.max(0, latest / scrollDistance));
    
    // Map progress (0 to 1) to frame index (0 to 22)
    const nextIndex = Math.floor(progress * (frameCount - 1));
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
