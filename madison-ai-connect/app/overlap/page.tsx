'use client';
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import Cursor from '@/components/Cursor';
import type { MindNode } from '@/components/MindMapViz';

const OverlapMindMap = dynamic(() => import('@/components/OverlapMindMap'), { ssr: false });

const UNIQUE_PARKER: MindNode[] = [
  { id:'ml',      label:'Machine Learning', color:'#5B8FFF' },
  { id:'systems', label:'Systems',          color:'#5B8FFF' },
  { id:'gamedev', label:'Game Design',      color:'#9B5BFF' },
];
const UNIQUE_TYLER: MindNode[] = [
  { id:'webdev',  label:'Web Dev',          color:'#5B8FFF' },
  { id:'music',   label:'Music',            color:'#9B5BFF' },
  { id:'bball',   label:'Basketball',       color:'#FF9B5B' },
];
const SHARED: MindNode[] = [
  { id:'chess',    label:'Chess',      color:'#9B5BFF' },
  { id:'coffee',   label:'Coffee',     color:'#FF9B5B' },
  { id:'phil',     label:'Philosophy', color:'#5BFFE8' },
  { id:'startups', label:'Startups',   color:'#5B8FFF' },
];

const bg: React.CSSProperties = {
  minHeight:'100vh',
  background:'radial-gradient(ellipse at 20% 30%, rgba(91,143,255,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(155,91,255,0.07) 0%, transparent 50%), linear-gradient(180deg,#060A1A 0%,#07101F 100%)',
  fontFamily:"'DM Sans',sans-serif", color:'#fff',
};

interface ChatMessage {
  id: number;
  sender: 'me' | 'tyler';
  text: string;
  time: string;
}

export default function OverlapPage() {
  const [name, setName]   = useState('You');
  const [visible, setVis] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [introSent, setIntroSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setName(localStorage.getItem('mac_name') || 'You');
    setTimeout(() => setVis(true), 100);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const now = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour:'numeric', minute:'2-digit' });
  };

  const openChat = () => {
    setChatOpen(true);
    if (!introSent) {
      setIntroSent(true);
      const introText = `Hey Tyler! I saw we're both into chess and startups — would love to grab coffee before class sometime. Monday at 10 work?`;
      setMessages([{ id: 1, sender: 'me', text: introText, time: now() }]);
      // Simulate Tyler replying
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: 2, sender: 'tyler',
          text: `Hey! Yeah I saw your mindmap — the ML + philosophy combo is wild. Monday at 10 works, Memorial Union?`,
          time: now(),
        }]);
      }, 2200);
    }
  };

  const sendMessage = () => {
    if (!draft.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'me', text: draft.trim(), time: now() }]);
    setDraft('');
    // Simulate Tyler's response
    setTimeout(() => {
      const replies = [
        "That sounds great! I've been wanting to talk to someone about that.",
        "Totally agree. I was just asking Claude about something similar last week.",
        "Nice — yeah let's do it. I'll bring my board if you want to play a quick game too.",
        "Ha, I was thinking the same thing. See you there!",
      ];
      setMessages(prev => [...prev, {
        id: Date.now() + 1, sender: 'tyler',
        text: replies[Math.floor(Math.random() * replies.length)],
        time: now(),
      }]);
    }, 1500 + Math.random() * 1500);
  };

  return (
    <div style={{...bg, cursor:'none'}}>
      <Cursor />
      {/* Nav */}
      <div style={{ position:'sticky',top:0,zIndex:50,padding:'18px 32px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(6,10,26,.90)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(91,143,255,.10)' }}>
        <a href="/connect" style={{ fontSize:13,color:'rgba(150,190,255,.55)',textDecoration:'none' }}>← Connections</a>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ width:20,height:20,borderRadius:'50%',background:'linear-gradient(135deg,#5B8FFF,#9B5BFF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9 }}>◈</div>
          <span style={{ fontFamily:"'Playfair Display',serif",fontSize:14,color:'rgba(255,255,255,.65)' }}>Madison <em style={{fontStyle:'italic',color:'#5B8FFF'}}>AI Connect</em></span>
        </div>
        <div style={{ fontSize:13,color:'rgba(150,190,255,.45)' }}>Shared map</div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'48px 32px 80px', opacity:visible?1:0, transition:'opacity .8s ease' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:10,letterSpacing:'.20em',textTransform:'uppercase',color:'var(--blue)',marginBottom:12 }}>Shared mind map</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:'clamp(26px,3.5vw,44px)',fontWeight:500,lineHeight:1.1,marginBottom:14 }}>
            {name} <span style={{ color:'rgba(255,255,255,.30)' }}>×</span> <em style={{ fontStyle:'italic',color:'#9B5BFF' }}>Tyler</em>
          </h1>
          <p style={{ fontSize:14,fontWeight:300,color:'rgba(180,200,255,.50)',maxWidth:440,margin:'0 auto' }}>
            4 shared nodes highlighted. Sparks flow from each of you through what you have in common.
          </p>
        </div>

        {/* The overlap mind map */}
        <div style={{ background:'rgba(8,12,32,.55)', borderRadius:24, border:'1px solid rgba(91,143,255,.12)', overflow:'hidden', marginBottom:48 }}>
          <OverlapMindMap
            nameA={name}
            nameB="Tyler"
            uniqueA={UNIQUE_PARKER}
            uniqueB={UNIQUE_TYLER}
            shared={SHARED}
            height={500}
          />
        </div>

        {/* Shared interest breakdown */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16, marginBottom:48 }}>
          {[
            { icon:'♟', label:'Chess', color:'#9B5BFF', desc:'Both of you learned it young and kept coming back to it. It shows up across your memory files as a metaphor for how you think.' },
            { icon:'☕', label:'Coffee', color:'#FF9B5B', desc:'Not just a drink — you both use coffee conversations as your primary social thinking format. You process ideas with people over coffee.' },
            { icon:'∞', label:'Philosophy', color:'#5BFFE8', desc:'Different angles: you lean analytic, Tyler leans continental. That tension is exactly why this conversation will be interesting.' },
            { icon:'🚀', label:'Startups', color:'#5B8FFF', desc:'You\'ve both been asking Claude about the same layer of the stack: product-market fit and when to build vs. buy.' },
          ].map(item => (
            <div key={item.label} style={{ padding:'22px 20px', borderRadius:16, background:'rgba(8,12,36,.70)', border:`1px solid ${item.color}22` }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <span style={{ fontSize:18 }}>{item.icon}</span>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:500, color:item.color }}>{item.label}</span>
              </div>
              <p style={{ fontSize:13, color:'rgba(180,200,255,.60)', lineHeight:1.65 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Activity suggestion — the hero of this page */}
        <div style={{
          borderRadius:20, overflow:'hidden',
          border:'1px solid rgba(91,143,255,.20)',
          background:'rgba(6,10,26,.80)',
          backdropFilter:'blur(20px)',
        }}>
          {/* Top accent */}
          <div style={{ height:3, background:'linear-gradient(90deg,#5B8FFF,#9B5BFF,#5BFFE8)' }} />
          <div style={{ padding:'36px 40px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
              <div style={{ width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#5B8FFF,#9B5BFF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13 }}>◈</div>
              <span style={{ fontSize:10, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(150,190,255,.65)' }}>Claude&apos;s suggestion</span>
            </div>

            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(22px,3vw,32px)', fontWeight:500, color:'rgba(255,255,255,.92)', lineHeight:1.2, marginBottom:20 }}>
              Grab coffee before class —<br /><em style={{ fontStyle:'italic', color:'#FF9B5B' }}>Monday at 10 AM.</em>
            </h2>

            <p style={{ fontSize:15, fontWeight:300, color:'rgba(200,215,255,.70)', lineHeight:1.8, maxWidth:620, marginBottom:32 }}>
              You&apos;re both free Monday at 10am — a full hour before Tyler&apos;s 11am lecture. Your Claude memories show you&apos;ve both been independently thinking about the same startup problem: when AI becomes the interface layer, what does product design actually mean? That conversation needs a table, two coffees, and no time limit.
            </p>

            {/* Details row */}
            <div style={{ display:'flex', gap:20, marginBottom:32, flexWrap:'wrap' }}>
              {[
                { icon:'📍', label:'Memorial Union Terrace', sub:'or Lake Street Coffee' },
                { icon:'🕙', label:'Monday, 10:00 AM',       sub:'1 hour · both free' },
                { icon:'♟', label:'Bring a chessboard',     sub:'optional but encouraged' },
              ].map(d => (
                <div key={d.label} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'14px 18px', borderRadius:12, background:'rgba(91,143,255,.06)', border:'1px solid rgba(91,143,255,.12)', flex:'1 1 180px' }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{d.icon}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:500, color:'rgba(220,230,255,.85)', marginBottom:2 }}>{d.label}</div>
                    <div style={{ fontSize:11, color:'rgba(150,180,255,.50)' }}>{d.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Conversation starters */}
            <div style={{ marginBottom:36 }}>
              <div style={{ fontSize:10, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(91,143,255,.65)', marginBottom:14 }}>Conversation starters Claude suggests</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  '"When you use AI for creative work, do you feel like it\'s a tool or a collaborator?"',
                  '"What\'s the startup idea you\'ve been sitting on but haven\'t built yet?"',
                  '"Best chess opening for someone who thinks intuitively vs. analytically?"',
                ].map((q, i) => (
                  <div key={i} style={{ padding:'12px 16px', borderRadius:10, background:'rgba(91,143,255,.05)', border:'1px solid rgba(91,143,255,.12)', fontSize:13, color:'rgba(180,205,255,.72)', fontStyle:'italic', lineHeight:1.6 }}>
                    {q}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <button onClick={openChat} style={{
                padding:'14px 32px', borderRadius:100,
                background:'linear-gradient(135deg,#5B8FFF,#9B5BFF)',
                color:'#fff', fontSize:14, fontWeight:500, textDecoration:'none',
                display:'inline-flex', alignItems:'center', gap:8,
                boxShadow:'0 8px 28px rgba(91,143,255,.28)',
                border:'none', cursor:'none', fontFamily:"'DM Sans',sans-serif",
              }}>
                {introSent ? 'Open chat with Tyler' : 'Send Tyler an intro'}
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7h12M8 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <a href="/mindmap" style={{
                padding:'14px 24px', borderRadius:100,
                border:'1px solid rgba(91,143,255,.28)',
                color:'rgba(180,200,255,.75)', fontSize:14, textDecoration:'none',
                display:'inline-flex', alignItems:'center', gap:8,
              }}>
                Back to my map
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {chatOpen && (
        <div style={{
          position:'fixed', inset:0, zIndex:100,
          background:'rgba(6,10,26,.70)', backdropFilter:'blur(8px)',
          display:'flex', alignItems:'flex-end', justifyContent:'center',
          animation:'fadeIn .3s ease',
        }} onClick={(e) => { if (e.target === e.currentTarget) setChatOpen(false) }}>
          <div style={{
            width:'100%', maxWidth:520,
            height:'min(85vh, 700px)',
            background:'linear-gradient(180deg,#0A0F22 0%,#070D1C 100%)',
            borderRadius:'24px 24px 0 0',
            border:'1px solid rgba(91,143,255,.15)',
            borderBottom:'none',
            display:'flex', flexDirection:'column',
            animation:'slideUp .4s cubic-bezier(.22,1,.36,1)',
            overflow:'hidden',
          }}>
            {/* Chat header */}
            <div style={{
              padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between',
              borderBottom:'1px solid rgba(91,143,255,.10)',
              background:'rgba(8,12,32,.60)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{
                  width:36, height:36, borderRadius:'50%',
                  background:'linear-gradient(135deg,#9B5BFF,#5B8FFF)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:14, fontWeight:500, color:'#fff',
                }}>T</div>
                <div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:500, color:'rgba(255,255,255,.92)' }}>Tyler</div>
                  <div style={{ fontSize:11, color:'rgba(150,190,255,.50)', display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ADE80', display:'inline-block' }} />
                    Online
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                <div style={{
                  padding:'5px 10px', borderRadius:8,
                  background:'rgba(91,143,255,.08)', border:'1px solid rgba(91,143,255,.15)',
                  fontSize:11, color:'rgba(150,190,255,.65)',
                }}>73% match</div>
                <button onClick={() => setChatOpen(false)} style={{
                  background:'none', border:'none', color:'rgba(150,190,255,.50)',
                  fontSize:20, cursor:'none', padding:4, lineHeight:1,
                }}>×</button>
              </div>
            </div>

            {/* Shared interests banner */}
            <div style={{
              padding:'12px 24px', display:'flex', alignItems:'center', gap:8,
              background:'rgba(91,143,255,.04)', borderBottom:'1px solid rgba(91,143,255,.08)',
            }}>
              <span style={{ fontSize:10, letterSpacing:'.15em', textTransform:'uppercase', color:'rgba(91,143,255,.55)' }}>Shared</span>
              {['Chess','Coffee','Philosophy','Startups'].map(s => (
                <span key={s} style={{
                  padding:'3px 10px', borderRadius:100, fontSize:11,
                  background:'rgba(91,143,255,.08)', border:'1px solid rgba(91,143,255,.12)',
                  color:'rgba(180,205,255,.65)',
                }}>{s}</span>
              ))}
            </div>

            {/* Messages */}
            <div style={{
              flex:1, overflowY:'auto', padding:'20px 24px',
              display:'flex', flexDirection:'column', gap:16,
            }}>
              {messages.length === 0 && (
                <div style={{ textAlign:'center', padding:'40px 20px', color:'rgba(150,190,255,.35)', fontSize:13 }}>
                  Send a message to start the conversation
                </div>
              )}
              {messages.map(msg => (
                <div key={msg.id} style={{
                  display:'flex', flexDirection:'column',
                  alignItems: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                  animation:'fadeIn .3s ease',
                }}>
                  <div style={{
                    maxWidth:'80%', padding:'12px 16px', borderRadius:16,
                    ...(msg.sender === 'me' ? {
                      background:'linear-gradient(135deg,#5B8FFF,#7B6FFF)',
                      borderBottomRightRadius:4,
                      color:'#fff',
                    } : {
                      background:'rgba(91,143,255,.08)',
                      border:'1px solid rgba(91,143,255,.12)',
                      borderBottomLeftRadius:4,
                      color:'rgba(220,230,255,.88)',
                    }),
                    fontSize:14, lineHeight:1.6, fontWeight:300,
                  }}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize:10, color:'rgba(150,190,255,.35)', marginTop:4, padding:'0 4px' }}>
                    {msg.sender === 'me' ? name : 'Tyler'} · {msg.time}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div style={{
              padding:'16px 24px', borderTop:'1px solid rgba(91,143,255,.10)',
              background:'rgba(8,12,32,.60)',
              display:'flex', gap:10, alignItems:'center',
            }}>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
                placeholder="Type a message..."
                style={{
                  flex:1, padding:'12px 16px', borderRadius:12,
                  background:'rgba(91,143,255,.06)', border:'1px solid rgba(91,143,255,.12)',
                  color:'#fff', fontSize:14, fontFamily:"'DM Sans',sans-serif",
                  outline:'none', fontWeight:300,
                }}
              />
              <button onClick={sendMessage} style={{
                width:42, height:42, borderRadius:12,
                background: draft.trim() ? 'linear-gradient(135deg,#5B8FFF,#9B5BFF)' : 'rgba(91,143,255,.10)',
                border:'none', cursor:'none',
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'background .2s',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-up animation */}
      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
