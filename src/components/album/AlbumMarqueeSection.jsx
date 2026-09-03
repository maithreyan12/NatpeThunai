import React, { useMemo } from 'react';
import { ArrowRight, Sparkles, Images } from 'lucide-react';
import { r2Photo } from '../../services/r2Assets';
import './AlbumMarqueeSection.css';

const DEFAULT_MARQUEE_PHOTOS = [
  r2Photo('farish.jpg'),
  r2Photo('kafil.jpg'),
  r2Photo('hanuu.jpg'),
  r2Photo('Gracee.jpg'),
  r2Photo('jaffreen.jpg'),
  r2Photo('affu.jpg'),
  r2Photo('meshak.jpg'),
  r2Photo('samuel.jpg'),
  r2Photo('harshuuu.jpg'),
  r2Photo('Puppy.jpg'),
  r2Photo('Divyaa.jpg'),
  r2Photo('Heenuuu.jpg'),
  r2Photo('friend1.jpg'),
  r2Photo('friend2.jpg'),
  r2Photo('friend3.jpg'),
  r2Photo('friend4.jpg'),
];

export default function AlbumMarqueeSection({ onOpenAlbum, members = [], memories = [] }) {
  // Aggregate valid photo URLs only
  const photoList = useMemo(() => {
    const list = [];
    const seen = new Set();

    // From memories
    memories.forEach(m => {
      if (m && m.mediaUrl && typeof m.mediaUrl === 'string' && m.mediaUrl.startsWith('http') && !seen.has(m.mediaUrl)) {
        seen.add(m.mediaUrl);
        list.push(m.mediaUrl);
      }
    });

    // From squad members
    members.forEach(mbr => {
      if (mbr && mbr.photo && typeof mbr.photo === 'string' && mbr.photo.startsWith('http') && !seen.has(mbr.photo)) {
        seen.add(mbr.photo);
        list.push(mbr.photo);
      }
    });

    // Curated fallbacks
    DEFAULT_MARQUEE_PHOTOS.forEach(url => {
      if (url && !seen.has(url)) {
        seen.add(url);
        list.push(url);
      }
    });

    return list.length > 0 ? list : DEFAULT_MARQUEE_PHOTOS;
  }, [members, memories]);

  // Split into Row 1 (even index) and Row 2 (odd index) with quadruple repetition for seamless loop
  const row1 = useMemo(() => {
    const evens = photoList.filter((_, i) => i % 2 === 0);
    return [...evens, ...evens, ...evens, ...evens];
  }, [photoList]);

  const row2 = useMemo(() => {
    const odds = photoList.filter((_, i) => i % 2 === 1);
    const source = odds.length > 0 ? odds : photoList;
    return [...source, ...source, ...source, ...source];
  }, [photoList]);

  return (
    <section className="album-marquee-section" id="album-teaser">
      <div className="section-header">
        <div className="badge-pill">
          <Sparkles size={14} />
          <span>NATPE THUNAI ARCHIVE</span>
        </div>

        <h2 className="section-title">
          The Memories <span className="highlight-gradient">We Have</span>
        </h2>

        <p className="section-desc">
          Hundreds of candid laughs, unscripted adventures, and golden moments captured forever in our interactive squad sphere.
        </p>

        <div className="marquee-cta-wrap">
          <button 
            type="button" 
            onClick={onOpenAlbum} 
            className="btn-primary marquee-open-album-btn"
            aria-label="Open Squad Album"
          >
            <Images size={16} />
            <span>Explore Interactive Album</span>
            <ArrowRight size={15} className="btn-arrow" />
          </button>
        </div>
      </div>

      {/* ── ROW 1 (SCROLLS LEFT) ── */}
      <div className="marquee-strip-container">
        <div className="marquee-edge-fade left" aria-hidden="true" />
        <div className="marquee-track scroll-left">
          {row1.map((src, i) => (
            <button
              key={`r1-${i}`}
              type="button"
              onClick={onOpenAlbum}
              className="marquee-photo-bubble"
              aria-label="View photo in album"
            >
              <img 
                src={src} 
                alt="" 
                loading="lazy" 
                decoding="async" 
                onError={(e) => {
                  e.currentTarget.src = r2Photo('farish.jpg');
                }}
              />
              <span className="marquee-bubble-glow" />
            </button>
          ))}
        </div>
        <div className="marquee-edge-fade right" aria-hidden="true" />
      </div>

      {/* ── ROW 2 (SCROLLS RIGHT) ── */}
      <div className="marquee-strip-container">
        <div className="marquee-edge-fade left" aria-hidden="true" />
        <div className="marquee-track scroll-right">
          {row2.map((src, i) => (
            <button
              key={`r2-${i}`}
              type="button"
              onClick={onOpenAlbum}
              className="marquee-photo-bubble"
              aria-label="View photo in album"
            >
              <img 
                src={src} 
                alt="" 
                loading="lazy" 
                decoding="async" 
                onError={(e) => {
                  e.currentTarget.src = r2Photo('farish.jpg');
                }}
              />
              <span className="marquee-bubble-glow" />
            </button>
          ))}
        </div>
        <div className="marquee-edge-fade right" aria-hidden="true" />
      </div>
    </section>
  );
}
