'use client';
import { useEffect, useRef } from 'react';
import type { MindNode } from './MindMapViz';

type Props = {
  nameA: string;
  nameB: string;
  uniqueA: MindNode[];
  uniqueB: MindNode[];
  shared: MindNode[];
  height?: number;
};

function hex2rgba(hex: string, a: number) {
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

function bezierPt(x0:number,y0:number,x1:number,y1:number,x2:number,y2:number,t:number){
  const u=1-t; return {x:u*u*x0+2*u*t*x1+t*t*x2,y:u*u*y0+2*u*t*y1+t*t*y2};
}

export default function OverlapMindMap({ nameA, nameB, uniqueA, uniqueB, shared, height=520 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    let W = canvas.offsetWidth, H = height;
    canvas.width = W*dpr; canvas.height = H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);

    const cxA = W*0.22, cxB = W*0.78, cy = H*0.5, cxMid = W*0.5;

    // Shared nodes: vertical column in center
    const sharedY = (i:number) => {
      const span = Math.min(54, H*0.55/(Math.max(shared.length,1)));
      return cy - (shared.length-1)*span/2 + i*span;
    };
    const sharedLayout = shared.map((n,i) => ({ ...n, bx: cxMid, by: sharedY(i), phase: i*1.2 }));

    // Unique A nodes: fan to the left
    const uniqueALayout = uniqueA.map((n,i) => ({
      ...n, angle: ((i / Math.max(uniqueA.length-1,1)) * 0.8 - 0.4) * Math.PI - Math.PI/2,
      radius: 90 + (i%2)*22, phase: i*1.618,
    }));
    // Unique B nodes: fan to the right
    const uniqueBLayout = uniqueB.map((n,i) => ({
      ...n, angle: Math.PI - ((i / Math.max(uniqueB.length-1,1)) * 0.8 - 0.4) * Math.PI + Math.PI/2,
      radius: 90 + (i%2)*22, phase: i*1.618+1,
    }));

    // Sparks
    const sparksA = sharedLayout.map(() => ({ t: Math.random(), spd: 0.005+Math.random()*0.002 }));
    const sparksB = sharedLayout.map(() => ({ t: Math.random(), spd: 0.004+Math.random()*0.002 }));

    let t=0, animId:number;

    function draw() {
      animId = requestAnimationFrame(draw);
      t += 0.009;
      ctx.clearRect(0,0,W,H);

      const posA = uniqueALayout.map(n => ({
        ...n,
        x: cxA + (n.radius+8*Math.sin(t*0.7+n.phase)) * Math.cos(n.angle + t*0.01),
        y: cy   + (n.radius*0.75+8*Math.cos(t*0.7+n.phase)) * Math.sin(n.angle + t*0.01),
      }));
      const posB = uniqueBLayout.map(n => ({
        ...n,
        x: cxB + (n.radius+8*Math.sin(t*0.7+n.phase)) * Math.cos(n.angle - t*0.01),
        y: cy   + (n.radius*0.75+8*Math.cos(t*0.7+n.phase)) * Math.sin(n.angle - t*0.01),
      }));
      const posShared = sharedLayout.map(n => ({
        ...n, x: n.bx + 5*Math.sin(t*0.8+n.phase), y: n.by + 4*Math.cos(t*0.6+n.phase),
      }));

      // Bridge lines A ↔ shared
      posShared.forEach((n, i) => {
        const cpx=(cxA+n.x)/2, cpy=(cy+n.y)/2-28;
        const a = 0.45+0.15*Math.sin(t*2+n.phase);
        ctx.beginPath(); ctx.moveTo(cxA,cy); ctx.quadraticCurveTo(cpx,cpy,n.x,n.y);
        ctx.strokeStyle=hex2rgba('#5B8FFF',a); ctx.lineWidth=1.5; ctx.stroke();
        sparksA[i].t=(sparksA[i].t+sparksA[i].spd)%1;
        const sp=bezierPt(cxA,cy,cpx,cpy,n.x,n.y,sparksA[i].t);
        ctx.beginPath(); ctx.arc(sp.x,sp.y,2.4,0,Math.PI*2);
        ctx.fillStyle='rgba(91,143,255,0.92)'; ctx.shadowBlur=9; ctx.shadowColor='#5B8FFF'; ctx.fill(); ctx.shadowBlur=0;
      });

      // Bridge lines B ↔ shared
      posShared.forEach((n, i) => {
        const cpx=(cxB+n.x)/2, cpy=(cy+n.y)/2-28;
        const a = 0.45+0.15*Math.sin(t*2+n.phase+1);
        ctx.beginPath(); ctx.moveTo(cxB,cy); ctx.quadraticCurveTo(cpx,cpy,n.x,n.y);
        ctx.strokeStyle=hex2rgba('#9B5BFF',a); ctx.lineWidth=1.5; ctx.stroke();
        sparksB[i].t=(sparksB[i].t+sparksB[i].spd)%1;
        const sp=bezierPt(cxB,cy,cpx,cpy,n.x,n.y,sparksB[i].t);
        ctx.beginPath(); ctx.arc(sp.x,sp.y,2.4,0,Math.PI*2);
        ctx.fillStyle='rgba(155,91,255,0.92)'; ctx.shadowBlur=9; ctx.shadowColor='#9B5BFF'; ctx.fill(); ctx.shadowBlur=0;
      });

      // Unique A lines + nodes
      posA.forEach(n => {
        ctx.beginPath(); ctx.moveTo(cxA,cy); ctx.lineTo(n.x,n.y);
        ctx.strokeStyle=hex2rgba(n.color,0.18); ctx.lineWidth=0.7; ctx.setLineDash([3,5]); ctx.stroke(); ctx.setLineDash([]);
        ctx.shadowBlur=5; ctx.shadowColor=n.color;
        ctx.beginPath(); ctx.arc(n.x,n.y,16,0,Math.PI*2);
        ctx.fillStyle=hex2rgba(n.color,0.12); ctx.fill();
        ctx.strokeStyle=hex2rgba(n.color,0.42); ctx.lineWidth=0.7; ctx.stroke();
        ctx.shadowBlur=0;
        ctx.font="400 9px 'DM Sans',sans-serif"; ctx.fillStyle='rgba(160,192,255,0.68)';
        ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(n.label,n.x,n.y);
      });

      // Unique B lines + nodes
      posB.forEach(n => {
        ctx.beginPath(); ctx.moveTo(cxB,cy); ctx.lineTo(n.x,n.y);
        ctx.strokeStyle=hex2rgba(n.color,0.18); ctx.lineWidth=0.7; ctx.setLineDash([3,5]); ctx.stroke(); ctx.setLineDash([]);
        ctx.shadowBlur=5; ctx.shadowColor=n.color;
        ctx.beginPath(); ctx.arc(n.x,n.y,16,0,Math.PI*2);
        ctx.fillStyle=hex2rgba(n.color,0.12); ctx.fill();
        ctx.strokeStyle=hex2rgba(n.color,0.42); ctx.lineWidth=0.7; ctx.stroke();
        ctx.shadowBlur=0;
        ctx.font="400 9px 'DM Sans',sans-serif"; ctx.fillStyle='rgba(160,192,255,0.68)';
        ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(n.label,n.x,n.y);
      });

      // Shared nodes (big + bright)
      posShared.forEach(n => {
        const glow=18+8*Math.sin(t*2+n.phase);
        ctx.shadowBlur=glow; ctx.shadowColor=n.color;
        ctx.beginPath(); ctx.arc(n.x,n.y,30,0,Math.PI*2);
        ctx.fillStyle=hex2rgba(n.color,0.26); ctx.fill();
        ctx.strokeStyle=hex2rgba(n.color,0.95); ctx.lineWidth=1.5; ctx.stroke();
        ctx.shadowBlur=0;
        ctx.font="600 12px 'DM Sans',sans-serif"; ctx.fillStyle='#ffffff';
        ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(n.label,n.x,n.y);
      });

      // Name center nodes
      const drawName = (x:number, label:string, color:string) => {
        const r=44, glow=16+6*Math.sin(t*0.85);
        ctx.shadowBlur=glow; ctx.shadowColor=color;
        const cg=ctx.createRadialGradient(x,cy,0,x,cy,r);
        cg.addColorStop(0,hex2rgba(color,0.36)); cg.addColorStop(1,hex2rgba(color,0.05));
        ctx.beginPath(); ctx.arc(x,cy,r,0,Math.PI*2); ctx.fillStyle=cg; ctx.fill();
        ctx.strokeStyle=hex2rgba(color,0.88); ctx.lineWidth=1.5; ctx.stroke();
        ctx.shadowBlur=0;
        ctx.font="500 14px 'Playfair Display',serif"; ctx.fillStyle='#ffffff';
        ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(label,x,cy);
      };
      drawName(cxA, nameA, '#5B8FFF');
      drawName(cxB, nameB, '#9B5BFF');
    }

    draw();
    return () => cancelAnimationFrame(animId);
  }, [nameA, nameB, uniqueA, uniqueB, shared, height]);

  return <canvas ref={ref} style={{ width:'100%', height, display:'block' }} />;
}
