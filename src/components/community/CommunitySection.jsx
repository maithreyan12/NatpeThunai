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
import InstagramIcon from '../ui/InstagramIcon';
import { getStoredMembers } from '../../services';
import './CommunitySection.css';

export default function CommunitySection({ 
  posts, 
  onLikePost, 
  onOpenCreatePost, 
  events, 
  onToggleRsvp, 
  onOpenAddEvent,
  onSelectMember,
  members,
  _currentUser 
}) {
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'events' | 'members'
  const squadList = members && members.length > 0 ? members : getStoredMembers();

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
            <span className="tab-count-pill">{squadList.length}</span>
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
              </div>
            ) : (
              <div className="community-posts-feed">
                {posts.map(post => (
                  <article key={post.id} className="community-post-card interactive-slab">
                    <div className="post-header">
                      <div className="post-author-info">
                        <img 
                          src={post.authorPhoto || "/photos/friend1.jpg"} 
                          alt={post.authorName} 
                          className="post-author-avatar"
                          onError={(e) => { e.target.src = '/photos/friend1.jpg'; }}
                        />
                        <div className="post-author-meta">
                          <strong className="post-author-name">{post.authorName}</strong>
                          <span className="post-time-tag">{post.createdAt || "Recently"}</span>
                        </div>
                      </div>
                      <span className="post-category-tag">{post.category || "Moment"}</span>
                    </div>

                    <p className="post-content-body">{post.content}</p>

                    {post.mediaUrl && (
                      <div className="post-media-frame">
                        <img src={post.mediaUrl} alt="Post attachment" className="post-media-img" />
                      </div>
                    )}

                    <div className="post-actions-footer">
                      <button 
                        className="post-like-btn"
                        onClick={() => onLikePost(post.id)}
                        aria-label="Love this post"
                      >
                        <Heart size={14} fill="#e11d48" color="#e11d48" />
                        <span>{post.likes || 0} Loves</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: EVENTS & REUNIONS ── */}
        {activeTab === 'events' && (
          <div className="community-tab-pane">
            <div className="tab-action-bar">
              <span className="pane-subtitle">Reunions, screenings, and squad get-togethers</span>
              <button className="btn-primary btn-sm" onClick={onOpenAddEvent}>
                <Plus size={15} />
                <span>Schedule Event</span>
              </button>
            </div>

            {events.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-state-icon">
                  <Calendar size={26} />
                </div>
                <h3 className="empty-state-title">No upcoming events.</h3>
                <p className="empty-state-text">
                  Time to plan the next road trip or dinner! Click "Schedule Event" above.
                </p>
              </div>
            ) : (
              <div className="community-events-grid">
                {events.map(event => (
                  <div key={event.id} className="event-card interactive-slab">
                    <div className="event-date-block">
                      <span className="event-month">{event.date.split(' ')[0]}</span>
                      <span className="event-day">{event.date.split(' ')[1] || '15'}</span>
                    </div>

                    <div className="event-details-col">
                      <div className="event-category-badge">{event.category || "Reunion"}</div>
                      <h4 className="event-title">{event.title}</h4>
                      <div className="event-loc-line">
                        <MapPin size={13} />
                        <span>{event.location}</span>
                      </div>
                    </div>

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
              <span className="pane-subtitle">All {squadList.length} cornerstones of நட்பே துணை</span>
            </div>

            <div className="squad-members-grid">
              {squadList.map(member => (
                <div 
                  key={member.id} 
                  className="member-profile-card interactive-slab"
                  onClick={() => onSelectMember(member)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="member-avatar-wrapper">
                    {member.photo ? (
                      <img 
                        src={member.photo} 
                        alt={member.name} 
                        className="member-avatar-img"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div 
                        className="member-avatar-gradient"
                        style={{ background: member.avatarGradient || 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                      >
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="member-role-badge">{member.role}</span>
                  </div>

                  <h4 className="member-name">{member.name}</h4>
                  <span className="member-nickname">"{member.nickname}"</span>
                  <p className="member-bio">{member.bio}</p>

                  {member.quote && (
                    <div className="member-quote-pill">
                      <span>"{member.quote}"</span>
                    </div>
                  )}

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
