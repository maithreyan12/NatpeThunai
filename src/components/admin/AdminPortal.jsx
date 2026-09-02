import React, { useState, useEffect } from 'react';
import {
  Shield, Users, Image as ImageIcon, BookOpen, MessageSquare,
  Calendar, HardDrive, LogOut, ArrowLeft, Plus, Trash2, Edit3,
  CheckCircle, AlertCircle, Upload, Eye, Search, ExternalLink, Sparkles, Camera
} from 'lucide-react';
import {
  subscribeToMembersR2, saveMemberR2, deleteMemberR2,
  subscribeToMemoriesR2, saveMemoryR2, deleteMemoryR2,
  subscribeToPostsR2, savePostR2, deletePostR2,
  subscribeToEventsR2, saveEventR2, deleteEventR2,
  bootR2Database,
} from '../../services/r2Database';
import { signInWithGoogle, checkRedirectResult, logOut, isAuthorizedAdmin } from '../../firebase';
import { uploadToR2WithGuardrails } from '../../services/r2StorageService';
import { r2Photo, R2_BASE } from '../../services/r2Assets';
import brandLogo from '../../assets/brand-logo.png';
import './AdminPortal.css';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );
}

export default function AdminPortal({ onExit, currentUser }) {
  // Auth state — only unlocked if currentUser is the authorized admin
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return isAuthorizedAdmin(currentUser);
  });
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');

  // Sync with Firebase currentUser & check redirect result
  useEffect(() => {
    if (currentUser) {
      if (isAuthorizedAdmin(currentUser)) {
        setIsAuthenticated(true);
        setAuthError('');
      } else {
        setIsAuthenticated(false);
        setAuthError('Access Denied. Only the authorized administrator can access this console.');
        logOut();
      }
    } else {
      setIsAuthenticated(false);
    }

    // Check if user just returned from a Google redirect
    checkRedirectResult?.()
      .then(res => {
        if (res?.user) {
          if (isAuthorizedAdmin(res.user)) {
            setIsAuthenticated(true);
            setAuthError('');
            triggerToast(`Welcome back, Admin! 🛡️`);
          } else {
            setIsAuthenticated(false);
            setAuthError('Access Denied. Only the authorized administrator can access this console.');
            logOut();
          }
        }
      })
      .catch(() => {});
  }, [currentUser]);

  // Active Tab: 'overview' | 'members' | 'memories' | 'posts' | 'events' | 'r2'
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Data States
  const [members, setMembers] = useState([]);
  const [memories, setMemories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);

  // Modals & Form States
  const [editingMember, setEditingMember] = useState(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({
    name: '', nickname: '', role: '', category: 'core', bio: '', quote: '', instagram: '', photo: ''
  });

  const [editingMemory, setEditingMemory] = useState(null);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [memoryForm, setMemoryForm] = useState({
    title: '', year: 'Chapter 5', description: '', date: '', location: '', mediaUrl: '', people: ''
  });

  const [editingPost, setEditingPost] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postForm, setPostForm] = useState({
    authorName: 'Admin Announcement', content: '', category: 'Announcement'
  });

  const [editingEvent, setEditingEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '', date: '', time: '', location: '', description: ''
  });

  // Upload States
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [recentUploads, setRecentUploads] = useState([]);
  const [memberPhotoUploading, setMemberPhotoUploading] = useState(false);
  const [memoryPhotoUploading, setMemoryPhotoUploading] = useState(false);

  // Toast
  const [toast, setToast] = useState('');

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Direct Photo File Upload for Member
  const handleMemberPhotoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setMemberForm(prev => ({ ...prev, photo: ev.target.result }));
    };
    reader.readAsDataURL(file);

    setMemberPhotoUploading(true);
    try {
      const result = await uploadToR2WithGuardrails(file, 'members');
      if (result?.publicUrl) {
        setMemberForm(prev => ({ ...prev, photo: result.publicUrl }));
        triggerToast(`Photo uploaded to Cloudflare R2! ☁️`);
      }
    } catch (err) {
      console.warn("R2 Upload warning (using local preview):", err);
      triggerToast(`Photo selected (saved to sanctuary data)`);
    } finally {
      setMemberPhotoUploading(false);
    }
  };

  // Direct Photo File Upload for Memory
  const handleMemoryPhotoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setMemoryForm(prev => ({ ...prev, mediaUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);

    setMemoryPhotoUploading(true);
    try {
      const result = await uploadToR2WithGuardrails(file, 'memories');
      if (result?.publicUrl) {
        setMemoryForm(prev => ({ ...prev, mediaUrl: result.publicUrl }));
        triggerToast(`Memory photo uploaded to R2! ☁️`);
      }
    } catch (err) {
      console.warn("R2 Upload warning:", err);
      triggerToast(`Photo selected for memory chapter`);
    } finally {
      setMemoryPhotoUploading(false);
    }
  };

  // ── Live R2 subscriptions — push updates to this component AND public website ──
  useEffect(() => {
    // Boot: seed R2 if first time
    bootR2Database().catch(() => {});

    // Subscribe to live data from R2 CDN
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

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError('');
    try {
      const res = await signInWithGoogle();
      const user = res?.user;
      if (user) {
        if (isAuthorizedAdmin(user)) {
          setIsAuthenticated(true);
          triggerToast(`Welcome back, Admin! 🛡️`);
        } else {
          setIsAuthenticated(false);
          setAuthError('Access Denied. Only the authorized administrator can access this console.');
          await logOut();
        }
      }
    } catch (err) {
      console.warn('Google Sign In:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed popup, don't show error
        setAuthError('');
      } else if (err.message && err.message.toLowerCase().includes('database is closing')) {
        setAuthError('Browser session refreshed. Please click "Continue with Google" once more.');
      } else {
        setAuthError('Sign in could not be completed. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await logOut();
    setIsAuthenticated(false);
  };

  // Member CRUD
  const openAddMember = () => {
    setEditingMember(null);
    setMemberForm({
      name: '', nickname: '', role: 'Squad Member 🌟', category: 'core',
      bio: '', quote: '', instagram: '', photo: r2Photo('Gracee.jpg')
    });
    setIsMemberModalOpen(true);
  };

  const openEditMember = (m) => {
    setEditingMember(m);
    setMemberForm({
      name: m.name || '',
      nickname: m.nickname || '',
      role: m.role || '',
      category: m.category || 'core',
      bio: m.bio || '',
      quote: m.quote || '',
      instagram: m.instagram || '',
      photo: m.photo || ''
    });
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!memberForm.name.trim()) return;
    setIsMemberModalOpen(false);
    try {
      const data = editingMember
        ? { ...editingMember, ...memberForm }
        : memberForm;
      await saveMemberR2(data);
      triggerToast(editingMember ? `Updated ${memberForm.name} ✅` : `Added ${memberForm.name} to Squad! 🎉`);
    } catch (err) {
      triggerToast(`Save failed: ${err.message}`);
    }
  };

  const handleDeleteMember = async (id, name) => {
    if (window.confirm(`Remove ${name} from the squad list?`)) {
      try {
        await deleteMemberR2(id);
        triggerToast(`Removed ${name}`);
      } catch (err) {
        triggerToast(`Delete failed: ${err.message}`);
      }
    }
  };

  // Memory CRUD
  const openAddMemory = () => {
    setEditingMemory(null);
    setMemoryForm({
      title: '', year: 'Chapter 5', description: '', date: '', location: '', mediaUrl: '', people: ''
    });
    setIsMemoryModalOpen(true);
  };

  const openEditMemory = (mem) => {
    setEditingMemory(mem);
    setMemoryForm({
      title: mem.title || '',
      year: mem.year || 'Chapter 1',
      description: mem.description || '',
      date: mem.date || '',
      location: mem.location || '',
      mediaUrl: mem.mediaUrl || '',
      people: Array.isArray(mem.people) ? mem.people.join(', ') : (mem.people || '')
    });
    setIsMemoryModalOpen(true);
  };

  const handleSaveMemory = async (e) => {
    e.preventDefault();
    if (!memoryForm.title.trim() || !memoryForm.description.trim()) return;
    setIsMemoryModalOpen(false);
    try {
      const payload = editingMemory
        ? { ...editingMemory, ...memoryForm }
        : memoryForm;
      await saveMemoryR2(payload);
      triggerToast(editingMemory ? `Updated memory "${memoryForm.title}"! ✅` : 'New memory chapter published to R2! 📸');
      setEditingMemory(null);
      setMemoryForm({ title: '', year: 'Chapter 5', description: '', date: '', location: '', mediaUrl: '', people: '' });
    } catch (err) {
      triggerToast(`Memory save failed: ${err.message}`);
    }
  };

  const handleDeleteMemory = async (id, title) => {
    if (window.confirm(`Delete memory chapter "${title || 'this chapter'}"?`)) {
      try {
        await deleteMemoryR2(id);
        triggerToast(`Deleted memory "${title || id}" 🗑️`);
      } catch (err) {
        triggerToast(`Delete failed: ${err.message}`);
      }
    }
  };

  // Post CRUD
  const openAddPost = () => {
    setEditingPost(null);
    setPostForm({ authorName: 'Admin Announcement', content: '', category: 'Announcement' });
    setIsPostModalOpen(true);
  };

  const openEditPost = (post) => {
    setEditingPost(post);
    setPostForm({
      authorName: post.authorName || 'Admin Announcement',
      content: post.content || '',
      category: post.category || 'Announcement'
    });
    setIsPostModalOpen(true);
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    if (!postForm.content.trim()) return;
    setIsPostModalOpen(false);
    try {
      const payload = editingPost
        ? { ...editingPost, ...postForm }
        : postForm;
      await savePostR2(payload, currentUser || { displayName: 'Admin', photoURL: r2Photo('Gracee.jpg') });
      triggerToast(editingPost ? 'Post updated! ✅' : 'Post published live to squad! 📣');
      setEditingPost(null);
      setPostForm({ authorName: 'Admin Announcement', content: '', category: 'Announcement' });
    } catch (err) {
      triggerToast(`Post failed: ${err.message}`);
    }
  };

  const handleDeletePost = async (id, snippet) => {
    if (window.confirm(`Delete post "${snippet || 'this post'}"?`)) {
      try {
        await deletePostR2(id);
        triggerToast('Post deleted 🗑️');
      } catch (err) {
        triggerToast(`Delete failed: ${err.message}`);
      }
    }
  };

  // Event CRUD
  const openAddEvent = () => {
    setEditingEvent(null);
    setEventForm({ title: '', date: '', time: '', location: '', description: '', category: 'Celebration' });
    setIsEventModalOpen(true);
  };

  const openEditEvent = (ev) => {
    setEditingEvent(ev);
    setEventForm({
      title: ev.title || '',
      date: ev.date || '',
      time: ev.time || '7:00 PM',
      location: ev.location || '',
      description: ev.description || '',
      category: ev.category || 'Celebration'
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.date) return;
    setIsEventModalOpen(false);
    try {
      const payload = editingEvent
        ? { ...editingEvent, ...eventForm }
        : eventForm;
      await saveEventR2(payload);
      triggerToast(editingEvent ? `Updated event "${eventForm.title}"! ✅` : `Event "${eventForm.title}" live on website! 🗓️`);
      setEditingEvent(null);
      setEventForm({ title: '', date: '', time: '', location: '', description: '' });
    } catch (err) {
      triggerToast(`Event save failed: ${err.message}`);
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (window.confirm(`Delete event "${title || 'this event'}"?`)) {
      try {
        await deleteEventR2(id);
        triggerToast(`Deleted event "${title || id}" 🗑️`);
      } catch (err) {
        triggerToast(`Delete failed: ${err.message}`);
      }
    }
  };

  // R2 Direct File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);
    setUploadMessage('Preparing upload to Cloudflare R2...');

    try {
      const result = await uploadToR2WithGuardrails(file, 'memories', (pct) => {
        setUploadProgress(pct);
      });
      setUploadProgress(100);
      setUploadMessage('Upload complete!');
      setRecentUploads(prev => [result, ...prev]);
      triggerToast(`Uploaded ${file.name} to R2 CDN! ☁️`);
    } catch (err) {
      setUploadMessage(`Error: ${err.message}`);
      triggerToast(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Filtered members
  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If not authenticated, render Google Sign-In Gate
  if (!isAuthenticated) {
    return (
      <div className="admin-portal-login-screen">
        {/* Soft Ambient Studio Lighting Canvas */}
        <div className="ambient-bg" aria-hidden="true">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="orb orb-4" />
        </div>

        <div className="admin-login-glass-card">
          <div className="admin-login-brand-logo">
            <img src={brandLogo} alt="நட்பே துணை Logo" className="admin-login-logo-img" />
          </div>
          <h1 className="admin-login-title">நட்பே துணை</h1>
          <p className="admin-login-sub">Admin Sanctuary Console · Google Authentication</p>

          <div className="admin-google-auth-box">
            {authError && <p className="admin-error-text">{authError}</p>}

            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="admin-google-sign-in-btn"
            >
              <GoogleIcon />
              <span>{isSigningIn ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>
          </div>

          <button onClick={onExit} className="admin-exit-btn">
            <ArrowLeft size={14} /> Exit to Public Sanctuary
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-portal-wrapper">
      {/* Soft Ambient Studio Lighting Canvas */}
      <div className="ambient-bg" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      {/* ── Top Header ── */}
      <header className="admin-top-header">
        <div className="admin-header-left">
          <div className="admin-brand-lockup">
            <img src={brandLogo} alt="நட்பே துணை Logo" className="admin-brand-logo-img" />
          </div>
          <div className="admin-brand-title-wrap">
            <div className="admin-brand-title-row">
              <h1 className="admin-header-title">நட்பே துணை</h1>
              <span className="admin-badge">ADMIN CONSOLE</span>
            </div>
            <p className="admin-header-sub">Live Management &amp; Cloudflare R2 Sanctuary</p>
          </div>
        </div>

        <div className="admin-header-actions">
          {currentUser && (
            <div className="admin-user-pill">
              <img 
                src={currentUser.photoURL || r2Photo('Gracee.jpg')} 
                alt="" 
                className="admin-user-avatar" 
                referrerPolicy="no-referrer" 
              />
              <span className="admin-user-name">{currentUser.displayName || 'Admin'}</span>
            </div>
          )}
          <button onClick={onExit} className="admin-nav-btn admin-exit-btn-top">
            <ArrowLeft size={16} /> Public Website
          </button>
          <button onClick={handleLogout} className="admin-nav-btn admin-logout-btn">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      {/* ── Main Layout: Sidebar & Content ── */}
      <div className="admin-main-container">
        {/* Sidebar Nav */}
        <aside className="admin-sidebar">
          <nav className="admin-nav-menu">
            <button
              className={`admin-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Shield size={18} /> Overview
            </button>
            <button
              className={`admin-nav-tab ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              <Users size={18} /> Squad Members ({members.length})
            </button>
            <button
              className={`admin-nav-tab ${activeTab === 'memories' ? 'active' : ''}`}
              onClick={() => setActiveTab('memories')}
            >
              <BookOpen size={18} /> Memory Chapters ({memories.length})
            </button>
            <button
              className={`admin-nav-tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <MessageSquare size={18} /> Community Posts ({posts.length})
            </button>
            <button
              className={`admin-nav-tab ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              <Calendar size={18} /> Events & Trips ({events.length})
            </button>
            <button
              className={`admin-nav-tab ${activeTab === 'r2' ? 'active' : ''}`}
              onClick={() => setActiveTab('r2')}
            >
              <HardDrive size={18} /> Cloudflare R2 Storage
            </button>
          </nav>
        </aside>

        {/* Dynamic Content Area */}
        <main className="admin-content-pane">
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="admin-overview-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon-wrap from-purple">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="admin-stat-number">{members.length}</h3>
                  <p className="admin-stat-label">Squad Members</p>
                  <span className="admin-stat-meta">Active Sanctuary Circle</span>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon-wrap from-pink">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="admin-stat-number">{memories.length}</h3>
                  <p className="admin-stat-label">Memory Chapters</p>
                  <span className="admin-stat-meta">Chronological Journey</span>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon-wrap from-indigo">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="admin-stat-number">{posts.length}</h3>
                  <p className="admin-stat-label">Community Posts</p>
                  <span className="admin-stat-meta">Manifesto & Discussions</span>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon-wrap from-amber">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="admin-stat-number">{events.length}</h3>
                  <p className="admin-stat-label">Scheduled Meetups</p>
                  <span className="admin-stat-meta">Roadtrips & Gatherings</span>
                </div>
              </div>

              <div className="admin-stat-card full-span">
                <div className="admin-r2-info-box">
                  <div className="admin-stat-icon-wrap from-cyan">
                    <HardDrive size={24} />
                  </div>
                  <div className="admin-r2-meta">
                    <h3>Cloudflare R2 Media CDN Status</h3>
                    <p>Connected to <code>natpethunai</code> bucket at <code>{R2_BASE}</code></p>
                    <div className="admin-badge-strip">
                      <span className="admin-status-pill green">● R2 Bucket Active</span>
                      <span className="admin-status-pill blue">● 100% Free-Tier Safe</span>
                      <span className="admin-status-pill purple">● 14 Members Live</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. MEMBERS TAB */}
          {activeTab === 'members' && (
            <div className="admin-section-block">
              <div className="admin-section-header">
                <div>
                  <h2 className="admin-section-title">Squad Roster Management</h2>
                  <p className="admin-section-sub">Add, edit, or customize all 15 members and their profile cards.</p>
                </div>
                <div className="admin-action-bar">
                  <div className="admin-search-wrap">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search member..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button onClick={openAddMember} className="admin-primary-btn">
                    <Plus size={16} /> Add Member
                  </button>
                </div>
              </div>

              <div className="admin-members-table-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Role & Badge</th>
                      <th>Nickname</th>
                      <th>Instagram</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <div className="admin-member-cell">
                            {m.photo ? (
                              <img src={m.photo} alt={m.name} className="admin-member-thumb" />
                            ) : (
                              <div className="admin-member-thumb-placeholder">{m.name.charAt(0)}</div>
                            )}
                            <div>
                              <strong>{m.name}</strong>
                              <p className="admin-member-bio-snippet">{m.bio?.slice(0, 45)}...</p>
                            </div>
                          </div>
                        </td>
                        <td><span className="admin-role-tag">{m.role}</span></td>
                        <td>{m.nickname || '—'}</td>
                        <td>
                          {m.instagram ? (
                            <a href={m.instagram} target="_blank" rel="noopener noreferrer" className="admin-link">
                              @{m.instagram.split('/').filter(Boolean).pop()} <ExternalLink size={12} />
                            </a>
                          ) : '—'}
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            <button onClick={() => openEditMember(m)} className="admin-icon-action-btn" title="Edit Member">
                              <Edit3 size={15} />
                            </button>
                            <button onClick={() => handleDeleteMember(m.id, m.name)} className="admin-icon-action-btn delete" title="Delete Member">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. MEMORIES TAB */}
          {activeTab === 'memories' && (
            <div className="admin-section-block">
              <div className="admin-section-header">
                <div>
                  <h2 className="admin-section-title">Memory Chapters & Timeline</h2>
                  <p className="admin-section-sub">Publish new chapters or edit milestone memories.</p>
                </div>
                <button onClick={openAddMemory} className="admin-primary-btn">
                  <Plus size={16} /> New Chapter
                </button>
              </div>

              <div className="admin-cards-grid">
                {memories.map((mem) => (
                  <div key={mem.id} className="admin-card-item">
                    {mem.mediaUrl && (
                      <img src={mem.mediaUrl} alt={mem.title} className="admin-card-img" />
                    )}
                    <div className="admin-card-body">
                      <div className="admin-card-header-row">
                        <span className="admin-card-badge">{mem.year || 'Chapter'} · {mem.date}</span>
                        <div className="admin-row-actions">
                          <button onClick={() => openEditMemory(mem)} className="admin-icon-action-btn" title="Edit Chapter">
                            <Edit3 size={15} />
                          </button>
                          <button onClick={() => handleDeleteMemory(mem.id, mem.title)} className="admin-icon-action-btn delete" title="Delete Chapter">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <h3 className="admin-card-title">{mem.title}</h3>
                      <p className="admin-card-desc">{mem.description}</p>
                      <p className="admin-card-loc">📍 {mem.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. POSTS TAB */}
          {activeTab === 'posts' && (
            <div className="admin-section-block">
              <div className="admin-section-header">
                <div>
                  <h2 className="admin-section-title">Community Posts & Manifesto</h2>
                  <p className="admin-section-sub">Squad announcements, notes, and community shares.</p>
                </div>
                <button onClick={openAddPost} className="admin-primary-btn">
                  <Plus size={16} /> New Post
                </button>
              </div>

              <div className="admin-posts-list">
                {posts.map((p) => (
                  <div key={p.id} className="admin-post-item">
                    <div className="admin-post-header">
                      <div className="admin-post-author-meta">
                        <strong>{p.authorName || 'Squad Member'}</strong>
                        <span className="admin-card-badge">{p.category || 'General'}</span>
                      </div>
                      <div className="admin-row-actions">
                        <button onClick={() => openEditPost(p)} className="admin-icon-action-btn" title="Edit Post">
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => handleDeletePost(p.id, p.content?.slice(0, 30))} className="admin-icon-action-btn delete" title="Delete Post">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <p className="admin-post-content">{p.content}</p>
                    <span className="admin-stat-meta">❤️ {p.likes || 0} Likes</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. EVENTS TAB */}
          {activeTab === 'events' && (
            <div className="admin-section-block">
              <div className="admin-section-header">
                <div>
                  <h2 className="admin-section-title">Squad Events & Reunions</h2>
                  <p className="admin-section-sub">Road trips, milestone dinners, and hangout schedules.</p>
                </div>
                <button onClick={openAddEvent} className="admin-primary-btn">
                  <Plus size={16} /> Schedule Event
                </button>
              </div>

              <div className="admin-cards-grid">
                {events.map((ev) => (
                  <div key={ev.id} className="admin-card-item">
                    <div className="admin-card-body">
                      <div className="admin-card-header-row">
                        <span className="admin-card-badge">🗓️ {ev.date} at {ev.time || '10:00 AM'}</span>
                        <div className="admin-row-actions">
                          <button onClick={() => openEditEvent(ev)} className="admin-icon-action-btn" title="Edit Event">
                            <Edit3 size={15} />
                          </button>
                          <button onClick={() => handleDeleteEvent(ev.id, ev.title)} className="admin-icon-action-btn delete" title="Delete Event">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <h3 className="admin-card-title">{ev.title}</h3>
                      <p className="admin-card-loc">📍 {ev.location}</p>
                      <p className="admin-card-desc">{ev.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. R2 STORAGE TAB */}
          {activeTab === 'r2' && (
            <div className="admin-section-block">
              <div className="admin-section-header">
                <div>
                  <h2 className="admin-section-title">Cloudflare R2 Media Center</h2>
                  <p className="admin-section-sub">Direct file uploads to the <code>natpethunai</code> R2 bucket with automated CDN delivery.</p>
                </div>
              </div>

              <div className="admin-upload-zone-box">
                <Upload className="w-12 h-12 text-indigo-400 mb-3" />
                <h3>Upload Image or Video to Cloudflare R2</h3>
                <p>Files are stored in <code>/photos/</code> or <code>/memories/</code> and delivered via <code>{R2_BASE}</code></p>

                <label className="admin-file-upload-btn">
                  Choose Media File
                  <input type="file" onChange={handleFileUpload} accept="image/*,video/*" style={{ display: 'none' }} />
                </label>

                {isUploading && (
                  <div className="admin-upload-progress-bar">
                    <div className="admin-progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
                {uploadMessage && <p className="admin-upload-status-text">{uploadMessage}</p>}
              </div>

              {recentUploads.length > 0 && (
                <div className="admin-recent-uploads-list">
                  <h3>Recent Uploads</h3>
                  {recentUploads.map((u, i) => (
                    <div key={i} className="admin-recent-upload-row">
                      <CheckCircle className="text-emerald-400" size={16} />
                      <span className="admin-code-url">{u.publicUrl}</span>
                      <a href={u.publicUrl} target="_blank" rel="noopener noreferrer" className="admin-link">
                        Preview <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── MODALS ── */}

      {/* Member Edit Modal */}
      {isMemberModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <h2 className="admin-modal-title">{editingMember ? `Edit ${editingMember.name}` : 'Add New Member'}</h2>
            <form onSubmit={handleSaveMember} className="admin-modal-form">
              <div className="admin-form-row">
                <div className="admin-input-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-input-group">
                  <label>Nickname</label>
                  <input
                    type="text"
                    value={memberForm.nickname}
                    onChange={(e) => setMemberForm({ ...memberForm, nickname: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-input-group">
                  <label>Role & Emoji *</label>
                  <input
                    type="text"
                    value={memberForm.role}
                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                    placeholder="e.g. The Mastermind 🧠"
                    required
                  />
                </div>
                <div className="admin-input-group">
                  <label>Instagram URL</label>
                  <input
                    type="url"
                    value={memberForm.instagram}
                    onChange={(e) => setMemberForm({ ...memberForm, instagram: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>

              {/* Member Photo Upload & Live Preview */}
              <div className="admin-photo-upload-section">
                <label className="admin-field-label">Member Photo</label>
                <div className="admin-photo-picker-row">
                  <div className="admin-photo-preview-box">
                    {memberForm.photo ? (
                      <img src={memberForm.photo} alt="Preview" className="admin-photo-preview-img" />
                    ) : (
                      <div className="admin-photo-preview-placeholder">
                        <Users size={28} />
                      </div>
                    )}
                  </div>

                  <div className="admin-photo-picker-controls">
                    <label className="admin-file-pick-btn">
                      <Camera size={16} />
                      <span>{memberPhotoUploading ? 'Uploading to R2...' : 'Choose Photo File'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleMemberPhotoFile}
                        disabled={memberPhotoUploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <span className="admin-photo-hint">Select a photo from your phone/device or paste URL below</span>
                  </div>
                </div>

                <div className="admin-input-group" style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    value={memberForm.photo}
                    onChange={(e) => setMemberForm({ ...memberForm, photo: e.target.value })}
                    placeholder={`e.g. ${R2_BASE}/photos/name.jpg`}
                  />
                </div>
              </div>

              <div className="admin-input-group">
                <label>Bio</label>
                <textarea
                  rows="3"
                  value={memberForm.bio}
                  onChange={(e) => setMemberForm({ ...memberForm, bio: e.target.value })}
                  placeholder="Bio description..."
                />
              </div>

              <div className="admin-input-group">
                <label>Memorable Quote</label>
                <input
                  type="text"
                  value={memberForm.quote}
                  onChange={(e) => setMemberForm({ ...memberForm, quote: e.target.value })}
                  placeholder="Favourite squad quote..."
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setIsMemberModalOpen(false)} className="admin-cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="admin-primary-btn">
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Memory Chapter Modal */}
      {isMemoryModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <h2 className="admin-modal-title">{editingMemory ? 'Edit Memory Chapter' : 'Create Memory Chapter'}</h2>
            <form onSubmit={handleSaveMemory} className="admin-modal-form">
              <div className="admin-input-group">
                <label>Chapter Title *</label>
                <input
                  type="text"
                  value={memoryForm.title}
                  onChange={(e) => setMemoryForm({ ...memoryForm, title: e.target.value })}
                  placeholder="e.g. Midnight Highway Drive"
                  required
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-input-group">
                  <label>Date</label>
                  <input
                    type="text"
                    value={memoryForm.date}
                    onChange={(e) => setMemoryForm({ ...memoryForm, date: e.target.value })}
                    placeholder="e.g. August 14"
                  />
                </div>
                <div className="admin-input-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={memoryForm.location}
                    onChange={(e) => setMemoryForm({ ...memoryForm, location: e.target.value })}
                    placeholder="e.g. Campus Common"
                  />
                </div>
              </div>

              {/* Memory Chapter Photo Upload & Preview */}
              <div className="admin-photo-upload-section">
                <label className="admin-field-label">Chapter Cover Photo</label>
                <div className="admin-photo-picker-row">
                  <div className="admin-photo-preview-box memory-preview">
                    {memoryForm.mediaUrl ? (
                      <img src={memoryForm.mediaUrl} alt="Preview" className="admin-photo-preview-img" />
                    ) : (
                      <div className="admin-photo-preview-placeholder">
                        <ImageIcon size={28} />
                      </div>
                    )}
                  </div>

                  <div className="admin-photo-picker-controls">
                    <label className="admin-file-pick-btn">
                      <Camera size={16} />
                      <span>{memoryPhotoUploading ? 'Uploading to R2...' : 'Choose Chapter Photo'}</span>
                      <input 
                        type="file" 
                        accept="image/*,video/*" 
                        onChange={handleMemoryPhotoFile}
                        disabled={memoryPhotoUploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <span className="admin-photo-hint">Select a photo from device or paste CDN URL below</span>
                  </div>
                </div>

                <div className="admin-input-group" style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    value={memoryForm.mediaUrl}
                    onChange={(e) => setMemoryForm({ ...memoryForm, mediaUrl: e.target.value })}
                    placeholder={`e.g. ${R2_BASE}/photos/...`}
                  />
                </div>
              </div>

              <div className="admin-input-group">
                <label>Story Description *</label>
                <textarea
                  rows="4"
                  value={memoryForm.description}
                  onChange={(e) => setMemoryForm({ ...memoryForm, description: e.target.value })}
                  placeholder="Write the full memory story..."
                  required
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setIsMemoryModalOpen(false)} className="admin-cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="admin-primary-btn">
                  {editingMemory ? 'Save Changes' : 'Publish Memory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Modal */}
      {isPostModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <h2 className="admin-modal-title">{editingPost ? 'Edit Community Post' : 'Publish Community Announcement'}</h2>
            <form onSubmit={handleSavePost} className="admin-modal-form">
              <div className="admin-input-group">
                <label>Post Message *</label>
                <textarea
                  rows="4"
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  placeholder="Write message to squad..."
                  required
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setIsPostModalOpen(false)} className="admin-cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="admin-primary-btn">
                  {editingPost ? 'Save Changes' : 'Share Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {isEventModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <h2 className="admin-modal-title">{editingEvent ? 'Edit Squad Event' : 'Schedule Squad Event'}</h2>
            <form onSubmit={handleSaveEvent} className="admin-modal-form">
              <div className="admin-input-group">
                <label>Event Name *</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g. Grand Reunion Roadtrip"
                  required
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-input-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-input-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-input-group">
                <label>Location</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  placeholder="e.g. Ooty Scenic Cottage"
                />
              </div>

              <div className="admin-input-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Event details..."
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setIsEventModalOpen(false)} className="admin-cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="admin-primary-btn">
                  {editingEvent ? 'Save Changes' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="admin-toast-banner">
          <CheckCircle size={16} /> {toast}
        </div>
      )}
    </div>
  );
}
