'use client';
import { useEffect, useRef } from 'react';

export type MindNode = {
  id: string;
  label: string;
  color: string;
  shared?: boolean;
  tier?: 1 | 2;       // 1 = inner ring, 2 = outer ring (default 1)
};
export type EdgeDef = [string, string];

type Props = {
  name: string;
  nodes: MindNode[];
  edges?: EdgeDef[];
  height?: number;
  compact?: boolean;
  accentColor?: string;
  fill?: boolean;     // fill container instead of fixed height
};

// ── helpers ──────────────────────────────────────────────────────────────────
function hex2rgba(hex: string, a: number) {
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}
function bezierPt(x0:number,y0:number,x1:number,y1:number,x2:number,y2:number,t:number){
  const u=1-t; return {x:u*u*x0+2*u*t*x1+t*t*x2, y:u*u*y0+2*u*t*y1+t*t*y2};
}
function easeOutCubic(t:number){ return 1-Math.pow(1-t,3); }
function clamp(v:number,lo:number,hi:number){ return Math.max(lo,Math.min(hi,v)); }

export default function MindMapViz({
  name, nodes, edges=[], height=580, compact=false, accentColor='#5B8FFF', fill=false,
}: Props) {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap   = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;
    const dpr    = window.devicePixelRatio || 1;

    const getSize = () => ({
      W: wrap.clientWidth,
      H: fill ? wrap.clientHeight : height,
    });

    const setup = () => {
      const { W, H } = getSize();
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { W, H };
    };

    let { W, H } = setup();
    let cx = W/2, cy = H/2;
    const INNER_R = () => Math.min(W,H) * (compact ? 0.22 : 0.26);
    const OUTER_R = () => Math.min(W,H) * (compact ? 0.38 : 0.43);
    const CENTER_R = compact ? 26 : 38;
    const LABEL_PAD = 16;

    // ── Star field ─────────────────────────────────────────────────────────
    const makeStars = (w:number, h:number) =>
      Array.from({ length: 220 }, () => ({
        x: Math.random()*w, y: Math.random()*h,
        r: Math.random()*0.9+0.15,
        base: Math.random()*0.28+0.04,
        phase: Math.random()*Math.PI*2,
        speed: Math.random()*0.6+0.2,
      }));
    let stars = makeStars(W, H);

    // ── Node layout ──────────────────────────────────────────────────────────
    const inner = nodes.filter(n => (n.tier||1) === 1);
    const outer = nodes.filter(n => (n.tier||1) === 2);

    const layoutInner = inner.map((n, i) => ({
      ...n,
      baseAngle: (i/inner.length)*Math.PI*2 - Math.PI/2,
      ring: 1,
      phase: (i*1.618)%(Math.PI*2),
      floatAmp: compact ? 4 : 8,
      sparkT: Math.random(),
      sparkSpd: 0.0045+Math.random()*0.003,
      revealDelay: i*0.14 + 0.3,
    }));
    const layoutOuter = outer.map((n, i) => ({
      ...n,
      // interleave outer nodes angularly between inner
      baseAngle: ((i+0.5)/Math.max(outer.length,1))*Math.PI*2 - Math.PI/2,
      ring: 2,
      phase: (i*2.618)%(Math.PI*2),
      floatAmp: compact ? 3 : 6,
      sparkT: Math.random(),
      sparkSpd: 0.003+Math.random()*0.002,
      revealDelay: i*0.10 + 0.7,
    }));
    const layout = [...layoutInner, ...layoutOuter];

    // ── Edge index ───────────────────────────────────────────────────────────
    const edgePairs: Array<[number,number]> = [];
    edges.forEach(([idA,idB]) => {
      const iA = nodes.findIndex(n=>n.id===idA);
      const iB = nodes.findIndex(n=>n.id===idB);
      if (iA>=0&&iB>=0) edgePairs.push([iA,iB]);
    });

    // ── Animation state ──────────────────────────────────────────────────────
    let elapsed = 0, lastTs = 0, animId: number;

    // Node radius by tier
    const nodeR = (n: typeof layout[0]) => {
      const base = n.ring===2 ? (compact?10:13) : (compact?16:21);
      return n.shared ? base*1.35 : base;
    };

    function drawFrame(ts: number) {
      animId = requestAnimationFrame(drawFrame);
      const dt = Math.min((ts-lastTs)/1000, 0.05);
      lastTs = ts;
      elapsed += dt;

      ctx.clearRect(0, 0, W, H);

      // ── Background ─────────────────────────────────────────────────────
      const bgGrad = ctx.createRadialGradient(cx, cy*0.75, 0, cx, cy, Math.max(W,H)*0.8);
      bgGrad.addColorStop(0,   'rgba(12,18,48,1)');
      bgGrad.addColorStop(0.45,'rgba(7,11,28,1)');
      bgGrad.addColorStop(1,   'rgba(3,5,14,1)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0,0,W,H);

      // Subtle aurora veil
      const aur = ctx.createRadialGradient(cx,cy*0.5,0, cx,cy*0.5,W*0.55);
      aur.addColorStop(0, `rgba(91,143,255,${0.028+0.012*Math.sin(elapsed*0.4)})`);
      aur.addColorStop(1, 'rgba(91,143,255,0)');
      ctx.fillStyle=aur; ctx.fillRect(0,0,W,H);
      const aur2 = ctx.createRadialGradient(cx*1.4,cy*1.2,0,cx*1.4,cy*1.2,W*0.45);
      aur2.addColorStop(0,`rgba(155,91,255,${0.018+0.008*Math.sin(elapsed*0.3+1.2)})`);
      aur2.addColorStop(1,'rgba(155,91,255,0)');
      ctx.fillStyle=aur2; ctx.fillRect(0,0,W,H);

      // Stars
      stars.forEach(s => {
        const a = s.base*(0.6+0.4*Math.sin(elapsed*s.speed+s.phase));
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(220,235,255,${a})`; ctx.fill();
      });

      // ── Compute node positions ────────────────────────────────────────────
      const pos = layout.map(n => {
        const rev = clamp((elapsed-n.revealDelay)/0.55,0,1);
        const eased = easeOutCubic(rev);
        const R = n.ring===1 ? INNER_R() : OUTER_R();
        const r = (R + n.floatAmp*Math.sin(elapsed*0.6+n.phase)) * eased;
        const a = n.baseAngle + elapsed*0.010*(n.ring===1?1:-0.7);
        return {
          ...n, eased, rev,
          x: cx + r*Math.cos(a),
          y: cy + r*Math.sin(a)*0.82,
        };
      });

      // ── Node-to-node edges ────────────────────────────────────────────────
      edgePairs.forEach(([iA,iB]) => {
        const A=pos[iA], B=pos[iB];
        const alpha = Math.min(A.eased,B.eased)*0.28;
        if (alpha<0.01) return;
        const mx=(A.x+B.x)/2+(A.y-B.y)*0.12;
        const my=(A.y+B.y)/2-(A.x-B.x)*0.12;
        const g=ctx.createLinearGradient(A.x,A.y,B.x,B.y);
        g.addColorStop(0,hex2rgba(A.color,alpha));
        g.addColorStop(1,hex2rgba(B.color,alpha));
        ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.quadraticCurveTo(mx,my,B.x,B.y);
        ctx.strokeStyle=g; ctx.lineWidth=0.55; ctx.stroke();
      });

      // ── Center → node lines ───────────────────────────────────────────────
      pos.forEach(n => {
        if (n.eased<0.02) return;
        const cpx=(cx+n.x)/2+(n.y-cy)*0.20;
        const cpy=(cy+n.y)/2-(n.x-cx)*0.20;
        const la = n.shared
          ? (0.38+0.12*Math.sin(elapsed*1.6+n.phase))*n.eased
          : (0.14+0.06*Math.sin(elapsed+n.phase))*n.eased;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.quadraticCurveTo(cpx,cpy,n.x,n.y);
        ctx.strokeStyle=hex2rgba(n.color,la);
        ctx.lineWidth=n.shared?1.1:0.5;
        ctx.setLineDash(n.shared?[]:[4,8]); ctx.stroke(); ctx.setLineDash([]);

        // Moving spark
        n.sparkT=(n.sparkT+n.sparkSpd*n.eased)%1;
        const sp=bezierPt(cx,cy,cpx,cpy,n.x,n.y,n.sparkT);
        ctx.beginPath(); ctx.arc(sp.x,sp.y,1.8,0,Math.PI*2);
        ctx.fillStyle=hex2rgba(n.color,0.88*n.eased);
        ctx.shadowBlur=10; ctx.shadowColor=n.color; ctx.fill(); ctx.shadowBlur=0;
      });

      // ── Nodes ────────────────────────────────────────────────────────────
      pos.forEach(n => {
        if (n.eased<0.02) return;
        const r = nodeR(n);
        const glowR = r*(n.shared?3.8:3.0);
        const pulseIntensity = n.shared ? 0.22+0.08*Math.sin(elapsed*1.8+n.phase) : 0.10+0.04*Math.sin(elapsed+n.phase);

        // Diffuse halo
        const halo=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,glowR);
        halo.addColorStop(0, hex2rgba(n.color,pulseIntensity*n.eased));
        halo.addColorStop(0.45,hex2rgba(n.color,pulseIntensity*0.35*n.eased));
        halo.addColorStop(1, hex2rgba(n.color,0));
        ctx.beginPath(); ctx.arc(n.x,n.y,glowR,0,Math.PI*2);
        ctx.fillStyle=halo; ctx.fill();

        // Node body
        const glowPx = (n.shared?18:8)*n.eased;
        ctx.shadowBlur=glowPx; ctx.shadowColor=n.color;
        ctx.beginPath(); ctx.arc(n.x,n.y,r,0,Math.PI*2);
        ctx.fillStyle=hex2rgba(n.color,(n.shared?0.20:0.10)*n.eased); ctx.fill();
        ctx.strokeStyle=hex2rgba(n.color,(n.shared?0.85:0.48)*n.eased);
        ctx.lineWidth=n.shared?1.2:0.6; ctx.stroke();
        ctx.shadowBlur=0;

        // Bright core dot
        const coreR = r*0.28;
        ctx.beginPath(); ctx.arc(n.x,n.y,coreR,0,Math.PI*2);
        ctx.fillStyle=hex2rgba(n.color,0.82*n.eased);
        ctx.shadowBlur=14*n.eased; ctx.shadowColor=n.color; ctx.fill(); ctx.shadowBlur=0;

        // Label — outside node in radial direction
        const dx=n.x-cx, dy=n.y-cy;
        const dist=Math.sqrt(dx*dx+dy*dy)||1;
        const offset = r + LABEL_PAD;
        const rawLx = n.x+(dx/dist)*offset;
        const rawLy = n.y+(dy/dist)*offset;
        // clamp within canvas with padding
        const lx = clamp(rawLx, 40, W-40);
        const ly = clamp(rawLy, 14, H-14);
        const fs = compact ? 9 : (n.ring===2?10:12);
        ctx.font=`${n.shared?'500':'400'} ${fs}px 'DM Sans',sans-serif`;
        ctx.textAlign='center';
        ctx.textBaseline = rawLy>cy+20?'top': rawLy<cy-20?'bottom':'middle';
        ctx.shadowBlur=n.shared?10*n.eased:0; ctx.shadowColor=n.color;
        ctx.fillStyle=hex2rgba(n.shared?'#ffffff':n.color,(n.shared?0.95:0.65)*n.eased);
        ctx.fillText(n.label,lx,ly);
        ctx.shadowBlur=0;
      });

      // ── Center node ───────────────────────────────────────────────────────
      const cRev = clamp(elapsed/0.45,0,1);
      const cEase = easeOutCubic(cRev);
      if (cEase>0.02) {
        const gPulse = (28+10*Math.sin(elapsed*0.9))*cEase;

        // Large halo
        const chalo=ctx.createRadialGradient(cx,cy,0,cx,cy,CENTER_R*2.8);
        chalo.addColorStop(0,hex2rgba(accentColor,0.18*cEase));
        chalo.addColorStop(0.5,hex2rgba(accentColor,0.07*cEase));
        chalo.addColorStop(1,hex2rgba(accentColor,0));
        ctx.beginPath(); ctx.arc(cx,cy,CENTER_R*2.8,0,Math.PI*2);
        ctx.fillStyle=chalo; ctx.fill();

        // Ring
        ctx.shadowBlur=gPulse; ctx.shadowColor=accentColor;
        const cBodyGrad=ctx.createRadialGradient(cx,cy,0,cx,cy,CENTER_R);
        cBodyGrad.addColorStop(0,hex2rgba(accentColor,0.32*cEase));
        cBodyGrad.addColorStop(1,hex2rgba(accentColor,0.06*cEase));
        ctx.beginPath(); ctx.arc(cx,cy,CENTER_R,0,Math.PI*2);
        ctx.fillStyle=cBodyGrad; ctx.fill();
        ctx.strokeStyle=hex2rgba(accentColor,0.82*cEase);
        ctx.lineWidth=1.4; ctx.stroke();

        // Core
        ctx.beginPath(); ctx.arc(cx,cy,CENTER_R*0.22,0,Math.PI*2);
        ctx.fillStyle=hex2rgba(accentColor,0.92*cEase);
        ctx.fill(); ctx.shadowBlur=0;

        // Name
        ctx.font=`500 ${compact?13:17}px 'Playfair Display',serif`;
        ctx.fillStyle=`rgba(255,255,255,${0.96*cEase})`;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.shadowBlur=10*cEase; ctx.shadowColor=accentColor;
        ctx.fillText(name,cx,cy); ctx.shadowBlur=0;
      }
    }

    animId = requestAnimationFrame(drawFrame);

    const ro = new ResizeObserver(() => {
      const s = setup();
      W=s.W; H=s.H; cx=W/2; cy=H/2;
      stars=makeStars(W,H);
    });
    ro.observe(wrap);

    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, [name, nodes, edges, height, compact, accentColor, fill]);

  return (
    <div ref={wrapRef} style={{ position:'relative', width:'100%', height: fill ? '100%' : height }}>
      <canvas ref={canvasRef} style={{ display:'block', position:'absolute', inset:0 }} />
    </div>
  );
}
