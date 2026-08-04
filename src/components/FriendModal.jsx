import React, { useEffect } from 'react';
import { X, Quote, Heart, Sparkles, Award } from 'lucide-react';
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
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="glass-card modal-sheet-card glass-shine" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top iOS Grab Bar */}
        <div className="ios-grab-bar-wrapper">
          <div className="ios-grab-bar"></div>
        </div>

        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {/* Header Photo & Identity */}
        <div className="modal-header-section">
          <div className="modal-photo-frame">
            <img src={friend.photo} alt={friend.name} className="modal-photo" />
            <div className="modal-badge-tag">{friend.badge || "Squad MVP"}</div>
          </div>

          <h2 className="modal-name">{friend.name}</h2>
          <span className="modal-role">{friend.role} • "{friend.nickname}"</span>
        </div>

        {/* Body Bio & Quote */}
        <div className="modal-body-section">
          <div className="modal-info-block glass-card-subtle">
            <div className="block-title">
              <Sparkles size={16} className="pink-icon" />
              <span>Squad Bio</span>
            </div>
            <p className="block-text">{friend.bio}</p>
          </div>

          {friend.quote && (
            <div className="modal-info-block glass-card-subtle">
              <div className="block-title">
                <Quote size={16} className="blue-icon" />
                <span>Favorite Quote</span>
              </div>
              <p className="quote-text">"{friend.quote}"</p>
            </div>
          )}

          {friend.favoriteMemory && (
            <div className="modal-info-block glass-card-subtle">
              <div className="block-title">
                <Heart size={16} className="amber-icon" />
                <span>Unforgettable Memory</span>
              </div>
              <p className="block-text">{friend.favoriteMemory}</p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="modal-footer-section">
          <a
            href={friend.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="modal-ig-btn glass-shine"
          >
            <div className="ig-btn-icon">
              <InstagramIcon size={18} />
            </div>
            <span>Visit Instagram Profile</span>
          </a>
        </div>
      </div>
    </div>
  );
}
