import { useEffect, useRef } from 'react';
import { animate, type JSAnimation } from 'animejs';

export function WhaleIllustration() {
  const bodyRef = useRef<SVGGElement>(null);
  const tailRef = useRef<SVGGElement>(null);
  const dropRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const anims: JSAnimation[] = [];

    if (bodyRef.current) {
      anims.push(
        animate(bodyRef.current, {
          translateY: [-5, 5],
          duration: 4000,
          ease: 'inOutSine',
          loop: true,
          alternate: true,
        })
      );
    }
    if (tailRef.current) {
      anims.push(
        animate(tailRef.current, {
          rotate: [-8, 8],
          duration: 2000,
          ease: 'inOutSine',
          loop: true,
          alternate: true,
        })
      );
    }
    dropRefs.current.forEach((el, i) => {
      if (!el) return;
      anims.push(
        animate(el, {
          translateY: [0, -40],
          opacity: [1, 0],
          duration: 2000,
          ease: 'outQuad',
          loop: true,
          delay: i * 400,
        })
      );
    });

    return () => anims.forEach((a) => a.pause());
  }, []);

  const setDrop = (i: number) => (el: SVGCircleElement | null) => {
    dropRefs.current[i] = el;
  };

  return (
    <svg width={200} height={200} viewBox="0 0 200 200" aria-hidden className="mx-auto">
      <g ref={bodyRef} style={{ transformOrigin: '100px 120px' }}>
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            ref={setDrop(i)}
            cx={92 + i * 8}
            cy={42}
            r={5 + i}
            fill="#7dd3fc"
            opacity={0.85}
          />
        ))}
        <g ref={tailRef} style={{ transformOrigin: '155px 125px' }}>
          <path d="M155 115 Q185 100 190 125 Q185 150 155 135 Z" fill="#3b82f6" />
        </g>
        <ellipse cx="95" cy="120" rx="58" ry="42" fill="#3b82f6" />
        <ellipse cx="88" cy="128" rx="38" ry="28" fill="#bae6fd" />
        <circle cx="72" cy="108" r="6" fill="white" />
        <circle cx="72" cy="108" r="3.5" fill="#1e3a8a" />
        <circle cx="74" cy="106" r="1.2" fill="white" />
        <path d="M58 118 Q68 124 78 118" stroke="#1d4ed8" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
