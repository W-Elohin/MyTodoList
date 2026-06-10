import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

// 直接使用使用者提供的原圖（長相 100% 一致），以 Vite glob 取得 URL。
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

/**
 * 從圖片四邊以 flood-fill 去除近白背景，保留內部白色（眼睛、肚子高光）。
 * 在瀏覽器以 canvas 處理，零外部工具、離線可用。回傳去背後的 data URL。
 */
function removeWhiteBackground(img: HTMLImageElement, maxDim = 512): string {
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return img.src;
  ctx.drawImage(img, 0, 0, w, h);

  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;
  const isNearWhite = (i: number) => px[i] > 238 && px[i + 1] > 238 && px[i + 2] > 238;

  const visited = new Uint8Array(w * h);
  const queue: number[] = [];
  const pushIf = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (visited[p]) return;
    if (!isNearWhite(p * 4)) return;
    visited[p] = 1;
    queue.push(p);
  };
  // 由四邊種子開始
  for (let x = 0; x < w; x++) { pushIf(x, 0); pushIf(x, h - 1); }
  for (let y = 0; y < h; y++) { pushIf(0, y); pushIf(w - 1, y); }

  while (queue.length) {
    const p = queue.pop() as number;
    const x = p % w;
    const y = (p / w) | 0;
    px[p * 4 + 3] = 0; // 設為透明
    pushIf(x + 1, y); pushIf(x - 1, y); pushIf(x, y + 1); pushIf(x, y - 1);
  }

  ctx.putImageData(data, 0, 0);
  return canvas.toDataURL('image/png');
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
  const [processed, setProcessed] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const out = removeWhiteBackground(img);
        if (!cancelled) setProcessed(out);
      } catch {
        if (!cancelled) setProcessed(src); // 失敗就用原圖
      }
    };
    img.onerror = () => { if (!cancelled) setProcessed(src); };
    img.src = src;
    return () => { cancelled = true; };
  }, [src]);

  if (!src) return null;

  // 去背完成前保持透明，避免閃一下白方塊；完成後淡入並（可選）漂浮
  const animate = processed
    ? { opacity: 1, ...(float ? { y: [0, -10, 0] } : {}) }
    : { opacity: 0 };

  return (
    <motion.img
      src={processed ?? src}
      alt={name}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
      initial={{ opacity: 0 }}
      animate={animate}
      transition={float ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
    />
  );
}
