// ═══════════════════════════════════════════════════════════════════
//  DATA SERVICE — REAL PERSISTENCE WITH FIRESTORE & LOCAL FALLBACK
// ═══════════════════════════════════════════════════════════════════

import { db } from '../firebase';
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { deleteFromR2 } from './r2StorageService';

const STORAGE_KEYS = {
  MEMBERS: 'natpethunai_members_v2',
  MEMORIES: 'natpethunai_memories_v2',
  POSTS: 'natpethunai_posts_v2',
  EVENTS: 'natpethunai_events_v2'
};

// ── Authentic 15-Member Gang Roster ──
export const INITIAL_SQUAD_MEMBERS = [
  {
    id: "grace",
    name: "Grace",
    nickname: "Gracxx",
    role: "The Spark ✨",
    category: "core",
    instagram: "https://www.instagram.com/_.gracxx._",
    photo: "/photos/Gracee.jpg",
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
    category: "core",
    instagram: "https://www.instagram.com/hennesy260",
    photo: "/photos/Heenuuu.jpg",
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
    category: "core",
    instagram: "https://www.instagram.com/divya_twinkle_cheek",
    photo: "/photos/Divyaa.jpg",
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
    category: "core",
    instagram: "https://www.instagram.com/garnett.__.12",
    photo: "/photos/Puppy.jpg",
    bio: "The calm soul in our storm. Keeps it 100% authentic, brings chill vibes, and stands by everyone unconditionally.",
    quote: "Good vibes only — everything else can wait.",
    journeyMilestones: [
      { title: "The Real Foundation", desc: "Brought grounded authenticity and calm to our group." },
      { title: "Chill Sanctuary", desc: "The safe space where everyone could be their true selves." },
      { title: "Loyalty In Action", desc: "Never hesitated to show up whenever a friend called." },
      { title: "Unbreakable Pillar", desc: "Anchoring our shared bond with timeless loyalty." }
    ]
  },
  {
    id: "farish",
    name: "Farish Sharif",
    nickname: "fairs",
    role: "The Mastermind 🧠",
    category: "core",
    instagram: "https://www.instagram.com/fairsh_sharif",
    photo: "/photos/farish.jpg",
    bio: "The planner behind every squad reunion and last-minute travel plan. Keeps everyone organized even in the midst of pure chaos.",
    quote: "Plan A never works, that's why the alphabet has 25 more letters.",
    journeyMilestones: [
      { title: "The Master Plan", desc: "Coordinated the very first squad hill-station road trip." },
      { title: "Reliable Support", desc: "Always has a solution before a problem even happens." }
    ]
  },
  {
    id: "kafil",
    name: "Kafil",
    nickname: "Anu",
    role: "The Creative Soul 🎨",
    category: "creators",
    avatarGradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
    bio: "The aesthetic eye of the gang. Capturing candid laughs, curating squad playlists, and designing surprise birthday cakes.",
    quote: "Every memory with namma gang deserves its own soundtrack.",
    journeyMilestones: [
      { title: "Aesthetic Vibes", desc: "Transformed our regular hangout spots into pure cinematic frames." },
      { title: "Heartfelt Surprises", desc: "Crafted personalized keepsakes for every squad milestone." }
    ]
  },
  {
    id: "haniya",
    name: "Haniya",
    nickname: "hanuuuu",
    role: "The Chill Sloth 🦥",
    category: "vibe",
    avatarGradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    bio: "The undisputed chill master of the squad. Certified queen of cozy naps, relaxed vibes, and turning any stressful day into pure peace.",
    quote: "Why stress when you can sleep? Good vibes and cozy dreams always. 😴✨",
    journeyMilestones: [
      { title: "Peak Cozy Vibes", desc: "Master of effortless relaxation and turning chaos into calm." },
      { title: "Late Night Banter", desc: "Wakes up right on time for the best late-night laughs." }
    ]
  },
  {
    id: "jaffreen",
    name: "Jaffreen MV",
    nickname: "jaffuuuu",
    role: "The Sweet Heart 🌸",
    category: "core",
    avatarGradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
    bio: "Pure warmth and genuine sweetness. Always checking in on everyone, sharing the sweetest smiles, and bringing endless harmony to our squad.",
    quote: "Smile always, spread kindness everywhere, and love your squad unconditionally. 💖",
    journeyMilestones: [
      { title: "Gentle Anchor", desc: "Brought genuine warmth and care to every single friend." },
      { title: "Golden Smiles", desc: "Cheered up the whole gang with her gentle positivity." }
    ]
  },
  {
    id: "afnaan",
    name: "Afnaaan",
    nickname: "affuuuuu",
    role: "The Energy Dynamo ⚡",
    category: "chaos",
    avatarGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    bio: "The powerhouse of unstoppable energy. Whenever Afnan joins the room, laughter multiplies by 100x and spontaneous plans take off instantly.",
    quote: "Life is too short for boring days — let's bring the hype! 🔥",
    journeyMilestones: [
      { title: "The Hype Engine", desc: "Energized every gathering with infectious excitement." },
      { title: "Spontaneous Adventures", desc: "Turned quiet hangouts into legendary laugh riots." }
    ]
  },
  {
    id: "meshak",
    name: "Meshak",
    nickname: "meshuuu",
    role: "The Silent Strength 🛡️",
    category: "brains",
    avatarGradient: "linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)",
    bio: "A reliable brother who always has your back. Calm in any crisis, fiercely loyal, and bringing unmatched warmth to our squad circle.",
    quote: "Actions speak louder than words, but namma friendship speaks for itself. 👊✨",
    journeyMilestones: [
      { title: "Steady Shield", desc: "Always standing up for every friend without hesitation." },
      { title: "Chill Evenings", desc: "Anchor of our most memorable campus and canteen chats." }
    ]
  },
  {
    id: "samual",
    name: "Samual",
    nickname: "samual",
    role: "The Joyful Soul 🌟",
    category: "chaos",
    avatarGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    bio: "Brings pure smiles and positive vibes everywhere. Turning any mundane study session or drive into an unforgettable laughter riot.",
    quote: "Count the memories, not the days. Let's make every second count! 😄🔥",
    journeyMilestones: [
      { title: "Laughter Booster", desc: "Never failed to turn a bad day into a laughing memory." },
      { title: "Spontaneous Squad Runs", desc: "Always ready at a minute's notice for any group adventure." }
    ]
  },
  {
    id: "maithreyan",
    name: "Maithreyan",
    nickname: "maithuu",
    role: "The Tech & Vibe Pilot 🚀",
    category: "creators",
    avatarGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    bio: "The visionary brain and creator spirit. From building digital wonders to organizing memorable road trips, Maithuu makes big things happen.",
    quote: "Code can build apps, but loyalty builds forever friendships. 💻❤️",
    journeyMilestones: [
      { title: "The Architect", desc: "Co-crafted digital memories and squad sanctuary projects." },
      { title: "Unstoppable Drive", desc: "Always pushing the squad toward shared milestones and dreams." }
    ]
  },
  {
    id: "harshitha",
    name: "Harshitha",
    nickname: "harshuuuu",
    role: "The Radiant Sunshine 🌻",
    category: "core",
    avatarGradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
    bio: "Spreading genuine kindness, joyful energy, and endless sparkle. The sister who listens with her whole heart and lights up our circle.",
    quote: "In a world of noise, true friends are the sweetest melody. 🌸💖",
    journeyMilestones: [
      { title: "Heart of Gold", desc: "Always thoughtful, compassionate, and cheering on every friend." },
      { title: "Endless Smiles", desc: "Lit up every squad celebration with contagious positivity." }
    ]
  },
  {
    id: "shyam",
    name: "Shyam",
    nickname: "Shyam",
    role: "The Chill Anchor ⚡",
    category: "vibe",
    avatarGradient: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
    bio: "Brings unbeatable positive energy, candid humor, and constant loyalty. Always ready for a good conversation, spontaneous drive, or late-night laugh.",
    quote: "True friends make the good times better and the hard times easier. 🫂♾️",
    journeyMilestones: [
      { title: "True Companion", desc: "Always showing up with good vibes and unwavering support." },
      { title: "Unfiltered Laughter", desc: "Co-creator of our most legendary inside jokes and stories." }
    ]
  }
];

export const SQUAD_MEMBERS = INITIAL_SQUAD_MEMBERS;

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
//  SQUAD MEMBERS API (15+ GANG MEMBERS)
// ═══════════════════════════════════════════════════════════════════

const OLD_PLACEHOLDER_IDS = new Set(["siddharth", "pooja", "rohan", "meera", "arjun", "sneha", "vikram", "harini", "karthik"]);

export const getStoredMembers = () => {
  const local = getLocal(STORAGE_KEYS.MEMBERS, null);
  if (!local || !Array.isArray(local) || local.length === 0) {
    setLocal(STORAGE_KEYS.MEMBERS, INITIAL_SQUAD_MEMBERS);
    return INITIAL_SQUAD_MEMBERS;
  }

  // Merge code-defined squad roster (updating photos/fields from code) with any custom entries
  const synced = INITIAL_SQUAD_MEMBERS.map(initialMember => {
    const existing = local.find(m => m.id === initialMember.id || m.name?.toLowerCase().trim() === initialMember.name?.toLowerCase().trim());
    return existing ? { ...existing, ...initialMember, photo: initialMember.photo || existing.photo } : initialMember;
  });

  // Keep any user-added custom members from UI (excluding old placeholder names)
  const customMembers = local.filter(m =>
    !OLD_PLACEHOLDER_IDS.has(m.id) &&
    !INITIAL_SQUAD_MEMBERS.some(im => im.id === m.id || im.name?.toLowerCase().trim() === m.name?.toLowerCase().trim())
  );
  const fullList = [...synced, ...customMembers];
  setLocal(STORAGE_KEYS.MEMBERS, fullList);
  return fullList;
};

export const saveSquadMember = (memberData) => {
  const existing = getStoredMembers();
  const newMember = {
    id: memberData.id || `member-${Date.now()}`,
    name: memberData.name.trim(),
    nickname: memberData.nickname?.trim() || memberData.name.trim(),
    role: memberData.role?.trim() || "Squad Member 🌟",
    category: memberData.category || "vibe",
    instagram: memberData.instagram?.trim() || "",
    photo: memberData.photo || "/photos/friend1.jpg",
    bio: memberData.bio?.trim() || "Proud member of namma Natpe Thunai sanctuary.",
    quote: memberData.quote?.trim() || "Natpe Thunai forever and infinity.",
    journeyMilestones: memberData.journeyMilestones || [
      { title: "Joined the Gang", desc: "Added endless laughter and energy to our lifelong bond." }
    ]
  };

  const updated = [newMember, ...existing];
  setLocal(STORAGE_KEYS.MEMBERS, updated);
  return updated;
};

export const updateSquadMember = (memberId, updatedFields) => {
  const existing = getStoredMembers();
  const updated = existing.map(m => {
    if (m.id === memberId) {
      return { ...m, ...updatedFields };
    }
    return m;
  });
  setLocal(STORAGE_KEYS.MEMBERS, updated);
  return updated;
};

export const deleteSquadMember = (memberId) => {
  const existing = getStoredMembers();
  const updated = existing.filter(m => m.id !== memberId);
  setLocal(STORAGE_KEYS.MEMBERS, updated);
  return updated;
};

// ═══════════════════════════════════════════════════════════════════
//  INITIAL RICH SQUAD MEMORIES (Diverse group events & multi-tags)
// ═══════════════════════════════════════════════════════════════════

const INITIAL_MEMORIES = [
  {
    id: "mem-01",
    year: "Chapter 1",
    title: "Where Our Story Started",
    description: "The very first day our squad bonded over chai and shared goals at the canteen. Nobody knew back then that this ordinary gathering would turn into a lifelong bond.",
    date: "August 14",
    location: "Campus Common & Café",
    mediaUrl: "/photos/friend1.jpg",
    mediaType: "image",
    people: ["Grace", "Puppy", "Heenuuu", "Divyaaa", "Kavin", "Sid"],
    category: "Milestone",
    reactions: { "❤️": 28, "✨": 18, "🫂": 25, "😂": 12 },
    comments: [
      { id: "c1", author: "Grace", text: "I still remember how we couldn't stop laughing at that silly joke!", time: "August" },
      { id: "c2", author: "Sid", text: "That tea was 5 rupees but the memories are priceless ❤️", time: "August" }
    ]
  },
  {
    id: "mem-02",
    year: "Chapter 2",
    title: "Late Night Talks & Spontaneous Highway Trips",
    description: "The semester that tested everyone, but midnight chai runs, high-volume music in Sid's car, and late-night calls kept our spirits unshakeable.",
    date: "April 22",
    location: "Midnight Highway Drive",
    mediaUrl: "/photos/friend2.jpg",
    mediaType: "image",
    people: ["Heenuuu", "Divyaaa", "Grace", "Sid", "Rohan", "Pooja"],
    category: "Adventures",
    reactions: { "❤️": 35, "✨": 21, "🫂": 29, "😂": 16 },
    comments: [
      { id: "c3", author: "Heenuuu", text: "Best memory of second year hands down!", time: "April" },
      { id: "c4", author: "Rohan", text: "And that playlist is still unskippable 🔥", time: "April" }
    ]
  },
  {
    id: "mem-03",
    year: "Chapter 3",
    title: "Unforgettable Milestone Celebration",
    description: "Celebrating shared wins, project submissions, and overcoming challenges together. Friendship proved to be our greatest sanctuary and strength.",
    date: "November 18",
    location: "Beachside Gathering",
    mediaUrl: "/photos/friend3.jpg",
    mediaType: "image",
    people: ["Divyaaa", "Puppy", "Grace", "Heenuuu", "Ananya", "Meera", "Arjun"],
    category: "Celebration",
    reactions: { "❤️": 42, "✨": 30, "🫂": 38, "😂": 14 },
    comments: [
      { id: "c5", author: "Divyaaa", text: "Look at all our genuine smiles here!", time: "November" },
      { id: "c6", author: "Ananya", text: "We took over 200 candid photos that evening!", time: "November" }
    ]
  },
  {
    id: "mem-04",
    year: "Chapter 4",
    title: "Still Here. Still 15 Strong.",
    description: "Through every turn of life, busy careers, and different cities, the circle stands solid. More than friends — family by choice.",
    date: "Always & Forever",
    location: "Squad Sanctuary",
    mediaUrl: "/photos/friend4.jpg",
    mediaType: "image",
    people: ["Puppy", "Grace", "Heenuuu", "Divyaaa", "Vikram", "Sneha", "Harini", "KK"],
    category: "Daily Laughs",
    reactions: { "❤️": 58, "✨": 45, "🫂": 50, "😂": 27 },
    comments: [
      { id: "c7", author: "Puppy", text: "Natpe Thunai forever. Always and infinity.", time: "Recent" },
      { id: "c8", author: "KK", text: "15 members and infinite memories to go ♾️❤️", time: "Recent" }
    ]
  }
];

const INITIAL_POSTS = [
  {
    id: "post-manifesto",
    authorName: "Natpe Thunai Squad (15 Strong)",
    authorPhoto: "/photos/friend1.jpg",
    content: "“First year la start aana namma 15-member gang, ippo varaikum ivlo strong ah irukum nu appo namma yaarume nenachiruka maatom. Serndhu sapta moments, cooking pannadhu, dance aadinadhu, movies, birthday bashes, random suthinadhu nu neraya memories! Sila neram 'pothum da, indha group ah vittudalam' nu feel pannirupom 😂 but still, yaarum yaaraiyum vittu kudukkala. Namma friendship perfect illa, aana romba real. ❤️ Endha situation vandhalum, ippadiye last varaikum strong ah irukanum! ❤️🫂♾️”",
    category: "Story",
    likes: 54,
    createdAt: "Featured Manifesto",
    comments: [
      { id: "cm1", author: "Puppy", text: "100% true! Natpe Thunai forever ♾️" },
      { id: "cm2", author: "Heenuuu", text: "Namma friendship eppavum special dhan 💖" },
      { id: "cm3", author: "Kavin", text: "Proud of all 15 of us! Next trip planning soon!" }
    ]
  },
  {
    id: "post-1",
    authorName: "Grace",
    authorPhoto: "/photos/friend1.jpg",
    content: "Reminder that our 15-member grand reunion planning is on! Drop your favorite memories in the timeline so we can compile our complete memory reel.",
    category: "Announcement",
    likes: 19,
    createdAt: "2 days ago",
    comments: [
      { id: "pc1", author: "Puppy", text: "Already looking forward to it!" },
      { id: "pc2", author: "Sid", text: "Car is serviced and ready to roll 🚗" }
    ]
  },
  {
    id: "post-2",
    authorName: "Divyaaa",
    authorPhoto: "/photos/friend3.jpg",
    content: "Going through our old memories right now... 15 of us have changed so much yet our banter is literally identical 😂💖",
    category: "Moment",
    likes: 24,
    createdAt: "5 days ago",
    comments: [
      { id: "pc3", author: "Sneha", text: "I still have the photos from day 1!" }
    ]
  }
];

const INITIAL_EVENTS = [
  {
    id: "evt-1",
    title: "Annual 15-Member Squad Grand Reunion",
    date: "September 15",
    time: "6:00 PM",
    location: "City Hilltop Viewpoint",
    description: "Our landmark gathering celebrating our timeless 15-member friendship, photoshoots, and reminiscing our shared journey.",
    category: "Reunion",
    rsvpCount: 15,
    userRsvpd: true
  },
  {
    id: "evt-2",
    title: "Squad Memory Reel Screening Night",
    date: "October 02, 2026",
    time: "8:30 PM",
    location: "Private Screen & Hangout",
    description: "Streaming our compiled digital memory reel with all video clips, road trip moments, and hilarious voice notes.",
    category: "Celebration",
    rsvpCount: 12,
    userRsvpd: false
  }
];

// ═══════════════════════════════════════════════════════════════════
//  MEMORIES API
// ═══════════════════════════════════════════════════════════════════

export const getStoredMemories = () => {
  return getLocal(STORAGE_KEYS.MEMORIES, INITIAL_MEMORIES);
};

export const subscribeToMemories = (callback) => {
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
      console.info("Using local memory storage:", error.message);
    });
  } catch {
    return () => { };
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
    people: memory.people && memory.people.length ? memory.people : ["The Squad "],
    category: memory.category || "Moment",
    reactions: { "❤️": 1, "✨": 0, "🫂": 0, "😂": 0 },
    comments: [],
    createdAt: new Date().toISOString()
  };

  const existing = getStoredMemories();
  const updated = [newMemory, ...existing];
  setLocal(STORAGE_KEYS.MEMORIES, updated);

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

export const deleteMemory = async (memoryId) => {
  const memories = getStoredMemories();
  const memoryToDelete = memories.find(m => m.id === memoryId);

  // If the memory contains an R2 object key, delete from Cloudflare R2 and reclaim storage
  if (memoryToDelete?.r2ObjectKey) {
    await deleteFromR2(memoryToDelete.r2ObjectKey);
  }

  const updated = memories.filter(m => m.id !== memoryId);
  setLocal(STORAGE_KEYS.MEMORIES, updated);

  try {
    if (db && memoryId) {
      await deleteDoc(doc(db, 'natpe-thunai-memories', memoryId));
    }
  } catch (err) {
    console.info("Synced local memory deletion:", err.message);
  }

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
