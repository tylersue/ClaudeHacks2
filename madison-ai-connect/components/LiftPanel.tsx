'use client';
import { useEffect, useRef } from 'react';

const pills = [
  { icon: '⟡', label: 'Privacy-first design' },
  { icon: '◈', label: 'Claude-powered matching' },
  { icon: '⬡', label: 'UW Madison students' },
  { icon: '◉', label: 'Real conversations' },
  { icon: '⟐', label: 'Interest-based connections' },
];

export default function LiftPanel() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    ref.current?.querySelectorAll('.reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      position: 'relative', zIndex: 10,
      background: 'var(--charcoal)',
      borderRadius: '40px 40px 0 0',
      marginTop: -48, padding: '80px 48px 96px',
      borderTop: '1px solid var(--border)',
    }}>
      {/* Pills */}
      <div className="reveal" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 80 }}>
        {pills.map(p => (
          <div key={p.label} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 22px', borderRadius: 100,
            border: '1px solid var(--border)', background: 'rgba(91,143,255,.05)',
            fontSize: 14, color: 'rgba(18,20,30,.72)',
            transition: 'border-color .2s, background .2s', cursor: 'default',
          }}>
            <span style={{ fontSize: 16, color: 'var(--blue)' }}>{p.icon}</span>
            {p.label}
          </div>
        ))}
      </div>

      {/* Headline */}
      <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
        <span className="section-label reveal">What we do</span>
        <h2 className="section-title reveal reveal-d1">
          Your AI conversations<br />hold the key to <em>who you are.</em>
        </h2>
        <p className="section-body reveal reveal-d2" style={{ margin: '20px auto 0' }}>
          Every question you've asked an AI, every rabbit hole you've explored, every idea you've
          sketched out — your memory file is a fingerprint of your intellectual identity.
          Madison AI Connect uses it to find the students who think like you.
        </p>
      </div>
    </div>
  );
}
