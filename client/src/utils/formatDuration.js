// Helper to format seconds as "X hr Y min Z sec"
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0 min';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  let str = '';
  if (h > 0) str += `${h} hr${h > 1 ? 's' : ''} `;
  if (m > 0) str += `${m} min${m > 1 ? 's' : ''} `;
  if (h === 0 && m === 0 && s > 0) str += `${s} sec`;
  return str.trim();
}