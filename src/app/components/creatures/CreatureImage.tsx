import { motion } from 'motion/react';

// 角色圖已於建置前去背成透明 PNG（見 scripts/remove-bg.mjs），執行期直接使用，
// 免 canvas 運算、不閃白。以 Vite glob 取得 URL。
const urls = import.meta.glob('../../../assets/creatures/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export type CreatureName =
  | 'turtle' | 'crab' | 'octopus' | 'whale' | 'shark'
  | 'jellyfish' | 'seahorse' | 'dolphin' | 'pufferfish' | 'narwhal';

function urlFor(name: CreatureName): string | undefined {
  const key = Object.keys(urls).find((k) => k.endsWith(`/${name}.png`));
  return key ? urls[key] : undefined;
}

interface Props {
  name: CreatureName;
  size?: number;
  /** 漂浮動畫，預設開 */
  float?: boolean;
  className?: string;
}

export function CreatureImage({ name, size = 160, float = true, className = '' }: Props) {
  const src = urlFor(name);
  if (!src) return null;

  return (
    <motion.img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={
        float
          ? {
              opacity: 1,
              scale: 1,
              y: [0, -12, 0],
              rotate: [-1.5, 1.5, -1.5],
            }
          : { opacity: 1, scale: 1, y: 0 }
      }
      transition={
        float
          ? {
              opacity: { duration: 0.4 },
              scale: { type: 'spring', stiffness: 260, damping: 20 },
              y: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
            }
          : { type: 'spring', stiffness: 300, damping: 24 }
      }
    />
  );
}
