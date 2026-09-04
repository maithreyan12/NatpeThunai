import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Sparkles } from 'lucide-react';
import brandLogo from '../../assets/brand-logo.png';
import './BackgroundMusicPlayer.css';

const AUDIO_SRC = '/audio/sonthamulla-vaazhkai.m4a';
const SONG_TITLE_TAMIL = 'சொந்தமுள்ள வாழ்க்கை';
const SONG_TITLE_ENG = 'Sonthamulla Vaazhkkai';
const SONG_SUBTITLE = 'நட்பே துணை Special Song';

export default function BackgroundMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(85);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showInteractionPrompt, setShowInteractionPrompt] = useState(true);

  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const wasPlayingBeforeReelRef = useRef(false);
  const manuallyPausedByUserRef = useRef(false);

  // Initialize native HTML5 audio with autoplay
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume / 100;
    audio.loop = true;

    // Attempt direct autoplay immediately on page open
    const tryAutoplay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        setHasStarted(true);
        setShowInteractionPrompt(false);
      } catch (err) {
        // Browser blocked audio autoplay before user interaction
        console.log('[Audio Player] Waiting for user gesture to unlock audio:', err.message);
        setIsPlaying(false);
      }
    };

    tryAutoplay();

    // Event listeners on native audio
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Seamless fallback: start audio on FIRST user interaction (tap, click, scroll, keydown)
  useEffect(() => {
    if (hasStarted) return;

    const handleFirstGesture = async () => {
      const audio = audioRef.current;
      if (!audio) return;

      try {
        audio.volume = volume / 100;
        await audio.play();
        setIsPlaying(true);
        setHasStarted(true);
        setShowInteractionPrompt(false);
      } catch (err) {
        console.warn('[Audio Player] Gesture play attempt:', err);
      }
    };

    const events = ['click', 'touchstart', 'scroll', 'keydown'];
    events.forEach(evt => {
      window.addEventListener(evt, handleFirstGesture, { once: true, passive: true });
    });

    return () => {
      events.forEach(evt => {
        window.removeEventListener(evt, handleFirstGesture);
      });
    };
  }, [hasStarted, volume]);

  // Stop audio immediately when user switches tabs, minimizes window, or navigates away
  useEffect(() => {
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        // User switched tab or minimized browser — stop the song!
        if (!audio.paused) {
          audio.pause();
          setIsPlaying(false);
        }
      }
    };

    const handlePageExit = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        audio.pause();
        setIsPlaying(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageExit);
    window.addEventListener('beforeunload', handlePageExit);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageExit);
      window.removeEventListener('beforeunload', handlePageExit);
    };
  }, []);

  // Coordinate with Reels section: stop background music when reel is in view / playing original audio
  useEffect(() => {
    // 1. Listen for custom events from MemoryReel or LightboxModal
    const handleReelState = (e) => {
      const { isPlaying: reelIsPlaying, inView } = e.detail || {};
      const audio = audioRef.current;
      if (!audio) return;

      if (inView && reelIsPlaying) {
        // Reel is active with original sound — stop the background song!
        if (!audio.paused) {
          wasPlayingBeforeReelRef.current = true;
          audio.pause();
          setIsPlaying(false);
        }
      } else if (!inView) {
        // User left reels section — resume if it was playing before
        if (wasPlayingBeforeReelRef.current && !manuallyPausedByUserRef.current && !document.hidden) {
          wasPlayingBeforeReelRef.current = false;
          audio.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    };

    window.addEventListener('reel-state-change', handleReelState);

    // 2. Direct IntersectionObserver on #reel element as a reliable failsafe
    let observer = null;
    const setupReelObserver = () => {
      const reelEl = document.getElementById('reel');
      if (!reelEl) return;

      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const audio = audioRef.current;
          if (!audio) return;

          if (entry.isIntersecting && entry.intersectionRatio > 0.15) {
            // Reels section came into view — pause background song
            if (!audio.paused) {
              wasPlayingBeforeReelRef.current = true;
              audio.pause();
              setIsPlaying(false);
            }
          } else if (!entry.isIntersecting) {
            // Left the reels section — resume if it was auto-paused for reel
            if (wasPlayingBeforeReelRef.current && !manuallyPausedByUserRef.current && !document.hidden) {
              wasPlayingBeforeReelRef.current = false;
              audio.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          }
        },
        { threshold: [0, 0.15, 0.5] }
      );

      observer.observe(reelEl);
    };

    setupReelObserver();
    const timer = setTimeout(setupReelObserver, 600);

    return () => {
      window.removeEventListener('reel-state-change', handleReelState);
      if (observer) observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // Toggle Play / Pause
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      manuallyPausedByUserRef.current = true;
      wasPlayingBeforeReelRef.current = false;
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        manuallyPausedByUserRef.current = false;
        await audio.play();
        setIsPlaying(true);
        setHasStarted(true);
        setShowInteractionPrompt(false);
      } catch (err) {
        console.warn('[Audio Player] Play error:', err);
      }
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.muted = false;
      setIsMuted(false);
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  };

  // Adjust Volume
  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = val / 100;
      if (val > 0 && isMuted) {
        audio.muted = false;
        setIsMuted(false);
      }
    }
  };

  return (
    <>
      {/* Pure HTML5 Native Audio Element — ZERO Video */}
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="auto"
        loop
        playsInline
      />

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
                <span className="bg-music-badge">SONG</span>
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
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
