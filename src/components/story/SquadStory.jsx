import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  Flame, 
  BookOpen, 
  Share2, 
  Coffee, 
  Film, 
  Cake, 
  Compass, 
  ShieldCheck,
  Infinity as InfinityIcon
} from 'lucide-react';
import './SquadStory.css';

export default function SquadStory() {
  const [activeLang, setActiveLang] = useState('tanglish'); // 'tanglish' | 'english'
  const [likesCount, setLikesCount] = useState(() => {
    return parseInt(localStorage.getItem('natpe_story_likes') || '42', 10);
  });
  const [hasLiked, setHasLiked] = useState(() => {
    return localStorage.getItem('natpe_story_user_liked') === 'true';
  });
  const [copied, setCopied] = useState(false);

  const handleLike = () => {
    const newLiked = !hasLiked;
    const newCount = newLiked ? likesCount + 1 : likesCount - 1;
    setHasLiked(newLiked);
    setLikesCount(newCount);
    localStorage.setItem('natpe_story_user_liked', newLiked ? 'true' : 'false');
    localStorage.setItem('natpe_story_likes', newCount.toString());
  };

  const handleCopyStory = () => {
    const textToCopy = `Namma “Natpe Thunai” Group ❤️🫂\n\nFirst year la start aana namma “Natpe Thunai” group, ippo varaikum ivlo strong ah irukum nu appo namma yaarume nenachiruka maatom...\n\nNamma friendship perfect illa, aana romba real. ❤️\n\nBecause this is not just a group… idhu namma memories, namma fun, namma fights, namma happiness, and most importantly, namma friendship. ❤️🫂♾️`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="story" className="squad-story-section">
      <div className="section-header">
        <div className="badge-pill">
          <Sparkles size={14} />
          <span>OUR HEARTFELT CHRONICLE</span>
        </div>
        <h2 className="section-title">
          Namma “Natpe Thunai” Story
        </h2>
        <p className="section-desc">
          “Namma friendship perfect illa, aana romba real.” An authentic record of our laughter, cooking, fights, and lifelong bond.
        </p>
      </div>

      <div className="story-editorial-container">
        {/* Top Control Bar: Language Switcher & Actions */}
        <div className="story-controls-header">
          <div className="story-lang-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeLang === 'tanglish'}
              className={`story-tab-pill ${activeLang === 'tanglish' ? 'active' : ''}`}
              onClick={() => setActiveLang('tanglish')}
            >
              <Flame size={14} />
              <span>Namma Voice (Tanglish)</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeLang === 'english'}
              className={`story-tab-pill ${activeLang === 'english' ? 'active' : ''}`}
              onClick={() => setActiveLang('english')}
            >
              <BookOpen size={14} />
              <span>Story Edition (English)</span>
            </button>
          </div>

          <div className="story-header-actions">
            <button 
              className={`story-action-btn ${hasLiked ? 'liked' : ''}`}
              onClick={handleLike}
              aria-label="React with Love"
            >
              <Heart size={15} fill={hasLiked ? "#e11d48" : "none"} />
              <span>{likesCount} Loves</span>
            </button>

            <button 
              className="story-action-btn"
              onClick={handleCopyStory}
              title="Copy Story"
              aria-label="Copy Story"
            >
              <Share2 size={15} />
              <span>{copied ? "Copied! ✨" : "Share Story"}</span>
            </button>
          </div>
        </div>

        {/* Narrative Paper Card */}
        <article className="story-parchment-card">
          {/* Decorative Corner Glow */}
          <div className="parchment-accent-glow" aria-hidden="true" />

          {activeLang === 'tanglish' ? (
            /* ─── ORIGINAL TANGLISH AUTHENTIC VOICE ─── */
            <div className="story-prose-stream">
              {/* Chapter 1: The Beginning */}
              <div className="story-chapter-block">
                <div className="chapter-marker">
                  <span className="marker-num">01</span>
                  <span className="marker-title">The First Year Spark</span>
                </div>
                <p className="prose-lead">
                  First year la start aana namma <strong>“Natpe Thunai”</strong> group, ippo varaikum ivlo strong ah irukum nu appo namma yaarume nenachiruka maatom.
                </p>
                <p className="prose-body">
                  Anikku college la casual ah meet pannom, pesunom. Aana adhukku apram namma life full ah oru periya transformation nadakum nu appo theriyala. Simple tea stall gatherings la irundhu start aana namma friendship, ippo namma daily life oda heart beat ah maari irukku.
                </p>
              </div>

              {/* Memory Highlight Chips */}
              <div className="story-moments-grid">
                <div className="moment-card-pill">
                  <Coffee size={16} className="moment-icon" />
                  <div>
                    <strong>Serndhu Sapta Moments</strong>
                    <span>Sharing food, midnight chai, and cafeteria chaos</span>
                  </div>
                </div>

                <div className="moment-card-pill">
                  <Compass size={16} className="moment-icon" />
                  <div>
                    <strong>Random Outings & Drives</strong>
                    <span>Bikes, cars, unplanned trips, and random suthinadhu</span>
                  </div>
                </div>

                <div className="moment-card-pill">
                  <Flame size={16} className="moment-icon" />
                  <div>
                    <strong>Cooking & Mess Fun</strong>
                    <span>Disaster experiments that turned into delicious laughs</span>
                  </div>
                </div>

                <div className="moment-card-pill">
                  <Film size={16} className="moment-icon" />
                  <div>
                    <strong>Dance & Movies</strong>
                    <span>Theatre whistles, reels making, and dancing like nobody’s watching</span>
                  </div>
                </div>

                <div className="moment-card-pill">
                  <Cake size={16} className="moment-icon" />
                  <div>
                    <strong>Birthday Bashes</strong>
                    <span>Midnight surprises, cake smashes, and priceless memories</span>
                  </div>
                </div>
              </div>

              {/* Chapter 2: The Chaos, Fights & Truth */}
              <div className="story-chapter-block">
                <div className="chapter-marker">
                  <span className="marker-num">02</span>
                  <span className="marker-title">Fights, Arguments & The "Pothum Da" Moments 😂</span>
                </div>
                <p className="prose-body">
                  Idhula sandaiyum irukku, misunderstandings um irukku, kovam, arguments nu neraya nadandhurukku. Sila neram <em>“pothum da, indha group ah vittudalam”</em> nu feel pannirupom 😂 but still, yaarum yaaraiyum vittu kudukkama, last varaikum onna irundhurukom.
                </p>

                {/* Highlight Quote Box */}
                <div className="story-callout-quote">
                  <span className="callout-mark">“</span>
                  <p className="callout-statement">
                    Evlo sandai vandhalum, konjam nerathula marubadiyum onna serndhu sirichu, pesi, same ah time spend pannitu irukkom. Namma friendship perfect illa, aana romba real. ❤️
                  </p>
                </div>

                <p className="prose-body">
                  Namma pannina every small thing um, every fight um, every laugh um, every outing um, every food moment um, every birthday celebration um, namma college life la marakka mudiyadha memories.
                </p>
              </div>

              {/* Chapter 3: The Lifelong Promise */}
              <div className="story-chapter-block">
                <div className="chapter-marker">
                  <span className="marker-num">03</span>
                  <span className="marker-title">The Forever Promise</span>
                </div>
                <p className="prose-body">
                  Innum neraya memories create pannanum, neraya places poganum, neraya fun pannanum. Endha situation vandhalum, namma group ah vittu kudukama, ippadiye last varaikum strong ah irukanum.
                </p>

                {/* Final Climax Banner */}
                <div className="story-climax-card">
                  <div className="climax-icon-badge">
                    <InfinityIcon size={24} />
                  </div>
                  <h3 className="climax-title">Because This Is Not Just A Group…</h3>
                  <p className="climax-text">
                    Idhu namma memories, namma fun, namma fights, namma happiness, and most importantly, <strong>namma friendship. ❤️🫂♾️</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ─── ENGLISH POETIC EDITION ─── */
            <div className="story-prose-stream">
              <div className="story-chapter-block">
                <div className="chapter-marker">
                  <span className="marker-num">01</span>
                  <span className="marker-title">A Beginning No One Anticipated</span>
                </div>
                <p className="prose-lead">
                  When our “Natpe Thunai” circle first came together during freshman year, none of us could have ever imagined that we would end up standing this fiercely strong today.
                </p>
                <p className="prose-body">
                  What started as casual hallways greetings and spontaneous canteen encounters slowly transformed into the very heartbeat of our lives. We became an anchor for one another in a world that never stopped moving.
                </p>
              </div>

              <div className="story-moments-grid">
                <div className="moment-card-pill">
                  <Coffee size={16} className="moment-icon" />
                  <div>
                    <strong>Shared Meals & Midnight Chai</strong>
                    <span>Feeding each other from the same lunchbox and sharing snacks</span>
                  </div>
                </div>

                <div className="moment-card-pill">
                  <Compass size={16} className="moment-icon" />
                  <div>
                    <strong>Spontaneous Road Trips</strong>
                    <span>Unplanned rides, windy highways, and chasing the sunset</span>
                  </div>
                </div>

                <div className="moment-card-pill">
                  <Flame size={16} className="moment-icon" />
                  <div>
                    <strong>Late-Night Cooking</strong>
                    <span>Mess experiments, burnt dishes, and hilarious kitchen stories</span>
                  </div>
                </div>

                <div className="moment-card-pill">
                  <Film size={16} className="moment-icon" />
                  <div>
                    <strong>Dance & First-Day Movie Shows</strong>
                    <span>Whistles, dancing without care, and cheering each other on</span>
                  </div>
                </div>

                <div className="moment-card-pill">
                  <Cake size={16} className="moment-icon" />
                  <div>
                    <strong>Unforgettable Birthdays</strong>
                    <span>Sneaky midnight countdowns and treasured celebrations</span>
                  </div>
                </div>
              </div>

              <div className="story-chapter-block">
                <div className="chapter-marker">
                  <span className="marker-num">02</span>
                  <span className="marker-title">The Real Chemistry: Fights, Misunderstandings & Loyalty</span>
                </div>
                <p className="prose-body">
                  Our journey has had heated arguments, silent spells, and misunderstandings. There were moments when we threw up our hands and thought, <em>“Enough, let’s just walk away from this group!”</em> 😂 But through it all, not one of us ever gave up on the other.
                </p>

                <div className="story-callout-quote">
                  <span className="callout-mark">“</span>
                  <p className="callout-statement">
                    No matter how big the argument, within minutes we found our way back — laughing, joking, and picking right back up. Our friendship isn't perfect, but it is 100% real. ❤️
                  </p>
                </div>

                <p className="prose-body">
                  Every small joke, every heated dispute, every shared dessert, and every spontaneous outing is forever etched as the golden treasure of our youth.
                </p>
              </div>

              <div className="story-chapter-block">
                <div className="chapter-marker">
                  <span className="marker-num">03</span>
                  <span className="marker-title">Our Unwritten Tomorrow</span>
                </div>
                <p className="prose-body">
                  There are still so many memories waiting to be made, destinations waiting to be explored, and laughs waiting to be shared. Whatever situation life presents, we stand firm with zero compromise.
                </p>

                <div className="story-climax-card">
                  <div className="climax-icon-badge">
                    <InfinityIcon size={24} />
                  </div>
                  <h3 className="climax-title">Because This Is Not Just A Group…</h3>
                  <p className="climax-text">
                    This is our memories, our unfiltered chaos, our honest fights, our purest happiness, and above all, <strong>our everlasting friendship. ❤️🫂♾️</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Squad Signoff */}
          <div className="story-signoff-bar">
            <div className="signoff-left">
              <ShieldCheck size={16} className="signoff-shield" />
              <span>Signed by the Core Squad: Grace, Heenuuu, Divyaaa & Puppy</span>
            </div>
            <div className="signoff-tamil-quote" style={{ fontFamily: 'var(--font-tamil)' }}>
              நட்பே துணை — என்றும் இணைபிரியாதவர்கள்.
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
