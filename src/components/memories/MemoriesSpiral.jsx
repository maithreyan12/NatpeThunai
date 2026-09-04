import React, { useState, useEffect } from 'react';
import { Edit3 } from 'lucide-react';
import InfiniteSpiral from '../ui/InfiniteSpiral';
import { r2Photo } from '../../services/r2Assets';
import { subscribeToSpiralR2, INITIAL_SPIRAL_ITEMS } from '../../services/r2Database';
import { isAuthorizedAdmin, onAuthChange } from '../../firebase';
import './MemoriesSpiral.css';

// Fallback initial squad photos for all 14 members
const FALLBACK_SPIRAL_IMAGES = INITIAL_SPIRAL_ITEMS;

export default function MemoriesSpiral({ currentUser }) {
  const [isAdmin, setIsAdmin] = useState(() => isAuthorizedAdmin(currentUser));
  const [spiralItems, setSpiralItems] = useState(INITIAL_SPIRAL_ITEMS || FALLBACK_SPIRAL_IMAGES);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );

  // Sync auth state: only authorized admins can see the edit button
  useEffect(() => {
    if (currentUser !== undefined) {
      setIsAdmin(isAuthorizedAdmin(currentUser));
      return;
    }
    const unsub = onAuthChange(user => {
      setIsAdmin(isAuthorizedAdmin(user));
    });
    return () => unsub();
  }, [currentUser]);

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
          {isAdmin && (
            <a
              href="#admin?tab=spiral"
              onClick={() => {
                try { localStorage.setItem('admin_initial_tab', 'spiral'); } catch {}
                window.dispatchEvent(new CustomEvent('open-admin-tab', { detail: { tab: 'spiral' } }));
              }}
              className="admin-section-edit-trigger"
              title="Edit Spiral Photos in Admin Console"
            >
              <Edit3 size={13} />
              <span>Edit Spiral</span>
            </a>
          )}
        </div>

        <h2 className="memories-spiral__title">Our Infinite Spiral</h2>
        <p className="memories-spiral__subtitle">
          Every face, every frame — spinning through the moments that made us who we are.
        </p>
      </div>

      <div
        style={{
          height: isMobile ? '640px' : '720px',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <InfiniteSpiral
          items={spiralItems}
          animationMode="auto"
          speed={0.48}
          radius={isMobile ? 145 : 245}
          cardWidth={isMobile ? 135 : 170}
          cardHeight={isMobile ? 165 : 205}
          verticalSpacing={isMobile ? 78 : 86}
          perspective={isMobile ? 820 : 980}
          cardRadius={isMobile ? 14 : 18}
          centerScale={1.28}
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
