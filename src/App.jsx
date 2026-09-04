import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Navbar, 
  Hero, 
  SquadStory,
  FriendshipJourney, 
  SquadMembers, 
  MemoryReel, 
  MemoriesSpiral,
  SquadAlbum, 
  AlbumMarqueeSection,
  FloatingChatWidget,
  Footer, 
  FriendModal,
  LightboxModal, 
  SignInModal,
  AdminPortal,
  BackgroundMusicPlayer,
  SpotifyMusicModal
} from './components';
import {
  subscribeToMembersR2,
  subscribeToMemoriesR2,
  subscribeToReelsR2,
  subscribeToPostsR2,
  subscribeToEventsR2,
  subscribeToMusicR2,
  saveMemoryR2,
  savePostR2,
  saveEventR2,
  bootR2Database,
} from './services/r2Database';
import { useMusicEngine } from './hooks/useMusicEngine';

import { getStoredMembers, reactToMemory, addCommentToMemory, likePost, toggleEventRsvp } from './services';


import { onAuthChange, signInWithGoogle, logOut } from './firebase';
import './App.css';


export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('squad_theme') || 'light';
  });
  const [currentUser, setCurrentUser] = useState(null);

  // Admin Route State (/admin and #admin support)
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return typeof window !== 'undefined' && 
      (window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#admin'));
  });

  // Album Overlay State (in-page full-screen overlay without URL redirect)
  const [isAlbumOpen, setIsAlbumOpen] = useState(() => {
    return typeof window !== 'undefined' && 
      (window.location.hash === '#album' || window.location.hash === '#/album');
  });

  // Data States — R2 will populate them live
  const [members, setMembers]       = useState(getStoredMembers());
  const [memories, setMemories]     = useState([]);
  const [posts, setPosts]           = useState([]);
  const [events, setEvents]         = useState([]);
  const [reels, setReels]           = useState([]);
  const [musicTracks, setMusicTracks] = useState([]);

  // Unified Music Engine (shared by floating dock and Spotify modal)
  const music = useMusicEngine(musicTracks);


  // Filter States
  const [activeMemberFilter, setActiveMemberFilter] = useState('All');

  // Modal States
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [lightboxMemory, setLightboxMemory] = useState(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Theme synchronization
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('squad_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Listen to Firebase Auth
  useEffect(() => {
    const unsub = onAuthChange(user => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Discreet keyboard shortcut for squad portal login (Ctrl+Shift+L or Cmd+Shift+L)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        setIsSignInOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for URL changes (/admin and browser back/forward)
  useEffect(() => {
    const handleUrlChange = () => {
      const isAdmin = window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#admin');
      setIsAdminRoute(isAdmin);

      if (window.location.hash === '#album' || window.location.hash === '#/album') {
        setIsAlbumOpen(true);
      }
      if (window.location.hash === '#music' || window.location.hash === '#/music') {
        music.openModal();
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [music.openModal]);

  const navigateToAdmin = useCallback(() => {
    window.history.pushState(null, '', '/admin');
    setIsAdminRoute(true);
  }, []);

  const exitAdmin = useCallback(() => {
    window.history.pushState(null, '', '/');
    setIsAdminRoute(false);
  }, []);

  const handleOpenAlbum = useCallback(() => {
    setIsAlbumOpen(true);
  }, []);

  const handleCloseAlbum = useCallback(() => {
    setIsAlbumOpen(false);
    if (window.location.hash === '#album' || window.location.hash === '#/album') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // ── Live R2 data subscriptions — public website always shows latest admin data ──
  useEffect(() => {
    bootR2Database().catch(() => {});
    const unsubMembers   = subscribeToMembersR2(setMembers);
    const unsubMemories  = subscribeToMemoriesR2(setMemories);
    const unsubReels     = subscribeToReelsR2(setReels);
    const unsubPosts     = subscribeToPostsR2(setPosts);
    const unsubEvents    = subscribeToEventsR2(setEvents);
    const unsubMusic     = subscribeToMusicR2(setMusicTracks);
    return () => {
      unsubMembers();
      unsubMemories();
      unsubReels();
      unsubPosts();
      unsubEvents();
      unsubMusic();
    };
  }, []);

  // Scroll to section helper
  const scrollToSection = useCallback((sectionId) => {
    if (sectionId === 'admin') {
      navigateToAdmin();
      return;
    }
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 95;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [navigateToAdmin]);

  // High-performance asynchronous IntersectionObserver for scroll spy (zero main-thread scroll listener)
  useEffect(() => {
    const sections = ['hero', 'story', 'journey', 'members', 'album-teaser', 'timeline', 'reel'];
    
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          const activeId = visibleEntries[0].target.id;
          setActiveSection(prev => (prev !== activeId ? activeId : prev));
        }
      },
      {
        rootMargin: '-15% 0px -55% 0px',
        threshold: [0, 0.2, 0.5, 0.8]
      }
    );

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [members, memories]);

  const handleFilterMemories = (memberName) => {
    setActiveMemberFilter(memberName);
    scrollToSection('timeline');
    showToast(`Filtered memories for ${memberName} 📸`);
  };

  // Memory Handlers
  const handleReactMemory = (memoryId, emoji) => {
    const updated = reactToMemory(memoryId, emoji);
    setMemories(updated);
  };

  const handleAddComment = (memoryId, author, text) => {
    const updated = addCommentToMemory(memoryId, author, text);
    setMemories(updated);
    showToast("Comment posted! 💌");
  };

  const handleUploadPhotos = async (uploadedMemories) => {
    for (const mem of uploadedMemories) {
      await saveMemoryR2(mem);
    }
    showToast(`✨ ${uploadedMemories.length} ${uploadedMemories.length === 1 ? 'photo' : 'photos'} added to your Squad Album!`);
  };

  // Community Post Handlers
  const handleSavePost = async (postData, user) => {
    try {
      const activeUser = user || currentUser;
      if (!activeUser) {
        setIsSignInOpen(true);
        showToast("Please sign in with Google to post.");
        return;
      }
      await savePostR2(postData, activeUser);
      showToast("Shared to squad community! 📣");
    } catch (err) {
      showToast(err.message || "Could not publish post.");
    }
  };

  const handleLikePost = (postId) => {
    const updated = likePost(postId);
    setPosts(updated);
  };

  // Event Handlers
  const handleSaveEvent = async (eventData) => {
    try {
      await saveEventR2(eventData);
      showToast(`Event "${eventData.title}" scheduled! 🗓️`);
    } catch (err) {
      showToast(`Could not create event: ${err.message}`);
    }
  };

  const handleToggleRsvp = (eventId) => {
    const updated = toggleEventRsvp(eventId);
    setEvents(updated);
  };

  // If on /admin URL, render dedicated Admin Portal
  if (isAdminRoute) {
    return (
      <div className="app-main">
        <AdminPortal onExit={exitAdmin} currentUser={currentUser} />
      </div>
    );
  }

  return (
    <div className="app-main">
      {/* Soft Ambient Studio Lighting Canvas */}
      <div className="ambient-bg" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      {/* Floating Navigation Header */}
      <Navbar 
        activeSection={activeSection} 
        onNavigate={scrollToSection}
        onOpenMusic={music.openModal}
        isMusicActive={music.isModalOpen}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
        onOpenSignIn={() => setIsSignInOpen(true)}
      />

      {/* 1. Hero Section (Edge-to-Edge Full Viewport Atmospheric Canvas) */}
      <Hero 
        totalMembers={members.length}
        onExploreTimeline={() => scrollToSection('timeline')}
        onWatchReel={() => scrollToSection('reel')}
        onReadStory={() => scrollToSection('story')}
        onMeetSquad={() => scrollToSection('members')}
      />

      {/* Main Container */}
      <main className="app-container">
        {/* 2. Namma Natpe Thunai Story (The Unfiltered Chronicle) */}
        <SquadStory />

        {/* 3. Friendship Journey Animation */}
        <FriendshipJourney currentUser={currentUser} />

        {/* 4. Dedicated Squad Sanctuary Showcase */}
        <SquadMembers 
          members={members}
          onSelectMember={(member) => setSelectedFriend(member)}
          onFilterByMember={handleFilterMemories}
        />

        {/* 5. Interactive Album Marquee Teaser Strip */}
        <AlbumMarqueeSection 
          onOpenAlbum={handleOpenAlbum}
          members={members}
          memories={memories}
        />

        {/* 6. Infinite Spiral Memories Gallery */}
        <MemoriesSpiral currentUser={currentUser} />


        {/* 7. Cinematic Memory Reel (Dedicated Collection — 100% Isolated from Memories) */}
        <MemoryReel 
          reels={reels}
        />


        {/* 7. Footer */}
        <Footer 
          onScrollTop={() => scrollToSection('hero')} 
          onOpenSignIn={() => setIsSignInOpen(true)}
          onOpenAdmin={navigateToAdmin}
          currentUser={currentUser}
        />

      </main>

      {/* ── AMBIENT BACKGROUND SOUNDTRACK CONTROLLER ── */}
      <BackgroundMusicPlayer 
        activeTrack={music.activeTrack}
        isPlaying={music.isPlaying}
        isMuted={music.isMuted}
        volume={music.volume}
        onTogglePlay={music.togglePlay}
        onToggleMute={music.toggleMute}
        onVolumeChange={music.setVolume}
        onOpenSpotifyModal={music.openModal}
      />

      {/* ── SPOTIFY-STYLE MUSIC STUDIO MODAL ── */}
      <SpotifyMusicModal
        isOpen={music.isModalOpen}
        onClose={music.closeModal}
        tracks={music.tracks}
        currentTrackIndex={music.currentTrackIndex}
        isPlaying={music.isPlaying}
        currentTime={music.currentTime}
        duration={music.duration}
        volume={music.volume}
        isMuted={music.isMuted}
        onTogglePlay={music.togglePlay}
        onSeek={music.seekTo}
        onSelectTrack={music.selectTrack}
        onNextTrack={music.nextTrack}
        onPrevTrack={music.prevTrack}
        onVolumeChange={music.setVolume}
        onToggleMute={music.toggleMute}
      />

      {/* ── CORNER FLOATING MESSAGE & AI CHAT WIDGET ── */}
      <FloatingChatWidget onOpenSignIn={() => setIsSignInOpen(true)} />

      {/* ── MODALS ── */}
      <LightboxModal 
        isOpen={Boolean(lightboxMemory)}
        onClose={() => setLightboxMemory(null)}
        memory={lightboxMemory}
      />



      <FriendModal 
        friend={selectedFriend}
        onClose={() => setSelectedFriend(null)}
        onFilterMemories={handleFilterMemories}
      />

      <SignInModal 
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        currentUser={currentUser}
        onSignIn={signInWithGoogle}
        onSignOut={logOut}
      />

      {/* Full-Screen Interactive Squad Album Overlay */}
      {isAlbumOpen && (
        <SquadAlbum 
          onBackHome={handleCloseAlbum} 
          members={members} 
          memories={memories} 
        />
      )}

      {/* Non-intrusive Toast Notification */}
      {toastMessage && (
        <div className="toast-notification" role="status">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>


  );
}
