#!/usr/bin/env node
// seed-r2-database.mjs
// Run this once to seed all initial data to Cloudflare R2
// Usage: node seed-r2-database.mjs

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';

// Load .env
const envContent = readFileSync('.env', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && !key.startsWith('#')) env[key.trim()] = rest.join('=').trim();
}

const ACCOUNT_ID = env.R2_ACCOUNT_ID;
const ACCESS_KEY = env.R2_ACCESS_KEY_ID;
const SECRET_KEY = env.R2_SECRET_ACCESS_KEY;
const BUCKET     = env.R2_BUCKET_NAME || 'natpethunai';
const PUBLIC_URL = env.R2_PUBLIC_DOMAIN || 'https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev';

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

const r2Photo = (name) => `${PUBLIC_URL}/photos/${name}`;

// ── SQUAD MEMBERS ────────────────────────────────────────────────────
const MEMBERS = [
  { id: 'kafil', name: 'Kafil', nickname: 'K..K', role: 'The Creative Soul 🎨', category: 'creators', photo: r2Photo('kafil.jpg'), bio: 'The aesthetic eye and creative heartbeat of the gang.', quote: 'Every memory with namma gang deserves its own soundtrack.', avatarGradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' },
  { id: 'haniya', name: 'Haniya', nickname: 'hanuuuu', role: 'The Chill Sloth 🦥', category: 'vibe', photo: r2Photo('hanuu.jpg'), bio: 'The undisputed chill master of the squad.', quote: 'Why stress when you can sleep? Good vibes and cozy dreams always.', avatarGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' },
  { id: 'grace', name: 'Grace', nickname: 'Gracee', role: 'The Spark & Creative ✨', category: 'core', photo: r2Photo('Gracee.jpg'), bio: 'The aesthetic eye and radiant spark of our gang.', quote: 'Every memory with namma gang deserves its own soundtrack. ❤️' },
  { id: 'jaffreen', name: 'Jaffreen', nickname: 'jaffuuuu', role: 'The Sweet Heart 💖', category: 'core', photo: r2Photo('jaffreen.jpg'), bio: 'Pure warmth and genuine sweetness.', quote: 'Smile always, spread kindness everywhere.', avatarGradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' },
  { id: 'farish', name: 'Farish Sharif', nickname: 'fairs', role: 'The Mastermind 🧠', category: 'core', photo: r2Photo('farish.jpg'), instagram: 'https://www.instagram.com/fairsh_sharif', bio: 'The visionary planner behind every squad reunion.', quote: "Plan A never works, that's why the alphabet has 25 more letters." },
  { id: 'divyaaa', name: 'Divyaaa', nickname: 'Twinkle Cheek', role: 'The Sunshine ☀️', category: 'core', photo: r2Photo('Divyaa.jpg'), instagram: 'https://www.instagram.com/divya_twinkle_cheek', bio: 'Pure sunshine energy and an infectious smile.', quote: 'Smile big, laugh louder, treasure each day.' },
  { id: 'heenuuu', name: 'Heenuuu', nickname: 'Heena', role: 'The Spark & Heart 💖', category: 'vibe', photo: r2Photo('Heenuuu.jpg'), bio: 'The one who lights up every room she walks into.', quote: 'Life is too short not to laugh until our stomachs hurt. 😄✨' },
  { id: 'puppy', name: 'Puppy', nickname: 'Pups', role: 'The Chill Vibe 🎯', category: 'vibe', photo: r2Photo('Puppy.jpg'), bio: 'The undisputed chill vibe and loyal soul of the squad.', quote: 'Count the smiles, cherish the friendship. 🫂♾️' },
  { id: 'afnaan', name: 'Afnaaan', nickname: 'affuuuuu', role: 'The Energy Dynamo ⚡', category: 'chaos', photo: r2Photo('affu.jpg'), bio: 'The powerhouse of unstoppable energy.', quote: 'Life is too short for boring days — let the hype begin! 🔥', avatarGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' },
  { id: 'meshak', name: 'Meshak', nickname: 'meshuuu', role: 'The Silent Strength 🛡️', category: 'brains', photo: r2Photo('meshak.jpg'), bio: 'A reliable brother who always has your back.', quote: 'Actions speak louder than words. 👊✨', avatarGradient: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)' },
  { id: 'samuel', name: 'Samuel', nickname: 'samuel', role: 'The Joyful Soul 🌟', category: 'chaos', photo: r2Photo('samuel.jpg'), bio: 'Brings pure smiles and positive vibes everywhere.', quote: 'Count the memories, not the days. 😄🔥', avatarGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  { id: 'harshitha', name: 'Harshitha', nickname: 'harshuuuu', role: 'The Radiant Sunshine 🌻', category: 'core', photo: r2Photo('harshuuu.jpg'), bio: 'Spreading genuine kindness, joyful energy, and endless sparkle.', quote: 'In a world of noise, true friends are the sweetest melody. 🌸💖', avatarGradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' },
  { id: 'maithreyan', name: 'Maithreyan', nickname: 'maithuu', role: 'The Tech & Vibe Pilot 🚀', category: 'creators', photo: null, bio: 'The visionary brain and creator spirit.', quote: 'Code can build apps, but loyalty builds forever friendships. 💻❤️', avatarGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  { id: 'gopika', name: 'Gopika', nickname: 'gopu', role: 'The Graceful Heart 🌸', category: 'core', photo: null, bio: 'The gentle presence, radiant smile, and sweet soul of our sanctuary.', quote: 'Natpe Thunai forever and infinity. 🌸✨', avatarGradient: 'linear-gradient(135deg, #f472b6 0%, #a855f7 100%)' },
];

// ── MEMORIES ─────────────────────────────────────────────────────────
const MEMORIES = [
  { id: 'mem-01', year: 'Chapter 1', title: 'Where Our Story Started', description: 'The very first day our squad bonded over chai and shared goals at the canteen.', date: 'August 14', location: 'Campus Common & Café', mediaUrl: r2Photo('Gracee.jpg'), mediaType: 'image', people: ['Grace', 'Puppy', 'Heenuuu', 'Divyaaa', 'Farish', 'Kafil'], category: 'Milestone', reactions: { '❤️': 28, '✨': 18, '🫂': 25, '😂': 12 }, comments: [], createdAt: '2024-08-14T00:00:00.000Z' },
  { id: 'mem-02', year: 'Chapter 2', title: 'Late Night Talks & Spontaneous Highway Trips', description: 'Midnight chai runs, high-volume music in the car, and late-night calls.', date: 'April 22', location: 'Midnight Highway Drive', mediaUrl: r2Photo('Divyaa.jpg'), mediaType: 'image', people: ['Heenuuu', 'Divyaaa', 'Grace', 'Farish', 'Samuel', 'Afnaaan'], category: 'Adventures', reactions: { '❤️': 35, '✨': 21, '🫂': 29, '😂': 16 }, comments: [], createdAt: '2024-04-22T00:00:00.000Z' },
  { id: 'mem-03', year: 'Chapter 3', title: 'Unforgettable Milestone Celebration', description: 'Celebrating shared wins and overcoming challenges together.', date: 'November 18', location: 'Beachside Gathering', mediaUrl: r2Photo('Divyaa.jpg'), mediaType: 'image', people: ['Divyaaa', 'Puppy', 'Grace', 'Heenuuu', 'Haniya', 'Jaffreen', 'Harshitha'], category: 'Celebration', reactions: { '❤️': 42, '✨': 30, '🫂': 38, '😂': 14 }, comments: [], createdAt: '2024-11-18T00:00:00.000Z' },
  { id: 'mem-04', year: 'Chapter 4', title: 'Still Here. Still 15 Strong.', description: 'Through every turn of life — more than friends — family by choice.', date: 'Always & Forever', location: 'Squad Sanctuary', mediaUrl: r2Photo('Gracee.jpg'), mediaType: 'image', people: ['Puppy', 'Grace', 'Heenuuu', 'Divyaaa', 'Farish', 'Meshak', 'Maithreyan', 'Gopika'], category: 'Daily Laughs', reactions: { '❤️': 58, '✨': 45, '🫂': 50, '😂': 27 }, comments: [], createdAt: '2025-01-01T00:00:00.000Z' },
];

// ── POSTS ─────────────────────────────────────────────────────────────
const POSTS = [
  { id: 'post-manifesto', authorName: 'Natpe Thunai Squad (15 Strong)', authorPhoto: r2Photo('Gracee.jpg'), content: '"First year la start aana namma 15-member gang, ippo varaikum ivlo strong ah irukum nu appo namma yaarume nenachiruka maatom. Namma friendship perfect illa, aana romba real. ❤️ Endha situation vandhalum, ippadiye last varaikum strong ah irukanum! ❤️🫂♾️"', category: 'Story', likes: 54, comments: [], createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'post-1', authorName: 'Grace', authorPhoto: r2Photo('Gracee.jpg'), content: 'Reminder that our 15-member grand reunion planning is on! Drop your favorite memories.', category: 'Announcement', likes: 19, comments: [], createdAt: '2025-06-01T00:00:00.000Z' },
  { id: 'post-2', authorName: 'Divyaaa', authorPhoto: r2Photo('Divyaa.jpg'), content: 'Going through our old memories right now... All of us have changed so much yet our banter is identical 😂💖', category: 'Moment', likes: 24, comments: [], createdAt: '2025-06-05T00:00:00.000Z' },
];

// ── EVENTS ────────────────────────────────────────────────────────────
const EVENTS = [
  { id: 'evt-1', title: 'Annual 15-Member Squad Grand Reunion', date: 'September 15', time: '6:00 PM', location: 'City Hilltop Viewpoint', description: 'Our landmark gathering celebrating our timeless 15-member friendship.', category: 'Reunion', rsvpCount: 15 },
  { id: 'evt-2', title: 'Squad Memory Reel Screening Night', date: 'October 02, 2026', time: '8:30 PM', location: 'Private Screen & Hangout', description: 'Streaming our compiled digital memory reel.', category: 'Celebration', rsvpCount: 12 },
];

async function writeJSON(collection, data) {
  const key = `data/${collection}.json`;
  // Check if exists first
  try {
    await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    console.log(`⏭️  ${collection} already seeded — skipping.`);
    return;
  } catch {}

  await R2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
    CacheControl: 'no-cache, no-store, must-revalidate',
  }));
  console.log(`✅ Seeded ${collection} (${data.length} items) → ${PUBLIC_URL}/${key}`);
}

async function main() {
  console.log('\n🚀 Seeding Cloudflare R2 Database for Natpe Thunai...\n');
  await writeJSON('members',  MEMBERS);
  await writeJSON('memories', MEMORIES);
  await writeJSON('posts',    POSTS);
  await writeJSON('events',   EVENTS);
  console.log(`\n✨ Done! Data is live at ${PUBLIC_URL}/data/\n`);
  console.log('  members  →', `${PUBLIC_URL}/data/members.json`);
  console.log('  memories →', `${PUBLIC_URL}/data/memories.json`);
  console.log('  posts    →', `${PUBLIC_URL}/data/posts.json`);
  console.log('  events   →', `${PUBLIC_URL}/data/events.json`);
}

main().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
