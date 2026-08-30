import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
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
  Heart 
} from 'lucide-react';
import { signInWithGoogle, logOut, onAuthChange, sendMessage, subscribeToMessages } from '../../firebase';
import './GroupChat.css';

const QUICK_EMOJIS = ['❤️', '🔥', '😂', '👏', '✨', '💯', '😍', '🎉'];

const AI_PROMPT_CHIPS = [
  { label: '📖 Retell Namma Story', query: 'Tell our complete Natpe Thunai story' },
  { label: '❤️ Why "Not Perfect, But Real"?', query: 'Why is our friendship not perfect, but real?' },
  { label: '😂 Fights & "Pothum Da" Moments', query: 'Tell about our fights and pothum da moments' },
  { label: '🥘 Cooking & Midnight Rides', query: 'Remind us about our cooking and midnight memories' },
  { label: '💌 Love Note For The Squad', query: 'Generate a heartfelt love note for the squad' }
];

export default function GroupChat({ onOpenSignIn }) {
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
      text: `Vanakkam! Naan dhan unga **“Natpe Thunai” AI Story Companion** ❤️🫂\n\nFirst year la start aana namma journey, ippo varaikum evlo strong ah vandhurukku nu ninaichaale goosebumps!\n\nSerndhu sapta moments, cooking pannadhu, dance aadinadhu, movie theatre whistles, and andha iconic *"pothum da, indha group ah vittudalam"* fights 😂 — ellaame enakku theriyum.\n\nNamma friendship pathi enna kekkanum? Click any prompt chip below or type anything! ✨`,
      timestamp: 'Just now'
    }
  ]);

  const messagesEndRef = useRef(null);
  const aiMessagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
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
    if (!user || activeTab !== 'live') return;
    const unsubscribe = subscribeToMessages((msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [user, activeTab]);

  // Scroll to bottom for live messages
  useEffect(() => {
    if (messagesEndRef.current && activeTab === 'live') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Scroll to bottom for AI messages
  useEffect(() => {
    if (aiMessagesEndRef.current && activeTab === 'ai') {
      aiMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, aiIsTyping, activeTab]);

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

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  // ── AI Storyteller Engine ──
  const generateAiResponse = (query) => {
    const q = query.toLowerCase();

    if (q.includes('story') || q.includes('complete') || q.includes('first year')) {
      return `📖 **The Tale of Natpe Thunai** ❤️🫂\n\nFirst year la start aana namma “Natpe Thunai” group, ippo varaikum ivlo strong ah irukum nu appo namma yaarume nenachiruka maatom.\n\nFrom our first hesitant conversations to sharing every meal, cooking together, dancing our hearts out, watching movies, and celebrating each birthday like a festival — every single second became a treasure.\n\nFights vandhudhu, kovam vandhudhu, misunderstandings vandhudhu. Sila neram *"pothum da, indha group ah vittudalam"* nu kooda feel pannom 😂 But in the end, yaarum yaaraiyum vittu kudukkala. Minutes later, we were back laughing together.\n\n**Namma friendship perfect illa, aana romba real!** Innum neraya places poganum, neraya memories create pannanum. Endha situation vandhalum, namma bond last varaikum strong ah irukanum! ♾️✨`;
    }

    if (q.includes('fight') || q.includes('sandai') || q.includes('pothum') || q.includes('argument')) {
      return `😂 **About Our Fights & "Pothum Da" Moments** 🫂\n\nIdhu dhan namma group oda biggest beauty!\n\nReal friendship la sandai illana dhan aacharyam. Misunderstandings, kovam, arguments nu neraya nadandhurukku. Sila neram tension la *"Pothum da, indha group ah vittudalam"* nu kooda nenachirupom 😂\n\nAana enna theriyuma? Oru 10 minutes apram, yaaro oruthar joke poduvom, ellarum marubadiyum serndhu siripom! Yaarum yaaraiyum vittu kudukka maatom. That’s what makes us unbreakable. True bond doesn't mean zero fights; it means zero departures! ❤️`;
    }

    if (q.includes('perfect') || q.includes('real')) {
      return `❤️ **“Namma Friendship Perfect Illa, Aana Romba Real.”**\n\nFake friendships look perfect on Instagram stories. Real friendships look like Natpe Thunai:\n\n✨ Sharing food from the same tiffin box\n🔥 Fighting like tom & jerry, then laughing together like kids\n🥘 Burnt food from late-night cooking adventures\n🎬 Whistling at the screen together during movies\n🫂 Standing together when anyone in the circle needs a hand\n\nPerfection is overrated. Authenticity is forever. That is our Natpe Thunai promise! ♾️`;
    }

    if (q.includes('cook') || q.includes('drive') || q.includes('food') || q.includes('dance') || q.includes('movie')) {
      return `🥘 **The Chaos Chronicles: Cooking, Movies & Adventures** 🚗\n\nWho can forget:\n\n1. **Cooking Moments**: Experimenting in the kitchen, adding random masala, almost setting off alarms, but laughing until our cheeks hurt!\n2. **Late-Night Rides**: Windy night air, empty roads, and singing songs at the top of our lungs.\n3. **Dance Madness**: Zero choreography, 100% madness! Dancing like absolute maniacs on birthdays.\n4. **Food Sharing**: Namma group la "my food" concept eh kedayadhu — everything is "namma food"!\n\nThese ordinary moments turned into our most extraordinary memories. ✨`;
    }

    if (q.includes('note') || q.includes('message') || q.includes('letter')) {
      return `💌 **A Love Note For Our Squad** ❤️🫂\n\n“Dear Grace, Heenuuu, Divyaaa & Puppy —\n\nNamma serndhu potta laughs, namma pannina galatta, namma kitta irukra andha unshakeable trust — idhuku eedey kedayadhu.\n\nLife la evlo changes vandhalum, namma group epavume namma safe space. Innum neraya places suthalam, neraya memories create pannalam. Endha situation vandhalum, namma friendship ah vittu kudukama onna irupom!\n\nBecause this is not just a group… idhu namma memories, namma fun, namma fights, namma happiness, and most importantly, namma friendship. Natpe Thunai Forever!” ♾️✨`;
    }

    if (q.includes('grace') || q.includes('gracxx')) {
      return `✨ **Grace ("Gracxx") — The Spark!**\n\nGrace brings that infectious spark and energy! The one who lights up the room, starts spontaneous plans, and laughs until her stomach hurts. The squad wouldn’t have half this craziness without her! 💖`;
    }

    if (q.includes('heenuuu') || q.includes('hennesy')) {
      return `💖 **Heenuuu ("Hennesy") — The Heart!**\n\nThe emotional rock and warmth of Natpe Thunai. Always ready with open arms, deep talks, and comforting advice. The keeper of secrets and warmest hugs! 🫂`;
    }

    if (q.includes('divyaaa') || q.includes('twinkle')) {
      return `☀️ **Divyaaa ("Twinkle Cheek") — The Sunshine!**\n\nPure sunshine and radiant positivity! Capturing candid memories, making every birthday epic, and ensuring everyone feels celebrated and loved. 📸`;
    }

    if (q.includes('puppy') || q.includes('garnett')) {
      return `🎯 **Puppy ("Garnett") — The Vibe!**\n\nChill, grounded, authentic, and fiercely loyal. The calm soul when things get crazy and the anchor who never hesitates to show up whenever a friend calls! 🤙`;
    }

    // Default warm intelligent answer
    return `❤️ **Natpe Thunai AI Analysis:**\n\n"${query}" pathi yosikum podhu, onnu mattum clear ah theriyudhu:\n\nNamma group la nadandha each and every incident — whether it's sharing food, crazy dancing, spontaneous trips, or heated arguments — has only cemented our loyalty.\n\n*"Namma friendship perfect illa, aana romba real."* Whatever comes in life, this squad remains forever! 🫂♾️✨`;
  };

  const handleSendAiMessage = (queryText) => {
    const textToSend = queryText || aiChatInput;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: 'Just now'
    };

    setAiMessages(prev => [...prev, userMsg]);
    setAiChatInput('');
    setAiIsTyping(true);

    setTimeout(() => {
      const reply = generateAiResponse(textToSend);
      const aiReplyMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: 'Just now'
      };
      setAiMessages(prev => [...prev, aiReplyMsg]);
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

  const formatDateDivider = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
        <div className="badge-pill">
          <MessageCircle size={15} />
          <span>SQUAD ENCLAVE & AI STORYTELLER</span>
        </div>
        <h2 className="section-title">
          Live Chat & AI Story Enclave
        </h2>
        <p className="section-desc">
          Chat live with the squad or interact with our Natpe AI Companion to recount our shared memories.
        </p>
      </div>

      <div className="glass-card chat-spatial-container">
        {!user ? (
          <div className="chat-login-experience auth-enclave-locked">
            <div className="login-beacon-graphic">
              <div className="beacon-ring">
                <div className="beacon-core">
                  <Lock size={32} />
                </div>
              </div>
              <div className="floating-chat-bubble bubble-alpha">Squad Dashboard 🔒</div>
              <div className="floating-chat-bubble bubble-beta">Members Only ✨</div>
            </div>

            <span className="modal-badge-tag">AUTHENTICATION REQUIRED</span>
            <h3 className="chat-login-heading">Authorized Squad Enclave</h3>
            <p className="chat-login-caption">
              Live group chat and our Natpe AI Storyteller are restricted to authorized squad members. Please sign in with your Google account to unlock access.
            </p>

            <button className="google-liquid-btn" onClick={onOpenSignIn || handleGoogleSignIn}>
              <svg className="google-vector-icon" viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign In with Google</span>
            </button>

            {authError && (
              <div className="chat-auth-alert">
                <Shield size={14} />
                <span>{authError}</span>
              </div>
            )}

            <div className="chat-privacy-footnote">
              <Shield size={12} />
              <span>🔒 256-Bit Firebase Secured • Authorized Squad Access Only</span>
            </div>
          </div>
        ) : (
          <>
            {/* Top Channel Navigation Bar: Switch between AI Story Companion and Live Squad Room */}
            <div className="chat-channel-switcher-bar">
              <button
                type="button"
                className={`chat-channel-tab ${activeTab === 'ai' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai')}
              >
                <Bot size={16} />
                <span>✨ Natpe AI Storyteller</span>
                <span className="channel-badge-pulse">Online</span>
              </button>

              <button
                type="button"
                className={`chat-channel-tab ${activeTab === 'live' ? 'active' : ''}`}
                onClick={() => setActiveTab('live')}
              >
                <Users size={16} />
                <span>👥 Squad Live Room</span>
                <span className="live-count-chip">{messages.length}</span>
              </button>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/*  MODE 1: NATPE AI STORYTELLER & MEMORY COMPANION                */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'ai' && (
              <div className="chat-console ai-mode-console">
                {/* Top AI Console Banner */}
                <div className="ai-top-banner">
                  <div className="ai-avatar-badge">
                    <Sparkles size={18} />
                  </div>
                  <div className="ai-identity-text">
                    <div className="ai-title-row">
                      <h3 className="ai-bot-name">Natpe AI Story Companion</h3>
                      {aiIsTyping && (
                        <div className="ai-typing-soundwave" aria-label="AI Generating response">
                          <span className="wave-bar bar-1" />
                          <span className="wave-bar bar-2" />
                          <span className="wave-bar bar-3" />
                          <span className="wave-bar bar-4" />
                          <span className="wave-text">Thinking...</span>
                        </div>
                      )}
                    </div>
                    <span className="ai-bot-sub">Trained on our authentic first year journey, cooking, laughs & fights</span>
                  </div>
                </div>

                {/* AI Suggested Prompts Strip */}
                <div className="ai-prompt-chips-scroll">
                  {AI_PROMPT_CHIPS.map(chip => (
                    <button
                      key={chip.label}
                      type="button"
                      className="ai-suggestion-chip"
                      onClick={() => handleSendAiMessage(chip.query)}
                    >
                      <span className="chip-sparkle-dot" />
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>

                {/* AI Messages Stream */}
                <div className="chat-stream-viewport ai-stream" ref={chatContainerRef}>
                  <div className="chat-ambient-glow glow-1" aria-hidden="true" />
                  <div className="chat-ambient-glow glow-2" aria-hidden="true" />

                  {aiMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`chat-bubble-row ${msg.sender === 'user' ? 'own-side' : 'other-side'}`}
                    >
                      {msg.sender === 'ai' && (
                        <div className="ai-sender-icon-bubble">
                          <Bot size={16} />
                        </div>
                      )}

                      <div className="chat-bubble-column">
                        <div className={`chat-imessage-bubble ${msg.sender === 'user' ? 'bubble-own' : 'bubble-ai'}`}>
                          <div className="bubble-markdown-text">
                            {msg.text.split('\n\n').map((paragraph, pIdx) => (
                              <p key={pIdx}>{paragraph}</p>
                            ))}
                          </div>
                          
                          <div className="bubble-meta">
                            <span className="bubble-timestamp">{msg.timestamp}</span>
                            {msg.sender === 'ai' && (
                              <div className="ai-bubble-actions">
                                <button
                                  type="button"
                                  className={`ai-action-icon-btn ai-heart-btn ${likedAiMsgIds.has(msg.id) ? 'liked' : ''}`}
                                  onClick={() => toggleLikeAi(msg.id)}
                                  title={likedAiMsgIds.has(msg.id) ? "Loved this memory" : "Love this memory"}
                                  aria-label="Love this memory"
                                >
                                  <Heart size={12} className={likedAiMsgIds.has(msg.id) ? 'heart-filled' : ''} />
                                  {likedAiMsgIds.has(msg.id) && <span className="heart-count">1</span>}
                                </button>

                                <button
                                  type="button"
                                  className="ai-action-icon-btn ai-copy-text-btn"
                                  onClick={() => copyAiText(msg.id, msg.text)}
                                  title="Copy message"
                                  aria-label="Copy message"
                                >
                                  {copiedId === msg.id ? <Check size={12} className="copy-checked-icon" /> : <Copy size={12} />}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {aiIsTyping && (
                    <div className="chat-bubble-row other-side">
                      <div className="ai-sender-icon-bubble">
                        <Bot size={16} />
                      </div>
                      <div className="chat-imessage-bubble bubble-ai typing-indicator-bubble">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    </div>
                  )}
                  <div ref={aiMessagesEndRef} />
                </div>

                {/* AI Message Input Bar */}
                <form 
                  className="chat-input-bar" 
                  onSubmit={(e) => { e.preventDefault(); handleSendAiMessage(); }}
                >
                  <input
                    type="text"
                    className="chat-glass-input"
                    placeholder="Ask about namma memories, fights, cooking, or members..."
                    value={aiChatInput}
                    onChange={(e) => setAiChatInput(e.target.value)}
                    maxLength={500}
                    autoComplete="off"
                  />

                  <button 
                    type="submit" 
                    className={`chat-submit-btn ${aiChatInput.trim() ? 'active' : ''}`}
                    disabled={!aiChatInput.trim() || aiIsTyping}
                    aria-label="Send to AI Companion"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/*  MODE 2: LIVE SQUAD ROOM (GOOGLE AUTHENTICATED)                 */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'live' && (
              <div className="chat-console">
                {/* Live Console Header */}
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

                {/* Live Messages Area */}
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
                        onClick={() => { setNewMessage(prev => prev + emoji); inputRef.current?.focus(); }}
                        type="button"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Live Input Bar */}
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
          </>
        )}
      </div>
    </section>
  );
}
