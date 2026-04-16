'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Cursor from '@/components/Cursor';

const DitherBg = dynamic(() => import('@/components/DitherBg'), { ssr: false });

// ── Step meta ─────────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: '01',
    tag: 'Identity',
    headline: 'Who are\nyou?',
    sub: 'No account. No login.\nJust your name and where you are in the journey.',
    glyph: '◈',
    glyphColor: '#5B8FFF',
  },
  {
    num: '02',
    tag: 'Memory',
    headline: 'Your AI\nmemory.',
    sub: 'Paste what Claude or ChatGPT knows about you.\nWe turn it into a graph of who you actually are.',
    glyph: '⬡',
    glyphColor: '#9B5BFF',
  },
  {
    num: '03',
    tag: 'Schedule',
    headline: 'When are\nyou free?',
    sub: 'Drop your class schedule.\nClaude finds the exact window where both worlds overlap.',
    glyph: '◎',
    glyphColor: '#5BFFE8',
  },
];

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep]                 = useState(0);
  const [mounted, setMounted]           = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [name, setName]                 = useState('');
  const [year, setYear]                 = useState('Junior');
  const [memoryText, setMemoryText]     = useState('');
  const [scheduleText, setScheduleText] = useState('');
  const [processing, setProcessing]     = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
  }, []);

  const goNext = () => {
    if (step === 2) {
      setProcessing(true);
      localStorage.setItem('mac_name', name || 'You');
      localStorage.setItem('mac_year', year);
      localStorage.setItem('mac_memory', memoryText);
      localStorage.setItem('mac_schedule', scheduleText);
      localStorage.removeItem('mac_profile');
      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memoryText }),
      }).then(r => r.json()).then(profile => {
        localStorage.setItem('mac_profile', JSON.stringify(profile));
      }).catch(() => {});
      setTimeout(() => router.push('/mindmap'), 2600);
    } else {
      setTransitioning(true);
      setTimeout(() => {
        setStep(s => s + 1);
        setTransitioning(false);
      }, 260);
    }
  };

  const goBack = () => {
    setTransitioning(true);
    setTimeout(() => {
      setStep(s => s - 1);
      setTransitioning(false);
    }, 260);
  };

  const canContinue = step === 0 ? name.trim().length > 0 : true;
  const meta = STEPS[step];

  return (
    <div style={{
      minHeight: '100vh', position: 'relative',
      fontFamily: "'DM Sans', sans-serif", color: '#fff',
      cursor: 'none', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <Cursor />

      {/* ── Dither background — let it breathe ─────────────────────────── */}
      <div style={{ position:'fixed', inset:0, zIndex:0 }}>
        <DitherBg />
      </div>
      {/* Lighter overlay so dither is visible and dramatic */}
      <div style={{ position:'fixed', inset:0, zIndex:1, background:'rgba(3,5,16,0.42)' }} />

      {/* Scanline texture overlay */}
      <div style={{
        position:'fixed', inset:0, zIndex:2, pointerEvents:'none',
        backgroundImage:'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
      }} />

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 36px',
        background: 'rgba(3,5,16,0.55)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(91,143,255,0.10)',
        opacity: mounted ? 1 : 0,
        transition: 'opacity .6s ease',
      }}>
        <a href="/" style={{ fontSize:13, color:'rgba(150,190,255,0.50)', textDecoration:'none', letterSpacing:'.06em', display:'flex', alignItems:'center', gap:6 }}>
          ← back
        </a>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:20,height:20,borderRadius:'50%',background:'linear-gradient(135deg,#5B8FFF,#9B5BFF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9 }}>◈</div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:500, color:'rgba(255,255,255,.60)' }}>
            Madison <em style={{ fontStyle:'italic', color:'#5B8FFF' }}>AI Connect</em>
          </span>
        </div>
        {/* Step counter */}
        <div style={{ fontSize:11, color:'rgba(150,190,255,.40)', letterSpacing:'.12em' }}>
          0{step+1} / 03
        </div>
      </nav>

      {/* ── Main layout ────────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'stretch',
        paddingTop: 80, position: 'relative', zIndex: 10,
        opacity: mounted ? 1 : 0,
        transition: 'opacity .8s ease',
      }}>

        {/* ── LEFT PANEL — step context ─────────────────────────────────── */}
        <div style={{
          flex: '0 0 44%', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '60px 48px 60px 60px',
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(10px)' : 'translateY(0)',
          transition: 'opacity .26s ease, transform .26s ease',
        }}>

          {/* Step number tag */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
            <div style={{
              width:36, height:36, borderRadius:'50%',
              background:`linear-gradient(135deg, ${meta.glyphColor}22, ${meta.glyphColor}08)`,
              border:`1px solid ${meta.glyphColor}44`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:16, color: meta.glyphColor,
              boxShadow:`0 0 20px ${meta.glyphColor}28`,
            }}>{meta.glyph}</div>
            <div>
              <div style={{ fontSize:9, letterSpacing:'.22em', textTransform:'uppercase', color:'rgba(150,190,255,.45)', marginBottom:2 }}>Step {meta.num}</div>
              <div style={{ fontSize:11, letterSpacing:'.12em', textTransform:'uppercase', color: meta.glyphColor, fontWeight:500 }}>{meta.tag}</div>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:'clamp(42px,5vw,68px)', fontWeight:500,
            lineHeight:1.05, marginBottom:24,
            color:'rgba(255,255,255,.92)',
            whiteSpace:'pre-line',
          }}>{meta.headline}</h1>

          <p style={{
            fontSize:15, fontWeight:300,
            color:'rgba(180,200,255,.52)', lineHeight:1.75,
            maxWidth:340, whiteSpace:'pre-line',
          }}>{meta.sub}</p>

          {/* Progress dots */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:52 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{
                  width: i === step ? 28 : 6,
                  height: 6, borderRadius: 3,
                  background: i < step
                    ? 'rgba(91,143,255,.55)'
                    : i === step
                      ? meta.glyphColor
                      : 'rgba(91,143,255,.18)',
                  boxShadow: i === step ? `0 0 12px ${meta.glyphColor}88` : 'none',
                  transition: 'all .4s cubic-bezier(.4,0,.2,1)',
                }} />
                {i < STEPS.length - 1 && (
                  <div style={{ width:16, height:1, background:'rgba(91,143,255,.12)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Decorative dither-pixel art block */}
          <div style={{
            marginTop:48,
            display:'grid',
            gridTemplateColumns:'repeat(12, 8px)',
            gap:3,
            opacity:0.35,
          }}>
            {Array.from({ length: 48 }).map((_, i) => {
              const brightness = Math.sin(i * 0.7 + step) * 0.5 + 0.5;
              const colors = ['#5B8FFF','#9B5BFF','#5BFFE8','#FF9B5B'];
              const col = colors[i % colors.length];
              return (
                <div key={i} style={{
                  width:8, height:8, borderRadius:1,
                  background: col,
                  opacity: brightness * 0.8,
                }} />
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL — form ───────────────────────────────────────── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '60px 60px 60px 24px',
        }}>

          <div style={{
            position: 'relative',
            background: 'rgba(6,10,26,0.78)',
            border: '1px solid rgba(91,143,255,.16)',
            borderRadius: 28,
            backdropFilter: 'blur(32px)',
            boxShadow: '0 0 80px rgba(91,143,255,.06), inset 0 1px 0 rgba(255,255,255,.04)',
            overflow: 'hidden',
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? 'translateX(12px)' : 'translateX(0)',
            transition: 'opacity .26s ease, transform .26s ease',
          }}>
            {/* Top gradient accent line */}
            <div style={{
              height: 3,
              background: `linear-gradient(90deg, ${meta.glyphColor}, #9B5BFF, #5BFFE8)`,
              transition: 'background .5s ease',
            }} />

            <div style={{ padding: '44px 44px 40px' }}>

              {/* ── Step 0 — Name & Year ─────────────────────────────── */}
              {step === 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
                  <div>
                    <label style={{ fontSize:10, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(150,190,255,.55)', display:'block', marginBottom:10 }}>First name</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Parker"
                      onKeyDown={e => e.key === 'Enter' && canContinue && goNext()}
                      autoFocus
                      style={{
                        width:'100%', padding:'16px 20px', borderRadius:14,
                        background:'rgba(91,143,255,.06)',
                        border:`1px solid ${name ? 'rgba(91,143,255,.45)' : 'rgba(91,143,255,.20)'}`,
                        color:'#fff', fontSize:18, outline:'none',
                        fontFamily:"'DM Sans',sans-serif", letterSpacing:'.01em',
                        transition:'border-color .2s', boxSizing:'border-box',
                        boxShadow: name ? '0 0 24px rgba(91,143,255,.12)' : 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize:10, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(150,190,255,.55)', display:'block', marginBottom:10 }}>Year</label>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
                      {['Fr','So','Jr','Sr','Grad'].map((abbr, i) => {
                        const full = ['Freshman','Sophomore','Junior','Senior','Graduate'][i];
                        const active = year === full;
                        return (
                          <button key={full} onClick={() => setYear(full)} style={{
                            padding:'12px 8px', borderRadius:10,
                            background: active ? 'rgba(91,143,255,.28)' : 'rgba(91,143,255,.07)',
                            border: `1px solid ${active ? 'rgba(91,143,255,.60)' : 'rgba(91,143,255,.14)'}`,
                            color: active ? '#fff' : 'rgba(150,190,255,.60)',
                            fontSize:12, fontWeight: active ? 500 : 400,
                            cursor:'none', transition:'all .15s',
                            fontFamily:"'DM Sans',sans-serif",
                            boxShadow: active ? '0 0 16px rgba(91,143,255,.20)' : 'none',
                          }}>{abbr}</button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 1 — Memory ──────────────────────────────────── */}
              {step === 1 && (
                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  <div style={{ position:'relative' }}>
                    <textarea
                      value={memoryText}
                      onChange={e => setMemoryText(e.target.value)}
                      autoFocus
                      placeholder={'Paste your Claude or ChatGPT memory here...\n\nFrom Claude:\nSettings → Memory → copy text\n\nFrom ChatGPT:\nSettings → Personalization → Memory → copy'}
                      style={{
                        width:'100%', height:260, padding:'18px 20px',
                        borderRadius:16,
                        background:'rgba(91,143,255,.05)',
                        border:`1px solid ${memoryText ? 'rgba(91,143,255,.45)' : 'rgba(91,143,255,.18)'}`,
                        color:'rgba(210,225,255,.88)', fontSize:13, outline:'none',
                        fontFamily:"'Courier New',monospace", lineHeight:1.7,
                        resize:'vertical', cursor:'text',
                        transition:'border-color .2s, box-shadow .2s', boxSizing:'border-box',
                        boxShadow: memoryText ? '0 0 28px rgba(91,143,255,.10)' : 'none',
                      }}
                    />
                    {memoryText && (
                      <div style={{
                        position:'absolute', bottom:14, right:16,
                        fontSize:10, color:'rgba(91,255,150,.65)', letterSpacing:'.08em',
                        fontFamily:"'Courier New',monospace",
                      }}>
                        ✓ {memoryText.length.toLocaleString()} chars
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize:11, color:'rgba(150,180,255,.35)', textAlign:'center', letterSpacing:'.04em' }}>
                    No memory yet? Leave blank — demo profile will be used.
                  </p>
                </div>
              )}

              {/* ── Step 2 — Schedule ────────────────────────────────── */}
              {step === 2 && (
                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  <div style={{ position:'relative' }}>
                    <textarea
                      value={scheduleText}
                      onChange={e => setScheduleText(e.target.value)}
                      autoFocus
                      placeholder={'Paste your schedule here...\n\nExamples:\n  MWF 9:00–9:50am   CS 544 Lecture\n  TR  11:00–12:15pm MATH 321\n  Free: Mon 10am, Wed 2–5pm\n\nOr just copy-paste from your student portal.'}
                      style={{
                        width:'100%', height:260, padding:'18px 20px',
                        borderRadius:16,
                        background:'rgba(91,143,255,.05)',
                        border:`1px solid ${scheduleText ? 'rgba(91,255,200,.35)' : 'rgba(91,143,255,.18)'}`,
                        color:'rgba(210,225,255,.88)', fontSize:13, outline:'none',
                        fontFamily:"'Courier New',monospace", lineHeight:1.7,
                        resize:'vertical', cursor:'text',
                        transition:'border-color .2s, box-shadow .2s', boxSizing:'border-box',
                        boxShadow: scheduleText ? '0 0 28px rgba(91,255,200,.07)' : 'none',
                      }}
                    />
                    {scheduleText && (
                      <div style={{
                        position:'absolute', bottom:14, right:16,
                        fontSize:10, color:'rgba(91,255,200,.65)', letterSpacing:'.08em',
                        fontFamily:"'Courier New',monospace",
                      }}>
                        ✓ {scheduleText.length.toLocaleString()} chars
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize:11, color:'rgba(150,180,255,.35)', textAlign:'center', letterSpacing:'.04em' }}>
                    Skip this and we&apos;ll use a demo time overlap.
                  </p>
                </div>
              )}

              {/* ── Processing overlay ───────────────────────────────── */}
              {processing && (
                <div style={{
                  position:'absolute', inset:0,
                  background:'rgba(4,6,18,.95)',
                  display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center', gap:20,
                  borderRadius:28,
                }}>
                  <div style={{
                    fontSize:44, animation:'spinSlow 2s linear infinite',
                    color:'#5B8FFF',
                    filter:'drop-shadow(0 0 16px #5B8FFF)',
                  }}>◈</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:'rgba(255,255,255,.92)', textAlign:'center' }}>
                    Building your mind map...
                  </div>
                  <div style={{ fontSize:12, color:'rgba(150,190,255,.50)', letterSpacing:'.10em', textTransform:'uppercase' }}>
                    claude is reading your memory
                  </div>
                  {/* Dither-style loading bar */}
                  <div style={{
                    width:200, height:4, borderRadius:2,
                    background:'rgba(91,143,255,.12)',
                    overflow:'hidden', marginTop:8,
                  }}>
                    <div style={{
                      height:'100%', borderRadius:2,
                      background:'linear-gradient(90deg,#5B8FFF,#9B5BFF,#5BFFE8)',
                      animation:'loadBar 2.4s ease-in-out forwards',
                    }} />
                  </div>
                </div>
              )}
            </div>

            {/* ── Footer CTA (inside card) ─────────────────────────── */}
            {!processing && (
              <div style={{
                padding:'0 44px 36px',
                display:'flex', gap:12, alignItems:'center', justifyContent:'space-between',
              }}>
                <div>
                  {step > 0 && (
                    <button onClick={goBack} style={{
                      padding:'12px 22px', borderRadius:100,
                      border:'1px solid rgba(91,143,255,.20)',
                      background:'transparent', color:'rgba(150,190,255,.60)',
                      fontSize:13, cursor:'none', fontFamily:"'DM Sans',sans-serif",
                      letterSpacing:'.04em',
                    }}>← back</button>
                  )}
                </div>
                <button
                  onClick={goNext}
                  disabled={!canContinue}
                  style={{
                    padding:'14px 40px', borderRadius:100,
                    background: canContinue
                      ? `linear-gradient(135deg, ${meta.glyphColor}, #9B5BFF)`
                      : 'rgba(91,143,255,.15)',
                    border: 'none',
                    color: canContinue ? '#fff' : 'rgba(150,190,255,.35)',
                    fontSize:14, fontWeight:500,
                    cursor: canContinue ? 'none' : 'default',
                    fontFamily:"'DM Sans',sans-serif",
                    transition:'all .25s',
                    display:'flex', alignItems:'center', gap:8,
                    boxShadow: canContinue ? `0 8px 32px ${meta.glyphColor}44` : 'none',
                    letterSpacing:'.02em',
                  }}
                >
                  {step === 2 ? 'Build my mind map' : 'Continue'}
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M1 7h12M8 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading bar keyframes */}
      <style>{`
        @keyframes loadBar {
          0%   { width: 0%; }
          40%  { width: 55%; }
          80%  { width: 82%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
