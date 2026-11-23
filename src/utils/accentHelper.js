/**
 * Helper to resolve and format accent color (Bintang Akrilik & Lonceng)
 * and identify product categories (Gelang vs Bag Charm)
 */

export function isGelangItem(item) {
  if (!item) return false;
  const pType = (item.productType || item.type || '').toLowerCase();
  const title = (item.title || item.name || '').toLowerCase();
  const cat = (item.category || '').toLowerCase();

  // If item explicitly has both bag charm and gelang (e.g. bundle header title), it's not a pure gelang
  if ((title.includes('bag charm') || title.includes('bagcharm')) && (title.includes('gelang') || title.includes('bracelet'))) {
    return false;
  }

  return (
    pType === 'gelang' ||
    pType === 'bracelet' ||
    cat === 'gelang' ||
    cat === 'bracelets' ||
    title.includes('gelang') ||
    title.includes('bracelet')
  );
}

export function isBagCharmItem(item) {
  if (!item) return false;
  if (isGelangItem(item)) return false;

  const pType = (item.productType || item.type || '').toLowerCase();
  const title = (item.title || item.name || '').toLowerCase();

  if (pType === 'bag_charm' || pType === 'bagcharm') return true;
  if (Boolean(item.frameId) || Boolean(item.framePhotos && item.framePhotos.length > 0)) return true;
  if (title.includes('bag charm') || title.includes('bagcharm') || title.includes('photostrip') || title.includes('frame')) return true;

  // Default fallback for custom studio items
  return pType === 'custom' || !pType;
}

export function getGelangImage(item, collections = []) {
  if (item?.image) return item.image;
  if (item?.imageSrc) return item.imageSrc;
  if (Array.isArray(item?.images) && item.images[0]) return item.images[0];

  const title = (item?.title || item?.name || '').toLowerCase();
  const itemId = String(item?.id || '').toLowerCase();
  const collectionId = String(item?.collectionId || '').toLowerCase();

  const found = collections.find((c) => {
    const cTitle = (c.name || c.title || '').toLowerCase();
    const cId = String(c?.id || '').toLowerCase();
    return (
      (itemId && cId === itemId) ||
      (collectionId && cId === collectionId) ||
      (title && cTitle && (cTitle.includes(title) || title.includes(cTitle)))
    );
  });
  if (found?.image) return found.image;
  if (found?.images?.[0]) return found.images[0];

  if (title.includes('pearl star')) return '/images/bracelet_pearl_star.jpg';
  if (title.includes('white pearl')) return '/images/bracelet_white_pearl.jpg';
  if (title.includes('crystal bloom')) return '/images/bracelet_crystal_bloom.jpg';
  if (title.includes('sage green')) return '/images/bracelet_sage_green.jpg';

  return '/images/cat_bracelets.png';
}

export function getAccentDisplay(item) {
  if (!item) return { name: 'Hitam', hex: '#181A1F', border: '#000000' };

  const raw = (
    item.accentColorName ||
    item.accentColor ||
    item.starColorName ||
    item.starColor ||
    item.bellColorName ||
    item.bellColor ||
    item.customDetails?.accentColorName ||
    item.customDetails?.accentColor ||
    item.customDetails?.starColorName ||
    item.customDetails?.starColor ||
    item.customDetails?.bellColorName ||
    item.customDetails?.bellColor ||
    'Hitam'
  ).toString().toLowerCase();

  if (raw.includes('putih') || raw.includes('white')) {
    return { name: 'Putih', hex: '#FFFFFF', border: '#CBD5E1' };
  }
  if (raw.includes('cokelat') || raw.includes('brown') || raw.includes('coklat')) {
    return { name: 'Coklat Muda', hex: '#B08968', border: '#6F4E2F' };
  }
  return { name: 'Hitam', hex: '#181A1F', border: '#000000' };
}

export function getCharmIcon(charm) {
  if (!charm) return '★';
  if (typeof charm === 'string') {
    const s = charm.toLowerCase();
    if (s.includes('gitar') || s.includes('guitar')) return '🎸';
    if (s.includes('game boy') || s.includes('gameboy')) return '🎮';
    if (s.includes('kaset') || s.includes('cassette')) return '📼';
    return '★';
  }

  const name = (charm.name || '').toLowerCase();
  const icon = charm.icon;

  if (name.includes('gitar') || name.includes('guitar')) return '🎸';
  if (name.includes('game boy') || name.includes('gameboy')) return '🎮';
  if (name.includes('kaset') || name.includes('cassette')) return '📼';
  if (name.includes('bintang') || name.includes('star')) return '⭐';
  if (name.includes('hati') || name.includes('love') || name.includes('heart')) return '💖';
  if (name.includes('kupu') || name.includes('butterfly')) return '🦋';
  if (name.includes('bunga') || name.includes('flower')) return '🌸';
  if (name.includes('lonceng') || name.includes('bell')) return '🔔';

  if (icon && icon !== '?') return icon;
  return '★';
}

export function resolveCordName(rawCord) {
  if (!rawCord) return 'Hitam Polos';
  const trimmed = String(rawCord).trim();
  if (!trimmed.startsWith('#')) return trimmed;

  const hexMap = {
    '#18181b': 'Hitam Polos',
    '#ffffff': 'Putih Polos',
    '#7f1d1d': 'Marun Polos',
    '#f9a8d4': 'Pink Muda',
    '#fde047': 'Kuning Muda',
    '#93c5fd': 'Biru Muda',
    '#b08968': 'Coklat Muda',
    '#111317': 'Hitam Polos',
    '#1a1d20': 'Hitam Polos',
    '#0f172a': 'Hitam Polos',
    '#1e293b': 'Hitam Polos',
    '#a0aec0': 'Silver',
    '#cbd5e1': 'Silver',
    '#3e2723': 'Cokelat',
    '#475569': 'Abu-abu',
    '#94a3b8': 'Abu-abu',
    '#00f2fe': 'Cyan'
  };

  const lower = trimmed.toLowerCase();
  return hexMap[lower] || trimmed;
}

