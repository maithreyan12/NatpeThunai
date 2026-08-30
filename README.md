# நட்பே துணை • Natpethunai
### Premium Friendship Memory Sanctuary Platform

A warm, modern, nostalgic private community space celebrating friendship memories, milestones, and unbreakable bonds.

---

## 🏛️ Premium Modular Architecture (Organized by Folders)

All components are logically organized into intuitive domain folders, making them easy to locate, open, and modify:

```
src/
├── components/
│   ├── layout/                 # Navigation & Global Page Shell
│   │   ├── Navbar.jsx & .css   # Floating responsive navigation bar (desktop + mobile dock)
│   │   └── Footer.jsx & .css   # Sanctuary closing quote, signoff & back-to-top controls
│   │
│   ├── hero/                   # Landing Presentation
│   │   └── Hero.jsx & .css     # Hero showcase with polaroids and timeless milestone bar
│   │
│   ├── story/                  # The Unfiltered Chronicle
│   │   └── SquadStory.jsx & .css # Namma “Natpe Thunai” Story with Tanglish & English editions
│   │
│   ├── squad/                  # Core Squad & Friendship Progression
│   │   ├── SquadMembers.jsx & .css   # Large editorial portrait cards for Grace, Heenuuu, Divyaaa, Puppy
│   │   ├── FriendModal.jsx & .css    # Detailed friend profile sheet with journey milestones
│   │   └── FriendshipJourney.jsx & .css # Interactive chapter milestones stepper
│   │
│   ├── memories/               # Memory Timeline & Visual Reel
│   │   ├── MemoryTimeline.jsx & .css # Chronological album with category and friend avatar filters
│   │   ├── MemoryCard.jsx            # Album photo card with reactions and comments drawer
│   │   └── MemoryReel.jsx & .css     # Cinematic memory reel player with fullscreen mode
│   │
│   ├── community/              # Social Discussions & AI Companion
│   │   ├── CommunitySection.jsx & .css # Posts, announcements, and squad calendar events
│   │   └── GroupChat.jsx & .css        # Natpe AI Storyteller + Google-authenticated Live Chat
│   │
│   ├── ui/                     # Reusable Modals & UI Primitives
│   │   ├── Modals.jsx & .css   # CreatePost, AddEvent, and Lightbox viewer modals
│   │   └── InstagramIcon.jsx   # Vector Instagram icon primitive
│   │
│   └── index.js                # Central barrel export providing easy access to all components
│
├── services/
│   ├── dataService.js          # SQUAD_MEMBERS, memories, posts, events & dual persistence
│   └── index.js                # Services barrel export
│
├── styles/
│   ├── variables.css           # Soft alabaster palette, pastel tints, typography tokens
│   └── index.css               # Global styling, ambient studio orbs, card & button system
│
├── firebase.js                 # Firebase initialization, Google Auth & Firestore client
├── App.jsx                     # Core application orchestrator
└── main.jsx                    # React entry root
```

---

## 🛠️ How to Customize Easily

1. **Modify Squad Members**: Open `src/services/dataService.js` and edit `SQUAD_MEMBERS`.
2. **Edit the Group Story**: Open `src/components/story/SquadStory.jsx`.
3. **Change Colors & Fonts**: Open `src/styles/variables.css`.
4. **Tweak Layout**: Open `src/components/layout/Navbar.jsx` or `Footer.jsx`.
5. **Adjust Timeline & Photos**: Open `src/components/memories/MemoryTimeline.jsx`.
