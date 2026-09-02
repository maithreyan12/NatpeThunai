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
import MatchedDualReel from '../ui/MatchedDualReel';
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

  // Prepare matched dual streams: Maithreyan & Boys (Left) and Gopika & Girls (Right)
  const { boysList, girlsList } = useMemo(() => {
    const memberMap = new Map();
    (members || []).forEach(m => {
      if (m?.id) memberMap.set(m.id.toLowerCase(), m);
      if (m?.name) memberMap.set(m.name.toLowerCase(), m);
    });

    const getMemberPhoto = (id, fallbackR2) => {
      const found = memberMap.get(id.toLowerCase());
      if (found && found.photo) return found.photo;
      return fallbackR2 ? r2Photo(fallbackR2) : `/photos/${fallbackR2}`;
    };

    const getMemberField = (id, field, fallback) => {
      const found = memberMap.get(id.toLowerCase());
      return found?.[field] || fallback;
    };

    // 1. BOYS STREAM — Led by Maithreyan
    const boys = [
      {
        id: 'maithreyan',
        name: getMemberField('maithreyan', 'name', 'Maithreyan'),
        role: getMemberField('maithreyan', 'role', 'Duo · Tech & Vibe Pilot 🚀'),
        src: getMemberPhoto('maithreyan', null) || 'https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev/members/2026-09/1788346038031-lbh4ge_IMG_2100.jpeg',
        fallbackSrc: 'https://pub-5eb58baa7fba49158317c089031c3d49.r2.dev/members/2026-09/1788346038031-lbh4ge_IMG_2100.jpeg',
        isLead: true
      },
      {
        id: 'farish',
        name: getMemberField('farish', 'name', 'Farish Sharif'),
        role: getMemberField('farish', 'role', 'The Mastermind 🧠'),
        src: getMemberPhoto('farish', 'farish.jpg'),
        fallbackSrc: '/photos/farish.jpg'
      },
      {
        id: 'samuel',
        name: getMemberField('samuel', 'name', 'Samuel'),
        role: getMemberField('samuel', 'role', 'The Joyful Soul 🌟'),
        src: getMemberPhoto('samuel', 'samuel.jpg'),
        fallbackSrc: '/photos/samuel.jpg'
      },
      {
        id: 'meshak',
        name: getMemberField('meshak', 'name', 'Meshak'),
        role: getMemberField('meshak', 'role', 'The Silent Strength 🛡️'),
        src: getMemberPhoto('meshak', 'meshak.jpg'),
        fallbackSrc: '/photos/meshak.jpg'
      },
      {
        id: 'kafil',
        name: getMemberField('kafil', 'name', 'Kafil'),
        role: getMemberField('kafil', 'role', 'The Creative Soul 🎨'),
        src: getMemberPhoto('kafil', 'kafil.jpg'),
        fallbackSrc: '/photos/kafil.jpg'
      }
    ];

    // 2. GIRLS STREAM — Led by Gopika
    const girls = [
      {
        id: 'gopika',
        name: getMemberField('gopika', 'name', 'Gopika'),
        role: getMemberField('gopika', 'role', 'Duo · The Graceful Heart 🌸'),
        src: getMemberPhoto('gopika', null) || r2Photo('Gracee.jpg'),
        fallbackSrc: '/photos/Gracee.jpg',
        isLead: true
      },
      {
        id: 'grace',
        name: getMemberField('grace', 'name', 'Grace'),
        role: getMemberField('grace', 'role', 'The Spark & Creative ✨'),
        src: getMemberPhoto('grace', 'Gracee.jpg'),
        fallbackSrc: '/photos/Gracee.jpg'
      },
      {
        id: 'divyaaa',
        name: getMemberField('divyaaa', 'name', 'Divyaaa'),
        role: getMemberField('divyaaa', 'role', 'The Sunshine ☀️'),
        src: getMemberPhoto('divyaaa', 'Divyaa.jpg'),
        fallbackSrc: '/photos/Divyaa.jpg'
      },
      {
        id: 'jaffreen',
        name: getMemberField('jaffreen', 'name', 'Jaffreen'),
        role: getMemberField('jaffreen', 'role', 'The Sweet Heart 💖'),
        src: getMemberPhoto('jaffreen', 'jaffreen.jpg'),
        fallbackSrc: '/photos/jaffreen.jpg'
      },
      {
        id: 'haniya',
        name: getMemberField('haniya', 'name', 'Haniya'),
        role: getMemberField('haniya', 'role', 'The Chill Sloth 🦥'),
        src: getMemberPhoto('haniya', 'hanuu.jpg'),
        fallbackSrc: '/photos/hanuu.jpg'
      },
      {
        id: 'harshitha',
        name: getMemberField('harshitha', 'name', 'Harshitha'),
        role: getMemberField('harshitha', 'role', 'Radiant Sunshine 🌻'),
        src: getMemberPhoto('harshitha', 'harshuuu.jpg'),
        fallbackSrc: '/photos/harshuuu.jpg'
      },
      {
        id: 'heenuuu',
        name: getMemberField('heenuuu', 'name', 'Heenuuu'),
        role: getMemberField('heenuuu', 'role', 'The Spark & Heart 💖'),
        src: getMemberPhoto('heenuuu', 'Heenuuu.jpg'),
        fallbackSrc: '/photos/Heenuuu.jpg'
      },
      {
        id: 'puppy',
        name: getMemberField('puppy', 'name', 'Puppy'),
        role: getMemberField('puppy', 'role', 'The Chill Vibe 🎯'),
        src: getMemberPhoto('puppy', 'Puppy.jpg'),
        fallbackSrc: '/photos/Puppy.jpg'
      },
      {
        id: 'afnaan',
        name: getMemberField('afnaan', 'name', 'Afnaaan'),
        role: getMemberField('afnaan', 'role', 'The Energy Dynamo ⚡'),
        src: getMemberPhoto('afnaan', 'affu.jpg'),
        fallbackSrc: '/photos/affu.jpg'
      }
    ];

    return { boysList: boys, girlsList: girls };
  }, [members]);

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

      {/* Matched Dual-Stream Photo Reel: Maithreyan & Boys vs Gopika & Girls */}
      <MatchedDualReel
        boys={boysList}
        girls={girlsList}
        onPhotoClick={(photoUrl) => onOpenLightbox && onOpenLightbox(photoUrl)}
      />

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
