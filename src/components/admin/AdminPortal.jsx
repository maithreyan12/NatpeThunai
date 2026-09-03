import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Users, Image as ImageIcon, BookOpen, MessageSquare,
  Calendar, HardDrive, LogOut, ArrowLeft, Plus, Trash2, Edit3,
  CheckCircle, AlertCircle, Upload, Eye, Search, ExternalLink, Sparkles, Camera,
  FolderPlus, FolderUp, Layers, Check, X, RefreshCw, Loader2, Film, Compass
} from 'lucide-react';

import {
  subscribeToMembersR2, saveMemberR2, deleteMemberR2,
  subscribeToMemoriesR2, saveMemoryR2, deleteMemoryR2,
  subscribeToPostsR2, savePostR2, deletePostR2,
  subscribeToEventsR2, saveEventR2, deleteEventR2,
  subscribeToJourneyR2, saveJourneyMilestoneR2,
  subscribeToSpiralR2, saveSpiralItemR2, deleteSpiralItemR2,
  subscribeToReelsR2, saveReelR2, deleteReelR2, INITIAL_REELS, isVideoMedia,
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

  // ── Reels (Cinematic Archive) States ──
  const [reelItems, setReelItems] = useState(INITIAL_REELS);
  const [editingReel, setEditingReel] = useState(null);
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);

  const [reelPhotoUploading, setReelPhotoUploading] = useState(false);
  const [reelForm, setReelForm] = useState({
    title: '',
    category: 'Adventures',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    location: 'Squad Sanctuary',
    description: '',
    mediaUrl: '',
    mediaType: 'image'
  });

  // ── Friendship Journey States ──

  const [journeyMilestones, setJourneyMilestones] = useState([]);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [milestonePhotoUploading, setMilestonePhotoUploading] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    id: '', stepLabel: '', title: '', tagline: '', badge: '', quote: '', description: '', photo: ''
  });

  // ── Infinite Spiral States ──
  const [spiralItems, setSpiralItems] = useState([]);
  const [editingSpiralItem, setEditingSpiralItem] = useState(null);
  const [isSpiralModalOpen, setIsSpiralModalOpen] = useState(false);
  const [spiralPhotoUploading, setSpiralPhotoUploading] = useState(false);
  const [spiralForm, setSpiralForm] = useState({
    id: '', src: '', alt: 'Squad Memory', title: ''
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

  // ── Batch / Folder Photo Upload States ──
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [bundleFiles, setBundleFiles] = useState([]);
  const [bundleSettings, setBundleSettings] = useState({
    autoCreateMemories: true,
    titlePrefix: 'Squad Memory',
    year: 'Chapter 5',
    location: 'Squad Sanctuary',
    category: 'Adventures',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  });
  const [isBundleUploading, setIsBundleUploading] = useState(false);
  const [bundleProgress, setBundleProgress] = useState(0);
  const [bundleCurrentIndex, setBundleCurrentIndex] = useState(0);

  const folderInputRef = useRef(null);
  const multiFileInputRef = useRef(null);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
    }
  }, [isBundleModalOpen]);

  const handleSelectFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const validFiles = Array.from(fileList).filter(f => {
      if (f.name.startsWith('.') || f.name.includes('DS_Store')) return false;
      return f.type.startsWith('image/') || f.type.startsWith('video/');
    });

    if (validFiles.length === 0) {
      triggerToast('No valid photos or videos found in selection.');
      return;
    }

    const newItems = validFiles.map((f, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      file: f,
      name: f.name,
      size: f.size,
      previewUrl: URL.createObjectURL(f),
      status: 'pending',
      error: null,
      publicUrl: null
    }));

    setBundleFiles(prev => [...prev, ...newItems]);
    triggerToast(`Added ${newItems.length} photos to batch queue! 📸`);
  };

  const handleRemoveBundleItem = (id) => {
    setBundleFiles(prev => {
      const item = prev.find(x => x.id === id);
      if (item?.previewUrl && item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter(x => x.id !== id);
    });
  };

  const handleClearBundle = () => {
    bundleFiles.forEach(f => {
      if (f.previewUrl && f.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(f.previewUrl);
      }
    });
    setBundleFiles([]);
    setBundleProgress(0);
    setBundleCurrentIndex(0);
  };

  const handleStartBundleUpload = async () => {
    if (bundleFiles.length === 0 || isBundleUploading) return;

    setIsBundleUploading(true);
    let successCount = 0;
    const total = bundleFiles.length;

    for (let i = 0; i < total; i++) {
      const item = bundleFiles[i];
      if (item.status === 'done') {
        successCount++;
        continue;
      }

      setBundleCurrentIndex(i + 1);
      setBundleFiles(prev => prev.map((x, idx) => idx === i ? { ...x, status: 'uploading' } : x));

      try {
        const uploadResult = await uploadToR2WithGuardrails(item.file, 'memories', (pct) => {
          const overall = Math.round(((i + (pct / 100)) / total) * 100);
          setBundleProgress(overall);
        });

        const publicUrl = uploadResult?.publicUrl;

        // If auto-create items is checked, add to the respective active section (reels or memories)
        if (bundleSettings.autoCreateMemories && publicUrl) {
          const cleanedName = item.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
          const title = bundleSettings.titlePrefix 
            ? `${bundleSettings.titlePrefix} - ${cleanedName}`
            : cleanedName;

          if (activeTab === 'reels') {
            await saveReelR2({
              title,
              category: bundleSettings.category || 'Adventures',
              date: bundleSettings.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              location: bundleSettings.location || 'Squad Sanctuary',
              mediaUrl: publicUrl,
              mediaType: item.file.type.startsWith('video/') ? 'video' : 'image',
              description: `Cinematic reel slide: ${item.name}`,
              isReel: true,
            });
          } else {
            await saveMemoryR2({
              title,
              year: bundleSettings.year || 'Chapter 5',
              date: bundleSettings.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              location: bundleSettings.location || 'Squad Sanctuary',
              mediaUrl: publicUrl,
              mediaType: item.file.type.startsWith('video/') ? 'video' : 'image',
              category: bundleSettings.category || 'Adventures',
              description: `Captured squad moment: ${item.name}`,
              isReel: false,
            });
          }
        }


        setBundleFiles(prev => prev.map((x, idx) => idx === i ? { ...x, status: 'done', publicUrl } : x));
        successCount++;
      } catch (err) {
        console.error('Bundle item upload failed:', err);
        setBundleFiles(prev => prev.map((x, idx) => idx === i ? { ...x, status: 'error', error: err.message } : x));
      }

      setBundleProgress(Math.round(((i + 1) / total) * 100));
    }

    setIsBundleUploading(false);
    triggerToast(`Batch complete: ${successCount} of ${total} photos uploaded to R2! 🎉`);
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

  // Direct Photo File Upload for Memory (PHOTOS ONLY)
  const handleMemoryPhotoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImageFile = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|heic|heif|avif|svg)$/i.test(file.name);
    if (!isImageFile) {
      triggerToast('Memory Chapters is strictly for photos! Please choose an image file (JPG/PNG/WebP/HEIC) 📸');
      return;
    }


    // Show instant preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setMemoryForm(prev => ({ ...prev, mediaUrl: ev.target.result, mediaType: 'image' }));
    };
    reader.readAsDataURL(file);

    setMemoryPhotoUploading(true);
    try {
      const result = await uploadToR2WithGuardrails(file, 'memories');
      if (result?.publicUrl) {
        setMemoryForm(prev => ({ ...prev, mediaUrl: result.publicUrl, mediaType: 'image' }));
        triggerToast(`Memory photo uploaded to R2! ☁️`);
      }
    } catch (err) {
      console.warn("R2 Upload warning:", err);
      triggerToast(`Photo selected for memory chapter`);
    } finally {
      setMemoryPhotoUploading(false);
    }
  };

  // Direct Video Upload for Reel Slide (VIDEOS ONLY)
  const handleReelPhotoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      triggerToast('Cinematic Reels is strictly for videos! Please choose an MP4, WebM, or MOV video 🎬');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setReelForm(prev => ({
        ...prev,
        mediaUrl: ev.target.result,
        mediaType: 'video'
      }));
    };
    reader.readAsDataURL(file);

    setReelPhotoUploading(true);
    try {
      const result = await uploadToR2WithGuardrails(file, 'reels');
      if (result?.publicUrl) {
        setReelForm(prev => ({
          ...prev,
          mediaUrl: result.publicUrl,
          mediaType: 'video'
        }));
        triggerToast(`Reel video uploaded to Cloudflare R2! ☁️🎬`);
      }
    } catch (err) {
      console.warn("R2 Upload warning:", err);
      triggerToast(`Video selected for reel`);
    } finally {
      setReelPhotoUploading(false);
    }
  };



  // ── Live R2 subscriptions — push updates to this component AND public website ──
  useEffect(() => {
    // Boot: seed R2 if first time
    bootR2Database().catch(() => {});

    // Subscribe to live data from R2 CDN
    const unsubMembers   = subscribeToMembersR2(setMembers);
    const unsubMemories  = subscribeToMemoriesR2(setMemories);
    const unsubReels     = subscribeToReelsR2(setReelItems);
    const unsubPosts     = subscribeToPostsR2(setPosts);
    const unsubEvents    = subscribeToEventsR2(setEvents);
    const unsubJourney   = subscribeToJourneyR2(setJourneyMilestones);
    const unsubSpiral    = subscribeToSpiralR2(setSpiralItems);

    return () => {
      unsubMembers();
      unsubMemories();
      unsubReels();
      unsubPosts();
      unsubEvents();
      unsubJourney();
      unsubSpiral();
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
          triggerToast(`Welcome back, ${user.displayName || 'Admin'}! 🛡️`);
        } else {
          setIsAuthenticated(false);
          setAuthError('Access Denied: This Google account is not authorized to access the Admin Sanctuary Console.');
          await logOut();
        }
      }
    } catch (err) {
      console.warn('Google Sign In:', err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User closed popup, don't show error
        setAuthError('');
      } else if (err.code === 'auth/unauthorized-account' || err.message?.includes('Access Denied')) {
        setAuthError('Access Denied: This Google account is not authorized to access the Admin Sanctuary Console.');
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError('Pop-up was blocked by your browser. Redirecting to Google...');
      } else if (err.message && err.message.toLowerCase().includes('database is closing')) {
        setAuthError('Session updated. Please click "Continue with Google" once more.');
      } else {
        setAuthError(err.message || 'Sign in could not be completed. Please try again.');
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
    if (window.confirm(`Remove ${name} from the squad list? (This will ONLY remove from Squad Members and will NOT delete photos from any other sections or the database)`)) {
      // ⚡ Instant optimistic deletion
      setMembers(prev => prev.filter(m => m.id !== id));
      triggerToast(`Removed ${name} 🗑️`);
      deleteMemberR2(id).catch(err => triggerToast(`Delete failed: ${err.message}`));
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
        : { id: `mem-${Date.now()}`, ...memoryForm };
      // ⚡ Instant optimistic update
      setMemories(prev => {
        const idx = prev.findIndex(m => m.id === payload.id);
        if (idx >= 0) {
          const arr = [...prev];
          arr[idx] = payload;
          return arr;
        }
        return [payload, ...prev];
      });
      await saveMemoryR2(payload);
      triggerToast(editingMemory ? `Updated memory "${memoryForm.title}"! ✅` : 'New memory chapter published to R2! 📸');
      setEditingMemory(null);
      setMemoryForm({ title: '', year: 'Chapter 5', description: '', date: '', location: '', mediaUrl: '', people: '' });
    } catch (err) {
      triggerToast(`Memory save failed: ${err.message}`);
    }
  };

  const handleDeleteMemory = async (id, title) => {
    if (window.confirm(`Delete memory chapter "${title || 'this chapter'}" from Memory Chapters? (This will ONLY remove it from Memory Chapters and will NOT delete files from any other sections or the database)`)) {
      // ⚡ Instant optimistic deletion
      setMemories(prev => prev.filter(m => m.id !== id));
      triggerToast(`Deleted memory "${title || id}" 🗑️`);
      deleteMemoryR2(id).catch(err => triggerToast(`Delete failed: ${err.message}`));
    }
  };

  // ── Reel (Cinematic Archive) CRUD — VIDEOS ONLY ──
  const openAddReel = () => {
    setEditingReel(null);
    setReelForm({
      title: '',
      category: 'Adventures',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      location: 'Squad Sanctuary',
      description: '',
      mediaUrl: '',
      mediaType: 'video'
    });
    setIsReelModalOpen(true);
  };

  const openEditReel = (reel) => {
    setEditingReel(reel);
    setReelForm({
      title: reel.title || '',
      category: reel.category || reel.year || 'Adventures',
      date: reel.date || '',
      location: reel.location || '',
      description: reel.description || '',
      mediaUrl: reel.mediaUrl || '',
      mediaType: 'video'
    });
    setIsReelModalOpen(true);
  };

  const handleSaveReel = async (e) => {
    e.preventDefault();
    if (!reelForm.mediaUrl) {
      triggerToast('Please upload a video or provide a video URL 🎬');
      return;
    }
    setIsReelModalOpen(false);
    try {
      const payload = editingReel
        ? { ...editingReel, ...reelForm, mediaType: 'video' }
        : {
            id: `reel_${Date.now()}`,
            ...reelForm,
            category: reelForm.category || 'Adventures',
            mediaType: 'video',
            isReel: true,
            timestamp: Date.now()
          };
      // ⚡ Instant optimistic update to REELS only (never touches memories!)
      setReelItems(prev => {
        const idx = prev.findIndex(m => m.id === payload.id);
        if (idx >= 0) {
          const arr = [...prev];
          arr[idx] = payload;
          return arr;
        }
        return [payload, ...prev];
      });
      await saveReelR2(payload);
      triggerToast(editingReel ? `Updated Reel video slide! 🎬` : `New Reel video published to Cinematic Archive! 🎬`);
      setEditingReel(null);
    } catch (err) {
      triggerToast(`Reel save failed: ${err.message}`);
    }
  };

  const handleDeleteReel = async (id, title) => {
    if (window.confirm(`Delete reel slide "${title || 'this slide'}" from Cinematic Reels? (This will ONLY remove it from Cinematic Reels and will NOT delete files from any other sections or the database)`)) {
      // ⚡ Instant optimistic deletion from REELS only (never touches memories!)
      setReelItems(prev => prev.filter(m => m.id !== id));
      triggerToast(`Reel video slide removed 🗑️`);
      deleteReelR2(id).catch(err => triggerToast(`Delete failed: ${err.message}`));
    }
  };



  // ── Friendship Journey Milestones CRUD ──
  const openEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
    setMilestoneForm({
      id: milestone.id || '',
      stepLabel: milestone.stepLabel || '',
      title: milestone.title || '',
      tagline: milestone.tagline || '',
      badge: milestone.badge || '',
      quote: milestone.quote || '',
      description: milestone.description || '',
      photo: milestone.photo || '',
      colorKey: milestone.colorKey || 'lavender',
      gangCount: milestone.gangCount || 'Squad Circle',
      attendees: milestone.attendees || []
    });
    setIsMilestoneModalOpen(true);
  };

  const handleMilestonePhotoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setMilestoneForm(prev => ({ ...prev, photo: ev.target.result }));
    };
    reader.readAsDataURL(file);

    setMilestonePhotoUploading(true);
    try {
      const result = await uploadToR2WithGuardrails(file, 'memories');
      if (result?.publicUrl) {
        setMilestoneForm(prev => ({ ...prev, photo: result.publicUrl }));
        triggerToast(`Milestone cover photo uploaded to R2! ☁️✨`);
      }
    } catch (err) {
      console.warn("Milestone R2 Upload warning:", err);
      triggerToast(`Photo selected for milestone`);
    } finally {
      setMilestonePhotoUploading(false);
    }
  };

  const handleSaveMilestone = async (e) => {
    e.preventDefault();
    if (!milestoneForm.title.trim()) {
      triggerToast('Please provide a milestone title');
      return;
    }
    setIsMilestoneModalOpen(false);
    // ⚡ Instant optimistic update
    setJourneyMilestones(prev => prev.map(m => (m.id === milestoneForm.id || m.stepLabel === milestoneForm.stepLabel) ? { ...m, ...milestoneForm } : m));
    triggerToast(`Updated "${milestoneForm.stepLabel}" milestone! 🚀`);
    try {
      await saveJourneyMilestoneR2(milestoneForm);
    } catch (err) {
      triggerToast(`Milestone save error: ${err.message}`);
    }
  };

  // ── Infinite Spiral CRUD ──
  const openAddSpiralItem = () => {
    setEditingSpiralItem(null);
    setSpiralForm({
      id: '',
      src: '',
      alt: 'Squad Memory',
      title: '',
      positionY: 50,
      objectPosition: 'center 50%',
      objectFit: 'cover',
      scale: 1
    });
    setIsSpiralModalOpen(true);
  };

  const openEditSpiralItem = (item) => {
    setEditingSpiralItem(item);
    let posY = 50;
    if (item.positionY !== undefined) {
      posY = Number(item.positionY);
    } else if (item.objectPosition) {
      if (item.objectPosition.includes('top')) posY = 15;
      else if (item.objectPosition.includes('bottom')) posY = 85;
      else {
        const match = item.objectPosition.match(/(\d+)%/);
        if (match) posY = parseInt(match[1], 10);
      }
    }

    setSpiralForm({
      id: item.id || '',
      src: item.src || '',
      alt: item.alt || '',
      title: item.title || item.alt || '',
      positionY: posY,
      objectPosition: item.objectPosition || `center ${posY}%`,
      objectFit: item.objectFit || 'cover',
      scale: item.scale !== undefined ? Number(item.scale) : 1
    });
    setIsSpiralModalOpen(true);
  };

  const handleSpiralPhotoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setSpiralForm(prev => ({ ...prev, src: ev.target.result }));
    };
    reader.readAsDataURL(file);

    setSpiralPhotoUploading(true);
    try {
      const result = await uploadToR2WithGuardrails(file, 'memories');
      if (result?.publicUrl) {
        setSpiralForm(prev => ({ ...prev, src: result.publicUrl }));
        triggerToast(`Spiral photo uploaded to Cloudflare R2! ☁️🌀`);
      }
    } catch (err) {
      console.warn("Spiral R2 Upload warning:", err);
      triggerToast(`Photo selected for spiral`);
    } finally {
      setSpiralPhotoUploading(false);
    }
  };

  const handleSaveSpiralItem = async (e) => {
    e.preventDefault();
    if (!spiralForm.src) {
      triggerToast('Please choose a photo or enter a photo URL');
      return;
    }
    setIsSpiralModalOpen(false);
    const payload = editingSpiralItem
      ? { ...editingSpiralItem, ...spiralForm }
      : { id: `spiral-${Date.now()}`, ...spiralForm };

    // ⚡ Instant optimistic update
    setSpiralItems(prev => {
      const idx = prev.findIndex(s => s.id === payload.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = payload;
        return copy;
      }
      return [...prev, payload];
    });
    triggerToast(editingSpiralItem ? 'Updated spiral photo & framing! 🌀' : 'Added new photo to Infinite Spiral! 🌀');
    try {
      await saveSpiralItemR2(payload);
    } catch (err) {
      triggerToast(`Spiral save error: ${err.message}`);
    }
  };


  const handleDeleteSpiralItem = async (id, title) => {
    if (window.confirm(`Remove photo "${title || 'this photo'}" from Infinite Spiral only? (This will ONLY remove it from the spiral and will NOT delete files from other modules or the database)`)) {
      // ⚡ Instant optimistic update
      setSpiralItems(prev => prev.filter(s => s.id !== id));
      triggerToast('Spiral photo removed 🗑️');
      deleteSpiralItemR2(id).catch(err => triggerToast(`Delete error: ${err.message}`));
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
        : { id: `post-${Date.now()}`, ...postForm };
      // ⚡ Instant optimistic update
      setPosts(prev => {
        const idx = prev.findIndex(p => p.id === payload.id);
        if (idx >= 0) {
          const arr = [...prev];
          arr[idx] = payload;
          return arr;
        }
        return [payload, ...prev];
      });
      await savePostR2(payload, currentUser || { displayName: 'Admin', photoURL: r2Photo('Gracee.jpg') });
      triggerToast(editingPost ? 'Post updated! ✅' : 'Post published live to squad! 📣');
      setEditingPost(null);
      setPostForm({ authorName: 'Admin Announcement', content: '', category: 'Announcement' });
    } catch (err) {
      triggerToast(`Post failed: ${err.message}`);
    }
  };

  const handleDeletePost = async (id, snippet) => {
    if (window.confirm(`Delete post "${snippet || 'this post'}"? (This will ONLY remove it from Community Posts and will NOT affect other modules)`)) {
      // ⚡ Instant optimistic update
      setPosts(prev => prev.filter(p => p.id !== id));
      triggerToast('Post deleted 🗑️');
      deletePostR2(id).catch(err => triggerToast(`Delete failed: ${err.message}`));
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
        : { id: `evt-${Date.now()}`, ...eventForm };
      // ⚡ Instant optimistic update
      setEvents(prev => {
        const idx = prev.findIndex(ev => ev.id === payload.id);
        if (idx >= 0) {
          const arr = [...prev];
          arr[idx] = payload;
          return arr;
        }
        return [payload, ...prev];
      });
      await saveEventR2(payload);
      triggerToast(editingEvent ? `Updated event "${eventForm.title}"! ✅` : `Event "${eventForm.title}" live on website! 🗓️`);
      setEditingEvent(null);
      setEventForm({ title: '', date: '', time: '', location: '', description: '' });
    } catch (err) {
      triggerToast(`Event save failed: ${err.message}`);
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (window.confirm(`Delete event "${title || 'this event'}"? (This will ONLY remove it from Events & Trips and will NOT affect other modules)`)) {
      // ⚡ Instant optimistic update
      setEvents(prev => prev.filter(e => e.id !== id));
      triggerToast(`Deleted event "${title || id}" 🗑️`);
      deleteEventR2(id).catch(err => triggerToast(`Delete error: ${err.message}`));
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

  // Cinematic Memory Reel Items (strictly isolated from memories — VIDEOS ONLY)
  const filteredReels = reelItems.filter(r => isVideoMedia(r)).filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      (r.title || '').toLowerCase().includes(q) ||
      (r.category || r.year || '').toLowerCase().includes(q) ||
      (r.location || '').toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q)
    );
  });



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

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '14px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <Shield size={13} />
            <span>Restricted Sanctuary Administration Console</span>
          </p>

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
          <div className="admin-user-pill">
            <img 
              src={(currentUser && currentUser.photoURL) || brandLogo} 
              alt="" 
              className="admin-user-avatar" 
              referrerPolicy="no-referrer" 
            />
            <span className="admin-user-name">{(currentUser && currentUser.displayName) || 'Sanctuary Admin'}</span>
          </div>
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
              className={`admin-nav-tab ${activeTab === 'spiral' ? 'active' : ''}`}
              onClick={() => setActiveTab('spiral')}
            >
              <Sparkles size={18} /> Infinite Spiral ({spiralItems.length})
            </button>
            <button
              className={`admin-nav-tab ${activeTab === 'journey' ? 'active' : ''}`}
              onClick={() => setActiveTab('journey')}
            >
              <Compass size={18} /> Friendship Journey ({journeyMilestones.length})
            </button>
            <button
              className={`admin-nav-tab ${activeTab === 'reels' ? 'active' : ''}`}
              onClick={() => setActiveTab('reels')}
            >
              <Film size={18} /> Cinematic Reels ({reelItems.filter(isVideoMedia).length})
            </button>
            <button
              className={`admin-nav-tab ${activeTab === 'memories' ? 'active' : ''}`}
              onClick={() => setActiveTab('memories')}
            >
              <BookOpen size={18} /> Memory Chapters ({memories.filter(m => !m.isReel && m.mediaType !== 'video').length})
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

              <div className="admin-stat-card" onClick={() => setActiveTab('spiral')} style={{ cursor: 'pointer' }}>
                <div className="admin-stat-icon-wrap from-indigo">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="admin-stat-number">{spiralItems.length}</h3>
                  <p className="admin-stat-label">Infinite Spiral</p>
                  <span className="admin-stat-meta">Spinning 3D Vault Photos</span>
                </div>
              </div>

              <div className="admin-stat-card" onClick={() => setActiveTab('journey')} style={{ cursor: 'pointer' }}>
                <div className="admin-stat-icon-wrap from-cyan">
                  <Compass size={24} />
                </div>
                <div>
                  <h3 className="admin-stat-number">{journeyMilestones.length}</h3>
                  <p className="admin-stat-label">Friendship Journey</p>
                  <span className="admin-stat-meta">4 Core Friendship Eras</span>
                </div>
              </div>

              <div className="admin-stat-card" onClick={() => setActiveTab('reels')} style={{ cursor: 'pointer' }}>
                <div className="admin-stat-icon-wrap from-pink">
                  <Film size={24} />
                </div>
                <div>
                  <h3 className="admin-stat-number">{reelItems.filter(isVideoMedia).length}</h3>
                  <p className="admin-stat-label">Cinematic Reels</p>
                  <span className="admin-stat-meta">Live in Our Memory Reel (Videos Only)</span>
                </div>
              </div>


              <div className="admin-stat-card" onClick={() => setActiveTab('memories')} style={{ cursor: 'pointer' }}>
                <div className="admin-stat-icon-wrap from-pink">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="admin-stat-number">{memories.filter(m => !m.isReel && m.mediaType !== 'video').length}</h3>
                  <p className="admin-stat-label">Memory Chapters</p>
                  <span className="admin-stat-meta">Chronological Journey (Photos Only)</span>
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

          {/* 2.1 INFINITE SPIRAL TAB */}
          {activeTab === 'spiral' && (
            <div className="admin-section-block">
              <div className="admin-section-header">
                <div>
                  <h2 className="admin-section-title">Infinite Spiral Vault Gallery</h2>
                  <p className="admin-section-sub">
                    Manage the {spiralItems.length} photos rotating in the 3D Infinite Spiral on the homepage.
                  </p>
                </div>
                <div className="admin-action-bar">
                  <button onClick={openAddSpiralItem} className="admin-primary-btn">
                    <Plus size={16} /> Add Spiral Photo
                  </button>
                </div>
              </div>

              {spiralItems.length === 0 ? (
                <div className="admin-empty-pane" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Sparkles size={44} style={{ opacity: 0.4, margin: '0 auto 12px' }} />
                  <h3>No spiral photos found</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Click "Add Spiral Photo" to add photos to the 3D rotating spiral.</p>
                </div>
              ) : (
                <div className="admin-cards-grid">
                  {spiralItems.map((item, idx) => (
                    <div key={item.id || idx} className="admin-card-item">
                      <div style={{ position: 'relative', overflow: 'hidden', height: '170px', background: 'rgba(0,0,0,0.3)' }}>
                        <img 
                          src={item.src} 
                          alt={item.alt || item.title} 
                          className="admin-card-img" 
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: item.objectFit || 'cover',
                            objectPosition: item.objectPosition || 'center center',
                            transform: item.scale && item.scale !== 1 ? `scale(${item.scale})` : undefined
                          }}
                        />
                        {item.positionY !== undefined && item.positionY !== 50 && (
                          <span style={{ position: 'absolute', bottom: '8px', right: '8px', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(0,0,0,0.7)', color: '#a5b4fc', backdropFilter: 'blur(4px)' }}>
                            Focus: {item.positionY}%
                          </span>
                        )}
                      </div>
                      <div className="admin-card-body">
                        <div className="admin-card-header-row">
                          <span className="admin-card-badge">Position #{idx + 1}</span>
                          <div className="admin-row-actions">
                            <button onClick={() => openEditSpiralItem(item)} className="admin-icon-action-btn" title="Edit Photo & Adjust Framing">
                              <Edit3 size={15} />
                            </button>
                            <button onClick={() => handleDeleteSpiralItem(item.id, item.title || item.alt)} className="admin-icon-action-btn delete" title="Delete Photo">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                        <h3 className="admin-card-title">{item.title || item.alt || `Photo #${idx + 1}`}</h3>
                        <p className="admin-card-desc">{item.alt ? `Alt: ${item.alt}` : 'Featured in Infinite Spiral'}</p>
                      </div>
                    </div>
                  ))}
                </div>

              )}
            </div>
          )}

          {/* 2.2 FRIENDSHIP JOURNEY TAB */}
          {activeTab === 'journey' && (
            <div className="admin-section-block">
              <div className="admin-section-header">
                <div>
                  <h2 className="admin-section-title">Friendship Journey Milestones</h2>
                  <p className="admin-section-sub">
                    Edit the 4 core chronological milestones featured in "The Squad Evolution".
                  </p>
                </div>
              </div>

              <div className="admin-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
                {journeyMilestones.map((milestone, idx) => (
                  <div key={milestone.id || idx} className="admin-card-item" style={{ overflow: 'hidden' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={milestone.photo} alt={milestone.title} className="admin-card-img" style={{ height: '190px', objectFit: 'cover' }} />
                      <span className="admin-card-badge" style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
                        {milestone.stepLabel}
                      </span>
                    </div>
                    <div className="admin-card-body">
                      <div className="admin-card-header-row">
                        <span className="admin-card-badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
                          {milestone.badge || milestone.stepLabel}
                        </span>
                        <button
                          onClick={() => openEditMilestone(milestone)}
                          className="admin-primary-btn"
                          style={{ padding: '4px 12px', fontSize: '0.8rem', height: 'auto' }}
                          title="Edit Milestone"
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                      </div>
                      <h3 className="admin-card-title" style={{ marginTop: '8px' }}>{milestone.title}</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>
                        "{milestone.tagline}"
                      </p>
                      <p className="admin-card-desc">{milestone.description}</p>
                      {milestone.quote && (
                        <div style={{ marginTop: '10px', padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', borderLeft: '3px solid #818cf8', fontSize: '0.8rem' }}>
                          "{milestone.quote}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2.5 REELS TAB */}
          {activeTab === 'reels' && (

            <div className="admin-section-block">
              <div className="admin-section-header">
                <div>
                  <h2 className="admin-section-title">Cinematic Video Reels</h2>
                  <p className="admin-section-sub">
                    Manage video clips featured in the live "Our Memory Reel" cinematic theater ({reelItems.filter(isVideoMedia).length} active videos).
                  </p>
                </div>
                <div className="admin-action-bar">
                  <button onClick={() => setIsBundleModalOpen(true)} className="admin-secondary-btn bundle-upload-btn">
                    <FolderPlus size={16} /> Batch Upload
                  </button>
                  <button onClick={openAddReel} className="admin-primary-btn">
                    <Plus size={16} /> Add Reel Video
                  </button>
                </div>
              </div>

              {filteredReels.length === 0 ? (
                <div className="admin-empty-pane" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Film size={44} style={{ opacity: 0.4, margin: '0 auto 12px' }} />
                  <h3>No reel videos found</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Click "Add Reel Video" to upload video clips to your cinematic theater.</p>
                </div>
              ) : (
                <div className="admin-cards-grid">
                  {filteredReels.map((reel) => (
                    <div key={reel.id} className="admin-card-item">
                      <video src={reel.mediaUrl} className="admin-card-img" muted playsInline />

                      <div className="admin-card-body">
                        <div className="admin-card-header-row">
                          <span className="admin-card-badge">
                            {reel.category || reel.year || 'Adventures'} · {reel.date || 'Moment'}
                          </span>
                          <div className="admin-row-actions">
                            <button onClick={() => openEditReel(reel)} className="admin-icon-action-btn" title="Edit Reel">
                              <Edit3 size={15} />
                            </button>
                            <button onClick={() => handleDeleteReel(reel.id, reel.title)} className="admin-icon-action-btn delete" title="Delete Reel">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                        <h3 className="admin-card-title">{reel.title || 'Untitled Slide'}</h3>
                        <p className="admin-card-desc">{reel.description || 'No description provided.'}</p>
                        {reel.location && <p className="admin-card-loc">📍 {reel.location}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. MEMORIES TAB */}
          {activeTab === 'memories' && (

            <div className="admin-section-block">
              <div className="admin-section-header">
                <div>
                  <h2 className="admin-section-title">Memory Chapters (Photos Only)</h2>
                  <p className="admin-section-sub">
                    Publish new photo chapters or edit milestone memories ({memories.filter(m => !m.isReel && m.mediaType !== 'video').length} active chapters).
                  </p>
                </div>
                <div className="admin-action-bar">
                  <button onClick={() => setIsBundleModalOpen(true)} className="admin-secondary-btn bundle-upload-btn">
                    <FolderPlus size={16} /> Batch / Folder Upload
                  </button>
                  <button onClick={openAddMemory} className="admin-primary-btn">
                    <Plus size={16} /> New Chapter
                  </button>
                </div>
              </div>

              <div className="admin-cards-grid">
                {memories.filter(m => !m.isReel && m.mediaType !== 'video').map((mem) => (
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

                <div className="admin-upload-actions-row">
                  <label className="admin-file-upload-btn">
                    Choose Media File
                    <input type="file" onChange={handleFileUpload} accept="image/*,video/*" style={{ display: 'none' }} />
                  </label>
                  <button onClick={() => setIsBundleModalOpen(true)} className="admin-secondary-btn bundle-upload-btn">
                    <FolderPlus size={16} /> Batch / Folder Upload
                  </button>
                </div>

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
                        accept="image/*,image/heic,image/heif,.heic,.heif" 
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

      {/* Friendship Journey Milestone Modal */}

      {isMilestoneModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <h2 className="admin-modal-title">Edit {milestoneForm.stepLabel} Milestone</h2>
            <form onSubmit={handleSaveMilestone} className="admin-modal-form">
              {/* Photo picker */}
              <div className="admin-photo-upload-section">
                <label className="admin-field-label">Milestone Cover Photo *</label>
                <div className="admin-photo-picker-row">
                  <div className="admin-photo-preview-box memory-preview">
                    {milestoneForm.photo ? (
                      <img src={milestoneForm.photo} alt="Preview" className="admin-photo-preview-img" />
                    ) : (
                      <div className="admin-photo-preview-placeholder">
                        <Compass size={28} />
                      </div>
                    )}
                  </div>
                  <div className="admin-photo-picker-controls">
                    <label className="admin-file-pick-btn">
                      <Camera size={16} />
                      <span>{milestonePhotoUploading ? 'Uploading to R2...' : 'Choose Milestone Photo'}</span>
                      <input 
                        type="file" 
                        accept="image/*,image/heic,image/heif,.heic,.heif" 
                        onChange={handleMilestonePhotoFile}
                        disabled={milestonePhotoUploading}
                        style={{ display: 'none' }}
                      />

                    </label>
                    <span className="admin-photo-hint">Directly uploaded to Cloudflare R2 bucket with live preview</span>
                  </div>
                </div>

                <div className="admin-input-group" style={{ marginTop: '10px' }}>
                  <label>Or Photo URL</label>
                  <input
                    type="text"
                    value={milestoneForm.photo}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, photo: e.target.value })}
                    placeholder={`e.g. ${R2_BASE}/photos/...`}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-input-group">
                  <label>Step Label / Year *</label>
                  <input
                    type="text"
                    value={milestoneForm.stepLabel}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, stepLabel: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-input-group">
                  <label>Badge Tag (e.g. Year 1 • Genesis)</label>
                  <input
                    type="text"
                    value={milestoneForm.badge}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, badge: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-input-group">
                <label>Milestone Title *</label>
                <input
                  type="text"
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="admin-input-group">
                <label>Tagline Subtitle</label>
                <input
                  type="text"
                  value={milestoneForm.tagline}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, tagline: e.target.value })}
                />
              </div>

              <div className="admin-input-group">
                <label>Memorable Quote</label>
                <input
                  type="text"
                  value={milestoneForm.quote}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, quote: e.target.value })}
                />
              </div>

              <div className="admin-input-group">
                <label>Story Description</label>
                <textarea
                  rows="3"
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setIsMilestoneModalOpen(false)} className="admin-cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="admin-primary-btn" disabled={milestonePhotoUploading}>
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Infinite Spiral Photo Modal */}
      {isSpiralModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <h2 className="admin-modal-title">
              {editingSpiralItem ? 'Edit Spiral Photo' : 'Add Spiral Photo'}
            </h2>
            <form onSubmit={handleSaveSpiralItem} className="admin-modal-form">
              <div className="admin-photo-upload-section">
                <label className="admin-field-label">Spiral Photo *</label>
                <div className="admin-photo-picker-row">
                  <div className="admin-photo-preview-box memory-preview">
                    {spiralForm.src ? (
                      <img src={spiralForm.src} alt="Preview" className="admin-photo-preview-img" />
                    ) : (
                      <div className="admin-photo-preview-placeholder">
                        <Sparkles size={28} />
                      </div>
                    )}
                  </div>
                  <div className="admin-photo-picker-controls">
                    <label className="admin-file-pick-btn">
                      <Camera size={16} />
                      <span>{spiralPhotoUploading ? 'Uploading to R2...' : 'Choose Photo'}</span>
                      <input 
                        type="file" 
                        accept="image/*,image/heic,image/heif,.heic,.heif" 
                        onChange={handleSpiralPhotoFile}
                        disabled={spiralPhotoUploading}
                        style={{ display: 'none' }}
                      />

                    </label>
                    <span className="admin-photo-hint">Uploaded to Cloudflare R2 bucket with live preview</span>
                  </div>
                </div>

                <div className="admin-input-group" style={{ marginTop: '10px' }}>
                  <label>Or Photo URL *</label>
                  <input
                    type="text"
                    value={spiralForm.src}
                    onChange={(e) => setSpiralForm({ ...spiralForm, src: e.target.value })}
                    placeholder={`e.g. ${R2_BASE}/photos/...`}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-input-group">
                  <label>Title / Label</label>
                  <input
                    type="text"
                    value={spiralForm.title}
                    onChange={(e) => setSpiralForm({ ...spiralForm, title: e.target.value })}
                    placeholder="e.g. Farish in White Hoodie"
                  />
                </div>
                <div className="admin-input-group">
                  <label>Alt Text / Description</label>
                  <input
                    type="text"
                    value={spiralForm.alt}
                    onChange={(e) => setSpiralForm({ ...spiralForm, alt: e.target.value })}
                    placeholder="e.g. Farish"
                  />
                </div>
              </div>

              {/* Live 3D Card Simulation Box */}
              <div className="admin-input-group" style={{ marginTop: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#c7d2fe' }}>Live 3D Spiral Card Preview</span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Exact Card Aspect Ratio (195 × 145)
                  </span>
                </label>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '280px',
                  height: '190px',
                  margin: '4px auto 14px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '2px solid rgba(99, 102, 241, 0.45)',
                  boxShadow: '0 14px 34px rgba(0, 0, 0, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {spiralForm.src ? (
                    <img
                      src={spiralForm.src}
                      alt="Card Live Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: spiralForm.objectFit || 'cover',
                        objectPosition: spiralForm.objectPosition || `center ${spiralForm.positionY ?? 50}%`,
                        transform: spiralForm.scale && spiralForm.scale !== 1 ? `scale(${spiralForm.scale})` : undefined,
                        transition: 'object-position 0.15s ease, transform 0.15s ease'
                      }}
                    />
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                      <Sparkles size={28} style={{ opacity: 0.4, margin: '0 auto 6px' }} />
                      Choose or enter photo URL above
                    </div>
                  )}
                  <span style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    fontSize: '0.68rem',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: '#e0e7ff',
                    backdropFilter: 'blur(6px)'
                  }}>
                    {spiralForm.objectFit === 'contain' ? 'Fit: Contain' : `Vertical Y: ${spiralForm.positionY ?? 50}%`}
                  </span>
                </div>
              </div>

              {/* Portrait & Framing Adjustment Controls */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.07)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#c7d2fe', margin: 0 }}>
                    Portrait &amp; Framing Adjustment
                  </label>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Adjust if heads or faces get cut off
                  </span>
                </div>

                {/* Quick Presets for Vertical Alignment */}
                <div style={{ marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Quick Focus Presets:
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { label: '👤 Top (Face Focus)', val: 10 },
                      { label: '🎯 Upper (25%)', val: 25 },
                      { label: '⚖️ Center (50%)', val: 50 },
                      { label: '🔻 Lower (80%)', val: 80 },
                    ].map(preset => {
                      const isSelected = (spiralForm.positionY ?? 50) === preset.val;
                      return (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => {
                            setSpiralForm(prev => ({
                              ...prev,
                              positionY: preset.val,
                              objectPosition: `center ${preset.val}%`
                            }));
                          }}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            borderRadius: '8px',
                            border: isSelected ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.15)',
                            background: isSelected ? '#6366f1' : 'rgba(255,255,255,0.06)',
                            color: '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            fontWeight: isSelected ? 600 : 400
                          }}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fine-tune Vertical Offset Slider */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span>Fine-Tune Vertical Offset (Y-Axis)</span>
                    <strong style={{ color: '#818cf8' }}>{spiralForm.positionY ?? 50}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="2"
                    value={spiralForm.positionY ?? 50}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setSpiralForm(prev => ({
                        ...prev,
                        positionY: val,
                        objectPosition: `center ${val}%`
                      }));
                    }}
                    style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <span>0% (Top / Head)</span>
                    <span>50% (Center)</span>
                    <span>100% (Bottom)</span>
                  </div>
                </div>

                {/* Fit Mode & Zoom Scale */}
                <div className="admin-form-row" style={{ marginTop: '10px' }}>
                  <div className="admin-input-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.78rem' }}>Display Fit</label>
                    <select
                      value={spiralForm.objectFit || 'cover'}
                      onChange={(e) => setSpiralForm(prev => ({ ...prev, objectFit: e.target.value }))}
                      style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                    >
                      <option value="cover">Cover (Fill card seamlessly)</option>
                      <option value="contain">Contain (Full portrait, no crop)</option>
                    </select>
                  </div>

                  <div className="admin-input-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                      <label style={{ margin: 0, fontSize: '0.78rem' }}>Zoom Scale</label>
                      <span style={{ color: '#818cf8', fontWeight: 600 }}>{Math.round((spiralForm.scale || 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.4"
                      step="0.05"
                      value={spiralForm.scale || 1}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setSpiralForm(prev => ({ ...prev, scale: val }));
                      }}
                      style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>


              <div className="admin-modal-actions">
                <button type="button" onClick={() => setIsSpiralModalOpen(false)} className="admin-cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="admin-primary-btn" disabled={spiralPhotoUploading}>
                  {editingSpiralItem ? 'Save Changes' : 'Add to Spiral'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reel Modal */}
      {isReelModalOpen && (

        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <h2 className="admin-modal-title">
              {editingReel ? 'Edit Cinematic Reel Slide' : 'Add New Reel Slide'}
            </h2>
            <form onSubmit={handleSaveReel} className="admin-modal-form">
              {/* Media Upload & Preview — VIDEOS ONLY */}
              <div className="admin-photo-upload-section">
                <label className="admin-field-label">Reel Video (MP4 / WebM / MOV) *</label>
                <div className="admin-photo-picker-row">
                  <div className="admin-photo-preview-box memory-preview">
                    {reelForm.mediaUrl ? (
                      <video src={reelForm.mediaUrl} className="admin-photo-preview-img" muted controls />
                    ) : (
                      <div className="admin-photo-preview-placeholder">
                        <Film size={28} />
                      </div>
                    )}
                  </div>

                  <div className="admin-photo-picker-controls">
                    <label className="admin-file-pick-btn">
                      <Film size={16} />
                      <span>{reelPhotoUploading ? 'Uploading Video to R2...' : 'Choose Video File'}</span>
                      <input 
                        type="file" 
                        accept="video/*" 
                        onChange={handleReelPhotoFile}
                        disabled={reelPhotoUploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <span className="admin-photo-hint">Videos only (MP4, WebM, MOV) uploaded directly to Cloudflare R2</span>
                  </div>
                </div>

                <div className="admin-input-group" style={{ marginTop: '10px' }}>
                  <label>Or Video URL *</label>
                  <input
                    type="text"
                    value={reelForm.mediaUrl}
                    onChange={(e) => setReelForm({ ...reelForm, mediaUrl: e.target.value, mediaType: 'video' })}
                    placeholder="https://.../video.mp4"
                    required
                  />
                </div>
              </div>


              <div className="admin-form-row">
                <div className="admin-input-group">
                  <label>Slide Title *</label>
                  <input
                    type="text"
                    value={reelForm.title}
                    onChange={(e) => setReelForm({ ...reelForm, title: e.target.value })}
                    placeholder="e.g. Squad Memory – Goa Sunset"
                    required
                  />
                </div>
                <div className="admin-input-group">
                  <label>Category / Tag</label>
                  <input
                    type="text"
                    value={reelForm.category}
                    onChange={(e) => setReelForm({ ...reelForm, category: e.target.value })}
                    placeholder="e.g. Adventures, Celebration, Late Nights"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-input-group">
                  <label>Date Tag</label>
                  <input
                    type="text"
                    value={reelForm.date}
                    onChange={(e) => setReelForm({ ...reelForm, date: e.target.value })}
                    placeholder="e.g. Sep 3 or Year 2026"
                  />
                </div>
                <div className="admin-input-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={reelForm.location}
                    onChange={(e) => setReelForm({ ...reelForm, location: e.target.value })}
                    placeholder="e.g. Squad Sanctuary, Bangalore"
                  />
                </div>
              </div>

              <div className="admin-input-group">
                <label>Story Description / Caption</label>
                <textarea
                  rows="3"
                  value={reelForm.description}
                  onChange={(e) => setReelForm({ ...reelForm, description: e.target.value })}
                  placeholder="Caption or moment description shown in the cinematic reel..."
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setIsReelModalOpen(false)} className="admin-cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="admin-primary-btn" disabled={reelPhotoUploading}>
                  {editingReel ? 'Save Changes' : 'Publish to Reel'}
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
                        accept="image/*,image/heic,image/heif,.heic,.heif" 
                        onChange={handleMemoryPhotoFile}
                        disabled={memoryPhotoUploading}
                        style={{ display: 'none' }}
                      />

                    </label>
                    <span className="admin-photo-hint">Photos only (JPG, PNG, WebP) uploaded directly to Cloudflare R2</span>

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

      {/* Batch & Folder Upload Modal */}
      {isBundleModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card admin-bundle-modal-card">
            <div className="admin-modal-header-row">
              <div className="admin-bundle-header-meta">
                <div className="admin-bundle-badge">
                  <FolderPlus size={14} />
                  <span>BATCH & FOLDER VAULT UPLOADER</span>
                </div>
                <h2 className="admin-modal-title">Upload Folder / Bundle of Photos</h2>
                <p className="admin-section-sub">
                  Upload multiple photos or an entire computer folder directly to Cloudflare R2 and optionally publish them as Memories.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  if (!isBundleUploading) {
                    setIsBundleModalOpen(false);
                    handleClearBundle();
                  }
                }} 
                disabled={isBundleUploading}
                className="admin-modal-close-btn"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Hidden Input Pickers */}
            <input 
              ref={folderInputRef} 
              type="file" 
              multiple 
              onChange={(e) => handleSelectFiles(e.target.files)} 
              style={{ display: 'none' }} 
            />
            <input 
              ref={multiFileInputRef} 
              type="file" 
              multiple 
              accept="image/*,video/*" 
              onChange={(e) => handleSelectFiles(e.target.files)} 
              style={{ display: 'none' }} 
            />

            {/* Selection Dropzone */}
            <div 
              className="admin-bundle-dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleSelectFiles(e.dataTransfer.files);
              }}
            >
              <div className="admin-bundle-dropzone-icon">
                <FolderUp size={32} />
              </div>
              <h3>Choose Photos or Entire Folder</h3>
              <p>Drag &amp; drop photos here, or click below to select multiple files or a whole folder from your device</p>
              
              <div className="admin-bundle-picker-buttons">
                <button 
                  type="button" 
                  onClick={() => folderInputRef.current?.click()}
                  disabled={isBundleUploading}
                  className="admin-folder-picker-btn"
                >
                  <FolderPlus size={16} /> Select Entire Folder
                </button>
                <button 
                  type="button" 
                  onClick={() => multiFileInputRef.current?.click()}
                  disabled={isBundleUploading}
                  className="admin-multifile-picker-btn"
                >
                  <Camera size={16} /> Select Multiple Photos
                </button>
              </div>
            </div>

            {/* Memory Publish Configuration */}
            <div className="admin-bundle-config-box">
              <label className="admin-bundle-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={bundleSettings.autoCreateMemories} 
                  onChange={(e) => setBundleSettings({ ...bundleSettings, autoCreateMemories: e.target.checked })}
                  disabled={isBundleUploading}
                />
                <span className="admin-bundle-checkbox-custom" />
                <span>
                  <strong>Automatically create a Memory Chapter for each photo</strong>
                  <small>Publishes photos directly to the public memories timeline in real time</small>
                </span>
              </label>

              {bundleSettings.autoCreateMemories && (
                <div className="admin-bundle-config-grid">
                  <div className="admin-input-group">
                    <label>Chapter Label</label>
                    <input 
                      type="text" 
                      value={bundleSettings.year} 
                      onChange={(e) => setBundleSettings({ ...bundleSettings, year: e.target.value })}
                      placeholder="e.g. Chapter 5, College Trip"
                      disabled={isBundleUploading}
                    />
                  </div>
                  <div className="admin-input-group">
                    <label>Title Prefix (Optional)</label>
                    <input 
                      type="text" 
                      value={bundleSettings.titlePrefix} 
                      onChange={(e) => setBundleSettings({ ...bundleSettings, titlePrefix: e.target.value })}
                      placeholder="e.g. Squad Memory"
                      disabled={isBundleUploading}
                    />
                  </div>
                  <div className="admin-input-group">
                    <label>Location</label>
                    <input 
                      type="text" 
                      value={bundleSettings.location} 
                      onChange={(e) => setBundleSettings({ ...bundleSettings, location: e.target.value })}
                      placeholder="e.g. Squad Sanctuary"
                      disabled={isBundleUploading}
                    />
                  </div>
                  <div className="admin-input-group">
                    <label>Category</label>
                    <select 
                      value={bundleSettings.category} 
                      onChange={(e) => setBundleSettings({ ...bundleSettings, category: e.target.value })}
                      disabled={isBundleUploading}
                    >
                      <option value="Adventures">Adventures</option>
                      <option value="Milestones">Milestones</option>
                      <option value="Reunions">Reunions</option>
                      <option value="Daily Laughs">Daily Laughs</option>
                      <option value="Moment">Moment</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Files Queue */}
            {bundleFiles.length > 0 && (
              <div className="admin-bundle-queue-section">
                <div className="admin-bundle-queue-header">
                  <div className="admin-bundle-queue-count">
                    <Layers size={16} />
                    <span><strong>{bundleFiles.length}</strong> photos queued for upload</span>
                  </div>
                  {!isBundleUploading && (
                    <button 
                      type="button" 
                      onClick={handleClearBundle} 
                      className="admin-clear-bundle-btn"
                    >
                      Clear List
                    </button>
                  )}
                </div>

                <div className="admin-bundle-items-grid">
                  {bundleFiles.map((item) => (
                    <div key={item.id} className={`admin-bundle-chip ${item.status}`}>
                      <img src={item.previewUrl} alt={item.name} className="admin-bundle-thumb" />
                      <div className="admin-bundle-chip-info">
                        <span className="admin-bundle-file-name" title={item.name}>{item.name}</span>
                        <span className="admin-bundle-file-size">{(item.size / 1024).toFixed(0)} KB</span>
                        {item.status === 'uploading' && (
                          <span className="admin-bundle-status-badge uploading">
                            <Loader2 size={11} className="spin-icon" /> Uploading...
                          </span>
                        )}
                        {item.status === 'done' && (
                          <span className="admin-bundle-status-badge done">
                            <Check size={11} /> Uploaded to R2
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span className="admin-bundle-status-badge error" title={item.error}>
                            <AlertCircle size={11} /> Failed
                          </span>
                        )}
                        {item.status === 'pending' && (
                          <span className="admin-bundle-status-badge pending">
                            Ready
                          </span>
                        )}
                      </div>
                      {!isBundleUploading && item.status !== 'done' && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveBundleItem(item.id)}
                          className="admin-bundle-remove-btn"
                          title="Remove from batch"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress Bar */}
            {(isBundleUploading || bundleProgress > 0) && (
              <div className="admin-bundle-progress-wrap">
                <div className="admin-bundle-progress-header">
                  <span>
                    {isBundleUploading ? (
                      <>Uploading photo <strong>{bundleCurrentIndex}</strong> of <strong>{bundleFiles.length}</strong> to Cloudflare R2...</>
                    ) : (
                      <>Batch upload completed!</>
                    )}
                  </span>
                  <span className="admin-bundle-progress-pct">{bundleProgress}%</span>
                </div>
                <div className="admin-upload-progress-bar">
                  <div className="admin-progress-fill" style={{ width: `${bundleProgress}%` }} />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="admin-modal-actions">
              <button 
                type="button" 
                onClick={() => {
                  setIsBundleModalOpen(false);
                  handleClearBundle();
                }} 
                disabled={isBundleUploading} 
                className="admin-cancel-btn"
              >
                {bundleFiles.some(f => f.status === 'done') ? 'Done' : 'Cancel'}
              </button>

              <button 
                type="button" 
                onClick={handleStartBundleUpload} 
                disabled={isBundleUploading || bundleFiles.length === 0 || bundleFiles.every(f => f.status === 'done')} 
                className="admin-primary-btn"
              >
                {isBundleUploading ? (
                  <>
                    <Loader2 size={16} className="spin-icon" />
                    <span>Uploading Batch ({bundleCurrentIndex}/{bundleFiles.length})...</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Start Batch Upload ({bundleFiles.length} Photos)</span>
                  </>
                )}
              </button>
            </div>
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
