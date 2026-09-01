// Firebase Configuration for நட்பே துணை
// ⚠️ IMPORTANT: Replace the config below with YOUR Firebase project credentials.
//
// HOW TO SET UP:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use existing)
// 3. Enable Authentication → Sign-in method → Google
// 4. Create a Firestore Database (start in test mode)
// 5. Go to Project Settings → Your apps → Add web app
// 6. Copy the firebaseConfig object and paste it below

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

// 🔥 Natpe Thunai Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAw1s2SBRffBWeVyRzC1Xcc4k6t3fam-os",
  authDomain: "natpe-thunai-26511.firebaseapp.com",
  projectId: "natpe-thunai-26511",
  storageBucket: "natpe-thunai-26511.firebasestorage.app",
  messagingSenderId: "504598344265",
  appId: "1:504598344265:web:03ddba6df5dae9421cc598",
  measurementId: "G-5F9H6FV6PY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logOut = () => signOut(auth);
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

// Chat functions
export const sendMessage = async (text, user) => {
  if (!text.trim()) return;
  await addDoc(collection(db, 'natpe-thunai-chat'), {
    text: text.trim(),
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: serverTimestamp()
  });
};

export const subscribeToMessages = (callback, messageLimit = 80) => {
  const q = query(
    collection(db, 'natpe-thunai-chat'),
    orderBy('createdAt', 'asc'),
    limit(messageLimit)
  );
  let unsub;
  unsub = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  }, (error) => {
    console.info('Live chat unavailable (Firestore unreachable):', error.message);
    // Stop Firebase from retrying endlessly on permission/network errors
    if (unsub) unsub();
    callback([]);
  });
  return unsub;
};

export { auth, db };
