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
import './MemoryReel.css';

export default function MemoryReel({ memories }) {
  // Extract all memories that have media
  const reelItems = memories.filter(m => m.mediaUrl);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const reelContainerRef = useRef(null);

  const activeItem = reelItems[currentIndex];

  // Auto progression when playing
  useEffect(() => {
    if (!isPlaying || reelItems.length === 0) return;
    const duration = activeItem?.mediaType === 'video' ? 10000 : 5000;
    const timer = setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % reelItems.length);
    }, duration);
    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, reelItems.length, activeItem]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + reelItems.length) % reelItems.length);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
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

      {reelItems.length === 0 ? (
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
          className={`reel-theater-card ${isFullscreen ? 'fullscreen-mode' : ''}`}
          ref={reelContainerRef}
        >
          {/* Slide Progress Bars */}
          <div className="reel-progress-indicators">
            {reelItems.map((item, idx) => (
              <div 
                key={item.id} 
                className="progress-segment-track"
                onClick={() => setCurrentIndex(idx)}
              >
                <div 
                  className={`progress-segment-fill ${idx === currentIndex ? (isPlaying ? 'animating' : 'active') : (idx < currentIndex ? 'completed' : '')}`}
                />
              </div>
            ))}
          </div>

          {/* Media Viewport */}
          <div className="reel-media-stage" onClick={() => setIsPlaying(prev => !prev)}>
            {activeItem.mediaType === 'video' ? (
              <video 
                src={activeItem.mediaUrl} 
                className="reel-media-element" 
                autoPlay={isPlaying}
                loop 
                muted={isMuted}
                key={activeItem.id}
              />
            ) : (
              <img 
                src={activeItem.mediaUrl} 
                alt={activeItem.title} 
                className="reel-media-element" 
                key={activeItem.id}
              />
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
                <span className="reel-date">{activeItem.date}</span>
                {activeItem.location && <span className="reel-loc">• {activeItem.location}</span>}
              </div>
              <h3 className="reel-item-title">{activeItem.title}</h3>
              {activeItem.description && (
                <p className="reel-item-desc">{activeItem.description}</p>
              )}
            </div>
          </div>

          {/* Bottom Bar Controls */}
          <div className="reel-controls-bar">
            <div className="controls-left">
              <button 
                className="reel-control-btn play-btn"
                onClick={() => setIsPlaying(prev => !prev)}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                <span>{isPlaying ? "Pause Reel" : "Play Reel"}</span>
              </button>

              <span className="reel-counter-text">
                {currentIndex + 1} of {reelItems.length}
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
