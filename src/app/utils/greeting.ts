export function getGreeting(): { emoji: string; text: string; sub: string } {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return { emoji: '🌅', text: 'おはようございます', sub: '新しい一日の始まり！' };
  if (h >= 12 && h < 18) return { emoji: '🌊', text: 'お疲れ様です', sub: '午後も頑張りましょう！' };
  if (h >= 18 && h < 24) return { emoji: '🌙', text: 'お疲れ様でした', sub: '今日もよく頑張りました' };
  return { emoji: '🐙', text: '夜更かしですか？', sub: '早めに休みましょう' };
}
