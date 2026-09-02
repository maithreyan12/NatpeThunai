import React, { useState, useEffect } from 'react';
import { 
  Navbar, 
  Hero, 
  SquadStory,
  FriendshipJourney, 
  SquadMembers, 
  MemoryTimeline, 
  MemoryReel, 
  CommunitySection, 
  GroupChat, 
  Footer, 
  FriendModal,
  AddMemberModal,
  CreatePostModal, 
  AddEventModal, 
  LightboxModal,
  SignInModal 
} from './components';
import { 
  getStoredMembers,
  saveSquadMember,
  updateSquadMember,
  subscribeToMemories, 
  getStoredMemories,
  saveMemory,
  reactToMemory, 
  addCommentToMemory,
  getStoredPosts,
  savePost,
  likePost,
  getStoredEvents,
  saveEvent,
  toggleEventRsvp 
} from './services';
import { onAuthChange, signInWithGoogle, logOut } from './firebase';
import './App.css';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('squad_theme') || 'light';
  });
  const [currentUser, setCurrentUser] = useState(null);

  // Data States
  const [members, setMembers] = useState(getStoredMembers());
  const [memories, setMemories] = useState([]);
  const [posts, setPosts] = useState(getStoredPosts());
  const [events, setEvents] = useState(getStoredEvents());

  // Filter States
  const [activeMemberFilter, setActiveMemberFilter] = useState('All');

  // Modal States
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
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

  // Listen to real-time Memories
  useEffect(() => {
    const unsub = subscribeToMemories(liveMemories => {
      setMemories(liveMemories);
    });
    return () => unsub();
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
    const sections = ['hero', 'story', 'journey', 'members', 'timeline', 'reel', 'community', 'chat'];
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

  // Member Management Handlers
  const handleSaveMember = (memberData) => {
    if (editingMember) {
      const updated = updateSquadMember(editingMember.id, memberData);
      setMembers(updated);
      showToast(`${memberData.name}'s profile updated! ✨`);
    } else {
      const updated = saveSquadMember(memberData);
      setMembers(updated);
      showToast(`Added ${memberData.name} to the gang! 🎉`);
    }
    setEditingMember(null);
  };

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
      await saveMemory(mem);
    }
    const updated = getStoredMemories();
    setMemories(updated);
    showToast(`✨ ${uploadedMemories.length} ${uploadedMemories.length === 1 ? 'photo' : 'photos'} added to your Squad Album!`);
  };

  // Community Post Handlers
  const handleSavePost = async (postData, user) => {
    const updated = await savePost(postData, user);
    setPosts(updated);
    showToast("Shared to squad community! 📣");
  };

  const handleLikePost = (postId) => {
    const updated = likePost(postId);
    setPosts(updated);
  };

  // Event Handlers
  const handleSaveEvent = (eventData) => {
    const updated = saveEvent(eventData);
    setEvents(updated);
    showToast(`Event "${eventData.title}" scheduled! 🗓️`);
  };

  const handleToggleRsvp = (eventId) => {
    const updated = toggleEventRsvp(eventId);
    setEvents(updated);
  };

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
          currentUser={currentUser}
          onSelectMember={(member) => setSelectedFriend(member)}
          onFilterByMember={handleFilterMemories}
          onOpenAddMember={() => {
            setEditingMember(null);
            setIsAddMemberOpen(true);
          }}
          onEditMember={(member) => {
            setEditingMember(member);
            setIsAddMemberOpen(true);
          }}
        />

        {/* 5. Chronological Memory Timeline with Scrollable Filter */}
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

        {/* 6. Cinematic Memory Reel */}
        <MemoryReel 
          memories={memories}
        />

        {/* 7. Group Community Hub (Posts & Events) */}
        <CommunitySection 
          posts={posts}
          onLikePost={handleLikePost}
          onOpenCreatePost={() => setIsCreatePostOpen(true)}
          events={events}
          onToggleRsvp={handleToggleRsvp}
          onOpenAddEvent={() => setIsAddEventOpen(true)}
          onSelectMember={(member) => setSelectedFriend(member)}
          members={members}
          currentUser={currentUser}
        />

        {/* 8. Live Group Chat & AI Story Enclave */}
        <GroupChat onOpenSignIn={() => setIsSignInOpen(true)} />

        {/* 9. Footer */}
        <Footer 
          onScrollTop={() => scrollToSection('hero')} 
          onOpenSignIn={() => setIsSignInOpen(true)}
          currentUser={currentUser}
        />
      </main>

      {/* ── MODALS ── */}
      <CreatePostModal 
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSave={handleSavePost}
        currentUser={currentUser}
      />

      <AddEventModal 
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        onSave={handleSaveEvent}
      />

      <AddMemberModal 
        isOpen={isAddMemberOpen}
        onClose={() => {
          setIsAddMemberOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        existingMember={editingMember}
      />

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

      {/* Non-intrusive Toast Notification */}
      {toastMessage && (
        <div className="toast-notification" role="status">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
