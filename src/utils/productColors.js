/**
 * Color options configuration for specific bracelet models
 */
export function getBraceletColorOptions(product) {
  if (!product) return null;
  const name = (product.name || product.title || '').toLowerCase();
  const id = (product.id || '').toLowerCase();

  // Sage Green Pearl Bracelet -> Hitam & Merah
  if (name.includes('sage green') || id.includes('sage-green') || id.includes('cat-gelang-beads')) {
    return [
      { id: 'hitam', label: 'Hitam', hex: '#18181B', bg: '#18181B' },
      { id: 'merah', label: 'Merah', hex: '#DC2626', bg: '#DC2626' }
    ];
  }

  // White Pearl Star Bracelet -> Biru & Pink
  if (name.includes('white pearl') || id.includes('white-pearl')) {
    return [
      { id: 'biru', label: 'Biru', hex: '#3B82F6', bg: '#3B82F6' },
      { id: 'pink', label: 'Pink', hex: '#EC4899', bg: '#EC4899' }
    ];
  }

  return null;
}
