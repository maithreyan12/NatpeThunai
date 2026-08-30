# நட்பே துணை • Natpethunai (2023 — 2026)
### Premium Friendship Memory Community Platform

A warm, modern, nostalgic private community space celebrating friendship memories, milestones, and unbreakable bonds from **2023 to 2026**.

---

## 🏛️ Clean Modular Architecture

```
NatpeThunai/
├── public/
│   └── photos/                 # Authentic squad photo assets (friend1.jpg ... friend4.jpg)
│
├── src/
│   ├── components/             # Reusable UI Components & Sections
│   │   ├── Navbar.jsx/.css     # Floating responsive navigation bar (desktop + mobile dock)
│   │   ├── Hero.jsx/.css       # Emotional landing with 2023-2026 period badge & polaroids
│   │   ├── FriendshipJourney.jsx/.css # 2023→2026 journey stepper animation with squad presence
│   │   ├── SquadMembers.jsx/.css  # Front-and-center 4 squad member showcase with photos
│   │   ├── MemoryTimeline.jsx/.css# Chronological album filterable by Year and by Friend Avatar
│   │   ├── MemoryCard.jsx      # Physical album photo card with reactions & comment drawer
│   │   ├── MemoryReel.jsx/.css # Cinematic slideshow/video reel player with fullscreen mode
│   │   ├── CommunitySection.jsx/.css # Feed, group discussions, announcements, and events
│   │   ├── GroupChat.jsx/.css  # Live encrypted Firebase squad chat with quick emojis
│   │   ├── Modals.jsx/.css     # AddMemory, CreatePost, AddEvent, and Lightbox modals
│   │   ├── FriendModal.jsx/.css# VisionOS detail sheet with member 2023-2026 journey milestones
│   │   ├── Footer.jsx/.css     # Sanctuary closing quote & back-to-top controls
│   │   ├── InstagramIcon.jsx   # SVG brand icon
│   │   └── index.js            # Clean Barrel Export for all components
│   │
│   ├── services/               # Data & Backend Layer
│   │   ├── dataService.js      # Dual-layer persistence (Firestore + offline localStorage)
│   │   └── index.js            # Services Barrel Export
│   │
│   ├── styles/                 # Theme & Visual System
│   │   ├── variables.css       # Light-first tokens, pastel tints, dark mode palette
│   │   └── index.css           # Global typography, ambient studio lighting, card system
│   │
│   ├── firebase.js             # Firebase App, Google Auth & Firestore client
│   ├── App.jsx                 # Central App dashboard orchestrator
│   └── main.jsx                # React root mount
│
└── index.html                  # HTML5 template with fonts (Tamil + Inter + Syne + Jakarta)
```

---

## 🛠️ How to Customize Easily

### 1. Modifying Squad Members & Portraits
Open [`src/services/dataService.js`](src/services/dataService.js) and locate `SQUAD_MEMBERS`:
```javascript
export const SQUAD_MEMBERS = [
  {
    id: "grace",
    name: "Grace",
    nickname: "Gracxx",
    role: "The Spark ✨",
    instagram: "https://www.instagram.com/_.gracxx._",
    photo: "/photos/friend1.jpg",
    bio: "...",
    quote: "...",
    memoryYear: "2023",
    journeyMilestones: [
      { year: "2023", title: "The First Spark", desc: "..." },
      { year: "2024", title: "Spontaneous Adventures", desc: "..." },
      { year: "2025", title: "Unshakable Support", desc: "..." },
      { year: "2026", title: "Eternal Energy", desc: "..." }
    ]
  },
  // ... Heenuuu, Divyaaa, Puppy
];
```
- To change a photo, place your new image in `public/photos/` and update the `photo` path.
- To update roles, quotes, or journey milestones, edit the fields directly.

### 2. Modifying Timeline Memories
- You can add memories live in the browser using the **"Add Memory"** button.
- To change initial default memories, edit `INITIAL_MEMORIES` in [`src/services/dataService.js`](src/services/dataService.js).

### 3. Customizing Colors & Theme Tokens
Open [`src/styles/variables.css`](src/styles/variables.css):
- Canvas colors: `--bg-base`, `--bg-surface`, `--bg-card`
- Pastel accents: `--accent-lavender`, `--accent-blue`, `--accent-pink`, `--accent-peach`, `--accent-mint`
- Button styling: `--btn-primary-bg`, `--btn-secondary-bg`, `--btn-outline-bg`
- Dark mode overrides: `[data-theme="dark"]` section

### 4. Firebase Configuration
Open [`src/firebase.js`](src/firebase.js):
- Replace `firebaseConfig` with your own Firebase project credentials if you want to switch databases.

---

## ⚡ Development Commands

```bash
# Start Vite development server
npm run dev

# Run oxlint code quality check (0 warnings, 0 errors)
npm run lint

# Build production bundle
npm run build
```
