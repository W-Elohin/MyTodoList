/** 商店商品與小屋裝飾槽位定義（迭代 #2 骨架，無真實付費） */

export interface ShopItem {
  id: string;
  nameJa: string;
  descriptionJa: string;
  price: number;
  /** 可裝備的小屋槽位 ID；未指定則僅收藏 */
  slotId?: string;
  category: 'decoration' | 'furniture';
}

export interface HomeSlot {
  id: string;
  labelJa: string;
  /** 2.5D 預覽中的相對位置（百分比） */
  bottom?: string;
  top?: string;
  left?: string;
  right?: string;
}

export const HOME_SLOTS: HomeSlot[] = [
  { id: 'floor-left', labelJa: '左', bottom: '18%', left: '8%' },
  { id: 'floor-right', labelJa: '右', bottom: '18%', right: '8%' },
  { id: 'wall', labelJa: '壁', top: '22%', left: '50%' },
  { id: 'desk', labelJa: '机', bottom: '38%', left: '42%' },
];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'coral-small',
    nameJa: '小さな珊瑚',
    descriptionJa: '部屋の左側に飾れる小さな珊瑚。',
    price: 30,
    slotId: 'floor-left',
    category: 'decoration',
  },
  {
    id: 'shell-frame',
    nameJa: '貝殻フレーム',
    descriptionJa: '壁に掛けられる貝殻の額縁。',
    price: 45,
    slotId: 'wall',
    category: 'decoration',
  },
  {
    id: 'seaweed-pot',
    nameJa: '海藻の鉢',
    descriptionJa: '右側の床に置ける海藻盆栽。',
    price: 35,
    slotId: 'floor-right',
    category: 'decoration',
  },
  {
    id: 'coral-lamp',
    nameJa: '珊瑚ランプ',
    descriptionJa: '机の上に置ける暖かい灯り。',
    price: 60,
    slotId: 'desk',
    category: 'furniture',
  },
  {
    id: 'bubble-machine',
    nameJa: 'バブルマシン',
    descriptionJa: '部屋を明るくする装飾。どこにも飾れます。',
    price: 80,
    category: 'decoration',
  },
  {
    id: 'anchor-decor',
    nameJa: 'アンカー置物',
    descriptionJa: '航海士の部屋にぴったりの錨。',
    price: 50,
    slotId: 'floor-left',
    category: 'decoration',
  },
];

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((item) => item.id === id);
}
