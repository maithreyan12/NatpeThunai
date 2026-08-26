import React, { useEffect } from 'react';
import { X, Quote, Heart, Sparkles, ArrowUpRight } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import './FriendModal.css';

export default function FriendModal({ friend, onClose }) {
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
        className="glass-card spatial-sheet-card liquid-shimmer" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Grab Handle */}
        <div className="sheet-grab-bar-area">
          <div className="sheet-grab-pill"></div>
        </div>

        {/* Close Button Pill */}
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
            <img src={friend.photo} alt={friend.name} className="modal-portrait-img" />
            <div className="modal-badge-chip">{friend.badge || "Core Legend"}</div>
          </div>

          <h2 className="modal-friend-name">{friend.name}</h2>
          <span className="modal-friend-sub">{friend.role} • "{friend.nickname}"</span>
        </div>

        {/* Dynamic Stats Chips (if stats exist) */}
        {friend.stats && (
          <div className="modal-stats-chips-row">
            {Object.entries(friend.stats).map(([key, val]) => (
              <div key={key} className="modal-stat-chip">
                <span className="chip-key">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                <span className="chip-val">{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Body Bio & Memory Blocks */}
        <div className="modal-content-blocks">
          {/* Bio Capsule */}
          <div className="modal-glass-block">
            <div className="block-header-label">
              <Sparkles size={14} className="glyph-rose" />
              <span>SQUAD BIO</span>
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

          {/* Favorite Memory */}
          {friend.favoriteMemory && (
            <div className="modal-glass-block">
              <div className="block-header-label">
                <Heart size={14} className="glyph-amber" />
                <span>UNFORGETTABLE MOMENT</span>
              </div>
              <p className="block-body-text">{friend.favoriteMemory}</p>
            </div>
          )}
        </div>

        {/* Footer CTA Button */}
        <div className="modal-action-footer">
          <a
            href={friend.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="modal-liquid-ig-btn liquid-shimmer"
          >
            <InstagramIcon size={16} />
            <span>Connect on Instagram</span>
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </div>
  );
}
