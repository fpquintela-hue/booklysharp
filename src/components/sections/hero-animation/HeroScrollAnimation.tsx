'use client';

import { useEffect, useState } from 'react';

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
  // Evita el parpadeo de la primera carga (sobre todo con Ctrl+F5, que salta la
  // caché): precargamos y DECODIFICAMOS los frames, y revelamos el contenedor
  // con un fade en cuanto el primer frame está listo para pintarse. El resto se
  // siguen decodificando en segundo plano para que el scrubbing no tenga saltos.
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const images = framePaths.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    // Revela en cuanto el primer frame esté decodificado (o falle, para no
    // quedarnos en blanco para siempre).
    images[0]
      .decode()
      .catch(() => {})
      .then(() => {
        if (!cancelled) setRevealed(true);
      });

    // Decodifica el resto en segundo plano, sin bloquear el reveal.
    void Promise.all(images.map((img) => img.decode().catch(() => {})));

    return () => {
      cancelled = true;
    };
  }, []);

  // Mapea [0, FRAME_END] del scroll sobre el rango completo de frames, luego mantiene.
  const p = Math.min(1, Math.max(0, progress / FRAME_END));
  const currentIndex = Math.min(frameCount - 1, Math.floor(p * (frameCount - 1)));

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[#f8fafc] transition-opacity duration-500 ease-out ${
        revealed ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {framePaths.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          loading="eager"
          decoding="async"
          fetchPriority={index === 0 ? 'high' : 'low'}
          draggable={false}
        />
      ))}
    </div>
  );
}
