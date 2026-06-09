import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { animate, type JSAnimation } from 'animejs';

interface CrabIllustrationProps {
  compact?: boolean;
}

export function CrabIllustration({ compact = false }: CrabIllustrationProps) {
  const clawLRef = useRef<SVGGElement>(null);
  const clawRRef = useRef<SVGGElement>(null);
  const eyeLRef = useRef<SVGGElement>(null);
  const eyeRRef = useRef<SVGGElement>(null);
  const legRefs = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    const anims: JSAnimation[] = [];

    if (clawLRef.current) {
      anims.push(
        animate(clawLRef.current, {
          rotate: [0, -20],
          duration: 1000,
          ease: 'inOutSine',
          loop: true,
          alternate: true,
        })
      );
    }
    if (clawRRef.current) {
      anims.push(
        animate(clawRRef.current, {
          rotate: [0, 20],
          duration: 1000,
          ease: 'inOutSine',
          loop: true,
          alternate: true,
        })
      );
    }
    [eyeLRef, eyeRRef].forEach((ref) => {
      if (ref.current) {
        anims.push(
          animate(ref.current, {
            translateY: [-2, 2],
            duration: 1800,
            ease: 'inOutSine',
            loop: true,
            alternate: true,
          })
        );
      }
    });
    legRefs.current.forEach((el, i) => {
      if (!el) return;
      anims.push(
        animate(el, {
          rotate: [-4, 4],
          duration: 1200,
          ease: 'inOutSine',
          loop: true,
          alternate: true,
          delay: i * 80,
        })
      );
    });

    return () => anims.forEach((a) => a.pause());
  }, []);

  const setLeg = (i: number) => (el: SVGGElement | null) => {
    legRefs.current[i] = el;
  };

  return (
    <motion.div className={compact ? 'scale-50 origin-center' : undefined}>
      <svg width={200} height={180} viewBox="0 0 200 180" aria-hidden className="mx-auto">
        <g>
          {[
            { x: 55, rot: -35 },
            { x: 70, rot: -15 },
            { x: 85, rot: 5 },
            { x: 100, rot: 25 },
            { x: 115, rot: -25 },
            { x: 130, rot: -5 },
            { x: 145, rot: 15 },
            { x: 160, rot: 35 },
          ].map((leg, i) => (
            <g
              key={i}
              ref={setLeg(i)}
              style={{ transformOrigin: `${leg.x}px 120px`, transform: `rotate(${leg.rot}deg)` }}
            >
              <path d={`M${leg.x} 105 L${leg.x - 8} 130 L${leg.x + 4} 128 Z`} fill="#ea580c" />
            </g>
          ))}
          <ellipse cx="100" cy="95" rx="38" ry="32" fill="#f97316" />
          <ellipse cx="100" cy="100" rx="28" ry="22" fill="#fb923c" opacity="0.6" />
          <g ref={eyeLRef} style={{ transformOrigin: '78px 62px' }}>
            <line x1="78" y1="72" x2="78" y2="58" stroke="#c2410c" strokeWidth="3" />
            <circle cx="78" cy="54" r="7" fill="white" />
            <circle cx="78" cy="54" r="4" fill="#1e293b" />
          </g>
          <g ref={eyeRRef} style={{ transformOrigin: '122px 62px' }}>
            <line x1="122" y1="72" x2="122" y2="58" stroke="#c2410c" strokeWidth="3" />
            <circle cx="122" cy="54" r="7" fill="white" />
            <circle cx="122" cy="54" r="4" fill="#1e293b" />
          </g>
          <g ref={clawLRef} style={{ transformOrigin: '42px 88px' }}>
            <path d="M42 88 Q20 70 15 50 Q25 55 35 58 L42 75 Z" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
            <rect x="8" y="38" width="22" height="16" rx="3" fill="white" opacity="0.9" />
          </g>
          <g ref={clawRRef} style={{ transformOrigin: '158px 88px' }}>
            <path d="M158 88 Q180 70 185 50 Q175 55 165 58 L158 75 Z" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
            <rect x="170" y="38" width="22" height="16" rx="3" fill="white" opacity="0.9" />
          </g>
        </g>
      </svg>
    </motion.div>
  );
}
