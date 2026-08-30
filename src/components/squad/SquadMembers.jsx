import React, { useState } from 'react';
import { 
  Users, 
  ArrowUpRight, 
  Sparkles, 
  BookOpen, 
  Search, 
  Grid, 
  List, 
  UserPlus, 
  Camera, 
  HeartHandshake,
  Edit2
} from 'lucide-react';
import InstagramIcon from '../ui/InstagramIcon';
import './SquadMembers.css';

const VIBE_FILTERS = [
  { id: 'all', label: 'All Squad' },
  { id: 'core', label: 'Core Squad 🌟' },
  { id: 'chaos', label: 'Energy & Chaos ⚡' },
  { id: 'vibe', label: 'Vibe & Chill 🌙' },
  { id: 'brains', label: 'Brains & Anchor 🧠' },
  { id: 'creators', label: 'Creative Souls 🎨' }
];

export default function SquadMembers({ 
  members = [], 
  currentUser = null,
  onSelectMember, 
  onFilterByMember, 
  onOpenAddMember,
  onEditMember
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'compact'

  // Filter members by category and search
  const filteredMembers = members.filter((member) => {
    const matchesCategory = 
      activeFilter === 'all' || 
      (member.category && member.category.toLowerCase() === activeFilter.toLowerCase()) ||
      (activeFilter === 'core' && !member.category); // fallback default

    const matchesSearch = 
      !searchQuery.trim() ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.nickname && member.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.role && member.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.bio && member.bio.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

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
          Meet every cornerstone of நட்பே துணை — Grace, Heenuuu, Divyaa, Puppy & Farish. Click on any friend to open their complete profile, quotes, and memories.
        </p>
      </div>

      {/* Scalable Squad Control Dock */}
      <div className="squad-control-dock">
        {/* Search Bar & Actions Top Row */}
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
            {/* View Mode Switcher */}
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

            {/* Add / Edit Member Button (ONLY VISIBLE WHEN LOGGED IN) */}
            {currentUser && onOpenAddMember && (
              <button 
                type="button"
                className="btn-secondary add-member-btn"
                onClick={onOpenAddMember}
              >
                <UserPlus size={15} />
                <span>Add / Customize</span>
              </button>
            )}
          </div>
        </div>

        {/* Vibe Category Pills Filter Row */}
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

      {/* Member Display (Grid or Compact) */}
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
        /* Showcase Grid View with Elegant Squircle Frames */
        <div className="squad-gallery-grid-v2">
          {filteredMembers.map((member) => (
            <article 
              key={member.id} 
              className="squad-member-card-v2 interactive-slab"
              onClick={() => onSelectMember(member)}
              role="button"
              tabIndex={0}
              aria-label={`View journey for ${member.name}`}
            >
              {/* Top Ambient Card Banner */}
              <div 
                className="member-card-banner"
                style={{
                  background: member.avatarGradient || 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.2))'
                }}
              >
                {/* Quick Edit (ONLY VISIBLE WHEN LOGGED IN) */}
                {currentUser && onEditMember && (
                  <button
                    type="button"
                    className="member-edit-quick-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditMember(member);
                    }}
                    title={`Edit ${member.name}`}
                    aria-label={`Edit ${member.name}`}
                  >
                    <Edit2 size={12} />
                  </button>
                )}
              </div>

              {/* Centered Modern Squircle Portrait Avatar */}
              <div className="member-avatar-stage">
                <div className="member-avatar-wrapper">
                  <div className="member-avatar-inner">
                    {member.photo ? (
                      <img 
                        src={member.photo} 
                        alt={member.name} 
                        className="member-avatar-img"
                        onError={(e) => { 
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.classList.add('fallback-gradient');
                        }}
                      />
                    ) : (
                      <div 
                        className="member-avatar-gradient"
                        style={{ background: member.avatarGradient || 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                      >
                        <span className="avatar-initials">
                          {member.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Floating Glass Role Badge */}
                <span className="member-glass-role-badge">
                  {member.role || "Squad Pillar 🌟"}
                </span>
              </div>

              {/* Card Body Details */}
              <div className="member-v2-body">
                <div className="member-v2-name-row">
                  <h3 className="member-v2-name">{member.name}</h3>
                  <span className="member-v2-nickname">"{member.nickname || member.name}"</span>
                </div>

                <p className="member-v2-bio">{member.bio}</p>

                {member.quote && (
                  <div className="member-v2-quote">
                    <span className="quote-glyph">“</span>
                    <p className="quote-snippet">{member.quote}</p>
                  </div>
                )}

                {/* Milestone Tags */}
                {member.journeyMilestones && member.journeyMilestones.length > 0 && (
                  <div className="member-v2-tags">
                    {member.journeyMilestones.slice(0, 2).map((jm, i) => (
                      <span key={i} className="member-tag-item">
                        ✨ {jm.title}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons Dock */}
                <div className="member-v2-actions">
                  <button 
                    type="button"
                    className="btn-primary member-profile-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMember(member);
                    }}
                  >
                    <BookOpen size={13} />
                    <span>Profile</span>
                  </button>

                  <button 
                    type="button"
                    className="btn-secondary member-memories-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onFilterByMember) onFilterByMember(member.name);
                    }}
                    title={`Filter memories with ${member.name}`}
                  >
                    <Camera size={13} />
                    <span>Memories</span>
                  </button>

                  {member.instagram && (
                    <a 
                      href={member.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="member-v2-insta-btn"
                      onClick={(e) => e.stopPropagation()}
                      title={`Connect with ${member.name} on Instagram`}
                      aria-label={`Connect with ${member.name} on Instagram`}
                    >
                      <InstagramIcon size={14} />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Compact Roster View */
        <div className="squad-compact-roster">
          {filteredMembers.map((member) => (
            <div 
              key={member.id} 
              className="roster-row-card interactive-slab"
              onClick={() => onSelectMember(member)}
            >
              <div className="roster-avatar-box">
                {member.photo ? (
                  <img 
                    src={member.photo} 
                    alt={member.name} 
                    className="roster-avatar-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
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
                </div>
                <p className="roster-bio-preview">{member.bio}</p>
              </div>

              <div className="roster-actions-col">
                <button 
                  type="button" 
                  className="btn-secondary roster-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onFilterByMember) onFilterByMember(member.name);
                  }}
                >
                  <Camera size={13} />
                  <span>Memories</span>
                </button>
                <button 
                  type="button" 
                  className="btn-primary roster-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMember(member);
                  }}
                >
                  <BookOpen size={13} />
                  <span>Profile</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
