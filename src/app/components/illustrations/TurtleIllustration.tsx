import { useEffect, useRef } from 'react';
import { animate, type JSAnimation } from 'animejs';

export function TurtleIllustration() {
  const bodyRef = useRef<SVGGElement>(null);
  const finFrontRef = useRef<SVGGElement>(null);
  const finBackRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const anims: JSAnimation[] = [];

    if (bodyRef.current) {
      anims.push(
        animate(bodyRef.current, {
          translateX: [-10, 10],
          rotate: [-2, 2],
          duration: 6000,
          ease: 'inOutSine',
          loop: true,
          alternate: true,
        })
      );
    }
    if (finFrontRef.current) {
      anims.push(
        animate(finFrontRef.current, {
          rotate: [-15, 15],
          duration: 1500,
          ease: 'inOutSine',
          loop: true,
          alternate: true,
        })
      );
    }
    if (finBackRef.current) {
      anims.push(
        animate(finBackRef.current, {
          rotate: [15, -15],
          duration: 1500,
          ease: 'inOutSine',
          loop: true,
          alternate: true,
          delay: 300,
        })
      );
    }

    return () => anims.forEach((a) => a.pause());
  }, []);

  return (
    <svg width={220} height={160} viewBox="0 0 220 160" aria-hidden className="mx-auto">
      <g ref={bodyRef} style={{ transformOrigin: '110px 80px' }}>
        <ellipse cx="110" cy="130" rx="70" ry="8" fill="#0ea5e9" opacity="0.15" />
        <g ref={finBackRef} style={{ transformOrigin: '45px 85px' }}>
          <ellipse cx="42" cy="88" rx="18" ry="10" fill="#059669" transform="rotate(-20 42 88)" />
        </g>
        <ellipse cx="115" cy="82" rx="52" ry="36" fill="#10b981" />
        <ellipse cx="115" cy="82" rx="40" ry="28" fill="#059669" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <polygon
            key={i}
            points="0,-8 7,4 -7,4"
            fill="#34d399"
            transform={`translate(${95 + (i % 3) * 14}, ${68 + Math.floor(i / 3) * 22}) rotate(${i * 30})`}
          />
        ))}
        <circle cx="155" cy="78" r="12" fill="#10b981" />
        <circle cx="162" cy="76" r="3" fill="#064e3b" />
        <circle cx="164" cy="74" r="1.2" fill="white" />
        <path d="M168 82 Q172 86 168 90" stroke="#064e3b" strokeWidth="1.5" fill="none" />
        <g ref={finFrontRef} style={{ transformOrigin: '175px 90px' }}>
          <ellipse cx="178" cy="92" rx="16" ry="9" fill="#059669" transform="rotate(25 178 92)" />
        </g>
      </g>
    </svg>
  );
}
