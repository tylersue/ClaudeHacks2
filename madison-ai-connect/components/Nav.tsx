'use client';
import { useEffect, useState } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '24px 48px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(6,10,26,.94)' : 'linear-gradient(to bottom, rgba(6,10,26,.88), transparent)',
      backdropFilter: scrolled ? 'blur(16px)' : undefined,
      borderBottom: scrolled ? '1px solid rgba(91,143,255,.12)' : undefined,
      transition: 'background .4s, backdrop-filter .4s, border-bottom .4s',
    }}>
      <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #5B8FFF, #9B5BFF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0,
        }}>◈</div>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 18, fontWeight: 500,
          color: '#ffffff', letterSpacing: '-.01em',
        }}>
          Madison <em style={{ fontStyle: 'italic', color: '#5B8FFF' }}>AI Connect</em>
        </span>
      </a>

      <ul style={{ display: 'flex', alignItems: 'center', gap: 40, listStyle: 'none' }} className="hide-mobile">
        <li><a href="#features"   style={linkStyle}>How It Works</a></li>
        <li><a href="#philosophy" style={linkStyle}>Why AI Memory</a></li>
        <li>
          <a href="#cta" style={{
            ...linkStyle,
            background: 'var(--blue)', color: '#ffffff',
            fontWeight: 500, padding: '10px 22px', borderRadius: 100,
            transition: 'background .2s, transform .2s, box-shadow .2s',
          }}>
            Get Started
          </a>
        </li>
      </ul>
    </nav>
  );
}

const linkStyle: React.CSSProperties = {
  color: 'rgba(200,210,255,.7)', textDecoration: 'none',
  fontSize: 14, fontWeight: 400, letterSpacing: '.04em',
  transition: 'color .2s',
};
