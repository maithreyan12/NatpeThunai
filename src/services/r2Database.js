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
export const COLLECTIONS = {
  MEMBERS:  'members',
  MEMORIES: 'memories',
  POSTS:    'posts',
  EVENTS:   'events',
  JOURNEY:  'journey',
  SPIRAL:   'spiral',
  REELS:    'reels',
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

// ── Read from CDN (production) or local API proxy (development) ────
async function fetchFromCDN(collection) {
  // In development, use the Vite dev server API to avoid CORS issues
  if (import.meta.env.DEV) {
    const res = await fetch(`/api/r2/data?collection=${collection}&_t=${Date.now()}`);
    if (!res.ok) throw new Error(`API fetch failed: ${res.status}`);
    const json = await res.json();
    return json.data;
  }
  // In production, read directly from R2 CDN (fast, globally cached)
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

export const INITIAL_JOURNEY_MILESTONES = [
  {
    id: "journey-1",
    stepLabel: "First Year",
    tagline: "Where strangers met over canteen chai",
    title: "The Canteen Dawn & First Spark",
    description: "Spontaneous canteen tea conversations, awkward classroom ice-breakers, and the very first late-night laughs that unexpectedly formed the foundation of our circle.",
    quote: "Sometimes the strangers you meet in the hallway become the family you cannot imagine life without.",
    photo: r2Photo('Gracee.jpg'),
    badge: "Year 1 • Genesis",
    colorKey: "lavender",
    gangCount: "Squad Circle",
    attendees: [
      { name: "Grace", role: "The Spark ✨", photo: r2Photo('Gracee.jpg') },
      { name: "Farish", role: "The Mastermind 🧠", photo: r2Photo('farish.jpg') },
      { name: "Kafil", role: "The Creative Soul 🎨", photo: r2Photo('kafil.jpg') },
      { name: "Haniya", role: "The Chill Sloth 🦥", photo: r2Photo('hanuu.jpg') },
      { name: "Jaffreen", role: "The Sweet Heart 💖", photo: r2Photo('jaffreen.jpg') },
      { name: "Divyaaa", role: "The Sunshine ☀️", photo: r2Photo('Divyaa.jpg') }
    ],
    remainingCount: 8
  },
  {
    id: "journey-2",
    stepLabel: "Second Year",
    tagline: "Full tank, loud music, zero sleep",
    title: "Midnight Drives & Exam Chaos",
    description: "Countless midnight highway drives, high-volume Tamil bangers in Farish's car, exam panic group study sessions, and turning everyday college routines into pure adventure.",
    quote: "We didn't realize we were making lifelong history; we just knew we were laughing together.",
    photo: r2Photo('Heenuuu.jpg'),
    badge: "Year 2 • Chaos & Memories",
    colorKey: "blue",
    gangCount: "Squad Circle",
    attendees: [
      { name: "Heenuuu", role: "The Spark & Heart 💖", photo: r2Photo('Heenuuu.jpg') },
      { name: "Samuel", role: "The Joyful Soul 🌟", photo: r2Photo('samuel.jpg') },
      { name: "Afnaaan", role: "The Energy Dynamo ⚡", photo: r2Photo('affu.jpg') },
      { name: "Meshak", role: "Silent Strength 🛡️", photo: r2Photo('meshak.jpg') },
      { name: "Puppy", role: "The Chill Vibe 🎯", photo: r2Photo('Puppy.jpg') },
      { name: "Farish", role: "The Mastermind 🧠", photo: r2Photo('farish.jpg') }
    ],
    remainingCount: 8
  },
  {
    id: "journey-3",
    stepLabel: "Third Year",
    tagline: "When life got real, friendship was our sanctuary",
    title: "The Unbreakable Bond & Milestones",
    description: "Through individual triumphs, tough semesters, career milestones, and quiet moments when someone just needed a listening ear — friends stood side by side.",
    quote: "True friends don't just celebrate your sunny days; they stand with you through every unexpected storm.",
    photo: r2Photo('Divyaa.jpg'),
    badge: "Year 3 • Lifelong Trust",
    colorKey: "pink",
    gangCount: "Squad Circle",
    attendees: [
      { name: "Divyaaa", role: "The Sunshine ☀️", photo: r2Photo('Divyaa.jpg') },
      { name: "Harshitha", role: "Radiant Sunshine 🌻", photo: r2Photo('harshuuu.jpg') },
      { name: "Maithreyan", role: "Tech & Vibe Pilot 🚀", initial: "MA" },
      { name: "Gopika", role: "Graceful Heart 🌸", initial: "GO" },
      { name: "Jaffreen", role: "The Sweet Heart 💖", photo: r2Photo('jaffreen.jpg') },
      { name: "Puppy", role: "The Chill Vibe 🎯", photo: r2Photo('Puppy.jpg') }
    ],
    remainingCount: 8
  },
  {
    id: "journey-4",
    stepLabel: "Final Year",
    tagline: "Still here. Still squad strong.",
    title: "Eternal Natpe Thunai Sanctuary",
    description: "Our bond continues to deepen every single day. Distance or busy careers mean nothing; whenever we reconnect, it's as if zero seconds have passed. Natpe Thunai forever.",
    quote: "Namma friendship perfect illa, aana romba real. Squad strong for infinity. ❤️🫂♾️",
    photo: r2Photo('Puppy.jpg'),
    badge: "Year 4 & Forever",
    colorKey: "peach",
    gangCount: "Squad Family",
    attendees: [
      { name: "Grace", role: "The Spark ✨", photo: r2Photo('Gracee.jpg') },
      { name: "Heenuuu", role: "The Heart 💖", photo: r2Photo('Heenuuu.jpg') },
      { name: "Kafil", role: "Creative Soul 🎨", photo: r2Photo('kafil.jpg') },
      { name: "Divyaaa", role: "The Sunshine ☀️", photo: r2Photo('Divyaa.jpg') },
      { name: "Haniya", role: "The Chill Sloth 🦥", photo: r2Photo('hanuu.jpg') },
      { name: "Puppy", role: "The Chill Vibe 🎯", photo: r2Photo('Puppy.jpg') }
    ],
    remainingCount: 8
  }
];

export const INITIAL_SPIRAL_ITEMS = [
  { id: 'spiral-1', src: r2Photo('friend1.jpg'), alt: 'Squad Memory 1', title: 'Mountain Lake Vibes' },
  { id: 'spiral-2', src: r2Photo('friend2.jpg'), alt: 'Squad Memory 2', title: 'Forest Trail Hangout' },
  { id: 'spiral-3', src: r2Photo('friend3.jpg'), alt: 'Squad Memory 3', title: 'Summit Sunset View' },
  { id: 'spiral-4', src: r2Photo('friend4.jpg'), alt: 'Squad Memory 4', title: 'Beachside Laughs' },
  { id: 'spiral-5', src: r2Photo('farish.jpg'),  alt: 'Farish Sharif', title: 'Farish in White Hoodie' },
  { id: 'spiral-6', src: r2Photo('kafil.jpg'),   alt: 'Kafil K',       title: 'Kafil by the Water' },
  { id: 'spiral-7', src: r2Photo('hanuu.jpg'),   alt: 'Haniya Hanu',   title: 'Hanu Chill Smiles' },
];

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
    seedCollection(COLLECTIONS.REELS, INITIAL_REELS),
    seedCollection(COLLECTIONS.POSTS, initialPosts),
    seedCollection(COLLECTIONS.EVENTS, initialEvents),
    seedCollection(COLLECTIONS.JOURNEY, INITIAL_JOURNEY_MILESTONES),
    seedCollection(COLLECTIONS.SPIRAL, INITIAL_SPIRAL_ITEMS),
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

  // Memories must strictly be PHOTOS ONLY (exclude any videos and reel items)
  const isPhotoOnly = (m) => {
    if (!m) return false;
    if (m.isReel) return false;
    if (m.mediaType === 'video') return false;
    if (typeof m.mediaUrl === 'string') {
      const u = m.mediaUrl.toLowerCase();
      if (u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.mov') || u.endsWith('.m4v')) return false;
    }
    return true;
  };

  const cached = cache.get(cacheKey);
  if (cached && Array.isArray(cached)) {
    callback(cached.filter(isPhotoOnly));
  }

  const refresh = async () => {
    try {
      const data = await fetchFromCDN(cacheKey);
      if (Array.isArray(data)) {
        const cleanMemories = data.filter(isPhotoOnly);
        cache.set(cacheKey, cleanMemories);
        callback(cleanMemories);
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
  // ⚡ Instant optimistic cache update
  const current = cache.get(COLLECTIONS.MEMBERS) || [];
  cache.set(COLLECTIONS.MEMBERS, current.filter(m => m.id !== memberId));
  const result = await callAPI({ collection: COLLECTIONS.MEMBERS, action: 'delete', id: memberId });
  if (result?.data) {
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
    isReel: false,
    reactions: memoryData.reactions || { '❤️': 1, '✨': 0, '🫂': 0, '😂': 0 },

    comments: memoryData.comments || [],
    createdAt: memoryData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  // ⚡ Instant optimistic cache update
  const current = cache.get(COLLECTIONS.MEMORIES) || [];
  const idx = current.findIndex(m => m.id === id);
  if (idx >= 0) {
    const updated = [...current];
    updated[idx] = item;
    cache.set(COLLECTIONS.MEMORIES, updated);
  } else {
    cache.set(COLLECTIONS.MEMORIES, [item, ...current]);
  }
  const result = await callAPI({ collection: COLLECTIONS.MEMORIES, action: 'upsert', item });
  if (result?.data) cache.set(COLLECTIONS.MEMORIES, result.data);
  return item;
}

export async function deleteMemoryR2(memoryId) {
  // ⚡ Instant optimistic cache update
  const current = cache.get(COLLECTIONS.MEMORIES) || [];
  cache.set(COLLECTIONS.MEMORIES, current.filter(m => m.id !== memoryId));
  const result = await callAPI({ collection: COLLECTIONS.MEMORIES, action: 'delete', id: memoryId });
  if (result?.data) cache.set(COLLECTIONS.MEMORIES, result.data);
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
  const current = cache.get(COLLECTIONS.POSTS) || [];
  const idx = current.findIndex(p => p.id === id);
  if (idx >= 0) {
    const updated = [...current];
    updated[idx] = item;
    cache.set(COLLECTIONS.POSTS, updated);
  } else {
    cache.set(COLLECTIONS.POSTS, [item, ...current]);
  }
  const result = await callAPI({ collection: COLLECTIONS.POSTS, action: 'upsert', item });
  if (result?.data) cache.set(COLLECTIONS.POSTS, result.data);
  return item;
}

export async function deletePostR2(postId) {
  // ⚡ Instant optimistic cache update
  const current = cache.get(COLLECTIONS.POSTS) || [];
  cache.set(COLLECTIONS.POSTS, current.filter(p => p.id !== postId));
  const result = await callAPI({ collection: COLLECTIONS.POSTS, action: 'delete', id: postId });
  if (result?.data) cache.set(COLLECTIONS.POSTS, result.data);
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
  const current = cache.get(COLLECTIONS.EVENTS) || [];
  const idx = current.findIndex(e => e.id === id);
  if (idx >= 0) {
    const updated = [...current];
    updated[idx] = item;
    cache.set(COLLECTIONS.EVENTS, updated);
  } else {
    cache.set(COLLECTIONS.EVENTS, [item, ...current]);
  }
  const result = await callAPI({ collection: COLLECTIONS.EVENTS, action: 'upsert', item });
  if (result?.data) cache.set(COLLECTIONS.EVENTS, result.data);
  return item;
}

export async function deleteEventR2(eventId) {
  // ⚡ Instant optimistic cache update
  const current = cache.get(COLLECTIONS.EVENTS) || [];
  cache.set(COLLECTIONS.EVENTS, current.filter(e => e.id !== eventId));
  const result = await callAPI({ collection: COLLECTIONS.EVENTS, action: 'delete', id: eventId });
  if (result?.data) cache.set(COLLECTIONS.EVENTS, result.data);
}

// ═══════════════════════════════════════════════════════════════════
//  JOURNEY & SPIRAL — SUBSCRIPTIONS & CRUD
// ═══════════════════════════════════════════════════════════════════

export function subscribeToJourneyR2(callback) {
  const cacheKey = COLLECTIONS.JOURNEY;
  const cached = cache.get(cacheKey);
  if (cached && cached.length > 0) {
    callback(cached);
  } else {
    callback(INITIAL_JOURNEY_MILESTONES);
  }

  const refresh = async () => {
    try {
      const data = await fetchFromCDN(cacheKey);
      if (Array.isArray(data) && data.length > 0) {
        cache.set(cacheKey, data);
        callback(data);
      }
    } catch (err) {
      console.warn('[R2 DB] Journey fetch warning:', err.message);
    }
  };

  refresh();
  const interval = setInterval(refresh, 15000);
  return () => clearInterval(interval);
}

export async function saveJourneyMilestoneR2(milestoneData) {
  const current = cache.get(COLLECTIONS.JOURNEY) || INITIAL_JOURNEY_MILESTONES;
  const item = {
    ...milestoneData,
    updatedAt: new Date().toISOString()
  };
  const updated = current.map(m => (m.id === item.id || m.stepLabel === item.stepLabel) ? { ...m, ...item } : m);
  // ⚡ Instant optimistic cache update
  cache.set(COLLECTIONS.JOURNEY, updated);
  await callAPI({ collection: COLLECTIONS.JOURNEY, action: 'upsert', item });
  return item;
}

export function subscribeToSpiralR2(callback) {
  const cacheKey = COLLECTIONS.SPIRAL;
  const cached = cache.get(cacheKey);
  if (cached && cached.length > 0) {
    callback(cached);
  } else {
    callback(INITIAL_SPIRAL_ITEMS);
  }

  const refresh = async () => {
    try {
      const data = await fetchFromCDN(cacheKey);
      if (Array.isArray(data) && data.length > 0) {
        cache.set(cacheKey, data);
        callback(data);
      }
    } catch (err) {
      console.warn('[R2 DB] Spiral fetch warning:', err.message);
    }
  };

  refresh();
  const interval = setInterval(refresh, 15000);
  return () => clearInterval(interval);
}

export async function saveSpiralItemR2(spiralData) {
  const id = spiralData.id || `spiral-${Date.now()}`;
  const item = {
    id,
    src: spiralData.src,
    alt: spiralData.alt || 'Squad Memory',
    title: spiralData.title || spiralData.alt || 'Squad Moment',
    objectPosition: spiralData.objectPosition || 'center center',
    objectFit: spiralData.objectFit || 'cover',
    scale: Number(spiralData.scale) || 1,
    updatedAt: new Date().toISOString()
  };

  const current = cache.get(COLLECTIONS.SPIRAL) || INITIAL_SPIRAL_ITEMS;
  const existingIdx = current.findIndex(s => s.id === item.id);
  const updated = existingIdx >= 0
    ? current.map(s => s.id === item.id ? item : s)
    : [...current, item];

  // ⚡ Instant optimistic cache update
  cache.set(COLLECTIONS.SPIRAL, updated);
  await callAPI({ collection: COLLECTIONS.SPIRAL, action: 'upsert', item });
  return item;
}

export async function deleteSpiralItemR2(itemId) {
  const current = cache.get(COLLECTIONS.SPIRAL) || INITIAL_SPIRAL_ITEMS;
  const updated = current.filter(s => s.id !== itemId);
  // ⚡ Instant optimistic cache update
  cache.set(COLLECTIONS.SPIRAL, updated);
  await callAPI({ collection: COLLECTIONS.SPIRAL, action: 'delete', id: itemId });
}

// ═══════════════════════════════════════════════════════════════════
//  CINEMATIC REELS (Dedicated Collection — VIDEOS ONLY)
// ═══════════════════════════════════════════════════════════════════

export const INITIAL_REELS = [
  {
    id: "reel-01",
    title: "The Genesis Dawn & First Spark",
    category: "Milestone",
    date: "August 14",
    location: "Campus Common & Café",
    mediaUrl: "https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev/reels/reel-1.mp4",
    mediaType: "video",
    description: "The very first day our squad bonded over chai and shared goals at the canteen.",
    isReel: true
  },
  {
    id: "reel-02",
    title: "Midnight Highway Roadtrip",
    category: "Adventures",
    date: "April 22",
    location: "Highway Beats & Zero Sleep",
    mediaUrl: "https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev/reels/reel-2.mp4",
    mediaType: "video",
    description: "High-volume Tamil tracks on the open road, turning ordinary nights into pure cinema.",
    isReel: true
  },
  {
    id: "reel-03",
    title: "Squad Celebration & Pure Laughter",
    category: "Celebration",
    date: "November 18",
    location: "Beachside Sunset Gathering",
    mediaUrl: "https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev/reels/reel-3.webm",
    mediaType: "video",
    description: "Laughing until our stomachs hurt, celebrating every milestone together.",
    isReel: true
  },
  {
    id: "reel-04",
    title: "Squad Strong Forever & Infinity",
    category: "Sanctuary",
    date: "Always & Forever",
    location: "Natpe Thunai Sanctuary",
    mediaUrl: "https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev/reels/reel-4.mp4",
    mediaType: "video",
    description: "More than friends — family by choice. Natpe Thunai forever and infinity.",
    isReel: true
  }
];



// Helper to ensure media is strictly video
export const isVideoMedia = (item) => {
  if (!item || !item.mediaUrl) return false;
  if (item.mediaType === 'video') return true;
  const url = String(item.mediaUrl).toLowerCase();
  return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov') || url.endsWith('.m4v') || url.includes('video');
};

export function subscribeToReelsR2(callback) {
  const cacheKey = COLLECTIONS.REELS;

  const cached = cache.get(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    const videoReels = cached.filter(isVideoMedia);
    callback(videoReels.length > 0 ? videoReels : INITIAL_REELS);
  } else {
    callback(INITIAL_REELS);
  }

  const refresh = async () => {
    try {
      const data = await fetchFromCDN(cacheKey);
      if (Array.isArray(data) && data.length > 0) {
        const videoReels = data.filter(isVideoMedia);
        const finalReels = videoReels.length > 0 ? videoReels : INITIAL_REELS;
        cache.set(cacheKey, finalReels);
        callback(finalReels);
      }
    } catch (err) {
      console.warn('[R2 DB] Reels fetch warning:', err.message);
    }
  };

  refresh();
  const interval = setInterval(refresh, 15000);
  return () => clearInterval(interval);
}

export async function saveReelR2(reelData) {
  const id = reelData.id || `reel-${Date.now()}`;
  const item = {
    id,
    title: reelData.title || 'Cinematic Squad Reel',
    category: reelData.category || 'Adventures',
    date: reelData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    location: reelData.location || 'Squad Sanctuary',
    description: reelData.description || '',
    mediaUrl: reelData.mediaUrl,
    mediaType: 'video', // Strictly video for reels!
    isReel: true,
    updatedAt: new Date().toISOString()
  };

  const current = cache.get(COLLECTIONS.REELS) || INITIAL_REELS;
  const existingIdx = current.findIndex(r => r.id === item.id);
  const updated = existingIdx >= 0
    ? current.map(r => r.id === item.id ? item : r)
    : [item, ...current];

  // ⚡ Instant optimistic cache update
  cache.set(COLLECTIONS.REELS, updated.filter(isVideoMedia));
  await callAPI({ collection: COLLECTIONS.REELS, action: 'upsert', item });
  return item;
}


export async function deleteReelR2(reelId) {
  const current = cache.get(COLLECTIONS.REELS) || INITIAL_REELS;
  const updated = current.filter(r => r.id !== reelId);
  // ⚡ Instant optimistic cache update
  cache.set(COLLECTIONS.REELS, updated);
  await callAPI({ collection: COLLECTIONS.REELS, action: 'delete', id: reelId });
}

// Force refresh cache for a specific collection (call after admin write)
export function invalidateCache(collection) {
  delete mem[collection];
}


