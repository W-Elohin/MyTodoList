import { useEffect, useRef, useMemo } from 'react';
import { animate, stagger, utils } from 'animejs';

const BUBBLE_COUNT = 18;

interface Bubble {
  id: number;
  size: number;
  left: number;
  initialBottom: number;
  opacity: number;
}

function useBubbles(): Bubble[] {
  return useMemo(() => {
    // Deterministic values so SSR matches client
    return Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
      id: i,
      size: 3 + (i % 6) * 1.5,
      left: (i * 5.5) % 100,
      initialBottom: -10 - (i * 4) % 40,
      opacity: 0.1 + (i % 4) * 0.05,
    }));
  }, []);
}

export function OceanBackground() {
  const wave1Ref = useRef<SVGGElement>(null);
  const wave2Ref = useRef<SVGGElement>(null);
  const wave3Ref = useRef<SVGGElement>(null);
  const bubblesRef = useRef<HTMLDivElement>(null);
  const ray1Ref = useRef<HTMLDivElement>(null);
  const ray2Ref = useRef<HTMLDivElement>(null);
  const ray3Ref = useRef<HTMLDivElement>(null);

  const bubbles = useBubbles();

  useEffect(() => {
    // 尊重「減少動態」偏好（a11y）：不啟動任何背景動畫，維持靜態畫面
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const anims: ReturnType<typeof animate>[] = [];

    // --- 波浪動畫 (3 層，translateX 循環) ---
    if (wave1Ref.current) {
      anims.push(
        animate(wave1Ref.current, {
          translateX: [0, -700],
          duration: 12000,
          easing: 'linear',
          loop: true,
        })
      );
    }
    if (wave2Ref.current) {
      anims.push(
        animate(wave2Ref.current, {
          translateX: [0, -700],
          duration: 8000,
          easing: 'linear',
          loop: true,
        })
      );
    }
    if (wave3Ref.current) {
      anims.push(
        animate(wave3Ref.current, {
          translateX: [0, -700],
          duration: 6000,
          easing: 'linear',
          loop: true,
        })
      );
    }

    // --- 氣泡動畫 ---
    if (bubblesRef.current) {
      const bubbleEls = bubblesRef.current.querySelectorAll<HTMLElement>('.ocean-bubble');
      if (bubbleEls.length > 0) {
        anims.push(
          animate(bubbleEls, {
            translateY: () => [utils.random(0, 80), utils.random(-900, -600)],
            translateX: () => [utils.random(-20, 20), utils.random(-30, 30)],
            opacity: [
              { to: 0.25, duration: 600 },
              { to: 0, duration: 500, delay: utils.random(5000, 10000) },
            ],
            duration: () => utils.random(9000, 16000),
            delay: stagger(600, { start: 0 }),
            easing: 'easeInOutSine',
            loop: true,
          })
        );
      }
    }

    // --- 光線呼吸動畫 ---
    const rays = [ray1Ref.current, ray2Ref.current, ray3Ref.current];
    rays.forEach((ray, i) => {
      if (ray) {
        anims.push(
          animate(ray, {
            opacity: [0.03, 0.09, 0.03],
            duration: 6000 + i * 2000,
            easing: 'easeInOutSine',
            loop: true,
            delay: i * 1800,
          })
        );
      }
    });

    return () => {
      anims.forEach((a) => a.cancel());
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* 深海漸層背景 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #0a1628 0%, #1e3a5f 40%, #0c4a6e 70%, #0369a1 100%)',
        }}
      />

      {/* 光線效果 */}
      <div
        ref={ray1Ref}
        className="absolute"
        style={{
          top: '-20%',
          left: '10%',
          width: '180px',
          height: '120%',
          background:
            'linear-gradient(180deg, rgba(186,230,253,0.9) 0%, rgba(186,230,253,0) 100%)',
          transform: 'rotate(20deg)',
          transformOrigin: 'top center',
          opacity: 0.04,
        }}
      />
      <div
        ref={ray2Ref}
        className="absolute"
        style={{
          top: '-20%',
          left: '35%',
          width: '120px',
          height: '110%',
          background:
            'linear-gradient(180deg, rgba(186,230,253,0.9) 0%, rgba(186,230,253,0) 100%)',
          transform: 'rotate(10deg)',
          transformOrigin: 'top center',
          opacity: 0.05,
        }}
      />
      <div
        ref={ray3Ref}
        className="absolute"
        style={{
          top: '-20%',
          left: '62%',
          width: '90px',
          height: '90%',
          background:
            'linear-gradient(180deg, rgba(186,230,253,0.9) 0%, rgba(186,230,253,0) 100%)',
          transform: 'rotate(-8deg)',
          transformOrigin: 'top center',
          opacity: 0.03,
        }}
      />

      {/* 氣泡 */}
      <div ref={bubblesRef} className="absolute inset-0">
        {bubbles.map((b) => (
          <div
            key={b.id}
            className="ocean-bubble absolute rounded-full border border-white/20"
            style={{
              width: b.size,
              height: b.size,
              left: `${b.left}%`,
              bottom: `${b.initialBottom}%`,
              backgroundColor: 'rgba(186,230,253,0.15)',
              opacity: b.opacity,
            }}
          />
        ))}
      </div>

      {/* 3 層海浪 SVG */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: 160 }}>
        {/* 第 1 層：最慢、最深 */}
        <svg
          viewBox="0 0 1400 80"
          preserveAspectRatio="none"
          className="absolute bottom-0"
          style={{ width: '200%', height: '80px', opacity: 0.3 }}
        >
          <g ref={wave1Ref}>
            <path
              d="M0,40 C175,0 350,80 525,40 C700,0 875,80 1050,40 C1225,0 1400,80 1400,40 L1400,80 L0,80 Z"
              fill="#1e3a5f"
            />
            <path
              d="M700,40 C875,0 1050,80 1225,40 C1400,0 1575,80 1750,40 C1925,0 2100,80 2100,40 L2100,80 L700,80 Z"
              fill="#1e3a5f"
            />
          </g>
        </svg>

        {/* 第 2 層：中速、藍綠 */}
        <svg
          viewBox="0 0 1400 80"
          preserveAspectRatio="none"
          className="absolute bottom-0"
          style={{ width: '200%', height: '65px', opacity: 0.2 }}
        >
          <g ref={wave2Ref}>
            <path
              d="M0,30 C140,60 280,10 420,35 C560,60 700,10 840,35 C980,60 1120,10 1260,35 C1400,60 1400,35 1400,35 L1400,80 L0,80 Z"
              fill="#0369a1"
            />
            <path
              d="M700,30 C840,60 980,10 1120,35 C1260,60 1400,10 1540,35 C1680,60 1820,10 1960,35 C2100,60 2100,35 2100,35 L2100,80 L700,80 Z"
              fill="#0369a1"
            />
          </g>
        </svg>

        {/* 第 3 層：最快、最淺 */}
        <svg
          viewBox="0 0 1400 80"
          preserveAspectRatio="none"
          className="absolute bottom-0"
          style={{ width: '200%', height: '50px', opacity: 0.15 }}
        >
          <g ref={wave3Ref}>
            <path
              d="M0,20 C100,50 200,5 300,25 C400,50 500,5 600,25 C700,50 800,5 900,25 C1000,50 1100,5 1200,25 C1300,50 1400,20 1400,20 L1400,80 L0,80 Z"
              fill="#38bdf8"
            />
            <path
              d="M700,20 C800,50 900,5 1000,25 C1100,50 1200,5 1300,25 C1400,50 1500,5 1600,25 C1700,50 1800,5 1900,25 C2000,50 2100,20 2100,20 L2100,80 L700,80 Z"
              fill="#38bdf8"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

export { OceanBackground as BackgroundAnimation };
