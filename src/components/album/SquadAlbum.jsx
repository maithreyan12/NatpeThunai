import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { r2Photo } from '../../services/r2Assets';
import './SquadAlbum.css';

// Curated verified squad photos from R2 storage
const SQUAD_ALBUM_PHOTOS = [
  { id: 'p1', url: r2Photo('farish.jpg'), caption: 'Farish Sharif · The Mastermind' },
  { id: 'p2', url: r2Photo('kafil.jpg'), caption: 'Kafil · The Creative Soul' },
  { id: 'p3', url: r2Photo('hanuu.jpg'), caption: 'Haniya · Chill Vibes' },
  { id: 'p4', url: r2Photo('Gracee.jpg'), caption: 'Grace · Radiant Spark' },
  { id: 'p5', url: r2Photo('jaffreen.jpg'), caption: 'Jaffreen · Pure Warmth' },
  { id: 'p6', url: r2Photo('affu.jpg'), caption: 'Afnaan · The Energy Dynamo' },
  { id: 'p7', url: r2Photo('meshak.jpg'), caption: 'Meshak · The Silent Strength' },
  { id: 'p8', url: r2Photo('samuel.jpg'), caption: 'Samuel · The Joyful Soul' },
  { id: 'p9', url: r2Photo('harshuuu.jpg'), caption: 'Harshitha · Radiant Sunshine' },
  { id: 'p10', url: r2Photo('Puppy.jpg'), caption: 'Puppy · Squad Love' },
  { id: 'p11', url: r2Photo('Divyaa.jpg'), caption: 'Divya · Golden Moments' },
  { id: 'p12', url: r2Photo('Heenuuu.jpg'), caption: 'Heena · Cozy Hangouts' },
  { id: 'p13', url: r2Photo('friend1.jpg'), caption: 'Midnight Chai & Unfiltered Banter' },
  { id: 'p14', url: r2Photo('friend2.jpg'), caption: 'First Road Trip to Nilgiris' },
  { id: 'p15', url: r2Photo('friend3.jpg'), caption: 'Sunset Chasing by the Shore' },
  { id: 'p16', url: r2Photo('friend4.jpg'), caption: 'Campus Stairs Laughter Session' }
];

export default function SquadAlbum({ onBackHome, memories = [], members = [] }) {
  // Aggregate only real photo URLs (filter out broken/null/placeholder IDs)
  const photos = useMemo(() => {
    const pool = [];
    const seen = new Set();

    // 1. Add valid memories with direct image URLs
    memories.forEach(m => {
      if (m && m.mediaUrl && typeof m.mediaUrl === 'string' && m.mediaUrl.startsWith('http') && !seen.has(m.mediaUrl)) {
        seen.add(m.mediaUrl);
        pool.push({
          id: `mem-${m.id}`,
          url: m.mediaUrl,
          caption: m.title || m.description || 'Squad Memory'
        });
      }
    });

    // 2. Add member photos with valid URLs
    members.forEach(mbr => {
      if (mbr && mbr.photo && typeof mbr.photo === 'string' && mbr.photo.startsWith('http') && !seen.has(mbr.photo)) {
        seen.add(mbr.photo);
        pool.push({
          id: `mbr-${mbr.id}`,
          url: mbr.photo,
          caption: `${mbr.name} · ${mbr.role || 'Squad Member'}`
        });
      }
    });

    // 3. Add base curated photos
    SQUAD_ALBUM_PHOTOS.forEach(p => {
      if (p.url && !seen.has(p.url)) {
        seen.add(p.url);
        pool.push(p);
      }
    });

    return pool.length > 0 ? pool : SQUAD_ALBUM_PHOTOS;
  }, [memories, members]);

  const [lightboxIndex, setLightboxIndex] = useState(null);
  const isLightboxOpen = lightboxIndex !== null;

  // Multiply to create an authentic dense screen-filling matrix
  const displayBubbles = useMemo(() => {
    if (photos.length === 0) return [];
    const targetCount = 132;
    const repeatCount = Math.max(1, Math.ceil(targetCount / photos.length));
    const list = [];
    for (let i = 0; i < repeatCount; i++) {
      photos.forEach((item, idx) => {
        list.push({
          ...item,
          uniqueKey: `${i}-${idx}`,
          originalIndex: idx
        });
      });
    }
    return list.slice(0, targetCount);
  }, [photos]);

  // ══════════════════════════════════════════════════════════════
  //  GAUSSIAN LENS PHYSICS ENGINE (60 FPS requestAnimationFrame)
  // ══════════════════════════════════════════════════════════════
  const bubbleRefs = useRef([]);
  const centersRef = useRef([]);
  const stateRef = useRef([]);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const rafRef = useRef(null);

  const measureCenters = useCallback(() => {
    centersRef.current = bubbleRefs.current.map(el => {
      if (!el) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    });

    if (stateRef.current.length !== bubbleRefs.current.length) {
      stateRef.current = bubbleRefs.current.map(() => ({
        s: 1,
        tx: 0,
        ty: 0,
        b: 1
      }));
    }
  }, []);

  useEffect(() => {
    measureCenters();
    window.addEventListener('resize', measureCenters, { passive: true });
    return () => window.removeEventListener('resize', measureCenters);
  }, [measureCenters, displayBubbles]);

  const tickPhysics = useCallback(() => {
    const domEls = bubbleRefs.current;
    const centers = centersRef.current;
    const states = stateRef.current;
    const { x: px, y: py, active } = pointerRef.current;

    let isMoving = false;
    const sigma = 66; // Gaussian spread
    const twoSigmaSq = 2 * sigma * sigma;

    for (let i = 0; i < domEls.length; i++) {
      const el = domEls[i];
      const center = centers[i];
      const st = states[i];
      if (!el || !center || !st) continue;

      let targetScale = 1;
      let targetTx = 0;
      let targetTy = 0;
      let targetBrightness = 1;

      if (active) {
        const dx = center.x - px;
        const dy = center.y - py;
        const dist = Math.hypot(dx, dy);
        const gaussian = Math.exp(-(dist * dist) / twoSigmaSq);

        if (gaussian > 0.002) {
          targetScale = 0.95 + (1.85 - 0.95) * gaussian;
          const invDist = dist > 0.5 ? 1 / dist : 0;
          const pushForce = 8 * gaussian;
          targetTx = dx * invDist * pushForce;
          targetTy = dy * invDist * pushForce;
          targetBrightness = 1 + (1.35 - 1) * gaussian;
        } else {
          targetScale = 0.95 + (1 - 0.95) * 0.6;
        }
      }

      // Smooth Lerp factor (0.22)
      st.s += (targetScale - st.s) * 0.22;
      st.tx += (targetTx - st.tx) * 0.22;
      st.ty += (targetTy - st.ty) * 0.22;
      st.b += (targetBrightness - st.b) * 0.22;

      el.style.transform = `translate3d(${st.tx.toFixed(2)}px, ${st.ty.toFixed(2)}px, 0) scale(${st.s.toFixed(3)})`;
      el.style.filter = st.b > 1.005 ? `brightness(${st.b.toFixed(3)})` : '';
      
      const elevated = Math.max(0, st.s - 1);
      el.style.zIndex = elevated > 0.02 ? String(10 + Math.round(elevated * 40)) : '1';

      if (
        Math.abs(st.s - targetScale) > 0.002 ||
        Math.abs(st.tx - targetTx) > 0.15 ||
        Math.abs(st.ty - targetTy) > 0.15 ||
        Math.abs(st.b - targetBrightness) > 0.003
      ) {
        isMoving = true;
      }
    }

    if (active || isMoving) {
      rafRef.current = requestAnimationFrame(tickPhysics);
    } else {
      rafRef.current = null;
    }
  }, []);

  const requestTick = useCallback(() => {
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(tickPhysics);
    }
  }, [tickPhysics]);

  const handlePointerMove = useCallback((e) => {
    pointerRef.current.x = e.clientX;
    pointerRef.current.y = e.clientY;
    pointerRef.current.active = true;
    requestTick();
  }, [requestTick]);

  const handlePointerEnd = useCallback(() => {
    pointerRef.current.active = false;
    requestTick();
  }, [requestTick]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Lightbox controls
  const total = photos.length;
  const nextPhoto = useCallback(() => {
    setLightboxIndex(prev => (prev === null ? 0 : (prev + 1) % total));
  }, [total]);

  const prevPhoto = useCallback(() => {
    setLightboxIndex(prev => (prev === null ? 0 : (prev - 1 + total) % total));
  }, [total]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'Escape') setLightboxIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, nextPhoto, prevPhoto]);

  const currentPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <div className="squad-album-root">
      {/* ── AMBIENT STUDIO MESH BACKDROP (MATCHES WEBSITE THEME) ── */}
      <div className="album-theme-backdrop" aria-hidden="true">
        <div className="album-orb orb-alpha" />
        <div className="album-orb orb-beta" />
        <div className="album-orb orb-gamma" />
      </div>

      {/* ── SLIM HEADER ── */}
      <header className="squad-album-header">
        <button 
          type="button" 
          onClick={onBackHome} 
          className="album-back-link"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="album-header-title-block">
          <span className="album-eyebrow">NATPE THUNAI</span>
          <div className="album-heading-row">
            <span className="album-line-decor left" />
            <h1 className="album-hero-title">The Memories We Have</h1>
            <span className="album-heart-icon">💛</span>
            <span className="album-line-decor right" />
          </div>
        </div>

        <div className="album-header-spacer" aria-hidden="true" />
      </header>

      {/* ── FULL-SCREEN BUBBLE MATRIX ── */}
      <div 
        className="squad-album-canvas"
        onPointerDown={handlePointerMove}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        {/* Ambient Heart Aura Glow */}
        <div className="album-ambient-aura" aria-hidden="true">
          <svg viewBox="0 0 100 90" preserveAspectRatio="xMidYMid meet" className="aura-svg">
            <defs>
              <radialGradient id="album-heart-glow" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.75" />
                <stop offset="45%" stopColor="#ec4899" stopOpacity="0.65" />
                <stop offset="85%" stopColor="#8b5cf6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path
              d="M50 84 C 18 62, 4 42, 4 24 C 4 11, 15 2, 30 2 C 40 2, 46 9, 50 18 C 54 9, 60 2, 70 2 C 85 2, 96 11, 96 24 C 96 42, 82 62, 50 84 Z"
              fill="url(#album-heart-glow)"
            />
          </svg>
        </div>

        {/* Dense Responsive Bubble Grid */}
        <div className="album-bubble-grid">
          {displayBubbles.map((bubble, idx) => (
            <button
              key={bubble.uniqueKey}
              ref={el => { bubbleRefs.current[idx] = el; }}
              type="button"
              onClick={() => setLightboxIndex(bubble.originalIndex)}
              className="album-photo-bubble"
              aria-label={`Open photo ${bubble.originalIndex + 1}`}
            >
              <img
                src={bubble.url}
                alt=""
                loading="lazy"
                decoding="async"
                className="bubble-img"
                onError={(e) => {
                  e.currentTarget.src = r2Photo('farish.jpg');
                }}
              />
              <span className="bubble-ring-overlay" />
            </button>
          ))}
        </div>
      </div>

      {/* ── CLEAN IMMERSIVE LIGHTBOX ── */}
      {isLightboxOpen && currentPhoto && (
        <div className="album-lightbox-backdrop" onClick={() => setLightboxIndex(null)}>
          {/* Close Button */}
          <button 
            type="button" 
            onClick={() => setLightboxIndex(null)}
            className="lightbox-close-btn"
            aria-label="Close photo"
          >
            <X size={22} />
          </button>

          {/* Prev Button */}
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
            className="lightbox-nav-btn left"
            aria-label="Previous photo"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Main Image */}
          <div className="lightbox-img-container" onClick={e => e.stopPropagation()}>
            <img 
              src={currentPhoto.url} 
              alt={currentPhoto.caption}
              className="lightbox-img" 
              onError={(e) => {
                e.currentTarget.src = r2Photo('farish.jpg');
              }}
            />
            {currentPhoto.caption && (
              <p className="lightbox-img-caption">{currentPhoto.caption}</p>
            )}
          </div>

          {/* Next Button */}
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
            className="lightbox-nav-btn right"
            aria-label="Next photo"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}
    </div>
  );
}
