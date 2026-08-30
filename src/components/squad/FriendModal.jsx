import React, { useEffect } from 'react';
import { 
  X, 
  Quote, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  Camera,
  Heart
} from 'lucide-react';
import InstagramIcon from '../ui/InstagramIcon';
import './FriendModal.css';

export default function FriendModal({ friend, onClose, onFilterMemories }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  if (!friend) return null;

  return (
    <div className="spatial-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="spatial-sheet-card" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="sheet-grab-bar-area">
          <div className="sheet-grab-pill" />
        </div>

        {/* Close Button */}
        <button 
          className="sheet-close-btn" 
          onClick={onClose} 
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        {/* Header Photo & Identity */}
        <div className="modal-profile-header">
          <div className="modal-portrait-frame">
            {friend.photo ? (
              <img 
                src={friend.photo} 
                alt={friend.name} 
                className="modal-portrait-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('fallback-gradient');
                }}
              />
            ) : (
              <div 
                className="modal-portrait-gradient"
                style={{ background: friend.avatarGradient || 'linear-gradient(135deg, #6366f1, #a855f7)' }}
              >
                <span className="modal-avatar-initials">
                  {friend.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div className="modal-badge-chip">{friend.role || "Squad Member 🌟"}</div>
          </div>

          <h2 className="modal-friend-name">{friend.name}</h2>
          <span className="modal-friend-sub">
            "{friend.nickname || friend.name}" • Squad Sanctuary
          </span>
        </div>

        {/* Body Bio & Memory Blocks */}
        <div className="modal-content-blocks">
          {/* Bio Capsule */}
          <div className="modal-glass-block">
            <div className="block-header-label">
              <Sparkles size={14} className="glyph-rose" />
              <span>SQUAD IDENTITY</span>
            </div>
            <p className="block-body-text">{friend.bio}</p>
          </div>

          {/* Quote Capsule */}
          {friend.quote && (
            <div className="modal-glass-block">
              <div className="block-header-label">
                <Quote size={14} className="glyph-blue" />
                <span>SIGNATURE QUOTE</span>
              </div>
              <p className="quote-body-text">"{friend.quote}"</p>
            </div>
          )}

          {/* Friendship Journey Milestones */}
          {friend.journeyMilestones && friend.journeyMilestones.length > 0 && (
            <div className="modal-glass-block">
              <div className="block-header-label">
                <Clock size={14} className="glyph-amber" />
                <span>FRIENDSHIP JOURNEY MILESTONES</span>
              </div>
              <div className="modal-journey-timeline">
                {friend.journeyMilestones.map((jm, i) => (
                  <div key={jm.title || i} className="modal-journey-item">
                    <span className="timeline-year-bubble">✨</span>
                    <div className="timeline-text-content">
                      <strong className="timeline-milestone-title">{jm.title}</strong>
                      <p className="timeline-milestone-desc">{jm.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-action-footer">
          <button
            type="button"
            className="btn-secondary modal-memories-btn"
            onClick={() => {
              onClose();
              if (onFilterMemories) {
                onFilterMemories(friend.name);
              }
            }}
          >
            <Camera size={15} />
            <span>View {friend.name}'s Memories</span>
          </button>

          {friend.instagram && (
            <a
              href={friend.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary modal-ig-btn"
            >
              <InstagramIcon size={15} />
              <span>Instagram</span>
              <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
