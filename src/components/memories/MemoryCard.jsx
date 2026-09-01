import React, { useState } from 'react';
import { r2Photo } from '../../services';
import { 
  MapPin, 
  Users, 
  MessageCircle, 
  Send, 
  Maximize2, 
  Play 
} from 'lucide-react';

const REACTION_EMOJIS = ['❤️', '✨', '😂', '🥹', '🫂'];

export default function MemoryCard({ 
  memory, 
  onReact, 
  onAddComment, 
  onOpenLightbox,
  currentUser 
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(memory.id, currentUser?.displayName || "Squad Friend", commentInput.trim());
    setCommentInput('');
  };

  return (
    <article className="memory-album-card" aria-label={`Memory: ${memory.title}`}>
      {/* Top Meta Bar */}
      <div className="card-top-meta">
        <div className="card-year-date">
          <span className="badge-pill card-category-badge">{memory.category || "Memory"}</span>
          <span className="card-date-text">{memory.date}</span>
        </div>
      </div>

      {/* Media Window */}
      <div 
        className="card-media-window"
        onClick={() => onOpenLightbox(memory)}
        role="button"
        tabIndex={0}
        aria-label="View photo in lightbox"
      >
        {memory.mediaType === 'video' ? (
          <div className="video-thumb-wrap">
            <video src={memory.mediaUrl} className="card-media-img" preload="metadata" />
            <div className="video-play-indicator">
              <Play size={22} fill="white" />
            </div>
          </div>
        ) : (
          <img 
            src={memory.mediaUrl} 
            alt={memory.title} 
            className="card-media-img" 
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = r2Photo('Gracee.jpg'); }}
          />
        )}
        <button className="card-zoom-btn" title="View Fullscreen">
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Body Content */}
      <div className="card-content-body">
        <h3 className="card-memory-title">{memory.title}</h3>
        {memory.description && (
          <p className="card-memory-desc">{memory.description}</p>
        )}

        {/* Location & Tagged Friends */}
        <div className="card-tags-row">
          {memory.location && (
            <div className="card-tag location-tag">
              <MapPin size={12} />
              <span>{memory.location}</span>
            </div>
          )}

          {memory.people && memory.people.length > 0 && (
            <div className="card-tag people-tag">
              <Users size={12} />
              <span>{memory.people.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Reactions Row */}
        <div className="card-reactions-bar">
          <div className="reaction-pills-group">
            {REACTION_EMOJIS.map(emoji => {
              const count = (memory.reactions && memory.reactions[emoji]) || 0;
              return (
                <button
                  key={emoji}
                  className={`emoji-reaction-pill ${count > 0 ? 'active' : ''}`}
                  onClick={() => onReact(memory.id, emoji)}
                  title={`React ${emoji}`}
                >
                  <span className="reaction-emoji">{emoji}</span>
                  {count > 0 && <span className="reaction-count">{count}</span>}
                </button>
              );
            })}
          </div>

          <button 
            className={`comments-toggle-btn ${showComments ? 'open' : ''}`}
            onClick={() => setShowComments(!showComments)}
            aria-label="Toggle comments"
          >
            <MessageCircle size={15} />
            <span>{(memory.comments || []).length}</span>
          </button>
        </div>

        {/* Expandable Comments Drawer */}
        {showComments && (
          <div className="card-comments-drawer">
            <div className="comments-stream">
              {(memory.comments || []).length === 0 ? (
                <span className="no-comments-hint">No comments yet. Leave a loving note!</span>
              ) : (
                memory.comments.map(c => (
                  <div key={c.id} className="comment-bubble">
                    <span className="comment-author">{c.author}</span>
                    <span className="comment-text">{c.text}</span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleCommentSubmit} className="comment-input-bar">
              <input
                type="text"
                placeholder="Write a message..."
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                className="comment-text-input"
              />
              <button type="submit" className="comment-send-btn" disabled={!commentInput.trim()}>
                <Send size={13} />
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}
