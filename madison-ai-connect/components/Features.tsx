'use client';
import { useEffect, useRef } from 'react';

const features = [
  {
    tag: 'Step 01', name: 'Upload Your Memory', sci: 'Claude · ChatGPT · Any AI',
    desc: 'Export your memory file from Claude or ChatGPT — a plain-text record of everything you\'ve asked, explored, and built in conversation with AI. No prompts required. Just your file.',
    benefits: ['Works with Claude memory exports', 'ChatGPT data export supported', 'Completely private — parsed locally', 'No conversation content stored'],
  },
  {
    tag: 'Step 02', name: 'Interests Discovered', sci: 'Semantic Clustering · NLP',
    desc: 'Claude reads your memory file and surfaces the intellectual threads that define you — not just topics, but the specific way you think about them. Your curiosity, mapped.',
    benefits: ['Deep semantic interest analysis', 'Passion vs. casual topic separation', 'Cross-domain connection detection', 'Interest intensity scoring'],
  },
  {
    tag: 'Step 03', name: 'Find Your Match', sci: 'Claude API · Compatibility Engine',
    desc: 'Claude compares your intellectual fingerprint against every other student on the platform — finding people who don\'t just share interests, but who think in complementary ways.',
    benefits: ['Multi-dimensional compatibility', 'Complementary thinking detection', 'Intellectual stretch matching', 'Project collaboration potential'],
  },
  {
    tag: 'Step 04', name: 'Start Connecting', sci: 'Real Introductions · Real Conversations',
    desc: 'You get a curated shortlist with a plain-language explanation of why Claude thinks you\'d click. From there, it\'s just two curious people finding out if Claude was right.',
    benefits: ['Warm AI-crafted introductions', 'Shared interest conversation starters', 'No cold messaging required', 'Opt-in, low-pressure matching'],
  },
];

export default function Features() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll('.reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="features" style={{ padding: '96px 48px', background: 'var(--charcoal)' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56, gap: 32, flexWrap: 'wrap' }}>
          <div>
            <span className="section-label reveal">How it works</span>
            <h2 className="section-title reveal reveal-d1">Four steps to<br />your next <em>great conversation.</em></h2>
          </div>
          <p className="section-body reveal reveal-d2" style={{ maxWidth: 380 }}>
            From file upload to first connection — the whole process takes minutes. The depth of what it surfaces takes years to fully explore.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {features.map((f, i) => (
            <div key={f.name} className={`reveal reveal-d${i + 1}`} style={{
              position: 'relative', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 24,
              padding: '36px 32px 32px', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              transition: 'border-color .3s, transform .3s, box-shadow .3s',
            }}>
              <span style={{
                display: 'inline-block', fontSize: 10, fontWeight: 500,
                letterSpacing: '.16em', textTransform: 'uppercase',
                color: 'var(--blue)', background: 'var(--blue-dim)',
                border: '1px solid rgba(91,143,255,.25)',
                padding: '4px 10px', borderRadius: 100, marginBottom: 24, alignSelf: 'flex-start',
              }}>{f.tag}</span>

              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 500, color: 'var(--cream)', lineHeight: 1.15, marginBottom: 4 }}>{f.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '.06em', marginBottom: 20 }}>{f.sci}</div>
              <div style={{ width: 32, height: 1, background: 'var(--blue)', marginBottom: 20, opacity: .5 }} />
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(18,20,30,.60)', flex: 1, marginBottom: 28 }}>{f.desc}</p>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
                {f.benefits.map(b => (
                  <li key={b} style={{ fontSize: 13, color: 'rgba(18,20,30,.65)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'block', width: 4, height: 4, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0 }} />
                    {b}
                  </li>
                ))}
              </ul>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, borderTop: '1px solid rgba(91,143,255,.12)' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, color: 'var(--cream)' }}>
                  Free to join <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 300, color: 'var(--muted)' }}>/ students only</span>
                </div>
                <a href="#cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--blue)', textDecoration: 'none' }}>
                  Get started
                  <span style={{ width: 18, height: 18, border: '1px solid var(--blue)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
