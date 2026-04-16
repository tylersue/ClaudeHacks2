'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Cursor from '@/components/Cursor';
import type { MindNode } from '@/components/MindMapViz';

const MindMapViz = dynamic(() => import('@/components/MindMapViz'), { ssr: false });
const DitherBg   = dynamic(() => import('@/components/DitherBg'),   { ssr: false });

const PARKER_NODES: MindNode[] = [
  { id:'ml',       label:'Machine Learning', color:'#5B8FFF' },
  { id:'chess',    label:'Chess',            color:'#9B5BFF', shared:true },
  { id:'coffee',   label:'Coffee',           color:'#FF9B5B', shared:true },
  { id:'phil',     label:'Philosophy',       color:'#5BFFE8', shared:true },
  { id:'startups', label:'Startups',         color:'#5B8FFF', shared:true },
  { id:'systems',  label:'Systems',          color:'#5B8FFF' },
  { id:'gamedev',  label:'Game Design',      color:'#9B5BFF' },
];

const TYLER_NODES: MindNode[] = [
  { id:'chess',    label:'Chess',            color:'#9B5BFF', shared:true },
  { id:'coffee',   label:'Coffee',           color:'#FF9B5B', shared:true },
  { id:'webdev',   label:'Web Dev',          color:'#5B8FFF' },
  { id:'music',    label:'Music',            color:'#9B5BFF' },
  { id:'startups', label:'Startups',         color:'#5B8FFF', shared:true },
  { id:'phil',     label:'Philosophy',       color:'#5BFFE8', shared:true },
  { id:'bball',    label:'Basketball',       color:'#FF9B5B' },
];

const SHARED_LABELS = ['Chess','Coffee','Philosophy','Startups'];
const OVERLAP_SLOTS = ['Monday 10:00 AM','Wednesday 3:00 PM'];

export default function ConnectPage() {
  const [name, setName]       = useState('You');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem('mac_name') || 'You');
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div style={{ minHeight:'100vh', position:'relative', fontFamily:"'DM Sans',sans-serif", color:'#fff', cursor:'none' }}>
      <Cursor />

      {/* Dither background */}
      <div style={{ position:'fixed', inset:0, zIndex:0 }}>
        <DitherBg />
      </div>
      <div style={{ position:'fixed', inset:0, zIndex:1, background:'rgba(4,6,18,0.72)' }} />

      {/* Nav */}
      <div style={{ position:'sticky', top:0, zIndex:50, padding:'18px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(4,6,18,0.82)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(91,143,255,.10)' }}>
        <a href="/mindmap" style={{ fontSize:13, color:'rgba(150,190,255,.55)', textDecoration:'none' }}>← Your map</a>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:20,height:20,borderRadius:'50%',background:'linear-gradient(135deg,#5B8FFF,#9B5BFF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9 }}>◈</div>
          <span style={{ fontFamily:"'Playfair Display',serif",fontSize:14,color:'rgba(255,255,255,.65)' }}>Madison <em style={{fontStyle:'italic',color:'#5B8FFF'}}>AI Connect</em></span>
        </div>
        <div style={{ fontSize:13, color:'rgba(150,190,255,.45)' }}>1 match found</div>
      </div>

      <div style={{ position:'relative', zIndex:2, maxWidth:1100, margin:'0 auto', padding:'60px 32px 80px', opacity: visible?1:0, transition:'opacity .8s ease' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <div style={{ fontSize:10, letterSpacing:'.20em', textTransform:'uppercase', color:'var(--blue)', marginBottom:14 }}>Connection found</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,4vw,48px)', fontWeight:500, lineHeight:1.1, marginBottom:16 }}>
            {name} × <em style={{ fontStyle:'italic', color:'#9B5BFF' }}>Tyler</em>
          </h1>
          <p style={{ fontSize:15, fontWeight:300, color:'rgba(180,200,255,.55)', maxWidth:480, margin:'0 auto' }}>
            Claude found 4 shared interest threads and 2 overlapping free blocks. This one&apos;s worth a conversation.
          </p>
        </div>

        {/* Match score */}
        <div style={{ display:'flex', justifyContent:'center', gap:32, marginBottom:56, flexWrap:'wrap' }}>
          {[
            { val:'73%', label:'Mind map overlap' },
            { val:'4',   label:'Shared interests' },
            { val:'2',   label:'Free time overlaps' },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center', padding:'20px 32px', borderRadius:16, background:'rgba(91,143,255,.07)', border:'1px solid rgba(91,143,255,.16)' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:500, color:'var(--blue)', lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:12, color:'rgba(150,190,255,.55)', marginTop:6, letterSpacing:'.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Two mind maps */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 80px 1fr', gap:0, alignItems:'center', marginBottom:48 }}>

          {/* Parker map */}
          <div style={{ background:'rgba(6,10,26,.72)', border:'1px solid rgba(91,143,255,.16)', borderRadius:20, padding:'24px 16px 16px', overflow:'hidden', backdropFilter:'blur(20px)' }}>
            <div style={{ textAlign:'center', marginBottom:8 }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:500, color:'rgba(255,255,255,.85)' }}>{name}</div>
              <div style={{ fontSize:11, color:'rgba(150,190,255,.45)', marginTop:2 }}>{PARKER_NODES.length} interest nodes</div>
            </div>
            <MindMapViz name={name} nodes={PARKER_NODES} height={320} compact accentColor="#5B8FFF" />
          </div>

          {/* Center bridge */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            {SHARED_LABELS.map((l,i) => (
              <div key={l} style={{
                width:72, padding:'5px 6px', borderRadius:8, textAlign:'center',
                background:'rgba(91,143,255,.14)', border:'1px solid rgba(91,143,255,.30)',
                fontSize:9, color:'rgba(200,220,255,.80)', letterSpacing:'.04em',
                boxShadow:'0 0 12px rgba(91,143,255,.18)',
                animation:`fadeIn .5s ${i*0.1+0.3}s both`,
              }}>{l}</div>
            ))}
          </div>

          {/* Tyler map */}
          <div style={{ background:'rgba(10,6,26,.72)', border:'1px solid rgba(155,91,255,.16)', borderRadius:20, padding:'24px 16px 16px', overflow:'hidden', backdropFilter:'blur(20px)' }}>
            <div style={{ textAlign:'center', marginBottom:8 }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:500, color:'rgba(255,255,255,.85)' }}>Tyler</div>
              <div style={{ fontSize:11, color:'rgba(150,190,255,.45)', marginTop:2 }}>{TYLER_NODES.length} interest nodes</div>
            </div>
            <MindMapViz name="Tyler" nodes={TYLER_NODES} height={320} compact accentColor="#9B5BFF" />
          </div>
        </div>

        {/* Schedule overlap */}
        <div style={{ marginBottom:40, padding:'24px 28px', borderRadius:16, background:'rgba(6,10,26,.72)', border:'1px solid rgba(91,143,255,.14)', backdropFilter:'blur(20px)' }}>
          <div style={{ fontSize:10, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--blue)', marginBottom:14 }}>Schedule overlaps</div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            {OVERLAP_SLOTS.map(slot => (
              <div key={slot} style={{
                padding:'10px 18px', borderRadius:100,
                background:'rgba(91,143,255,.10)', border:'1px solid rgba(91,143,255,.25)',
                fontSize:13, color:'rgba(200,220,255,.85)',
                display:'flex', alignItems:'center', gap:8,
              }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#5BFFE8', boxShadow:'0 0 8px #5BFFE8' }} />
                {slot}
              </div>
            ))}
          </div>
        </div>

        {/* Claude's read */}
        <div style={{ marginBottom:48, padding:'28px', borderRadius:16, background:'rgba(6,10,26,.72)', border:'1px solid rgba(91,143,255,.15)', backdropFilter:'blur(20px)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <div style={{ width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#5B8FFF,#9B5BFF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13 }}>◈</div>
            <span style={{ fontSize:11, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(150,190,255,.60)' }}>Claude&apos;s read</span>
          </div>
          <p style={{ fontSize:15, fontWeight:300, color:'rgba(200,215,255,.75)', lineHeight:1.75, maxWidth:680 }}>
            Both of you have an unusual pairing in your maps: systematic thinking (Chess, Systems/Web Dev) alongside genuine philosophical curiosity. That&apos;s not common. You&apos;re also both circling the same startup territory — Tyler&apos;s been asking Claude about product thinking, you&apos;ve been going deep on technical architecture. The conversation is already half-written.
          </p>
        </div>

        {/* CTA */}
        <div style={{ textAlign:'center' }}>
          <a href="/overlap" style={{
            display:'inline-flex', alignItems:'center', gap:10,
            padding:'16px 44px', borderRadius:100,
            background:'linear-gradient(135deg, #5B8FFF, #9B5BFF)',
            color:'#fff', fontSize:15, fontWeight:500, textDecoration:'none',
            boxShadow:'0 8px 32px rgba(91,143,255,.30)',
          }}>
            View shared mind map
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M8 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
