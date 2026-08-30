import { 
  Users, 
  ArrowUpRight, 
  Sparkles, 
  BookOpen
} from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import { SQUAD_MEMBERS } from '../services';
import './SquadMembers.css';

export default function SquadMembers({ onSelectMember, _onFilterByMember }) {
  return (
    <section id="members" className="squad-community-section">
      <div className="section-header">
        <div className="badge-pill">
          <Users size={14} />
          <span>OUR COMMUNITY CORNERSTONES</span>
        </div>
        <h2 className="section-title">
          The Squad Sanctuary
        </h2>
        <p className="section-desc">
          Meet the four cornerstones of நட்பே துணை. Their laughter, loyalty, and memories define this sanctuary.
        </p>
      </div>

      <div className="squad-gallery-grid">
        {SQUAD_MEMBERS.map((member) => (
          <article 
            key={member.id} 
            className="squad-member-card interactive-slab"
            onClick={() => onSelectMember(member)}
            role="button"
            tabIndex={0}
            aria-label={`View journey for ${member.name}`}
          >
            {/* Top Portrait Window with Floating Badges */}
            <div className="member-hero-portrait">
              <img 
                src={member.photo} 
                alt={member.name} 
                className="member-hero-img"
                onError={(e) => { e.target.src = '/photos/friend1.jpg'; }}
              />
              <div className="portrait-glass-overlay" />
              
              {/* Floating Pill Badges */}
              <div className="portrait-floating-top">
                <span className="member-glass-role">{member.role}</span>
                <span className="member-glass-tag">
                  <Sparkles size={11} /> Core
                </span>
              </div>
            </div>

            {/* Member Details */}
            <div className="member-card-body">
              <div className="member-name-row">
                <h3 className="member-name-title">{member.name}</h3>
                <span className="member-nickname-pill">"{member.nickname}"</span>
              </div>

              <p className="member-bio-text">{member.bio}</p>

              {/* Signature Quote */}
              <div className="member-quote-capsule">
                <span className="quote-glyph">“</span>
                <p className="quote-line">{member.quote}</p>
              </div>

              {/* Journey Highlights Pills */}
              {member.journeyMilestones && (
                <div className="member-milestone-pills-row">
                  {member.journeyMilestones.map((jm, i) => (
                    <span key={jm.title || i} className="milestone-badge-chip">
                      ✨ {jm.title}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons Row — Guaranteed No Overflow */}
              <div className="member-card-actions">
                <button 
                  type="button"
                  className="btn-primary member-journey-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMember(member);
                  }}
                >
                  <BookOpen size={14} />
                  <span>View Journey</span>
                </button>

                {member.instagram && (
                  <a 
                    href={member.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="member-insta-action-btn"
                    onClick={(e) => e.stopPropagation()}
                    title={`Connect with ${member.name} on Instagram`}
                    aria-label={`Connect with ${member.name} on Instagram`}
                  >
                    <InstagramIcon size={16} />
                    <ArrowUpRight size={12} className="arrow-glyph" />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
