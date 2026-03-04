export const formatBattleTime = (seconds: number): string => {
  if (!seconds || !isFinite(seconds) || seconds <= 0) return '—';
  if (seconds <= 60) return `${Math.round(seconds * 10) / 10}s`;
  const totalMin = Math.floor(seconds / 60);
  if (totalMin < 60) {
    const sec = Math.round(seconds % 60);
    return `${totalMin}m ${sec}s`;
  }
  const hours = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  return `${hours}h ${min}m`;
};
