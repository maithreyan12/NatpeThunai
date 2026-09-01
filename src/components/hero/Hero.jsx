import React from 'react';
import {
  Calendar,
  Film,
  Heart,
  Users,
  Sparkles,
  Flame,
  Compass
} from 'lucide-react';
import './Hero.css';
import { r2Photo } from '../../services';

export default function Hero({
  onExploreTimeline,
  onWatchReel,
  onReadStory,
  onMeetSquad,
  _totalMembers = 15
}) {
  return (
    <section id="hero" className="hero-community-section">
      {/* Soft Ambient Spotlight */}
      <div className="hero-ambient-soft-spot" aria-hidden="true" />

      <div className="hero-community-content">
        {/* Prominent Period Pill */}
        <div className="hero-period-badge">
          <span className="period-dot" />
          <span className="period-text">SQUAD SANCTUARY</span>
          <span className="period-divider">•</span>
          <span className="period-sub">NATPE THUNAI</span>
        </div>

        {/* Main Headline */}
        <div className="hero-title-group">
          <h1 className="hero-main-title">
            <span className="hero-tamil-name" style={{ fontFamily: 'var(--font-tamil)' }}>நட்பே துணை</span>
            <span className="hero-english-name">Natpethunai</span>
          </h1>

          <h2 className="hero-subtitle">
            Our memories. Our moments. Our unbreakable bond.
          </h2>
        </div>

        {/* Emotional Supporting Text */}
        <p className="hero-supporting-copy">
          From first-year canteen tea and midnight highway drives to shared exam panic and lifelong celebrations.
          A timeless digital home for our squad.
        </p>

        {/* Calibrated Button System */}
        <div className="hero-actions-dock">
          <button
            className="btn-primary hero-btn-main"
            onClick={onReadStory}
          >
            <Heart size={16} fill="white" />
            <span>Read Namma Story</span>
          </button>

          <button
            className="btn-secondary hero-btn-sub"
            onClick={onMeetSquad || onExploreTimeline}
          >
            <Users size={16} />
            <span>Meet The Squad</span>
          </button>

          <button
            className="btn-outline hero-btn-ghost"
            onClick={onExploreTimeline}
          >
            <Calendar size={16} />
            <span>Memory Timeline</span>
          </button>

          <button
            className="btn-outline hero-btn-ghost"
            onClick={onWatchReel}
          >
            <Film size={16} />
            <span>Watch Reel</span>
          </button>
        </div>

        {/* Dynamic Squad Statistics Strip */}
        <div className="hero-stats-strip">
          <div className="hero-stat-card">
            <div className="stat-icon-wrapper">
              <Users size={18} />
            </div>
            <div className="stat-text-group">
              <span className="stat-number">Lifelong Gang</span>
              <span className="stat-desc">One Unbreakable Circle</span>
            </div>
          </div>

          <div className="hero-stat-divider" />

          <div className="hero-stat-card">
            <div className="stat-icon-wrapper">
              <Sparkles size={18} />
            </div>
            <div className="stat-text-group">
              <span className="stat-number">1000+ Stories</span>
              <span className="stat-desc">Shared Laughs & Banter</span>
            </div>
          </div>

          <div className="hero-stat-divider" />

          <div className="hero-stat-card">
            <div className="stat-icon-wrapper">
              <Compass size={18} />
            </div>
            <div className="stat-text-group">
              <span className="stat-number">Countless Drives</span>
              <span className="stat-desc">Road Trips & Hangouts</span>
            </div>
          </div>

          <div className="hero-stat-divider" />

          <div className="hero-stat-card">
            <div className="stat-icon-wrapper">
              <Flame size={18} />
            </div>
            <div className="stat-text-group">
              <span className="stat-number">Infinite ♾️</span>
              <span className="stat-desc">Natpe Thunai Forever</span>
            </div>
          </div>
        </div>

        {/* Interactive Dynamic Squad Memory Mosaic Fan — 3x2 Grid (3 Top / 3 Bottom) */}
        <div className="hero-polaroid-stage hero-polaroid-grid-3x2" aria-label="Major Squad Members">
          {/* ── ROW 1 ── */}
          {/* Member 1: Kafil */}
          <div className="polaroid-card card-rotate-left" onClick={onMeetSquad}>
            <div className="polaroid-photo-frame">
              <img
                src={r2Photo('kafil.jpg')}
                alt="Kafil"
                className="polaroid-img"
                style={{ objectPosition: 'center 8%' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/photos/kafil.jpg';
                }}
              />
              <span className="polaroid-year-tag">Core 01</span>
            </div>
            <div className="polaroid-caption">
              <span className="caption-heading">Kafil</span>
              <span className="caption-sub">The Creative Soul 🎨</span>
            </div>
          </div>

          {/* Member 2: Grace */}
          <div className="polaroid-card card-elevated" onClick={onMeetSquad}>
            <div className="polaroid-photo-frame">
              <img
                src={r2Photo('Gracee.jpg')}
                alt="Grace"
                className="polaroid-img"
                style={{ objectPosition: 'center 15%' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/photos/Gracee.jpg';
                }}
              />
              <span className="polaroid-year-tag">Core 02</span>
            </div>
            <div className="polaroid-caption">
              <span className="caption-heading">Grace</span>
              <span className="caption-sub">The Spark & Creative ✨</span>
            </div>
          </div>

          {/* Member 3: Jaffreen */}
          <div className="polaroid-card card-rotate-right" onClick={onMeetSquad}>
            <div className="polaroid-photo-frame">
              <img
                src={r2Photo('jaffreen.jpg')}
                alt="Jaffreen"
                className="polaroid-img"
                style={{ objectPosition: 'center 3%' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/photos/jaffreen.jpg';
                }}
              />
              <span className="polaroid-year-tag">Core 03</span>
            </div>
            <div className="polaroid-caption">
              <span className="caption-heading">Jaffreen</span>
              <span className="caption-sub">The Sweet Heart 💖</span>
            </div>
          </div>

          {/* ── ROW 2 ── */}
          {/* Member 4: Haniya */}
          <div className="polaroid-card card-rotate-left" onClick={onMeetSquad}>
            <div className="polaroid-photo-frame">
              <img
                src={r2Photo('hanuu.jpg')}
                alt="Haniya"
                className="polaroid-img"
                style={{ objectPosition: 'center 15%' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/photos/hanuu.jpg';
                }}
              />
              <span className="polaroid-year-tag">Core 04</span>
            </div>
            <div className="polaroid-caption">
              <span className="caption-heading">Haniya</span>
              <span className="caption-sub">The Chill Sloth 🦥</span>
            </div>
          </div>

          {/* Member 5: Farish Sharif */}
          <div className="polaroid-card card-elevated" onClick={onMeetSquad}>
            <div className="polaroid-photo-frame">
              <img
                src={r2Photo('farish.jpg')}
                alt="Farish"
                className="polaroid-img"
                style={{ objectPosition: 'center 6%' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/photos/farish.jpg';
                }}
              />
              <span className="polaroid-year-tag">Core 05</span>
            </div>
            <div className="polaroid-caption">
              <span className="caption-heading">Farish Sharif</span>
              <span className="caption-sub">The Mastermind 🧠</span>
            </div>
          </div>

          {/* Member 6: Divya */}
          <div className="polaroid-card card-rotate-far-right" onClick={onMeetSquad}>
            <div className="polaroid-photo-frame">
              <img
                src={r2Photo('Divyaa.jpg')}
                alt="Divya"
                className="polaroid-img"
                style={{ objectPosition: 'center 10%' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/photos/Divyaa.jpg';
                }}
              />
              <span className="polaroid-year-tag">Core 06</span>
            </div>
            <div className="polaroid-caption">
              <span className="caption-heading">Divyaa</span>
              <span className="caption-sub">The Sunshine ☀️</span>
            </div>
          </div>
        </div>

        {/* Interactive Era Timeline Milestones Bar */}
        <div className="hero-timeline-strip">
          <div className="milestone-chip">
            <span className="milestone-year">Year 1</span>
            <span className="milestone-label">The First Spark</span>
          </div>
          <div className="milestone-divider" />
          <div className="milestone-chip">
            <span className="milestone-year">Year 2</span>
            <span className="milestone-label">Adventures & Chaos</span>
          </div>
          <div className="milestone-divider" />
          <div className="milestone-chip">
            <span className="milestone-year">Year 3</span>
            <span className="milestone-label">Deepened Anchor</span>
          </div>
          <div className="milestone-divider" />
          <div className="milestone-chip active">
            <span className="milestone-year">Forever</span>
            <span className="milestone-label">Squad Sanctuary</span>
          </div>
        </div>
      </div>
    </section>
  );
}
