import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, LogIn, LogOut, Shield, Smile, Users, Sparkles, ChevronDown } from 'lucide-react';
import { signInWithGoogle, logOut, onAuthChange, sendMessage, subscribeToMessages } from '../firebase';
import './GroupChat.css';

// Quick emoji reactions
const QUICK_EMOJIS = ['😂', '❤️', '🔥', '👏', '💯', '😍', '🎉', '👀'];

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

  // Group messages to show date dividers
  const getDateKey = (msg) => {
    if (!msg.createdAt) return 'pending';
    const date = msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt);
    return date.toDateString();
  };

  // Check if a message is from the same sender as the previous one (for grouping)
  const isSameSender = (msg, prevMsg) => {
    if (!prevMsg) return false;
    return msg.uid === prevMsg.uid && getDateKey(msg) === getDateKey(prevMsg);
  };

  if (loading) {
    return (
      <section id="chat" className="chat-section">
        <div className="chat-loading">
          <div className="chat-loading-spinner"></div>
          <span>Loading chat...</span>
        </div>
      </section>
    );
  }

  return (
    <section id="chat" className="chat-section">
      <div className="section-header">
        <div className="badge-pill glass-shine">
          <MessageCircle size={14} className="accent-icon" />
          <span>Squad Chat</span>
        </div>
        <h2 className="section-title">
          Group <span className="gradient-text">Chat Room</span>
        </h2>
        <p className="section-desc">
          Sign in with Google to join the squad conversation. Real-time, private, and just for us!
        </p>
      </div>

      <div className="glass-card chat-container-card glass-shine">
        {!user ? (
          /* ─── Login Screen ─── */
          <div className="chat-login-screen">
            <div className="chat-login-visual">
              <div className="login-icon-ring">
                <div className="login-icon-inner">
                  <MessageCircle size={36} />
                </div>
              </div>
              <div className="login-floating-bubble bubble-1">Hey! 👋</div>
              <div className="login-floating-bubble bubble-2">Join us! 🔥</div>
              <div className="login-floating-bubble bubble-3">Squad only 💯</div>
            </div>

            <h3 className="chat-login-title">Join the Squad Chat</h3>
            <p className="chat-login-desc">
              Sign in with your Google account to access the private group conversation. Only squad members allowed!
            </p>

            <button className="google-signin-btn glass-shine" onClick={handleGoogleSignIn}>
              <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {authError && (
              <div className="chat-auth-error">
                <Shield size={14} />
                <span>{authError}</span>
              </div>
            )}

            <div className="chat-login-footer">
              <Shield size={12} />
              <span>Private & secure • Google authentication</span>
            </div>
          </div>
        ) : (
          /* ─── Chat Room ─── */
          <div className="chat-room">
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-left">
                <div className="chat-header-icon">
                  <Users size={18} />
                </div>
                <div className="chat-header-info">
                  <span className="chat-room-name" style={{ fontFamily: 'var(--font-tamil)' }}>நட்பே துணை</span>
                  <span className="chat-room-status">
                    <span className="status-dot live"></span>
                    Live Chat • {messages.length} messages
                  </span>
                </div>
              </div>
              <div className="chat-header-right">
                <div className="chat-user-badge">
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName} 
                    className="chat-user-avatar-small"
                    referrerPolicy="no-referrer"
                  />
                  <span className="chat-user-name-small">{user.displayName?.split(' ')[0]}</span>
                </div>
                <button className="chat-signout-btn" onClick={handleSignOut} title="Sign Out">
                  <LogOut size={16} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="chat-messages-area" ref={chatContainerRef}>
              {messages.length === 0 ? (
                <div className="chat-empty-state">
                  <Sparkles size={32} className="empty-icon" />
                  <p className="empty-title">No messages yet!</p>
                  <p className="empty-desc">Be the first to say something to the squad 🎉</p>
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
                        <div className="chat-date-divider">
                          <span>{formatDateDivider(msg.createdAt)}</span>
                        </div>
                      )}
                      <div className={`chat-message-row ${isOwn ? 'own' : 'other'} ${grouped ? 'grouped' : ''}`}>
                        {!isOwn && !grouped && (
                          <img 
                            src={msg.photoURL} 
                            alt={msg.displayName} 
                            className="chat-msg-avatar"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        {!isOwn && grouped && <div className="chat-msg-avatar-spacer"></div>}
                        <div className="chat-msg-bubble-wrapper">
                          {!isOwn && !grouped && (
                            <span className="chat-msg-sender">{msg.displayName}</span>
                          )}
                          <div className={`chat-msg-bubble ${isOwn ? 'own-bubble' : 'other-bubble'}`}>
                            <span className="chat-msg-text">{msg.text}</span>
                            <span className="chat-msg-time">{formatTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Emoji Picker */}
            {showEmojis && (
              <div className="chat-emoji-bar">
                {QUICK_EMOJIS.map(emoji => (
                  <button 
                    key={emoji} 
                    className="emoji-btn" 
                    onClick={() => addEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <button 
                type="button" 
                className={`emoji-toggle-btn ${showEmojis ? 'active' : ''}`}
                onClick={() => setShowEmojis(!showEmojis)}
              >
                <Smile size={20} />
              </button>
              <input
                ref={inputRef}
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                maxLength={500}
                autoComplete="off"
              />
              <button 
                type="submit" 
                className={`chat-send-btn ${newMessage.trim() ? 'active' : ''}`}
                disabled={!newMessage.trim() || sending}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
