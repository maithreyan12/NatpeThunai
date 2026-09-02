import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import './MatchedDualReel.css';

export default function MatchedDualReel({
  boys = [],
  girls = [],
  onPhotoClick,
  speed = 0.6
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState('both'); // 'both' | 'boys' | 'girls' (for mobile toggle)

  // Duplicate arrays for infinite seamless loop
  const infiniteBoys = useMemo(() => {
    if (!boys.length) return [];
    return [...boys, ...boys, ...boys];
  }, [boys]);

  const infiniteGirls = useMemo(() => {
    if (!girls.length) return [];
    return [...girls, ...girls, ...girls];
  }, [girls]);

  // Refs for custom interactive scroll / drag
  const boysTrackRef = useRef(null);
  const girlsTrackRef = useRef(null);

  return (
    <div 
      className="matched-dual-reel-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Top Ambient Glow / Header Pill */}
      <div className="matched-reel-header-badge">
        <div className="matched-badge-pill">
          <Sparkles size={14} className="sparkle-icon" />
          <span>Duo &amp; Squad Harmony · Synchronized Memory Vault</span>
          <Heart size={14} className="heart-icon" />
        </div>
      </div>

      {/* Mobile Stream Switcher (visible on small mobile screens) */}
      <div className="matched-mobile-tabs" role="tablist">
        <button
          className={`matched-tab-btn ${activeTab === 'both' ? 'active' : ''}`}
          onClick={() => setActiveTab('both')}
        >
          Side by Side
        </button>
        <button
          className={`matched-tab-btn ${activeTab === 'boys' ? 'active' : ''}`}
          onClick={() => setActiveTab('boys')}
        >
          Maithreyan &amp; Brothers
        </button>
        <button
          className={`matched-tab-btn ${activeTab === 'girls' ? 'active' : ''}`}
          onClick={() => setActiveTab('girls')}
        >
          Gopika &amp; Sisters
        </button>
      </div>

      {/* Matched Stage Container */}
      <div className={`matched-dual-stage ${activeTab}`}>
        {/* ── LEFT STREAM: Maithreyan & Boys ── */}
        {(activeTab === 'both' || activeTab === 'boys') && (
          <div className="matched-stream-column boys-column">
            <div className="stream-header-pill boy-pill">
              <span className="dot dot-indigo" />
              <strong>Maithreyan</strong> &amp; Squad Brothers
            </div>

            <div className="matched-stream-viewport">
              <div 
                ref={boysTrackRef}
                className={`matched-stream-track scroll-up ${isPaused ? 'paused' : ''}`}
                style={{ '--anim-duration': `${Math.max(28, boys.length * 7.5)}s` }}
              >
                {infiniteBoys.map((item, idx) => (
                  <div
                    key={`boy-${item.id || idx}-${idx}`}
                    className={`matched-photo-card ${item.isLead ? 'lead-card lead-boy' : ''}`}
                    onClick={() => onPhotoClick && onPhotoClick(item.src || item.photo)}
                    title={`View ${item.name || 'Photo'}`}
                  >
                    <div className="matched-card-media">
                      <img
                        src={item.src || item.photo}
                        alt={item.name || 'Squad Member'}
                        className="matched-card-img"
                        loading={idx < 4 ? 'eager' : 'lazy'}
                        onError={(e) => {
                          e.target.onerror = null;
                          if (item.fallbackSrc && e.target.src !== item.fallbackSrc) {
                            e.target.src = item.fallbackSrc;
                          }
                        }}
                      />
                      <div className="matched-card-gradient" />
                    </div>

                    <div className="matched-card-meta">
                      <div className="matched-meta-row">
                        <span className="matched-meta-name">{item.name}</span>
                        {item.isLead && <span className="matched-lead-tag">Duo</span>}
                      </div>
                      <span className="matched-meta-role">{item.role || item.nickname || 'Squad Brother'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Center Divider / Infinity Emblem (Desktop) */}
        {activeTab === 'both' && (
          <div className="matched-stage-divider">
            <div className="divider-line" />
            <div className="divider-emblem" title="Natpe Thunai Infinity Harmony">
              <span>♾️</span>
            </div>
            <div className="divider-line" />
          </div>
        )}

        {/* ── RIGHT STREAM: Gopika & Girls ── */}
        {(activeTab === 'both' || activeTab === 'girls') && (
          <div className="matched-stream-column girls-column">
            <div className="stream-header-pill girl-pill">
              <span className="dot dot-pink" />
              <strong>Gopika</strong> &amp; Squad Sisters
            </div>

            <div className="matched-stream-viewport">
              <div 
                ref={girlsTrackRef}
                className={`matched-stream-track scroll-down ${isPaused ? 'paused' : ''}`}
                style={{ '--anim-duration': `${Math.max(28, girls.length * 7.5)}s` }}
              >
                {infiniteGirls.map((item, idx) => (
                  <div
                    key={`girl-${item.id || idx}-${idx}`}
                    className={`matched-photo-card ${item.isLead ? 'lead-card lead-girl' : ''}`}
                    onClick={() => onPhotoClick && onPhotoClick(item.src || item.photo)}
                    title={`View ${item.name || 'Photo'}`}
                  >
                    <div className="matched-card-media">
                      <img
                        src={item.src || item.photo}
                        alt={item.name || 'Squad Member'}
                        className="matched-card-img"
                        loading={idx < 4 ? 'eager' : 'lazy'}
                        onError={(e) => {
                          e.target.onerror = null;
                          if (item.fallbackSrc && e.target.src !== item.fallbackSrc) {
                            e.target.src = item.fallbackSrc;
                          }
                        }}
                      />
                      <div className="matched-card-gradient" />
                    </div>

                    <div className="matched-card-meta">
                      <div className="matched-meta-row">
                        <span className="matched-meta-name">{item.name}</span>
                        {item.isLead && <span className="matched-lead-tag">Duo</span>}
                      </div>
                      <span className="matched-meta-role">{item.role || item.nickname || 'Squad Sister'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="matched-reel-footer-hint">
        <span>Hover or touch to pause stream · Click any photo for full high-res view</span>
      </div>
    </div>
  );
}
