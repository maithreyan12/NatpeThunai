import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  Camera,
  Users,
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
    const validFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
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

  // Filter memories by category, friend, and search (PHOTOS ONLY — strictly exclude videos/reels)
  const isPhotoOnly = (m) => {
    if (!m) return false;
    if (m.isReel) return false;
    if (m.mediaType === 'video') return false;
    if (typeof m.mediaUrl === 'string') {
      const u = m.mediaUrl.toLowerCase();
      if (u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.mov') || u.endsWith('.m4v')) return false;
    }
    return true;
  };

  const filteredMemories = memories.filter(isPhotoOnly).filter(m => {
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


  // Prepare dynamic spiral items with exact requested order: Maithreyan -> Gopika -> Squad Girls -> Squad Boys -> Memories
  const spiralItems = useMemo(() => {
    const memberMap = new Map();
    (members || []).forEach(m => {
      if (m?.id) memberMap.set(m.id.toLowerCase(), m);
      if (m?.name) memberMap.set(m.name.toLowerCase(), m);
    });

    const getPhoto = (id, fallbackR2) => {
      const found = memberMap.get(id.toLowerCase());
      if (found && found.photo) return found.photo;
      return fallbackR2 ? r2Photo(fallbackR2) : `/photos/${fallbackR2}`;
    };

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

    // Ordered: Squad members first -> Maithreyan -> Gopika -> Squad Girl (Grace)
    const orderedMemberPhotos = [
      { id: 'kafil', src: getPhoto('kafil', 'kafil.jpg'), fallbackSrc: '/photos/kafil.jpg', alt: 'Kafil' },
      { id: 'farish', src: getPhoto('farish', 'farish.jpg'), fallbackSrc: '/photos/farish.jpg', alt: 'Farish Sharif' },
      { id: 'samuel', src: getPhoto('samuel', 'samuel.jpg'), fallbackSrc: '/photos/samuel.jpg', alt: 'Samuel' },
      { id: 'meshak', src: getPhoto('meshak', 'meshak.jpg'), fallbackSrc: '/photos/meshak.jpg', alt: 'Meshak' },
      { id: 'haniya', src: getPhoto('haniya', 'hanuu.jpg'), fallbackSrc: '/photos/hanuu.jpg', alt: 'Haniya' },
      { id: 'jaffreen', src: getPhoto('jaffreen', 'jaffreen.jpg'), fallbackSrc: '/photos/jaffreen.jpg', alt: 'Jaffreen' },
      { id: 'harshitha', src: getPhoto('harshitha', 'harshuuu.jpg'), fallbackSrc: '/photos/harshuuu.jpg', alt: 'Harshitha' },
      { id: 'heenuuu', src: getPhoto('heenuuu', 'Heenuuu.jpg'), fallbackSrc: '/photos/Heenuuu.jpg', alt: 'Heenuuu' },
      { id: 'puppy', src: getPhoto('puppy', 'Puppy.jpg'), fallbackSrc: '/photos/Puppy.jpg', alt: 'Puppy' },
      { id: 'afnaan', src: getPhoto('afnaan', 'affu.jpg'), fallbackSrc: '/photos/affu.jpg', alt: 'Afnaaan' },
      { id: 'divyaaa', src: getPhoto('divyaaa', 'Divyaa.jpg'), fallbackSrc: '/photos/Divyaa.jpg', alt: 'Divyaaa' },

      // Me (Maithreyan) and Gopika added last
      { 
        id: 'maithreyan', 
        src: getPhoto('maithreyan', null) || 'https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev/members/2026-09/1788346038031-lbh4ge_IMG_2100.jpeg', 
        fallbackSrc: 'https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev/members/2026-09/1788346038031-lbh4ge_IMG_2100.jpeg', 
        alt: 'Maithreyan' 
      },
      { 
        id: 'gopika', 
        src: getPhoto('gopika', null) || r2Photo('Gracee.jpg'), 
        fallbackSrc: '/photos/Gracee.jpg', 
        alt: 'Gopika' 
      },

      // Next after Gopika: Girl (Grace)
      { id: 'grace', src: getPhoto('grace', 'Gracee.jpg'), fallbackSrc: '/photos/Gracee.jpg', alt: 'Grace' }
    ];

    return [...orderedMemberPhotos, ...memoryPhotos];
  }, [memories, members]);

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
          radius={225}
          cardWidth={140}
          cardHeight={175}
          verticalSpacing={75}
          perspective={860}
          cardRadius={18}
          centerScale={1.3}
          edgeBlur={5}
          cardsPerTurn={7}
          pauseOnHover
          direction="up"
          rotation={0}
          cardTilt={0}
          edgeFade={0.75}
          imageFit="cover"
          grayscale={0}
          onItemClick={(item) => onOpenLightbox && onOpenLightbox(item.src)}
        />
      </div>

      {/* Control Filter Bar */}
      <div className="timeline-filter-bar">
        {/* Category Filter & Search Bar */}
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
