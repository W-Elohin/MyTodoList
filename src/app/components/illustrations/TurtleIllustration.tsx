import { CreatureImage } from '../creatures/CreatureImage';

// 改用使用者提供的原圖角色（去白底 + 漂浮動畫），取代舊的手繪 SVG。
export function TurtleIllustration() {
  return <CreatureImage name="turtle" size={180} className="mx-auto" />;
}
