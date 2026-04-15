'use client';
import { useEffect, useRef } from 'react';

export default function Philosophy() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    ref.current?.querySelectorAll('.reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="philosophy" style={{ background: 'transparent', padding: '120px 48px', position: 'relative' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96,
          alignItems: 'center', maxWidth: 1280, margin: '0 auto',
          background: 'rgba(4, 8, 30, 0.60)',
          borderRadius: 24, padding: '64px 56px',
        }}>
          {/* Network visual */}
          <div className="reveal" style={{ position: 'relative', height: 420 }}>
            {/* Orbiting rings */}
            {[
              { size: 320, dur: '28s', dir: 'normal'  as const, color: 'rgba(255,255,255,.06)' },
              { size: 210, dur: '18s', dir: 'reverse' as const, color: 'rgba(91,143,255,.22)',  dashed: true },
              { size: 110, dur: '11s', dir: 'normal'  as const, color: 'rgba(155,91,255,.40)' },
            ].map((ring, i) => (
              <div key={i} style={{
                position: 'absolute', top: '50%', left: '50%',
                width: ring.size, height: ring.size,
                marginLeft: -ring.size / 2, marginTop: -ring.size / 2,
                borderRadius: '50%', border: `1px ${ring.dashed ? 'dashed' : 'solid'} ${ring.color}`,
                animation: `spinSlow ${ring.dur} linear ${ring.dir} infinite`,
              }} />
            ))}

            {/* Orbiting nodes */}
            {[
              { offset: 0,    r: 155, size: 10, color: '#5B8FFF' },
              { offset: 2.1,  r: 155, size: 8,  color: '#9B5BFF' },
              { offset: 4.0,  r: 155, size: 12, color: '#5BFFE8' },
              { offset: 1.1,  r: 100, size: 7,  color: '#FF9B5B' },
              { offset: 3.4,  r: 100, size: 9,  color: '#5B8FFF' },
            ].map((node, i) => (
              <div key={i} style={{
                position: 'absolute', top: '50%', left: '50%',
                width: node.size, height: node.size,
                marginLeft: -node.size/2, marginTop: -node.size/2,
                borderRadius: '50%',
                background: node.color,
                boxShadow: `0 0 12px ${node.color}`,
                transformOrigin: `${-node.r}px 0`,
                animation: `spinSlow ${18 + i * 4}s linear ${i % 2 === 0 ? 'normal' : 'reverse'} infinite`,
                transform: `rotate(${node.offset}rad) translateX(${node.r}px)`,
              }} />
            ))}

            {/* Center node */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 56, height: 56,
              background: 'rgba(91,143,255,.15)',
              border: '1px solid var(--blue)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: 'var(--blue)',
              animation: 'pulseGlow 3s ease-in-out infinite',
            }}>◈</div>
          </div>

          {/* Text */}
          <div className="reveal reveal-d1" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <span className="section-label">Why AI Memory</span>
            <blockquote style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(20px, 2.8vw, 30px)', fontStyle: 'italic',
              lineHeight: 1.5, color: 'rgba(255,255,255,.88)',
              borderLeft: '2px solid var(--blue)', paddingLeft: 24, margin: 0,
            }}>
              &ldquo;The conversations you have with AI are the conversations you&apos;re afraid
              to have out loud. That unfiltered curiosity is the truest signal of who you are.&rdquo;
            </blockquote>
            <p className="section-body" style={{ color: 'rgba(200,210,255,.55)' }}>
              Résumés show what you&apos;ve accomplished. Profiles show what you want others to see.
              Your AI memory shows what you actually think about at 2am — the problems that won&apos;t
              let you sleep, the ideas you&apos;re scared to say out loud yet.
            </p>
            <p className="section-body" style={{ color: 'rgba(200,210,255,.55)' }}>
              That&apos;s the signal we use. And Claude is the only model sophisticated enough to read it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
