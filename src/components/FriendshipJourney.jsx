import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import './FriendshipJourney.css';

const JOURNEY_MILESTONES = [
  {
    stepLabel: "Chapter 1",
    tagline: "Where our story started",
    title: "The First Chapter",
    description: "Spontaneous tea stall conversations, awkward ice-breakers, and the very first late-night laughs that unexpectedly formed the foundation of our circle.",
    quote: "Sometimes the strangers you meet in the hallway become the people you cannot imagine life without.",
    photo: "/photos/friend1.jpg",
    badge: "Beginning of the Journey",
    colorKey: "lavender"
  },
  {
    stepLabel: "Chapter 2",
    tagline: "More memories, more moments",
    title: "Adventures & Chaos",
    description: "Countless midnight drives, exam panic sessions, inside jokes that nobody else would ever understand, and turning everyday college routines into pure adventure.",
    quote: "We didn't realize we were making memories, we just knew we were having fun.",
    photo: "/photos/friend2.jpg",
    badge: "Shared Experiences",
    colorKey: "blue"
  },
  {
    stepLabel: "Chapter 3",
    tagline: "Somehow, the ordinary became unforgettable",
    title: "The Unbreakable Bond",
    description: "Through individual triumphs, career milestones, and quiet moments when someone just needed a listening ear — friendship proved to be our true sanctuary.",
    quote: "True friends don't just celebrate your sunny days; they stand with you through every unexpected storm.",
    photo: "/photos/friend3.jpg",
    badge: "Lifelong Trust",
    colorKey: "pink"
  },
  {
    stepLabel: "Chapter 4",
    tagline: "Still here. Still together.",
    title: "Eternal Friendship",
    description: "Our bond continues to deepen every single day. Distance or busy lives mean nothing; when we reconnect, it's as if zero seconds have passed. Natpe Thunai forever.",
    quote: "Our memories. Our moments. Our bond.",
    photo: "/photos/friend4.jpg",
    badge: "Always Together",
    colorKey: "peach"
  }
];

export default function FriendshipJourney() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % JOURNEY_MILESTONES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const currentMilestone = JOURNEY_MILESTONES[currentIndex];

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentIndex(prev => (prev - 1 + JOURNEY_MILESTONES.length) % JOURNEY_MILESTONES.length);
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentIndex(prev => (prev + 1) % JOURNEY_MILESTONES.length);
  };

  return (
    <section id="journey" className="journey-section">
      <div className="section-header">
        <div className="badge-pill">
          <Sparkles size={14} />
          <span>FRIENDSHIP EVOLUTION</span>
        </div>
        <h2 className="section-title">
          Our Friendship Journey
        </h2>
        <p className="section-desc">
          How small moments, shared laughter, and quiet support evolved into our lifelong bond.
        </p>
      </div>

      <div className="journey-stage-card">
        {/* Top Stepper Scrubber */}
        <div className="journey-stepper-bar">
          {JOURNEY_MILESTONES.map((m, idx) => {
            const isActive = idx === currentIndex;
            const isPassed = idx < currentIndex;
            return (
              <button
                key={m.stepLabel}
                className={`stepper-step ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                onClick={() => { setCurrentIndex(idx); setIsPlaying(false); }}
              >
                <div className="step-indicator">
                  <span className="step-dot" />
                </div>
                <div className="step-meta">
                  <span className="step-year">{m.stepLabel}</span>
                  <span className="step-title-hint">{m.title}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Cinematic Milestone Display */}
        <div className="journey-display-viewport">
          {/* Left Column: Photo Presentation */}
          <div className="journey-photo-col">
            <div className="journey-photo-frame">
              <img 
                src={currentMilestone.photo} 
                alt={currentMilestone.title}
                className="journey-milestone-img" 
                key={currentMilestone.stepLabel}
              />
              <div className="journey-floating-year-badge">
                <span>{currentMilestone.stepLabel}</span>
              </div>
              <div className="journey-floating-badge">
                <span>{currentMilestone.badge}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Emotional Narrative */}
          <div className="journey-narrative-col" key={`narrative-${currentMilestone.stepLabel}`}>
            <span className="journey-tagline-text">{currentMilestone.tagline}</span>
            <h3 className="journey-heading">{currentMilestone.title}</h3>
            <p className="journey-body">{currentMilestone.description}</p>
            
            <div className="journey-quote-box">
              <span className="quote-mark">“</span>
              <p className="quote-text">{currentMilestone.quote}</p>
            </div>

            {/* Squad Members Presence with Photos */}
            <div className="journey-squad-presence">
              <span className="presence-label">Squad in this chapter:</span>
              <div className="presence-avatars-row">
                {[
                  { name: "Grace", photo: "/photos/friend1.jpg", role: "The Spark ✨" },
                  { name: "Heenuuu", photo: "/photos/friend2.jpg", role: "The Heart 💖" },
                  { name: "Divyaaa", photo: "/photos/friend3.jpg", role: "The Sunshine ☀️" },
                  { name: "Puppy", photo: "/photos/friend4.jpg", role: "The Vibe 🎯" }
                ].map(member => (
                  <div key={member.name} className="presence-avatar-pill" title={`${member.name} (${member.role})`}>
                    <img 
                      src={member.photo} 
                      alt={member.name} 
                      className="presence-avatar-img"
                      onError={(e) => { e.target.src = '/photos/friend1.jpg'; }}
                    />
                    <span className="presence-avatar-name">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="journey-controls-row">
              <button 
                className="btn-outline btn-sm journey-ctrl-btn" 
                onClick={handlePrev}
                aria-label="Previous Chapter"
              >
                <ChevronLeft size={16} />
              </button>

              <button 
                className="btn-secondary btn-sm journey-play-btn"
                onClick={() => setIsPlaying(prev => !prev)}
                aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? "Pause" : "Play Story"}</span>
              </button>

              <button 
                className="btn-outline btn-sm journey-ctrl-btn" 
                onClick={handleNext}
                aria-label="Next Chapter"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
