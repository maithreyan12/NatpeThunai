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
  MUSIC:    'music',
};



export const isBannedEntity = (obj) => {
  if (!obj) return false;
  const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
  return /shyam|sundar/i.test(str);
};

// ── Fast in-memory + localStorage cache (with auto-purge) ───────────
const mem = {};
const cache = {
  get: (key) => {
    if (mem[key]) {
      if (Array.isArray(mem[key])) return mem[key].filter(x => !isBannedEntity(x));
      return isBannedEntity(mem[key]) ? null : mem[key];
    }
    try {
      const d = localStorage.getItem(`r2_${key}`);
      if (!d) return null;
      const parsed = JSON.parse(d);
      if (Array.isArray(parsed)) {
        return parsed.filter(x => !isBannedEntity(x));
      }
      return isBannedEntity(parsed) ? null : parsed;
    } catch { return null; }
  },
  set: (key, data) => {
    const clean = Array.isArray(data) ? data.filter(x => !isBannedEntity(x)) : (isBannedEntity(data) ? null : data);
    mem[key] = clean;
    try { localStorage.setItem(`r2_${key}`, JSON.stringify(clean)); } catch {}
  },
};

// ── Request deduplication and Smart Poller ──────────────────────────
const inflightRequests = {};

function setupSmartPoll(refreshFn, intervalMs = 90000) {
  const poll = () => {
    if (typeof document !== 'undefined' && document.hidden) return;
    refreshFn();
  };
  const interval = setInterval(poll, intervalMs);
  const onFocus = () => {
    if (typeof document !== 'undefined' && !document.hidden) {
      refreshFn();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', onFocus);
  }
  return () => {
    clearInterval(interval);
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', onFocus);
    }
  };
}

// ── Read from CDN (production) or local API proxy (development) ────
async function fetchFromCDN(collection) {
  if (inflightRequests[collection]) {
    return inflightRequests[collection];
  }

  const p = (async () => {
    try {
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
    } finally {
      setTimeout(() => {
        delete inflightRequests[collection];
      }, 3000);
    }
  })();

  inflightRequests[collection] = p;
  return p;
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
  { id: 'spiral-kafil',      src: r2Photo('kafil.jpg'),      alt: 'Kafil',          title: 'Kafil · Creative Soul',          objectPosition: 'center 18%', positionY: 18, scale: 1, objectFit: 'cover' },
  { id: 'spiral-haniya',     src: r2Photo('hanuu.jpg'),      alt: 'Haniya',         title: 'Haniya · The Chill Sloth',       objectPosition: 'center 20%', positionY: 20, scale: 1, objectFit: 'cover' },
  { id: 'spiral-grace',      src: r2Photo('Gracee.jpg'),     alt: 'Grace',          title: 'Grace · The Spark & Creative',   objectPosition: 'center 16%', positionY: 16, scale: 1, objectFit: 'cover' },
  { id: 'spiral-jaffreen',   src: r2Photo('jaffreen.jpg'),   alt: 'Jaffreen',       title: 'Jaffreen · The Sweet Heart',     objectPosition: 'center 16%', positionY: 16, scale: 1, objectFit: 'cover' },
  { id: 'spiral-farish',     src: r2Photo('farish.jpg'),     alt: 'Farish Sharif',  title: 'Farish · The Mastermind',        objectPosition: 'center 15%', positionY: 15, scale: 1, objectFit: 'cover' },
  { id: 'spiral-divyaaa',    src: r2Photo('Divyaa.jpg'),     alt: 'Divyaaa',        title: 'Divyaaa · The Sunshine',         objectPosition: 'center 22%', positionY: 22, scale: 1.05, objectFit: 'cover' },
  { id: 'spiral-heenuuu',    src: r2Photo('Heenuuu.jpg'),    alt: 'Heenuuu',        title: 'Heenuuu · The Spark & Heart',    objectPosition: 'center 20%', positionY: 20, scale: 1.05, objectFit: 'cover' },
  { id: 'spiral-puppy',      src: r2Photo('Puppy.jpg'),      alt: 'Puppy',          title: 'Puppy · The Chill Vibe',         objectPosition: 'center 28%', positionY: 28, scale: 1, objectFit: 'cover' },
  { id: 'spiral-afnaan',     src: r2Photo('affu.jpg'),       alt: 'Afnaaan',        title: 'Afnaan · The Energy Dynamo',     objectPosition: 'center 22%', positionY: 22, scale: 1, objectFit: 'cover' },
  { id: 'spiral-meshak',     src: r2Photo('meshak.jpg'),     alt: 'Meshak',         title: 'Meshak · The Silent Strength',   objectPosition: '62% 30%',    positionY: 30, scale: 1, objectFit: 'cover' },
  { id: 'spiral-samuel',     src: r2Photo('samuel.jpg'),     alt: 'Samuel',         title: 'Samuel · The Joyful Soul',       objectPosition: 'center 24%', positionY: 24, scale: 1, objectFit: 'cover' },
  { id: 'spiral-harshitha',  src: r2Photo('harshuuu.jpg'),   alt: 'Harshitha',      title: 'Harshitha · Radiant Sunshine',   objectPosition: 'center 24%', positionY: 24, scale: 1, objectFit: 'cover' },
  { id: 'spiral-maithreyan', src: r2Photo('maithreyan.jpg'), alt: 'Maithreyan',     title: 'Maithreyan · Tech & Vibe Pilot', objectPosition: 'center 35%', positionY: 35, scale: 1, objectFit: 'cover' },
  { id: 'spiral-gopika',     src: r2Photo('gopika.jpg'),     alt: 'Gopika',         title: 'Gopika · The Graceful Heart',    objectPosition: 'center 28%', positionY: 28, scale: 1, objectFit: 'cover' },
];

// ═══════════════════════════════════════════════════════════════════
//  BOOT: Seed all collections on first load if they don't exist
// ═══════════════════════════════════════════════════════════════════
let booted = false;
export async function bootR2Database(initialMemories = [], initialPosts = [], initialEvents = []) {
  if (booted) return;
  booted = true;

  // Auto-purge any stale Shyam Sundar from browser localStorage on start
  if (typeof window !== 'undefined') {
    try {
      const keys = ['squad_members', 'r2_members', 'r2_memories', 'r2_posts', 'r2_events', 'r2_journey', 'r2_spiral', 'r2_reels'];
      keys.forEach(k => {
        const d = localStorage.getItem(k);
        if (d && /shyam|sundar/i.test(d)) {
          try {
            const parsed = JSON.parse(d);
            if (Array.isArray(parsed)) {
              localStorage.setItem(k, JSON.stringify(parsed.filter(x => !isBannedEntity(x))));
            } else {
              localStorage.removeItem(k);
            }
          } catch {
            localStorage.removeItem(k);
          }
        }
      });
    } catch {}
  }

  const duo = ['maithreyan', 'gopika'];
  const arrangedMembers = [
    ...INITIAL_SQUAD_MEMBERS.filter(m => !duo.includes(m.id) && !isBannedEntity(m)),
    ...INITIAL_SQUAD_MEMBERS.filter(m => duo.includes(m.id) && !isBannedEntity(m)),
  ];

  await Promise.allSettled([
    seedCollection(COLLECTIONS.MEMBERS, arrangedMembers),
    seedCollection(COLLECTIONS.MEMORIES, initialMemories.filter(m => !isBannedEntity(m))),
    seedCollection(COLLECTIONS.REELS, INITIAL_REELS.filter(r => !isBannedEntity(r))),
    seedCollection(COLLECTIONS.POSTS, initialPosts.filter(p => !isBannedEntity(p))),
    seedCollection(COLLECTIONS.EVENTS, initialEvents.filter(e => !isBannedEntity(e))),
    seedCollection(COLLECTIONS.JOURNEY, INITIAL_JOURNEY_MILESTONES.filter(j => !isBannedEntity(j))),
    seedCollection(COLLECTIONS.SPIRAL, INITIAL_SPIRAL_ITEMS.filter(s => !isBannedEntity(s))),
    seedCollection(COLLECTIONS.MUSIC, INITIAL_MUSIC_TRACKS),
  ]);
}



// ═══════════════════════════════════════════════════════════════════
//  SUBSCRIBE HELPERS — React state sync
// ═══════════════════════════════════════════════════════════════════

const DUO_IDS = ['maithreyan', 'gopika'];

const arrangeWithDuoAtEnd = (list) => {
  if (!Array.isArray(list)) return [];
  const cleanList = list.filter(m => !isBannedEntity(m));
  return [
    ...cleanList.filter(m => !DUO_IDS.includes(m.id?.toLowerCase?.() || '')),
    ...DUO_IDS.map(id => cleanList.find(m => m.id === id)).filter(Boolean),
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

  // 3. Smart relaxed polling (revalidates on tab focus)
  return setupSmartPoll(refresh, 90000);
}

/**
 * Subscribe to live memories from R2.
 */
export function subscribeToMemoriesR2(callback) {
  const cacheKey = COLLECTIONS.MEMORIES;

  // Memories must strictly be PHOTOS ONLY and never contain Shyam Sundar
  const isCleanPhotoMemory = (m) => {
    if (!m || isBannedEntity(m)) return false;
    if (m.isReel) return false;
    if (m.mediaType === 'video') return false;
    if (typeof m.mediaUrl === 'string') {
      const u = m.mediaUrl.toLowerCase();
      if (u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.mov') || u.endsWith('.m4v')) return false;
    }
    return true;
  };

  const sanitizePeople = (m) => {
    if (!m) return m;
    let people = m.people;
    if (Array.isArray(people)) {
      people = people.filter(p => !isBannedEntity(p));
    } else if (typeof people === 'string' && isBannedEntity(people)) {
      people = people.split(',').map(s => s.trim()).filter(p => !isBannedEntity(p)).join(', ');
    }
    return { ...m, people };
  };

  const cached = cache.get(cacheKey);
  if (cached && Array.isArray(cached)) {
    callback(cached.filter(isCleanPhotoMemory).map(sanitizePeople));
  }

  const refresh = async () => {
    try {
      const data = await fetchFromCDN(cacheKey);
      if (Array.isArray(data)) {
        const cleanMemories = data.filter(isCleanPhotoMemory).map(sanitizePeople);
        cache.set(cacheKey, cleanMemories);
        callback(cleanMemories);
      }
    } catch (err) {
      console.warn('[R2 DB] Memories fetch failed:', err.message);
    }
  };

  refresh();
  return setupSmartPoll(refresh, 90000);
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
        const cleanData = data.filter(x => !isBannedEntity(x));
        cache.set(cacheKey, cleanData);
        callback(cleanData);
      }
    } catch (err) {
      console.warn('[R2 DB] Posts fetch failed:', err.message);
    }
  };

  refresh();
  return setupSmartPoll(refresh, 90000);
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
        const cleanData = data.filter(x => !isBannedEntity(x));
        cache.set(cacheKey, cleanData);
        callback(cleanData);
      }
    } catch (err) {
      console.warn('[R2 DB] Events fetch failed:', err.message);
    }
  };

  refresh();
  return setupSmartPoll(refresh, 90000);
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
    callback(cached.filter(x => !isBannedEntity(x)));
  } else {
    callback(INITIAL_JOURNEY_MILESTONES.filter(x => !isBannedEntity(x)));
  }

  const refresh = async () => {
    try {
      const data = await fetchFromCDN(cacheKey);
      if (Array.isArray(data) && data.length > 0) {
        const clean = data.filter(x => !isBannedEntity(x));
        cache.set(cacheKey, clean);
        callback(clean);
      }
    } catch (err) {
      console.warn('[R2 DB] Journey fetch warning:', err.message);
    }
  };

  refresh();
  return setupSmartPoll(refresh, 90000);
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
    callback(cached.filter(x => !isBannedEntity(x)));
  } else {
    callback(INITIAL_SPIRAL_ITEMS.filter(x => !isBannedEntity(x)));
  }

  const refresh = async () => {
    try {
      const data = await fetchFromCDN(cacheKey);
      if (Array.isArray(data) && data.length > 0) {
        const clean = data.filter(x => !isBannedEntity(x));
        cache.set(cacheKey, clean);
        callback(clean);
      }
    } catch (err) {
      console.warn('[R2 DB] Spiral fetch warning:', err.message);
    }
  };

  refresh();
  return setupSmartPoll(refresh, 90000);
}


export async function saveSpiralItemR2(spiralData) {
  const id = spiralData.id || `spiral-${Date.now()}`;
  let posY = 20;
  if (spiralData.positionY !== undefined) {
    posY = Number(spiralData.positionY);
  } else if (spiralData.objectPosition) {
    const match = spiralData.objectPosition.match(/(\d+)%/);
    if (match) posY = parseInt(match[1], 10);
  }

  const item = {
    id,
    src: spiralData.src,
    alt: spiralData.alt || 'Squad Memory',
    title: spiralData.title || spiralData.alt || 'Squad Moment',
    objectPosition: spiralData.objectPosition || `center ${posY}%`,
    positionY: posY,
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

export async function saveAllSpiralItemsR2(items) {
  if (!Array.isArray(items) || items.length === 0) return;
  const normalized = items.map((item, idx) => {
    let posY = 20;
    if (item.positionY !== undefined) {
      posY = Number(item.positionY);
    } else if (item.objectPosition) {
      const match = item.objectPosition.match(/(\d+)%/);
      if (match) posY = parseInt(match[1], 10);
    }
    return {
      ...item,
      id: item.id || `spiral-${idx + 1}`,
      objectPosition: item.objectPosition || `center ${posY}%`,
      positionY: posY,
      objectFit: item.objectFit || 'cover',
      scale: Number(item.scale) || 1,
      updatedAt: new Date().toISOString()
    };
  });

  // ⚡ Instant optimistic cache update
  cache.set(COLLECTIONS.SPIRAL, normalized);
  await callAPI({ collection: COLLECTIONS.SPIRAL, action: 'set', data: normalized });
  return normalized;
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
    id: "reel-user-01",
    title: "Ganggg Intro",
    category: "Squad Vibe",
    date: "First Year",
    location: "Campus Common & Hallway",
    mediaUrl: "https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev/memories/2026-09/1788462046777-ks3ok7_ganggg_intro.mp4",
    mediaType: "video",
    description: "The squad stepping into the chapter together — pure unfiltered gang energy.",
    isReel: true
  },
  {
    id: "reel-user-02",
    title: "First to Three Year Journey",
    category: "Milestone",
    date: "Years 1 to 3",
    location: "Squad Evolution",
    mediaUrl: "https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev/reels/2026-09/1788462357125-3m258x_First_to_three_year.mp4",
    mediaType: "video",
    description: "From strangers in the classroom to an unbreakable family — our 3-year transformation.",
    isReel: true
  },
  {
    id: "reel-user-03",
    title: "Life & Movie Day Out",
    category: "Adventures",
    date: "Celebration",
    location: "Movie Theater & Hangout",
    mediaUrl: "https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev/reels/2026-09/1788462187886-54d1t9_life.mp4",
    mediaType: "video",
    description: "Weekend theater runs, laughter, popcorn, and memories made for a lifetime.",
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
  const cleanInitial = INITIAL_REELS.filter(r => !isBannedEntity(r));

  const cached = cache.get(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    const videoReels = cached.filter(isVideoMedia).filter(r => !isBannedEntity(r));
    callback(videoReels.length > 0 ? videoReels : cleanInitial);
  } else {
    callback(cleanInitial);
  }

  const refresh = async () => {
    try {
      const data = await fetchFromCDN(cacheKey);
      if (Array.isArray(data) && data.length > 0) {
        const videoReels = data.filter(isVideoMedia).filter(r => !isBannedEntity(r));
        const finalReels = videoReels.length > 0 ? videoReels : cleanInitial;
        cache.set(cacheKey, finalReels);
        callback(finalReels);
      }
    } catch (err) {
      console.warn('[R2 DB] Reels fetch warning:', err.message);
    }
  };

  refresh();
  return setupSmartPoll(refresh, 90000);
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

// ═══════════════════════════════════════════════════════════════════
//  MUSIC PLAYLIST COLLECTION — Cloudflare R2 Live Audio Database
// ═══════════════════════════════════════════════════════════════════

export const INITIAL_MUSIC_TRACKS = [
  {
    id: 'track-1',
    title: 'Sonthamulla Vaazhkai',
    titleTamil: 'சொந்தமுள்ள வாழ்க்கை',
    artist: 'Hiphop Tamizha • Natpe Thunai Anthem',
    description: 'The soul, laughter and official anthem of our lifelong friendship sanctuary.',
    audioUrl: '/audio/sonthamulla-vaazhkai.m4a',
    coverPhoto: r2Photo('farish.jpg'),
    duration: '4:18',
    isDefault: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

export function subscribeToMusicR2(callback) {
  const cacheKey = COLLECTIONS.MUSIC;
  const cached = cache.get(cacheKey);
  if (cached && cached.length > 0) {
    callback(cached.filter(x => !isBannedEntity(x)));
  } else {
    callback(INITIAL_MUSIC_TRACKS);
  }

  const refresh = async () => {
    try {
      const data = await fetchFromCDN(cacheKey);
      if (Array.isArray(data) && data.length > 0) {
        const clean = data.filter(x => !isBannedEntity(x));
        cache.set(cacheKey, clean);
        callback(clean);
      }
    } catch (err) {
      console.warn('[R2 DB] Music fetch warning:', err.message);
    }
  };

  refresh();
  return setupSmartPoll(refresh, 60000);
}

export async function saveMusicTrackR2(trackData) {
  const id = trackData.id || `track-${Date.now()}`;
  const track = {
    id,
    title: trackData.title || 'Untitled Track',
    titleTamil: trackData.titleTamil || '',
    artist: trackData.artist || 'Natpe Thunai Squad',
    description: trackData.description || '',
    audioUrl: trackData.audioUrl || '',
    coverPhoto: trackData.coverPhoto || r2Photo('farish.jpg'),
    duration: trackData.duration || '3:30',
    isDefault: Boolean(trackData.isDefault),
    updatedAt: new Date().toISOString()
  };

  const current = cache.get(COLLECTIONS.MUSIC) || INITIAL_MUSIC_TRACKS;
  const existingIdx = current.findIndex(t => t.id === track.id);
  const updated = existingIdx >= 0
    ? current.map(t => t.id === track.id ? track : (track.isDefault ? { ...t, isDefault: false } : t))
    : (track.isDefault ? [track, ...current.map(t => ({ ...t, isDefault: false }))] : [track, ...current]);

  // ⚡ Instant optimistic cache update
  cache.set(COLLECTIONS.MUSIC, updated);
  await callAPI({ collection: COLLECTIONS.MUSIC, action: 'upsert', item: track });
  return track;
}

export async function deleteMusicTrackR2(trackId) {
  const current = cache.get(COLLECTIONS.MUSIC) || INITIAL_MUSIC_TRACKS;
  const updated = current.filter(t => t.id !== trackId);
  // ⚡ Instant optimistic cache update
  cache.set(COLLECTIONS.MUSIC, updated.length > 0 ? updated : INITIAL_MUSIC_TRACKS);
  await callAPI({ collection: COLLECTIONS.MUSIC, action: 'delete', id: trackId });
}

// Force refresh cache for a specific collection (call after admin write)
export function invalidateCache(collection) {
  delete mem[collection];
}


