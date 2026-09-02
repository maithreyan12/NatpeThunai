import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Grid, 
  List, 
  Camera, 
  HeartHandshake,
  ArrowUpRight,
  CheckCircle2,
  BookOpen,
  X,
  Heart,
  Sparkles
} from 'lucide-react';
import InstagramIcon from '../ui/InstagramIcon';
import './SquadMembers.css';

const VIBE_FILTERS = [
  { id: 'all', label: 'All Squad' },
  { id: 'core', label: 'Core Squad' },
  { id: 'chaos', label: 'Energy & Chaos' },
  { id: 'vibe', label: 'Vibe & Chill' },
  { id: 'brains', label: 'Brains & Anchor' },
  { id: 'creators', label: 'Creative Souls' }
];

/* ─── 3D Flip Card (Photo front / Bio back) ─── */
function MemberFlipCard({ member, onSelectMember, onFilterByMember }) {
  const [flipped, setFlipped] = useState(false);
  const handle = member.instagram ? member.instagram.split('/').filter(Boolean).pop() : null;

  return (
    <div
      className={`flip-card-scene ${flipped ? 'is-flipped' : ''}`}
      onClick={() => setFlipped(f => !f)}
      role="button"
      tabIndex={0}
      aria-label={flipped ? `Close ${member.name} bio` : `View ${member.name} bio`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFlipped(f => !f); }}
    >
      <div className="flip-card-inner">

        {/* ── FRONT: Big circle photo + name only ── */}
        <div className="flip-card-face flip-card-front">
          {/* Ambient glow halo */}
          <div
            className="flip-front-halo"
            style={{ background: member.avatarGradient || 'conic-gradient(#f09433, #dc2743, #bc1888, #6366f1, #06b6d4, #10b981, #f09433)' }}
            aria-hidden="true"
          />

          {/* Floating particles */}
          <div className="flip-front-particles" aria-hidden="true">
            {[...Array(6)].map((_, i) => (
              <span key={i} className={`flip-particle flip-particle-${i + 1}`} />
            ))}
          </div>

          {/* Story ring + avatar */}
          <div className="flip-front-ring-stage">
            <div className="flip-front-conic-ring" />
            <div className="flip-front-avatar-shell">
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.name}
                  className="flip-front-avatar-img"
                  onError={(e) => {
                    const currentSrc = e.target.src;
                    if (currentSrc.includes('r2.dev') || currentSrc.includes('http')) {
                      const filename = currentSrc.split('/').pop();
                      e.target.src = `/photos/${filename}`;
                    } else {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.classList.add('fallback-gradient');
                    }
                  }}
                />
              ) : (
                <div
                  className="flip-front-avatar-gradient"
                  style={{ background: member.avatarGradient || 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                >
                  <span className="flip-front-initials">
                    {member.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Verified badge */}
            <span className="flip-verified-badge" title="Verified Squad Member">
              <CheckCircle2 size={15} />
            </span>
          </div>

          {/* Name & nickname */}
          <div className="flip-front-identity">
            <h3 className="flip-front-name">{member.name}</h3>
            <span className="flip-front-nick">"{member.nickname || member.name}"</span>
            <span className="flip-front-role">{member.role || 'Squad Pillar 🌟'}</span>
          </div>

          {/* Tap hint */}
          <div className="flip-tap-hint" aria-hidden="true">
            <span>Tap for bio</span>
            <span className="flip-tap-arrow">↩</span>
          </div>
        </div>

        {/* ── BACK: Bio, Instagram, buttons ── */}
        <div className="flip-card-face flip-card-back">
          {/* Close hint */}
          <button
            type="button"
            className="flip-close-btn"
            onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
            title="Close bio"
            aria-label="Close bio"
          >
            <X size={14} />
          </button>

          {/* Mini avatar at top */}
          <div className="flip-back-mini-avatar">
            <div className="flip-back-mini-ring" />
            <div className="flip-back-mini-shell">
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.name}
                  className="flip-back-mini-img"
                  onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                />
              ) : (
                <div
                  className="flip-back-mini-gradient"
                  style={{ background: member.avatarGradient || 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                >
                  <span>{member.name.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Name row */}
          <div className="flip-back-name-row">
            <h3 className="flip-back-name">{member.name}</h3>
            {handle && (
              <a
                href={member.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flip-back-insta-pill"
                onClick={(e) => e.stopPropagation()}
              >
                <InstagramIcon size={11} />
                <span>@{handle}</span>
                <ArrowUpRight size={10} />
              </a>
            )}
          </div>
          <span className="flip-back-role">{member.role || 'Squad Pillar 🌟'}</span>

          {/* Bio */}
          <div className="flip-back-bio-box">
            <p className="flip-back-bio">{member.bio}</p>
          </div>

          {/* Quote */}
          {member.quote && (
            <div className="flip-back-quote">
              <Heart size={10} className="flip-back-quote-heart" />
              <p className="flip-back-quote-text">{member.quote}</p>
            </div>
          )}

          {/* Milestone tags */}
          {member.journeyMilestones && member.journeyMilestones.length > 0 && (
            <div className="flip-back-tags">
              {member.journeyMilestones.slice(0, 2).map((jm, i) => (
                <span key={i} className="flip-back-tag">✨ {jm.title}</span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flip-back-actions">
            <button
              type="button"
              className="btn-primary flip-action-btn"
              onClick={(e) => { e.stopPropagation(); onSelectMember(member); }}
            >
              <BookOpen size={13} />
              <span>Full Profile</span>
            </button>
            <button
              type="button"
              className="btn-secondary flip-action-btn"
              onClick={(e) => { e.stopPropagation(); if (onFilterByMember) onFilterByMember(member.name); }}
            >
              <Camera size={13} />
              <span>Memories</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function SquadMembers({ 
  members = [], 
  onSelectMember, 
  onFilterByMember
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const filteredMembers = members.filter((member) => {
    const matchesCategory = 
      activeFilter === 'all' || 
      (member.category && member.category.toLowerCase() === activeFilter.toLowerCase()) ||
      (activeFilter === 'core' && !member.category);

    const matchesSearch = 
      !searchQuery.trim() ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.nickname && member.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.role && member.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.bio && member.bio.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const DUO_IDS = ['maithreyan', 'gopika'];
  const isDuoMember = (m) => DUO_IDS.includes(m.id?.toLowerCase?.() || '') || DUO_IDS.includes(m.name?.toLowerCase?.() || '');

  const mainSquad = filteredMembers.filter(m => !isDuoMember(m));
  const duoSquad = filteredMembers.filter(m => isDuoMember(m));

  return (
    <section id="members" className="squad-community-section">
      <div className="section-header">
        <div className="badge-pill">
          <Users size={14} />
          <span>OFFICIAL SQUAD MEMBERS DIRECTORY</span>
        </div>
        <h2 className="section-title">
          The Squad Members
        </h2>
        <p className="section-desc">
          Meet every cornerstone of நட்பே துணை — Grace, Heenuuu, Divyaa, Puppy & Farish. <span className="section-desc-hint">Tap any photo to reveal their bio ↩</span>
        </p>
      </div>

      {/* Scalable Squad Control Dock */}
      <div className="squad-control-dock">
        <div className="squad-controls-main-row">
          <div className="squad-search-wrapper">
            <Search size={16} className="squad-search-icon" />
            <input 
              type="text"
              placeholder="Search squad members by name, nickname, or persona..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="squad-search-input"
            />
            {searchQuery && (
              <button 
                type="button" 
                className="squad-search-clear" 
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>

          <div className="squad-actions-group">
            <div className="view-mode-toggle" role="group" aria-label="View layout switcher">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Showcase Grid View"
                aria-label="Grid View"
              >
                <Grid size={15} />
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'compact' ? 'active' : ''}`}
                onClick={() => setViewMode('compact')}
                title="Compact Roster View"
                aria-label="Compact View"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        <div className="squad-filter-pills-row" role="tablist">
          {VIBE_FILTERS.map((filter) => {
            const count = filter.id === 'all' 
              ? members.length 
              : members.filter(m => m.category === filter.id || (filter.id === 'core' && !m.category)).length;
            return (
              <button
                key={filter.id}
                role="tab"
                aria-selected={activeFilter === filter.id}
                className={`squad-filter-pill ${activeFilter === filter.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                <span>{filter.label}</span>
                <span className="pill-counter">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Member Display */}
      {filteredMembers.length === 0 ? (
        <div className="squad-empty-state">
          <div className="empty-icon-circle">
            <HeartHandshake size={28} />
          </div>
          <h3>No squad members found</h3>
          <p>No squad mates matched "{searchQuery}". Try a different filter or search term!</p>
          <button 
            type="button" 
            className="btn-outline" 
            onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="squad-grid-container">
          {mainSquad.length > 0 && (
            <div className="flip-cards-grid">
              {mainSquad.map((member) => (
                <MemberFlipCard
                  key={member.id}
                  member={member}
                  onSelectMember={onSelectMember}
                  onFilterByMember={onFilterByMember}
                />
              ))}
            </div>
          )}

          {duoSquad.length > 0 && (
            <div className="squad-duo-section">
              <div className="squad-duo-header">
                <span className="squad-duo-line" />
                <div className="squad-duo-badge">
                  <Sparkles size={14} className="duo-sparkle" />
                  <span>The Duo • Maithreyan &amp; Gopika</span>
                  <Sparkles size={14} className="duo-sparkle" />
                </div>
                <span className="squad-duo-line" />
              </div>

              <div className="squad-duo-grid">
                {duoSquad.map((member) => (
                  <MemberFlipCard
                    key={member.id}
                    member={member}
                    onSelectMember={onSelectMember}
                    onFilterByMember={onFilterByMember}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Compact Roster View */
        <div className="squad-compact-roster">
          {filteredMembers.map((member) => {
            const isDuo = isDuoMember(member);
            return (
              <div 
                key={member.id} 
                className={`roster-row-card interactive-slab ${isDuo ? 'roster-duo-card' : ''}`}
                onClick={() => onSelectMember(member)}
              >
                <div className="roster-avatar-box">
                  {member.photo ? (
                    <img 
                      src={member.photo} 
                      alt={member.name} 
                      className="roster-avatar-img"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div 
                      className="roster-avatar-initials"
                      style={{ background: member.avatarGradient || 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                    >
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="roster-info-col">
                  <div className="roster-name-line">
                    <h4 className="roster-member-name">{member.name}</h4>
                    <span className="roster-nickname">"{member.nickname || member.name}"</span>
                    <span className="roster-role-chip">{member.role}</span>
                    {isDuo && <span className="roster-duo-chip">The Duo 💫</span>}
                  </div>
                  <p className="roster-bio-preview">{member.bio}</p>
                </div>

                <div className="roster-actions-col">
                  <button 
                    type="button" 
                    className="btn-secondary roster-btn"
                    onClick={(e) => { e.stopPropagation(); if (onFilterByMember) onFilterByMember(member.name); }}
                  >
                    <Camera size={13} />
                    <span>Memories</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary roster-btn"
                    onClick={(e) => { e.stopPropagation(); onSelectMember(member); }}
                  >
                    <BookOpen size={13} />
                    <span>Profile</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
