const PALETTE = [
  ["#0c8f63", "#e7f6f0"],
  ["#175cd3", "#eff4ff"],
  ["#b45309", "#fef3c7"],
  ["#7c3aed", "#f3e8ff"],
  ["#0e7490", "#cffafe"],
  ["#be185d", "#fce7f3"],
  ["#1d4ed8", "#dbeafe"],
  ["#047857", "#d1fae5"],
];

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function avatarColors(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
