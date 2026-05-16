import { useEffect, useRef } from 'react';
import { animate, type JSAnimation } from 'animejs';

export function OctopusIllustration() {
  const bodyRef = useRef<SVGGElement>(null);
  const glintLRef = useRef<SVGCircleElement>(null);
  const glintRRef = useRef<SVGCircleElement>(null);
  const tentacleRefs = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    const anims: JSAnimation[] = [];

    if (bodyRef.current) {
      anims.push(
        animate(bodyRef.current, {
          translateY: [-3, 3],
          duration: 4000,
          ease: 'inOutSine',
          loop: true,
          alternate: true,
        })
      );
    }

    [glintLRef, glintRRef].forEach((ref) => {
      if (ref.current) {
        anims.push(
          animate(ref.current, {
            opacity: [0.6, 1],
            duration: 2000,
            ease: 'inOutSine',
            loop: true,
            alternate: true,
          })
        );
      }
    });

    tentacleRefs.current.forEach((el, i) => {
      if (!el) return;
      const delay = i < 4 ? i * 200 : (i - 4) * 200;
      anims.push(
        animate(el, {
          rotate: [-5, 5],
          duration: 3000,
          ease: 'inOutSine',
          loop: true,
          alternate: true,
          delay,
        })
      );
    });

    return () => anims.forEach((a) => a.pause());
  }, []);

  const setTentacle = (i: number) => (el: SVGGElement | null) => {
    tentacleRefs.current[i] = el;
  };

  return (
    <svg width={200} height={200} viewBox="0 0 200 200" aria-hidden className="mx-auto">
      <ellipse cx="100" cy="175" rx="55" ry="12" fill="#1e3a5f" opacity="0.4" />
      <g ref={bodyRef} style={{ transformOrigin: '100px 95px' }}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = -90 + i * 22.5;
          return (
            <g
              key={i}
              ref={setTentacle(i)}
              style={{ transformOrigin: '100px 110px', transform: `rotate(${angle}deg)` }}
            >
              <path
                d="M100 110 Q95 140 88 155 Q92 150 100 148 Q108 150 112 155 Q105 140 100 110"
                fill="#c084fc"
                stroke="#a855f7"
                strokeWidth="1.5"
              />
              <circle cx="90" cy="152" r="3" fill="#f9a8d4" />
              <circle cx="110" cy="152" r="3" fill="#f9a8d4" />
            </g>
          );
        })}
        <ellipse cx="100" cy="95" rx="42" ry="38" fill="#c084fc" />
        <ellipse cx="100" cy="100" rx="32" ry="28" fill="#d8b4fe" opacity="0.5" />
        <circle cx="82" cy="88" r="14" fill="white" />
        <circle cx="118" cy="88" r="14" fill="white" />
        <circle cx="82" cy="90" r="8" fill="#312e81" />
        <circle cx="118" cy="90" r="8" fill="#312e81" />
        <circle ref={glintLRef} cx="86" cy="86" r="3" fill="white" />
        <circle ref={glintRRef} cx="122" cy="86" r="3" fill="white" />
        <path d="M88 108 Q100 116 112 108" stroke="#7c3aed" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
