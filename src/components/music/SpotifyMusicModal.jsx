import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Shuffle, Music, X, Sparkles, Disc, ListMusic, 
  Sliders, ChevronDown, Heart
} from 'lucide-react';
import './SpotifyMusicModal.css';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function SpotifyMusicModal({
  isOpen,
  onClose,
  tracks = [],
  currentTrackIndex = 0,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  volume = 85,
  isMuted = false,
  onTogglePlay,
  onSeek,
  onSelectTrack,
  onNextTrack,
  onPrevTrack,
  onVolumeChange,
  onToggleMute,
}) {
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(true);
  const [mobileTab, setMobileTab] = useState('player'); // 'player' | 'queue'
  const [likedTracks, setLikedTracks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('liked_music_tracks') || '{}');
    } catch {
      return {};
    }
  });

  const activeTrack = tracks[currentTrackIndex] || tracks[0] || null;
  const nextTrackIndex = (currentTrackIndex + 1) % (tracks.length || 1);
  const nextTrack = tracks.length > 1 ? tracks[nextTrackIndex] : null;

  // Toggle track like/favorite
  const toggleLike = (trackId) => {
    setLikedTracks(prev => {
      const next = { ...prev, [trackId]: !prev[trackId] };
      try {
        localStorage.setItem('liked_music_tracks', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        onTogglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onTogglePlay]);

  if (!isOpen) return null;

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const handleScrub = (clientX, target) => {
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onSeek(ratio * (duration || 1));
  };

  return (
    <div className="spotify-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="spotify-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Drag Handle indicator for mobile */}
        <div className="spotify-drag-handle" aria-hidden="true" />

        {/* Background ambient color splash from cover art */}
        <div 
          className="spotify-ambient-glow" 
          style={{ backgroundImage: activeTrack?.coverPhoto ? `url(${activeTrack.coverPhoto})` : undefined }}
        />

        {/* ── HEADER ── */}
        <div className="spotify-modal-header">
          <div className="spotify-badge-pill">
            <Sparkles size={14} className="spotify-sparkle-icon" />
            <span>NATPE THUNAI SPOTIFY</span>
          </div>

          <div className="spotify-header-actions">
            <button 
              type="button" 
              className="spotify-close-btn"
              onClick={onClose}
              title="Close Music Player"
              aria-label="Close Music Player"
            >
              <ChevronDown size={22} />
            </button>
          </div>
        </div>

        {/* ── MOBILE SEGMENTED TABS (Now Playing / Playlist) ── */}
        <div className="spotify-mobile-tabs" role="tablist">
          <button 
            type="button" 
            role="tab"
            aria-selected={mobileTab === 'player'}
            className={`spotify-mobile-tab-btn ${mobileTab === 'player' ? 'active' : ''}`}
            onClick={() => setMobileTab('player')}
          >
            <Disc size={15} />
            <span>Now Playing</span>
          </button>
          <button 
            type="button" 
            role="tab"
            aria-selected={mobileTab === 'queue'}
            className={`spotify-mobile-tab-btn ${mobileTab === 'queue' ? 'active' : ''}`}
            onClick={() => setMobileTab('queue')}
          >
            <ListMusic size={15} />
            <span>Playlist ({tracks.length})</span>
          </button>
        </div>

        {/* ── TWO-COLUMN / MOBILE-TABBED MAIN CONTENT ── */}
        <div className={`spotify-modal-body mobile-view-${mobileTab}`}>
          {/* LEFT: NOW PLAYING SPOTLIGHT */}
          <div className="spotify-now-playing-stage">
            <div className={`spotify-art-frame ${isPlaying ? 'is-playing' : ''}`}>
              <img 
                src={activeTrack?.coverPhoto || '/audio/cover-default.jpg'} 
                alt={activeTrack?.title || 'Song Cover'} 
                className="spotify-cover-img"
              />
              <div className="spotify-vinyl-groove" />
              <div className="spotify-cover-gloss" />
            </div>

            <div className="spotify-meta-section">
              <div className="spotify-title-row">
                <div className="spotify-title-texts">
                  <h2 className="spotify-song-title">
                    {activeTrack?.title || 'Sonthamulla Vaazhkai'}
                  </h2>
                  {activeTrack?.titleTamil && (
                    <span className="spotify-tamil-title">
                      {activeTrack.titleTamil}
                    </span>
                  )}
                  <p className="spotify-artist-desc">
                    {activeTrack?.artist || 'Natpe Thunai Anthem'} 
                    {activeTrack?.description && ` • ${activeTrack.description}`}
                  </p>
                </div>

                <button 
                  type="button"
                  className={`spotify-like-btn ${likedTracks[activeTrack?.id] ? 'is-liked' : ''}`}
                  onClick={() => activeTrack && toggleLike(activeTrack.id)}
                  title={likedTracks[activeTrack?.id] ? "Remove from Favorites" : "Save to Favorites"}
                  aria-label="Like song"
                >
                  <Heart size={20} fill={likedTracks[activeTrack?.id] ? '#ec4899' : 'none'} />
                </button>
              </div>

              {/* Animated Live Soundwaves */}
              <div className={`spotify-equalizer ${isPlaying ? 'active' : ''}`} aria-hidden="true">
                <span className="eq-bar bar-1" />
                <span className="eq-bar bar-2" />
                <span className="eq-bar bar-3" />
                <span className="eq-bar bar-4" />
                <span className="eq-bar bar-5" />
                <span className="eq-bar bar-6" />
                <span className="eq-bar bar-7" />
                <span className="eq-bar bar-8" />
              </div>

              {/* Seek Timeline Scrubber (Touch + Mouse Seeking) */}
              <div className="spotify-timeline-wrap">
                <span className="spotify-time-label">{formatTime(currentTime)}</span>
                <div 
                  className="spotify-scrubber-track"
                  onClick={(e) => handleScrub(e.clientX, e.currentTarget)}
                  onTouchStart={(e) => handleScrub(e.touches[0].clientX, e.currentTarget)}
                  onTouchMove={(e) => handleScrub(e.touches[0].clientX, e.currentTarget)}
                  role="slider"
                  aria-valuenow={currentTime}
                  aria-valuemin={0}
                  aria-valuemax={duration || 1}
                  aria-label="Song progress"
                  tabIndex={0}
                >
                  <div 
                    className="spotify-scrubber-progress"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <div 
                    className="spotify-scrubber-handle"
                    style={{ left: `${progressPercent}%` }}
                  />
                </div>
                <span className="spotify-time-label">{formatTime(duration)}</span>
              </div>

              {/* Main Playback Controls */}
              <div className="spotify-controls-row">
                <button 
                  type="button"
                  className={`spotify-ctrl-icon ${isShuffle ? 'active-toggle' : ''}`}
                  onClick={() => setIsShuffle(prev => !prev)}
                  title="Shuffle (Toggle)"
                  aria-label="Shuffle"
                >
                  <Shuffle size={18} />
                </button>

                <button 
                  type="button"
                  className="spotify-ctrl-icon"
                  onClick={onPrevTrack}
                  title="Previous Track"
                  aria-label="Previous Track"
                >
                  <SkipBack size={22} />
                </button>

                <button 
                  type="button"
                  className="spotify-play-pause-hero"
                  onClick={onTogglePlay}
                  title={isPlaying ? "Pause" : "Play"}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={28} /> : <Play size={28} className="spotify-hero-play-icon" />}
                </button>

                <button 
                  type="button"
                  className="spotify-ctrl-icon"
                  onClick={onNextTrack}
                  title="Next Track"
                  aria-label="Next Track"
                >
                  <SkipForward size={22} />
                </button>

                <button 
                  type="button"
                  className={`spotify-ctrl-icon ${isRepeat ? 'active-toggle' : ''}`}
                  onClick={() => setIsRepeat(prev => !prev)}
                  title="Repeat Track (Toggle)"
                  aria-label="Repeat Track"
                >
                  <Repeat size={18} />
                </button>
              </div>

              {/* Volume Slider Bar */}
              <div className="spotify-volume-dock">
                <button 
                  type="button" 
                  className="spotify-volume-icon-btn"
                  onClick={onToggleMute}
                  title={isMuted ? "Unmute" : "Mute"}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="spotify-vol-slider"
                  title={`Volume: ${volume}%`}
                  aria-label="Volume Slider"
                />
                <span className="spotify-vol-val">{isMuted ? '0%' : `${volume}%`}</span>
              </div>

              {/* Mobile "Up Next" preview banner */}
              {nextTrack && (
                <div 
                  className="spotify-mobile-upnext-banner" 
                  onClick={() => setMobileTab('queue')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="spotify-upnext-left">
                    <span className="spotify-upnext-tag">UP NEXT</span>
                    <span className="spotify-upnext-title">{nextTrack.title}</span>
                  </div>
                  <span className="spotify-upnext-link">View Playlist →</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: SQUAD TRACKLIST QUEUE */}
          <div className="spotify-queue-panel">
            <div className="spotify-queue-header">
              <div className="spotify-queue-title-wrap">
                <ListMusic size={18} className="spotify-queue-icon" />
                <h3 className="spotify-queue-title">Squad Playlist</h3>
              </div>
              <span className="spotify-queue-count">{tracks.length} {tracks.length === 1 ? 'Track' : 'Tracks'}</span>
            </div>

            <div className="spotify-tracklist-scroll">
              {tracks.map((track, idx) => {
                const isActive = idx === currentTrackIndex;
                return (
                  <div 
                    key={track.id || idx}
                    className={`spotify-track-row ${isActive ? 'is-active-track' : ''}`}
                    onClick={() => {
                      onSelectTrack(idx);
                      // On mobile, keep in queue or toggle to player if user wants
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectTrack(idx);
                      }
                    }}
                  >
                    <div className="spotify-track-index">
                      {isActive && isPlaying ? (
                        <div className="mini-eq">
                          <span className="mini-bar" />
                          <span className="mini-bar" />
                          <span className="mini-bar" />
                        </div>
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    <div className="spotify-track-thumb-wrap">
                      <img 
                        src={track.coverPhoto || '/audio/cover-default.jpg'} 
                        alt="" 
                        className="spotify-track-thumb"
                        loading="lazy"
                      />
                      {isActive && (
                        <div className="spotify-thumb-overlay-icon">
                          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </div>
                      )}
                    </div>

                    <div className="spotify-track-details">
                      <div className="spotify-track-name">
                        {track.title}
                        {track.titleTamil && <span className="spotify-track-tamil"> • {track.titleTamil}</span>}
                      </div>
                      <div className="spotify-track-artist">
                        {track.artist || 'Natpe Thunai Squad'}
                      </div>
                    </div>

                    <div className="spotify-track-right">
                      {track.duration && (
                        <span className="spotify-track-duration">{track.duration}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Sticky Mini-Player Bar (When browsing playlist on phone) */}
            {activeTrack && (
              <div 
                className="spotify-mobile-sticky-mini" 
                onClick={() => setMobileTab('player')}
                role="button"
                tabIndex={0}
              >
                <img 
                  src={activeTrack.coverPhoto || '/audio/cover-default.jpg'} 
                  alt="" 
                  className="mini-sticky-img" 
                />
                <div className="mini-sticky-info">
                  <span className="mini-sticky-title">{activeTrack.title}</span>
                  <span className="mini-sticky-artist">{activeTrack.artist || 'Natpe Thunai'}</span>
                </div>
                <button 
                  type="button" 
                  className="mini-sticky-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePlay();
                  }}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="mini-sticky-play-icon" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
