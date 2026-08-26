import React, { useState } from 'react';
import { PartyPopper, ArrowUpRight, Sparkles } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import confetti from 'canvas-confetti';
import './FollowUs.css';

export default function FollowUs() {
  const [cheerCount, setCheerCount] = useState(142);
  const [hasCheered, setHasCheered] = useState(false);

  const triggerConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.7 },
      colors: ['#0071e3', '#6366f1', '#f43f5e', '#f59e0b', '#38bdf8']
    });

    if (!hasCheered) {
      setCheerCount(prev => prev + 1);
      setHasCheered(true);
    }
  };

  return (
    <section id="follow" className="follow-section">
      <div className="glass-card follow-marquee-card liquid-shimmer">
        <div className="follow-badge-row">
          <div className="badge-pill liquid-shimmer">
            <InstagramIcon size={14} className="ig-badge-glyph" />
            <span>COMMUNITY VIBE</span>
          </div>
        </div>

        <h2 className="follow-headline">
          Join Our Daily Journey On <span className="gradient-text-brand">Instagram</span>
        </h2>

        <p className="follow-paragraph">
          Experience behind-the-scenes squad banter, unreleased road trip captures, and daily chaotic moments.
        </p>

        <div className="follow-buttons-group">
          {/* Main Large Liquid Instagram Button */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-ig-follow-btn liquid-shimmer"
          >
            <div className="ig-circle-icon">
              <InstagramIcon size={20} />
            </div>
            <span>Follow @NatpeThunaiSquad</span>
            <ArrowUpRight size={17} />
          </a>

          {/* Interactive Confetti Cheer Button */}
          <button
            className={`liquid-cheer-btn ${hasCheered ? 'cheered' : ''}`}
            onClick={triggerConfetti}
          >
            <PartyPopper size={18} className="cheer-popper-icon" />
            <span>{hasCheered ? 'Squad Loved! ❤️' : 'Send Squad Cheer 🎉'}</span>
            <span className="cheer-count-pill">{cheerCount}</span>
          </button>
        </div>

        <div className="follow-meta-note">
          <Sparkles size={13} className="sparkle-gold" />
          <span>Curated Weekly • Unfiltered Friendship Memories</span>
        </div>
      </div>
    </section>
  );
}
