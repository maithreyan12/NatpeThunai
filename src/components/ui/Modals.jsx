import React, { useState } from 'react';
import { X, Calendar, MapPin } from 'lucide-react';
import './Modals.css';

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
      date: date.trim(),
      time,
      location: location.trim(),
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
            <span className="modal-badge-tag">SQUAD CALENDAR</span>
            <h3 className="modal-title">Schedule An Event</h3>
          </div>
          <button className="modal-close-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Annual Squad Grand Reunion / Beach Sunset"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">
                <Calendar size={13} /> Date
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Oct 24"
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
              <label className="form-label">
                <MapPin size={13} /> Location
              </label>
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
