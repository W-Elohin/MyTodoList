import { useEffect, useRef } from 'react';
import { animate, type JSAnimation } from 'animejs';

interface GreetingEmojiProps {
  emoji: string;
  className?: string;
}

export function GreetingEmoji({ emoji, className = '' }: GreetingEmojiProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const anim = animate(ref.current, {
      scale: [0.9, 1.1],
      duration: 3000,
      ease: 'inOutSine',
      loop: true,
      alternate: true,
    });
    return () => anim.pause();
  }, []);

  return (
    <span ref={ref} className={`inline-block text-4xl ${className}`} role="img" aria-hidden>
      {emoji}
    </span>
  );
}
