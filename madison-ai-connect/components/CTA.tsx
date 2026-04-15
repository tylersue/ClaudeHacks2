'use client';
import { useEffect, useRef } from 'react';

export default function CTA() {
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
    <section ref={ref} id="cta" style={{
      padding: '120px 48px', textAlign: 'center',
      background: 'transparent', position: 'relative',
    }}>
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(4, 8, 30, 0.60)',
        borderRadius: 24, padding: '64px 48px',
        maxWidth: 700, margin: '0 auto',
      }}>
        <span className="section-label reveal">Get started</span>
        <h2 className="section-title reveal reveal-d1" style={{ color: 'rgba(255,255,255,.92)', maxWidth: 560, margin: '0 auto 20px' }}>
          Three steps to your<br /><em>intellectual match.</em>
        </h2>
        <p className="section-body reveal reveal-d2" style={{ color: 'rgba(200,210,255,.50)', textAlign: 'center', margin: '0 auto 44px' }}>
          Tell us who you are. Upload your memory file. Share your schedule.
          Claude does the rest — building your mind map and finding who belongs in it.
        </p>

        {/* Step pills */}
        <div className="reveal reveal-d3" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
          {[
            { n: '01', label: 'Your Info' },
            { n: '02', label: 'Memory File' },
            { n: '03', label: 'Schedule' },
          ].map(s => (
            <div key={s.n} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 20px', borderRadius: 100,
              border: '1px solid rgba(91,143,255,.25)',
              background: 'rgba(91,143,255,.06)',
            }}>
              <span style={{ fontFamily:"'Courier New',monospace", fontSize:10, color:'var(--blue)', letterSpacing:'.1em' }}>{s.n}</span>
              <span style={{ fontSize: 14, color: 'rgba(200,220,255,.80)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="reveal reveal-d4" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/onboard" className="btn-primary" style={{ background: 'var(--blue)' }}>
            Start mapping
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M8 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#philosophy" className="btn-ghost">Why AI memory?</a>
        </div>

        <p style={{ fontSize: 11, color: 'rgba(200,210,255,.28)', marginTop: 24, letterSpacing: '.04em' }}>
          Your file is never stored on our servers. All analysis happens in-session via the Claude API.
        </p>
      </div>
    </section>
  );
}
