import React, { useState } from 'react';
import { friends } from '../data/friends';
import { UserCheck, Heart, ArrowUpRight } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import FriendModal from './FriendModal';
import './FriendsGallery.css';

export default function FriendsGallery() {
  const [selectedFriend, setSelectedFriend] = useState(null);

  const handleInstagramClick = (e, url) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="friends" className="gallery-section">
      <div className="section-header">
        <div className="badge-pill liquid-shimmer">
          <UserCheck size={15} className="header-badge-icon" />
          <span>SQUAD ARCHIVE</span>
        </div>
        <h2 className="section-title">
          Meet The <span className="gradient-text-brand">Legends</span>
        </h2>
        <p className="section-desc">
          The core souls of நட்பே துணை. Tap any card for memory capsules, favorite quotes, and squad roles.
        </p>
      </div>

      {/* Friends Cards Spatial Grid */}
      <div className="friends-spatial-grid">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="glass-card friend-spatial-card interactive-slab liquid-shimmer"
            onClick={() => setSelectedFriend(friend)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedFriend(friend);
              }
            }}
          >
            {/* Card Header Tag & Heart Pill */}
            <div className="friend-card-meta-row">
              <span className="friend-role-chip">{friend.role || friend.nickname}</span>
              <div className="card-heart-pill">
                <Heart size={13} />
              </div>
            </div>

            {/* Circular Liquid Photo Bevel */}
            <div className="friend-portrait-container">
              <div className="liquid-photo-frame">
                <img
                  src={friend.photo}
                  alt={friend.name}
                  className="friend-portrait-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80';
                  }}
                />
              </div>
              <div className="friend-badge-floating">{friend.badge || "Squad Member"}</div>
            </div>

            {/* Identity & Stats */}
            <div className="friend-card-identity">
              <h3 className="friend-full-name">{friend.name}</h3>
              <p className="friend-handle-nickname">"{friend.nickname}"</p>

              {/* Instagram Handle Liquid Glass Pill Button */}
              <button
                className="instagram-liquid-pill"
                onClick={(e) => handleInstagramClick(e, friend.instagram)}
                title={`Open ${friend.name}'s Instagram profile`}
                aria-label={`Open ${friend.name}'s Instagram profile`}
              >
                <div className="ig-icon-bubble">
                  <InstagramIcon size={13} />
                </div>
                <span className="ig-username-text">
                  @{friend.instagram.split('instagram.com/')[1] || friend.name.toLowerCase().replace(/\s+/g, '')}
                </span>
                <ArrowUpRight size={13} className="ig-arrow-icon" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* VisionOS-Inspired Pro Sheet Modal */}
      {selectedFriend && (
        <FriendModal
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
        />
      )}
    </section>
  );
}
