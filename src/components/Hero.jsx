import React from 'react';
import { ArrowDownRight, Compass, Heart, Camera, Flame } from 'lucide-react';
import './Hero.css';

export default function Hero({ onExplore, onMeetFriends }) {
  return (
    <section id="hero" className="hero-section">
      {/* Studio Radial Glow Behind Hero */}
      <div className="hero-ambient-glow" aria-hidden="true"></div>

      <div className="hero-content">
        {/* Small Specular Pill Badge */}
        <div className="hero-badge-wrapper">
          <div className="badge-pill hero-pill liquid-shimmer">
            <span className="badge-dot"></span>
            <span className="badge-text">
              <strong style={{ fontFamily: 'var(--font-tamil)' }}>நட்பே துணை</strong> • SQUAD SANCTUARY 2026
            </span>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="hero-headline">
          <span className="hero-title-tamil" style={{ fontFamily: 'var(--font-tamil)' }}>நட்பே துணை</span>
          <span className="hero-subheadline">
            Where Moments Turn Into <span className="gradient-text-brand">Forever</span>
          </span>
        </h1>

        {/* Tagline Description */}
        <p className="hero-description">
          An ultra-premium sanctuary celebrating unfiltered laughter, unconditional loyalty, 
          and the unbreakable bonds of our close circle.
        </p>

        {/* Primary & Secondary Action Buttons */}
        <div className="hero-actions-row">
          <button 
            className="liquid-btn-primary liquid-shimmer"
            onClick={onMeetFriends}
          >
            <span className="btn-text">Meet The Squad</span>
            <div className="btn-icon-circle">
              <ArrowDownRight size={16} />
            </div>
          </button>
          
          <button 
            className="liquid-btn-secondary"
            onClick={onExplore}
          >
            <Compass size={18} className="secondary-btn-icon" />
            <span className="btn-text">Our Journey</span>
          </button>
        </div>

        {/* Floating Spatial Feature Slabs */}
        <div className="hero-spatial-cards">
          <div className="spatial-card glass-card interactive-slab card-vibe">
            <div className="card-icon-pill rose">
              <Heart size={16} />
            </div>
            <div className="card-info">
              <span className="card-label">Pure Vibe</span>
              <span className="card-metric">100% Unfiltered</span>
            </div>
          </div>

          <div className="spatial-card glass-card interactive-slab card-memories">
            <div className="card-icon-pill blue">
              <Camera size={16} />
            </div>
            <div className="card-info">
              <span className="card-label">Squad Moments</span>
              <span className="card-metric">Captured Forever</span>
            </div>
          </div>

          <div className="spatial-card glass-card interactive-slab card-energy">
            <div className="card-icon-pill amber">
              <Flame size={16} />
            </div>
            <div className="card-info">
              <span className="card-label">Unbreakable</span>
              <span className="card-metric">Zero Drama</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
