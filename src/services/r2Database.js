// ═══════════════════════════════════════════════════════════════════
//  R2 DATABASE SERVICE — Cloudflare R2 as the live database
//  All data stored as JSON files in R2 bucket under data/
//  Admin writes → R2 → Public website reads from CDN
//  No Firebase required for data storage
// ═══════════════════════════════════════════════════════════════════

import { INITIAL_SQUAD_MEMBERS } from './dataService';
import { r2Photo } from './r2Assets';

// Public CDN base (for reading — no credentials needed)
const CDN = (import.meta.env.VITE_R2_PUBLIC_DOMAIN || 'https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev').replace(/\/$/, '');

// API base (for writes — goes through our Vercel serverless function)
const API = '/api/r2/data';

// ── Collection names ────────────────────────────────────────────────
const COLLECTIONS = {
  MEMBERS:  'members',
  MEMORIES: 'memories',
  POSTS:    'posts',
  EVENTS:   'events',
};

// ── Fast in-memory + localStorage cache ────────────────────────────
const mem = {};
const cache = {
  get: (key) => {
    if (mem[key]) return mem[key];
    try { const d = localStorage.getItem(`r2_${key}`); return d ? JSON.parse(d) : null; } catch { return null; }
  },
  set: (key, data) => {
    mem[key] = data;
    try { localStorage.setItem(`r2_${key}`, JSON.stringify(data)); } catch {}
  },
};

// ── Read from CDN (public, no auth, globally cached) ───────────────
async function fetchFromCDN(collection) {
  const url = `${CDN}/data/${collection}.json?_t=${Date.now()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CDN fetch failed: ${res.status}`);
  return res.json();
}

// ── Write via API (serverless → R2 with credentials) ───────────────
async function callAPI(body) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error ${res.status}`);
  }
  return res.json();
}

// ── Seed collection to R2 if empty ─────────────────────────────────
async function seedCollection(collection, initialData) {
  try {
    await callAPI({ collection, action: 'seed', data: initialData });
  } catch (err) {
    console.warn(`[R2 DB] Seed skipped for ${collection}:`, err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  BOOT: Seed all collections on first load if they don't exist
// ═══════════════════════════════════════════════════════════════════
let booted = false;
export async function bootR2Database(initialMemories = [], initialPosts = [], initialEvents = []) {
  if (booted) return;
  booted = true;

  const duo = ['maithreyan', 'gopika'];
  const arrangedMembers = [
    ...INITIAL_SQUAD_MEMBERS.filter(m => !duo.includes(m.id)),
    ...INITIAL_SQUAD_MEMBERS.filter(m => duo.includes(m.id)),
  ];

  await Promise.allSettled([
    seedCollection(COLLECTIONS.MEMBERS, arrangedMembers),
    seedCollection(COLLECTIONS.MEMORIES, initialMemories),
    seedCollection(COLLECTIONS.POSTS, initialPosts),
    seedCollection(COLLECTIONS.EVENTS, initialEvents),
  ]);
}

// ═══════════════════════════════════════════════════════════════════
//  SUBSCRIBE HELPERS — React state sync
// ═══════════════════════════════════════════════════════════════════

const DUO_IDS = ['maithreyan', 'gopika'];

const arrangeWithDuoAtEnd = (list) => {
  if (!Array.isArray(list)) return [];
  return [
    ...list.filter(m => !DUO_IDS.includes(m.id?.toLowerCase?.() || '')),
    ...DUO_IDS.map(id => list.find(m => m.id === id)).filter(Boolean),
  ];
};

/**
 * Subscribe to live member data from R2.
 * Immediately serves cache, then fetches latest from CDN.
 * Polls every 15 seconds for updates.
 */
export function subscribeToMembersR2(callback) {
  const cacheKey = COLLECTIONS.MEMBERS;

  // 1. Serve cache immediately
  const cached = cache.get(cacheKey);
  if (cached && cached.length > 0) {
    callback(arrangeWithDuoAtEnd(cached));
  } else {
    callback(arrangeWithDuoAtEnd(INITIAL_SQUAD_MEMBERS));
  }

  // 2. Fetch latest from CDN
  const refresh = async () => {
    try {
      const data = await fetchFromCDN(cacheKey);
      if (Array.isArray(data) && data.length > 0) {
        const arranged = arrangeWithDuoAtEnd(data);
        cache.set(cacheKey, arranged);
        callback(arranged);
      }
    } catch (err) {
      console.warn('[R2 DB] Members CDN fetch failed, using cache:', err.message);
    }
  };

  refresh();

  // 3. Poll every 15s for admin updates
  const interval = setInterval(refresh, 15000);
  return () => clearInterval(interval);
}

/**
 * Subscribe to live memories from R2.
 */
export function subscribeToMemoriesR2(callback) {
  const cacheKey = COLLECTIONS.MEMORIES;

  const cached = cache.get(cacheKey);
  if (cached) callback(cached);

  const refresh = async () => {
    try {
      const data = await fetchFromCDN(cacheKey);
      if (Array.isArray(data)) {
        cache.set(cacheKey, data);
        callback(data);
      }
    } catch (err) {
      console.warn('[R2 DB] Memories fetch failed:', err.message);
    }
  };

  refresh();
  const interval = setInterval(refresh, 20000);
  return () => clearInterval(interval);
}

/**
 * Subscribe to live posts from R2.
 */
export function subscribeToPostsR2(callback) {
  const cacheKey = COLLECTIONS.POSTS;

  const cached = cache.get(cacheKey);
  if (cached) callback(cached);

  const refresh = async () => {
    try {
      const data = await fetchFromCDN(cacheKey);
      if (Array.isArray(data)) {
        cache.set(cacheKey, data);
        callback(data);
      }
    } catch (err) {
      console.warn('[R2 DB] Posts fetch failed:', err.message);
    }
  };

  refresh();
  const interval = setInterval(refresh, 20000);
  return () => clearInterval(interval);
}

/**
 * Subscribe to live events from R2.
 */
export function subscribeToEventsR2(callback) {
  const cacheKey = COLLECTIONS.EVENTS;

  const cached = cache.get(cacheKey);
  if (cached) callback(cached);

  const refresh = async () => {
    try {
      const data = await fetchFromCDN(cacheKey);
      if (Array.isArray(data)) {
        cache.set(cacheKey, data);
        callback(data);
      }
    } catch (err) {
      console.warn('[R2 DB] Events fetch failed:', err.message);
    }
  };

  refresh();
  const interval = setInterval(refresh, 20000);
  return () => clearInterval(interval);
}

// ═══════════════════════════════════════════════════════════════════
//  WRITE OPERATIONS (Admin Only)
// ═══════════════════════════════════════════════════════════════════

export async function saveMemberR2(memberData) {
  const id = memberData.id || `member-${Date.now()}`;
  const item = {
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
      { title: 'Joined the Gang', desc: 'Added endless laughter to our lifelong bond.' }
    ],
    updatedAt: new Date().toISOString(),
  };
  const result = await callAPI({ collection: COLLECTIONS.MEMBERS, action: 'upsert', item });
  if (result.data) {
    cache.set(COLLECTIONS.MEMBERS, arrangeWithDuoAtEnd(result.data));
  }
  return item;
}

export async function deleteMemberR2(memberId) {
  const result = await callAPI({ collection: COLLECTIONS.MEMBERS, action: 'delete', id: memberId });
  if (result.data) {
    cache.set(COLLECTIONS.MEMBERS, arrangeWithDuoAtEnd(result.data));
  }
}

export async function saveMemoryR2(memoryData) {
  const id = memoryData.id || `mem-${Date.now()}`;
  const item = {
    id,
    year: memoryData.year || 'Chapter 5',
    title: memoryData.title,
    description: memoryData.description || '',
    date: memoryData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    location: memoryData.location || 'Squad Circle',
    mediaUrl: memoryData.mediaUrl || r2Photo('Gracee.jpg'),
    mediaType: memoryData.mediaType || 'image',
    people: Array.isArray(memoryData.people)
      ? memoryData.people
      : (memoryData.people || '').split(',').map(s => s.trim()).filter(Boolean),
    category: memoryData.category || 'Moment',
    reactions: memoryData.reactions || { '❤️': 1, '✨': 0, '🫂': 0, '😂': 0 },
    comments: memoryData.comments || [],
    createdAt: memoryData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const result = await callAPI({ collection: COLLECTIONS.MEMORIES, action: 'upsert', item });
  if (result.data) cache.set(COLLECTIONS.MEMORIES, result.data);
  return item;
}

export async function deleteMemoryR2(memoryId) {
  const result = await callAPI({ collection: COLLECTIONS.MEMORIES, action: 'delete', id: memoryId });
  if (result.data) cache.set(COLLECTIONS.MEMORIES, result.data);
}

export async function savePostR2(postData, user) {
  const id = postData.id || `post-${Date.now()}`;
  const item = {
    id,
    authorName: user?.displayName || postData.authorName || 'Admin',
    authorPhoto: user?.photoURL || postData.authorPhoto || r2Photo('Gracee.jpg'),
    content: postData.content,
    category: postData.category || 'Announcement',
    likes: postData.likes ?? 0,
    comments: postData.comments || [],
    createdAt: postData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const result = await callAPI({ collection: COLLECTIONS.POSTS, action: 'upsert', item });
  if (result.data) cache.set(COLLECTIONS.POSTS, result.data);
  return item;
}

export async function deletePostR2(postId) {
  const result = await callAPI({ collection: COLLECTIONS.POSTS, action: 'delete', id: postId });
  if (result.data) cache.set(COLLECTIONS.POSTS, result.data);
}

export async function saveEventR2(eventData) {
  const id = eventData.id || `evt-${Date.now()}`;
  const item = {
    id,
    title: eventData.title,
    date: eventData.date,
    time: eventData.time || '7:00 PM',
    location: eventData.location || 'Squad Circle',
    description: eventData.description || '',
    category: eventData.category || 'Celebration',
    rsvpCount: eventData.rsvpCount ?? 0,
    createdAt: eventData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const result = await callAPI({ collection: COLLECTIONS.EVENTS, action: 'upsert', item });
  if (result.data) cache.set(COLLECTIONS.EVENTS, result.data);
  return item;
}

export async function deleteEventR2(eventId) {
  const result = await callAPI({ collection: COLLECTIONS.EVENTS, action: 'delete', id: eventId });
  if (result.data) cache.set(COLLECTIONS.EVENTS, result.data);
}

// Force refresh cache for a specific collection (call after admin write)
export function invalidateCache(collection) {
  delete mem[collection];
}
