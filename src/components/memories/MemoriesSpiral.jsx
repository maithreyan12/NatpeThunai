import React, { useState, useEffect } from 'react';
import InfiniteSpiral from '../ui/InfiniteSpiral';
import { r2Photo } from '../../services/r2Assets';
import './MemoriesSpiral.css';

// Squad photos — Gopika and Maithreyan featured at the end ("last")
const SPIRAL_IMAGES = [
  { id: 'grace',      src: r2Photo('friend1.jpg'),    fallbackSrc: '/photos/friend1.jpg',    alt: 'Grace' },
  { id: 'heenuuu',    src: r2Photo('friend2.jpg'),    fallbackSrc: '/photos/friend2.jpg',    alt: 'Heenuuu' },
  { id: 'divyaaa',    src: r2Photo('friend3.jpg'),    fallbackSrc: '/photos/friend3.jpg',    alt: 'Divyaaa' },
  { id: 'puppy',      src: r2Photo('friend4.jpg'),    fallbackSrc: '/photos/friend4.jpg',    alt: 'Puppy' },
  { id: 'farish',     src: r2Photo('farish.jpg'),     fallbackSrc: '/photos/farish.jpg',     alt: 'Farish' },
  { id: 'kafil',      src: r2Photo('kafil.jpg'),      fallbackSrc: '/photos/kafil.jpg',      alt: 'Kafil' },
  { id: 'hanuu',      src: r2Photo('hanuu.jpg'),      fallbackSrc: '/photos/hanuu.jpg',      alt: 'Hanu' },
  { id: 'gopika',     src: r2Photo('gopika.jpg'),     fallbackSrc: '/photos/gopika.jpg',     alt: 'Gopika' },
  { id: 'maithreyan', src: r2Photo('maithreyan.jpg'),  fallbackSrc: '/photos/maithreyan.jpg', alt: 'Maithreyan' },
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
          speed={0.5}
          radius={isMobile ? 140 : 240}
          cardWidth={isMobile ? 140 : 195}
          cardHeight={isMobile ? 110 : 145}
          verticalSpacing={isMobile ? 76 : 82}
          perspective={isMobile ? 800 : 950}
          cardRadius={isMobile ? 14 : 18}
          centerScale={1.32}
          edgeBlur={5.5}
          cardsPerTurn={8}
          pauseOnHover={false}
          direction="up"
          rotation={0}
          cardTilt={0}
          edgeFade={0.8}
          imageFit="cover"
          grayscale={0}
        />

      </div>
    </section>
  );
}
