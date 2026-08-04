import React from 'react';
import { Heart, Users, ArrowUp } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import './Footer.css';

export default function Footer({ onScrollTop }) {
  return (
    <footer className="footer-container">
      <div className="glass-card footer-bar">
        {/* Top Info */}
        <div className="footer-left">
          <div className="footer-brand">
            <div className="footer-logo">
              <Users size={16} />
            </div>
            <span className="footer-title" style={{ fontFamily: 'var(--font-tamil)' }}>நட்பே துணை</span>
            <span className="footer-tamil">• Friendship Forever</span>
          </div>
          <p className="footer-quote">
            "True friendship isn't about being inseparable, it's being separated and knowing nothing will change."
          </p>
        </div>

        {/* Right Social & Scroll Top */}
        <div className="footer-right">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-icon glass-shine"
            title="Instagram Page"
          >
            <InstagramIcon size={18} />
          </a>

          <button
            className="footer-scroll-top-btn glass-shine"
            onClick={onScrollTop}
            title="Back to Top"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>

      {/* Copyright Note */}
      <div className="footer-bottom">
        <span>Handcrafted with</span>
        <Heart size={14} className="heart-icon-pulse" />
        <span>for our everlasting bond • {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
