import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { r2Photo } from '../../services';
import './FriendshipJourney.css';

const JOURNEY_MILESTONES = [
  {
    stepLabel: "Chapter 1",
    tagline: "Where strangers met over canteen chai",
    title: "The Canteen Dawn & First Spark",
    description: "Spontaneous canteen tea conversations, awkward classroom ice-breakers, and the very first late-night laughs that unexpectedly formed the foundation of our circle.",
    quote: "Sometimes the strangers you meet in the hallway become the family you cannot imagine life without.",
    photo: r2Photo('Gracee.jpg'),
    badge: "Year 1 • Genesis",
    colorKey: "lavender",
    gangCount: "Squad Circle",
    attendees: [
      { name: "Grace", role: "The Spark ✨", photo: r2Photo('Gracee.jpg') },
      { name: "Farish", role: "The Mastermind 🧠", photo: r2Photo('farish.jpg') },
      { name: "Kafil", role: "The Creative Soul 🎨", photo: r2Photo('kafil.jpg') },
      { name: "Haniya", role: "The Chill Sloth 🦥", photo: r2Photo('hanuu.jpg') },
      { name: "Jaffreen", role: "The Sweet Heart 💖", photo: r2Photo('jaffreen.jpg') },
      { name: "Divyaaa", role: "The Sunshine ☀️", photo: r2Photo('Divyaa.jpg') }
    ],
    remainingCount: 8
  },
  {
    stepLabel: "Chapter 2",
    tagline: "Full tank, loud music, zero sleep",
    title: "Midnight Drives & Exam Chaos",
    description: "Countless midnight highway drives, high-volume Tamil bangers in Farish's car, exam panic group study sessions, and turning everyday college routines into pure adventure.",
    quote: "We didn't realize we were making lifelong history; we just knew we were laughing together.",
    photo: r2Photo('Heenuuu.jpg'),
    badge: "Year 2 • Chaos & Memories",
    colorKey: "blue",
    gangCount: "Squad Circle",
    attendees: [
      { name: "Heenuuu", role: "The Spark & Heart 💖", photo: r2Photo('Heenuuu.jpg') },
      { name: "Samuel", role: "The Joyful Soul 🌟", photo: r2Photo('samuel.jpg') },
      { name: "Afnaaan", role: "The Energy Dynamo ⚡", photo: r2Photo('affu.jpg') },
      { name: "Meshak", role: "Silent Strength 🛡️", photo: r2Photo('meshak.jpg') },
      { name: "Puppy", role: "The Chill Vibe 🎯", photo: r2Photo('Puppy.jpg') },
      { name: "Farish", role: "The Mastermind 🧠", photo: r2Photo('farish.jpg') }
    ],
    remainingCount: 8
  },
  {
    stepLabel: "Chapter 3",
    tagline: "When life got real, friendship was our sanctuary",
    title: "The Unbreakable Bond & Milestones",
    description: "Through individual triumphs, tough semesters, career milestones, and quiet moments when someone just needed a listening ear — friends stood side by side.",
    quote: "True friends don't just celebrate your sunny days; they stand with you through every unexpected storm.",
    photo: r2Photo('Divyaa.jpg'),
    badge: "Year 3 • Lifelong Trust",
    colorKey: "pink",
    gangCount: "Squad Circle",
    attendees: [
      { name: "Divyaaa", role: "The Sunshine ☀️", photo: r2Photo('Divyaa.jpg') },
      { name: "Harshitha", role: "Radiant Sunshine 🌻", photo: r2Photo('harshuuu.jpg') },
      { name: "Maithreyan", role: "Tech & Vibe Pilot 🚀", initial: "MA" },
      { name: "Gopika", role: "Graceful Heart 🌸", initial: "GO" },
      { name: "Jaffreen", role: "The Sweet Heart 💖", photo: r2Photo('jaffreen.jpg') },
      { name: "Puppy", role: "The Chill Vibe 🎯", photo: r2Photo('Puppy.jpg') }
    ],
    remainingCount: 8
  },
  {
    stepLabel: "Chapter 4",
    tagline: "Still here. Still squad strong.",
    title: "Eternal Natpe Thunai Sanctuary",
    description: "Our bond continues to deepen every single day. Distance or busy careers mean nothing; whenever we reconnect, it's as if zero seconds have passed. Natpe Thunai forever.",
    quote: "Namma friendship perfect illa, aana romba real. Squad strong for infinity. ❤️🫂♾️",
    photo: r2Photo('Puppy.jpg'),
    badge: "Year 4 & Forever",
    colorKey: "peach",
    gangCount: "Squad Family",
    attendees: [
      { name: "Grace", role: "The Spark ✨", photo: r2Photo('Gracee.jpg') },
      { name: "Heenuuu", role: "The Heart 💖", photo: r2Photo('Heenuuu.jpg') },
      { name: "Kafil", role: "Creative Soul 🎨", photo: r2Photo('kafil.jpg') },
      { name: "Divyaaa", role: "The Sunshine ☀️", photo: r2Photo('Divyaa.jpg') },
      { name: "Haniya", role: "The Chill Sloth 🦥", photo: r2Photo('hanuu.jpg') },
      { name: "Puppy", role: "The Chill Vibe 🎯", photo: r2Photo('Puppy.jpg') }
    ],
    remainingCount: 8
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
          <span>THE SQUAD EVOLUTION</span>
        </div>
        <h2 className="section-title">
          Our Friendship Journey
        </h2>
        <p className="section-desc">
          How small canteen moments, midnight highway runs, and unconditional support evolved into our lifelong bond.
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

            {/* Squad Members Presence with Avatar Stack */}
            <div className="journey-squad-presence">
              <div className="presence-label-row">
                <span className="presence-label">Gang in this Era:</span>
                <span className="presence-count-pill">{currentMilestone.gangCount}</span>
              </div>

              <div className="presence-avatars-row">
                {currentMilestone.attendees.map((att, i) => (
                  <div key={i} className="presence-avatar-chip" title={`${att.name} • ${att.role}`}>
                    {att.photo ? (
                      <img src={att.photo} alt={att.name} className="presence-avatar-img" />
                    ) : (
                      <div className="presence-avatar-initial">
                        {att.initial || att.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="presence-avatar-name">{att.name}</span>
                  </div>
                ))}
                {currentMilestone.remainingCount > 0 && (
                  <span className="presence-plus-pill">
                    +{currentMilestone.remainingCount} more
                  </span>
                )}
              </div>
            </div>

            {/* Play / Pause & Navigation Controls */}
            <div className="journey-actions-row">
              <button 
                type="button"
                className="btn-secondary journey-nav-circle"
                onClick={handlePrev}
                aria-label="Previous Chapter"
              >
                <ChevronLeft size={16} />
              </button>

              <button 
                type="button"
                className="btn-primary journey-play-toggle-btn"
                onClick={() => setIsPlaying(prev => !prev)}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} fill="white" />}
                <span>{isPlaying ? 'Pause Journey' : 'Play Story'}</span>
              </button>

              <button 
                type="button"
                className="btn-secondary journey-nav-circle"
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
