import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Film, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { subscribeToReelsR2, INITIAL_REELS, isVideoMedia } from '../../services/r2Database';
import './MemoryReel.css';


export default function MemoryReel({ reels: propReels, memories = [] }) {
  const [internalReels, setInternalReels] = useState(INITIAL_REELS);

  useEffect(() => {
    if (propReels && propReels.length > 0) {
      setInternalReels(propReels);
      return;
    }
    const unsub = subscribeToReelsR2((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setInternalReels(data);
      }
    });
    return () => unsub();
  }, [propReels]);

  // Extract reel items strictly from the reels collection — VIDEOS ONLY (photos filtered out)
  const sourceReels = Array.isArray(propReels) && propReels.length > 0 ? propReels : internalReels;
  const validReels = sourceReels.filter(r => r && isVideoMedia(r));
  const reelItems = validReels.length > 0 ? validReels : INITIAL_REELS;
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPortrait, setIsPortrait] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const reelContainerRef = useRef(null);
  const videoRef = useRef(null);

  const safeIndex = reelItems.length > 0 ? Math.min(currentIndex, reelItems.length - 1) : 0;
  const activeItem = reelItems[safeIndex] || null;

  // IntersectionObserver: Track when the Reels section comes into or leaves the viewport
  useEffect(() => {
    const el = document.getElementById('reel') || reelContainerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const inView = entry.isIntersecting && entry.intersectionRatio > 0.15;
        setIsInView(inView);

        // Notify background music player to stop or resume
        window.dispatchEvent(
          new CustomEvent('reel-state-change', {
            detail: { isPlaying: inView && isPlaying, inView }
          })
        );
      },
      { threshold: [0, 0.15, 0.5] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isPlaying]);

  // Tab switch & visibility listener: pause video immediately when user switches tabs or window minimizes
  useEffect(() => {
    const handleVisibility = () => {
      const vid = videoRef.current;
      if (document.hidden) {
        if (vid) vid.pause();
        window.dispatchEvent(
          new CustomEvent('reel-state-change', {
            detail: { isPlaying: false, inView: false }
          })
        );
      } else if (isInView && isPlaying) {
        if (vid) vid.play().catch(() => {});
        window.dispatchEvent(
          new CustomEvent('reel-state-change', {
            detail: { isPlaying: true, inView: true }
          })
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isInView, isPlaying]);

  // Detect video dimensions and orientation
  const handleLoadedMetadata = (e) => {
    const { videoWidth, videoHeight } = e.target;
    if (videoHeight && videoWidth) {
      setIsPortrait(videoHeight > videoWidth);
    }
  };

  // Sync orientation on index change and reset active progress
  useEffect(() => {
    setProgressPercent(0);
    const vid = videoRef.current;
    if (vid && vid.videoWidth && vid.videoHeight) {
      setIsPortrait(vid.videoHeight > vid.videoWidth);
    }
  }, [safeIndex, activeItem?.mediaUrl]);

  // Ensure HTML5 video only plays when in view, active, and tab is visible
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const shouldPlay = isPlaying && isInView && !document.hidden;

    if (shouldPlay) {
      const p = vid.play();
      if (p !== undefined) {
        p.catch(() => {
          vid.muted = true;
          setIsMuted(true);
          vid.play().catch(() => {});
        });
      }
    } else {
      vid.pause();
    }
  }, [isPlaying, isInView, safeIndex, activeItem?.mediaUrl]);

  // Sync mute changes directly with the video DOM element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Real-time video progress tracking — perfectly synced with current position
  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (vid && vid.duration && !isNaN(vid.duration) && vid.duration > 0) {
      const pct = (vid.currentTime / vid.duration) * 100;
      setProgressPercent(pct);
    }
  };

  // When reel video finishes naturally, smoothly transition to next reel
  const handleVideoEnded = () => {
    if (reelItems.length > 1) {
      setProgressPercent(0);
      setCurrentIndex(prev => (prev + 1) % reelItems.length);
    }
  };

  // Auto progression fallback for non-video items
  useEffect(() => {
    if (!isPlaying || reelItems.length <= 1 || !activeItem) return;
    if (activeItem.mediaType === 'video') return; // Handled directly by video onTimeUpdate / onEnded

    const interval = setInterval(() => {
      setProgressPercent(prev => {
        if (prev >= 100) {
          setCurrentIndex(curr => (curr + 1) % reelItems.length);
          return 0;
        }
        return prev + 1.25;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, safeIndex, reelItems.length, activeItem]);

  // Explicit play/pause toggle that directly commands the HTML5 video element
  const togglePlay = (e) => {
    e?.stopPropagation?.();
    setIsPlaying(prev => {
      const nextState = !prev;
      const vid = videoRef.current;
      if (vid) {
        if (nextState) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      }
      window.dispatchEvent(
        new CustomEvent('reel-state-change', {
          detail: { isPlaying: nextState, inView: isInView }
        })
      );
      return nextState;
    });
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (reelItems.length === 0) return;
    setProgressPercent(0);
    setCurrentIndex(prev => (prev - 1 + reelItems.length) % reelItems.length);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    if (reelItems.length === 0) return;
    setProgressPercent(0);
    setCurrentIndex(prev => (prev + 1) % reelItems.length);
  };


  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      reelContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <section id="reel" className="memory-reel-section">
      <div className="section-header">
        <div className="badge-pill">
          <Film size={14} />
          <span>CINEMATIC ARCHIVE</span>
        </div>
        <h2 className="section-title">
          Our Memory Reel
        </h2>
        <p className="section-desc">
          Watch our shared journey unfold as a timeless visual cinematic reel.
        </p>
      </div>

      {reelItems.length === 0 || !activeItem ? (
        <div className="empty-state-box">
          <div className="empty-state-icon">
            <Film size={26} />
          </div>
          <h3 className="empty-state-title">Our memory reel is loading.</h3>
          <p className="empty-state-text">
            Moments and photographs will appear in this continuous squad memory reel.
          </p>
        </div>
      ) : (
        <div 
          className={`reel-theater-card ${isFullscreen ? 'fullscreen-mode' : ''} ${isPortrait ? 'is-portrait' : 'is-landscape'}`}
          ref={reelContainerRef}
        >
          {/* Slide Progress Bars — Synchronized to real-time playback */}
          <div className="reel-progress-indicators">
            {reelItems.map((item, idx) => (
              <div 
                key={item?.id || `reel-track-${idx}`} 
                className="progress-segment-track"
                onClick={() => {
                  setProgressPercent(0);
                  setCurrentIndex(idx);
                }}
              >
                <div 
                  className={`progress-segment-fill ${idx < safeIndex ? 'completed' : (idx === safeIndex ? 'active' : '')}`}
                  style={{
                    width: idx < safeIndex ? '100%' : (idx === safeIndex ? `${progressPercent}%` : '0%')
                  }}
                />
              </div>
            ))}
          </div>

          {/* Video Reel Viewport — Dynamically Formats to Portrait or Landscape */}
          <div 
            className={`reel-media-stage ${isPortrait ? 'stage-portrait' : 'stage-landscape'}`} 
            onClick={togglePlay} 
            title={isPlaying ? "Click to Pause" : "Click to Play"}
          >
            {/* Ambient CSS backdrop glow is handled via CSS stage-portrait */}

            <video 
              ref={videoRef}
              src={activeItem.mediaUrl} 
              className={`reel-media-element ${isPortrait ? 'media-portrait' : 'media-landscape'}`} 
              autoPlay={isPlaying}
              playsInline
              muted={isMuted}
              preload="auto"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              key={activeItem.id || safeIndex}
            />

            {/* Paused State Floating Overlay */}
            {!isPlaying && (
              <div className="reel-paused-indicator" title="Paused - Click to Play">
                <Play size={34} style={{ marginLeft: 3 }} />
              </div>
            )}

            {/* Tap areas for left/right navigation */}
            <div className="reel-tap-area left" onClick={handlePrev}>
              <button className="reel-nav-arrow left" aria-label="Previous">
                <ChevronLeft size={24} />
              </button>
            </div>
            <div className="reel-tap-area right" onClick={handleNext}>
              <button className="reel-nav-arrow right" aria-label="Next">
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Bottom Caption Overlay */}
            <div className="reel-caption-overlay">
              <div className="reel-caption-meta">
                <span className="reel-badge-year">{activeItem.category || "Moment"}</span>
                <span className="reel-date">{activeItem.date || ""}</span>
                {activeItem.location && <span className="reel-loc">• {activeItem.location}</span>}
              </div>
              <h3 className="reel-item-title">{activeItem.title || "Squad Memory"}</h3>
              {activeItem.description && (
                <p className="reel-item-desc">{activeItem.description}</p>
              )}
            </div>
          </div>

          {/* Bottom Bar Controls */}
          <div className="reel-controls-bar">
            <div className="controls-left">
              <button 
                className={`reel-control-btn play-btn ${isPlaying ? 'is-playing' : 'is-paused'}`}
                onClick={togglePlay}
                title={isPlaying ? "Pause Reel" : "Play Reel"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                <span>{isPlaying ? "Pause Reel" : "Play Reel"}</span>
              </button>



              <span className="reel-counter-text">
                {safeIndex + 1} of {reelItems.length}
              </span>
            </div>

            <div className="controls-right">
              {activeItem.mediaType === 'video' && (
                <button 
                  className="reel-icon-btn"
                  onClick={() => setIsMuted(prev => !prev)}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              )}

              <button 
                className="reel-icon-btn"
                onClick={toggleFullscreen}
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
