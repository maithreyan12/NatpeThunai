import React from 'react';
import { Heart, ArrowUp, Sparkles } from 'lucide-react';
import InstagramIcon from '../ui/InstagramIcon';
import './Footer.css';

export default function Footer({ onScrollTop, onOpenSignIn, currentUser }) {
  return (
    <footer className="community-footer-wrapper">
      <div className="footer-dock-bar">
        {/* Brand & Emotional Quote */}
        <div className="footer-identity-col">
          <div className="footer-brand-lockup">
            <div className="footer-brand-icon">
              <Sparkles size={16} />
            </div>
            <div className="footer-brand-names">
              <span className="footer-title-text" style={{ fontFamily: 'var(--font-tamil)' }}>நட்பே துணை</span>
              <span className="footer-subtitle-tag">Natpethunai • Friendship Sanctuary</span>
            </div>
          </div>
          <p className="footer-quote-copy">
            “Our memories. Our moments. Our bond. A place to keep the little moments that became our biggest memories.”
          </p>
        </div>

        {/* Action Controls: Social & Back to Top */}
        <div className="footer-controls-group">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-round-btn"
            title="Squad Instagram"
            aria-label="Squad Instagram"
          >
            <InstagramIcon size={16} />
          </a>

          <button
            className="footer-round-btn footer-scroll-btn"
            onClick={onScrollTop}
            title="Back to Top"
            aria-label="Back to top"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>

      {/* Copyright Line & Discreet Access */}
      <div className="footer-sub-metadata">
        <span>Curated with genuine love & memories for our squad</span>
        <button 
          type="button"
          className="footer-discreet-trigger"
          onClick={() => onOpenSignIn && onOpenSignIn()}
          title="Squad Sanctuary"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
        >
          <Heart size={13} className="footer-heart-glow" />
        </button>
        <span>Eternal Friendship Archive</span>
      </div>
    </footer>
  );
}
