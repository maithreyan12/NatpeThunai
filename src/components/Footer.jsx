import React from 'react';
import { Heart, ArrowUp, Sparkles } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import './Footer.css';

export default function Footer({ onScrollTop }) {
  return (
    <footer className="apple-footer-wrapper">
      <div className="glass-card footer-dock-bar liquid-shimmer">
        {/* Brand & Quote */}
        <div className="footer-identity-col">
          <div className="footer-brand-lockup">
            <div className="footer-brand-icon">
              <Sparkles size={15} />
            </div>
            <span className="footer-title-text" style={{ fontFamily: 'var(--font-tamil)' }}>நட்பே துணை</span>
            <span className="footer-subtitle-tag">• UNCONDITIONAL BOND</span>
          </div>
          <p className="footer-quote-copy">
            "True friendship isn't about being inseparable, it's being separated and knowing nothing will change."
          </p>
        </div>

        {/* Action Controls: Social & Back to Top */}
        <div className="footer-controls-group">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-round-btn liquid-shimmer"
            title="Instagram Page"
            aria-label="Instagram Page"
          >
            <InstagramIcon size={16} />
          </a>

          <button
            className="footer-round-btn footer-scroll-btn liquid-shimmer"
            onClick={onScrollTop}
            title="Back to Top"
            aria-label="Back to top"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>

      {/* Copyright Line */}
      <div className="footer-sub-metadata">
        <span>Architected with precision &</span>
        <Heart size={13} className="footer-heart-glow" />
        <span>for our eternal squad • {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
