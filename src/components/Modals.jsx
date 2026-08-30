import React, { useState, useRef } from 'react';
import { X, MapPin, Users, Sparkles, Upload, Check } from 'lucide-react';
import './Modals.css';

// ── ADD MEMORY MODAL ──
export function AddMemoryModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('Chapter 4');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Moment');
  const [mediaUrl, setMediaUrl] = useState('/photos/friend1.jpg');
  const [mediaType, setMediaType] = useState('image');
  const [people, setPeople] = useState(['Grace', 'Heenuuu']);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const squadList = ['Grace', 'Heenuuu', 'Divyaaa', 'Puppy'];

  const togglePerson = (name) => {
    setPeople(prev => 
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      setMediaType(isVideo ? 'video' : 'image');
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setMediaUrl(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      year,
      date,
      description: description.trim(),
      location: location.trim(),
      category,
      mediaUrl,
      mediaType,
      people,
      reactions: { '❤️': 1, '✨': 1 },
      comments: []
    });
    setTitle('');
    setDescription('');
    setLocation('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-info">
            <span className="modal-badge-tag">SQUAD ARCHIVE</span>
            <h3 className="modal-title">Preserve A New Memory</h3>
          </div>
          <button className="modal-close-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Chapter selector pills */}
          <div className="form-group">
            <label className="form-label">Story Chapter / Milestones</label>
            <div className="year-selector-row">
              {['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4'].map(y => (
                <button
                  type="button"
                  key={y}
                  className={`year-chip ${year === y ? 'active' : ''}`}
                  onClick={() => setYear(y)}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Date */}
          <div className="form-row">
            <div className="form-group flex-2">
              <label className="form-label">Memory Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Midnight Highway Drive & Chai"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">Date</label>
              <input
                type="text"
                className="form-input"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">What made this moment unforgettable?</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Tell the story behind this moment... the laughs, the late night thoughts, the unscripted magic."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Media Upload / Choice */}
          <div className="form-group">
            <label className="form-label">Memory Photo / Video</label>
            <div className="media-preview-box">
              {mediaType === 'video' ? (
                <video src={mediaUrl} className="preview-media" controls />
              ) : (
                <img src={mediaUrl} alt="Preview" className="preview-media" />
              )}
              <div className="media-controls-overlay">
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} />
                  <span>Upload File</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
            {/* Quick squad photo pickers */}
            <div className="quick-photo-row">
              <span className="quick-pick-hint">Or choose squad capture:</span>
              {['/photos/friend1.jpg', '/photos/friend2.jpg', '/photos/friend3.jpg', '/photos/friend4.jpg'].map((pic, idx) => (
                <button
                  type="button"
                  key={idx}
                  className={`quick-thumb-btn ${mediaUrl === pic ? 'selected' : ''}`}
                  onClick={() => { setMediaUrl(pic); setMediaType('image'); }}
                >
                  <img src={pic} alt={`Squad ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Location & Category */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">
                <MapPin size={13} /> Location
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. City Hilltop / Campus Café"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Moment">Daily Moment</option>
                <option value="Milestone">Milestone</option>
                <option value="Adventures">Adventures & Trips</option>
                <option value="Celebration">Celebration</option>
                <option value="Today">Today / Current</option>
              </select>
            </div>
          </div>

          {/* Tagged Friends */}
          <div className="form-group">
            <label className="form-label">
              <Users size={13} /> Friends Involved
            </label>
            <div className="people-chips-row">
              {squadList.map(name => {
                const isSelected = people.includes(name);
                return (
                  <button
                    type="button"
                    key={name}
                    className={`people-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => togglePerson(name)}
                  >
                    {isSelected && <Check size={12} />}
                    <span>{name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="modal-actions-row">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Sparkles size={16} />
              <span>Save to Memory Archive</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── CREATE COMMUNITY POST MODAL ──
export function CreatePostModal({ isOpen, onClose, onSave, currentUser }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Moment');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSave({ content: content.trim(), category }, currentUser);
    setContent('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-info">
            <span className="modal-badge-tag">SQUAD COMMUNITY</span>
            <h3 className="modal-title">Share With The Squad</h3>
          </div>
          <button className="modal-close-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="What's on your mind? Share a thought, spontaneous idea, or road trip update..."
              value={content}
              onChange={e => setContent(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Post Tag</label>
            <div className="category-chips-row">
              {['Moment', 'Announcement', 'Plan'].map(cat => (
                <button
                  type="button"
                  key={cat}
                  className={`category-tag-btn ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions-row">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <span>Post to Squad</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── ADD EVENT MODAL ──
export function AddEventModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('6:00 PM');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Reunion');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;
    onSave({
      title: title.trim(),
      date,
      time,
      location: location.trim() || 'Squad Sanctuary',
      description: description.trim(),
      category
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-info">
            <span className="modal-badge-tag">MILESTONES & MEETUPS</span>
            <h3 className="modal-title">Add Upcoming Event</h3>
          </div>
          <button className="modal-close-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Event Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 2026 Annual Squad Reunion"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Date *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. October 15, 2026"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">Time</label>
              <input
                type="text"
                className="form-input"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. City Hilltop Viewpoint"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Reunion">Reunion</option>
                <option value="Road Trip">Road Trip</option>
                <option value="Celebration">Celebration</option>
                <option value="Screening">Screening Night</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="What are we planning? Dress code, snacks, itinerary..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-actions-row">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <span>Create Event</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── LIGHTBOX VIEWER MODAL ──
export function LightboxModal({ isOpen, onClose, memory }) {
  if (!isOpen || !memory) return null;

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <button className="lightbox-close-btn" onClick={onClose} aria-label="Close Fullscreen">
        <X size={24} />
      </button>
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        <div className="lightbox-media-container">
          {memory.mediaType === 'video' ? (
            <video src={memory.mediaUrl} controls autoPlay className="lightbox-media" />
          ) : (
            <img src={memory.mediaUrl} alt={memory.title} className="lightbox-media" />
          )}
        </div>
        <div className="lightbox-caption-bar">
          <div className="caption-meta">
            <span className="caption-year-pill">{memory.category || "Moment"}</span>
            <span className="caption-date">{memory.date}</span>
            {memory.location && <span className="caption-location">• {memory.location}</span>}
          </div>
          <h4 className="caption-title">{memory.title}</h4>
          {memory.description && <p className="caption-desc">{memory.description}</p>}
        </div>
      </div>
    </div>
  );
}
