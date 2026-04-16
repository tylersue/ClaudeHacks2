'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Cursor from '@/components/Cursor';
import type { MindNode, EdgeDef } from '@/components/MindMapViz';

const MindMapViz = dynamic(() => import('@/components/MindMapViz'), { ssr: false });
const DitherBg   = dynamic(() => import('@/components/DitherBg'),   { ssr: false });

interface Profile {
  nodes: MindNode[];
  edges: EdgeDef[];
  categories: { label: string; color: string; items: string[] }[];
  personality: string;
}

// ── Demo graph data ───────────────────────────────────────────────────────────
const DEMO_NODES: MindNode[] = [
  { id:'ml',       label:'Machine Learning',  color:'#5B8FFF', tier:1 },
  { id:'chess',    label:'Chess',             color:'#9B5BFF', tier:1, shared:true },
  { id:'coffee',   label:'Coffee',            color:'#FF9B5B', tier:1, shared:true },
  { id:'phil',     label:'Philosophy',        color:'#5BFFE8', tier:1, shared:true },
  { id:'startups', label:'Startups',          color:'#5B8FFF', tier:1, shared:true },
  { id:'systems',  label:'Systems',           color:'#5B8FFF', tier:2 },
  { id:'gamedev',  label:'Game Design',       color:'#9B5BFF', tier:2 },
  { id:'writing',  label:'Long-form Writing', color:'#5BFFE8', tier:2 },
  { id:'pytorch',  label:'PyTorch',           color:'#5B8FFF', tier:2 },
  { id:'openings', label:'Chess Openings',    color:'#9B5BFF', tier:2 },
  { id:'stoicism', label:'Stoicism',          color:'#5BFFE8', tier:2 },
  { id:'pmfit',    label:'Product/Market Fit',color:'#5B8FFF', tier:2 },
];

const DEMO_EDGES: EdgeDef[] = [
  ['ml','systems'], ['ml','startups'], ['ml','pytorch'],
  ['chess','gamedev'], ['chess','phil'], ['chess','openings'],
  ['coffee','startups'],
  ['phil','writing'], ['phil','stoicism'],
  ['startups','pmfit'],
  ['systems','gamedev'],
  ['writing','stoicism'],
];

const DEMO_CATEGORIES = [
  { label:'Technology',   color:'#5B8FFF', items:['Machine Learning','Systems','PyTorch','Startups','Product/Market Fit'] },
  { label:'Games & Play', color:'#9B5BFF', items:['Chess','Game Design','Chess Openings'] },
  { label:'Ideas',        color:'#5BFFE8', items:['Philosophy','Long-form Writing','Stoicism'] },
  { label:'Social',       color:'#FF9B5B', items:['Coffee'] },
];

const DEMO_PERSONALITY = "Strong overlap between systematic thinking and intellectual play. The Chess + Philosophy pairing is unusual — suggests someone who treats ideas like endgames, not starting points.";

export default function MindMapPage() {
  const [name, setName]             = useState('You');
  const [phase, setPhase]           = useState<'loading'|'reveal'|'ready'>('loading');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile]       = useState<Profile | null>(null);
  const [apiLoading, setApiLoading] = useState(true);

  useEffect(() => {
    setName(localStorage.getItem('mac_name') || 'You');

    // Try cached profile first, then call API, then fall back to demo
    const cached = localStorage.getItem('mac_profile');
    if (cached) {
      try { setProfile(JSON.parse(cached)); } catch { /* ignore */ }
      setApiLoading(false);
    } else {
      const memoryText = localStorage.getItem('mac_memory') || '';
      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memoryText }),
      })
        .then(r => r.json())
        .then(data => {
          setProfile(data);
          localStorage.setItem('mac_profile', JSON.stringify(data));
        })
        .catch(() => {})
        .finally(() => setApiLoading(false));
    }

    const t1 = setTimeout(() => setPhase('reveal'), 200);
    const t2 = setTimeout(() => { setPhase('ready'); setSidebarOpen(true); }, 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const activeNodes       = profile?.nodes       ?? DEMO_NODES;
  const activeEdges       = profile?.edges       ?? DEMO_EDGES;
  const activeCategories  = profile?.categories  ?? DEMO_CATEGORIES;
  const activePersonality = profile?.personality ?? DEMO_PERSONALITY;

  return (
    <div style={{
      height:'100vh', overflow:'hidden', position:'relative',
      fontFamily:"'DM Sans',sans-serif", color:'#fff',
      cursor:'none',
    }}>
      <Cursor />

      {/* Dither background */}
      <div style={{ position:'fixed', inset:0, zIndex:0 }}>
        <DitherBg />
      </div>
      <div style={{ position:'fixed', inset:0, zIndex:1, background:'rgba(4,6,18,0.52)' }} />

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header style={{
        position:'relative', zIndex:50, height:58,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 28px',
        background:'rgba(4,6,18,0.78)',
        backdropFilter:'blur(24px)',
        borderBottom:'1px solid rgba(91,143,255,0.12)',
        opacity: phase==='loading' ? 0 : 1,
        transform: phase==='loading' ? 'translateY(-8px)' : 'translateY(0)',
        transition:'opacity .6s ease, transform .6s ease',
      }}>
        <a href="/" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none' }}>
          <div style={{ width:22,height:22,borderRadius:'50%',background:'linear-gradient(135deg,#5B8FFF,#9B5BFF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,flexShrink:0 }}>◈</div>
          <span style={{ fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:500,color:'rgba(255,255,255,.60)',letterSpacing:'-.005em' }}>
            Madison <em style={{fontStyle:'italic',color:'#5B8FFF'}}>AI Connect</em>
          </span>
        </a>

        <div style={{
          display:'flex', alignItems:'center', gap:12,
          padding:'6px 16px', borderRadius:100,
          background:'rgba(91,143,255,.08)', border:'1px solid rgba(91,143,255,.16)',
          fontSize:11, color:'rgba(180,210,255,.65)', letterSpacing:'.06em',
        }}>
          <span style={{ width:5,height:5,borderRadius:'50%',background:'#5B8FFF',boxShadow:'0 0 8px #5B8FFF',flexShrink:0 }} />
          {apiLoading
            ? 'Claude is mapping your mind…'
            : `${name}'s map · ${activeNodes.length} nodes · ${activeEdges.length} connections`}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <a href="/classes" style={{
            display:'flex', alignItems:'center', gap:8,
            padding:'9px 20px', borderRadius:100,
            background:'rgba(155,91,255,.10)', border:'1px solid rgba(155,91,255,.25)',
            color:'rgba(200,220,255,.75)', fontSize:13, fontWeight:500, textDecoration:'none',
            letterSpacing:'.01em',
          }}>
            Your Classes
          </a>
          <a href="/connect" style={{
            display:'flex', alignItems:'center', gap:8,
            padding:'9px 20px', borderRadius:100,
            background:'rgba(91,143,255,.15)', border:'1px solid rgba(91,143,255,.30)',
            color:'rgba(200,220,255,.90)', fontSize:13, fontWeight:500, textDecoration:'none',
            letterSpacing:'.01em',
          }}>
            Find connections
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M8 3l5 4-5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </header>

      {/* ── Full-screen canvas ───────────────────────────────────────────── */}
      <div style={{ position:'absolute', inset:0, top:58, zIndex:2 }}>

        {/* API loading state */}
        {apiLoading && (
          <div style={{
            position:'absolute', inset:0, zIndex:5,
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            gap:16, pointerEvents:'none',
          }}>
            <div style={{ fontSize:40, animation:'spinSlow 2s linear infinite', color:'#5B8FFF' }}>◈</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:'rgba(255,255,255,.85)' }}>
              Claude is mapping your mind...
            </div>
            <div style={{ fontSize:11, color:'rgba(150,190,255,.50)', letterSpacing:'.10em', textTransform:'uppercase' }}>
              analyzing your memory
            </div>
          </div>
        )}

        {phase !== 'loading' && !apiLoading && (
          <MindMapViz
            name={name}
            nodes={activeNodes}
            edges={activeEdges}
            fill
            transparent
            accentColor="#5B8FFF"
          />
        )}

        {/* Floating title — fades out once ready */}
        <div style={{
          position:'absolute', top:'10%', left:0, right: sidebarOpen ? 300 : 0,
          textAlign:'center', pointerEvents:'none', zIndex:10,
          opacity: phase==='reveal' ? 1 : 0,
          transition:'opacity 1s .8s ease',
        }}>
          <div style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:'clamp(22px,3vw,32px)', fontWeight:500,
            color:'rgba(255,255,255,.82)', letterSpacing:'-.01em',
          }}>
            {name}&apos;s <em style={{ fontStyle:'italic', color:'#5B8FFF' }}>mind map</em>
          </div>
          <div style={{ fontSize:11, color:'rgba(150,190,255,.42)', marginTop:6, letterSpacing:'.10em', textTransform:'uppercase' }}>
            mapped from claude memory
          </div>
        </div>

        {/* Legend */}
        <div style={{
          position:'absolute', bottom:24, left:24,
          display:'flex', gap:14, alignItems:'center',
          opacity: phase==='ready' ? 0.7 : 0,
          transition:'opacity .8s 1.5s ease',
          pointerEvents:'none',
        }}>
          {[
            { el: <div style={{ width:18, height:1.5, background:'rgba(91,143,255,.6)' }} />, label:'primary link' },
            { el: <div style={{ width:18, height:0, borderTop:'1px dashed rgba(91,143,255,.4)' }} />, label:'secondary link' },
            { el: <div style={{ width:8, height:8, borderRadius:'50%', background:'#9B5BFF', boxShadow:'0 0 6px #9B5BFF' }} />, label:'shared interest' },
          ].map(({ el, label }) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:5 }}>
              {el}
              <span style={{ fontSize:9, color:'rgba(150,180,255,.55)', letterSpacing:'.08em' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Floating sidebar ───────────────────────────────────────────── */}
      <aside style={{
        position:'absolute', top:58, right:0, bottom:0,
        width: sidebarOpen ? 288 : 0,
        zIndex:20,
        overflow:'hidden',
        transition:'width .7s cubic-bezier(.4,0,.2,1)',
        borderLeft: sidebarOpen ? '1px solid rgba(91,143,255,.12)' : 'none',
        background:'rgba(4,6,18,0.85)',
        backdropFilter:'blur(32px)',
      }}>
        <div style={{
          width:288, height:'100%', overflowY:'auto',
          padding:'28px 22px',
          opacity: sidebarOpen ? 1 : 0,
          transition:'opacity .5s .4s ease',
          display:'flex', flexDirection:'column', gap:24,
        }}>

          {/* Interest clusters */}
          <div>
            <div style={{ fontSize:9, letterSpacing:'.20em', textTransform:'uppercase', color:'rgba(91,143,255,.65)', marginBottom:14 }}>
              Interest clusters
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {activeCategories.map(cat => (
                <div key={cat.label}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
                    <div style={{ width:6,height:6,borderRadius:'50%',background:cat.color,boxShadow:`0 0 7px ${cat.color}`,flexShrink:0 }} />
                    <span style={{ fontSize:11,fontWeight:500,color:'rgba(210,225,255,.80)',letterSpacing:'.03em' }}>{cat.label}</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {cat.items.map(item => (
                      <div key={item} style={{
                        fontSize:11, color:'rgba(140,170,220,.58)',
                        padding:'5px 10px', borderRadius:6,
                        background:'rgba(91,143,255,.04)',
                        border:'1px solid rgba(91,143,255,.08)',
                        display:'flex', alignItems:'center', gap:7,
                      }}>
                        <div style={{ width:3,height:3,borderRadius:'50%',background:cat.color,flexShrink:0 }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height:1, background:'rgba(91,143,255,.08)' }} />

          {/* Claude's read */}
          <div>
            <div style={{ fontSize:9, letterSpacing:'.20em', textTransform:'uppercase', color:'rgba(91,143,255,.65)', marginBottom:12 }}>
              Claude&apos;s read
            </div>
            <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(91,143,255,.05)', border:'1px solid rgba(91,143,255,.11)' }}>
              <p style={{ fontSize:12, color:'rgba(175,200,245,.62)', lineHeight:1.70, margin:0 }}>
                {activePersonality}
              </p>
            </div>
          </div>

          {/* Graph stats */}
          <div>
            <div style={{ fontSize:9, letterSpacing:'.20em', textTransform:'uppercase', color:'rgba(91,143,255,.65)', marginBottom:12 }}>
              Graph stats
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                { val: activeNodes.length,                       label:'Nodes' },
                { val: activeEdges.length,                       label:'Edges' },
                { val: activeNodes.filter(n=>n.shared).length,   label:'Shared' },
                { val: activeCategories.length,                  label:'Clusters' },
              ].map(s => (
                <div key={s.label} style={{
                  padding:'10px 12px', borderRadius:10,
                  background:'rgba(91,143,255,.05)', border:'1px solid rgba(91,143,255,.09)',
                  textAlign:'center',
                }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:500, color:'rgba(180,210,255,.85)', lineHeight:1 }}>{s.val}</div>
                  <div style={{ fontSize:9, color:'rgba(130,165,215,.50)', marginTop:4, letterSpacing:'.06em', textTransform:'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <a href="/connect" style={{
            marginTop:'auto',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            padding:'13px 16px', borderRadius:12,
            background:'linear-gradient(135deg,rgba(91,143,255,.18),rgba(155,91,255,.12))',
            border:'1px solid rgba(91,143,255,.22)',
            color:'rgba(200,220,255,.88)', fontSize:13, fontWeight:500, textDecoration:'none',
            letterSpacing:'.01em',
          }}>
            Find who matches this
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M8 3l5 4-5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </aside>
    </div>
  );
}
