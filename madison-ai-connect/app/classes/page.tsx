'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Cursor from '@/components/Cursor';

const DitherBg = dynamic(() => import('@/components/DitherBg'), { ssr: false });

const CLASSES = [
  {
    code: 'CS 577',
    name: 'Introduction to Algorithms',
    time: 'MWF 9:55–10:45am',
    room: '1221 CS Building',
    students: [
      { name: 'Tyler S.',   match: 73, year: 'Junior',   interests: ['Chess', 'Startups', 'Philosophy', 'Coffee'],            avatar: '◈', note: 'Been asking Claude about startup equity structures' },
      { name: 'Maya K.',    match: 68, year: 'Senior',   interests: ['Machine Learning', 'Coffee', 'Long-form Writing'],       avatar: '◇', note: 'Writing a thesis on LLM interpretability' },
      { name: 'James L.',   match: 54, year: 'Junior',   interests: ['Systems', 'Game Design', 'Coffee', 'Open Source'],      avatar: '△', note: 'Built a chess engine last semester' },
      { name: 'Priya R.',   match: 49, year: 'Graduate', interests: ['ML', 'Philosophy', 'Music', 'Stoicism'],                avatar: '○', note: 'PhD student studying AI alignment' },
      { name: 'Carlos M.',  match: 44, year: 'Sophomore',interests: ['Competitive Programming', 'Gaming', 'Anime'],           avatar: '⬡', note: 'Top 100 on LeetCode' },
      { name: 'Lily Z.',    match: 38, year: 'Junior',   interests: ['UX Design', 'Coffee', 'Psychology'],                   avatar: '◁', note: 'Working on a mental health app' },
      { name: 'Marcus T.',  match: 33, year: 'Senior',   interests: ['Distributed Systems', 'Hiking', 'Photography'],        avatar: '▷', note: 'Had a Google internship last summer' },
    ],
  },
  {
    code: 'CS 540',
    name: 'Introduction to AI',
    time: 'TR 11:00am–12:15pm',
    room: '1240 Engineering Hall',
    students: [
      { name: 'Alex W.',    match: 81, year: 'Senior',   interests: ['Machine Learning', 'Philosophy', 'Startups', 'Chess'],  avatar: '◈', note: 'Founded an AI reading club on campus' },
      { name: 'Sarah M.',   match: 62, year: 'Junior',   interests: ['AI Ethics', 'Long-form Writing', 'Coffee', 'Policy'],  avatar: '◇', note: 'Interned at a DC policy think-tank' },
      { name: 'Jordan P.',  match: 58, year: 'Graduate', interests: ['NLP', 'Startups', 'Stoicism', 'Running'],              avatar: '◎', note: 'Building a semantic search startup' },
      { name: 'Aisha N.',   match: 55, year: 'Junior',   interests: ['Computer Vision', 'Art', 'Philosophy'],                avatar: '△', note: 'Does generative art commissions' },
      { name: 'Ryan H.',    match: 51, year: 'Sophomore',interests: ['Robotics', 'Chess', 'Coffee', 'Sci-Fi'],               avatar: '○', note: 'Member of the Wisconsin Robotics Team' },
      { name: 'David C.',   match: 45, year: 'Senior',   interests: ['Game Design', 'Music Production', 'Systems'],          avatar: '⬡', note: 'Released an indie game on Steam' },
      { name: 'Fatima S.',  match: 41, year: 'Junior',   interests: ['Bioinformatics', 'Hiking', 'Music'],                   avatar: '◁', note: 'Combining CS with her biology major' },
      { name: 'Owen K.',    match: 36, year: 'Sophomore',interests: ['Cybersecurity', 'CTF Competitions', 'Coffee'],         avatar: '▷', note: 'Placed 3rd at a recent hackathon' },
    ],
  },
  {
    code: 'PHIL 341',
    name: 'Contemporary Moral Issues',
    time: 'TR 2:30–3:45pm',
    room: '206 Bascom Hall',
    students: [
      { name: 'Emma T.',    match: 71, year: 'Senior',   interests: ['Philosophy', 'Long-form Writing', 'Coffee', 'Stoicism'], avatar: '◈', note: 'Writing her senior thesis on Parfit' },
      { name: 'Noah B.',    match: 58, year: 'Junior',   interests: ['Philosophy', 'Chess', 'Music', 'Startups'],             avatar: '◇', note: 'Runs a philosophy podcast' },
      { name: 'Chloe A.',   match: 53, year: 'Graduate', interests: ['Ethics', 'AI Policy', 'Climbing', 'Coffee'],           avatar: '◎', note: 'Law school next year' },
      { name: 'Liam W.',    match: 47, year: 'Junior',   interests: ['Political Philosophy', 'Chess', 'Journalism'],         avatar: '△', note: 'Writes for the Badger Herald' },
      { name: 'Zoe R.',     match: 42, year: 'Sophomore',interests: ['Environmental Ethics', 'Hiking', 'Photography'],       avatar: '○', note: 'Leads the sustainability coalition' },
      { name: 'Marcus D.',  match: 36, year: 'Senior',   interests: ['Existentialism', 'Film', 'Writing'],                  avatar: '⬡', note: 'Screens Tarkovsky films on weekends' },
    ],
  },
  {
    code: 'MATH 521',
    name: 'Analysis I',
    time: 'MWF 1:20–2:10pm',
    room: 'B239 Van Vleck',
    students: [
      { name: 'Isabelle C.',match: 66, year: 'Junior',   interests: ['Pure Math', 'Chess', 'Philosophy', 'Coffee'],          avatar: '◈', note: 'Wants to do a PhD in topology' },
      { name: 'Ethan L.',   match: 61, year: 'Senior',   interests: ['Quant Finance', 'Startups', 'Stoicism', 'Running'],    avatar: '◇', note: 'Has a return offer from a Chicago prop shop' },
      { name: 'Nina P.',    match: 55, year: 'Junior',   interests: ['Statistics', 'Machine Learning', 'Baking'],            avatar: '◎', note: 'Double majoring with Data Science' },
      { name: 'Sam O.',     match: 48, year: 'Graduate', interests: ['Number Theory', 'Chess Openings', 'Jazz'],             avatar: '△', note: 'Plays piano at the Terrace on weekends' },
      { name: 'Ravi M.',    match: 43, year: 'Sophomore',interests: ['Competitive Math', 'Programming', 'Gaming'],           avatar: '○', note: 'Competed in Putnam last year' },
      { name: 'Tessa B.',   match: 39, year: 'Junior',   interests: ['Probability', 'Rock Climbing', 'Photography'],        avatar: '⬡', note: 'Boulders at the Shell 4 days a week' },
      { name: 'Felix G.',   match: 34, year: 'Senior',   interests: ['Applied Math', 'Cycling', 'Board Games'],             avatar: '◁', note: 'Bikes from Middleton every day' },
    ],
  },
  {
    code: 'CS 544',
    name: 'Introduction to Big Data Systems',
    time: 'TR 9:30–10:45am',
    room: '1221 CS Building',
    students: [
      { name: 'Kai T.',     match: 76, year: 'Graduate', interests: ['Distributed Systems', 'Startups', 'Coffee', 'Chess'],  avatar: '◈', note: 'Worked at Databricks last summer' },
      { name: 'Mia L.',     match: 64, year: 'Senior',   interests: ['Data Engineering', 'Machine Learning', 'Hiking'],     avatar: '◇', note: 'Built a Spotify listening analytics project' },
      { name: 'Brandon S.', match: 57, year: 'Junior',   interests: ['Cloud Computing', 'Startups', 'Coffee', 'Basketball'],avatar: '◎', note: 'Interned at AWS last summer' },
      { name: 'Grace Y.',   match: 52, year: 'Senior',   interests: ['Systems Design', 'Philosophy', 'Running'],            avatar: '△', note: 'Reading "Designing Data-Intensive Apps" for fun' },
      { name: 'Derek N.',   match: 46, year: 'Junior',   interests: ['DevOps', 'Gaming', 'Music Production'],               avatar: '○', note: 'Has a self-hosted homelab setup' },
      { name: 'Ananya V.',  match: 40, year: 'Graduate', interests: ['Streaming Systems', 'Dance', 'Coffee'],               avatar: '⬡', note: 'PhD student in systems research' },
    ],
  },
];

export default function ClassesPage() {
  const [name, setName] = useState('You');
  const [visible, setVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(0);

  useEffect(() => {
    setName(localStorage.getItem('mac_name') || 'You');
    setTimeout(() => setVisible(true), 100);
  }, []);

  const cls = CLASSES[selectedClass];

  const sorted = [...cls.students].sort((a, b) => b.match - a.match);
  const topMatch = sorted[0];

  return (
    <div style={{ minHeight:'100vh', position:'relative', fontFamily:"'DM Sans',sans-serif", color:'#fff', cursor:'none' }}>
      <Cursor />

      {/* Dither background */}
      <div style={{ position:'fixed', inset:0, zIndex:0 }}><DitherBg /></div>
      <div style={{ position:'fixed', inset:0, zIndex:1, background:'rgba(4,6,18,0.72)' }} />

      {/* Nav */}
      <div style={{ position:'sticky', top:0, zIndex:50, padding:'18px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(4,6,18,0.82)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(91,143,255,.10)' }}>
        <a href="/mindmap" style={{ fontSize:13, color:'rgba(150,190,255,.55)', textDecoration:'none' }}>← Your map</a>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:20,height:20,borderRadius:'50%',background:'linear-gradient(135deg,#5B8FFF,#9B5BFF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9 }}>◈</div>
          <span style={{ fontFamily:"'Playfair Display',serif",fontSize:14,color:'rgba(255,255,255,.65)' }}>Madison <em style={{fontStyle:'italic',color:'#5B8FFF'}}>AI Connect</em></span>
        </div>
        <div style={{ fontSize:13, color:'rgba(150,190,255,.45)' }}>Your Classes</div>
      </div>

      <div style={{ position:'relative', zIndex:2, maxWidth:960, margin:'0 auto', padding:'48px 32px 80px', opacity:visible?1:0, transition:'opacity .8s ease' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:10, letterSpacing:'.20em', textTransform:'uppercase', color:'var(--blue)', marginBottom:14 }}>Your classes</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,4vw,44px)', fontWeight:500, lineHeight:1.1, marginBottom:14 }}>
            Find your people <em style={{ fontStyle:'italic', color:'#5B8FFF' }}>in class</em>
          </h1>
          <p style={{ fontSize:15, fontWeight:300, color:'rgba(180,200,255,.50)', maxWidth:480, margin:'0 auto' }}>
            Claude analyzed everyone&apos;s AI memory to surface the real intellectual overlaps — not just who sits near you.
          </p>
        </div>

        {/* Class tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:32, justifyContent:'center', flexWrap:'wrap' }}>
          {CLASSES.map((c, i) => (
            <button
              key={c.code}
              onClick={() => setSelectedClass(i)}
              style={{
                padding:'9px 18px', borderRadius:100,
                background: i === selectedClass ? 'rgba(91,143,255,.22)' : 'rgba(91,143,255,.06)',
                border: `1px solid ${i === selectedClass ? 'rgba(91,143,255,.50)' : 'rgba(91,143,255,.14)'}`,
                color: i === selectedClass ? 'rgba(220,235,255,.95)' : 'rgba(150,190,255,.50)',
                fontSize:12, fontWeight: i === selectedClass ? 500 : 400,
                cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
                transition:'all .2s',
                boxShadow: i === selectedClass ? '0 0 16px rgba(91,143,255,.18)' : 'none',
              }}
            >
              {c.code}
              <span style={{ marginLeft:6, fontSize:10, opacity:0.55 }}>· {c.students.length}</span>
            </button>
          ))}
        </div>

        {/* Class header card */}
        <div style={{ marginBottom:24, padding:'22px 28px', borderRadius:16, background:'rgba(6,10,26,.72)', border:'1px solid rgba(91,143,255,.14)', backdropFilter:'blur(20px)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontSize:19, fontFamily:"'Playfair Display',serif", fontWeight:500, color:'rgba(255,255,255,.92)' }}>{cls.code}: {cls.name}</div>
            <div style={{ fontSize:12, color:'rgba(150,190,255,.45)', marginTop:5, display:'flex', gap:16 }}>
              <span>🕐 {cls.time}</span>
              <span>📍 {cls.room}</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:20 }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:500, color:'var(--blue)' }}>{cls.students.length}</div>
              <div style={{ fontSize:10, color:'rgba(150,190,255,.45)', letterSpacing:'.06em' }}>on platform</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:500, color:'#9B5BFF' }}>{topMatch.match}%</div>
              <div style={{ fontSize:10, color:'rgba(150,190,255,.45)', letterSpacing:'.06em' }}>top match</div>
            </div>
          </div>
        </div>

        {/* Student cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {sorted.map((student, idx) => {
            const matchColor = student.match >= 70 ? '#5B8FFF' : student.match >= 55 ? '#9B5BFF' : 'rgba(150,190,255,.55)';
            return (
              <div
                key={student.name}
                style={{
                  padding:'20px 24px', borderRadius:16,
                  background:'rgba(6,10,26,.72)',
                  border:`1px solid ${idx === 0 ? 'rgba(91,143,255,.30)' : 'rgba(91,143,255,.10)'}`,
                  backdropFilter:'blur(20px)',
                  display:'flex', alignItems:'center', gap:18,
                  transition:'border-color .2s, background .2s',
                  boxShadow: idx === 0 ? '0 0 24px rgba(91,143,255,.08)' : 'none',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(91,143,255,.38)'; (e.currentTarget as HTMLElement).style.background = 'rgba(10,14,34,.82)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = idx === 0 ? 'rgba(91,143,255,.30)' : 'rgba(91,143,255,.10)'; (e.currentTarget as HTMLElement).style.background = 'rgba(6,10,26,.72)'; }}
              >
                {/* Rank */}
                <div style={{ fontSize:11, color:'rgba(150,190,255,.30)', width:18, textAlign:'center', flexShrink:0, fontFamily:"'DM Sans',sans-serif" }}>
                  {idx + 1}
                </div>

                {/* Avatar */}
                <div style={{
                  width:44, height:44, borderRadius:'50%',
                  background:`linear-gradient(135deg, ${matchColor}22, ${matchColor}0a)`,
                  border:`1px solid ${matchColor}44`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:16, color: matchColor,
                  flexShrink:0,
                  boxShadow: idx === 0 ? `0 0 16px ${matchColor}28` : 'none',
                }}>
                  {student.avatar}
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                    <span style={{ fontSize:15, fontWeight:500, color:'rgba(255,255,255,.90)' }}>{student.name}</span>
                    <span style={{ fontSize:10, color:'rgba(150,190,255,.38)', padding:'2px 8px', borderRadius:6, background:'rgba(91,143,255,.06)', border:'1px solid rgba(91,143,255,.10)' }}>
                      {student.year}
                    </span>
                    {idx === 0 && (
                      <span style={{ fontSize:10, color:'#5BFFE8', padding:'2px 8px', borderRadius:6, background:'rgba(91,255,232,.08)', border:'1px solid rgba(91,255,232,.18)', letterSpacing:'.06em' }}>
                        top match
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize:12, color:'rgba(150,190,255,.42)', marginBottom:7, fontStyle:'italic' }}>
                    &ldquo;{student.note}&rdquo;
                  </div>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                    {student.interests.map(interest => (
                      <span key={interest} style={{
                        padding:'2px 9px', borderRadius:100,
                        background:'rgba(91,143,255,.07)', border:'1px solid rgba(91,143,255,.15)',
                        fontSize:11, color:'rgba(160,195,255,.60)',
                      }}>
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Match score */}
                <div style={{ textAlign:'center', flexShrink:0, minWidth:56 }}>
                  <div style={{
                    fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:500,
                    color: matchColor, lineHeight:1,
                  }}>
                    {student.match}%
                  </div>
                  <div style={{ fontSize:9, color:'rgba(150,190,255,.40)', marginTop:3, letterSpacing:'.06em' }}>match</div>
                </div>

                {/* Connect button */}
                <a href="/connect" style={{
                  padding:'9px 18px', borderRadius:100,
                  background: idx === 0 ? 'rgba(91,143,255,.18)' : 'rgba(91,143,255,.08)',
                  border:`1px solid ${idx === 0 ? 'rgba(91,143,255,.40)' : 'rgba(91,143,255,.18)'}`,
                  color:'rgba(200,220,255,.80)', fontSize:12, fontWeight:500,
                  textDecoration:'none', flexShrink:0,
                  transition:'all .2s', whiteSpace:'nowrap',
                }}>
                  View map →
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
