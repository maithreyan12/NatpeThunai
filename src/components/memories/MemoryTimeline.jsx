import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Camera,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import MemoryCard from './MemoryCard';
import { getStoredMembers } from '../../services';
import './MemoryTimeline.css';

const CATEGORY_TABS = ['All Moments', 'Adventures', 'Milestones', 'Reunions', 'Daily Laughs'];

export default function MemoryTimeline({ 
  memories = [], 
  members = [],
  activeMemberFilter = 'All',
  onSelectMemberFilter,
  onReact, 
  onAddComment, 
  onOpenLightbox,
  currentUser 
}) {
  const [selectedCategory, setSelectedCategory] = useState('All Moments');
  const [selectedMember, setSelectedMember] = useState(activeMemberFilter || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollTrackRef = useRef(null);

  // Sync with prop changes if parent triggers filter from friend card
  useEffect(() => {
    if (activeMemberFilter) {
      setSelectedMember(activeMemberFilter);
    }
  }, [activeMemberFilter]);

  const squadList = members.length > 0 ? members : getStoredMembers();

  const handleMemberChange = (name) => {
    setSelectedMember(name);
    if (onSelectMemberFilter) {
      onSelectMemberFilter(name);
    }
  };

  const handleScrollLeft = () => {
    scrollTrackRef.current?.scrollBy({ left: -220, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    scrollTrackRef.current?.scrollBy({ left: 220, behavior: 'smooth' });
  };

  // Filter memories by category, friend, and search
  const filteredMemories = memories.filter(m => {
    const matchesCategory = 
      selectedCategory === 'All Moments' || 
      (m.category && m.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (selectedCategory === 'Adventures' && (m.category === 'Trip' || m.category === 'Adventure' || m.category === 'Adventures')) ||
      (selectedCategory === 'Daily Laughs' && (m.category === 'Moment' || m.category === 'Laughs' || m.category === 'Daily Laughs'));

    const matchesMember = 
      selectedMember === 'All' || 
      (m.people && m.people.some(p => p.toLowerCase().includes(selectedMember.toLowerCase()) || selectedMember.toLowerCase().includes(p.toLowerCase())));

    const matchesSearch = 
      !searchQuery.trim() ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.location && m.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.people && m.people.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesMember && matchesSearch;
  });

  return (
    <section id="timeline" className="timeline-section">
      <div className="section-header">
        <div className="badge-pill">
          <Calendar size={14} />
          <span>TIMELESS GANG VAULT</span>
        </div>
        <h2 className="section-title">
          Our Memory Timeline
        </h2>
        <p className="section-desc">
          Every photo, late-night adventure, and shared smile with our gang, preserved in timeless beauty.
        </p>
      </div>

      {/* Control Filter Bar */}
      <div className="timeline-filter-bar">
        {/* Top: Filter by Member with Scrollable Carousel Track */}
        <div className="member-filter-strip">
          <div className="filter-header-line">
            <span className="filter-label">Filter by Friend:</span>
            {selectedMember !== 'All' && (
              <button 
                type="button" 
                className="clear-member-filter-btn"
                onClick={() => handleMemberChange('All')}
              >
                Clear Friend Filter ×
              </button>
            )}
          </div>

          <div className="member-scroll-wrapper">
            <button 
              type="button"
              className="scroll-peek-btn left"
              onClick={handleScrollLeft}
              aria-label="Scroll friends left"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="member-avatar-pills-row" ref={scrollTrackRef}>
              <button
                type="button"
                className={`member-filter-pill ${selectedMember === 'All' ? 'active' : ''}`}
                onClick={() => handleMemberChange('All')}
              >
                <Users size={14} />
                <span>All Squad</span>
              </button>

              {squadList.map(member => (
                <button
                  key={member.id}
                  type="button"
                  className={`member-filter-pill ${selectedMember === member.name ? 'active' : ''}`}
                  onClick={() => handleMemberChange(member.name)}
                >
                  {member.photo ? (
                    <img 
                      src={member.photo} 
                      alt={member.name} 
                      className="member-pill-avatar"
                      onError={(e) => { 
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div 
                      className="member-pill-initial"
                      style={{ background: member.avatarGradient || 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                    >
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span>{member.name}</span>
                </button>
              ))}
            </div>

            <button 
              type="button"
              className="scroll-peek-btn right"
              onClick={handleScrollRight}
              aria-label="Scroll friends right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Bottom Row: Category Filter & Search Bar */}
        <div className="timeline-subfilter-row">
          {/* Category Filter Chips */}
          <div className="year-tabs-group" role="tablist">
            {CATEGORY_TABS.map(tab => (
              <button
                key={tab}
                role="tab"
                aria-selected={selectedCategory === tab}
                className={`year-tab-btn ${selectedCategory === tab ? 'active' : ''}`}
                onClick={() => setSelectedCategory(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="timeline-actions-group">
            <div className="timeline-search-box">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search memories, locations, friends..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="timeline-search-input"
              />
              {searchQuery && (
                <button 
                  type="button"
                  className="search-clear-mini"
                  onClick={() => setSearchQuery('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Memory Grid or Empty State */}
      {filteredMemories.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-state-icon">
            <Camera size={26} />
          </div>
          <h3 className="empty-state-title">No memories found</h3>
          <p className="empty-state-text">
            {selectedMember !== 'All' 
              ? `No memories tagged with ${selectedMember} in this category.` 
              : `No memories match "${searchQuery}". Try choosing another category or clearing your search.`}
          </p>
          <button 
            type="button" 
            className="btn-outline"
            onClick={() => { setSelectedCategory('All Moments'); handleMemberChange('All'); setSearchQuery(''); }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="memory-cards-grid">
          {filteredMemories.map(memory => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onReact={onReact}
              onAddComment={onAddComment}
              onOpenLightbox={onOpenLightbox}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </section>
  );
}
