import React from 'react';
import { squadStats } from '../data/friends';
import { Heart, Compass, Coffee, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import './About.css';

export default function About() {
  const getStatIcon = (index) => {
    switch (index) {
      case 0: return <Heart className="stat-icon pink" size={24} />;
      case 1: return <Compass className="stat-icon blue" size={24} />;
      case 2: return <Coffee className="stat-icon amber" size={24} />;
      default: return <MessageCircle className="stat-icon purple" size={24} />;
    }
  };

  return (
    <section id="about" className="about-section">
      <div className="section-header">
        <div className="badge-pill glass-shine">
          <ShieldCheck size={14} className="accent-icon" />
          <span>Our Story</span>
        </div>
        <h2 className="section-title">
          Behind The <span className="gradient-text">Squad Vibe</span>
        </h2>
        <p className="section-desc">
          More than just friends — a tight-knit family built on trust, endless laughter, and unconditional support.
        </p>
      </div>

      {/* Main Glass Story Card */}
      <div className="glass-card story-card glass-shine">
        <div className="story-content">
          <div className="quote-mark">"</div>
          <p className="story-paragraph">
            <strong style={{ fontFamily: 'var(--font-tamil)' }}>நட்பே துணை</strong> translates to <em>"Friendship is our Support System"</em>. 
            From late-night study marathons and sudden road trips to celebrating every small win in life, 
            our squad was formed on the belief that true friendship lightens every burden and doubles every joy. 
            We hold no secrets, share every snack, and stand by each other through thick and thin.
          </p>
          <div className="story-footer-pill">
            <Sparkles size={16} />
            <span>Established 2019 • Connected Forever</span>
          </div>
        </div>
      </div>

      {/* Squad Stats Grid */}
      <div className="stats-grid">
        {squadStats.map((stat, idx) => (
          <div key={idx} className="glass-card stat-card interactive-card">
            <div className="stat-top">
              {getStatIcon(idx)}
              <span className="stat-value">{stat.value}</span>
            </div>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
