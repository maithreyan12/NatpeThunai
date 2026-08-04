import React from 'react';
import { Heart, Sparkles, ArrowDownRight, Compass, Camera, Flame } from 'lucide-react';
import './Hero.css';

export default function Hero({ onExplore, onMeetFriends }) {
  return (
    <section id="hero" className="hero-section">
      <div className="hero-content">
        {/* iOS Glass Pill Badge */}
        <div className="hero-badge-container fade-in">
          <div className="badge-pill hero-pill glass-shine">
            <Sparkles size={14} className="sparkle-icon" />
            <span><span style={{ fontFamily: 'var(--font-tamil)' }}>நட்பே துணை</span> • Eternal Bond</span>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="hero-title" style={{ fontFamily: 'var(--font-tamil)' }}>
          நட்பே <span className="gradient-text">துணை</span>
        </h1>

        {/* Tagline */}
        <p className="hero-tagline">
          Laughter that lasts, memories that never fade, and bonds that withstand the test of time. Welcome to our squad's official digital sanctuary.
        </p>

        {/* Action Buttons */}
        <div className="hero-actions">
          <button 
            className="hero-btn primary-btn glass-shine"
            onClick={onMeetFriends}
          >
            <span>Meet The Squad</span>
            <ArrowDownRight size={18} />
          </button>
          
          <button 
            className="hero-btn secondary-btn"
            onClick={onExplore}
          >
            <span>Our Story</span>
            <Compass size={18} />
          </button>
        </div>

        {/* Floating iOS Feature Badges */}
        <div className="hero-floating-badges">
          <div className="floating-card glass-card badge-1">
            <div className="badge-icon-box pink">
              <Heart size={16} />
            </div>
            <div className="badge-text-box">
              <span className="badge-title">Pure Vibe</span>
              <span className="badge-sub">100% Unfiltered</span>
            </div>
          </div>

          <div className="floating-card glass-card badge-2">
            <div className="badge-icon-box blue">
              <Camera size={16} />
            </div>
            <div className="badge-text-box">
              <span className="badge-title">Memories</span>
              <span className="badge-sub">Captured Forever</span>
            </div>
          </div>

          <div className="floating-card glass-card badge-3">
            <div className="badge-icon-box amber">
              <Flame size={16} />
            </div>
            <div className="badge-text-box">
              <span className="badge-title">No Drama</span>
              <span className="badge-sub">Only Good Energy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
