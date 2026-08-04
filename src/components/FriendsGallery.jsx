import React, { useState } from 'react';
import { friends } from '../data/friends';
import { ExternalLink, Sparkles, UserCheck, Heart } from 'lucide-react';
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
        <div className="badge-pill glass-shine">
          <UserCheck size={14} className="accent-icon" />
          <span>The Squad Gallery</span>
        </div>
        <h2 className="section-title">
          Meet The <span className="gradient-text">Legends</span>
        </h2>
        <p className="section-desc">
          Click any card to discover their squad role, funny quotes, and favorite memories!
        </p>
      </div>

      {/* Friends Cards Grid */}
      <div className="friends-grid">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="glass-card friend-card interactive-card glass-shine"
            onClick={() => setSelectedFriend(friend)}
          >
            {/* Top Badge */}
            <div className="friend-card-top">
              <span className="friend-role-badge">{friend.role || friend.nickname}</span>
              <div className="card-heart-icon">
                <Heart size={14} />
              </div>
            </div>

            {/* Friend Photo with Rounded Glass Frame */}
            <div className="friend-photo-wrapper">
              <div className="glass-photo-frame">
                <img
                  src={friend.photo}
                  alt={friend.name}
                  className="friend-photo"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80';
                  }}
                />
              </div>
            </div>

            {/* Friend Information */}
            <div className="friend-info">
              <h3 className="friend-name">{friend.name}</h3>
              <p className="friend-nickname">"{friend.nickname}"</p>

              {/* Instagram Handle Pill Button */}
              <button
                className="instagram-pill-btn glass-shine"
                onClick={(e) => handleInstagramClick(e, friend.instagram)}
                title={`Open ${friend.name}'s Instagram`}
              >
                <div className="ig-icon-gradient">
                  <InstagramIcon size={14} />
                </div>
                <span className="ig-handle-text">
                  @{friend.instagram.split('instagram.com/')[1] || friend.name.toLowerCase().replace(/\s+/g, '')}
                </span>
                <ExternalLink size={12} className="ext-link-icon" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* iOS Detail Modal */}
      {selectedFriend && (
        <FriendModal
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
        />
      )}
    </section>
  );
}
