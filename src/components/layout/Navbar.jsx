import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Film,
  Users,
  MessageCircle,
  Sun,
  Moon,
  LogOut,
  Heart,
  Menu,
  X,
  Images,
  Shield,
  Music
} from 'lucide-react';
import { signInWithGoogle, logOut, isAuthorizedAdmin } from '../../firebase';
import { r2Photo } from '../../services';
import brandLogo from '../../assets/brand-logo.png';
import './Navbar.css';

export default function Navbar({
  activeSection,
  onNavigate,
  onOpenMusic,
  isMusicActive,
  theme,
  onToggleTheme,
  currentUser,
  onOpenSignIn,
  onOpenAdmin
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isOver = window.scrollY > 20;
          setScrolled(prev => (prev !== isOver ? isOver : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (section) => {
    if (section === 'music') {
      if (onOpenMusic) onOpenMusic();
    } else {
      onNavigate(section);
    }
    setMobileMenuOpen(false);
  };

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

  // Determine active states for the core tabs
  const isSquadActive = activeSection === 'members' || activeSection === 'journey';
  const isMemoriesActive = activeSection === 'album-teaser' || activeSection === 'timeline';
  const isReelsActive = activeSection === 'reel';
  const isMusicCurrent = isMusicActive || activeSection === 'music';

  const navLinks = [
    { id: 'hero', label: 'Home', icon: Sparkles, isActive: activeSection === 'hero' },
    { id: 'story', label: 'Story', icon: Heart, isActive: activeSection === 'story' },
    { id: 'members', label: 'Members', icon: Users, isActive: isSquadActive },
    { id: 'album-teaser', label: 'Memories', icon: Images, isActive: isMemoriesActive },
    { id: 'reel', label: 'Reels', icon: Film, isActive: isReelsActive },
    { id: 'music', label: 'Music', icon: Music, isActive: isMusicCurrent },
  ];

  return (
    <>
      <header
        ref={navRef}
        className={`community-navbar-wrapper ${scrolled ? 'scrolled' : ''} ${mobileMenuOpen ? 'menu-expanded' : ''}`}
      >
        <nav className="community-nav-bar" aria-label="Main navigation">
          {/* Brand Identity */}
          <a
            href="#hero"
            className="nav-brand-lockup"
            onClick={(e) => { e.preventDefault(); handleNavClick('hero'); }}
          >
            <div className="brand-badge-icon">
              <img
                src={brandLogo}
                alt="நட்பே துணை Logo"
                className="brand-badge-img"
              />
            </div>
          </a>

          {/* 5 Core Navigation Buttons (Desktop) */}
          <div className="nav-links-dock">
            {navLinks.map(({ id, label, isActive }) => (
              <button
                key={id}
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Actions: Theme Toggle, Auth, Hamburger Menu */}
          <div className="nav-actions-dock">
            <button
              className="theme-switcher-btn"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Profile / Auth Button (Only visible when logged in) */}
            {currentUser && (
              <div className="user-profile-menu">
                <button
                  className="user-profile-avatar-btn"
                  onClick={onOpenSignIn}
                  title="My Sanctuary Profile"
                >
                  <img
                    src={currentUser.photoURL || r2Photo('Gracee.jpg')}
                    alt={currentUser.displayName || 'Member'}
                    className="user-nav-avatar"
                    referrerPolicy="no-referrer"
                  />
                  <span className="nav-status-indicator" />
                </button>
                {isAuthorizedAdmin(currentUser) && (
                  <button
                    className="admin-quick-nav-btn"
                    onClick={() => onNavigate('admin')}
                    title="Open Admin Sanctuary Console"
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#ef4444',
                      padding: '6px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Shield size={14} />
                  </button>
                )}
                <button
                  className="auth-signout-btn"
                  onClick={handleAuthAction}
                  title="Sign out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              className={`mobile-hamburger-btn ${mobileMenuOpen ? 'open' : ''}`}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Responsive Dropdown Menu (Under the navbar/hamburger) */}
          {mobileMenuOpen && (
            <div className="mobile-nav-dropdown" role="menu">
              <div className="mobile-dropdown-header">
                <span>Navigation Menu</span>
              </div>
              <div className="mobile-nav-items-grid">
                {navLinks.map(({ id, label, icon: Icon, isActive }) => (
                  <button
                    key={id}
                    role="menuitem"
                    className={`mobile-nav-menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(id)}
                  >
                    <div className="mobile-menu-icon-wrap">
                      <Icon size={18} />
                    </div>
                    <span className="mobile-menu-label">{label}</span>
                    {isActive && <span className="mobile-menu-active-dot" />}
                  </button>
                ))}

                {/* Admin Console shortcut for authorized administrators */}
                {isAuthorizedAdmin(currentUser) && (
                  <button
                    role="menuitem"
                    className={`mobile-nav-menu-item ${activeSection === 'admin' ? 'active' : ''}`}
                    onClick={() => handleNavClick('admin')}
                    style={{
                      borderColor: 'rgba(239, 68, 68, 0.4)',
                      background: 'rgba(239, 68, 68, 0.1)'
                    }}
                  >
                    <div className="mobile-menu-icon-wrap" style={{ color: '#ef4444' }}>
                      <Shield size={18} />
                    </div>
                    <span className="mobile-menu-label" style={{ color: '#ef4444', fontWeight: 700 }}>
                      Admin Console
                    </span>
                    {activeSection === 'admin' && <span className="mobile-menu-active-dot" />}
                  </button>
                )}
              </div>

              {/* Mobile Profile & Sign-In Actions Row */}
              <div
                className="mobile-dropdown-footer"
                style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                {currentUser ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <img
                        src={currentUser.photoURL || r2Photo('Gracee.jpg')}
                        alt={currentUser.displayName || 'Member'}
                        style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                        referrerPolicy="no-referrer"
                      />
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden'
                        }}
                      >
                        {currentUser.displayName || currentUser.email}
                      </span>
                    </div>
                    <button
                      onClick={handleAuthAction}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: 'var(--text-secondary)',
                        padding: '6px 12px',
                        borderRadius: '999px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <LogOut size={12} /> Sign out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenSignIn) onOpenSignIn();
                      else handleAuthAction();
                    }}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      border: 'none',
                      color: '#fff',
                      padding: '10px 16px',
                      borderRadius: '999px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Sparkles size={14} /> Member Login
                  </button>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}
