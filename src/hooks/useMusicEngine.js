import { useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_MUSIC_TRACKS } from '../services/r2Database';

export function useMusicEngine(initialTracks = []) {
  const [tracks, setTracks] = useState(() => {
    return Array.isArray(initialTracks) && initialTracks.length > 0 
      ? initialTracks 
      : INITIAL_MUSIC_TRACKS;
  });

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const audioRef = useRef(null);
  const wasPlayingBeforeReelRef = useRef(false);
  const manuallyPausedRef = useRef(false);

  // Sync external tracks from R2 live subscription
  useEffect(() => {
    if (Array.isArray(initialTracks) && initialTracks.length > 0) {
      setTracks(initialTracks);
    }
  }, [initialTracks]);

  const activeTrack = tracks[currentTrackIndex] || tracks[0] || null;

  // Initialize native HTML5 audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    audio.volume = isMuted ? 0 : volume / 100;
    audio.preload = 'auto';

    if (activeTrack?.audioUrl && audio.src !== activeTrack.audioUrl) {
      const prevPlaying = isPlaying;
      audio.src = activeTrack.audioUrl;
      if (prevPlaying) {
        audio.play().catch(() => {});
      }
    }
  }, [activeTrack?.audioUrl]);

  // Handle native audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      // Auto-play next track in playlist
      if (tracks.length > 1) {
        setCurrentTrackIndex(prev => (prev + 1) % tracks.length);
      } else {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [tracks.length]);

  // Autoplay attempt on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack?.audioUrl) return;

    const tryAutoplay = async () => {
      try {
        if (!audio.src) audio.src = activeTrack.audioUrl;
        audio.volume = isMuted ? 0 : volume / 100;
        await audio.play();
        setIsPlaying(true);
        setHasStarted(true);
      } catch (err) {
        setIsPlaying(false);
      }
    };

    tryAutoplay();
  }, []);

  // First gesture unlock fallback
  useEffect(() => {
    if (hasStarted) return;

    const handleFirstGesture = async () => {
      const audio = audioRef.current;
      if (!audio || !activeTrack?.audioUrl) return;

      try {
        if (!audio.src) audio.src = activeTrack.audioUrl;
        audio.volume = isMuted ? 0 : volume / 100;
        await audio.play();
        setIsPlaying(true);
        setHasStarted(true);
      } catch (err) {
        console.warn('[Music Engine] Gesture play attempt:', err);
      }
    };

    const events = ['click', 'touchstart', 'scroll', 'keydown'];
    events.forEach(evt => window.addEventListener(evt, handleFirstGesture, { once: true, passive: true }));
    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleFirstGesture));
    };
  }, [hasStarted, activeTrack?.audioUrl, volume, isMuted]);

  // Tab visibility changes: pause on hide
  useEffect(() => {
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        if (!audio.paused) {
          audio.pause();
          setIsPlaying(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Listen to reel events to mute background music
  useEffect(() => {
    const handleReelOpen = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (!audio.paused) {
        wasPlayingBeforeReelRef.current = true;
        audio.pause();
        setIsPlaying(false);
      }
    };

    const handleReelClose = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (wasPlayingBeforeReelRef.current && !manuallyPausedRef.current) {
        wasPlayingBeforeReelRef.current = false;
        audio.play().catch(() => {});
      }
    };

    window.addEventListener('squad-reel-opened', handleReelOpen);
    window.addEventListener('squad-reel-closed', handleReelClose);
    return () => {
      window.removeEventListener('squad-reel-opened', handleReelOpen);
      window.removeEventListener('squad-reel-closed', handleReelClose);
    };
  }, []);

  // Volume synchronization
  const setAudioVolume = useCallback((val) => {
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : val / 100;
    }
  }, [isMuted]);

  // Mute toggle
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.volume = next ? 0 : volume / 100;
      }
      return next;
    });
  }, [volume]);

  // Play / Pause toggle
  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        if (!audio.src && activeTrack?.audioUrl) {
          audio.src = activeTrack.audioUrl;
        }
        await audio.play();
        setIsPlaying(true);
        manuallyPausedRef.current = false;
      } catch (err) {
        console.warn('[Music Engine] Play failed:', err);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
      manuallyPausedRef.current = true;
    }
  }, [activeTrack?.audioUrl]);

  // Seek
  const seekTo = useCallback((seconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  // Select track from playlist
  const selectTrack = useCallback((index) => {
    if (index < 0 || index >= tracks.length) return;
    setCurrentTrackIndex(index);
    const selected = tracks[index];
    if (selected && audioRef.current) {
      audioRef.current.src = selected.audioUrl;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        manuallyPausedRef.current = false;
      }).catch(() => {});
    }
  }, [tracks]);

  // Next track
  const nextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    selectTrack(nextIdx);
  }, [currentTrackIndex, tracks.length, selectTrack]);

  // Previous track
  const prevTrack = useCallback(() => {
    if (tracks.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    selectTrack(prevIdx);
  }, [currentTrackIndex, tracks.length, selectTrack]);

  return {
    tracks,
    activeTrack,
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    togglePlay,
    seekTo,
    selectTrack,
    nextTrack,
    prevTrack,
    setVolume: setAudioVolume,
    toggleMute,
  };
}
