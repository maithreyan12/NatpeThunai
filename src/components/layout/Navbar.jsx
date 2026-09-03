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
  Images
} from 'lucide-react';
import { signInWithGoogle, logOut } from '../../firebase';
import { r2Photo } from '../../services';
import brandLogo from '../../assets/brand-logo.png';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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
    onNavigate(section);
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
  const isMemoriesActive = activeSection === 'album-teaser' || activeSection === 'reel';

  const navLinks = [
    { id: 'hero', label: 'Home', icon: Sparkles, isActive: activeSection === 'hero' },
    { id: 'story', label: 'Story', icon: Heart, isActive: activeSection === 'story' },
    { id: 'members', label: 'Members', icon: Users, isActive: isSquadActive },
    { id: 'album-teaser', label: 'Memories', icon: Film, isActive: isMemoriesActive },
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
                onClick={() => onNavigate(id)}
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
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}
