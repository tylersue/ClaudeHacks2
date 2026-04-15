export default function Footer() {
  return (
    <>
      <footer style={{
        padding: '48px', borderTop: '1px solid var(--border)',
        background: 'var(--charcoal)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #5B8FFF, #9B5BFF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, flexShrink: 0,
          }}>◈</div>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 16, fontWeight: 500, color: 'var(--cream)',
          }}>Madison <em style={{ fontStyle: 'italic', color: 'var(--blue)' }}>AI Connect</em></span>
        </div>

        <ul style={{ display: 'flex', gap: 32, listStyle: 'none' }}>
          {['How It Works', 'Privacy', 'FAQ', 'Contact'].map(l => (
            <li key={l}><a href="#" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>{l}</a></li>
          ))}
        </ul>
        <span style={{ fontSize: 12, color: 'rgba(18,20,30,.38)' }}>© 2025 Madison AI Connect</span>
      </footer>

      <div style={{ padding: '20px 48px', background: 'var(--black)', borderTop: '1px solid rgba(91,143,255,.06)', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', lineHeight: 1.6, maxWidth: 800, margin: '0 auto' }}>
          Built at ClaudeHacks 2025 · Powered by the Claude API · For University of Wisconsin–Madison students.
          Your AI memory data is processed in-session and never persisted.
        </p>
      </div>
    </>
  );
}
