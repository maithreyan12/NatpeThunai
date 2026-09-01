import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  Camera,
  Users,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  ImagePlus,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import MemoryCard from './MemoryCard';
import InfiniteSpiral from '../ui/InfiniteSpiral';
import { getStoredMembers, uploadToR2WithGuardrails, r2Photo } from '../../services';
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
  onUploadPhotos,
  currentUser 
}) {
  const [selectedCategory, setSelectedCategory] = useState('All Moments');
  const [selectedMember, setSelectedMember] = useState(activeMemberFilter || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const scrollTrackRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const processFiles = async (fileList) => {
    const validFiles = Array.from(fileList).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
    if (validFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgress(10);

    const newMemories = [];
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      try {
        const uploadResult = await uploadToR2WithGuardrails(
          file, 
          'memories',
          (percent) => {
            const stepProgress = Math.round(((i + (percent / 100)) / validFiles.length) * 100);
            setUploadProgress(stepProgress);
          }
        );

        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .trim();
        
        const formattedTitle = cleanName 
          ? (cleanName.charAt(0).toUpperCase() + cleanName.slice(1)) 
          : 'Squad Memory';

        newMemories.push({
          title: formattedTitle,
          description: 'Cherished squad memory added to the album ❤️',
          mediaUrl: uploadResult.publicUrl,
          mediaType: uploadResult.fileType,
          r2ObjectKey: uploadResult.objectKey || null,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          location: 'Squad Sanctuary',
          people: ['Grace', 'Heenuuu', 'Divyaa', 'Puppy', 'Farish'],
          category: selectedCategory === 'All Moments' ? 'Moments' : selectedCategory
        });
      } catch (err) {
        console.warn('Error uploading media to R2:', err);
      }
    }

    if (newMemories.length > 0 && onUploadPhotos) {
      await onUploadPhotos(newMemories);
      setSelectedCategory('All Moments');
      setSelectedMember('All');
    }
    setIsUploading(false);
    setUploadProgress(0);
  };

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

  // Prepare dynamic spiral items from cloud R2 photos & memory entries (web-safe formats only)
  const spiralItems = useMemo(() => {
    const isWebImage = (url) => {
      if (!url || typeof url !== 'string') return false;
      const cleanUrl = url.split('?')[0].toLowerCase();
      // Exclude raw Apple HEIC/HEIF files which browsers cannot decode directly
      if (cleanUrl.endsWith('.heic') || cleanUrl.endsWith('.heif')) return false;
      return true;
    };

    const memoryPhotos = (memories || [])
      .filter(m => m.mediaUrl && m.mediaType !== 'video' && isWebImage(m.mediaUrl))
      .slice(0, 6)
      .map((m, idx) => ({
        id: m.id || `memory-${idx}`,
        src: m.mediaUrl,
        alt: m.title || 'Squad memory',
        fallbackSrc: '/photos/farish.jpg'
      }));

    const memberPhotos = [
      { id: 'kafil', src: r2Photo('kafil.jpg'), fallbackSrc: '/photos/kafil.jpg', alt: 'Kafil..KK' },
      { id: 'grace', src: r2Photo('Gracee.jpg'), fallbackSrc: '/photos/Gracee.jpg', alt: 'Grace' },
      { id: 'jaffreen', src: r2Photo('jaffreen.jpg'), fallbackSrc: '/photos/jaffreen.jpg', alt: 'Jaffreen' },
      { id: 'haniya', src: r2Photo('hanuu.jpg'), fallbackSrc: '/photos/hanuu.jpg', alt: 'Haniya' },
      { id: 'farish', src: r2Photo('farish.jpg'), fallbackSrc: '/photos/farish.jpg', alt: 'Farish Sharif' },
      { id: 'divyaa', src: r2Photo('Divyaa.jpg'), fallbackSrc: '/photos/Divyaa.jpg', alt: 'Divyaa' },
      { id: 'samuel', src: r2Photo('samuel.jpg'), fallbackSrc: '/photos/samuel.jpg', alt: 'Samuel' },
      { id: 'meshak', src: r2Photo('meshak.jpg'), fallbackSrc: '/photos/meshak.jpg', alt: 'Meshak' },
      { id: 'afnan', src: r2Photo('affu.jpg'), fallbackSrc: '/photos/affu.jpg', alt: 'Afnan' },
      { id: 'harshitha', src: r2Photo('harshuuu.jpg'), fallbackSrc: '/photos/harshuuu.jpg', alt: 'Harshitha' }
    ];

    return [...memberPhotos, ...memoryPhotos];
  }, [memories]);

  return (
    <section id="timeline" className="timeline-section">
      <div className="section-header">
        <div className="badge-pill">
          <Camera size={14} />
          <span>SQUAD PHOTO ALBUM & VAULT</span>
        </div>
        <h2 className="section-title">
          Our Photo Album & Memories
        </h2>
        <p className="section-desc">
          Browse authentic squad photos from first year to now, filter by friend, view high-res polaroids, and relive every journey.
        </p>
      </div>

      {/* 3D Infinite Spiral Memory Vortex — Borderless Full-Screen Flow */}
      <div className="memory-spiral-fullscreen-stage">
        <InfiniteSpiral
          items={spiralItems}
          animationMode="all"
          speed={0.55}
          radius={205}
          cardWidth={148}
          cardHeight={112}
          verticalSpacing={68}
          perspective={840}
          cardRadius={16}
          centerScale={1.34}
          edgeBlur={5.5}
          cardsPerTurn={6}
          pauseOnHover
          direction="up"
          rotation={0}
          cardTilt={0}
          edgeFade={0.75}
          imageFit="cover"
          grayscale={0.05}
          onItemClick={(item) => onOpenLightbox && onOpenLightbox(item.src)}
        />
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

          {/* Search Bar & Upload Button */}
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

            <button
              type="button"
              className="album-upload-header-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="Upload group photos from your device"
            >
              <UploadCloud size={15} />
              <span>{isUploading ? 'Uploading...' : 'Upload Photos'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Memory Grid or Empty State */}
      {filteredMemories.length === 0 ? (
        memories.length === 0 ? (
          <div 
            className={`album-dropzone-box ${isDragging ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="dropzone-ambient-orb" aria-hidden="true" />
            <div className="dropzone-icon-ring">
              <UploadCloud size={36} />
            </div>
            <span className="modal-badge-tag">SQUAD PHOTO VAULT</span>
            <h3 className="dropzone-title">Your Squad Photo Album is Ready</h3>
            <p className="dropzone-desc">
              Drag & drop your favorite squad group photos here, or click below to upload directly from your device.
            </p>

            <button 
              type="button" 
              className="dropzone-select-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <ImagePlus size={18} />
              <span>{isUploading ? 'Uploading Photos...' : 'Upload Group Photos'}</span>
            </button>

            <div className="dropzone-supported-tags">
              <span>PNG</span>
              <span className="dot">•</span>
              <span>JPG</span>
              <span className="dot">•</span>
              <span>WEBP</span>
              <span className="dot">•</span>
              <span>Multi-Upload Ready</span>
            </div>
          </div>
        ) : (
          <div className="empty-state-box">
            <div className="empty-state-icon">
              <Camera size={26} />
            </div>
            <h3 className="empty-state-title">No photos found in this filter</h3>
            <p className="empty-state-text">
              No memories match "{selectedCategory}" or "{selectedMember}".
            </p>
            <button 
              type="button" 
              className="filter-reset-pill-btn"
              onClick={() => { 
                setSelectedCategory('All Moments'); 
                handleMemberChange('All'); 
                setSearchQuery(''); 
              }}
            >
              <RotateCcw size={14} />
              <span>Show All Squad Moments ({memories.length})</span>
            </button>
          </div>
        )
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

      {/* Hidden File Input for Native File Picker */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        multiple 
        style={{ display: 'none' }} 
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
            e.target.value = '';
          }
        }} 
      />
    </section>
  );
}
