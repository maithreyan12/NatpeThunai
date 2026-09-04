import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, ExternalLink, Sparkles } from 'lucide-react';
import brandLogo from '../../assets/brand-logo.png';
import './BackgroundMusicPlayer.css';

const YOUTUBE_VIDEO_ID = 'QEPgBVStsMM';
const SONG_TITLE_TAMIL = 'சொந்தமுள்ள வாழ்க்கை';
const SONG_TITLE_ENG = 'Sonthamulla Vaazhkkai';
const SONG_SUBTITLE = 'நட்பே துணை Official Soundtrack';

export default function BackgroundMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showInteractionPrompt, setShowInteractionPrompt] = useState(true);

  const playerRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize YouTube IFrame API
  useEffect(() => {
    let checkInterval = null;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return false;

      try {
        playerRef.current = new window.YT.Player('hidden-yt-music-player', {
          height: '1',
          width: '1',
          videoId: YOUTUBE_VIDEO_ID,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: YOUTUBE_VIDEO_ID,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              setIsLoaded(true);
              try {
                event.target.setVolume(volume);
                event.target.playVideo();
              } catch (e) {
                console.log('[Music Player] Autoplay blocked by browser, waiting for user gesture:', e);
              }
            },
            onStateChange: (event) => {
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                setIsPlaying(true);
                setHasStarted(true);
                setShowInteractionPrompt(false);
              } else if (event.data === 2) {
                setIsPlaying(false);
              } else if (event.data === 0) {
                // Loop back seamlessly
                event.target.seekTo(0);
                event.target.playVideo();
              }
            },
            onError: (err) => {
              console.warn('[Music Player] YouTube error:', err);
            }
          }
        });
        return true;
      } catch (err) {
        console.warn('[Music Player] Init error:', err);
        return false;
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      if (!initPlayer()) {
        checkInterval = setInterval(() => {
          if (initPlayer()) {
            clearInterval(checkInterval);
          }
        }, 300);
      }
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, []);

  // Seamless Autoplay fallback: Trigger on FIRST user interaction (click, touch, scroll)
  useEffect(() => {
    if (hasStarted) return;

    const handleFirstInteraction = () => {
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        try {
          playerRef.current.unMute();
          playerRef.current.setVolume(volume);
          playerRef.current.playVideo();
          setIsPlaying(true);
          setHasStarted(true);
          setShowInteractionPrompt(false);
        } catch (e) {
          console.warn('[Music Player] Interaction play failed:', e);
        }
      }
    };

    const events = ['click', 'touchstart', 'scroll', 'keydown'];
    events.forEach(evt => {
      window.addEventListener(evt, handleFirstInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach(evt => {
        window.removeEventListener(evt, handleFirstInteraction);
      });
    };
  }, [hasStarted, volume]);

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
      setHasStarted(true);
      setShowInteractionPrompt(false);
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  // Adjust volume
  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    if (playerRef.current) {
      playerRef.current.setVolume(val);
      if (val > 0 && isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  return (
    <>
      {/* Hidden YouTube IFrame Audio Engine */}
      <div
        id="hidden-yt-music-player-container"
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
          visibility: 'hidden',
          zIndex: -1
        }}
        aria-hidden="true"
      >
        <div id="hidden-yt-music-player" />
      </div>

      {/* Ambient Autoplay Prompt Pill (Disappears once music plays) */}
      {showInteractionPrompt && !isPlaying && (
        <aside
          className="bg-music-tap-prompt"
          onClick={togglePlay}
          role="region"
          aria-label="Audio Playback Prompt"
        >
          <div className="prompt-pulse-dot" />
          <span className="prompt-text">
            🎵 Tap to play <strong>{SONG_TITLE_TAMIL}</strong>
          </span>
          <button
            type="button"
            className="prompt-close"
            onClick={(e) => {
              e.stopPropagation();
              setShowInteractionPrompt(false);
            }}
            aria-label="Dismiss audio prompt"
          >
            ×
          </button>
        </aside>
      )}

      {/* Floating Modern Music Dock Widget (Bottom-Left) */}
      <aside
        ref={containerRef}
        className={`bg-music-dock ${isPlaying ? 'is-playing' : 'is-paused'} ${isCollapsed ? 'is-collapsed' : ''}`}
        aria-label="Background Soundtrack Controller"
      >
        {/* Ambient Glow Aura */}
        <div className="bg-music-glow" aria-hidden="true" />

        {/* ── Spinning Vinyl Record Badge ── */}
        <button
          type="button"
          className="bg-music-vinyl-btn"
          onClick={() => setIsCollapsed(prev => !prev)}
          title={isCollapsed ? 'Expand music player' : 'Collapse music player'}
          aria-label={isCollapsed ? 'Expand music player' : 'Collapse music player'}
        >
          <div className={`vinyl-disc ${isPlaying ? 'spinning' : ''}`}>
            <div className="vinyl-groove-ring" />
            <div className="vinyl-groove-ring-inner" />
            <div className="vinyl-center-label">
              <img src={brandLogo} alt="Natpe Thunai" className="vinyl-logo-img" />
            </div>
          </div>
          {isPlaying && (
            <span className="vinyl-needle-indicator" aria-hidden="true" />
          )}
        </button>

        {/* ── Player Body & Controls ── */}
        {!isCollapsed && (
          <div className="bg-music-details">
            {/* Song Meta Information */}
            <div className="bg-music-info">
              <div className="bg-music-title-row">
                <span className="bg-music-badge">BGM</span>
                <span className="bg-music-name-tamil">{SONG_TITLE_TAMIL}</span>
                {isPlaying && (
                  <div className="bg-music-soundwave" aria-hidden="true">
                    <span className="bar bar-1" />
                    <span className="bar bar-2" />
                    <span className="bar bar-3" />
                    <span className="bar bar-4" />
                  </div>
                )}
              </div>
              <div className="bg-music-artist">
                {SONG_TITLE_ENG} • {SONG_SUBTITLE}
              </div>
            </div>

            {/* Interactive Control Buttons */}
            <div className="bg-music-actions">
              {/* Play / Pause Toggle */}
              <button
                type="button"
                className="bg-music-ctrl-btn play-pause-btn"
                onClick={togglePlay}
                title={isPlaying ? 'Pause Music' : 'Play Music'}
                aria-label={isPlaying ? 'Pause Music' : 'Play Music'}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} className="play-icon-offset" />}
              </button>

              {/* Mute / Unmute Toggle */}
              <button
                type="button"
                className="bg-music-ctrl-btn mute-btn"
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>

              {/* Volume Slider Bar */}
              <div className="bg-music-volume-slider-wrap" title={`Volume: ${volume}%`}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="bg-music-volume-slider"
                  aria-label="Volume Slider"
                />
              </div>

              {/* YouTube Source Link */}
              <a
                href={`https://youtu.be/${YOUTUBE_VIDEO_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-music-ctrl-btn yt-link-btn"
                title="Watch on YouTube"
                aria-label="Watch Sonthamulla Vaazhkai on YouTube"
              >
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
