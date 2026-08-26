import React from 'react';
import { squadStats } from '../data/friends';
import { Heart, Compass, Coffee, MessageCircle, ShieldCheck, Sparkles, Quote } from 'lucide-react';
import './About.css';

export default function About() {
  const getStatIcon = (index) => {
    switch (index) {
      case 0: return <Heart className="stat-glyph rose" size={22} />;
      case 1: return <Compass className="stat-glyph blue" size={22} />;
      case 2: return <Coffee className="stat-glyph amber" size={22} />;
      default: return <MessageCircle className="stat-glyph purple" size={22} />;
    }
  };

  return (
    <section id="about" className="about-section">
      <div className="section-header">
        <div className="badge-pill liquid-shimmer">
          <ShieldCheck size={15} className="header-badge-icon" />
          <span>OUR ESSENCE</span>
        </div>
        <h2 className="section-title">
          Behind The <span className="gradient-text-brand">Squad Sanctuary</span>
        </h2>
        <p className="section-desc">
          More than just childhood friends — an enduring digital collective built on loyalty, unhinged laughter, and lifelong trust.
        </p>
      </div>

      {/* Editorial Liquid Glass Story Slab */}
      <div className="glass-card story-slab liquid-shimmer">
        <div className="story-slab-inner">
          <div className="quote-mark-icon">
            <Quote size={48} />
          </div>
          
          <p className="story-lead-paragraph">
            <strong style={{ fontFamily: 'var(--font-tamil)' }}>நட்பே துணை</strong> means <em>"Friendship is our Support System"</em>. 
            From spontaneous night road trips and college chaos to celebrating every milestone, 
            our brotherhood was founded on a simple truth: genuine friendship turns every challenge into an adventure.
          </p>

          <div className="story-meta-pill">
            <Sparkles size={14} className="sparkle-accent" />
            <span>ESTABLISHED 2019 • CONNECTED ACROSS TIME</span>
          </div>
        </div>
      </div>

      {/* 4 Apple-Inspired Glass Metric Slabs */}
      <div className="stats-metric-grid">
        {squadStats.map((stat, idx) => (
          <div key={idx} className="glass-card stat-metric-card interactive-slab">
            <div className="stat-icon-wrapper">
              {getStatIcon(idx)}
            </div>
            <div className="stat-numeric-value">{stat.value}</div>
            <div className="stat-metric-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
