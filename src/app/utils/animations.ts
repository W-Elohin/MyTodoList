import type { Transition, Variants } from 'motion/react';

/** 全站共用的 spring 過場，比線性 ease 更有互動質感 */
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 28,
};

export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 24,
};

export const pageTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

/** 頁面切換：淡入 + 輕微上滑 */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.99 },
};

/** 列表項目進入：彈簧彈入 */
export const listItemVariants: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, x: 48, scale: 0.92, transition: { duration: 0.22 } },
};

/** 待辦完成消失：縮小 + 上移淡出 */
export const todoCompleteExit: Variants = {
  exit: {
    opacity: 0,
    scale: 0.88,
    y: -16,
    transition: { duration: 0.28, ease: 'easeIn' },
  },
};

/** 待辦新增：從下方彈入 */
export const todoCreateVariants: Variants = {
  initial: { opacity: 0, y: 32, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

/** 對話框 / 面板 */
export const dialogOverlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const dialogContentVariants: Variants = {
  initial: { opacity: 0, y: 40, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 24, scale: 0.97 },
};

/** 交錯進入的 delay 計算 */
export function staggerDelay(index: number, base = 0.04): number {
  return Math.min(index * base, 0.32);
}

/** 按鈕互動 props（直接 spread 到 motion 元件） */
export const buttonMotionProps = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.94 },
  transition: springTransition,
} as const;

/** FAB 浮動按鈕 */
export const fabMotionProps = {
  whileHover: { scale: 1.06, y: -2 },
  whileTap: { scale: 0.92 },
  transition: springTransition,
} as const;

/** 圖片 / 角色進入 */
export const imageRevealVariants: Variants = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
};

/** XP 獎勵浮動文字 */
export const xpFloatVariants: Variants = {
  initial: { opacity: 0, y: 0, scale: 0.8 },
  animate: { opacity: [0, 1, 1, 0], y: -28, scale: 1 },
};
