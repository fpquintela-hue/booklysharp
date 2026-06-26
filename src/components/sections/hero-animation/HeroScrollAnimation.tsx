'use client';

import { useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

const frameCount = 23;
const framePaths = Array.from({ length: frameCount }, (_, i) => 
  `/assets/hero-animation/ezgif-frame-${(i + 1).toString().padStart(3, '0')}.png`
);

export function HeroScrollAnimation() {
  const { scrollY } = useScroll();
  const [currentIndex, setCurrentIndex] = useState(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // We animate over a longer distance since the section is 250vh.
    // 150vh is roughly 1500px, which gives a nice smooth transition.
    const scrollDistance = typeof window !== 'undefined' ? window.innerHeight * 1.5 : 1200; 
    const progress = Math.min(1, Math.max(0, latest / scrollDistance));
    
    const nextIndex = Math.floor(progress * (frameCount - 1));
    setCurrentIndex(nextIndex);
  });

  return (
    <div className="relative w-full h-full overflow-hidden bg-white">
      {framePaths.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={`Animation frame ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-75 ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          loading={index < 5 ? "eager" : "lazy"}
          decoding="async"
        />
      ))}
    </div>
  );
}
