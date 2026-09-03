import React, { useState, useEffect } from 'react';
import { Edit3 } from 'lucide-react';
import InfiniteSpiral from '../ui/InfiniteSpiral';
import { r2Photo } from '../../services/r2Assets';
import { subscribeToSpiralR2, INITIAL_SPIRAL_ITEMS } from '../../services/r2Database';
import './MemoriesSpiral.css';

// Fallback initial squad photos
const FALLBACK_SPIRAL_IMAGES = [
  { id: 'grace',      src: r2Photo('friend1.jpg'),    alt: 'Grace' },
  { id: 'heenuuu',    src: r2Photo('friend2.jpg'),    alt: 'Heenuuu' },
  { id: 'divyaaa',    src: r2Photo('friend3.jpg'),    alt: 'Divyaaa' },
  { id: 'puppy',      src: r2Photo('friend4.jpg'),    alt: 'Puppy' },
  { id: 'farish',     src: r2Photo('farish.jpg'),     alt: 'Farish' },
  { id: 'kafil',      src: r2Photo('kafil.jpg'),      alt: 'Kafil' },
  { id: 'hanuu',      src: r2Photo('hanuu.jpg'),      alt: 'Hanu' },
  { id: 'gopika',     src: r2Photo('gopika.jpg'),     alt: 'Gopika' },
  { id: 'maithreyan', src: r2Photo('maithreyan.jpg'),  alt: 'Maithreyan' },
];

export default function MemoriesSpiral() {
  const [spiralItems, setSpiralItems] = useState(INITIAL_SPIRAL_ITEMS || FALLBACK_SPIRAL_IMAGES);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const unsub = subscribeToSpiralR2((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setSpiralItems(data);
      }
    });
    return () => unsub();
  }, []);

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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <span className="memories-spiral__badge">✨ Memories Vault</span>
          <a
            href="#admin"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-admin-tab', { detail: { tab: 'spiral' } }));
            }}
            className="admin-section-edit-trigger"
            title="Edit Spiral Photos in Admin Console"
          >
            <Edit3 size={13} />
            <span>Edit Spiral</span>
          </a>
        </div>
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
          items={spiralItems}

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
