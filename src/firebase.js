// Firebase Configuration for நட்பே துணை
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  indexedDBLocalPersistence,
  browserPopupRedirectResolver, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
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

let auth;
try {
  auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence],
    popupRedirectResolver: browserPopupRedirectResolver
  });
} catch {
  auth = getAuth(app);
}

const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const AUTHORIZED_ADMIN_EMAIL = 'maithreyan2006@gmail.com';

export const isAuthorizedAdmin = (user) => {
  return Boolean(user && user.email && user.email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase());
};

// Check redirect result on app load if redirected
export const checkRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      if (!isAuthorizedAdmin(result.user)) {
        await signOut(auth);
        const err = new Error("Access Denied: Only the administrator is permitted to log in.");
        err.code = "auth/unauthorized-account";
        throw err;
      }
    }
    return result;
  } catch (err) {
    if (err.code === "auth/unauthorized-account") throw err;
    return null;
  }
};

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
    if (result?.user) {
      if (!isAuthorizedAdmin(result.user)) {
        await signOut(auth);
        const err = new Error("Access Denied: Only the administrator is permitted to log in.");
        err.code = "auth/unauthorized-account";
        throw err;
      }
    }
    return result;
  } catch (err) {
    if (err.code === "auth/unauthorized-account") {
      throw err;
    }
    console.warn("Sign-in popup error:", err);
    if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
      throw err;
    }
    if (
      err.code === 'auth/popup-blocked' || 
      err.code === 'auth/internal-error' || 
      err.message?.toLowerCase().includes('indexeddb') || 
      err.message?.toLowerCase().includes('database')
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw err;
  }
};

export const logOut = () => signOut(auth);

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (!isAuthorizedAdmin(user)) {
        try {
          await signOut(auth);
        } catch {}
        callback(null);
        return;
      }
    }
    callback(user);
  });
};

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
    if (unsub) unsub();
    callback([]);
  });
  return unsub;
};

export { auth, db };
