// ═══════════════════════════════════════════════════════════════════
//  DATA SERVICE — REAL PERSISTENCE WITH FIRESTORE & LOCAL FALLBACK
// ═══════════════════════════════════════════════════════════════════

import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

const STORAGE_KEYS = {
  MEMORIES: 'natpethunai_memories_v2',
  POSTS: 'natpethunai_posts_v2',
  EVENTS: 'natpethunai_events_v2'
};

// ── Authentic Squad Members ──
export const SQUAD_MEMBERS = [
  {
    id: "grace",
    name: "Grace",
    nickname: "Gracxx",
    role: "The Spark ✨",
    instagram: "https://www.instagram.com/_.gracxx._",
    photo: "/photos/friend1.jpg",
    bio: "The one who lights up every room she walks into. Bringing unconditional energy, hearty laughs, and unforgettable road trip moments.",
    quote: "Life is too short not to laugh until our stomachs hurt.",
    journeyMilestones: [
      { title: "The First Spark", desc: "Started the late-night tea talks that founded our circle." },
      { title: "Spontaneous Adventures", desc: "Turned every random road trip into an unforgettable memory." },
      { title: "Unshakable Support", desc: "Celebrated shared wins and lifted everyone's spirits." },
      { title: "Eternal Energy", desc: "Still the spark that keeps our laughter alive today." }
    ]
  },
  {
    id: "heenuuu",
    name: "Heenuuu",
    nickname: "Hennesy",
    role: "The Heart 💖",
    instagram: "https://www.instagram.com/hennesy260",
    photo: "/photos/friend2.jpg",
    bio: "The emotional backbone of the squad. Always there with genuine advice, late night calls, and warmest support through every college milestone.",
    quote: "Real ones stay, no matter the distance or time.",
    journeyMilestones: [
      { title: "The Open Arms", desc: "Welcomed everyone with genuine warmth from day one." },
      { title: "Midnight Deep Talks", desc: "Hours of listening, comforting, and heartfelt guidance." },
      { title: "Unconditional Anchor", desc: "The calm presence that helped the squad navigate any storm." },
      { title: "Forever Golden Heart", desc: "The keeper of our deepest secrets and warmest hugs." }
    ]
  },
  {
    id: "divyaaa",
    name: "Divyaaa",
    nickname: "Twinkle Cheek",
    role: "The Sunshine ☀️",
    instagram: "https://www.instagram.com/divya_twinkle_cheek",
    photo: "/photos/friend3.jpg",
    bio: "Pure sunshine energy and an infectious smile. Turning every ordinary college afternoon into an unforgettable squad celebration.",
    quote: "Smile big, laugh louder, treasure each day.",
    journeyMilestones: [
      { title: "Radiant Smiles", desc: "Lit up every hallway with infectious positivity." },
      { title: "Squad Festivities", desc: "Made every birthday celebration an epic memory." },
      { title: "Unfiltered Joy", desc: "The photographer behind our sweetest candid memories." },
      { title: "Endless Sunshine", desc: "Proof that true friendship grows brighter with time." }
    ]
  },
  {
    id: "puppy",
    name: "Puppy",
    nickname: "Garnett",
    role: "The Vibe 🎯",
    instagram: "https://www.instagram.com/garnett.__.12",
    photo: "/photos/friend4.jpg",
    bio: "The calm soul in our storm. Keeps it 100% authentic, brings chill vibes, and stands by everyone unconditionally.",
    quote: "Good vibes only — everything else can wait.",
    journeyMilestones: [
      { title: "The Real Foundation", desc: "Brought grounded authenticity and calm to our group." },
      { title: "Chill Sanctuary", desc: "The safe space where everyone could be their true selves." },
      { title: "Loyalty In Action", desc: "Never hesitated to show up whenever a friend called." },
      { title: "Unbreakable Pillar", desc: "Anchoring our shared bond with timeless loyalty." }
    ]
  }
];

// Initial real memories anchored to our timeless journey
const INITIAL_MEMORIES = [
  {
    id: "mem-01",
    year: "Chapter 1",
    title: "Where Our Story Started",
    description: "The very first day our squad bonded over chai and shared goals. Nobody knew back then that this ordinary gathering would turn into a lifelong bond.",
    date: "August 14",
    location: "Campus Common & Café",
    mediaUrl: "/photos/friend1.jpg",
    mediaType: "image",
    people: ["Grace", "Puppy", "Heenuuu", "Divyaaa"],
    category: "Milestone",
    reactions: { "❤️": 12, "✨": 8, "🫂": 10, "😂": 4 },
    comments: [
      { id: "c1", author: "Grace", text: "I still remember how we couldn't stop laughing at that silly joke!", time: "August" }
    ]
  },
  {
    id: "mem-02",
    year: "Chapter 2",
    title: "Late Night Talks & Spontaneous Trips",
    description: "The semester that tested everyone, but late-night video calls and midnight chai runs kept our spirits unshakeable.",
    date: "April 22",
    location: "Midnight Highway Drive",
    mediaUrl: "/photos/friend2.jpg",
    mediaType: "image",
    people: ["Heenuuu", "Divyaaa", "Grace"],
    category: "Adventures",
    reactions: { "❤️": 15, "✨": 9, "🫂": 14, "😂": 7 },
    comments: [
      { id: "c2", author: "Heenuuu", text: "Best memory of second year hands down!", time: "April" }
    ]
  },
  {
    id: "mem-03",
    year: "Chapter 3",
    title: "Unforgettable Milestone Celebration",
    description: "Celebrating shared wins, project submissions, and overcoming challenges together. Friendship proved to be our greatest support system.",
    date: "November 18",
    location: "Beachside Gathering",
    mediaUrl: "/photos/friend3.jpg",
    mediaType: "image",
    people: ["Divyaaa", "Puppy", "Grace", "Heenuuu"],
    category: "Celebration",
    reactions: { "❤️": 18, "✨": 12, "🫂": 16, "😂": 5 },
    comments: [
      { id: "c3", author: "Divyaaa", text: "Look at all our genuine smiles here!", time: "November" }
    ]
  },
  {
    id: "mem-04",
    year: "Chapter 4",
    title: "Still Here. Still Unbreakable.",
    description: "Through every change of life, the circle stands solid. More than friends — family by choice.",
    date: "Always & Forever",
    location: "Squad Sanctuary",
    mediaUrl: "/photos/friend4.jpg",
    mediaType: "image",
    people: ["Puppy", "Grace", "Heenuuu", "Divyaaa"],
    category: "Daily Laughs",
    reactions: { "❤️": 24, "✨": 19, "🫂": 22, "😂": 9 },
    comments: [
      { id: "c4", author: "Puppy", text: "Natpe Thunai forever. Always and infinity.", time: "Recent" }
    ]
  }
];

const INITIAL_POSTS = [
  {
    id: "post-manifesto",
    authorName: "Natpe Thunai Squad",
    authorPhoto: "/photos/friend1.jpg",
    content: "“First year la start aana namma group, ippo varaikum ivlo strong ah irukum nu appo namma yaarume nenachiruka maatom. Serndhu sapta moments, cooking pannadhu, dance aadinadhu, movies, birthday bashes, random suthinadhu nu neraya memories! Sila neram 'pothum da, indha group ah vittudalam' nu feel pannirupom 😂 but still, yaarum yaaraiyum vittu kudukkala. Namma friendship perfect illa, aana romba real. ❤️ Endha situation vandhalum, ippadiye last varaikum strong ah irukanum! ❤️🫂♾️”",
    category: "Story",
    likes: 42,
    createdAt: "Featured Manifesto",
    comments: [
      { id: "cm1", author: "Puppy", text: "100% true! Natpe Thunai forever ♾️" },
      { id: "cm2", author: "Heenuuu", text: "Namma friendship eppavum special dhan 💖" }
    ]
  },
  {
    id: "post-1",
    authorName: "Grace",
    authorPhoto: "/photos/friend1.jpg",
    content: "Reminder that our grand reunion planning is on! Drop your favorite memories in the timeline so we can compile our complete memory reel.",
    category: "Announcement",
    likes: 8,
    createdAt: "2 days ago",
    comments: [
      { id: "pc1", author: "Puppy", text: "Already looking forward to it!" }
    ]
  },
  {
    id: "post-2",
    authorName: "Divyaaa",
    authorPhoto: "/photos/friend3.jpg",
    content: "Going through our old memories right now... we have changed so much yet our banter is literally identical 😂💖",
    category: "Moment",
    likes: 11,
    createdAt: "5 days ago",
    comments: []
  }
];

const INITIAL_EVENTS = [
  {
    id: "evt-1",
    title: "Annual Squad Grand Reunion",
    date: "September 15",
    time: "6:00 PM",
    location: "City Hilltop Viewpoint",
    description: "Our landmark gathering celebrating our timeless friendship, photoshoots, and reminiscing our shared journey.",
    category: "Reunion",
    rsvpCount: 4,
    userRsvpd: true
  },
  {
    id: "evt-2",
    title: "Memory Reel Screening Night",
    date: "October 02, 2026",
    time: "8:30 PM",
    location: "Discord / Private Screen",
    description: "Streaming our compiled digital memory reel with all video clips and road trip moments.",
    category: "Celebration",
    rsvpCount: 4,
    userRsvpd: false
  }
];

// Helper: load from localStorage
const getLocal = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

// Helper: save to localStorage
const setLocal = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn("Storage write error:", err);
  }
};

// ═══════════════════════════════════════════════════════════════════
//  MEMORIES API
// ═══════════════════════════════════════════════════════════════════

export const getStoredMemories = () => {
  return getLocal(STORAGE_KEYS.MEMORIES, INITIAL_MEMORIES);
};

export const subscribeToMemories = (callback) => {
  // Start with local copy instantly for zero-latency paint
  const local = getStoredMemories();
  callback(local);

  try {
    const q = query(collection(db, 'natpe-thunai-memories'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreMemories = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setLocal(STORAGE_KEYS.MEMORIES, firestoreMemories);
        callback(firestoreMemories);
      }
    }, (error) => {
      // Fallback silently to local cache if Firestore permissions or offline
      console.info("Using local memory storage:", error.message);
    });
  } catch {
    return () => {};
  }
};

export const saveMemory = async (memory) => {
  const newMemory = {
    id: `mem-${Date.now()}`,
    year: memory.year || "Chapter 4",
    title: memory.title,
    description: memory.description || "",
    date: memory.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    location: memory.location || "Squad Circle",
    mediaUrl: memory.mediaUrl || "/photos/friend1.jpg",
    mediaType: memory.mediaType || "image",
    people: memory.people && memory.people.length ? memory.people : ["The Squad"],
    category: memory.category || "Moment",
    reactions: { "❤️": 1, "✨": 0, "🫂": 0, "😂": 0 },
    comments: [],
    createdAt: new Date().toISOString()
  };

  // Save to local cache
  const existing = getStoredMemories();
  const updated = [newMemory, ...existing];
  setLocal(STORAGE_KEYS.MEMORIES, updated);

  // Sync to Firestore if available
  try {
    await addDoc(collection(db, 'natpe-thunai-memories'), {
      ...newMemory,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.info("Synced to local storage:", err.message);
  }

  return newMemory;
};

export const reactToMemory = (memoryId, emoji) => {
  const memories = getStoredMemories();
  const updated = memories.map(m => {
    if (m.id === memoryId) {
      const reactions = { ...(m.reactions || {}) };
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      return { ...m, reactions };
    }
    return m;
  });
  setLocal(STORAGE_KEYS.MEMORIES, updated);
  return updated;
};

export const addCommentToMemory = (memoryId, authorName, commentText) => {
  if (!commentText.trim()) return;
  const memories = getStoredMemories();
  const updated = memories.map(m => {
    if (m.id === memoryId) {
      const comments = [
        ...(m.comments || []),
        { id: `c-${Date.now()}`, author: authorName || "Squad Mate", text: commentText.trim(), time: "Just now" }
      ];
      return { ...m, comments };
    }
    return m;
  });
  setLocal(STORAGE_KEYS.MEMORIES, updated);
  return updated;
};

// ═══════════════════════════════════════════════════════════════════
//  COMMUNITY POSTS API
// ═══════════════════════════════════════════════════════════════════

export const getStoredPosts = () => {
  return getLocal(STORAGE_KEYS.POSTS, INITIAL_POSTS);
};

export const savePost = async (postData, user) => {
  const newPost = {
    id: `post-${Date.now()}`,
    authorName: user?.displayName || "Squad Member",
    authorPhoto: user?.photoURL || "/photos/friend1.jpg",
    content: postData.content,
    mediaUrl: postData.mediaUrl || null,
    category: postData.category || "Moment",
    likes: 1,
    createdAt: "Just now",
    comments: []
  };

  const existing = getStoredPosts();
  const updated = [newPost, ...existing];
  setLocal(STORAGE_KEYS.POSTS, updated);

  try {
    await addDoc(collection(db, 'natpe-thunai-posts'), {
      ...newPost,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.info("Saved post locally:", err.message);
  }

  return updated;
};

export const likePost = (postId) => {
  const posts = getStoredPosts();
  const updated = posts.map(p => {
    if (p.id === postId) {
      return { ...p, likes: (p.likes || 0) + 1 };
    }
    return p;
  });
  setLocal(STORAGE_KEYS.POSTS, updated);
  return updated;
};

// ═══════════════════════════════════════════════════════════════════
//  EVENTS API
// ═══════════════════════════════════════════════════════════════════

export const getStoredEvents = () => {
  return getLocal(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
};

export const saveEvent = (eventData) => {
  const newEvent = {
    id: `evt-${Date.now()}`,
    title: eventData.title,
    date: eventData.date,
    time: eventData.time || "7:00 PM",
    location: eventData.location || "Squad Circle",
    description: eventData.description || "",
    category: eventData.category || "Celebration",
    rsvpCount: 1,
    userRsvpd: true
  };
  const existing = getStoredEvents();
  const updated = [newEvent, ...existing];
  setLocal(STORAGE_KEYS.EVENTS, updated);
  return updated;
};

export const toggleEventRsvp = (eventId) => {
  const events = getStoredEvents();
  const updated = events.map(e => {
    if (e.id === eventId) {
      const userRsvpd = !e.userRsvpd;
      const rsvpCount = userRsvpd ? (e.rsvpCount || 0) + 1 : Math.max(0, (e.rsvpCount || 1) - 1);
      return { ...e, userRsvpd, rsvpCount };
    }
    return e;
  });
  setLocal(STORAGE_KEYS.EVENTS, updated);
  return updated;
};
