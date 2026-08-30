import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  Film, 
  Users, 
  MessageCircle, 
  Calendar, 
  Plus, 
  Sun, 
  Moon, 
  LogOut, 
  LogIn,
  Heart 
} from 'lucide-react';
import { signInWithGoogle, logOut } from '../firebase';
import './Navbar.css';

export default function Navbar({ 
  activeSection, 
  onNavigate, 
  theme, 
  onToggleTheme, 
  onOpenAddMemory,
  currentUser 
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthAction = async () => {
    if (currentUser) {
      await logOut();
    } else {
      try {
        await signInWithGoogle();
      } catch (err) {
        console.error("Sign in failed:", err);
      }
    }
  };

  return (
    <>
      <header className={`community-navbar-wrapper ${scrolled ? 'scrolled' : ''}`}>
        <nav className="community-nav-bar" aria-label="Main navigation">
          {/* Brand Identity */}
          <a 
            href="#hero" 
            className="nav-brand-lockup"
            onClick={(e) => { e.preventDefault(); onNavigate('hero'); }}
          >
            <div className="brand-badge-icon">
              <Sparkles size={16} />
            </div>
            <div className="brand-text-col">
              <span className="brand-tamil-title" style={{ fontFamily: 'var(--font-tamil)' }}>நட்பே துணை</span>
              <span className="brand-meta-year">FRIENDSHIP SANCTUARY</span>
            </div>
          </a>

          {/* Nav Links */}
          <div className="nav-links-dock">
            <button 
              className={`nav-item-btn ${activeSection === 'hero' ? 'active' : ''}`}
              onClick={() => onNavigate('hero')}
            >
              Home
            </button>
            <button 
              className={`nav-item-btn ${activeSection === 'story' ? 'active' : ''}`}
              onClick={() => onNavigate('story')}
            >
              Story ❤️
            </button>
            <button 
              className={`nav-item-btn ${activeSection === 'journey' ? 'active' : ''}`}
              onClick={() => onNavigate('journey')}
            >
              Journey
            </button>
            <button 
              className={`nav-item-btn ${activeSection === 'timeline' ? 'active' : ''}`}
              onClick={() => onNavigate('timeline')}
            >
              Timeline
            </button>
            <button 
              className={`nav-item-btn ${activeSection === 'reel' ? 'active' : ''}`}
              onClick={() => onNavigate('reel')}
            >
              Memory Reel
            </button>
            <button 
              className={`nav-item-btn ${activeSection === 'members' ? 'active' : ''}`}
              onClick={() => onNavigate('members')}
            >
              Squad
            </button>
            <button 
              className={`nav-item-btn ${activeSection === 'community' ? 'active' : ''}`}
              onClick={() => onNavigate('community')}
            >
              Community
            </button>
            <button 
              className={`nav-item-btn ${activeSection === 'chat' ? 'active' : ''}`}
              onClick={() => onNavigate('chat')}
            >
              Live Chat
            </button>
          </div>

          {/* Actions: Add Memory, Theme Toggle, Auth */}
          <div className="nav-actions-dock">
            <button 
              className="btn-primary btn-sm add-memory-nav-btn"
              onClick={onOpenAddMemory}
            >
              <Plus size={15} />
              <span>Add Memory</span>
            </button>

            <button 
              className="theme-switcher-btn"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Profile / Auth Button */}
            {currentUser ? (
              <div className="user-profile-menu">
                <img 
                  src={currentUser.photoURL || '/photos/friend1.jpg'} 
                  alt={currentUser.displayName || 'Member'} 
                  className="user-nav-avatar"
                  referrerPolicy="no-referrer"
                />
                <button 
                  className="auth-signout-btn" 
                  onClick={handleAuthAction}
                  title="Sign out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button 
                className="btn-secondary btn-sm"
                onClick={handleAuthAction}
                title="Sign in with Google"
              >
                <LogIn size={14} />
                <span className="sign-in-text">Sign In</span>
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Floating Bottom Bar */}
      <nav className="mobile-bottom-bar" aria-label="Mobile navigation">
        <button 
          className={`mobile-tab ${activeSection === 'hero' ? 'active' : ''}`}
          onClick={() => onNavigate('hero')}
        >
          <Sparkles size={18} />
          <span>Home</span>
        </button>
        <button 
          className={`mobile-tab ${activeSection === 'story' ? 'active' : ''}`}
          onClick={() => onNavigate('story')}
        >
          <Heart size={18} />
          <span>Story</span>
        </button>
        <button 
          className={`mobile-tab ${activeSection === 'journey' ? 'active' : ''}`}
          onClick={() => onNavigate('journey')}
        >
          <Clock size={18} />
          <span>Journey</span>
        </button>
        <button 
          className={`mobile-tab ${activeSection === 'timeline' ? 'active' : ''}`}
          onClick={() => onNavigate('timeline')}
        >
          <Calendar size={18} />
          <span>Memories</span>
        </button>
        <button 
          className={`mobile-tab ${activeSection === 'reel' ? 'active' : ''}`}
          onClick={() => onNavigate('reel')}
        >
          <Film size={18} />
          <span>Reel</span>
        </button>
        <button 
          className={`mobile-tab ${activeSection === 'members' ? 'active' : ''}`}
          onClick={() => onNavigate('members')}
        >
          <Users size={18} />
          <span>Squad</span>
        </button>
        <button 
          className={`mobile-tab ${activeSection === 'community' ? 'active' : ''}`}
          onClick={() => onNavigate('community')}
        >
          <MessageCircle size={18} />
          <span>Group</span>
        </button>
        <button 
          className={`mobile-tab ${activeSection === 'chat' ? 'active' : ''}`}
          onClick={() => onNavigate('chat')}
        >
          <MessageCircle size={18} />
          <span>Chat</span>
        </button>
      </nav>
    </>
  );
}
