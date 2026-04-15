'use client';
import { useEffect, useRef } from 'react';

const stats = [
  { number: '2,400+', label: 'Students matched across\nshared AI interests' },
  { number: '140+',   label: 'Distinct interest clusters\ndiscovered by Claude'  },
  { number: '< 48h',  label: 'Average time from upload\nto your first connection' },
];

export default function Stats() {
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
    <section ref={ref} style={{
      padding: '80px 48px', background: 'var(--charcoal)',
      borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 48, textAlign: 'center' }}>
        {stats.map((s, i) => (
          <div key={s.number} className={`reveal reveal-d${i + 1}`}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(40px,6vw,64px)', fontWeight: 500,
              color: 'var(--blue)', lineHeight: 1, marginBottom: 8,
            }}>
              {s.number}
            </div>
            <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--muted)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
