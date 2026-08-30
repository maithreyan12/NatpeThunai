import React, { useState } from 'react';
import { 
  Calendar, 
  Search, 
  Camera,
  Users
} from 'lucide-react';
import MemoryCard from './MemoryCard';
import { SQUAD_MEMBERS } from '../../services';
import './MemoryTimeline.css';

const CATEGORY_TABS = ['All Moments', 'Adventures', 'Milestones', 'Reunions', 'Daily Laughs'];

export default function MemoryTimeline({ 
  memories, 
  onReact, 
  onAddComment, 
  onOpenLightbox,
  currentUser 
}) {
  const [selectedCategory, setSelectedCategory] = useState('All Moments');
  const [selectedMember, setSelectedMember] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter memories by category and friend
  const filteredMemories = memories.filter(m => {
    const matchesCategory = 
      selectedCategory === 'All Moments' || 
      (m.category && m.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (selectedCategory === 'Adventures' && (m.category === 'Trip' || m.category === 'Adventure')) ||
      (selectedCategory === 'Daily Laughs' && (m.category === 'Moment' || m.category === 'Laughs'));

    const matchesMember = 
      selectedMember === 'All' || 
      (m.people && m.people.some(p => p.toLowerCase() === selectedMember.toLowerCase()));

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
          <span>TIMELESS ALBUM</span>
        </div>
        <h2 className="section-title">
          Our Memory Timeline
        </h2>
        <p className="section-desc">
          Every photo, late-night adventure, and shared smile, preserved in timeless beauty.
        </p>
      </div>

      {/* Control Filter Bar */}
      <div className="timeline-filter-bar">
        {/* Top: Filter by Member with Photo Avatars */}
        <div className="member-filter-strip">
          <span className="filter-label">Filter by Friend:</span>
          <div className="member-avatar-pills-row">
            <button
              type="button"
              className={`member-filter-pill ${selectedMember === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedMember('All')}
            >
              <Users size={14} />
              <span>All Squad</span>
            </button>

            {SQUAD_MEMBERS.map(member => (
              <button
                key={member.id}
                type="button"
                className={`member-filter-pill ${selectedMember === member.name ? 'active' : ''}`}
                onClick={() => setSelectedMember(member.name)}
              >
                <img 
                  src={member.photo} 
                  alt={member.name} 
                  className="member-pill-avatar"
                  onError={(e) => { e.target.src = '/photos/friend1.jpg'; }}
                />
                <span>{member.name}</span>
              </button>
            ))}
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
                placeholder="Search memories, locations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="timeline-search-input"
              />
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
          <h3 className="empty-state-title">No memories found.</h3>
          <p className="empty-state-text">
            No memories match the selected filter. Try choosing another category or friend tab!
          </p>
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
