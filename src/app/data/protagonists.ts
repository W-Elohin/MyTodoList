import type { CreatureName } from '../components/creatures/CreatureImage';
import type { ProtagonistType } from '../types/gamification';

export interface ProtagonistOption {
  type: ProtagonistType;
  variant: string;
  labelJa: string;
  descriptionJa: string;
}

export const ANIMAL_PROTAGONISTS: ProtagonistOption[] = [
  { type: 'animal', variant: 'dolphin', labelJa: 'イルカ', descriptionJa: '明るく元気な相棒' },
  { type: 'animal', variant: 'turtle', labelJa: 'カメ', descriptionJa: 'のんびり確実派' },
  { type: 'animal', variant: 'octopus', labelJa: 'タコ', descriptionJa: '器用で好奇心旺盛' },
  { type: 'animal', variant: 'whale', labelJa: 'クジラ', descriptionJa: '落ち着いた大きな存在' },
  { type: 'animal', variant: 'seahorse', labelJa: 'タツノオトシゴ', descriptionJa: '繊細で優しい' },
  { type: 'animal', variant: 'jellyfish', labelJa: 'クラゲ', descriptionJa: 'ふわふわ幻想的' },
];

export const HUMAN_PROTAGONISTS: ProtagonistOption[] = [
  { type: 'human', variant: 'boy_explorer', labelJa: '少年探検家', descriptionJa: '未知の海を目指す' },
  { type: 'human', variant: 'girl_explorer', labelJa: '少女探検家', descriptionJa: '冒険心あふれる' },
  { type: 'human', variant: 'diver_boy', labelJa: '少年ダイバー', descriptionJa: '深く潜るのが好き' },
  { type: 'human', variant: 'diver_girl', labelJa: '少女ダイバー', descriptionJa: '海の声を聴く' },
];

export function isCreatureVariant(variant: string): variant is CreatureName {
  return ['turtle', 'crab', 'octopus', 'whale', 'shark', 'jellyfish', 'seahorse', 'dolphin', 'pufferfish', 'narwhal'].includes(variant);
}
