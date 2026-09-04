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
  Infinity as InfinityIcon,
  Users,
  MapPin,
  Car,
  Home,
  Utensils
} from 'lucide-react';
import './SquadStory.css';

const SQUAD_NAMES = [
  "Jeysha", "Kafil", "jaffreen", "Farish",
  "Divya", "Afnaan", "Haniya", "kumran",
  "Meshak", "Talha", "Harshitha", "Jeevitha",
  "Heena", "Garnett", "Maithreyan", "Gopika"
];

const FULL_STORY_TEXT = `2023 first year first sem-la, oru chemistry lab-la start aana oru chinna friendship, konjam konjama oru azhagana gang-aa maaruchu. Backbench-la irundha boys, girls-nu aarambichu, lunch share pannadhu, class-la pesinadhu, birthday celebrations, namma friendship-oda first outing-aa class cut panni Limra-ku poi saapittu, anga ukkandhu dare games, double meaning games-nu solli sirichu, dare pannitu, full-ah fun pannina andha naal namma gang-oda first official outing-aa marakka mudiyadha memory-a pochu. Adhe first year-la class cut panni ellarum serndhu movies-ku pona moments-um thani level memories. Adhukkapparam Jeevitha thopukku poi, oru full day ellarum serndhu samayal panni, biriyani seithu, oru periya ilai-la full-ah biriyani parappi ukkandhu saapittathu, anga irundha nature-oda serndhu full-ah enjoy pannadhu, pasanga kinarukulla poi kuthichu vilaiyaadinadhu, andha memories ellam innum special. First year-la class cut panni Green Thunder poi semma fun pannadhu, swimming theriyama kooda pool-la kuthichu vilaiyaadinadhu, adhe nerathula mazhai vandhu swimming pool-la mazhaiyoda serndhu enjoy pannadhu, HOD room munnadi ninnu panna attagasam-nu… first year full-ah memories-ku panjam-e illa. Oru naal Chennai-ku train-la poi, unforgettable-aana andha journey-lendhu, Ooty IV trip-la ellarum serndhu panna crazy memories varaikkum, ovvoru naalum oru pudhu story.

Second year-la konjam misunderstandings, chinna chinna disappointments, sandai-nu friendship-kulla sila ups and downs vandhaalum, adhellaam thaandi namma bond thirumba strong aayiduchu. Adhe second year-la Haniya veetukku poi, fish fry panni saaptu, speaker-la songs pottu boys-girls ellarum serndhu dance aadi, kannamoochi, odippidi-nu chinna pasanga maadhiri full day vilaiyaadi enjoy pannina andha naalum namma friendship memories-la oru special place eduthuchu. Adhe year Pondicherry-ku oru car-la ellarum serndhu poi, full day enjoy pannadhu, birthday celebrations, Kerala-la Vagamon poi create pannina memories-nu, namma bond innum strong aayitte pochu.

Third year-ku varumbodhu pudhu friends konjam konjama namma gang-kulla join aanaalum, old-new nu yaarayum pirichu paakama, ellarum ore family maadhiri aayitom. Marubadiyum Chennai-ku plan panni, ore car-la oru pathu per serndhu pona andha journey, class-la cricket vilaiyaadinadhu, ore lunch box share pannadhu, koopittu koopittu pesinadhu, sanda pottu marubadiyum serndhadhu, reason illaama sirichadhu-nu… indha moonu varusham namma life-la oru thani chapter.

Adhukkapparam third year summer leave-la vandha andha one-month Bangalore internship namma friendship-la innoru unforgettable chapter. Internship-nu ponaalum, andha one month full-ah namma ellarum serndhu ore PG-la stay panni, daily life-aave oru adventure maadhiri maathinom. Cabs book panni ellarum serndhu travel pannadhu, pudhu places-ku poi enjoy pannadhu, chinna chinna plans pottu spontaneous-ah veliya ponadhu, PG-la serndhu panna attagasangal-nu… internship-ku pona oru month, namma life-la oru mini family life maadhiri aayiduchu. One month full-ah ore place-la serndhu irundhu, orutharoda habits, moods, comedy, kovam, care ellathayum paathu purinjukitta andha experience, namma bond-ku oru different level strength kuduthuchu. Andha one month mudinjappo, “friends” nu mattum illaama, namma ellarum unmaiyave oru family maadhiri feel panna aarambichutom.

Fourth year ippo namma journey-la odittu irukku. Indha year Symposium event-la campaign-ku join pannom; enga HOD namma group-a repeated-ah target panninaalum, adhellaam thaandi ellarum onna serndhu campaign pannom. Campaign-nu aarambichadhu, Yelagiri varaikkum poi, anga ellarum serndhu oru crazy ride-la poi, bayam, excitement, screams, laughter-nu semma memories create pannina oru unforgettable journey-a maariduchu. Ippo fourth year poittu irukku… aana namma story inga mudiyala. Innum neraya days, neraya trips, neraya celebrations, neraya sandai, neraya sirippu, neraya memories namakkaaga wait pannittu irukku.

College days maaralaam, classes mudiyalaam, namma daily routine maaralaam… aana first year-la Limra-la start aana indha friendship, fourth year varaikkum vandhadhu mattum illa, ini college-ku appuramum continue aagura oru bond-aa irukkum. Jeysha, Kafil, jaffreen, Farish, Divya, Afnaan, Haniya, Meshak, Talha, Kumran, Harshitha, Jeevitha, Heena, Garnett, Maithreyan, Gopika-nu indha peru ellam summa names illa… namma life-la serndha memories-oda peru. Namma friendship-ku oru beginning irukku… aana ending kedaiyadhu. Because this is not just a friends gang, this is our little family — Natpe Thunai. ❤️🫂✨`;

function SquadStory() {
  const [activeLang, setActiveLang] = useState('tanglish'); // 'tanglish' | 'english'
  const [likesCount, setLikesCount] = useState(() => {
    return parseInt(localStorage.getItem('natpe_story_likes') || '108', 10);
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
    navigator.clipboard.writeText(FULL_STORY_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="story" className="squad-story-section">
      <div className="section-header">
        <div className="badge-pill">
          <Sparkles size={14} />
          <span>OUR UNFILTERED CHRONICLE</span>
        </div>
        <h2 className="section-title">
          Namma “Natpe Thunai” Story
        </h2>
        <p className="section-desc">
          From a Chemistry lab in 2023 to Bangalore PG & Yelagiri rides — the authentic chronicle of our 4-year journey.
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
              title="Copy Full Story"
              aria-label="Copy Story"
            >
              <Share2 size={15} />
              <span>{copied ? "Copied! ✨" : "Share Story"}</span>
            </button>
          </div>
        </div>

        {/* Narrative Paper Card */}
        <article className="story-parchment-card">
          <div className="parchment-accent-glow" aria-hidden="true" />

          {/* Quick Snapshot Moments Grid */}
          <div className="story-moments-grid">
            <div className="moment-card-pill">
              <Coffee size={16} className="moment-icon" />
              <div>
                <strong>Chemistry Lab & Limra Outing</strong>
                <span>Backbenchers, dare games & double meaning laughs</span>
              </div>
            </div>

            <div className="moment-card-pill">
              <Utensils size={16} className="moment-icon" />
              <div>
                <strong>Jeevitha Thoppu Biriyani</strong>
                <span>Full day cooking, banana leaf feast & kinaru dive</span>
              </div>
            </div>

            <div className="moment-card-pill">
              <Compass size={16} className="moment-icon" />
              <div>
                <strong>Green Thunder & Rain in the Pool</strong>
                <span>Bunking classes, rain swimming & HOD room fun</span>
              </div>
            </div>

            <div className="moment-card-pill">
              <Film size={16} className="moment-icon" />
              <div>
                <strong>Haniya Veedu Fish Fry & Dance</strong>
                <span>Speaker songs, kannamoochi, odippidi like kids</span>
              </div>
            </div>

            <div className="moment-card-pill">
              <Car size={16} className="moment-icon" />
              <div>
                <strong>Pondi, Vagamon & 10 in One Car</strong>
                <span>Crazy road trips, midnight talks & classroom cricket</span>
              </div>
            </div>

            <div className="moment-card-pill">
              <Home size={16} className="moment-icon" />
              <div>
                <strong>1-Month Bangalore PG Family</strong>
                <span>Living together, cabs, cooking & becoming true family</span>
              </div>
            </div>
          </div>

          {activeLang === 'tanglish' ? (
            /* ─── ORIGINAL TANGLISH AUTHENTIC VOICE ─── */
            <div className="story-prose-stream">

              {/* Chapter 1: The Chemistry Lab Spark */}
              <div className="story-chapter-block">
                <div className="chapter-marker">
                  <span className="marker-num">01</span>
                  <span className="marker-title">2023 First Year • Chemistry Lab to Limra & Green Thunder</span>
                </div>
                <p className="prose-lead">
                  2023 first year first sem-la, oru chemistry lab-la start aana oru chinna friendship, konjam konjama oru azhagana gang-aa maaruchu.
                </p>
                <p className="prose-body">
                  Backbench-la irundha boys, girls-nu aarambichu, lunch share pannadhu, class-la pesinadhu, birthday celebrations... namma friendship-oda first outing-aa class cut panni <strong>Limra</strong>-ku poi saapittu, anga ukkandhu dare games, double meaning games-nu solli sirichu, dare pannitu, full-ah fun pannina andha naal namma gang-oda first official outing-aa marakka mudiyadha memory-a pochu.
                </p>
                <p className="prose-body">
                  Adhe first year-la class cut panni ellarum serndhu movies-ku pona moments-um thani level memories. Adhukkapparam <strong>Jeevitha thopukku</strong> poi, oru full day ellarum serndhu samayal panni, biriyani seithu, oru periya ilai-la full-ah biriyani parappi ukkandhu saapittathu, anga irundha nature-oda serndhu full-ah enjoy pannadhu, pasanga kinarukulla poi kuthichu vilaiyaadinadhu, andha memories ellam innum special.
                </p>
                <p className="prose-body">
                  First year-la class cut panni <strong>Green Thunder</strong> poi semma fun pannadhu, swimming theriyama kooda pool-la kuthichu vilaiyaadinadhu, adhe nerathula mazhai vandhu swimming pool-la mazhaiyoda serndhu enjoy pannadhu, HOD room munnadi ninnu panna attagasam-nu… first year full-ah memories-ku panjam-e illa. Oru naal Chennai-ku train-la poi, unforgettable-aana andha journey-lendhu, Ooty IV trip-la ellarum serndhu panna crazy memories varaikkum, ovvoru naalum oru pudhu story.
                </p>
              </div>

              {/* Chapter 2: Second Year Ups, Downs & Pondy */}
              <div className="story-chapter-block">
                <div className="chapter-marker">
                  <span className="marker-num">02</span>
                  <span className="marker-title">Second Year • Fish Fry Dance, Pondicherry & Vagamon</span>
                </div>
                <p className="prose-body">
                  Second year-la konjam misunderstandings, chinna chinna disappointments, sandai-nu friendship-kulla sila ups and downs vandhaalum, adhellaam thaandi namma bond thirumba strong aayiduchu.
                </p>
                <p className="prose-body">
                  Adhe second year-la <strong>Haniya veetukku</strong> poi, fish fry panni saaptu, speaker-la songs pottu boys-girls ellarum serndhu dance aadi, kannamoochi, odippidi-nu chinna pasanga maadhiri full day vilaiyaadi enjoy pannina andha naalum namma friendship memories-la oru special place eduthuchu.
                </p>
                <p className="prose-body">
                  Adhe year Pondicherry-ku oru car-la ellarum serndhu poi, full day enjoy pannadhu, birthday celebrations, Kerala-la Vagamon poi create pannina memories-nu, namma bond innum strong aayitte pochu.
                </p>
              </div>

              {/* Chapter 3: Third Year & One Family */}
              <div className="story-chapter-block">
                <div className="chapter-marker">
                  <span className="marker-num">03</span>
                  <span className="marker-title">Third Year • 10 in One Car, Classroom Cricket & Single Lunchbox</span>
                </div>
                <p className="prose-body">
                  Third year-ku varumbodhu pudhu friends konjam konjama namma gang-kulla join aanaalum, old-new nu yaarayum pirichu paakama, ellarum ore family maadhiri aayitom.
                </p>
                <p className="prose-body">
                  Marubadiyum Chennai-ku plan panni, ore car-la oru pathu per serndhu pona andha journey, class-la cricket vilaiyaadinadhu, ore lunch box share pannadhu, koopittu koopittu pesinadhu, sanda pottu marubadiyum serndhadhu, reason illaama sirichadhu-nu… indha moonu varusham namma life-la oru thani chapter.
                </p>
              </div>

              {/* Chapter 4: The 1-Month Bangalore Internship Family */}
              <div className="story-chapter-block">
                <div className="chapter-marker">
                  <span className="marker-num">04</span>
                  <span className="marker-title">The Bangalore Internship • One Month in One PG as a Family</span>
                </div>
                <p className="prose-body">
                  Adhukkapparam third year summer leave-la vandha andha <strong>one-month Bangalore internship</strong> namma friendship-la innoru unforgettable chapter. Internship-nu ponaalum, andha one month full-ah namma ellarum serndhu ore PG-la stay panni, daily life-aave oru adventure maadhiri maathinom.
                </p>
                <p className="prose-body">
                  Cabs book panni ellarum serndhu travel pannadhu, pudhu places-ku poi enjoy pannadhu, chinna chinna plans pottu spontaneous-ah veliya ponadhu, PG-la serndhu panna attagasangal-nu… internship-ku pona oru month, namma life-la oru mini family life maadhiri aayiduchu.
                </p>

                <div className="story-callout-quote">
                  <span className="callout-mark">“</span>
                  <p className="callout-statement">
                    One month full-ah ore place-la serndhu irundhu, orutharoda habits, moods, comedy, kovam, care ellathayum paathu purinjukitta andha experience, namma bond-ku oru different level strength kuduthuchu. Andha one month mudinjappo, “friends” nu mattum illaama, namma ellarum unmaiyave oru family maadhiri feel panna aarambichutom.
                  </p>
                </div>
              </div>

              {/* Chapter 5: Fourth Year & Beyond */}
              <div className="story-chapter-block">
                <div className="chapter-marker">
                  <span className="marker-num">05</span>
                  <span className="marker-title">Fourth Year • Symposium Campaign, Yelagiri & Our Unbroken Family</span>
                </div>
                <p className="prose-body">
                  Fourth year ippo namma journey-la odittu irukku. Indha year Symposium event-la campaign-ku join pannom; enga HOD namma group-a repeated-ah target panninaalum, adhellaam thaandi ellarum onna serndhu campaign pannom.
                </p>
                <p className="prose-body">
                  Campaign-nu aarambichadhu, <strong>Yelagiri</strong> varaikkum poi, anga ellarum serndhu oru crazy ride-la poi, bayam, excitement, screams, laughter-nu semma memories create pannina oru unforgettable journey-a maariduchu. Ippo fourth year poittu irukku… aana namma story inga mudiyala. Innum neraya days, neraya trips, neraya celebrations, neraya sandai, neraya sirippu, neraya memories namakkaaga wait pannittu irukku.
                </p>

                <p className="prose-body">
                  College days maaralaam, classes mudiyalaam, namma daily routine maaralaam… aana first year-la Limra-la start aana indha friendship, fourth year varaikkum vandhadhu mattum illa, ini college-ku appuramum continue aagura oru bond-aa irukkum. Jeysha, Kafil, jaffreen, Farish, Divya, Afnaan, Haniya, Sham, Meshak, Talha, Kumran, Harshitha, Jeevitha, Heena, Garnett, Sham Sundhar, Maithreyan, Gopika-nu indha peru ellam summa names illa… namma life-la serndha memories-oda peru.
                </p>

                {/* SQUAD FAMILY NAMES ROLL CALL */}
                <div className="story-roster-box">
                  <div className="story-roster-header">
                    <Users size={16} />
                    <span>Namma 18 Pillars • Natpe Thunai Family Roster</span>
                  </div>
                  <div className="story-roster-names">
                    {SQUAD_NAMES.map((name, i) => (
                      <span key={name} className="story-roster-chip">
                        <span className="roster-chip-num">{String(i + 1).padStart(2, '0')}</span>
                        <span className="roster-chip-name">{name}</span>
                      </span>
                    ))}
                  </div>
                  <p className="story-roster-subtext">
                    ...indha peru ellam summa names illa — namma life-la serndha memories-oda peru.
                  </p>
                </div>

                {/* Final Climax Banner */}
                <div className="story-climax-card">
                  <div className="climax-icon-badge">
                    <InfinityIcon size={24} />
                  </div>
                  <h3 className="climax-title">Namma Friendship-ku Oru Beginning Irukku… Aana Ending Kedaiyadhu</h3>
                  <p className="climax-text">
                    Because this is not just a friends gang, this is our little family — <strong>Natpe Thunai. ❤️🫂✨</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ─── ENGLISH POETIC TRANSLATION ─── */
            <div className="story-prose-stream">
              {/* Chapter 1: The Chemistry Lab Spark */}
              <div className="story-chapter-block">
                <div className="chapter-marker">
                  <span className="marker-num">01</span>
                  <span className="marker-title">2023 First Year • Chemistry Lab to Limra & Green Thunder</span>
                </div>
                <p className="prose-lead">
                  Back in 2023 during our very first semester, a humble friendship that sparked inside a Chemistry lab gradually bloomed into an extraordinary, inseparable family.
                </p>
                <p className="prose-body">
                  Starting with backbencher boys and girls chatting between lectures, sharing lunchboxes, and celebrating birthdays, our first official gang outing happened when we bunked classes to head to <strong>Limra</strong>. Sitting around, playing dare games, bursting out laughing at double-meaning jokes, and enjoying every single moment — that day became the unforgettable milestone that defined our circle.
                </p>
                <p className="prose-body">
                  That same year, skipping classes to catch movies together hit on a whole different level. Soon came our full-day adventure at <strong>Jeevitha’s Thoppu</strong> — cooking together from scratch, spreading piping hot biriyani across giant banana leaves, diving into the agricultural well, and celebrating nature together.
                </p>
                <p className="prose-body">
                  Bunking classes for <strong>Green Thunder</strong> brought pure exhilaration — jumping into the pool even without knowing how to swim, and dancing when torrential rain poured straight into the pool, followed by bold antics right outside the HOD’s room! From train rides to Chennai to crazy memories on the Ooty IV trip, every single day unfolded a brand new story.
                </p>
              </div>

              {/* Chapter 2: Second Year Ups, Downs & Pondy */}
              <div className="story-chapter-block">
                <div className="chapter-marker">
                  <span className="marker-num">02</span>
                  <span className="marker-title">Second Year • Fish Fry Dance, Pondicherry & Vagamon</span>
                </div>
                <p className="prose-body">
                  Second year brought its share of misunderstandings, minor heartaches, and arguments. Yet, rising above every storm, our bond emerged tougher and closer than ever.
                </p>
                <p className="prose-body">
                  One day at <strong>Haniya’s house</strong>, frying fish, blasting music through the speaker with everyone dancing freely, playing hide-and-seek and tag like little kids — it secured a golden chapter in our memories. Packing into a car for a sun-drenched Pondicherry getaway, festive birthday milestones, and breathing the cool hills of Vagamon in Kerala made our circle unbreakable.
                </p>
              </div>

              {/* Chapter 3: Third Year & One Family */}
              <div className="story-chapter-block">
                <div className="chapter-marker">
                  <span className="marker-num">03</span>
                  <span className="marker-title">Third Year • 10 in One Car, Classroom Cricket & Single Lunchbox</span>
                </div>
                <p className="prose-body">
                  As third year arrived, new friends organically joined our sanctuary. Rather than separating into old and new circles, everyone merged into one big family.
                </p>
                <p className="prose-body">
                  Planning another Chennai road trip packed with 10 people in a single car, playing impromptu cricket inside empty classrooms, feeding each other from a single lunch box, laughing endlessly without reason, and always finding our way back after petty arguments — these three years stood as an irreplaceable chapter of our youth.
                </p>
              </div>

              {/* Chapter 4: The 1-Month Bangalore Internship Family */}
              <div className="story-chapter-block">
                <div className="chapter-marker">
                  <span className="marker-num">04</span>
                  <span className="marker-title">The Bangalore Internship • One Month in One PG as a Family</span>
                </div>
                <p className="prose-body">
                  Then came the third-year summer break — a <strong>one-month Bangalore internship</strong> that wrote an unforgettable chapter. Though we went for professional training, living together in the same PG transformed daily routine into a collective adventure.
                </p>
                <p className="prose-body">
                  Booking shared cabs, discovering new Bangalore spots, embarking on spontaneous evening plans, and sharing endless laughs inside our rooms turned that month into a warm, harmonious mini-family life.
                </p>

                <div className="story-callout-quote">
                  <span className="callout-mark">“</span>
                  <p className="callout-statement">
                    Living together 24/7 under one roof, observing each other’s habits, moods, comedy, tempers, and unconditional care gave our bond a profound strength. When that month concluded, we were no longer just “friends” — we were genuinely, unequivocally family.
                  </p>
                </div>
              </div>

              {/* Chapter 5: Fourth Year & Beyond */}
              <div className="story-chapter-block">
                <div className="chapter-marker">
                  <span className="marker-num">05</span>
                  <span className="marker-title">Fourth Year • Symposium Campaign, Yelagiri & Our Unbroken Family</span>
                </div>
                <p className="prose-body">
                  Now, fourth year is in full motion. We stood united during the college Symposium campaign — despite our group being repeatedly targeted by the HOD, we powered through side-by-side without flinching.
                </p>
                <p className="prose-body">
                  That campaign journey led all the way to <strong>Yelagiri</strong>, where a crazy rollercoaster ride of fear, adrenaline, screams, and tears of joy etched another unforgettable milestone. Fourth year marches on, but our story doesn't conclude here — more journeys, celebrations, goofy arguments, and cherished memories await on our horizon.
                </p>

                <p className="prose-body">
                  College days will pass, lecture halls will empty, and daily schedules will shift. But this brotherhood that sparked at Limra has not only thrived all the way to our final year, but will continue long after graduation day. Jeysha, Kafil, jaffreen, Farish, Divya, Afnaan, Haniya, Sham, Meshak, Talha, Kumran, Harshitha, Jeevitha, Heena, Garnett, Sham Sundhar, Maithreyan, and Gopika — these aren’t just names; they are the living milestones of our youth.
                </p>

                {/* SQUAD FAMILY NAMES ROLL CALL */}
                <div className="story-roster-box">
                  <div className="story-roster-header">
                    <Users size={16} />
                    <span>Our 17 Pillars • Natpe Thunai Family Roster</span>
                  </div>
                  <div className="story-roster-names">
                    {SQUAD_NAMES.map((name, i) => (
                      <span key={name} className="story-roster-chip">
                        <span className="roster-chip-num">{String(i + 1).padStart(2, '0')}</span>
                        <span className="roster-chip-name">{name}</span>
                      </span>
                    ))}
                  </div>
                  <p className="story-roster-subtext">
                    ...these aren’t just names; they are the living milestones of our youth.
                  </p>
                </div>

                {/* Final Climax Banner */}
                <div className="story-climax-card">
                  <div className="climax-icon-badge">
                    <InfinityIcon size={24} />
                  </div>
                  <h3 className="climax-title">Our Friendship Has a Beginning… But Never an Ending</h3>
                  <p className="climax-text">
                    Because this is not just a circle of friends, this is our little family — <strong>Natpe Thunai. ❤️🫂✨</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Squad Signoff */}
          <div className="story-signoff-bar">
            <div className="signoff-left">
              <ShieldCheck size={16} className="signoff-shield" />
              <span>Signed with Love by the Natpe Thunai Family • 2023 — Forever</span>
            </div>
            <div className="signoff-tamil-quote" style={{ fontFamily: 'var(--font-tamil)' }}>
              நட்பே துணை — தொடக்கம் உண்டு, முடிவே இல்லை.
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default React.memo(SquadStory);
