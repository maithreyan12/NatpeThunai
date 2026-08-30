import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Film, 
  Users, 
  MessageCircle, 
  Sun, 
  Moon, 
  LogOut, 
  LogIn,
  Heart 
} from 'lucide-react';
import { signInWithGoogle, logOut } from '../../firebase';
import './Navbar.css';

export default function Navbar({ 
  activeSection, 
  onNavigate, 
  theme, 
  onToggleTheme, 
  currentUser,
  onOpenSignIn
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthAction = async (e) => {
    if (e) e.stopPropagation();
    if (currentUser) {
      await logOut();
    } else if (onOpenSignIn) {
      onOpenSignIn();
    } else {
      try {
        await signInWithGoogle();
      } catch (err) {
        console.error("Sign in failed:", err);
      }
    }
  };

  // Determine active states for the 5 core tabs
  const isSquadActive = activeSection === 'members' || activeSection === 'journey';
  const isMemoriesActive = activeSection === 'timeline' || activeSection === 'reel';
  const isChatActive = activeSection === 'chat' || activeSection === 'community';

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

          {/* 5 Core Navigation Buttons */}
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
              className={`nav-item-btn ${isSquadActive ? 'active' : ''}`}
              onClick={() => onNavigate('members')}
            >
              Squad
            </button>
            <button 
              className={`nav-item-btn ${isMemoriesActive ? 'active' : ''}`}
              onClick={() => onNavigate('timeline')}
            >
              Memories
            </button>
            <button 
              className={`nav-item-btn ${isChatActive ? 'active' : ''}`}
              onClick={() => onNavigate('chat')}
            >
              AI Chat 💬
            </button>
          </div>

          {/* Actions: Theme Toggle, Auth */}
          <div className="nav-actions-dock">
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
                <button 
                  className="user-profile-avatar-btn"
                  onClick={onOpenSignIn}
                  title="My Sanctuary Profile"
                >
                  <img 
                    src={currentUser.photoURL || '/photos/friend1.jpg'} 
                    alt={currentUser.displayName || 'Member'} 
                    className="user-nav-avatar"
                    referrerPolicy="no-referrer"
                  />
                  <span className="nav-status-indicator" />
                </button>
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
                className="btn-secondary btn-sm nav-signin-btn"
                onClick={onOpenSignIn || handleAuthAction}
                title="Sign in with Google"
              >
                <LogIn size={14} />
                <span className="sign-in-text">Sign In</span>
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Floating Bottom Bar — Exactly 5 Balanced Tabs */}
      <nav className="mobile-bottom-bar" aria-label="Mobile navigation">
        <button 
          className={`mobile-tab ${activeSection === 'hero' ? 'active' : ''}`}
          onClick={() => onNavigate('hero')}
        >
          <Sparkles size={19} />
          <span>Home</span>
        </button>
        <button 
          className={`mobile-tab ${activeSection === 'story' ? 'active' : ''}`}
          onClick={() => onNavigate('story')}
        >
          <Heart size={19} />
          <span>Story</span>
        </button>
        <button 
          className={`mobile-tab ${isSquadActive ? 'active' : ''}`}
          onClick={() => onNavigate('members')}
        >
          <Users size={19} />
          <span>Squad</span>
        </button>
        <button 
          className={`mobile-tab ${isMemoriesActive ? 'active' : ''}`}
          onClick={() => onNavigate('timeline')}
        >
          <Film size={19} />
          <span>Memories</span>
        </button>
        <button 
          className={`mobile-tab ${isChatActive ? 'active' : ''}`}
          onClick={() => onNavigate('chat')}
        >
          <MessageCircle size={19} />
          <span>Chat</span>
        </button>
      </nav>
    </>
  );
}
