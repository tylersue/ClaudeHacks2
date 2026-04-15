'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const DAYS = ['Mon','Tue','Wed','Thu','Fri'];
const TIMES = ['8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm'];

const bg: React.CSSProperties = {
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at 20% 30%, rgba(91,143,255,0.07) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(155,91,255,0.05) 0%, transparent 50%), linear-gradient(180deg,#060A1A 0%,#07101F 100%)',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  padding: '60px 24px', fontFamily: "'DM Sans', sans-serif",
  cursor: 'default',
};

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [year, setYear] = useState('Junior');
  const [memoryText, setMemoryText] = useState('');
  const [freeSlots, setFreeSlots] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);

  const toggleSlot = (slot: string) => {
    setFreeSlots(prev => {
      const next = new Set(prev);
      next.has(slot) ? next.delete(slot) : next.add(slot);
      return next;
    });
  };

  const next = () => {
    if (step === 2) {
      setProcessing(true);
      localStorage.setItem('mac_name', name || 'You');
      localStorage.setItem('mac_year', year);
      localStorage.setItem('mac_memory', memoryText);
      setTimeout(() => router.push('/mindmap'), 2200);
    } else {
      setStep(s => s + 1);
    }
  };

  const canContinue = step === 0 ? name.trim().length > 0
    : step === 1 ? true  // memory file optional for demo
    : freeSlots.size > 0;

  return (
    <div style={bg}>
      {/* Back to landing */}
      <a href="/" style={{
        position:'fixed', top:24, left:32, fontSize:13, color:'rgba(150,190,255,0.55)',
        textDecoration:'none', letterSpacing:'.04em', display:'flex', alignItems:'center', gap:6,
      }}>
        ← Back
      </a>

      {/* Logo */}
      <div style={{ position:'fixed', top:24, left:'50%', transform:'translateX(-50%)', display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:22,height:22,borderRadius:'50%',background:'linear-gradient(135deg,#5B8FFF,#9B5BFF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11 }}>◈</div>
        <span style={{ fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:500,color:'rgba(255,255,255,.70)' }}>Madison <em style={{fontStyle:'italic',color:'#5B8FFF'}}>AI Connect</em></span>
      </div>

      {/* Step indicator */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:48 }}>
        {['Your Info','Memory File','Schedule'].map((label, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{
              width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:12, fontWeight:500,
              background: i <= step ? 'var(--blue)' : 'rgba(91,143,255,.12)',
              border: `1px solid ${i <= step ? 'var(--blue)' : 'rgba(91,143,255,.25)'}`,
              color: i <= step ? '#fff' : 'rgba(150,190,255,.50)',
              transition: 'all .3s',
            }}>{i+1}</div>
            <span style={{ fontSize:12, color: i === step ? 'rgba(200,220,255,.85)' : 'rgba(150,180,255,.40)', letterSpacing:'.04em' }}>{label}</span>
            {i < 2 && <div style={{ width:28, height:1, background:'rgba(91,143,255,.20)', margin:'0 4px' }} />}
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{
        width:'100%', maxWidth:520,
        background:'rgba(8,12,32,0.80)',
        border:'1px solid rgba(91,143,255,.15)',
        borderRadius:24, padding:'48px 44px',
        backdropFilter:'blur(20px)',
      }}>

        {/* Step 0 — Name & Year */}
        {step === 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
            <div>
              <span style={{ fontSize:10, letterSpacing:'.20em', textTransform:'uppercase', color:'var(--blue)', display:'block', marginBottom:14 }}>Step 01 / 03</span>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,4vw,40px)', fontWeight:500, color:'#fff', lineHeight:1.1, marginBottom:12 }}>
                Who are you?
              </h1>
              <p style={{ fontSize:14, fontWeight:300, color:'rgba(180,200,255,.50)', lineHeight:1.7 }}>
                Just your name and year. No account, no login — this is a hackathon.
              </p>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ fontSize:11, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(150,190,255,.60)', display:'block', marginBottom:8 }}>Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your first name"
                  onKeyDown={e => e.key === 'Enter' && canContinue && next()}
                  style={{
                    width:'100%', padding:'14px 18px', borderRadius:12,
                    background:'rgba(91,143,255,.06)',
                    border:'1px solid rgba(91,143,255,.22)',
                    color:'#fff', fontSize:16, outline:'none',
                    fontFamily:"'DM Sans',sans-serif",
                    transition:'border-color .2s',
                    cursor:'text',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize:11, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(150,190,255,.60)', display:'block', marginBottom:8 }}>Year</label>
                <select
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  style={{
                    width:'100%', padding:'14px 18px', borderRadius:12,
                    background:'rgba(91,143,255,.06)',
                    border:'1px solid rgba(91,143,255,.22)',
                    color:'#fff', fontSize:15, outline:'none',
                    fontFamily:"'DM Sans',sans-serif", cursor:'pointer',
                    appearance:'none',
                  }}
                >
                  {['Freshman','Sophomore','Junior','Senior','Graduate'].map(y => (
                    <option key={y} value={y} style={{ background:'#0A0F2C' }}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 1 — Memory File */}
        {step === 1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
            <div>
              <span style={{ fontSize:10, letterSpacing:'.20em', textTransform:'uppercase', color:'var(--blue)', display:'block', marginBottom:14 }}>Step 02 / 03</span>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,4vw,40px)', fontWeight:500, color:'#fff', lineHeight:1.1, marginBottom:12 }}>
                Your AI memory.
              </h1>
              <p style={{ fontSize:14, fontWeight:300, color:'rgba(180,200,255,.50)', lineHeight:1.7 }}>
                Export your memory file from Claude or ChatGPT. This is what we use to build your mind map — the questions you&apos;ve asked, the ideas you&apos;ve explored.
              </p>
            </div>

            <div style={{ position:'relative' }}>
              <textarea
                value={memoryText}
                onChange={e => setMemoryText(e.target.value)}
                placeholder={'Paste your Claude or ChatGPT memory here...\n\nFrom Claude: Settings → Memory → copy the text\nFrom ChatGPT: Settings → Personalization → Memory → copy'}
                style={{
                  width:'100%', height:240, padding:'16px 18px', borderRadius:16,
                  background:'rgba(91,143,255,.05)',
                  border:`1px solid ${memoryText ? 'rgba(91,143,255,.40)' : 'rgba(91,143,255,.22)'}`,
                  color:'rgba(200,220,255,.85)', fontSize:13, outline:'none',
                  fontFamily:"'Courier New',monospace", lineHeight:1.65,
                  resize:'vertical', cursor:'text',
                  transition:'border-color .2s',
                }}
              />
              {memoryText && (
                <div style={{
                  position:'absolute', bottom:12, right:14,
                  fontSize:10, color:'rgba(150,220,150,.70)', letterSpacing:'.06em',
                }}>
                  {memoryText.length.toLocaleString()} chars · ready
                </div>
              )}
            </div>

            <p style={{ fontSize:12, color:'rgba(150,180,255,.38)', textAlign:'center' }}>
              No memory yet? Leave it blank — we&apos;ll use a demo profile for today.
            </p>
          </div>
        )}

        {/* Step 2 — Schedule */}
        {step === 2 && (
          <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
            <div>
              <span style={{ fontSize:10, letterSpacing:'.20em', textTransform:'uppercase', color:'var(--blue)', display:'block', marginBottom:14 }}>Step 03 / 03</span>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,4vw,40px)', fontWeight:500, color:'#fff', lineHeight:1.1, marginBottom:12 }}>
                When are you free?
              </h1>
              <p style={{ fontSize:14, fontWeight:300, color:'rgba(180,200,255,.50)', lineHeight:1.7 }}>
                Tap the blocks when you&apos;re free. We&apos;ll find times that work for both of you.
              </p>
            </div>

            {/* Schedule grid */}
            <div style={{ overflowX:'auto' }}>
              <table style={{ borderCollapse:'collapse', width:'100%', fontSize:11 }}>
                <thead>
                  <tr>
                    <td style={{ width:36 }} />
                    {DAYS.map(d => (
                      <td key={d} style={{ textAlign:'center', padding:'0 4px 8px', color:'rgba(150,190,255,.60)', letterSpacing:'.08em', fontSize:10, textTransform:'uppercase' }}>{d}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIMES.map(time => (
                    <tr key={time}>
                      <td style={{ fontSize:9, color:'rgba(150,180,255,.40)', paddingRight:6, whiteSpace:'nowrap' }}>{time}</td>
                      {DAYS.map(day => {
                        const slot = `${day}-${time}`;
                        const active = freeSlots.has(slot);
                        return (
                          <td key={day} style={{ padding:'2px 3px' }}>
                            <div
                              onClick={() => toggleSlot(slot)}
                              style={{
                                height:22, borderRadius:4, cursor:'pointer',
                                background: active ? 'rgba(91,143,255,.45)' : 'rgba(91,143,255,.06)',
                                border: `1px solid ${active ? 'rgba(91,143,255,.70)' : 'rgba(91,143,255,.12)'}`,
                                transition:'all .12s',
                                boxShadow: active ? '0 0 8px rgba(91,143,255,.30)' : 'none',
                              }}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize:11, color:'rgba(150,180,255,.40)', textAlign:'center' }}>
              {freeSlots.size > 0 ? `${freeSlots.size} free blocks selected` : 'Tap blocks to mark free time'}
            </p>
          </div>
        )}

        {/* Processing state */}
        {processing && (
          <div style={{
            position:'absolute', inset:0, borderRadius:24,
            background:'rgba(6,10,26,.95)', display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', gap:20,
          }}>
            <div style={{ fontSize:32, animation:'spinSlow 2s linear infinite' }}>◈</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:'rgba(255,255,255,.90)' }}>
              Building your mind map...
            </div>
            <div style={{ fontSize:13, color:'rgba(150,190,255,.55)' }}>Claude is reading your interests</div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {!processing && (
        <div style={{ marginTop:28, display:'flex', gap:12, alignItems:'center' }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s-1)} style={{
              padding:'13px 24px', borderRadius:100,
              border:'1px solid rgba(91,143,255,.25)',
              background:'transparent', color:'rgba(150,190,255,.70)',
              fontSize:14, cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
            }}>← Back</button>
          )}
          <button
            onClick={next}
            disabled={!canContinue}
            style={{
              padding:'13px 36px', borderRadius:100,
              background: canContinue ? 'var(--blue)' : 'rgba(91,143,255,.20)',
              border:'none', color: canContinue ? '#fff' : 'rgba(150,190,255,.40)',
              fontSize:14, fontWeight:500, cursor: canContinue ? 'pointer' : 'default',
              fontFamily:"'DM Sans',sans-serif",
              transition:'all .2s',
              display:'flex', alignItems:'center', gap:8,
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
  );
}
