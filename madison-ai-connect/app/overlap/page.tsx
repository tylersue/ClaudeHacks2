'use client';
import { useEffect, useState } from 'react';
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

export default function OverlapPage() {
  const [name, setName]   = useState('You');
  const [visible, setVis] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem('mac_name') || 'You');
    setTimeout(() => setVis(true), 100);
  }, []);

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
              <a href="#" style={{
                padding:'14px 32px', borderRadius:100,
                background:'linear-gradient(135deg,#5B8FFF,#9B5BFF)',
                color:'#fff', fontSize:14, fontWeight:500, textDecoration:'none',
                display:'inline-flex', alignItems:'center', gap:8,
                boxShadow:'0 8px 28px rgba(91,143,255,.28)',
              }}>
                Send Tyler an intro
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7h12M8 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
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
    </div>
  );
}
