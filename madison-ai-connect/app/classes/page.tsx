'use client';
import { useEffect, useState } from 'react';
import Cursor from '@/components/Cursor';

const CLASSES = [
  {
    code: 'CS 577',
    name: 'Introduction to Algorithms',
    students: [
      { name: 'Tyler S.', match: 73, interests: ['Chess', 'Startups', 'Philosophy', 'Coffee'], avatar: '◈' },
      { name: 'Maya K.', match: 68, interests: ['Machine Learning', 'Coffee', 'Writing'], avatar: '◇' },
      { name: 'James L.', match: 54, interests: ['Systems', 'Gaming', 'Coffee'], avatar: '△' },
      { name: 'Priya R.', match: 49, interests: ['ML', 'Philosophy', 'Music'], avatar: '○' },
    ],
  },
  {
    code: 'CS 540',
    name: 'Introduction to AI',
    students: [
      { name: 'Alex W.', match: 81, interests: ['Machine Learning', 'Philosophy', 'Startups', 'Chess'], avatar: '◈' },
      { name: 'Sarah M.', match: 62, interests: ['AI Ethics', 'Writing', 'Coffee'], avatar: '◇' },
      { name: 'David C.', match: 45, interests: ['Gaming', 'Music', 'Systems'], avatar: '△' },
    ],
  },
  {
    code: 'PHIL 341',
    name: 'Contemporary Moral Issues',
    students: [
      { name: 'Emma T.', match: 71, interests: ['Philosophy', 'Writing', 'Coffee', 'Stoicism'], avatar: '◈' },
      { name: 'Noah B.', match: 58, interests: ['Philosophy', 'Chess', 'Music'], avatar: '◇' },
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 30%, rgba(91,143,255,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(155,91,255,0.06) 0%, transparent 50%), linear-gradient(180deg,#060A1A 0%,#07101F 100%)',
      fontFamily: "'DM Sans', sans-serif",
      color: '#fff',
      cursor: 'none',
    }}>
      <Cursor />

      {/* Nav */}
      <div style={{ position:'sticky', top:0, zIndex:50, padding:'18px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(6,10,26,.90)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(91,143,255,.10)' }}>
        <a href="/mindmap" style={{ fontSize:13, color:'rgba(150,190,255,.55)', textDecoration:'none' }}>← Your map</a>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:20,height:20,borderRadius:'50%',background:'linear-gradient(135deg,#5B8FFF,#9B5BFF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9 }}>◈</div>
          <span style={{ fontFamily:"'Playfair Display',serif",fontSize:14,color:'rgba(255,255,255,.65)' }}>Madison <em style={{fontStyle:'italic',color:'#5B8FFF'}}>AI Connect</em></span>
        </div>
        <div style={{ fontSize:13, color:'rgba(150,190,255,.45)' }}>Your Classes</div>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'48px 32px 80px', opacity:visible?1:0, transition:'opacity .8s ease' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:10, letterSpacing:'.20em', textTransform:'uppercase', color:'var(--blue)', marginBottom:14 }}>Your classes</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,4vw,44px)', fontWeight:500, lineHeight:1.1, marginBottom:14 }}>
            Find your people <em style={{ fontStyle:'italic', color:'#5B8FFF' }}>in class</em>
          </h1>
          <p style={{ fontSize:15, fontWeight:300, color:'rgba(180,200,255,.50)', maxWidth:480, margin:'0 auto' }}>
            See who in your lectures shares your interests. Claude analyzed everyone&apos;s mind maps to find compatibility.
          </p>
        </div>

        {/* Class tabs */}
        <div style={{ display:'flex', gap:10, marginBottom:36, justifyContent:'center', flexWrap:'wrap' }}>
          {CLASSES.map((c, i) => (
            <button
              key={c.code}
              onClick={() => setSelectedClass(i)}
              style={{
                padding:'10px 20px', borderRadius:100,
                background: i === selectedClass ? 'rgba(91,143,255,.20)' : 'rgba(91,143,255,.06)',
                border: `1px solid ${i === selectedClass ? 'rgba(91,143,255,.45)' : 'rgba(91,143,255,.15)'}`,
                color: i === selectedClass ? 'rgba(200,220,255,.95)' : 'rgba(150,190,255,.55)',
                fontSize:13, fontWeight: i === selectedClass ? 500 : 400,
                cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
                transition:'all .2s',
              }}
            >
              {c.code}
              <span style={{ marginLeft:8, fontSize:11, opacity:0.6 }}>({c.students.length})</span>
            </button>
          ))}
        </div>

        {/* Class header */}
        <div style={{ marginBottom:24, padding:'20px 28px', borderRadius:16, background:'rgba(91,143,255,.05)', border:'1px solid rgba(91,143,255,.12)' }}>
          <div style={{ fontSize:18, fontFamily:"'Playfair Display',serif", fontWeight:500, color:'rgba(255,255,255,.90)' }}>{cls.code}: {cls.name}</div>
          <div style={{ fontSize:13, color:'rgba(150,190,255,.50)', marginTop:4 }}>{cls.students.length} students on Madison AI Connect</div>
        </div>

        {/* Student cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {cls.students.sort((a, b) => b.match - a.match).map((student) => (
            <div
              key={student.name}
              style={{
                padding:'24px 28px', borderRadius:16,
                background:'rgba(8,12,36,.70)',
                border:'1px solid rgba(91,143,255,.12)',
                display:'flex', alignItems:'center', gap:20,
                transition:'border-color .2s, background .2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(91,143,255,.35)'; (e.currentTarget as HTMLElement).style.background = 'rgba(12,16,40,.80)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(91,143,255,.12)'; (e.currentTarget as HTMLElement).style.background = 'rgba(8,12,36,.70)'; }}
            >
              {/* Avatar */}
              <div style={{
                width:48, height:48, borderRadius:'50%',
                background:'linear-gradient(135deg, rgba(91,143,255,.15), rgba(155,91,255,.15))',
                border:'1px solid rgba(91,143,255,.25)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:18, color:'rgba(200,220,255,.70)',
                flexShrink:0,
              }}>
                {student.avatar}
              </div>

              {/* Info */}
              <div style={{ flex:1 }}>
                <div style={{ fontSize:16, fontWeight:500, color:'rgba(255,255,255,.90)', marginBottom:6 }}>{student.name}</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {student.interests.map(interest => (
                    <span key={interest} style={{
                      padding:'3px 10px', borderRadius:100,
                      background:'rgba(91,143,255,.08)', border:'1px solid rgba(91,143,255,.18)',
                      fontSize:11, color:'rgba(150,190,255,.65)',
                    }}>
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Match score */}
              <div style={{ textAlign:'center', flexShrink:0 }}>
                <div style={{
                  fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:500,
                  color: student.match >= 70 ? '#5B8FFF' : student.match >= 55 ? 'rgba(150,190,255,.75)' : 'rgba(150,190,255,.50)',
                  lineHeight:1,
                }}>
                  {student.match}%
                </div>
                <div style={{ fontSize:10, color:'rgba(150,190,255,.45)', marginTop:4, letterSpacing:'.06em' }}>match</div>
              </div>

              {/* Connect button */}
              <a href="/connect" style={{
                padding:'10px 20px', borderRadius:100,
                background:'rgba(91,143,255,.12)', border:'1px solid rgba(91,143,255,.25)',
                color:'rgba(200,220,255,.85)', fontSize:12, fontWeight:500,
                textDecoration:'none', flexShrink:0,
                transition:'all .2s',
              }}>
                View map →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
