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
          Ready to find your<br /><em>intellectual match?</em>
        </h2>
        <p className="section-body reveal reveal-d2" style={{ color: 'rgba(200,210,255,.50)', textAlign: 'center', margin: '0 auto 44px' }}>
          Export your Claude or ChatGPT memory file and upload it. Claude does the rest —
          no forms, no questionnaires. Just your conversations, and the people they point to.
        </p>

        {/* Upload UI mockup */}
        <div className="reveal reveal-d3" style={{
          border: '1px dashed rgba(91,143,255,.35)',
          borderRadius: 16, padding: '32px 24px',
          marginBottom: 32, cursor: 'default',
          background: 'rgba(91,143,255,.04)',
          transition: 'border-color .2s, background .2s',
        }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>⬡</div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18, color: 'rgba(255,255,255,.80)',
            marginBottom: 8,
          }}>Drop your memory.md here</div>
          <div style={{ fontSize: 13, color: 'rgba(200,210,255,.40)' }}>
            or click to browse — supports .md, .txt, .json
          </div>
        </div>

        <div className="reveal reveal-d4" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#" className="btn-primary" style={{ background: 'var(--blue)' }}>
            Upload memory file
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M8 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#philosophy" className="btn-ghost">How it works</a>
        </div>

        <p style={{ fontSize: 11, color: 'rgba(200,210,255,.28)', marginTop: 24, letterSpacing: '.04em' }}>
          Your file is never stored on our servers. All analysis happens in-session via the Claude API.
        </p>
      </div>
    </section>
  );
}
