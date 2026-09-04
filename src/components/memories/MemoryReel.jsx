import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown, 
  Film, 
  CheckCircle2, 
  Music, 
  X
} from 'lucide-react';
import { subscribeToReelsR2, INITIAL_REELS, isVideoMedia } from '../../services/r2Database';
import brandLogo from '../../assets/brand-logo.png';
import './MemoryReel.css';

// Initial pre-loaded squad comments for realistic Instagram experience
const DEFAULT_SQUAD_COMMENTS = [
  { id: 'c1', user: 'Maithreyan', handle: '@maithreyan', avatar: brandLogo, text: 'The gang energy in this reel is unmatched! 🔥 Best years ever.', time: '2h', likes: 14 },
  { id: 'c2', user: 'Squad Member', handle: '@natpe_squad', avatar: brandLogo, text: 'Can we please go back to this exact day? 🥹 Unbreakable bond.', time: '5h', likes: 9 },
  { id: 'c3', user: 'Campus Crew', handle: '@campus_vibes', avatar: brandLogo, text: 'Bro that laughter at the end will always be legendary 😂❤️', time: '1d', likes: 21 },
  { id: 'c4', user: 'Natpe Thunai', handle: '@natpe_thunai', avatar: brandLogo, text: '15 members, one soul. Forever grateful for this brotherhood. ✨', time: '2d', likes: 38 },
];

export default function MemoryReel({ reels: propReels }) {
  const [internalReels, setInternalReels] = useState(INITIAL_REELS);

  useEffect(() => {
    if (propReels !== undefined) {
      if (Array.isArray(propReels) && propReels.length > 0) {
        setInternalReels(propReels);
      }
      return;
    }
    const unsub = subscribeToReelsR2((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setInternalReels(data);
      }
    });
    return () => unsub();
  }, [propReels]);

  // Extract valid video reels
  const sourceReels = Array.isArray(propReels) && propReels.length > 0 ? propReels : internalReels;
  const validReels = sourceReels.filter(r => r && isVideoMedia(r));
  const reelItems = validReels.length > 0 ? validReels : INITIAL_REELS;

  // Active state
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  // Instagram interactions state (persisted per reel ID in localStorage)
  const [likedReels, setLikedReels] = useState(() => {
    try {
      const saved = localStorage.getItem('squad_reels_liked');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [savedReels, setSavedReels] = useState(() => {
    try {
      const saved = localStorage.getItem('squad_reels_saved');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // UI state
  const [showCenterIcon, setShowCenterIcon] = useState(null); // 'play' | 'pause' | null
  const [centerIconKey, setCenterIconKey] = useState(0);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState(DEFAULT_SQUAD_COMMENTS);
  const [newCommentText, setNewCommentText] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);

  // References
  const feedRef = useRef(null);
  const videoRefs = useRef({});
  const lastTapTimeRef = useRef(0);
  const manuallyPausedRef = useRef(false);
  const toastTimeoutRef = useRef(null);

  const safeIndex = reelItems.length > 0 ? Math.min(activeIndex, reelItems.length - 1) : 0;
  const activeItem = reelItems[safeIndex] || null;

  // Trigger brief toast notification
  const triggerToast = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(''), 2500);
  };

  // ── Intersection Observer: Detect when Reels section enters/leaves screen ──
  useEffect(() => {
    const section = document.getElementById('reel');
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const inView = entry.isIntersecting && entry.intersectionRatio > 0.25;
        setIsInView(inView);

        const currentVid = videoRefs.current[safeIndex];

        if (inView) {
          // Tell background ambient player to yield
          window.dispatchEvent(
            new CustomEvent('reel-state-change', {
              detail: { isPlaying: true, inView: true }
            })
          );
          if (!manuallyPausedRef.current && currentVid) {
            setIsPlaying(true);
            currentVid.play().catch(() => {
              currentVid.muted = true;
              setIsMuted(true);
              currentVid.play().catch(() => {});
            });
          }
        } else {
          // Tell background ambient player to resume
          if (currentVid) currentVid.pause();
          setIsPlaying(false);
          window.dispatchEvent(
            new CustomEvent('reel-state-change', {
              detail: { isPlaying: false, inView: false }
            })
          );
        }
      },
      { threshold: [0, 0.25, 0.6] }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [safeIndex]);

  // Tab switch listener: Pause when user changes tabs
  useEffect(() => {
    const handleVisibility = () => {
      const currentVid = videoRefs.current[safeIndex];
      if (!currentVid) return;
      if (document.hidden) {
        currentVid.pause();
        window.dispatchEvent(new CustomEvent('reel-state-change', { detail: { isPlaying: false, inView: false } }));
      } else if (isInView && !manuallyPausedRef.current) {
        currentVid.play().catch(() => {});
        setIsPlaying(true);
        window.dispatchEvent(new CustomEvent('reel-state-change', { detail: { isPlaying: true, inView: true } }));
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isInView, safeIndex]);

  // Sync mute state to all video elements
  useEffect(() => {
    Object.values(videoRefs.current).forEach((vid) => {
      if (vid) vid.muted = isMuted;
    });
  }, [isMuted]);

  // ── Scroll To Specific Reel Slide ──
  const scrollToReel = useCallback((index) => {
    if (!feedRef.current || index < 0 || index >= reelItems.length) return;
    const container = feedRef.current;
    const slide = container.children[index];
    if (slide) {
      slide.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [reelItems.length]);

  // ── Auto Advance: When current reel finishes, automatically go to next reel ──
  const handleVideoEnded = () => {
    if (reelItems.length <= 1) return;
    const nextIndex = (safeIndex + 1) % reelItems.length;
    setPlaybackProgress(0);
    scrollToReel(nextIndex);
  };

  // Real-time progress update
  const handleTimeUpdate = (e) => {
    const vid = e.target;
    if (vid && vid.duration && !isNaN(vid.duration) && vid.duration > 0) {
      const pct = (vid.currentTime / vid.duration) * 100;
      setPlaybackProgress(pct);
    }
  };

  // ── Scroll Listener with Intersection for Vertical Snapping ──
  const handleFeedScroll = () => {
    if (!feedRef.current) return;
    const container = feedRef.current;
    const height = container.clientHeight;
    if (height <= 0) return;

    const scrollTop = container.scrollTop;
    const newIndex = Math.round(scrollTop / height);

    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < reelItems.length) {
      // Pause old video
      const oldVid = videoRefs.current[activeIndex];
      if (oldVid) {
        oldVid.pause();
        oldVid.currentTime = 0;
      }

      setActiveIndex(newIndex);
      setPlaybackProgress(0);
      setIsCaptionExpanded(false);

      // Play new video if active
      const newVid = videoRefs.current[newIndex];
      if (newVid && isInView && !manuallyPausedRef.current) {
        setIsPlaying(true);
        newVid.play().catch(() => {});
      }
    }
  };

  // ── Touch / Click to Stop and Run (Tap to Pause / Play) ──
  const handleScreenTap = (e) => {
    // Prevent trigger if clicking action buttons or drawer
    if (e.target.closest('.insta-action-column') || e.target.closest('.insta-comments-drawer') || e.target.closest('.insta-top-overlay')) {
      return;
    }

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    // Detect Double Tap for Heart Burst
    if (now - lastTapTimeRef.current < DOUBLE_TAP_DELAY) {
      handleDoubleTapLike();
      lastTapTimeRef.current = 0;
      return;
    }
    lastTapTimeRef.current = now;

    // Single Tap -> Toggle Play / Pause
    const currentVid = videoRefs.current[safeIndex];
    const nextPlayState = !isPlaying;
    manuallyPausedRef.current = !nextPlayState;
    setIsPlaying(nextPlayState);

    if (currentVid) {
      if (nextPlayState) {
        currentVid.play().catch(() => {});
        setShowCenterIcon('play');
      } else {
        currentVid.pause();
        setShowCenterIcon('pause');
      }
      setCenterIconKey(prev => prev + 1);
    }

    window.dispatchEvent(
      new CustomEvent('reel-state-change', {
        detail: { isPlaying: nextPlayState, inView: isInView }
      })
    );
  };

  // Double-tap heart animation
  const handleDoubleTapLike = () => {
    if (!activeItem) return;
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);

    setLikedReels(prev => {
      const updated = { ...prev, [activeItem.id]: true };
      localStorage.setItem('squad_reels_liked', JSON.stringify(updated));
      return updated;
    });
  };

  // Toggle Like button
  const toggleLike = (e) => {
    e.stopPropagation();
    if (!activeItem) return;
    const isCurrentlyLiked = !!likedReels[activeItem.id];
    setLikedReels(prev => {
      const updated = { ...prev, [activeItem.id]: !isCurrentlyLiked };
      localStorage.setItem('squad_reels_liked', JSON.stringify(updated));
      return updated;
    });
    if (!isCurrentlyLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    }
  };

  // Toggle Bookmark / Save
  const toggleSave = (e) => {
    e.stopPropagation();
    if (!activeItem) return;
    const isSaved = !!savedReels[activeItem.id];
    setSavedReels(prev => {
      const updated = { ...prev, [activeItem.id]: !isSaved };
      localStorage.setItem('squad_reels_saved', JSON.stringify(updated));
      return updated;
    });
    triggerToast(isSaved ? 'Removed from saved reels' : 'Saved to squad collection! 🔖');
  };

  // Share Reel
  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = window.location.origin + window.location.pathname + '#reel';
    const shareData = {
      title: activeItem?.title || 'Natpe Thunai Reel',
      text: `Check out this squad memory reel: "${activeItem?.title || 'Our Memories'}" on Natpe Thunai!`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        triggerToast('Shared successfully! 🚀');
      } catch {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text).then(() => {
      triggerToast('Reel link copied to clipboard! 🔗');
    }).catch(() => {
      triggerToast('Link copied! 🔗');
    });
  };

  // Add Comment
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newComment = {
      id: `c-${Date.now()}`,
      user: 'You (Squad Friend)',
      handle: '@squad_guest',
      avatar: brandLogo,
      text: newCommentText.trim(),
      time: 'Just now',
      likes: 1
    };
    setComments([newComment, ...comments]);
    setNewCommentText('');
    triggerToast('Comment posted! 💌');
  };

  // Keyboard navigation: ArrowUp, ArrowDown, Space to pause/run
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isInView || isCommentsOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToReel((safeIndex + 1) % reelItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToReel((safeIndex - 1 + reelItems.length) % reelItems.length);
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleScreenTap(e);
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInView, isCommentsOpen, safeIndex, reelItems.length, scrollToReel, isPlaying]);

  return (
    <section id="reel" className="insta-reels-section">
      {/* Background Ambient Aura */}
      <div className="insta-ambient-aura" />

      {/* Section Header */}
      <div className="section-header">
        <div className="badge-pill">
          <Film size={14} />
          <span>SQUAD REELS FEED</span>
        </div>
        <h2 className="section-title">
          Cinematic Squad Reels
        </h2>
        <p className="section-desc">
          Swipe through moments, laugh with our adventures, and experience our friendship in vertical motion.
        </p>
      </div>

      {/* Main Reels Phone Container Frame */}
      <div className="insta-device-stage">
        {/* Desktop Quick Nav Arrows (Left/Right side of Phone Frame) */}
        <div className="insta-external-controls">
          <button 
            type="button" 
            className="insta-nav-arrow-btn"
            onClick={() => scrollToReel((safeIndex - 1 + reelItems.length) % reelItems.length)}
            title="Previous Reel (Arrow Up)"
            aria-label="Previous Reel"
          >
            <ChevronUp size={22} />
          </button>

          <div className="insta-reel-step-pill">
            <span>{safeIndex + 1}</span>
            <span className="step-div">/</span>
            <span>{reelItems.length}</span>
          </div>

          <button 
            type="button" 
            className="insta-nav-arrow-btn"
            onClick={() => scrollToReel((safeIndex + 1) % reelItems.length)}
            title="Next Reel (Arrow Down)"
            aria-label="Next Reel"
          >
            <ChevronDown size={22} />
          </button>
        </div>

        {/* Curvy Smartphone Bezel */}
        <div className="insta-curved-phone-frame">
          {/* Dynamic Island Notch */}
          <div className="insta-dynamic-island">
            <span className="insta-camera-lens" />
            <span className="insta-sensor-dot" />
          </div>

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="insta-toast-pill">
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Vertical Reels Feed (Scroll-Snap Container) */}
          <div 
            className="insta-reels-feed" 
            ref={feedRef}
            onScroll={handleFeedScroll}
          >
            {reelItems.map((reel, idx) => {
              const isSlideActive = idx === safeIndex;
              const isLiked = !!likedReels[reel.id];
              const isSaved = !!savedReels[reel.id];

              return (
                <div 
                  key={reel.id || `reel-slide-${idx}`} 
                  className={`insta-reel-slide ${isSlideActive ? 'active-slide' : ''}`}
                  onClick={handleScreenTap}
                >
                  {/* Video Media Element */}
                  <video
                    ref={(el) => { videoRefs.current[idx] = el; }}
                    src={reel.mediaUrl}
                    className="insta-video-element"
                    playsInline
                    loop={false}
                    muted={isMuted}
                    preload={isSlideActive ? "auto" : "metadata"}
                    onTimeUpdate={isSlideActive ? handleTimeUpdate : undefined}
                    onEnded={isSlideActive ? handleVideoEnded : undefined}
                  />

                  {/* Subtle Dark Gradient Shades for pristine text readability */}
                  <div className="insta-top-gradient" />
                  <div className="insta-bottom-gradient" />

                  {/* Top Bar Overlay inside Reel */}
                  <div className="insta-top-overlay">
                    <div className="insta-brand-tag">
                      <Film size={15} />
                      <span>Reels</span>
                    </div>

                    <button
                      type="button"
                      className="insta-sound-pill-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(prev => !prev);
                      }}
                      title={isMuted ? "Tap to Unmute" : "Tap to Mute"}
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                      <span>{isMuted ? "Audio Off" : "Audio On"}</span>
                    </button>
                  </div>

                  {/* Center Pop Feedback Icon (Touch to Stop and Run) */}
                  {isSlideActive && showCenterIcon && (
                    <div 
                      key={centerIconKey} 
                      className={`insta-center-pop-icon ${showCenterIcon}`}
                    >
                      {showCenterIcon === 'play' ? <Play size={38} /> : <Pause size={38} />}
                    </div>
                  )}

                  {/* Big Heart Burst Animation on Double Tap */}
                  {isSlideActive && showHeartBurst && (
                    <div className="insta-heart-burst">
                      <Heart size={90} fill="#ff2d55" color="#ff2d55" />
                    </div>
                  )}

                  {/* Right-Side Floating Action Column (Like, Comment, Share, Bookmark, Music Disc) */}
                  <div className="insta-action-column" onClick={(e) => e.stopPropagation()}>
                    {/* 1. Like Button */}
                    <div className="insta-action-item">
                      <button 
                        type="button" 
                        className={`insta-action-btn ${isLiked ? 'is-liked' : ''}`}
                        onClick={toggleLike}
                        aria-label="Like reel"
                      >
                        <Heart size={26} fill={isLiked ? "#ff2d55" : "none"} color={isLiked ? "#ff2d55" : "#ffffff"} />
                      </button>
                      <span className="insta-action-count">{isLiked ? '24.9K' : '24.8K'}</span>
                    </div>

                    {/* 2. Comment Button */}
                    <div className="insta-action-item">
                      <button 
                        type="button" 
                        className="insta-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCommentsOpen(true);
                        }}
                        aria-label="View comments"
                      >
                        <MessageCircle size={25} color="#ffffff" />
                      </button>
                      <span className="insta-action-count">{comments.length}</span>
                    </div>

                    {/* 3. Share Button */}
                    <div className="insta-action-item">
                      <button 
                        type="button" 
                        className="insta-action-btn"
                        onClick={handleShare}
                        aria-label="Share reel"
                      >
                        <Send size={24} color="#ffffff" />
                      </button>
                      <span className="insta-action-count">2.4K</span>
                    </div>

                    {/* 4. Bookmark / Save Button */}
                    <div className="insta-action-item">
                      <button 
                        type="button" 
                        className={`insta-action-btn ${isSaved ? 'is-saved' : ''}`}
                        onClick={toggleSave}
                        aria-label="Save reel"
                      >
                        <Bookmark size={24} fill={isSaved ? "#f59e0b" : "none"} color={isSaved ? "#f59e0b" : "#ffffff"} />
                      </button>
                      <span className="insta-action-count">Save</span>
                    </div>

                    {/* 5. Rotating Vinyl Music Disc */}
                    <div className="insta-action-item music-disc-wrap">
                      <div className={`insta-music-disc ${isSlideActive && isPlaying ? 'is-spinning' : ''}`}>
                        <img src={brandLogo} alt="Audio" className="insta-disc-art" />
                      </div>
                      <div className="insta-note-float">
                        <Music size={11} />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Left Information Overlay */}
                  <div className="insta-bottom-info" onClick={(e) => e.stopPropagation()}>
                    {/* Squad Profile Lockup */}
                    <div className="insta-profile-row">
                      <div className="insta-avatar-ring">
                        <img src={brandLogo} alt="Natpe Thunai" className="insta-avatar-img" />
                      </div>
                      <div className="insta-user-meta">
                        <span className="insta-username">natpe_thunai</span>
                        <CheckCircle2 size={13} className="insta-verified-badge" />
                      </div>
                      <button 
                        type="button" 
                        className="insta-squad-follow-pill"
                        onClick={() => triggerToast('You are an official squad family member! 🫂')}
                      >
                        Squad
                      </button>
                    </div>

                    {/* Title & Caption with expandable ...more */}
                    <div className="insta-caption-wrap">
                      <h3 className="insta-reel-title">{reel.title || 'Squad Memory'}</h3>
                      <p className={`insta-caption-text ${isCaptionExpanded ? 'expanded' : ''}`}>
                        {reel.description || 'Stepping into chapters together — pure unfiltered squad energy.'}
                      </p>
                      {reel.description && reel.description.length > 55 && (
                        <button 
                          type="button" 
                          className="insta-caption-more-btn"
                          onClick={() => setIsCaptionExpanded(prev => !prev)}
                        >
                          {isCaptionExpanded ? 'less' : 'more'}
                        </button>
                      )}
                    </div>

                    {/* Audio Marquee Ticker */}
                    <div className="insta-audio-ticker">
                      <Music size={12} className="insta-music-note-icon" />
                      <div className="insta-marquee-track">
                        <span className="insta-marquee-text">
                          Original Audio - Natpe Thunai Squad Anthem • {reel.category || 'Adventures'} • {reel.date || 'Forever'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Instagram Progress Bar (Very Bottom Edge) */}
                  <div className="insta-progress-bar-track">
                    <div 
                      className="insta-progress-bar-fill"
                      style={{ width: isSlideActive ? `${playbackProgress}%` : '0%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slide-Up Instagram Comments Sheet */}
          {isCommentsOpen && (
            <div className="insta-comments-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="insta-comments-header">
                <div className="insta-sheet-handle" />
                <div className="insta-comments-title-row">
                  <h4>Comments ({comments.length})</h4>
                  <button 
                    type="button" 
                    className="insta-close-comments-btn"
                    onClick={() => setIsCommentsOpen(false)}
                    aria-label="Close comments"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="insta-comments-list">
                {comments.map((cmt) => (
                  <div key={cmt.id} className="insta-comment-item">
                    <img src={cmt.avatar} alt={cmt.user} className="insta-comment-avatar" />
                    <div className="insta-comment-body">
                      <div className="insta-comment-user-line">
                        <span className="insta-comment-name">{cmt.user}</span>
                        <span className="insta-comment-time">{cmt.time}</span>
                      </div>
                      <p className="insta-comment-text">{cmt.text}</p>
                    </div>
                    <button type="button" className="insta-comment-like-btn" title="Like comment">
                      <Heart size={14} />
                      <span>{cmt.likes}</span>
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="insta-comment-input-form">
                <img src={brandLogo} alt="You" className="insta-comment-input-avatar" />
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a squad comment..."
                  className="insta-comment-input"
                  maxLength={160}
                />
                <button 
                  type="submit" 
                  disabled={!newCommentText.trim()}
                  className="insta-comment-submit-btn"
                >
                  Post
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
