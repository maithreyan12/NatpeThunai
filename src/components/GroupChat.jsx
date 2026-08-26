import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, LogOut, Shield, Smile, Users, Sparkles, CheckCheck, Lock } from 'lucide-react';
import { signInWithGoogle, logOut, onAuthChange, sendMessage, subscribeToMessages } from '../firebase';
import './GroupChat.css';

const QUICK_EMOJIS = ['❤️', '🔥', '😂', '👏', '✨', '💯', '😍', '🎉'];

export default function GroupChat() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [authError, setAuthError] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to live messages when logged in
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToMessages((msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in cancelled. Try again!');
      } else if (error.code === 'auth/configuration-not-found' || error.code === 'auth/invalid-api-key') {
        setAuthError('Firebase not configured yet. Check src/firebase.js');
      } else {
        setAuthError('Sign-in failed. Please try again.');
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(newMessage, user);
      setNewMessage('');
      setShowEmojis(false);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Send error:', error);
    }
    setSending(false);
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateDivider = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDateKey = (msg) => {
    if (!msg.createdAt) return 'pending';
    const date = msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt);
    return date.toDateString();
  };

  const isSameSender = (msg, prevMsg) => {
    if (!prevMsg) return false;
    return msg.uid === prevMsg.uid && getDateKey(msg) === getDateKey(prevMsg);
  };

  if (loading) {
    return (
      <section id="chat" className="chat-section">
        <div className="chat-loading-state">
          <div className="apple-spinner"></div>
          <span>Connecting to Squad Network...</span>
        </div>
      </section>
    );
  }

  return (
    <section id="chat" className="chat-section">
      <div className="section-header">
        <div className="badge-pill liquid-shimmer">
          <MessageCircle size={15} className="header-badge-icon" />
          <span>SQUAD ENCLAVE</span>
        </div>
        <h2 className="section-title">
          Live <span className="gradient-text-brand">Chat Enclave</span>
        </h2>
        <p className="section-desc">
          A private, real-time message stream for our squad. Google-authenticated and encrypted.
        </p>
      </div>

      <div className="glass-card chat-spatial-container liquid-shimmer">
        {!user ? (
          /* ─── Apple Pro Login Screen ─── */
          <div className="chat-login-experience">
            <div className="login-beacon-graphic">
              <div className="beacon-ring">
                <div className="beacon-core">
                  <Lock size={32} />
                </div>
              </div>
              <div className="floating-chat-bubble bubble-alpha">Squad Live ✨</div>
              <div className="floating-chat-bubble bubble-beta">Private Room 🔒</div>
            </div>

            <h3 className="chat-login-heading">Enter The Squad Chat</h3>
            <p className="chat-login-caption">
              Sign in with your Google account to access the private squad hub.
            </p>

            <button className="google-liquid-btn liquid-shimmer" onClick={handleGoogleSignIn}>
              <svg className="google-vector-icon" viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {authError && (
              <div className="chat-auth-alert">
                <Shield size={14} />
                <span>{authError}</span>
              </div>
            )}

            <div className="chat-privacy-footnote">
              <Shield size={12} />
              <span>End-to-end Firebase security • Verified members only</span>
            </div>
          </div>
        ) : (
          /* ─── Apple Messages-Style Chat Console ─── */
          <div className="chat-console">
            {/* Header */}
            <div className="chat-top-console">
              <div className="console-left">
                <div className="console-channel-icon">
                  <Users size={16} />
                </div>
                <div className="console-channel-info">
                  <span className="console-channel-name" style={{ fontFamily: 'var(--font-tamil)' }}>நட்பே துணை</span>
                  <span className="console-channel-status">
                    <span className="live-dot-pulse"></span>
                    Live Enclave • {messages.length} messages
                  </span>
                </div>
              </div>

              <div className="console-right">
                <div className="console-user-pill">
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName} 
                    className="console-user-avatar"
                    referrerPolicy="no-referrer"
                  />
                  <span className="console-user-name">{user.displayName?.split(' ')[0]}</span>
                </div>
                <button 
                  className="console-signout-btn" 
                  onClick={handleSignOut} 
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="chat-stream-viewport" ref={chatContainerRef}>
              {messages.length === 0 ? (
                <div className="chat-empty-beacon">
                  <Sparkles size={32} className="empty-sparkle-icon" />
                  <p className="empty-beacon-title">No messages in room</p>
                  <p className="empty-beacon-sub">Start the conversation with your squad members!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = msg.uid === user.uid;
                  const prevMsg = index > 0 ? messages[index - 1] : null;
                  const grouped = isSameSender(msg, prevMsg);
                  const showDateDivider = !prevMsg || getDateKey(msg) !== getDateKey(prevMsg);

                  return (
                    <React.Fragment key={msg.id}>
                      {showDateDivider && msg.createdAt && (
                        <div className="chat-date-pill-divider">
                          <span>{formatDateDivider(msg.createdAt)}</span>
                        </div>
                      )}
                      <div className={`chat-bubble-row ${isOwn ? 'own-side' : 'other-side'} ${grouped ? 'grouped-msg' : ''}`}>
                        {!isOwn && !grouped && (
                          <img 
                            src={msg.photoURL} 
                            alt={msg.displayName} 
                            className="chat-sender-avatar"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        {!isOwn && grouped && <div className="chat-avatar-placeholder"></div>}
                        
                        <div className="chat-bubble-column">
                          {!isOwn && !grouped && (
                            <span className="chat-sender-name">{msg.displayName}</span>
                          )}
                          <div className={`chat-imessage-bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
                            <span className="bubble-text">{msg.text}</span>
                            <div className="bubble-meta">
                              <span className="bubble-timestamp">{formatTime(msg.createdAt)}</span>
                              {isOwn && <CheckCheck size={12} className="check-icon" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Emoji Bar */}
            {showEmojis && (
              <div className="chat-emoji-dock">
                {QUICK_EMOJIS.map(emoji => (
                  <button 
                    key={emoji} 
                    className="emoji-dock-btn" 
                    onClick={() => addEmoji(emoji)}
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form className="chat-input-bar" onSubmit={handleSendMessage}>
              <button 
                type="button" 
                className={`emoji-selector-btn ${showEmojis ? 'active' : ''}`}
                onClick={() => setShowEmojis(!showEmojis)}
                aria-label="Toggle emoji picker"
              >
                <Smile size={19} />
              </button>
              
              <input
                ref={inputRef}
                type="text"
                className="chat-glass-input"
                placeholder="iMessage to squad..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                maxLength={500}
                autoComplete="off"
              />

              <button 
                type="submit" 
                className={`chat-submit-btn ${newMessage.trim() ? 'active' : ''}`}
                disabled={!newMessage.trim() || sending}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
