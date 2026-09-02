// ═══════════════════════════════════════════════════════════════════
//  FIRESTORE LIVE SERVICE — All data is live-synced from Firestore
//  Admin panel writes → Firestore → Public website reads live
// ═══════════════════════════════════════════════════════════════════

import { db } from '../firebase';
import {
  collection, doc,
  getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot, serverTimestamp, writeBatch
} from 'firebase/firestore';
import { INITIAL_SQUAD_MEMBERS, INITIAL_MEMORIES, INITIAL_POSTS, INITIAL_EVENTS } from './dataService';
import { r2Photo } from './r2Assets';

const COLLECTIONS = {
  MEMBERS:  'nt_members',
  MEMORIES: 'nt_memories',
  POSTS:    'nt_posts',
  EVENTS:   'nt_events',
};

// ── Offline cache helpers ──────────────────────────────────────────
const cache = {
  get: (key) => { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : null; } catch { return null; } },
  set: (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch {} },
};

// ═══════════════════════════════════════════════════════════════════
//  SEED — write default data to Firestore if collection is empty
// ═══════════════════════════════════════════════════════════════════

const DUO_IDS = ['maithreyan', 'gopika'];

const seedIfEmpty = async () => {
  try {
    // Members
    const membersSnap = await getDocs(collection(db, COLLECTIONS.MEMBERS));
    if (membersSnap.empty) {
      const batch = writeBatch(db);
      INITIAL_SQUAD_MEMBERS.forEach(m => {
        const ref = doc(db, COLLECTIONS.MEMBERS, m.id);
        batch.set(ref, { ...m, _seeded: true, updatedAt: new Date().toISOString() });
      });
      await batch.commit();
      console.log('✅ Seeded squad members to Firestore');
    }

    // Memories
    const memoriesSnap = await getDocs(collection(db, COLLECTIONS.MEMORIES));
    if (memoriesSnap.empty) {
      const batch = writeBatch(db);
      const mems = typeof INITIAL_MEMORIES !== 'undefined' ? INITIAL_MEMORIES : [];
      mems.forEach(m => {
        const ref = doc(db, COLLECTIONS.MEMORIES, m.id);
        batch.set(ref, { ...m, createdAt: m.createdAt || new Date().toISOString() });
      });
      await batch.commit();
      console.log('✅ Seeded memories to Firestore');
    }

    // Posts
    const postsSnap = await getDocs(collection(db, COLLECTIONS.POSTS));
    if (postsSnap.empty) {
      const batch = writeBatch(db);
      const posts = typeof INITIAL_POSTS !== 'undefined' ? INITIAL_POSTS : [];
      posts.forEach(p => {
        const ref = doc(db, COLLECTIONS.POSTS, p.id);
        batch.set(ref, { ...p, createdAt: p.createdAt || new Date().toISOString() });
      });
      await batch.commit();
      console.log('✅ Seeded posts to Firestore');
    }

    // Events
    const eventsSnap = await getDocs(collection(db, COLLECTIONS.EVENTS));
    if (eventsSnap.empty) {
      const batch = writeBatch(db);
      const events = typeof INITIAL_EVENTS !== 'undefined' ? INITIAL_EVENTS : [];
      events.forEach(e => {
        const ref = doc(db, COLLECTIONS.EVENTS, e.id);
        batch.set(ref, { ...e });
      });
      await batch.commit();
      console.log('✅ Seeded events to Firestore');
    }
  } catch (err) {
    console.warn('Seed skipped (Firestore unavailable):', err.message);
  }
};

// Run seed once per session
let seeded = false;
export const ensureSeeded = async () => {
  if (seeded) return;
  seeded = true;
  await seedIfEmpty();
};

// ═══════════════════════════════════════════════════════════════════
//  SQUAD MEMBERS — Live Firestore
// ═══════════════════════════════════════════════════════════════════

const arrangeWithDuoAtEnd = (list) => {
  const isDuo = (m) => DUO_IDS.includes(m.id?.toLowerCase?.() || '');
  return [...list.filter(m => !isDuo(m)), ...DUO_IDS.map(id => list.find(m => m.id === id)).filter(Boolean)];
};

/**
 * Subscribe to live member updates from Firestore.
 * Falls back to INITIAL_SQUAD_MEMBERS if Firestore is unreachable.
 * @param {Function} callback - receives the members array on every update
 * @returns {Function} unsubscribe function
 */
export const subscribeToMembers = (callback) => {
  // Immediately serve cache while Firestore loads
  const cached = cache.get('nt_members_live');
  if (cached && Array.isArray(cached) && cached.length > 0) {
    callback(arrangeWithDuoAtEnd(cached));
  } else {
    callback(arrangeWithDuoAtEnd(INITIAL_SQUAD_MEMBERS));
  }

  try {
    const q = query(collection(db, COLLECTIONS.MEMBERS));
    let unsub;
    unsub = onSnapshot(q, (snap) => {
      const members = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      if (members.length > 0) {
        const arranged = arrangeWithDuoAtEnd(members);
        cache.set('nt_members_live', arranged);
        callback(arranged);
      }
    }, (err) => {
      console.warn('Members: Firestore unavailable, using cache/default:', err.message);
      if (unsub) unsub();
    });
    return unsub;
  } catch {
    return () => {};
  }
};

/**
 * Save or update a squad member in Firestore
 */
export const saveMemberToFirestore = async (memberData) => {
  const id = memberData.id || `member-${Date.now()}`;
  const data = {
    id,
    name: memberData.name?.trim() || '',
    nickname: memberData.nickname?.trim() || memberData.name?.trim() || '',
    role: memberData.role?.trim() || 'Squad Member 🌟',
    category: memberData.category || 'vibe',
    bio: memberData.bio?.trim() || '',
    quote: memberData.quote?.trim() || 'Natpe Thunai forever and infinity.',
    instagram: memberData.instagram?.trim() || '',
    photo: memberData.photo || null,
    avatarGradient: memberData.avatarGradient || 'linear-gradient(135deg, #6366f1, #a855f7)',
    journeyMilestones: memberData.journeyMilestones || [
      { title: 'Joined the Gang', desc: 'Added endless laughter and energy to our lifelong bond.' }
    ],
    updatedAt: new Date().toISOString(),
  };
  await setDoc(doc(db, COLLECTIONS.MEMBERS, id), data, { merge: true });
  return data;
};

/**
 * Delete a squad member from Firestore
 */
export const deleteMemberFromFirestore = async (memberId) => {
  await deleteDoc(doc(db, COLLECTIONS.MEMBERS, memberId));
};

// ═══════════════════════════════════════════════════════════════════
//  MEMORIES — Live Firestore
// ═══════════════════════════════════════════════════════════════════

export const subscribeToMemoriesLive = (callback) => {
  const cached = cache.get('nt_memories_live');
  if (cached && Array.isArray(cached) && cached.length > 0) callback(cached);

  try {
    const q = query(collection(db, COLLECTIONS.MEMORIES), orderBy('createdAt', 'desc'));
    let unsub;
    unsub = onSnapshot(q, (snap) => {
      const memories = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      if (memories.length > 0) {
        cache.set('nt_memories_live', memories);
        callback(memories);
      }
    }, (err) => {
      console.warn('Memories: Firestore unavailable:', err.message);
      if (unsub) unsub();
    });
    return unsub;
  } catch {
    return () => {};
  }
};

export const saveMemoryToFirestore = async (memoryData) => {
  const id = `mem-${Date.now()}`;
  const data = {
    id,
    year: memoryData.year || 'Chapter 5',
    title: memoryData.title,
    description: memoryData.description || '',
    date: memoryData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    location: memoryData.location || 'Squad Circle',
    mediaUrl: memoryData.mediaUrl || r2Photo('Gracee.jpg'),
    mediaType: 'image',
    people: Array.isArray(memoryData.people) ? memoryData.people : (memoryData.people || '').split(',').map(s => s.trim()).filter(Boolean),
    category: memoryData.category || 'Moment',
    reactions: { '❤️': 1, '✨': 0, '🫂': 0, '😂': 0 },
    comments: [],
    createdAt: serverTimestamp(),
  };
  const ref = doc(db, COLLECTIONS.MEMORIES, id);
  await setDoc(ref, data);
  return { ...data, id };
};

export const deleteMemoryFromFirestore = async (memoryId) => {
  await deleteDoc(doc(db, COLLECTIONS.MEMORIES, memoryId));
};

// ═══════════════════════════════════════════════════════════════════
//  POSTS — Live Firestore
// ═══════════════════════════════════════════════════════════════════

export const subscribeToPostsLive = (callback) => {
  const cached = cache.get('nt_posts_live');
  if (cached && Array.isArray(cached) && cached.length > 0) callback(cached);

  try {
    const q = query(collection(db, COLLECTIONS.POSTS), orderBy('createdAt', 'desc'));
    let unsub;
    unsub = onSnapshot(q, (snap) => {
      const posts = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      if (posts.length > 0) {
        cache.set('nt_posts_live', posts);
        callback(posts);
      }
    }, (err) => {
      console.warn('Posts: Firestore unavailable:', err.message);
      if (unsub) unsub();
    });
    return unsub;
  } catch {
    return () => {};
  }
};

export const savePostToFirestore = async (postData, user) => {
  const id = `post-${Date.now()}`;
  const data = {
    id,
    authorName: user?.displayName || postData.authorName || 'Admin',
    authorPhoto: user?.photoURL || r2Photo('Gracee.jpg'),
    authorUid: user?.uid || null,
    content: postData.content,
    category: postData.category || 'Announcement',
    likes: 0,
    comments: [],
    createdAt: serverTimestamp(),
  };
  const ref = doc(db, COLLECTIONS.POSTS, id);
  await setDoc(ref, data);
  return data;
};

export const deletePostFromFirestore = async (postId) => {
  await deleteDoc(doc(db, COLLECTIONS.POSTS, postId));
};

// ═══════════════════════════════════════════════════════════════════
//  EVENTS — Live Firestore
// ═══════════════════════════════════════════════════════════════════

export const subscribeToEventsLive = (callback) => {
  const cached = cache.get('nt_events_live');
  if (cached && Array.isArray(cached) && cached.length > 0) callback(cached);

  try {
    const q = query(collection(db, COLLECTIONS.EVENTS));
    let unsub;
    unsub = onSnapshot(q, (snap) => {
      const events = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      if (events.length > 0) {
        cache.set('nt_events_live', events);
        callback(events);
      }
    }, (err) => {
      console.warn('Events: Firestore unavailable:', err.message);
      if (unsub) unsub();
    });
    return unsub;
  } catch {
    return () => {};
  }
};

export const saveEventToFirestore = async (eventData) => {
  const id = `evt-${Date.now()}`;
  const data = {
    id,
    title: eventData.title,
    date: eventData.date,
    time: eventData.time || '7:00 PM',
    location: eventData.location || 'Squad Circle',
    description: eventData.description || '',
    category: eventData.category || 'Celebration',
    rsvpCount: 0,
    createdAt: serverTimestamp(),
  };
  const ref = doc(db, COLLECTIONS.EVENTS, id);
  await setDoc(ref, data);
  return data;
};

export const deleteEventFromFirestore = async (eventId) => {
  await deleteDoc(doc(db, COLLECTIONS.EVENTS, eventId));
};
