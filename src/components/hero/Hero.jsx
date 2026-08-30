import React from 'react';
import { 
  Calendar, 
  Film, 
  Heart,
  Users,
  Sparkles,
  Flame,
  Clock,
  Compass
} from 'lucide-react';
import './Hero.css';

export default function Hero({ 
  onExploreTimeline, 
  onWatchReel, 
  onReadStory,
  onMeetSquad,
  totalMembers = 15
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
              <span className="stat-number">100+ Stories</span>
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

        {/* Interactive Dynamic Squad Memory Mosaic Fan */}
        <div className="hero-polaroid-stage" aria-label="Featured collective memories">
          {/* Moment 1: Canteen Talks */}
          <div className="polaroid-card card-rotate-left">
            <div className="polaroid-photo-frame">
              <img src="/photos/friend1.jpg" alt="First Chapter Canteen Talks" className="polaroid-img" />
              <span className="polaroid-year-tag">Chapter 1</span>
            </div>
            <div className="polaroid-caption">
              <span className="caption-heading">Where It All Began</span>
              <span className="caption-sub">Canteen tea & first icebreakers</span>
            </div>
          </div>

          {/* Moment 2: Highway Drives */}
          <div className="polaroid-card card-elevated">
            <div className="polaroid-photo-frame">
              <img src="/photos/friend2.jpg" alt="Midnight Highway Road Trips" className="polaroid-img" />
              <span className="polaroid-year-tag">Adventures</span>
            </div>
            <div className="polaroid-caption">
              <span className="caption-heading">Midnight Highway Runs</span>
              <span className="caption-sub">Full tank & high bass anthems</span>
            </div>
          </div>

          {/* Moment 3: Celebrations */}
          <div className="polaroid-card card-rotate-right">
            <div className="polaroid-photo-frame">
              <img src="/photos/friend3.jpg" alt="Squad Milestones & Festivities" className="polaroid-img" />
              <span className="polaroid-year-tag">Milestones</span>
            </div>
            <div className="polaroid-caption">
              <span className="caption-heading">Celebration Days</span>
              <span className="caption-sub">Wins, birthdays & candid smiles</span>
            </div>
          </div>

          {/* Moment 4: Eternal Sanctuary */}
          <div className="polaroid-card card-rotate-far-right">
            <div className="polaroid-photo-frame">
              <img src="/photos/friend4.jpg" alt="Squad Forever" className="polaroid-img" />
              <span className="polaroid-year-tag">Forever</span>
            </div>
            <div className="polaroid-caption">
              <span className="caption-heading">Squad Forever. Unbreakable.</span>
              <span className="caption-sub">No matter the time or distance</span>
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
