'use client';

const frameCount = 23;
const framePaths = Array.from({ length: frameCount }, (_, i) =>
  `/assets/hero-animation/ezgif-frame-${(i + 1).toString().padStart(3, '0')}.png`
);

// Los frames terminan un poco antes de que se libere el pin, de modo que el
// último frame se mantiene un instante antes de que la página siga scrolleando.
const FRAME_END = 0.85;

interface HeroScrollAnimationProps {
  /** Progreso de scroll de la sección (0 → 1) mientras el hero está pinneado. */
  progress: number;
}

export function HeroScrollAnimation({ progress }: HeroScrollAnimationProps) {
  // Mapea [0, FRAME_END] del scroll sobre el rango completo de frames, luego mantiene.
  const p = Math.min(1, Math.max(0, progress / FRAME_END));
  const currentIndex = Math.min(frameCount - 1, Math.floor(p * (frameCount - 1)));

  return (
    <div className="relative w-full h-full overflow-hidden bg-white">
      {framePaths.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden
          className={`absolute inset-0 w-full h-full object-cover ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          loading="eager"
          decoding="async"
          draggable={false}
        />
      ))}
    </div>
  );
}
