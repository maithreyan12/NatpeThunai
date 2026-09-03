import React from 'react';
import InfiniteSpiral from '../ui/InfiniteSpiral';
import { r2Photo } from '../../services/r2Assets';
import './MemoriesSpiral.css';

// Squad photos from R2 CDN — the spiral pulls these automatically
const SPIRAL_IMAGES = [
  { src: r2Photo('farish.jpg'),    alt: 'Farish' },
  { src: r2Photo('kafil.jpg'),     alt: 'Kafil' },
  { src: r2Photo('hanuu.jpg'),     alt: 'Hanu' },
  { src: r2Photo('Gracee.jpg'),    alt: 'Grace' },
  { src: r2Photo('jaffreen.jpg'),  alt: 'Jaffreen' },
  { src: r2Photo('affu.jpg'),      alt: 'Affu' },
  { src: r2Photo('meshak.jpg'),    alt: 'Meshak' },
  { src: r2Photo('samuel.jpg'),    alt: 'Samuel' },
  { src: r2Photo('harshuuu.jpg'),  alt: 'Harshu' },
  { src: r2Photo('Puppy.jpg'),     alt: 'Puppy' },
  { src: r2Photo('Divyaa.jpg'),    alt: 'Divya' },
  { src: r2Photo('Heenuuu.jpg'),   alt: 'Heenu' },
  { src: r2Photo('friend1.jpg'),   alt: 'Squad Memory 1' },
  { src: r2Photo('friend2.jpg'),   alt: 'Squad Memory 2' },
  { src: r2Photo('friend3.jpg'),   alt: 'Squad Memory 3' },
  { src: r2Photo('friend4.jpg'),   alt: 'Squad Memory 4' },
];

export default function MemoriesSpiral() {
  return (
    <section className="memories-spiral-section" id="memories-spiral">
      {/* Section Header */}
      <div className="memories-spiral__header">
        <span className="memories-spiral__badge">
          ✨ Memories Vault
        </span>
        <h2 className="memories-spiral__title">Our Infinite Spiral</h2>
        <p className="memories-spiral__subtitle">
          Every face, every frame — spinning through the moments that made us who we are.
        </p>
      </div>

      {/* Spiral Container */}
      <div className="memories-spiral__container">
        <div className="memories-spiral__glow" />
        <InfiniteSpiral
          items={SPIRAL_IMAGES}
          animationMode="auto"
          speed={0.45}
          radius={155}
          cardWidth={130}
          cardHeight={130}
          verticalSpacing={65}
          perspective={800}
          cardRadius={16}
          centerScale={1.2}
          edgeBlur={2}
          cardsPerTurn={6}
          pauseOnHover
          direction="up"
          rotation={0}
          cardTilt={0}
          edgeFade={0.4}
          imageFit="cover"
          grayscale={0}
        />

      </div>
    </section>
  );
}
