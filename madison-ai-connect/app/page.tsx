import Nav       from '@/components/Nav';
import Hero      from '@/components/Hero';
import LiftPanel from '@/components/LiftPanel';
import Features  from '@/components/Features';
import Stats     from '@/components/Stats';
import Philosophy from '@/components/Philosophy';
import CTA       from '@/components/CTA';
import Footer    from '@/components/Footer';
import DitherBg  from '@/components/DitherBg';

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <LiftPanel />
      <Features />
      <Stats />

      {/* Single continuous dither background spans Philosophy + CTA */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <DitherBg />
        <Philosophy />
        <CTA />
      </div>

      <Footer />
    </main>
  );
}
