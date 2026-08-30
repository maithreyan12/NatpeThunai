import React, { useState } from 'react';
import { X, UserPlus, Sparkles, Quote, Award } from 'lucide-react';
import InstagramIcon from '../ui/InstagramIcon';
import '../ui/Modals.css';

const CATEGORIES = [
  { id: 'core', label: 'Core Squad 🌟' },
  { id: 'chaos', label: 'Energy & Chaos ⚡' },
  { id: 'vibe', label: 'Vibe & Chill 🌙' },
  { id: 'brains', label: 'Brains & Anchor 🧠' },
  { id: 'creators', label: 'Creative Souls 🎨' }
];

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
];

export default function AddMemberModal({ isOpen, onClose, onSave, existingMember = null }) {
  const [name, setName] = useState(existingMember?.name || '');
  const [nickname, setNickname] = useState(existingMember?.nickname || '');
  const [role, setRole] = useState(existingMember?.role || 'The Hype Engine ⚡');
  const [category, setCategory] = useState(existingMember?.category || 'core');
  const [photo, setPhoto] = useState(existingMember?.photo || '');
  const [avatarGradient, setAvatarGradient] = useState(
    existingMember?.avatarGradient || AVATAR_GRADIENTS[0]
  );
  const [bio, setBio] = useState(existingMember?.bio || '');
  const [quote, setQuote] = useState(existingMember?.quote || '');
  const [instagram, setInstagram] = useState(existingMember?.instagram || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: existingMember?.id,
      name: name.trim(),
      nickname: nickname.trim() || name.trim(),
      role: role.trim() || 'Squad Pillar 🌟',
      category,
      photo: photo.trim() || (existingMember?.photo ? existingMember.photo : ''),
      avatarGradient,
      bio: bio.trim() || 'Lifelong member of namma Natpe Thunai sanctuary.',
      quote: quote.trim() || 'Real friendship stands forever.',
      instagram: instagram.trim()
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card modal-card-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-info">
            <span className="modal-badge-tag">
              <Sparkles size={13} /> SQUAD ROSTER
            </span>
            <h3 className="modal-title">
              {existingMember ? `Edit ${existingMember.name}` : 'Add Gang Member'}
            </h3>
          </div>
          <button className="modal-close-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Row 1: Name & Nickname */}
          <div className="form-row-dual">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Kavin, Grace, Arjun"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nickname / Alias</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Captain, Gracxx, AJ"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Role & Category */}
          <div className="form-row-dual">
            <div className="form-group">
              <label className="form-label">Squad Persona / Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. The Spark ✨, The Foodie King 🍕"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vibe Category</label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Avatar Color Picker */}
          <div className="form-group">
            <label className="form-label">Avatar Color Theme</label>
            <div className="avatar-color-swatches">
              {AVATAR_GRADIENTS.map((grad, i) => (
                <button
                  type="button"
                  key={i}
                  className={`color-swatch-btn ${avatarGradient === grad ? 'selected' : ''}`}
                  style={{ background: grad }}
                  onClick={() => setAvatarGradient(grad)}
                  aria-label={`Select gradient ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Photo URL (Optional) */}
          <div className="form-group">
            <label className="form-label">Photo URL (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="/photos/friend1.jpg or direct image link"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
            />
          </div>

          {/* Bio */}
          <div className="form-group">
            <label className="form-label">Squad Bio</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="What makes them irreplaceable in the gang? Their fun quirks, road trip habits, or support..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Signature Quote */}
          <div className="form-group">
            <label className="form-label">Signature Quote</label>
            <input
              type="text"
              className="form-input"
              placeholder="Their most memorable punchline or quote"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
            />
          </div>

          {/* Instagram Handle */}
          <div className="form-group">
            <label className="form-label">Instagram Profile URL</label>
            <input
              type="text"
              className="form-input"
              placeholder="https://www.instagram.com/username"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
          </div>

          {/* Modal Actions */}
          <div className="modal-actions-row">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <UserPlus size={15} />
              <span>{existingMember ? 'Save Changes' : 'Add to Squad'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
