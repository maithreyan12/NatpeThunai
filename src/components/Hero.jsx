import React from 'react';
import { 
  Calendar, 
  Film, 
  Plus 
} from 'lucide-react';
import './Hero.css';

export default function Hero({ 
  onExploreTimeline, 
  onWatchReel, 
  onOpenAddMemory 
}) {
  return (
    <section id="hero" className="hero-community-section">
      {/* Soft Ambient Spotlight */}
      <div className="hero-ambient-soft-spot" aria-hidden="true" />

      <div className="hero-community-content">
        {/* Prominent Period Pill */}
        <div className="hero-period-badge">
          <span className="period-dot" />
          <span className="period-text">TIMELESS MEMORIES</span>
          <span className="period-divider">•</span>
          <span className="period-sub">SQUAD SANCTUARY</span>
        </div>

        {/* Main Headline */}
        <div className="hero-title-group">
          <h1 className="hero-main-title">
            <span className="hero-tamil-name" style={{ fontFamily: 'var(--font-tamil)' }}>நட்பே துணை</span>
            <span className="hero-english-name">Natpethunai</span>
          </h1>

          <h2 className="hero-subtitle">
            Our memories. Our moments. Our bond.
          </h2>
        </div>

        {/* Emotional Supporting Text */}
        <p className="hero-supporting-copy">
          A place to keep the little moments that became our biggest memories.
          From late-night talks and road trips to milestones celebrated side-by-side.
        </p>

        {/* Soft, Calibrated Button System (No Harsh Neon Gradients) */}
        <div className="hero-actions-dock">
          <button 
            className="btn-primary hero-btn-main" 
            onClick={onOpenAddMemory}
          >
            <Plus size={16} />
            <span>Add a Memory</span>
          </button>

          <button 
            className="btn-secondary hero-btn-sub" 
            onClick={onExploreTimeline}
          >
            <Calendar size={16} />
            <span>Explore Timeline</span>
          </button>

          <button 
            className="btn-outline hero-btn-ghost" 
            onClick={onWatchReel}
          >
            <Film size={16} />
            <span>Watch Reel</span>
          </button>
        </div>

        {/* Floating Physical Memory Polaroids */}
        <div className="hero-polaroid-stage" aria-label="Featured memories">
          {/* Chapter 1 Polaroid */}
          <div className="polaroid-card card-rotate-left">
            <div className="polaroid-photo-frame">
              <img src="/photos/friend1.jpg" alt="Origins" className="polaroid-img" />
              <span className="polaroid-year-tag">Origins</span>
            </div>
            <div className="polaroid-caption">
              <span className="caption-heading">Where it all began</span>
              <span className="caption-sub">First laughs & college dawn</span>
            </div>
          </div>

          {/* Chapter 2 Polaroid */}
          <div className="polaroid-card card-elevated">
            <div className="polaroid-photo-frame">
              <img src="/photos/friend2.jpg" alt="Road Trips" className="polaroid-img" />
              <span className="polaroid-year-tag">Adventures</span>
            </div>
            <div className="polaroid-caption">
              <span className="caption-heading">Spontaneous Drives</span>
              <span className="caption-sub">Midnight chai runs</span>
            </div>
          </div>

          {/* Chapter 3 Polaroid */}
          <div className="polaroid-card card-rotate-right">
            <div className="polaroid-photo-frame">
              <img src="/photos/friend3.jpg" alt="Milestones" className="polaroid-img" />
              <span className="polaroid-year-tag">Milestones</span>
            </div>
            <div className="polaroid-caption">
              <span className="caption-heading">Unforgettable Wins</span>
              <span className="caption-sub">Standing by each other</span>
            </div>
          </div>

          {/* Chapter 4 Polaroid */}
          <div className="polaroid-card card-rotate-far-right">
            <div className="polaroid-photo-frame">
              <img src="/photos/friend4.jpg" alt="Still Together" className="polaroid-img" />
              <span className="polaroid-year-tag">Forever</span>
            </div>
            <div className="polaroid-caption">
              <span className="caption-heading">Still Unbreakable</span>
              <span className="caption-sub">Today & forever</span>
            </div>
          </div>
        </div>

        {/* Subtle Timeline Milestones Bar */}
        <div className="hero-timeline-strip">
          <div className="milestone-chip">
            <span className="milestone-year">Origin</span>
            <span className="milestone-label">First Chapter</span>
          </div>
          <div className="milestone-divider" />
          <div className="milestone-chip">
            <span className="milestone-year">Journeys</span>
            <span className="milestone-label">Adventures</span>
          </div>
          <div className="milestone-divider" />
          <div className="milestone-chip">
            <span className="milestone-year">Moments</span>
            <span className="milestone-label">Deepened Bond</span>
          </div>
          <div className="milestone-divider" />
          <div className="milestone-chip active">
            <span className="milestone-year">Forever</span>
            <span className="milestone-label">Eternal Squad</span>
          </div>
        </div>
      </div>
    </section>
  );
}
