import React, { useState, useEffect } from 'react';
import { Sparkles, Users, Sun, Moon, Wifi, BatteryCharging, MessageCircle, Info, Heart, ArrowUpRight } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import './Navbar.css';

export default function Navbar({ activeSection, onNavigate, theme, onToggleTheme }) {
  const [time, setTime] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <header className={`apple-nav-wrapper ${scrolled ? 'scrolled' : ''}`}>
        {/* Futuristic Dynamic Island Status Bar */}
        <div className="dynamic-island-bar">
          <div className="island-time">{time || '09:41'}</div>
          
          <div className="dynamic-island-capsule">
            <span className="live-dot-pulse"></span>
            <span className="island-status-text">
              <span className="tamil-accent" style={{ fontFamily: 'var(--font-tamil)' }}>நட்பே துணை</span> • Live Vibe
            </span>
          </div>

          <div className="island-meta">
            <Wifi className="meta-icon" size={13} />
            <BatteryCharging className="meta-icon" size={14} />
          </div>
        </div>

        {/* Floating Glass Pill Dock */}
        <nav className="glass-pill-dock" aria-label="Main navigation">
          {/* Brand Identity */}
          <a 
            href="#hero" 
            className="dock-brand" 
            onClick={(e) => { e.preventDefault(); onNavigate('hero'); }}
          >
            <div className="dock-brand-icon liquid-shimmer">
              <Sparkles size={16} />
            </div>
            <div className="dock-brand-meta">
              <span className="dock-brand-title" style={{ fontFamily: 'var(--font-tamil)' }}>நட்பே துணை</span>
              <span className="dock-brand-sub">PRO SQUAD</span>
            </div>
          </a>

          {/* Desktop Navigation Links (Segmented Glass Pill) */}
          <div className="dock-nav-items">
            <button 
              className={`dock-link-btn ${activeSection === 'hero' ? 'active' : ''}`}
              onClick={() => onNavigate('hero')}
            >
              Home
            </button>
            <button 
              className={`dock-link-btn ${activeSection === 'about' ? 'active' : ''}`}
              onClick={() => onNavigate('about')}
            >
              Story
            </button>
            <button 
              className={`dock-link-btn ${activeSection === 'friends' ? 'active' : ''}`}
              onClick={() => onNavigate('friends')}
            >
              Squad
            </button>
            <button 
              className={`dock-link-btn ${activeSection === 'chat' ? 'active' : ''}`}
              onClick={() => onNavigate('chat')}
            >
              Chat
            </button>
            <button 
              className={`dock-link-btn ${activeSection === 'follow' ? 'active' : ''}`}
              onClick={() => onNavigate('follow')}
            >
              Connect
            </button>
          </div>

          {/* Action Area: Theme Toggle & Instagram CTA */}
          <div className="dock-actions">
            <button 
              className="theme-toggle-btn"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark Obsidian' : 'Light Pearl'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="dock-cta-btn liquid-shimmer"
            >
              <InstagramIcon size={14} />
              <span>Squad Gram</span>
              <ArrowUpRight size={13} className="arrow-shift" />
            </a>
          </div>
        </nav>
      </header>

      {/* Mobile Floating Bottom Navigation Bar */}
      <nav className="mobile-bottom-dock" aria-label="Mobile navigation">
        <button 
          className={`mobile-dock-item ${activeSection === 'hero' ? 'active' : ''}`}
          onClick={() => onNavigate('hero')}
          aria-label="Home"
        >
          <Sparkles size={18} />
          <span>Home</span>
        </button>
        <button 
          className={`mobile-dock-item ${activeSection === 'about' ? 'active' : ''}`}
          onClick={() => onNavigate('about')}
          aria-label="Story"
        >
          <Info size={18} />
          <span>Story</span>
        </button>
        <button 
          className={`mobile-dock-item ${activeSection === 'friends' ? 'active' : ''}`}
          onClick={() => onNavigate('friends')}
          aria-label="Squad"
        >
          <Users size={18} />
          <span>Squad</span>
        </button>
        <button 
          className={`mobile-dock-item ${activeSection === 'chat' ? 'active' : ''}`}
          onClick={() => onNavigate('chat')}
          aria-label="Chat"
        >
          <MessageCircle size={18} />
          <span>Chat</span>
        </button>
        <button 
          className={`mobile-dock-item ${activeSection === 'follow' ? 'active' : ''}`}
          onClick={() => onNavigate('follow')}
          aria-label="Connect"
        >
          <Heart size={18} />
          <span>Love</span>
        </button>
      </nav>
    </>
  );
}
