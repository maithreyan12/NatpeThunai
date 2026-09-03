import React, { useState, useEffect } from 'react';
import InfiniteSpiral from '../ui/InfiniteSpiral';
import { r2Photo } from '../../services/r2Assets';
import './MemoriesSpiral.css';

// 7 items to form a clean single spiral turn (matching cardsPerTurn={7})
const SPIRAL_IMAGES = [
  { src: r2Photo('friend1.jpg'), alt: 'Mountain lake' },
  { src: r2Photo('friend2.jpg'), alt: 'Forest path' },
  { src: r2Photo('friend3.jpg'), alt: 'Rocky summit' },
  { src: r2Photo('friend4.jpg'), alt: 'Ocean shore' },
  { src: r2Photo('farish.jpg'),  alt: 'Farish' },
  { src: r2Photo('kafil.jpg'),   alt: 'Kafil' },
  { src: r2Photo('hanuu.jpg'),   alt: 'Hanu' },
];

export default function MemoriesSpiral() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="memories-spiral-section" id="memories-spiral">
      <div className="memories-spiral__header">
        <span className="memories-spiral__badge">✨ Memories Vault</span>
        <h2 className="memories-spiral__title">Our Infinite Spiral</h2>
        <p className="memories-spiral__subtitle">
          Every face, every frame — spinning through the moments that made us who we are.
        </p>
      </div>

      <div
        style={{
          height: isMobile ? '620px' : '680px',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <InfiniteSpiral
          items={SPIRAL_IMAGES}
          animationMode="auto"
          speed={0.55}
          radius={isMobile ? 140 : 240}
          cardWidth={isMobile ? 140 : 195}
          cardHeight={isMobile ? 110 : 145}
          verticalSpacing={isMobile ? 78 : 85}
          perspective={isMobile ? 800 : 950}
          cardRadius={isMobile ? 14 : 18}
          centerScale={1.32}
          edgeBlur={5.75}
          cardsPerTurn={7}
          pauseOnHover={false}
          direction="up"
          rotation={0}
          cardTilt={0}
          edgeFade={0.8}
          imageFit="cover"
          grayscale={0.2}
        />

      </div>
    </section>
  );
}
