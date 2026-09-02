import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, ShieldCheck, Lock } from 'lucide-react';
import { r2Photo } from '../../services';
import { signInWithGoogle } from '../../firebase';
import brandLogo from '../../assets/brand-logo.png';
import './Modals.css';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );
}

// ── CREATE COMMUNITY POST MODAL ──
export function CreatePostModal({ isOpen, onClose, onSave, currentUser }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Moment');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setAuthError('');
      await signInWithGoogle();
    } catch (err) {
      console.error("Sign in failed:", err);
      setAuthError("Google Sign-In was not completed. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthError("Please sign in with Google to post.");
      return;
    }
    if (!content.trim()) return;
    onSave({ content: content.trim(), category }, currentUser);
    setContent('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-info">
            <span className="modal-badge-tag">
              {currentUser ? 'AUTHORIZED SQUAD POST' : 'SQUAD RESTRICTED'}
            </span>
            <h3 className="modal-title">Share With The Squad</h3>
          </div>
          <button className="modal-close-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {!currentUser ? (
          <div className="auth-required-box" style={{ padding: '24px 16px', textAlign: 'center' }}>
            <div 
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'var(--tint-lavender)',
                color: 'var(--accent-lavender)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: '0 4px 14px rgba(91, 76, 219, 0.2)'
              }}
            >
              <GoogleIcon />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Google Sign-In Required
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 20 }}>
              To maintain our private squad sanctuary, creating posts and sharing updates is restricted to verified members who sign in with their Google account.
            </p>
            {authError && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: 14 }}>
                {authError}
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button type="button" className="btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <GoogleIcon />
                <span>{isSigningIn ? 'Connecting...' : 'Sign In With Google'}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            {/* Authenticated Member Badge */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 14
              }}
            >
              <img 
                src={currentUser.photoURL || r2Photo('Gracee.jpg')} 
                alt={currentUser.displayName || 'Member'}
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                referrerPolicy="no-referrer"
              />
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {currentUser.displayName || 'Squad Member'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-lavender)', fontWeight: 600 }}>
                  ✓ Authorized Squad Member
                </span>
              </div>
            </div>

            <div className="form-group">
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="What's on your mind? Share a memory, spontaneous plan, or reflection..."
                value={content}
                onChange={e => setContent(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Post Category</label>
              <div className="category-chips-row">
                {['Moment', 'Announcement', 'Plan', 'Story'].map(cat => (
                  <button
                    type="button"
                    key={cat}
                    className={`category-tag-btn ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions-row">
              <button type="button" className="btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <span>Post to Squad</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── ADD EVENT MODAL ──
export function AddEventModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('6:00 PM');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Reunion');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;
    onSave({
      title: title.trim(),
      date: date.trim(),
      time,
      location: location.trim(),
      description: description.trim(),
      category
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-info">
            <span className="modal-badge-tag">SQUAD CALENDAR</span>
            <h3 className="modal-title">Schedule An Event</h3>
          </div>
          <button className="modal-close-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Annual Squad Grand Reunion / Beach Sunset"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">
                <Calendar size={13} /> Date
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Oct 24"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">Time</label>
              <input
                type="text"
                className="form-input"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">
                <MapPin size={13} /> Location
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. City Hilltop Viewpoint"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Reunion">Reunion</option>
                <option value="Road Trip">Road Trip</option>
                <option value="Celebration">Celebration</option>
                <option value="Screening">Screening Night</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="What are we planning? Dress code, snacks, itinerary..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-actions-row">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <span>Create Event</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── LIGHTBOX VIEWER MODAL ──
export function LightboxModal({ isOpen, onClose, memory }) {
  if (!isOpen || !memory) return null;

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <button className="lightbox-close-btn" onClick={onClose} aria-label="Close Fullscreen">
        <X size={24} />
      </button>
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        <div className="lightbox-media-container">
          {memory.mediaType === 'video' ? (
            <video src={memory.mediaUrl} controls autoPlay className="lightbox-media" />
          ) : (
            <img src={memory.mediaUrl} alt={memory.title} className="lightbox-media" />
          )}
        </div>
        <div className="lightbox-caption-bar">
          <div className="caption-meta">
            <span className="caption-year-pill">{memory.category || "Moment"}</span>
            <span className="caption-date">{memory.date}</span>
            {memory.location && <span className="caption-location">• {memory.location}</span>}
          </div>
          <h4 className="caption-title">{memory.title}</h4>
          {memory.description && <p className="caption-desc">{memory.description}</p>}
        </div>
      </div>
    </div>
  );
}

// ── SIGN IN & MEMBER PROFILE MODAL ──
export function SignInModal({ isOpen, onClose, currentUser, onSignIn, onSignOut }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset error every time modal opens/closes
  useEffect(() => {
    if (!isOpen) setError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  // Translate raw Firebase/browser errors into friendly messages
  const getFriendlyError = (err) => {
    const msg = (err?.message || err?.code || '').toLowerCase();
    if (msg.includes('popup-closed') || msg.includes('cancelled') || msg.includes('closed-by-user'))
      return null; // User just closed popup — not an error worth showing
    if (msg.includes('database') || msg.includes('indexeddb') || msg.includes('closing'))
      return 'Sign-in was interrupted by your browser. Please try again.';
    if (msg.includes('network') || msg.includes('offline'))
      return 'No internet connection. Please check your network and try again.';
    if (msg.includes('domain') || msg.includes('unauthorized'))
      return 'This Google account is not part of our squad. Use your squad Google account.';
    if (msg.includes('too-many-requests') || msg.includes('quota'))
      return 'Too many attempts. Please wait a moment and try again.';
    return 'Sign in failed. Please try again.';
  };

  const handleGoogleClick = async () => {
    try {
      setLoading(true);
      setError(null);
      await onSignIn();
      onClose();
    } catch (err) {
      console.error("Sign in failed:", err);
      const friendly = getFriendlyError(err);
      if (friendly) setError(friendly);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutClick = async () => {
    try {
      setLoading(true);
      await onSignOut();
      onClose();
    } catch (err) {
      console.error("Sign out failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card-sm auth-modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close-icon auth-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {currentUser ? (
          /* Signed-in profile view */
          <div className="auth-profile-view">
            <div className="auth-avatar-ring">
              <img 
                src={currentUser.photoURL || r2Photo('Gracee.jpg')} 
                alt={currentUser.displayName || 'Squad Member'} 
                className="auth-profile-avatar"
                referrerPolicy="no-referrer"
              />
              <span className="auth-status-dot" title="Active Member" />
            </div>

            <div className="auth-profile-meta">
              <span className="auth-badge-pill">OFFICIAL SQUAD MEMBER</span>
              <h3 className="auth-profile-name">{currentUser.displayName || 'Squad Companion'}</h3>
              <p className="auth-profile-email">{currentUser.email}</p>
            </div>

            <div className="auth-privileges-box">
              <div className="auth-privilege-item">
                <span className="privilege-icon">💬</span>
                <div>
                  <strong>Squad Live Enclave</strong>
                  <span>Live chat enabled with Grace, Heenuuu, Divyaaa & Puppy</span>
                </div>
              </div>
              <div className="auth-privilege-item">
                <span className="privilege-icon">💖</span>
                <div>
                  <strong>Interactive Reactions</strong>
                  <span>Reactions and group comments recorded under your name</span>
                </div>
              </div>
            </div>

            <button 
              className="btn-outline auth-signout-action-btn"
              onClick={handleSignOutClick}
              disabled={loading}
            >
              <span>{loading ? 'Signing out...' : 'Sign Out of Sanctuary'}</span>
            </button>
          </div>
        ) : (
          /* Unauthenticated sign-in view */
          <div className="auth-signin-view">
            <div className="auth-header-graphic">
              <div className="auth-beacon-icon">
                <img 
                  src={brandLogo} 
                  alt="நட்பே துணை Logo" 
                  className="auth-beacon-logo-img" 
                />
              </div>
            </div>

            <div className="auth-header-text">
              <span className="modal-badge-tag">PRIVATE SQUAD SANCTUARY</span>
              <h3 className="auth-headline">Welcome to Natpe Thunai</h3>
              <p className="auth-subhead">
                Sign in with your Google account to unlock live group chat, leave reactions on memories, and connect with our 2023–2026 circle.
              </p>
            </div>

            <div className="auth-benefits-list">
              <div className="auth-benefit-item">
                <span className="benefit-glyph">💬</span>
                <div>
                  <strong>Squad Live Chat</strong>
                  <span>Send real-time messages directly into our private group room</span>
                </div>
              </div>
              <div className="auth-benefit-item">
                <span className="benefit-glyph">✨</span>
                <div>
                  <strong>Natpe AI Storyteller</strong>
                  <span>Ask the AI storyteller about our trips, food moments, and group memories</span>
                </div>
              </div>
              <div className="auth-benefit-item">
                <span className="benefit-glyph">❤️</span>
                <div>
                  <strong>Preserve Moments</strong>
                  <span>Post community thoughts and RSVP to upcoming squad reunions</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="auth-error-banner">
                <span>{error}</span>
              </div>
            )}

            <button 
              className="auth-google-btn"
              onClick={handleGoogleClick}
              disabled={loading}
            >
              <svg className="google-icon-svg" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            <p className="auth-disclaimer">
              🔒 Private group sanctuary • Intended for our friendship community
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
