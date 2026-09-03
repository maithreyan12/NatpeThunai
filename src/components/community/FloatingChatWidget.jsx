import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  LogOut, 
  Shield, 
  Smile, 
  Users, 
  Sparkles, 
  CheckCheck, 
  Lock, 
  Bot, 
  Copy, 
  Check,
  Heart,
  ChevronDown,
  Minimize2
} from 'lucide-react';
import { signInWithGoogle, logOut, onAuthChange, sendMessage, subscribeToMessages } from '../../firebase';
import './FloatingChatWidget.css';

const QUICK_EMOJIS = ['❤️', '🔥', '😂', '👏', '✨', '💯', '😍', '🎉'];

const AI_PROMPT_CHIPS = [
  { label: '📖 Retell Namma Story', query: 'Tell our complete Natpe Thunai story' },
  { label: '❤️ Why "Not Perfect, But Real"?', query: 'Why is our friendship not perfect, but real?' },
  { label: '😂 Fights & "Pothum Da" Moments', query: 'Tell about our fights and pothum da moments' },
  { label: '🥘 Cooking & Midnight Rides', query: 'Remind us about our cooking and midnight memories' },
  { label: '💌 Love Note For The Squad', query: 'Generate a heartfelt love note for the squad' }
];

export default function FloatingChatWidget({ onOpenSignIn }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' | 'live'
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [likedAiMsgIds, setLikedAiMsgIds] = useState(new Set());

  // AI Story Companion State
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      id: 'ai-welcome',
      sender: 'ai',
      text: `Vanakkam! Naan dhan unga **“Natpe Thunai” AI Story Companion** ❤️🫂\n\nFirst year la start aana namma journey, ippo varaikum evlo strong ah vandhurukku nu ninaichaale goosebumps!\n\nNamma friendship pathi enna kekkanum? Click any prompt chip below or type anything! ✨`,
      timestamp: 'Just now'
    }
  ]);

  const messagesEndRef = useRef(null);
  const aiMessagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Live messages subscriber
  useEffect(() => {
    if (!user || activeTab !== 'live' || !isOpen) return;
    const unsubscribe = subscribeToMessages((msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [user, activeTab, isOpen]);

  // Scroll to bottom for live messages
  useEffect(() => {
    if (messagesEndRef.current && activeTab === 'live' && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, isOpen]);

  // Scroll to bottom for AI messages
  useEffect(() => {
    if (aiMessagesEndRef.current && activeTab === 'ai' && isOpen) {
      aiMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, aiIsTyping, activeTab, isOpen]);

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in cancelled. Try again!');
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

  const generateAiReply = (query) => {
    const q = query.toLowerCase();
    
    if (q.includes('story') || q.includes('complete') || q.includes('journey')) {
      return `**Namma Natpe Thunai Story (The Unfiltered Journey)** ✨\n\nIt all started in 1st year college — strangers coming together from different worlds. But soon, tea-stall banter turned into unbreakable bonds.\n\nFrom the very first Nilgiris road trip to late-night beach talks, cooking food together in shared rooms, cheering during sports tournaments, and surviving crazy exam nights.\n\nToday, we are **15+ strong** and forever connected. ❤️`;
    }
    
    if (q.includes('fight') || q.includes('pothum') || q.includes('angry')) {
      return `*"Pothum da... indha group ah vittu poiren!"* 😂\n\nHow many times have we heard that in our group? Countless! Fights happen over food orders, late replies, and trip plans. But within 10 minutes, someone shares a meme and everyone is back laughing. That's the real magic of Natpe Thunai. 🫂`;
    }
    
    if (q.includes('cooking') || q.includes('food') || q.includes('ride')) {
      return `🍳 **Midnight Cooking & Spontaneous Rides**\n\nRemember those 1:00 AM Maggie sessions, spontaneous bike rides chasing sunrise, and eating biryani from a single giant plate? Those weren't just meals — they were pure memories that will stay with us forever! 🏍️💨`;
    }
    
    if (q.includes('love') || q.includes('note') || q.includes('squad')) {
      return `💌 **Heartfelt Squad Note:**\n\n"We might grow older, careers might take us to different cities, but whenever we meet or talk, time rewinds to our golden days. Proud to have each one of you in my life. Natpe Thunai forever!" 🌸✨`;
    }

    return `That's a golden memory! With namma squad, every moment is packed with laughter and unconditional loyalty. What else would you like to reminisce about? ❤️🫂`;
  };

  const handleSendAiMessage = (queryText) => {
    const textToSend = queryText || aiChatInput;
    if (!textToSend.trim() || aiIsTyping) return;

    const userMsg = {
      id: `ai-user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, userMsg]);
    setAiChatInput('');
    setAiIsTyping(true);

    setTimeout(() => {
      const replyText = generateAiReply(textToSend);
      const aiReply = {
        id: `ai-resp-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages(prev => [...prev, aiReply]);
      setAiIsTyping(false);
    }, 600);
  };

  const copyAiText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleLikeAi = (id) => {
    setLikedAiMsgIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="floating-chat-root">
      {/* ── FLOATING CORNER MESSAGE BUTTON ── */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`floating-chat-trigger-btn ${isOpen ? 'active' : ''}`}
        aria-label={isOpen ? 'Close chat' : 'Open squad chat and AI companion'}
      >
        <span className="floating-btn-glow" aria-hidden="true" />
        {isOpen ? (
          <X size={24} className="floating-btn-icon" />
        ) : (
          <MessageCircle size={24} className="floating-btn-icon" />
        )}
        {!isOpen && <span className="floating-status-dot" />}
      </button>

      {/* ── EXPANDED FLOATING CHAT CARD WIDGET ── */}
      {isOpen && (
        <div className="floating-chat-popup">
          {/* Header */}
          <div className="floating-chat-header">
            <div className="floating-header-tabs">
              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className={`floating-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
              >
                <Bot size={15} />
                <span>AI Storyteller</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('live')}
                className={`floating-tab-btn ${activeTab === 'live' ? 'active' : ''}`}
              >
                <Users size={15} />
                <span>Squad Chat</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="floating-close-btn"
              aria-label="Minimize chat"
            >
              <Minimize2 size={16} />
            </button>
          </div>

          {/* Body Content */}
          <div className="floating-chat-body">
            {/* ── TAB 1: AI STORYTELLER ── */}
            {activeTab === 'ai' && (
              <div className="floating-ai-pane">
                {/* Prompt Chips */}
                <div className="floating-chips-scroll">
                  {AI_PROMPT_CHIPS.map(chip => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => handleSendAiMessage(chip.query)}
                      className="floating-prompt-chip"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Messages List */}
                <div className="floating-ai-messages-list">
                  {aiMessages.map(msg => (
                    <div key={msg.id} className={`floating-msg-row ${msg.sender}`}>
                      {msg.sender === 'ai' && (
                        <div className="floating-ai-avatar">
                          <Sparkles size={14} />
                        </div>
                      )}
                      <div className="floating-msg-bubble">
                        <div className="floating-msg-text">
                          {msg.text.split('\n').map((line, idx) => (
                            <p key={idx}>{line}</p>
                          ))}
                        </div>
                        <div className="floating-msg-footer">
                          <span className="floating-msg-time">{msg.timestamp}</span>
                          {msg.sender === 'ai' && (
                            <div className="floating-ai-actions">
                              <button 
                                type="button" 
                                onClick={() => toggleLikeAi(msg.id)}
                                className={`floating-mini-action ${likedAiMsgIds.has(msg.id) ? 'liked' : ''}`}
                                aria-label="Like response"
                              >
                                <Heart size={12} fill={likedAiMsgIds.has(msg.id) ? 'currentColor' : 'none'} />
                              </button>
                              <button 
                                type="button" 
                                onClick={() => copyAiText(msg.id, msg.text)}
                                className="floating-mini-action"
                                aria-label="Copy text"
                              >
                                {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {aiIsTyping && (
                    <div className="floating-msg-row ai">
                      <div className="floating-ai-avatar">
                        <Sparkles size={14} />
                      </div>
                      <div className="floating-typing-bubble">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    </div>
                  )}
                  <div ref={aiMessagesEndRef} />
                </div>

                {/* AI Input */}
                <form 
                  className="floating-input-bar" 
                  onSubmit={(e) => { e.preventDefault(); handleSendAiMessage(); }}
                >
                  <input
                    type="text"
                    placeholder="Ask about namma memories..."
                    value={aiChatInput}
                    onChange={(e) => setAiChatInput(e.target.value)}
                    className="floating-chat-input"
                  />
                  <button 
                    type="submit" 
                    className="floating-send-btn"
                    disabled={!aiChatInput.trim() || aiIsTyping}
                    aria-label="Send"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            )}

            {/* ── TAB 2: LIVE SQUAD CHAT ── */}
            {activeTab === 'live' && (
              <div className="floating-live-pane">
                {!user ? (
                  <div className="floating-locked-screen">
                    <div className="floating-lock-icon">
                      <Lock size={24} />
                    </div>
                    <h4>Squad Members Only</h4>
                    <p>Sign in with your Google account to send live messages to the gang.</p>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="floating-signin-btn"
                    >
                      Sign In with Google
                    </button>
                    {authError && <p className="floating-auth-error">{authError}</p>}
                  </div>
                ) : (
                  <div className="floating-live-active-chat">
                    {/* Live Messages List */}
                    <div className="floating-live-messages-list">
                      {messages.length === 0 ? (
                        <div className="floating-empty-chat">
                          <Sparkles size={20} />
                          <p>No messages yet. Send the first hello! 💬</p>
                        </div>
                      ) : (
                        messages.map(msg => {
                          const isMe = msg.uid === user.uid;
                          return (
                            <div key={msg.id} className={`floating-msg-row ${isMe ? 'user' : 'other'}`}>
                              {!isMe && (
                                <img
                                  src={msg.photoURL || 'https://via.placeholder.com/32'}
                                  alt={msg.displayName || 'Member'}
                                  className="floating-user-avatar"
                                />
                              )}
                              <div className="floating-msg-bubble">
                                {!isMe && <span className="floating-sender-name">{msg.displayName || 'Friend'}</span>}
                                <p className="floating-msg-text">{msg.text}</p>
                                <span className="floating-msg-time">{formatTime(msg.createdAt)}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Emoji Quick Picker */}
                    {showEmojis && (
                      <div className="floating-emoji-drawer">
                        {QUICK_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => { setNewMessage(prev => prev + emoji); setShowEmojis(false); }}
                            className="floating-emoji-item"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Input Bar */}
                    <form className="floating-input-bar" onSubmit={handleSendMessage}>
                      <button
                        type="button"
                        onClick={() => setShowEmojis(prev => !prev)}
                        className="floating-emoji-toggle"
                        aria-label="Emojis"
                      >
                        <Smile size={18} />
                      </button>
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Message squad..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="floating-chat-input"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="floating-send-btn"
                        aria-label="Send"
                      >
                        <Send size={15} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
