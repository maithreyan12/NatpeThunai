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
  const reelItems = sourceReels.filter(r => r && isVideoMedia(r));
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(true); // Automatically starts slideshow
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const reelContainerRef = useRef(null);

  const safeIndex = reelItems.length > 0 ? Math.min(currentIndex, reelItems.length - 1) : 0;
  const activeItem = reelItems[safeIndex] || null;
  const currentDuration = 8000;


  // Auto progression slideshow — advances automatically every 3.5s (or 8s for video)
  useEffect(() => {
    if (!isPlaying || reelItems.length <= 1 || !activeItem) return;
    const timer = setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % reelItems.length);
    }, currentDuration);
    return () => clearTimeout(timer);
  }, [isPlaying, safeIndex, reelItems.length, activeItem, currentDuration]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (reelItems.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + reelItems.length) % reelItems.length);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    if (reelItems.length === 0) return;
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
          className={`reel-theater-card ${isFullscreen ? 'fullscreen-mode' : ''}`}
          ref={reelContainerRef}
        >
          {/* Slide Progress Bars */}
          <div className="reel-progress-indicators">
            {reelItems.map((item, idx) => (
              <div 
                key={item?.id || `reel-track-${idx}`} 
                className="progress-segment-track"
                onClick={() => setCurrentIndex(idx)}
              >
                <div 
                  className={`progress-segment-fill ${idx === safeIndex ? (isPlaying ? 'animating' : 'active') : (idx < safeIndex ? 'completed' : '')}`}
                  style={idx === safeIndex && isPlaying ? { animationDuration: `${currentDuration}ms` } : undefined}
                />
              </div>
            ))}
          </div>

          {/* Video Reel Viewport */}
          <div className="reel-media-stage" onClick={() => setIsPlaying(prev => !prev)}>
            <video 
              src={activeItem.mediaUrl} 
              className="reel-media-element" 
              autoPlay={isPlaying}
              playsInline
              loop 
              muted={isMuted}
              key={activeItem.id || safeIndex}
            />


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
                className={`reel-control-btn play-btn ${isPlaying ? 'is-playing' : ''}`}
                onClick={() => setIsPlaying(prev => !prev)}
                title={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                <span>{isPlaying ? "Pause Slideshow" : "Play Slideshow"}</span>
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
