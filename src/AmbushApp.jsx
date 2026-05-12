import React, { useState, useEffect } from 'react';
import { Home, Calendar, Users, Trophy, Ticket, Sun, Moon, ArrowUpRight, Bell, Flame, Zap, Target, ChevronRight, ChevronLeft, Play, MapPin, Camera, Brain, TrendingUp, Award, Lock, ArrowDown, Phone, Mail, Gift } from 'lucide-react';
import newsData from './data/news.json';
import scheduleData from './data/schedule.json';
import coachesData from './data/coaches.json';
import rosterData from './data/roster.json';
import { logoFor } from './data/teams.js';
import { heroPhotos } from './data/photos.js';

// Use the local Ambush logo (chroma-keyed transparent PNG, served from public/icons/)
const ambushLogo = '/stl-ambush/icons/ambush-logo.png';

export default function AmbushApp() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('home');
  const [loyaltyView, setLoyaltyView] = useState('overview');
  const [teamView, setTeamView] = useState('masl');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [scheduleFilter, setScheduleFilter] = useState('upcoming');
  const [scheduleLeague, setScheduleLeague] = useState('masl');

  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#0a0a0a' : '#f4f1ea',
    bgElevated: isDark ? '#141414' : '#ebe7dd',
    bgCard: isDark ? '#181818' : '#ffffff',
    ink: isDark ? '#f4f1ea' : '#0a0a0a',
    inkMuted: isDark ? '#9a9a9a' : '#5a5a5a',
    inkSubtle: isDark ? '#5a5a5a' : '#9a9a9a',
    rule: isDark ? '#262626' : '#d8d2c4',
    teal: '#00b8aa',
    tealDeep: '#007a72',
    pink: '#ff4d85',
    pinkDeep: '#d63d6f',
  };

  const TabButton = ({ id, icon: Icon, label }) => {
    const active = activeTab === id;
    return (
      <button
        onClick={() => { setActiveTab(id); setLoyaltyView('overview'); setSelectedPlayer(null); }}
        className="flex flex-col items-center justify-center flex-1 gap-1 transition-all relative"
        style={{ color: active ? colors.ink : colors.inkSubtle }}
      >
        {active && (
          <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', width: '24px', height: '2px', backgroundColor: colors.teal }} />
        )}
        <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
        <span className="text-[9px] tracking-[0.18em] uppercase font-semibold" style={{ fontFamily: '"Inter", sans-serif' }}>{label}</span>
      </button>
    );
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: isDark ? '#000' : '#e8e3d6' }}>
      <div className="w-full max-w-[420px] relative shadow-2xl overflow-hidden" style={{ backgroundColor: colors.bg, color: colors.ink, height: '844px', maxHeight: '95vh', borderRadius: '40px', border: `1px solid ${colors.rule}`, fontFamily: '"Georgia", serif' }}>
        {activeTab === 'home' && <HomeTab colors={colors} isDark={isDark} setTheme={setTheme} />}
        {activeTab === 'schedule' && <ScheduleTab colors={colors} isDark={isDark} setTheme={setTheme} filter={scheduleFilter} setFilter={setScheduleFilter} league={scheduleLeague} setLeague={setScheduleLeague} />}
        {activeTab === 'team' && <TeamTab colors={colors} isDark={isDark} setTheme={setTheme} view={teamView} setView={setTeamView} selectedPlayer={selectedPlayer} setSelectedPlayer={setSelectedPlayer} />}
        {activeTab === 'loyalty' && <LoyaltyTab colors={colors} isDark={isDark} setTheme={setTheme} view={loyaltyView} setView={setLoyaltyView} />}
        {activeTab === 'tickets' && <TicketsTab colors={colors} isDark={isDark} setTheme={setTheme} />}

        <div className="absolute bottom-0 left-0 right-0 flex items-center pt-3 pb-8 px-2" style={{ backgroundColor: colors.bg + 'f5', backdropFilter: 'blur(20px)', borderTop: `1px solid ${colors.rule}` }}>
          <TabButton id="home" icon={Home} label="Home" />
          <TabButton id="schedule" icon={Calendar} label="Schedule" />
          <TabButton id="team" icon={Users} label="Team" />
          <TabButton id="loyalty" icon={Trophy} label="Loyalty" />
          <TabButton id="tickets" icon={Ticket} label="Tickets" />
        </div>
      </div>
    </div>
  );
}

// Convert an ISO timestamp into a short relative string like "2h ago" or "3d ago".
// Returns "" for null/invalid input so the UI can render gracefully.
function timeAgo(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

function TopBar({ colors, isDark, setTheme }) {
  return (
    <>
      <div className="h-8" />
      <div className="px-5 pt-2 pb-3 flex items-center justify-between">
        <div className="text-[11px] tracking-[0.24em] uppercase font-semibold" style={{ color: colors.ink, fontFamily: '"Inter", sans-serif' }}>The Ambush</div>
        <div className="flex items-center gap-3">
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="p-1.5 rounded-full hover:opacity-70" style={{ color: colors.ink }}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="p-1.5 rounded-full hover:opacity-70 relative" style={{ color: colors.ink }}>
            <Bell size={16} />
            <div style={{ position: 'absolute', top: 2, right: 2, width: '6px', height: '6px', backgroundColor: colors.pink, borderRadius: '50%' }} />
          </button>
        </div>
      </div>
    </>
  );
}

function SectionRule({ label, colors }) {
  return (
    <div className="flex items-center gap-3 px-5 pt-6">
      <div className="text-[10px] tracking-[0.28em] uppercase whitespace-nowrap font-semibold" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>{label}</div>
      <div style={{ flex: 1, height: '1px', backgroundColor: colors.rule }} />
    </div>
  );
}

function StatTile({ icon: Icon, label, value, sub, accent, colors }) {
  return (
    <div className="p-3" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.rule}`, borderRadius: '3px' }}>
      <div className="flex items-center gap-1 mb-2" style={{ color: accent }}>
        <Icon size={11} strokeWidth={2.5} />
        <span className="text-[9px] tracking-[0.2em] uppercase font-bold" style={{ fontFamily: '"Inter", sans-serif' }}>{label}</span>
      </div>
      <div className="text-[18px] font-bold leading-none" style={{ fontFamily: '"Georgia", serif' }}>{value}</div>
      {sub && (<div className="text-[10px] tracking-[0.1em] uppercase mt-1" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>{sub}</div>)}
    </div>
  );
}

function HomeTab({ colors, isDark, setTheme }) {
  // Real Ambush news from RSS feed (refreshed by GitHub Action every 4 hours).
  // Show only the top 3 on Home; full list lives elsewhere.
  const news = (newsData.items || []).slice(0, 3).map((item) => ({
    headline: item.title,
    tag: item.tag || 'CLUB',
    image: item.image,
    url: item.url,
    publishedAt: item.publishedAt,
  }));

  // Hero photo carousel — auto-rotate every 5 seconds
  const [photoIndex, setPhotoIndex] = useState(0);
  useEffect(() => {
    if (heroPhotos.length <= 1) return;
    const id = setInterval(() => {
      setPhotoIndex((i) => (i + 1) % heroPhotos.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);
  const currentPhoto = heroPhotos[photoIndex];

  return (
    <>
      <TopBar colors={colors} isDark={isDark} setTheme={setTheme} />
      <div style={{ height: '1px', backgroundColor: colors.rule, marginInline: '20px' }} />
      <div className="overflow-y-auto pb-32" style={{ height: 'calc(100% - 100px)' }}>
        <div className="relative mx-5 mt-4 overflow-hidden" style={{ borderRadius: '4px', aspectRatio: '4/5', backgroundColor: '#000' }}>
          {/* Photo carousel with crossfade */}
          {heroPhotos.map((p, i) => (
            <img
              key={p.src}
              src={p.src}
              alt=""
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: i === photoIndex ? 1 : 0,
                transition: 'opacity 800ms ease-in-out',
              }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ))}
          {/* Subtle overlay for legibility — softens the photo behind the type without losing it */}
          <div className="absolute inset-x-0 bottom-0" style={{ height: '70%', background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.92) 90%)' }} />
          <div className="absolute inset-x-0 top-0" style={{ height: '20%', background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)' }} />

          <div className="absolute top-4 left-4">
            <div className="px-2 py-1 flex items-center gap-1.5" style={{ backgroundColor: colors.pink, borderRadius: '2px' }}>
              <div style={{ width: '6px', height: '6px', backgroundColor: '#fff', borderRadius: '50%' }} />
              <span className="text-[9px] tracking-[0.2em] uppercase font-bold" style={{ color: '#fff', fontFamily: '"Inter", sans-serif' }}>Match Week</span>
            </div>
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-2" style={{ backgroundColor: '#00000099', borderRadius: '2px', padding: '4px 8px' }}>
            <img src={ambushLogo} alt="Ambush" style={{ height: '20px', width: 'auto', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <span className="text-[10px] tracking-[0.18em] uppercase font-bold" style={{ color: '#ffffffcc', fontFamily: '"Inter", sans-serif' }}>vs</span>
            <img src={logoFor('San Diego Sockers')} alt="Sockers" style={{ height: '20px', width: '20px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>

          {/* Carousel dots */}
          <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
            {heroPhotos.map((_, i) => (
              <button
                key={i}
                onClick={() => setPhotoIndex(i)}
                aria-label={`Photo ${i + 1}`}
                style={{
                  width: i === photoIndex ? '14px' : '5px',
                  height: '5px',
                  backgroundColor: i === photoIndex ? colors.teal : '#ffffff66',
                  borderRadius: '3px',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 300ms',
                }}
              />
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 pb-8">
            <div className="text-[10px] tracking-[0.25em] uppercase font-semibold mb-2" style={{ color: colors.teal, fontFamily: '"Inter", sans-serif' }}>Sat · Nov 15 · 7:05 PM · Family Arena</div>
            <div className="text-[13px] tracking-[0.05em] uppercase mb-1" style={{ color: '#ffffffcc', fontFamily: '"Inter", sans-serif', fontWeight: 500 }}>Ambush vs.</div>
            <h1 className="font-bold leading-[0.92]" style={{ fontSize: '52px', letterSpacing: '-0.025em', color: '#fff', fontFamily: '"Georgia", serif' }}>San Diego <em style={{ color: colors.pink, fontStyle: 'italic' }}>Sockers</em></h1>
            <div className="flex items-center gap-2 mt-3">
              <div style={{ width: '6px', height: '6px', backgroundColor: colors.pink, borderRadius: '50%' }} />
              <span className="text-[12px] italic" style={{ color: '#ffffffcc' }}>Hispanic Heritage Night</span>
            </div>
          </div>
        </div>

        <div className="px-5 mt-3">
          <button className="w-full py-4 flex items-center justify-between px-5 transition-transform active:scale-[0.98]" style={{ backgroundColor: colors.teal, color: '#0a0a0a', borderRadius: '4px' }}>
            <span className="text-[13px] tracking-[0.18em] uppercase font-bold" style={{ fontFamily: '"Inter", sans-serif' }}>Get Tickets</span>
            <ArrowUpRight size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-5 mt-6">
          <div className="grid grid-cols-3 gap-2">
            <StatTile icon={Flame} label="Form" value="W-W-L-W-W" accent={colors.teal} colors={colors} />
            <StatTile icon={Target} label="Standing" value="2nd" sub="MASL East" accent={colors.pink} colors={colors} />
            <StatTile icon={Zap} label="Streak" value="W2" sub="Home" accent={colors.teal} colors={colors} />
          </div>
        </div>

        <SectionRule label="01 · Last Match" colors={colors} />
        <div className="px-5 pt-4 pb-2">
          <div className="relative overflow-hidden" style={{ borderRadius: '4px', backgroundColor: colors.bgCard, border: `1px solid ${colors.rule}` }}>
            <div className="relative" style={{ aspectRatio: '16/9', background: `radial-gradient(ellipse at 70% 50%, ${colors.teal}44 0%, transparent 60%), linear-gradient(135deg, #1a1a1a 0%, #000 100%)` }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 flex items-center justify-center" style={{ backgroundColor: '#ffffff', borderRadius: '50%' }}>
                  <Play size={20} fill="#000" stroke="#000" />
                </div>
              </div>
              <div className="absolute top-3 left-3">
                <span className="text-[9px] tracking-[0.2em] uppercase font-bold px-2 py-1" style={{ color: '#fff', backgroundColor: '#00000099', fontFamily: '"Inter", sans-serif' }}>Highlights · 2:14</span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] tracking-[0.22em] uppercase font-bold" style={{ color: colors.teal, fontFamily: '"Inter", sans-serif' }}>W</span>
                  <span className="text-[28px] font-bold leading-none" style={{ fontFamily: '"Georgia", serif' }}>6–4</span>
                  <span className="text-[12px] uppercase tracking-[0.15em] ml-1" style={{ color: colors.inkMuted, fontFamily: '"Inter", sans-serif' }}>OT</span>
                </div>
                <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>vs Milwaukee · Away</span>
              </div>
              <p className="text-[14px] italic leading-snug" style={{ color: colors.inkMuted }}>Wisniewski hat trick, OT winner from Burt at 2:18.</p>
            </div>
          </div>
        </div>

        <SectionRule label="02 · Headlines" colors={colors} />
        <div className="px-5 py-2">
          {news.length === 0 && (
            <div className="py-6 text-center">
              <span className="text-[12px] italic" style={{ color: colors.inkMuted, fontFamily: '"Georgia", serif' }}>No headlines yet — check back soon.</span>
            </div>
          )}
          {news.map((item, i) => (
            <a key={i} href={item.url || '#'} target="_blank" rel="noopener noreferrer" className="py-4 flex items-start gap-3" style={{ borderBottom: i < news.length - 1 ? `1px solid ${colors.rule}` : 'none', textDecoration: 'none', color: 'inherit', display: 'flex' }}>
              <div className="flex-shrink-0 overflow-hidden" style={{ width: '76px', height: '76px', borderRadius: '3px', background: i % 2 === 0 ? `linear-gradient(135deg, ${colors.teal}33, ${colors.pink}22, #000)` : `linear-gradient(135deg, ${colors.pink}33, ${colors.teal}22, #000)` }}>
                {item.image && (
                  <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] tracking-[0.22em] uppercase font-bold" style={{ color: colors.teal, fontFamily: '"Inter", sans-serif' }}>{item.tag}</span>
                  <span style={{ color: colors.inkSubtle }}>·</span>
                  <span className="text-[10px]" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>{timeAgo(item.publishedAt)}</span>
                </div>
                <h3 className="text-[15px] font-bold leading-tight" style={{ fontFamily: '"Georgia", serif', letterSpacing: '-0.005em' }}>{item.headline}</h3>
              </div>
            </a>
          ))}
        </div>

        <SectionRule label="03 · From the Feed" colors={colors} />
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] tracking-[0.2em] uppercase" style={{ color: colors.inkMuted, fontFamily: '"Inter", sans-serif' }}>@stlouisambush</span>
            <button className="text-[10px] tracking-[0.2em] uppercase font-semibold flex items-center gap-1" style={{ color: colors.pink, fontFamily: '"Inter", sans-serif' }}>See all<ChevronRight size={12} /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'reel', label: 'Goal · Wisniewski' },
              { type: 'photo', label: 'Postgame' },
              { type: 'photo', label: 'Locker Room' },
              { type: 'reel', label: 'Save of the Week' },
            ].map((post, i) => (
              <div key={i} className="relative aspect-square overflow-hidden" style={{ borderRadius: '3px', background: i % 2 === 0 ? `linear-gradient(135deg, ${colors.teal}66, ${colors.pink}33, #000)` : `linear-gradient(135deg, ${colors.pink}66, ${colors.teal}33, #000)` }}>
                <div className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.04) 3px, rgba(255,255,255,0.04) 6px)` }} />
                {post.type === 'reel' && (<div className="absolute top-2 right-2"><Play size={14} fill="#fff" stroke="#fff" /></div>)}
                <div className="absolute bottom-0 left-0 right-0 p-2.5" style={{ background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.85))' }}>
                  <span className="text-[10px] tracking-[0.1em] font-semibold" style={{ color: '#fff', fontFamily: '"Inter", sans-serif' }}>{post.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 pb-4 text-center">
          <div className="text-[9px] tracking-[0.3em] uppercase" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>St. Louis · Soccer Started Here</div>
        </div>
      </div>
    </>
  );
}

function ScheduleTab({ colors, isDark, setTheme, filter, setFilter, league, setLeague }) {
  // Transform real schedule JSON into the grouped-by-month shape the UI expects.
  // Split into upcoming vs. past based on `status` (and date as a fallback).
  const groupGames = (games, isUpcoming) => {
    const now = new Date();
    const filtered = (games || []).filter((g) => {
      if (g.status === 'final') return !isUpcoming;
      if (g.status === 'upcoming') return isUpcoming;
      // Fallback: use date
      const gd = new Date(g.date);
      return isUpcoming ? gd >= now : gd < now;
    });
    // Group by Month Year
    const groups = {};
    for (const g of filtered) {
      const d = new Date(g.date + 'T12:00:00');
      const monthYear = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) groups[monthYear] = { month: monthYear, sortKey: d.getTime(), games: [] };
      groups[monthYear].games.push({
        date: g.dateLabel,
        day: g.day,
        month: g.monthLabel,
        time: g.time,
        opponent: g.opponent,
        isHome: g.isHome,
        promo: g.promo,
        result: g.result,
        score: g.score,
        overtime: g.overtime,
      });
    }
    // Sort: upcoming = chronological, past = reverse chronological
    return Object.values(groups).sort((a, b) => isUpcoming ? a.sortKey - b.sortKey : b.sortKey - a.sortKey);
  };

  const upcomingMASL = groupGames(scheduleData.games, true);
  const pastMASL = groupGames(scheduleData.games, false);

  // FC Ambush USL2 schedule lives on a separate platform (modular11.com).
  // Will wire up in a future pass — for now, a clear placeholder.
  const upcomingUSL2 = [];
  const pastUSL2 = [];

  const data = league === 'masl' ? (filter === 'upcoming' ? upcomingMASL : pastMASL) : (filter === 'upcoming' ? upcomingUSL2 : pastUSL2);

  return (
    <>
      <TopBar colors={colors} isDark={isDark} setTheme={setTheme} />
      <div style={{ height: '1px', backgroundColor: colors.rule, marginInline: '20px' }} />

      <div className="px-5 pt-4 pb-3">
        <div className="flex" style={{ border: `1px solid ${colors.rule}`, borderRadius: '3px', padding: '3px', backgroundColor: colors.bgElevated }}>
          {[{ id: 'masl', label: 'MASL Indoor' }, { id: 'usl2', label: 'FC Ambush · USL2' }].map((opt) => {
            const active = league === opt.id;
            return (
              <button key={opt.id} onClick={() => setLeague(opt.id)} className="flex-1 py-2 transition-all" style={{ backgroundColor: active ? colors.bg : 'transparent', borderRadius: '2px', color: active ? colors.ink : colors.inkMuted, fontFamily: '"Inter", sans-serif', boxShadow: active ? `0 0 0 1px ${colors.rule}` : 'none' }}>
                <span className="text-[11px] tracking-[0.16em] uppercase font-semibold">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 pb-2 flex items-center gap-4" style={{ borderBottom: `1px solid ${colors.rule}` }}>
        {[{ id: 'upcoming', label: 'Upcoming' }, { id: 'past', label: 'Past' }].map((t) => {
          const active = filter === t.id;
          return (
            <button key={t.id} onClick={() => setFilter(t.id)} className="pb-2 transition-all relative" style={{ color: active ? colors.ink : colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>
              <span className="text-[11px] tracking-[0.18em] uppercase font-semibold">{t.label}</span>
              {active && (<div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: '2px', backgroundColor: colors.teal }} />)}
            </button>
          );
        })}
        <div className="flex-1" />
        <button className="text-[10px] tracking-[0.15em] uppercase flex items-center gap-1 pb-2" style={{ color: colors.inkMuted, fontFamily: '"Inter", sans-serif' }}>
          <ArrowDown size={11} /> Add to Calendar
        </button>
      </div>

      <div className="overflow-y-auto pb-32" style={{ height: 'calc(100% - 200px)' }}>
        {data.map((monthBlock, mi) => (
          <div key={mi}>
            <div className="px-5 pt-5 pb-2">
              <div className="flex items-baseline gap-3">
                <h2 className="text-[24px] font-bold leading-none" style={{ fontFamily: '"Georgia", serif', letterSpacing: '-0.02em' }}>{monthBlock.month.split(' ')[0]}</h2>
                <span className="text-[14px] italic" style={{ color: colors.inkMuted, fontFamily: '"Georgia", serif' }}>{monthBlock.month.split(' ')[1]}</span>
              </div>
              <div style={{ height: '1px', backgroundColor: colors.rule, marginTop: '8px' }} />
            </div>
            <div className="px-5">
              {monthBlock.games.map((g, gi) => <GameRow key={gi} game={g} colors={colors} filter={filter} />)}
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-16 px-5">
            <div className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>No matches yet</div>
            <div className="text-[14px] italic text-center" style={{ color: colors.inkMuted, fontFamily: '"Georgia", serif' }}>Check back when the season schedule drops.</div>
          </div>
        )}

        <div className="pt-6 pb-4 text-center">
          <div className="text-[9px] tracking-[0.3em] uppercase" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>All times Central · Family Arena, St. Charles</div>
        </div>
      </div>
    </>
  );
}

function GameRow({ game, colors, filter }) {
  const isResult = filter === 'past';
  const won = game.result === 'W';

  return (
    <div className="py-4 flex items-center gap-4" style={{ borderBottom: `1px solid ${colors.rule}` }}>
      <div className="flex-shrink-0 text-center" style={{ width: '52px', paddingTop: '6px', paddingBottom: '6px', borderRight: `1px solid ${colors.rule}`, paddingRight: '12px', marginRight: '4px' }}>
        <div className="text-[9px] tracking-[0.2em] uppercase mb-1 font-semibold" style={{ color: colors.teal, fontFamily: '"Inter", sans-serif' }}>{game.day}</div>
        <div className="text-[24px] font-bold leading-none" style={{ fontFamily: '"Georgia", serif' }}>{game.date}</div>
        <div className="text-[9px] tracking-[0.15em] uppercase mt-1" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>{game.month}</div>
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-3">
        {logoFor(game.opponent) && (
          <div className="flex-shrink-0" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={logoFor(game.opponent)} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.3))' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] tracking-[0.2em] uppercase font-bold" style={{ color: game.isHome ? colors.teal : colors.pink, fontFamily: '"Inter", sans-serif' }}>{game.isHome ? 'Home' : 'Away'}</span>
            <span style={{ color: colors.inkSubtle }}>·</span>
            <span className="text-[10px]" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>{game.time}</span>
          </div>
          <h3 className="text-[16px] font-bold leading-tight" style={{ fontFamily: '"Georgia", serif', letterSpacing: '-0.005em' }}>{game.isHome ? 'vs.' : 'at'} <em style={{ color: colors.pink, fontStyle: 'italic' }}>{game.opponent.split(' ').slice(-1)}</em></h3>
          <div className="text-[11px] mt-0.5" style={{ color: colors.inkMuted, fontFamily: '"Inter", sans-serif' }}>{game.opponent}</div>
          {game.promo && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div style={{ width: '4px', height: '4px', backgroundColor: colors.pink, borderRadius: '50%' }} />
              <span className="text-[11px] italic" style={{ color: colors.inkMuted }}>{game.promo}</span>
            </div>
          )}
        </div>
      </div>

      {isResult ? (
        <div className="flex-shrink-0 text-right">
          <div className="flex items-baseline gap-1.5 justify-end">
            <span className="text-[12px] tracking-[0.15em] uppercase font-bold" style={{ color: won ? colors.teal : colors.pink, fontFamily: '"Inter", sans-serif' }}>{game.result}</span>
            <span className="text-[20px] font-bold leading-none" style={{ fontFamily: '"Georgia", serif' }}>{game.score}</span>
          </div>
          {game.overtime && (<div className="text-[9px] tracking-[0.18em] uppercase mt-1" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>OT</div>)}
        </div>
      ) : (
        <button className="flex-shrink-0 px-3 py-2 flex items-center gap-1" style={{ backgroundColor: game.isHome ? colors.teal : 'transparent', color: game.isHome ? '#000' : colors.pink, border: game.isHome ? 'none' : `1px solid ${colors.pink}`, borderRadius: '2px', fontFamily: '"Inter", sans-serif' }}>
          <span className="text-[10px] tracking-[0.18em] uppercase font-bold">{game.isHome ? 'Tickets' : 'Watch'}</span>
          <ArrowUpRight size={12} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

function TeamTab({ colors, isDark, setTheme, view, setView, selectedPlayer, setSelectedPlayer }) {
  // Group roster players by position. Empty groups render nothing,
  // and when the whole roster is empty we show a clean placeholder.
  const allPlayers = rosterData.players || [];
  const maslRoster = {
    forwards: allPlayers.filter((p) => p.pos === 'F'),
    midfielders: allPlayers.filter((p) => p.pos === 'M'),
    defenders: allPlayers.filter((p) => p.pos === 'D'),
    keepers: allPlayers.filter((p) => p.pos === 'GK'),
  };
  const rosterIsEmpty = allPlayers.length === 0;

  // Real coaches from coaches.json. First isHero is treated as the visual hero card.
  const allCoaches = coachesData.coaches || [];
  const heroCoach = allCoaches.find((c) => c.isHero) || allCoaches[0];
  const otherCoaches = allCoaches.filter((c) => c !== heroCoach);
  const frontOffice = coachesData.frontOffice || [];

  // If a player is selected, show their profile instead of the roster
  if (selectedPlayer) {
    return <PlayerProfile player={selectedPlayer} colors={colors} isDark={isDark} setTheme={setTheme} onBack={() => setSelectedPlayer(null)} />;
  }

  return (
    <>
      <TopBar colors={colors} isDark={isDark} setTheme={setTheme} />
      <div style={{ height: '1px', backgroundColor: colors.rule, marginInline: '20px' }} />

      <div className="px-5 pt-4 pb-3">
        <div className="flex" style={{ border: `1px solid ${colors.rule}`, borderRadius: '3px', padding: '3px', backgroundColor: colors.bgElevated }}>
          {[{ id: 'masl', label: 'MASL Indoor' }, { id: 'usl2', label: 'FC Ambush · USL2' }].map((opt) => {
            const active = view === opt.id;
            return (
              <button key={opt.id} onClick={() => setView(opt.id)} className="flex-1 py-2 transition-all" style={{ backgroundColor: active ? colors.bg : 'transparent', borderRadius: '2px', color: active ? colors.ink : colors.inkMuted, fontFamily: '"Inter", sans-serif', boxShadow: active ? `0 0 0 1px ${colors.rule}` : 'none' }}>
                <span className="text-[11px] tracking-[0.16em] uppercase font-semibold">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-y-auto pb-32" style={{ height: 'calc(100% - 168px)' }}>
        {view === 'masl' ? (
          <>
            <div className="px-5 pt-3">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] tracking-[0.28em] uppercase font-semibold" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>Sideline</div>
                <div style={{ flex: 1, height: '1px', backgroundColor: colors.rule, marginLeft: '12px' }} />
              </div>

              <div className="relative overflow-hidden mb-3" style={{ borderRadius: '4px', backgroundColor: colors.bgCard, border: `1px solid ${colors.rule}` }}>
                <div className="relative" style={{ aspectRatio: '16/9', background: heroCoach?.photo ? '#000' : `radial-gradient(ellipse at 30% 50%, ${colors.teal}55 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, ${colors.pink}33 0%, transparent 65%), linear-gradient(135deg, #1a1a1a 0%, #000 100%)` }}>
                  {heroCoach?.photo && (
                    <img src={heroCoach.photo} alt={heroCoach.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  )}
                  <div className="absolute inset-x-0 bottom-0" style={{ height: '75%', background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.92) 80%)' }} />
                  {heroCoach?.badge && (
                    <div className="absolute top-3 left-3">
                      <div className="px-2 py-1 flex items-center gap-1.5" style={{ backgroundColor: colors.pink, borderRadius: '2px' }}>
                        <Award size={10} color="#fff" strokeWidth={2.5} />
                        <span className="text-[9px] tracking-[0.2em] uppercase font-bold" style={{ color: '#fff', fontFamily: '"Inter", sans-serif' }}>{heroCoach.badge}</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="text-[10px] tracking-[0.22em] uppercase font-semibold mb-1" style={{ color: colors.teal, fontFamily: '"Inter", sans-serif' }}>{heroCoach?.title || 'Head Coach'} {heroCoach?.subtitle ? `· ${heroCoach.subtitle}` : ''}</div>
                    <div className="text-[26px] font-bold leading-tight" style={{ color: '#fff', fontFamily: '"Georgia", serif', letterSpacing: '-0.02em' }}>
                      {(heroCoach?.name || 'Head Coach').split(' ')[0]}{' '}
                      <em style={{ color: colors.pink, fontStyle: 'italic' }}>{(heroCoach?.name || '').split(' ').slice(1).join(' ')}</em>
                    </div>
                  </div>
                </div>
              </div>

              {otherCoaches.map((c, i) => (
                <div key={c.id || i} className="py-3 flex items-center gap-3" style={{ borderBottom: i < otherCoaches.length - 1 ? `1px solid ${colors.rule}` : 'none' }}>
                  <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden" style={{ background: `linear-gradient(135deg, ${colors.teal}55, ${colors.pink}33, #000)` }}>
                    {c.photo && (
                      <img src={c.photo} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-bold leading-tight" style={{ fontFamily: '"Georgia", serif' }}>{c.name}</div>
                    <div className="text-[10px] tracking-[0.18em] uppercase mt-0.5" style={{ color: colors.inkMuted, fontFamily: '"Inter", sans-serif' }}>{c.title}{c.subtitle ? ` · ${c.subtitle}` : ''}</div>
                  </div>
                </div>
              ))}
            </div>

            {rosterIsEmpty ? (
              <>
                <SectionRule label="Roster" colors={colors} />
                <div className="px-5 pt-3 pb-2">
                  <div className="py-8 text-center" style={{ border: `1px dashed ${colors.rule}`, borderRadius: '4px' }}>
                    <div className="text-[10px] tracking-[0.28em] uppercase mb-2" style={{ color: colors.teal, fontFamily: '"Inter", sans-serif' }}>Coming Soon</div>
                    <div className="text-[16px] italic" style={{ color: colors.inkMuted, fontFamily: '"Georgia", serif' }}>Roster reveal in progress</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {maslRoster.forwards.length > 0 && <RosterSection title="Forwards" players={maslRoster.forwards} colors={colors} onPlayerClick={setSelectedPlayer} />}
                {maslRoster.midfielders.length > 0 && <RosterSection title="Midfielders" players={maslRoster.midfielders} colors={colors} onPlayerClick={setSelectedPlayer} />}
                {maslRoster.defenders.length > 0 && <RosterSection title="Defenders" players={maslRoster.defenders} colors={colors} onPlayerClick={setSelectedPlayer} />}
                {maslRoster.keepers.length > 0 && <RosterSection title="Goalkeepers" players={maslRoster.keepers} colors={colors} onPlayerClick={setSelectedPlayer} />}
              </>
            )}

            <SectionRule label="Front Office" colors={colors} />
            <div className="px-5 pt-3">
              {frontOffice.map((p, i, arr) => (
                <div key={i} className="py-3 flex items-center justify-between" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${colors.rule}` : 'none' }}>
                  <div>
                    <div className="text-[15px] font-bold leading-tight" style={{ fontFamily: '"Georgia", serif' }}>{p.name}</div>
                    <div className="text-[10px] tracking-[0.18em] uppercase mt-0.5" style={{ color: colors.inkMuted, fontFamily: '"Inter", sans-serif' }}>{p.title}</div>
                  </div>
                  <ChevronRight size={16} color={colors.inkSubtle} />
                </div>
              ))}
            </div>

            <div className="pt-6 pb-4 text-center">
              <div className="text-[9px] tracking-[0.3em] uppercase" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>2025–26 Squad{allPlayers.length > 0 ? ` · ${allPlayers.length} Active` : ''}</div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 px-5">
            <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>Summer 2026 Roster</div>
            <div className="text-[24px] font-bold mb-2 text-center" style={{ fontFamily: '"Georgia", serif', letterSpacing: '-0.02em' }}>FC Ambush <em style={{ color: colors.pink, fontStyle: 'italic' }}>·</em> USL2</div>
            <div className="text-[14px] italic text-center max-w-[280px]" style={{ color: colors.inkMuted, fontFamily: '"Georgia", serif' }}>Open trials in March. Roster announcements begin May 1.</div>
            <button className="mt-6 px-4 py-2 flex items-center gap-2" style={{ border: `1px solid ${colors.teal}`, borderRadius: '2px' }}>
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold" style={{ color: colors.teal, fontFamily: '"Inter", sans-serif' }}>Notify Me</span>
              <Bell size={11} color={colors.teal} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function RosterSection({ title, players, colors, onPlayerClick }) {
  return (
    <>
      <SectionRule label={title} colors={colors} />
      <div className="px-5 pt-3">
        <div className="grid grid-cols-2 gap-2">
          {players.map((p, i) => <PlayerCard key={i} player={p} colors={colors} onClick={() => onPlayerClick(p)} />)}
        </div>
      </div>
    </>
  );
}

function PlayerCard({ player, colors, onClick }) {
  const [imgError, setImgError] = useState(false);
  const showPhoto = player.photo && !imgError;
  return (
    <button onClick={onClick} className="relative overflow-hidden text-left transition-transform active:scale-[0.98]" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.rule}`, borderRadius: '3px' }}>
      <div className="relative" style={{ aspectRatio: '1/1.1', background: showPhoto ? '#000' : `radial-gradient(ellipse at 50% 30%, ${colors.teal}44 0%, transparent 60%), linear-gradient(180deg, #1a1a1a 0%, #000 100%)` }}>
        {showPhoto && (
          <img src={player.photo} alt={player.name} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'grayscale(0.15) contrast(1.05)' }} />
        )}
        {!showPhoto && <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)` }} />}
        <div className="absolute top-2 right-2 leading-none" style={{ fontSize: '52px', fontFamily: '"Georgia", serif', fontWeight: 700, color: showPhoto ? '#ffffffaa' : '#ffffff15', letterSpacing: '-0.05em', textShadow: showPhoto ? '0 2px 8px rgba(0,0,0,0.7)' : 'none' }}>{player.num}</div>
        {player.tag && (
          <div className="absolute top-2 left-2">
            <div className="px-1.5 py-0.5" style={{ backgroundColor: colors.pink, borderRadius: '2px' }}>
              <span className="text-[7px] tracking-[0.18em] uppercase font-bold" style={{ color: '#fff', fontFamily: '"Inter", sans-serif' }}>{player.tag}</span>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 left-2">
          <span className="text-[8px] tracking-[0.2em] uppercase font-bold px-1.5 py-0.5" style={{ color: colors.teal, border: `1px solid ${colors.teal}`, borderRadius: '2px', fontFamily: '"Inter", sans-serif' }}>{player.pos}</span>
        </div>
      </div>
      <div className="p-2.5">
        <div className="text-[9px] tracking-[0.2em] uppercase font-semibold" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>#{player.num}</div>
        <div className="text-[14px] font-bold leading-tight mt-0.5 truncate" style={{ fontFamily: '"Georgia", serif' }}>
          {player.name.split(' ')[0]}{' '}
          <em style={{ color: colors.pink, fontStyle: 'italic' }}>{player.name.split(' ').slice(1).join(' ')}</em>
        </div>
      </div>
    </button>
  );
}

function LoyaltyTab({ colors, isDark, setTheme, view, setView }) {
  return (
    <>
      <TopBar colors={colors} isDark={isDark} setTheme={setTheme} />
      <div style={{ height: '1px', backgroundColor: colors.rule, marginInline: '20px' }} />
      <div className="flex items-center gap-4 px-5 pt-3 pb-2" style={{ borderBottom: `1px solid ${colors.rule}` }}>
        {[{ id: 'overview', label: 'Overview' }, { id: 'leaderboard', label: 'Leaderboard' }, { id: 'album', label: 'My Album' }].map((t) => {
          const active = view === t.id;
          return (
            <button key={t.id} onClick={() => setView(t.id)} className="pb-2 transition-all relative" style={{ color: active ? colors.ink : colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>
              <span className="text-[11px] tracking-[0.18em] uppercase font-semibold">{t.label}</span>
              {active && (<div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: '2px', backgroundColor: colors.teal }} />)}
            </button>
          );
        })}
      </div>
      <div className="overflow-y-auto pb-32" style={{ height: 'calc(100% - 144px)' }}>
        {view === 'overview' && <LoyaltyOverview colors={colors} />}
        {view === 'leaderboard' && <LoyaltyLeaderboard colors={colors} />}
        {view === 'album' && <LoyaltyAlbum colors={colors} />}
      </div>
    </>
  );
}

function LoyaltyOverview({ colors }) {
  const challenges = [
    { title: 'Predict the Sockers Score', xp: 200, status: 'active', icon: Brain, sub: 'Closes Sat 6:55 PM' },
    { title: 'Check In at the Family Arena', xp: 250, status: 'locked', icon: MapPin, sub: 'Available match day' },
    { title: 'MASL Trivia · Round 12', xp: 100, status: 'progress', progress: 4, total: 5, icon: Brain, sub: '4 of 5 correct' },
    { title: 'Share a Recap to Instagram', xp: 100, status: 'active', icon: TrendingUp },
    { title: 'Refer a Friend', xp: 500, status: 'active', icon: Users },
  ];

  return (
    <div className="pt-4">
      <div className="px-5">
        <div className="relative overflow-hidden p-5" style={{ borderRadius: '4px', background: `linear-gradient(135deg, ${colors.pink} 0%, ${colors.pinkDeep} 50%, #000 130%)`, minHeight: '180px' }}>
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)` }} />
          <div className="relative">
            <div className="text-[10px] tracking-[0.25em] uppercase font-semibold mb-1" style={{ color: '#ffffffcc', fontFamily: '"Inter", sans-serif' }}>Ambush Insider · Member</div>
            <div className="text-[28px] font-bold leading-tight" style={{ color: '#fff', fontFamily: '"Georgia", serif', letterSpacing: '-0.02em' }}>Dyllan <em style={{ fontStyle: 'italic', color: '#0a0a0a' }}>Haggard</em></div>
            <div className="flex items-baseline gap-3 mt-4">
              <div>
                <div className="text-[9px] tracking-[0.22em] uppercase mb-0.5" style={{ color: '#ffffff99', fontFamily: '"Inter", sans-serif' }}>Tier</div>
                <div className="text-[16px] font-bold tracking-[0.05em] uppercase" style={{ color: '#fff', fontFamily: '"Inter", sans-serif' }}>Insider</div>
              </div>
              <div style={{ width: '1px', height: '32px', backgroundColor: '#ffffff44' }} />
              <div>
                <div className="text-[9px] tracking-[0.22em] uppercase mb-0.5" style={{ color: '#ffffff99', fontFamily: '"Inter", sans-serif' }}>Points</div>
                <div className="text-[16px] font-bold" style={{ color: '#fff', fontFamily: '"Georgia", serif' }}>1,425</div>
              </div>
              <div style={{ width: '1px', height: '32px', backgroundColor: '#ffffff44' }} />
              <div>
                <div className="text-[9px] tracking-[0.22em] uppercase mb-0.5" style={{ color: '#ffffff99', fontFamily: '"Inter", sans-serif' }}>Rank</div>
                <div className="text-[16px] font-bold" style={{ color: '#fff', fontFamily: '"Georgia", serif' }}>#42</div>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex justify-between mb-1.5">
                <span className="text-[10px] tracking-[0.18em] uppercase" style={{ color: '#ffffffcc', fontFamily: '"Inter", sans-serif' }}>To Diehard</span>
                <span className="text-[10px] tracking-[0.1em]" style={{ color: '#ffffffcc', fontFamily: '"Inter", sans-serif' }}>1,425 / 2,500</span>
              </div>
              <div style={{ height: '4px', backgroundColor: '#00000044', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '57%', backgroundColor: colors.teal, borderRadius: '2px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <SectionRule label="This Week's Drop" colors={colors} />
      <div className="px-5 pt-4">
        <div className="relative overflow-hidden" style={{ borderRadius: '4px', backgroundColor: colors.bgCard, border: `1px solid ${colors.rule}` }}>
          <div className="relative" style={{ aspectRatio: '16/9', background: `radial-gradient(ellipse at 30% 50%, ${colors.pink}66 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, ${colors.teal}55 0%, transparent 55%), linear-gradient(135deg, #1a1a1a 0%, #000 100%)` }}>
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)` }} />
            <div className="absolute top-3 left-3">
              <div className="px-2 py-1 flex items-center gap-1.5" style={{ backgroundColor: colors.pink, borderRadius: '2px' }}>
                <Award size={10} color="#fff" strokeWidth={2.5} />
                <span className="text-[9px] tracking-[0.2em] uppercase font-bold" style={{ color: '#fff', fontFamily: '"Inter", sans-serif' }}>Giveaway</span>
              </div>
            </div>
            <div className="absolute bottom-3 right-3">
              <span className="text-[10px] tracking-[0.2em] uppercase font-semibold px-2 py-1" style={{ color: '#fff', backgroundColor: '#00000099', fontFamily: '"Inter", sans-serif' }}>Closes in 4 days</span>
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-[24px] font-bold leading-tight mb-2" style={{ fontFamily: '"Georgia", serif', letterSpacing: '-0.015em' }}>Two Tickets vs. <em style={{ color: colors.pink, fontStyle: 'italic' }}>Sockers</em></h3>
            <p className="text-[13px] italic mb-4 leading-snug" style={{ color: colors.inkMuted }}>Two free tickets to the Nov 15 home match. Drawn at random Friday night — must be a member to enter.</p>
            <button className="w-full py-3 flex items-center justify-center gap-2" style={{ backgroundColor: colors.teal, color: '#000', borderRadius: '2px' }}>
              <span className="text-[12px] tracking-[0.2em] uppercase font-bold" style={{ fontFamily: '"Inter", sans-serif' }}>Enter Drawing</span>
            </button>
          </div>
        </div>
      </div>

      <SectionRule label="Active Challenges" colors={colors} />
      <div className="px-5 pt-3">
        {challenges.map((c, i) => {
          const Icon = c.icon;
          const locked = c.status === 'locked';
          return (
            <div key={i} className="py-4 flex items-center justify-between gap-3" style={{ borderBottom: i < challenges.length - 1 ? `1px solid ${colors.rule}` : 'none', opacity: locked ? 0.5 : 1 }}>
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center" style={{ border: `1px solid ${colors.rule}`, borderRadius: '50%', color: locked ? colors.inkSubtle : colors.teal }}>
                {locked ? <Lock size={14} strokeWidth={2} /> : <Icon size={15} strokeWidth={2} />}
              </div>
              <div className="flex-1">
                <h4 className="text-[15px] font-bold leading-tight mb-1" style={{ fontFamily: '"Georgia", serif' }}>{c.title}</h4>
                {c.status === 'progress' ? (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div style={{ flex: 1, height: '3px', backgroundColor: colors.rule, borderRadius: '2px', overflow: 'hidden', maxWidth: '100px' }}>
                      <div style={{ height: '100%', width: `${(c.progress / c.total) * 100}%`, backgroundColor: colors.teal }} />
                    </div>
                    <span className="text-[10px] tracking-[0.1em]" style={{ color: colors.inkMuted, fontFamily: '"Inter", sans-serif' }}>{c.sub}</span>
                  </div>
                ) : (c.sub && (<span className="text-[10px] tracking-[0.1em] uppercase" style={{ color: colors.inkMuted, fontFamily: '"Inter", sans-serif' }}>{c.sub}</span>))}
              </div>
              <div className="px-2.5 py-1 flex items-center gap-1" style={{ border: `1px solid ${locked ? colors.rule : colors.teal}`, borderRadius: '2px' }}>
                <span className="text-[11px] font-bold tracking-[0.05em]" style={{ color: locked ? colors.inkSubtle : colors.teal, fontFamily: '"Inter", sans-serif' }}>+{c.xp}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-6 pb-4 text-center">
        <div className="text-[9px] tracking-[0.3em] uppercase" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>Earn · Climb · Belong</div>
      </div>
    </div>
  );
}

function LoyaltyLeaderboard({ colors }) {
  const board = [
    { rank: 1, name: 'Marcus Trujillo', tier: 'Hall of Famer', pts: 8420, isYou: false },
    { rank: 2, name: 'Sarah Eisenmann', tier: 'Hall of Famer', pts: 6210, isYou: false },
    { rank: 3, name: 'Tony Marchetti', tier: 'Diehard', pts: 5840, isYou: false },
    { rank: 4, name: 'Amanda Cole', tier: 'Diehard', pts: 4200, isYou: false },
    { rank: 5, name: 'Brandon Kim', tier: 'Diehard', pts: 3950, isYou: false },
    { rank: 40, name: 'Krystal R.', tier: 'Insider', pts: 1610, isYou: false },
    { rank: 41, name: 'Jeff Locker', tier: 'Insider', pts: 1505, isYou: false },
    { rank: 42, name: 'Dyllan Haggard', tier: 'Insider', pts: 1425, isYou: true },
    { rank: 43, name: 'Mike R.', tier: 'Insider', pts: 1380, isYou: false },
    { rank: 44, name: 'Lauren P.', tier: 'Newcomer', pts: 1240, isYou: false },
  ];

  return (
    <div className="pt-4 px-5">
      <div className="flex items-center gap-2 mb-4">
        {['All-Time', 'This Season', 'This Month'].map((label, i) => (
          <button key={label} className="px-3 py-1.5" style={{ backgroundColor: i === 1 ? colors.teal : 'transparent', border: `1px solid ${i === 1 ? colors.teal : colors.rule}`, borderRadius: '2px', color: i === 1 ? '#000' : colors.inkMuted, fontFamily: '"Inter", sans-serif' }}>
            <span className="text-[10px] tracking-[0.18em] uppercase font-semibold">{label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        {board.slice(0, 3).map((p, i) => (
          <div key={p.rank} className="flex flex-col items-center text-center p-3" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.rule}`, borderRadius: '3px', borderTop: i === 0 ? `2px solid ${colors.teal}` : `1px solid ${colors.rule}` }}>
            <div className="w-10 h-10 rounded-full mb-2" style={{ background: i === 0 ? `linear-gradient(135deg, ${colors.teal}, ${colors.tealDeep})` : i === 1 ? `linear-gradient(135deg, ${colors.pink}, ${colors.pinkDeep})` : `linear-gradient(135deg, #555, #222)` }} />
            <div className="text-[10px] tracking-[0.15em] uppercase font-bold mb-0.5" style={{ color: i === 0 ? colors.teal : colors.inkMuted, fontFamily: '"Inter", sans-serif' }}>#{p.rank}</div>
            <div className="text-[12px] font-bold leading-tight mb-1 truncate w-full" style={{ fontFamily: '"Georgia", serif' }}>{p.name.split(' ')[0]}</div>
            <div className="text-[11px] font-bold" style={{ color: colors.ink, fontFamily: '"Georgia", serif' }}>{p.pts.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <div className="text-[10px] tracking-[0.28em] uppercase whitespace-nowrap font-semibold" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>Around You</div>
        <div style={{ flex: 1, height: '1px', backgroundColor: colors.rule }} />
      </div>

      <div className="pt-2">
        {board.slice(5).map((p, i, arr) => (
          <div key={p.rank} className="py-3 flex items-center gap-3" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${colors.rule}` : 'none', backgroundColor: p.isYou ? `${colors.teal}11` : 'transparent', marginInline: p.isYou ? '-12px' : 0, paddingInline: p.isYou ? '12px' : 0, borderLeft: p.isYou ? `2px solid ${colors.teal}` : 'none' }}>
            <div className="w-8 text-center text-[13px] font-bold" style={{ color: p.isYou ? colors.teal : colors.inkMuted, fontFamily: '"Georgia", serif' }}>{p.rank}</div>
            <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: `linear-gradient(135deg, ${colors.teal}55, ${colors.pink}33)` }} />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold leading-tight" style={{ fontFamily: '"Georgia", serif', color: p.isYou ? colors.teal : colors.ink }}>
                {p.name}{p.isYou && <span className="text-[10px] tracking-[0.15em] uppercase ml-2" style={{ color: colors.teal, fontFamily: '"Inter", sans-serif' }}>You</span>}
              </div>
              <div className="text-[10px] tracking-[0.15em] uppercase" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>{p.tier}</div>
            </div>
            <div className="text-[14px] font-bold" style={{ fontFamily: '"Georgia", serif' }}>{p.pts.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="pt-6 pb-4 text-center">
        <div className="text-[9px] tracking-[0.3em] uppercase" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>Updated nightly · 1,247 members</div>
      </div>
    </div>
  );
}

function LoyaltyAlbum({ colors }) {
  const games = [
    { date: 'OCT 18', opponent: 'Milwaukee Wave', result: 'W 8–3', photoCount: 12 },
    { date: 'OCT 4', opponent: 'Kansas City Comets', result: 'W 5–4', photoCount: 7 },
    { date: 'SEP 27', opponent: 'Empire Strykers', result: 'L 2–5', photoCount: 4 },
    { date: 'SEP 13', opponent: 'Baltimore Blast', result: 'W 6–5', photoCount: 9 },
  ];

  return (
    <div className="pt-4">
      <div className="px-5 mb-4">
        <div className="p-4 flex items-center justify-around" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.rule}`, borderRadius: '4px' }}>
          <div className="text-center">
            <div className="text-[24px] font-bold leading-none" style={{ fontFamily: '"Georgia", serif' }}>4</div>
            <div className="text-[9px] tracking-[0.2em] uppercase mt-1" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>Matches</div>
          </div>
          <div style={{ width: '1px', height: '32px', backgroundColor: colors.rule }} />
          <div className="text-center">
            <div className="text-[24px] font-bold leading-none" style={{ fontFamily: '"Georgia", serif' }}>32</div>
            <div className="text-[9px] tracking-[0.2em] uppercase mt-1" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>Photos</div>
          </div>
          <div style={{ width: '1px', height: '32px', backgroundColor: colors.rule }} />
          <div className="text-center">
            <div className="text-[24px] font-bold leading-none" style={{ color: colors.teal, fontFamily: '"Georgia", serif' }}>3W–1L</div>
            <div className="text-[9px] tracking-[0.2em] uppercase mt-1" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>Your Record</div>
          </div>
        </div>
      </div>

      <div className="px-5 mb-2">
        <div className="p-4 flex items-center gap-3" style={{ border: `1px dashed ${colors.teal}`, borderRadius: '4px' }}>
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.teal}22`, borderRadius: '50%' }}>
            <Camera size={18} color={colors.teal} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-bold leading-tight" style={{ fontFamily: '"Georgia", serif' }}>Going to the Sockers match?</div>
            <div className="text-[11px] tracking-[0.05em] mt-0.5" style={{ color: colors.inkMuted, fontFamily: '"Inter", sans-serif' }}>Check in to unlock the camera & earn 250 pts</div>
          </div>
        </div>
      </div>

      <SectionRule label="Your Match Album" colors={colors} />
      <div className="px-5 pt-3">
        {games.map((g, i) => (
          <div key={i} className="mb-3 overflow-hidden" style={{ border: `1px solid ${colors.rule}`, borderRadius: '4px', backgroundColor: colors.bgCard }}>
            <div className="grid grid-cols-3 gap-px" style={{ aspectRatio: '3/1.5', backgroundColor: colors.rule }}>
              {[0, 1, 2].map((j) => (
                <div key={j} className="relative" style={{ background: j === 0 ? `radial-gradient(ellipse at 30% 50%, ${colors.pink}55, transparent 60%), linear-gradient(135deg, #1a1a1a, #000)` : j === 1 ? `radial-gradient(ellipse at 50% 50%, ${colors.teal}55, transparent 60%), linear-gradient(135deg, #1a1a1a, #000)` : `radial-gradient(ellipse at 70% 30%, ${colors.pink}33, ${colors.teal}33, transparent 70%), linear-gradient(135deg, #1a1a1a, #000)` }}>
                  {j === 2 && g.photoCount > 3 && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#000000aa' }}>
                      <span className="text-[18px] font-bold" style={{ color: '#fff', fontFamily: '"Georgia", serif' }}>+{g.photoCount - 3}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] tracking-[0.2em] uppercase font-semibold mb-0.5" style={{ color: colors.teal, fontFamily: '"Inter", sans-serif' }}>{g.date}</div>
                <div className="text-[16px] font-bold leading-tight" style={{ fontFamily: '"Georgia", serif' }}>vs. <em style={{ color: colors.pink, fontStyle: 'italic' }}>{g.opponent.split(' ').slice(-1)}</em></div>
                <div className="text-[11px] mt-0.5 tracking-[0.05em]" style={{ color: colors.inkMuted, fontFamily: '"Inter", sans-serif' }}>{g.result} · {g.photoCount} photos</div>
              </div>
              <ChevronRight size={20} color={colors.inkMuted} />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 pb-4 text-center">
        <div className="text-[9px] tracking-[0.3em] uppercase" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>Member since · Sep 2025</div>
      </div>
    </div>
  );
}

function PlayerProfile({ player, colors, isDark, setTheme, onBack }) {
  const isGK = player.pos === 'GK';
  return (
    <>
      <div className="h-8" />
      <div className="px-5 pt-2 pb-3 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 hover:opacity-70" style={{ color: colors.ink }}>
          <ChevronLeft size={18} strokeWidth={2} />
          <span className="text-[11px] tracking-[0.18em] uppercase font-semibold" style={{ fontFamily: '"Inter", sans-serif' }}>Roster</span>
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="p-1.5 rounded-full hover:opacity-70" style={{ color: colors.ink }}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
      <div style={{ height: '1px', backgroundColor: colors.rule, marginInline: '20px' }} />

      <div className="overflow-y-auto pb-32" style={{ height: 'calc(100% - 100px)' }}>
        {/* Hero photo area */}
        <div className="relative mx-5 mt-4 overflow-hidden" style={{ borderRadius: '4px', aspectRatio: '4/5', backgroundColor: '#000' }}>
          {player.photo ? (
            <img src={player.photo} alt={player.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
          ) : (
            <>
              <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 30%, ${colors.teal}66 0%, transparent 55%), radial-gradient(ellipse at 50% 90%, ${colors.pink}33 0%, transparent 60%), linear-gradient(180deg, #1a1a1a 0%, #000 100%)` }} />
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)` }} />
            </>
          )}

          {/* Massive jersey number */}
          <div className="absolute top-4 right-4 leading-none" style={{ fontSize: '160px', fontFamily: '"Georgia", serif', fontWeight: 700, color: player.photo ? '#ffffff20' : '#ffffff10', letterSpacing: '-0.05em', textShadow: player.photo ? '0 4px 16px rgba(0,0,0,0.6)' : 'none' }}>{player.num}</div>

          {/* Tag if any */}
          {player.tag && (
            <div className="absolute top-4 left-4">
              <div className="px-2 py-1" style={{ backgroundColor: colors.pink, borderRadius: '2px' }}>
                <span className="text-[9px] tracking-[0.2em] uppercase font-bold" style={{ color: '#fff', fontFamily: '"Inter", sans-serif' }}>{player.tag}</span>
              </div>
            </div>
          )}

          {/* Bottom gradient + name */}
          <div className="absolute inset-x-0 bottom-0" style={{ height: '60%', background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.95) 80%)' }} />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="text-[10px] tracking-[0.25em] uppercase font-semibold mb-2" style={{ color: colors.teal, fontFamily: '"Inter", sans-serif' }}>
              #{player.num} · {player.pos === 'F' ? 'Forward' : player.pos === 'M' ? 'Midfielder' : player.pos === 'D' ? 'Defender' : 'Goalkeeper'}
            </div>
            <h1 className="font-bold leading-[0.92]" style={{ fontSize: '44px', letterSpacing: '-0.025em', color: '#fff', fontFamily: '"Georgia", serif' }}>
              {player.name.split(' ')[0]}{' '}<em style={{ color: colors.pink, fontStyle: 'italic' }}>{player.name.split(' ').slice(1).join(' ')}</em>
            </h1>
            <div className="flex items-center gap-2 mt-3">
              <MapPin size={12} color={colors.teal} strokeWidth={2.5} />
              <span className="text-[12px]" style={{ color: '#ffffffcc', fontFamily: '"Inter", sans-serif' }}>{player.hometown}</span>
            </div>
          </div>
        </div>

        {/* Quick info strip — Height, Weight, Age */}
        <div className="px-5 mt-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.rule}`, borderRadius: '3px' }}>
              <div className="text-[9px] tracking-[0.2em] uppercase mb-1 font-semibold" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>Height</div>
              <div className="text-[16px] font-bold leading-none" style={{ fontFamily: '"Georgia", serif' }}>{player.height || '—'}</div>
            </div>
            <div className="p-3" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.rule}`, borderRadius: '3px' }}>
              <div className="text-[9px] tracking-[0.2em] uppercase mb-1 font-semibold" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>Weight</div>
              <div className="text-[14px] font-bold leading-none" style={{ fontFamily: '"Georgia", serif' }}>{player.weight || '—'}</div>
            </div>
            <div className="p-3" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.rule}`, borderRadius: '3px' }}>
              <div className="text-[9px] tracking-[0.2em] uppercase mb-1 font-semibold" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>Age</div>
              <div className="text-[16px] font-bold leading-none" style={{ fontFamily: '"Georgia", serif' }}>{player.age ?? '—'}</div>
            </div>
          </div>
        </div>

        {/* Pronunciation guide — a nice, distinctive detail that fans will love */}
        {player.pronunciation && (
          <>
            <SectionRule label="01 · Say It Right" colors={colors} />
            <div className="px-5 pt-3">
              <div className="text-[10px] tracking-[0.22em] uppercase font-semibold mb-2" style={{ color: colors.teal, fontFamily: '"Inter", sans-serif' }}>Pronunciation</div>
              <div className="text-[18px] italic" style={{ color: colors.ink, fontFamily: '"Georgia", serif' }}>{player.pronunciation}</div>
              {player.birthdate && (
                <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${colors.rule}` }}>
                  <span className="text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>Born</span>
                  <span style={{ color: colors.inkSubtle }}>·</span>
                  <span className="text-[12px]" style={{ color: colors.ink, fontFamily: '"Inter", sans-serif' }}>{player.birthdate}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Bio — only render if present */}
        {player.bio && (
          <>
            <SectionRule label={player.pronunciation ? '02 · Bio' : '01 · Bio'} colors={colors} />
            <div className="px-5 pt-3">
              <p className="text-[15px] italic leading-relaxed" style={{ color: colors.ink, fontFamily: '"Georgia", serif' }}>{player.bio}</p>
              {player.college && (
                <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${colors.rule}` }}>
                  <span className="text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>College</span>
                  <span style={{ color: colors.inkSubtle }}>·</span>
                  <span className="text-[12px]" style={{ color: colors.ink, fontFamily: '"Inter", sans-serif' }}>{player.college}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Season stats — only render if present */}
        {player.stats && (
          <>
            <SectionRule label={`${player.pronunciation ? '03' : '02'} · 2025–26 Season`} colors={colors} />
            <div className="px-5 pt-3">
              {isGK ? (
                <div className="grid grid-cols-4 gap-2">
                  <StatBlock label="GP" value={player.stats.gp} colors={colors} />
                  <StatBlock label="W–L" value={`${player.stats.w}–${player.stats.l}`} colors={colors} accent={colors.teal} />
                  <StatBlock label="Saves" value={player.stats.sv} colors={colors} />
                  <StatBlock label="GAA" value={player.stats.gaa} colors={colors} accent={colors.pink} />
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  <StatBlock label="GP" value={player.stats.gp} colors={colors} />
                  <StatBlock label="G" value={player.stats.g} colors={colors} accent={colors.teal} />
                  <StatBlock label="A" value={player.stats.a} colors={colors} />
                  <StatBlock label="Pts" value={player.stats.pts} colors={colors} accent={colors.pink} />
                  <StatBlock label="Sh" value={player.stats.sh} colors={colors} />
                </div>
              )}
            </div>
          </>
        )}

        {/* Social link */}
        <div className="px-5 pt-6">
          <button className="w-full py-3 flex items-center justify-between px-5" style={{ border: `1px solid ${colors.rule}`, borderRadius: '3px' }}>
            <span className="text-[11px] tracking-[0.2em] uppercase font-semibold" style={{ color: colors.ink, fontFamily: '"Inter", sans-serif' }}>View on @stlouisambush</span>
            <ArrowUpRight size={14} color={colors.pink} strokeWidth={2.5} />
          </button>
        </div>

        <div className="pt-6 pb-4 text-center">
          <div className="text-[9px] tracking-[0.3em] uppercase" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>St. Louis Ambush · 2025–26</div>
        </div>
      </div>
    </>
  );
}

function StatBlock({ label, value, accent, colors }) {
  return (
    <div className="p-2 text-center" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.rule}`, borderRadius: '3px' }}>
      <div className="text-[9px] tracking-[0.18em] uppercase mb-1 font-semibold" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>{label}</div>
      <div className="text-[18px] font-bold leading-none" style={{ color: accent || colors.ink, fontFamily: '"Georgia", serif' }}>{value}</div>
    </div>
  );
}

function TicketsTab({ colors, isDark, setTheme }) {
  // Derive next 4 upcoming home games from the real schedule
  const now = new Date();
  const upcomingHomeGames = (scheduleData.games || [])
    .filter((g) => g.isHome && (g.status === 'upcoming' || new Date(g.date) >= now))
    .slice(0, 4)
    .map((g) => ({
      date: g.dateLabel,
      day: g.day,
      month: g.monthLabel,
      time: g.time,
      opponent: g.opponent,
      promo: g.promo,
    }));

  const groupOptions = [
    { name: 'Birthday Package', desc: 'Marquee experience for kids — group seats, on-court recognition, party room access.', icon: Gift },
    { name: 'High-Five Line', desc: 'Kids line the tunnel and high-five players as they take the floor.', icon: Users },
    { name: 'Walk of Champions', desc: 'Walk onto the field with the team during introductions.', icon: Award },
    { name: 'Benchwarmers Group', desc: 'Discounted group tickets for parties of 10 or more.', icon: Ticket },
  ];

  return (
    <>
      <TopBar colors={colors} isDark={isDark} setTheme={setTheme} />
      <div style={{ height: '1px', backgroundColor: colors.rule, marginInline: '20px' }} />

      <div className="overflow-y-auto pb-32" style={{ height: 'calc(100% - 100px)' }}>
        {/* Hero — next home game */}
        <div className="relative mx-5 mt-4 overflow-hidden" style={{ borderRadius: '4px', aspectRatio: '16/10', backgroundColor: '#000' }}>
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 50%, ${colors.pink}55 0%, transparent 55%), radial-gradient(ellipse at 70% 40%, ${colors.teal}66 0%, transparent 60%), linear-gradient(180deg, #1a1a1a 0%, #000 100%)` }} />
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)` }} />
          <div className="absolute inset-0 p-5 flex flex-col justify-between">
            <div>
              <div className="px-2 py-1 inline-flex items-center gap-1.5" style={{ backgroundColor: colors.teal, borderRadius: '2px' }}>
                <Ticket size={10} color="#000" strokeWidth={2.5} />
                <span className="text-[9px] tracking-[0.2em] uppercase font-bold" style={{ color: '#000', fontFamily: '"Inter", sans-serif' }}>On Sale Now</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] tracking-[0.25em] uppercase font-semibold mb-2" style={{ color: colors.teal, fontFamily: '"Inter", sans-serif' }}>Sat · Nov 15 · 7:05 PM</div>
              <h1 className="font-bold leading-[0.95]" style={{ fontSize: '36px', letterSpacing: '-0.025em', color: '#fff', fontFamily: '"Georgia", serif' }}>vs. <em style={{ color: colors.pink, fontStyle: 'italic' }}>Sockers</em></h1>
            </div>
          </div>
        </div>

        <div className="px-5 mt-3">
          <button className="w-full py-4 flex items-center justify-between px-5 transition-transform active:scale-[0.98]" style={{ backgroundColor: colors.teal, color: '#0a0a0a', borderRadius: '4px' }}>
            <div className="flex items-center gap-2">
              <Ticket size={16} strokeWidth={2.5} />
              <span className="text-[13px] tracking-[0.18em] uppercase font-bold" style={{ fontFamily: '"Inter", sans-serif' }}>Buy on Ticketmaster</span>
            </div>
            <ArrowUpRight size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* All upcoming home games */}
        <SectionRule label="01 · Upcoming Home Matches" colors={colors} />
        <div className="px-5 pt-3">
          {upcomingHomeGames.map((g, i) => (
            <div key={i} className="py-3 flex items-center gap-4" style={{ borderBottom: i < upcomingHomeGames.length - 1 ? `1px solid ${colors.rule}` : 'none' }}>
              <div className="flex-shrink-0 text-center" style={{ width: '48px' }}>
                <div className="text-[9px] tracking-[0.2em] uppercase font-semibold" style={{ color: colors.teal, fontFamily: '"Inter", sans-serif' }}>{g.day}</div>
                <div className="text-[22px] font-bold leading-none my-0.5" style={{ fontFamily: '"Georgia", serif' }}>{g.date}</div>
                <div className="text-[9px] tracking-[0.15em] uppercase" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>{g.month}</div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-bold leading-tight" style={{ fontFamily: '"Georgia", serif' }}>vs. <em style={{ color: colors.pink, fontStyle: 'italic' }}>{g.opponent.split(' ').slice(-1)}</em></h3>
                <div className="text-[10px] tracking-[0.05em] mt-0.5" style={{ color: colors.inkMuted, fontFamily: '"Inter", sans-serif' }}>{g.time} · Family Arena</div>
                {g.promo && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div style={{ width: '4px', height: '4px', backgroundColor: colors.pink, borderRadius: '50%' }} />
                    <span className="text-[10px] italic" style={{ color: colors.inkMuted }}>{g.promo}</span>
                  </div>
                )}
              </div>
              <button className="flex-shrink-0 px-3 py-1.5 flex items-center gap-1" style={{ backgroundColor: colors.teal, color: '#000', borderRadius: '2px', fontFamily: '"Inter", sans-serif' }}>
                <span className="text-[10px] tracking-[0.18em] uppercase font-bold">Buy</span>
                <ArrowUpRight size={11} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>

        {/* Season tickets */}
        <SectionRule label="02 · Season Tickets" colors={colors} />
        <div className="px-5 pt-3">
          <div className="relative overflow-hidden p-5" style={{ borderRadius: '4px', background: `linear-gradient(135deg, ${colors.teal} 0%, ${colors.tealDeep} 60%, #000 130%)` }}>
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)` }} />
            <div className="relative">
              <div className="text-[10px] tracking-[0.25em] uppercase font-semibold mb-2" style={{ color: '#000000cc', fontFamily: '"Inter", sans-serif' }}>2025–26 Season Pass</div>
              <h3 className="text-[26px] font-bold leading-tight mb-3" style={{ color: '#000', fontFamily: '"Georgia", serif', letterSpacing: '-0.02em' }}>Every Match. <em style={{ fontStyle: 'italic' }}>Yours.</em></h3>
              <p className="text-[13px] italic mb-4 leading-snug" style={{ color: '#000000cc' }}>All 12 home matches at Family Arena. Reserved seating, presale access, and exclusive holder events.</p>
              <button className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: '#000', borderRadius: '2px' }}>
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold" style={{ color: '#fff', fontFamily: '"Inter", sans-serif' }}>Learn More</span>
                <ArrowUpRight size={11} color="#fff" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Group experiences */}
        <SectionRule label="03 · Group Experiences" colors={colors} />
        <div className="px-5 pt-3">
          {groupOptions.map((g, i) => {
            const Icon = g.icon;
            return (
              <div key={i} className="py-4 flex items-start gap-3" style={{ borderBottom: i < groupOptions.length - 1 ? `1px solid ${colors.rule}` : 'none' }}>
                <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center" style={{ border: `1px solid ${colors.rule}`, borderRadius: '50%', color: colors.teal }}>
                  <Icon size={15} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[15px] font-bold leading-tight mb-1" style={{ fontFamily: '"Georgia", serif' }}>{g.name}</h4>
                  <p className="text-[12px] italic leading-snug" style={{ color: colors.inkMuted }}>{g.desc}</p>
                </div>
                <ChevronRight size={16} color={colors.inkSubtle} className="flex-shrink-0 mt-2" />
              </div>
            );
          })}
        </div>

        {/* Special rates / box office */}
        <SectionRule label="04 · Box Office" colors={colors} />
        <div className="px-5 pt-3">
          <p className="text-[13px] italic leading-snug mb-4" style={{ color: colors.inkMuted, fontFamily: '"Georgia", serif' }}>For special pricing, USL2 (FC Ambush) tickets, group quotes, or anything that needs a human — contact the box office directly.</p>
          <div className="grid grid-cols-2 gap-2">
            <button className="py-3 flex items-center justify-center gap-2" style={{ border: `1px solid ${colors.teal}`, borderRadius: '3px' }}>
              <Phone size={13} color={colors.teal} strokeWidth={2.5} />
              <span className="text-[11px] tracking-[0.18em] uppercase font-bold" style={{ color: colors.teal, fontFamily: '"Inter", sans-serif' }}>Call</span>
            </button>
            <button className="py-3 flex items-center justify-center gap-2" style={{ border: `1px solid ${colors.pink}`, borderRadius: '3px' }}>
              <Mail size={13} color={colors.pink} strokeWidth={2.5} />
              <span className="text-[11px] tracking-[0.18em] uppercase font-bold" style={{ color: colors.pink, fontFamily: '"Inter", sans-serif' }}>Email</span>
            </button>
          </div>
        </div>

        {/* Family Arena info */}
        <SectionRule label="05 · The Family Arena" colors={colors} />
        <div className="px-5 pt-3 pb-4">
          <div className="p-4" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.rule}`, borderRadius: '3px' }}>
            <div className="flex items-start gap-3">
              <MapPin size={16} color={colors.teal} strokeWidth={2} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[14px] font-bold leading-tight" style={{ fontFamily: '"Georgia", serif' }}>Family Arena</div>
                <div className="text-[12px] mt-0.5" style={{ color: colors.inkMuted, fontFamily: '"Inter", sans-serif' }}>2002 Arena Pkwy, St. Charles, MO 63303</div>
                <button className="mt-2 text-[10px] tracking-[0.2em] uppercase font-semibold flex items-center gap-1" style={{ color: colors.teal, fontFamily: '"Inter", sans-serif' }}>
                  Get Directions
                  <ArrowUpRight size={11} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 pb-4 text-center">
          <div className="text-[9px] tracking-[0.3em] uppercase" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>St. Charles, Missouri</div>
        </div>
      </div>
    </>
  );
}

function PlaceholderTab({ title, colors, isDark, setTheme }) {
  return (
    <>
      <TopBar colors={colors} isDark={isDark} setTheme={setTheme} />
      <div style={{ height: '1px', backgroundColor: colors.rule, marginInline: '20px' }} />
      <div className="flex flex-col items-center justify-center" style={{ height: 'calc(100% - 200px)' }}>
        <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: colors.inkSubtle, fontFamily: '"Inter", sans-serif' }}>Coming Next</div>
        <div className="text-[36px] font-bold" style={{ fontFamily: '"Georgia", serif', letterSpacing: '-0.02em' }}>{title}</div>
      </div>
    </>
  );
}
