import React, { useState, useEffect } from 'react';
import { Sparkles, Users, Heart, Wifi, BatteryCharging, MessageCircle } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import './Navbar.css';

export default function Navbar({ activeSection, onNavigate }) {
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
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`ios-navbar-wrapper ${scrolled ? 'scrolled' : ''}`}>
      {/* Mini iOS status bar strip */}
      <div className="ios-top-bar">
        <span className="ios-time-text">{time || '09:41'}</span>
        <div className="ios-dynamic-island">
          <span className="island-dot pulse"></span>
          <span className="island-text">நட்பே துணை • Online</span>
        </div>
        <div className="ios-status-icons">
          <Wifi className="status-icon" size={14} />
          <BatteryCharging className="status-icon" size={14} />
        </div>
      </div>

      {/* Main Glass Floating Nav */}
      <nav className="glass-nav-container">
        <a href="#hero" className="nav-brand" onClick={(e) => { e.preventDefault(); onNavigate('hero'); }}>
          <div className="brand-logo-icon">
            <Users size={18} />
          </div>
          <div className="brand-text-group">
            <span className="brand-title" style={{ fontFamily: 'var(--font-tamil)' }}>நட்பே துணை</span>
            <span className="brand-subtitle">Friendship Forever</span>
          </div>
        </a>

        <div className="nav-links">
          <button 
            className={`nav-link-btn ${activeSection === 'about' ? 'active' : ''}`}
            onClick={() => onNavigate('about')}
          >
            About
          </button>
          <button 
            className={`nav-link-btn ${activeSection === 'friends' ? 'active' : ''}`}
            onClick={() => onNavigate('friends')}
          >
            Friends
          </button>
          <button 
            className={`nav-link-btn ${activeSection === 'chat' ? 'active' : ''}`}
            onClick={() => onNavigate('chat')}
          >
            Chat
          </button>
          <button 
            className={`nav-link-btn ${activeSection === 'follow' ? 'active' : ''}`}
            onClick={() => onNavigate('follow')}
          >
            Follow Us
          </button>
        </div>

        <a 
          href="https://instagram.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="nav-cta-btn glass-shine"
        >
          <InstagramIcon size={15} />
          <span>Squad Gram</span>
        </a>
      </nav>
    </header>
  );
}
