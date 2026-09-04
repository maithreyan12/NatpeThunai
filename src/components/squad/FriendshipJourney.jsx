import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Sparkles, Edit3 } from 'lucide-react';
import { r2Photo } from '../../services';
import { subscribeToJourneyR2, INITIAL_JOURNEY_MILESTONES } from '../../services/r2Database';
import { isAuthorizedAdmin, onAuthChange } from '../../firebase';
import './FriendshipJourney.css';

function FriendshipJourney({ currentUser }) {
  const [isAdmin, setIsAdmin] = useState(() => isAuthorizedAdmin(currentUser));
  const [milestones, setMilestones] = useState(INITIAL_JOURNEY_MILESTONES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Sync auth state: only authorized admins can see the edit pencil
  useEffect(() => {
    if (currentUser !== undefined) {
      setIsAdmin(isAuthorizedAdmin(currentUser));
      return;
    }
    const unsub = onAuthChange(user => {
      setIsAdmin(isAuthorizedAdmin(user));
    });
    return () => unsub();
  }, [currentUser]);

  // Live sync with Cloudflare R2
  useEffect(() => {
    const unsub = subscribeToJourneyR2((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setMilestones(data);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % (milestones.length || 1));
    }, 5500);
    return () => clearInterval(timer);
  }, [isPlaying, milestones.length]);

  const currentMilestone = milestones[currentIndex] || milestones[0] || INITIAL_JOURNEY_MILESTONES[0];

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentIndex(prev => (prev - 1 + milestones.length) % milestones.length);
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentIndex(prev => (prev + 1) % milestones.length);
  };

  return (
    <section id="journey" className="journey-section">
      <div className="section-header">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          <div className="badge-pill">
            <Sparkles size={14} />
            <span>THE SQUAD EVOLUTION</span>
          </div>
          {isAdmin && (
            <a
              href="#admin?tab=journey"
              onClick={() => {
                try { localStorage.setItem('admin_initial_tab', 'journey'); } catch {}
                window.dispatchEvent(new CustomEvent('open-admin-tab', { detail: { tab: 'journey', milestoneIdx: currentIndex } }));
              }}
              className="admin-section-edit-trigger"
              title="Edit Journey Milestones in Admin Console"
            >
              <Edit3 size={13} />
              <span>Edit Eras</span>
            </a>
          )}
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
          {milestones.map((m, idx) => {
            const isActive = idx === currentIndex;
            const isPassed = idx < currentIndex;
            return (
              <button
                key={m.stepLabel || idx}
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
            <div className="journey-photo-frame" style={{ position: 'relative' }}>
              <img 
                src={currentMilestone.photo} 
                alt={currentMilestone.title}
                className="journey-milestone-img"
              />
              {isAdmin && (
                <a
                  href="#admin?tab=journey"
                  onClick={() => {
                    try { localStorage.setItem('admin_initial_tab', 'journey'); } catch {}
                    window.dispatchEvent(new CustomEvent('open-admin-tab', { detail: { tab: 'journey', milestoneIdx: currentIndex } }));
                  }}
                  className="admin-card-edit-floating-pencil"
                  title={`Edit ${currentMilestone.stepLabel} in Admin Console`}
                >
                  <Edit3 size={14} />
                </a>
              )}

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

export default React.memo(FriendshipJourney);
