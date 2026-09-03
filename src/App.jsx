import React, { useState, useEffect } from 'react';
import { 
  Navbar, 
  Hero, 
  SquadStory,
  FriendshipJourney, 
  SquadMembers, 
  MemoryTimeline,
  MemoryReel, 
  SquadAlbum, 
  AlbumMarqueeSection,
  FloatingChatWidget,
  Footer, 
  FriendModal,
  LightboxModal, 
  SignInModal,
  AdminPortal
} from './components';
import {
  subscribeToMembersR2,
  subscribeToMemoriesR2,
  subscribeToPostsR2,
  subscribeToEventsR2,
  saveMemoryR2,
  savePostR2,
  saveEventR2,
  bootR2Database,
} from './services/r2Database';
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
      (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin');
  });

  // Album Overlay State (in-page full-screen overlay without URL redirect)
  const [isAlbumOpen, setIsAlbumOpen] = useState(() => {
    return typeof window !== 'undefined' && 
      (window.location.hash === '#album' || window.location.hash === '#/album');
  });

  // Data States — R2 will populate them live
  const [members, setMembers]   = useState(getStoredMembers());
  const [memories, setMemories] = useState([]);
  const [posts, setPosts]       = useState([]);
  const [events, setEvents]     = useState([]);

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

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

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
      const isAdmin = window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
      setIsAdminRoute(isAdmin);

      if (window.location.hash === '#album' || window.location.hash === '#/album') {
        setIsAlbumOpen(true);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigateToAdmin = () => {
    window.history.pushState(null, '', '/admin');
    setIsAdminRoute(true);
  };

  const exitAdmin = () => {
    window.history.pushState(null, '', '/');
    setIsAdminRoute(false);
  };

  const handleOpenAlbum = () => {
    setIsAlbumOpen(true);
  };

  const handleCloseAlbum = () => {
    setIsAlbumOpen(false);
    if (window.location.hash === '#album' || window.location.hash === '#/album') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // ── Live R2 data subscriptions — public website always shows latest admin data ──
  useEffect(() => {
    bootR2Database().catch(() => {});
    const unsubMembers   = subscribeToMembersR2(setMembers);
    const unsubMemories  = subscribeToMemoriesR2(setMemories);
    const unsubPosts     = subscribeToPostsR2(setPosts);
    const unsubEvents    = subscribeToEventsR2(setEvents);
    return () => {
      unsubMembers();
      unsubMemories();
      unsubPosts();
      unsubEvents();
    };
  }, []);


  // Scroll to section helper
  const scrollToSection = (sectionId) => {
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
  };

  // Scroll spy observer
  useEffect(() => {
    const sections = ['hero', 'story', 'journey', 'members', 'album-teaser', 'timeline', 'reel'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <FriendshipJourney />

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

        {/* 6. Infinite Spiral Memory Vortex */}
        <MemoryTimeline 
          memories={memories}
          members={members}
          activeMemberFilter={activeMemberFilter}
          onSelectMemberFilter={setActiveMemberFilter}
          onReact={handleReactMemory}
          onAddComment={handleAddComment}
          onOpenLightbox={(m) => setLightboxMemory(m)}
          onUploadPhotos={handleUploadPhotos}
          currentUser={currentUser}
        />

        {/* 7. Cinematic Memory Reel */}
        <MemoryReel 
          memories={memories}
        />

        {/* 7. Footer */}
        <Footer 
          onScrollTop={() => scrollToSection('hero')} 
          onOpenSignIn={() => setIsSignInOpen(true)}
          onOpenAdmin={navigateToAdmin}
          currentUser={currentUser}
        />

      </main>

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
