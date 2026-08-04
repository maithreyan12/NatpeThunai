import React, { useState } from 'react';
import { PartyPopper, Heart, ExternalLink, Sparkles } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import confetti from 'canvas-confetti';
import './FollowUs.css';

export default function FollowUs() {
  const [cheerCount, setCheerCount] = useState(142);
  const [hasCheered, setHasCheered] = useState(false);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#f06292', '#5b8def', '#9575f0', '#ffb74d']
    });

    if (!hasCheered) {
      setCheerCount(prev => prev + 1);
      setHasCheered(true);
    }
  };

  return (
    <section id="follow" className="follow-section">
      <div className="glass-card follow-hero-card glass-shine">
        <div className="follow-badge-container">
          <div className="badge-pill glass-shine">
            <InstagramIcon size={14} className="ig-accent-icon" />
            <span>Join The Vibe</span>
          </div>
        </div>

        <h2 className="follow-title">
          Follow Our Group On <span className="gradient-text-ig">Instagram</span>
        </h2>

        <p className="follow-desc">
          Get an exclusive peek into our daily banter, unreleased travel photos, and behind-the-scenes squad madness!
        </p>

        <div className="follow-actions">
          {/* Main Large Glassy Instagram Button */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="follow-ig-btn glass-shine"
          >
            <div className="ig-btn-logo">
              <InstagramIcon size={22} />
            </div>
            <span>Follow @NatpeThunaiSquad</span>
            <ExternalLink size={16} />
          </a>

          {/* Interactive Send Love Button with Confetti */}
          <button
            className={`cheer-btn ${hasCheered ? 'cheered' : ''}`}
            onClick={triggerConfetti}
          >
            <PartyPopper size={18} className="cheer-icon" />
            <span>{hasCheered ? 'Loved!' : 'Send Squad Cheer 🎉'}</span>
            <span className="cheer-badge">{cheerCount}</span>
          </button>
        </div>

        <div className="follow-footer-note">
          <Sparkles size={14} />
          <span>Updated weekly with fresh memories</span>
        </div>
      </div>
    </section>
  );
}
