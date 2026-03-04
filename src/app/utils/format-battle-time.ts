export const formatBattleTime = (seconds: number): string => {
  if (!seconds || !isFinite(seconds) || seconds <= 0) return '—';
  if (seconds <= 60) return `${Math.round(seconds * 10) / 10}s`;
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}m ${sec}s`;
};
