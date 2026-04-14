'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';

const NetworkScene = dynamic(() => import('./NetworkScene'), { ssr: false });

export default function Hero() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current!;
    const ring   = ringRef.current!;
    let cx = 0, cy = 0, rx = 0, ry = 0;
    const onMove = (e: MouseEvent) => {
      cx = e.clientX; cy = e.clientY;
      cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
    };
    document.addEventListener('mousemove', onMove);
    let rafId: number;
    const loop = () => {
      rx += (cx - rx) * 0.12; ry += (cy - ry) * 0.12;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      rafId = requestAnimationFrame(loop);
    };
    loop();
    return () => { document.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafId); };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="cursor" />
      <div ref={ringRef}   className="cursor-ring" />

      <section style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        background: '#060A1A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>

        {/* Network scene — full background */}
        <NetworkScene />

        {/* Radial scrim behind hero text */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 52% 60% at 50% 46%, rgba(4,6,20,0.80) 0%, rgba(4,6,20,0.36) 52%, transparent 100%)',
        }} />

        {/* Bottom fade → white */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, transparent 70%, #ffffff 100%)',
        }} />

        {/* Edge vignette */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 115% 115% at 50% 50%, transparent 38%, rgba(4,6,20,0.90) 100%)',
        }} />

        {/* Hero copy */}
        <div style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center',
          padding: '120px 24px 100px',
          maxWidth: 620,
        }}>

          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            fontSize: 10, fontWeight: 500, letterSpacing: '.24em',
            textTransform: 'uppercase', color: 'rgba(150,190,255,0.50)',
            marginBottom: 28,
            opacity: 0, animation: 'fadeUp .8s .15s forwards',
          }}>
            <span style={{ width: 28, height: 1, background: 'rgba(91,143,255,0.30)', flexShrink: 0 }} />
            AI-powered student connections
            <span style={{ width: 28, height: 1, background: 'rgba(91,143,255,0.30)', flexShrink: 0 }} />
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(52px, 6.5vw, 96px)',
            fontWeight: 500, lineHeight: 1.03, letterSpacing: '-.032em',
            color: '#FFFFFF', margin: '0 0 22px',
            opacity: 0, animation: 'fadeUp .9s .35s forwards',
          }}>
            Madison<br />
            <em style={{ fontStyle: 'italic', color: '#5B8FFF' }}>AI Connect.</em>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 17, fontWeight: 300, lineHeight: 1.80,
            color: 'rgba(180,200,255,0.50)', maxWidth: 400, margin: '0 0 44px',
            opacity: 0, animation: 'fadeUp .9s .55s forwards',
          }}>
            Upload your AI memory file. Find the students who think exactly like you — powered by Claude.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex', gap: 12, flexWrap: 'wrap',
            justifyContent: 'center', marginBottom: 64,
            opacity: 0, animation: 'fadeUp .9s .75s forwards',
          }}>
            <a href="#cta" className="btn-primary">
              Upload your memory
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h12M8 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="#features" className="btn-ghost">How it works</a>
          </div>

          {/* Trust stats */}
          <div style={{
            display: 'flex', gap: 44, justifyContent: 'center',
            opacity: 0, animation: 'fadeUp .9s .95s forwards',
          }}>
            {[
              { val: '2,400+', label: 'Matched'    },
              { val: 'Claude', label: 'Powered by'  },
              { val: 'UW',     label: 'Madison'     },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 21, fontWeight: 500,
                  color: '#FFFFFF', lineHeight: 1,
                }}>{s.val}</div>
                <div style={{
                  fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase',
                  color: 'rgba(150,190,255,0.35)', marginTop: 6,
                }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          opacity: 0, animation: 'fadeIn 1s 1.3s forwards',
        }}>
          <div style={{
            width: 1, height: 40,
            background: 'linear-gradient(to bottom, rgba(91,143,255,0.6), transparent)',
            animation: 'scrollPulse 2s 1.3s infinite',
          }} />
          <span style={{ fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(150,190,255,0.28)' }}>
            Scroll
          </span>
        </div>
      </section>
    </>
  );
}
