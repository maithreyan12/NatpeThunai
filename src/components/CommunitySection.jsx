import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Plus, 
  Heart, 
  MapPin, 
  Check, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import { SQUAD_MEMBERS } from '../services';
import './CommunitySection.css';

export default function CommunitySection({ 
  posts, 
  onLikePost, 
  onOpenCreatePost, 
  events, 
  onToggleRsvp, 
  onOpenAddEvent,
  onSelectMember,
  _currentUser 
}) {
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'events' | 'members'

  return (
    <section id="community" className="community-hub-section">
      <div className="section-header">
        <div className="badge-pill">
          <Users size={14} />
          <span>PRIVATE SQUAD CIRCLE</span>
        </div>
        <h2 className="section-title">
          Our Group Community
        </h2>
        <p className="section-desc">
          A personal, private sanctuary for our inner circle. Discussions, reunion plans, and squad milestones.
        </p>
      </div>

      <div className="community-main-container">
        {/* Hub Tabs Header */}
        <div className="community-tabs-nav" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'posts'}
            className={`community-tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <MessageSquare size={16} />
            <span>Group Posts & Feed</span>
            <span className="tab-count-pill">{posts.length}</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'events'}
            className={`community-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <Calendar size={16} />
            <span>Milestones & Events</span>
            <span className="tab-count-pill">{events.length}</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'members'}
            className={`community-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <ShieldCheck size={16} />
            <span>Squad Members</span>
            <span className="tab-count-pill">{SQUAD_MEMBERS.length}</span>
          </button>
        </div>

        {/* ── TAB 1: POSTS & ANNOUNCEMENTS ── */}
        {activeTab === 'posts' && (
          <div className="community-tab-pane">
            <div className="tab-action-bar">
              <span className="pane-subtitle">Shared reflections, announcements, and plans</span>
              <button className="btn-primary btn-sm" onClick={onOpenCreatePost}>
                <Plus size={15} />
                <span>Create Post</span>
              </button>
            </div>

            {posts.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-state-icon">
                  <MessageSquare size={26} />
                </div>
                <h3 className="empty-state-title">Nothing here yet.</h3>
                <p className="empty-state-text">
                  “Share something with the group.” Start a discussion, announce a meetup, or share a thought.
                </p>
                <button className="btn-primary" onClick={onOpenCreatePost}>
                  <Plus size={16} />
                  <span>Create Post</span>
                </button>
              </div>
            ) : (
              <div className="community-posts-list">
                {posts.map(post => (
                  <article key={post.id} className="community-post-card">
                    <div className="post-author-row">
                      <img 
                        src={post.authorPhoto} 
                        alt={post.authorName} 
                        className="post-author-avatar"
                        onError={(e) => { e.target.src = '/photos/friend1.jpg'; }}
                      />
                      <div className="post-author-meta">
                        <span className="author-name">{post.authorName}</span>
                        <span className="post-timestamp">{post.createdAt}</span>
                      </div>
                      <span className="badge-pill post-cat-pill">{post.category}</span>
                    </div>

                    <p className="post-content-body">{post.content}</p>

                    {post.mediaUrl && (
                      <div className="post-media-attachment">
                        <img src={post.mediaUrl} alt="Attachment" />
                      </div>
                    )}

                    <div className="post-footer-actions">
                      <button 
                        className="post-like-btn"
                        onClick={() => onLikePost(post.id)}
                        title="Love this"
                      >
                        <Heart size={14} fill={post.likes > 0 ? "currentColor" : "none"} />
                        <span>{post.likes || 0}</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: MILESTONES & EVENTS ── */}
        {activeTab === 'events' && (
          <div className="community-tab-pane">
            <div className="tab-action-bar">
              <span className="pane-subtitle">Mark dates for reunions, road trips, and anniversaries</span>
              <button className="btn-primary btn-sm" onClick={onOpenAddEvent}>
                <Plus size={15} />
                <span>Add Event</span>
              </button>
            </div>

            {events.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-state-icon">
                  <Calendar size={26} />
                </div>
                <h3 className="empty-state-title">No upcoming events yet.</h3>
                <p className="empty-state-text">
                  Plan your next squad reunion, trip, or screening night.
                </p>
                <button className="btn-primary" onClick={onOpenAddEvent}>
                  <Plus size={16} />
                  <span>Add Event</span>
                </button>
              </div>
            ) : (
              <div className="community-events-grid">
                {events.map(event => (
                  <div key={event.id} className="event-item-card">
                    <div className="event-badge-row">
                      <span className="badge-pill event-cat-tag">{event.category}</span>
                      <span className="event-time-tag">{event.time}</span>
                    </div>

                    <h4 className="event-title">{event.title}</h4>
                    <div className="event-meta-row">
                      <div className="event-meta-item">
                        <Calendar size={13} />
                        <span>{event.date}</span>
                      </div>
                      <div className="event-meta-item">
                        <MapPin size={13} />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    {event.description && (
                      <p className="event-description">{event.description}</p>
                    )}

                    <div className="event-rsvp-bar">
                      <span className="rsvp-status-text">
                        {event.rsvpCount || 0} friends attending
                      </span>
                      <button 
                        className={`btn-sm ${event.userRsvpd ? 'btn-secondary' : 'btn-outline'}`}
                        onClick={() => onToggleRsvp(event.id)}
                      >
                        {event.userRsvpd ? <Check size={14} /> : null}
                        <span>{event.userRsvpd ? 'Attending' : 'RSVP'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: SQUAD MEMBERS DIRECTORY ── */}
        {activeTab === 'members' && (
          <div className="community-tab-pane">
            <div className="tab-action-bar">
              <span className="pane-subtitle">The four cornerstones of நட்பே துணை</span>
            </div>

            <div className="squad-members-grid">
              {SQUAD_MEMBERS.map(member => (
                <div 
                  key={member.id} 
                  className="member-profile-card interactive-slab"
                  onClick={() => onSelectMember(member)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="member-avatar-wrapper">
                    <img 
                      src={member.photo} 
                      alt={member.name} 
                      className="member-avatar-img"
                      onError={(e) => { e.target.src = '/photos/friend1.jpg'; }}
                    />
                    <span className="member-role-badge">{member.role}</span>
                  </div>

                  <h4 className="member-name">{member.name}</h4>
                  <span className="member-nickname">"{member.nickname}"</span>
                  <p className="member-bio">{member.bio}</p>

                  <div className="member-quote-pill">
                    <span>"{member.quote}"</span>
                  </div>

                  {member.instagram && (
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="member-ig-link"
                      onClick={e => e.stopPropagation()}
                    >
                      <InstagramIcon size={13} />
                      <span>Instagram</span>
                      <ArrowUpRight size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
