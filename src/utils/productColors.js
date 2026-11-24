/**
 * Color options configuration for specific bracelet models
 */
export function getBraceletColorOptions(product) {
  if (!product) return null;
  const name = (product.name || product.title || '').toLowerCase();
  const id = (product.id || '').toLowerCase();

  // Specifically exclude Pearl Star Bracelet (which has NO color choices)
  if (
    id === 'col-pearl-star-bracelet' ||
    (name.includes('pearl star') && !name.includes('white') && !id.includes('white'))
  ) {
    return null;
  }

  // Pearl Bloom Bracelet (Sage Green / Beads) -> Hitam & Merah
  if (
    name.includes('pearl bloom') ||
    id.includes('pearl-bloom') ||
    name.includes('sage green') ||
    id.includes('sage-green') ||
    id.includes('cat-gelang-beads')
  ) {
    return [
      { id: 'hitam', label: 'Hitam', hex: '#18181B', bg: '#18181B' },
      { id: 'merah', label: 'Merah', hex: '#DC2626', bg: '#DC2626' }
    ];
  }

  // White Pearl Star Bracelet -> Biru & Pink
  if (
    name.includes('white pearl') ||
    id.includes('white-pearl')
  ) {
    return [
      { id: 'biru', label: 'Biru', hex: '#3B82F6', bg: '#3B82F6' },
      { id: 'pink', label: 'Pink', hex: '#EC4899', bg: '#EC4899' }
    ];
  }

  return null;
}

/**
 * Extracts or initializes colorStocks dictionary { [colorId]: stockNumber }
 */
export function parseProductColorStocks(product) {
  if (!product) return null;
  const opts = getBraceletColorOptions(product);
  if (!opts) return null;

  let stocks = {};
  if (product.colorStocks && typeof product.colorStocks === 'object') {
    stocks = { ...product.colorStocks };
  } else if (typeof product.highlights?.shapes === 'string' && product.highlights.shapes.startsWith('{')) {
    try {
      stocks = JSON.parse(product.highlights.shapes);
    } catch (e) {
      stocks = {};
    }
  }

  const result = {};
  const total = Number(product.stock !== undefined ? product.stock : 50);
  const half = Math.floor(total / opts.length);

  opts.forEach((opt, idx) => {
    if (stocks[opt.id] !== undefined) {
      result[opt.id] = Number(stocks[opt.id]);
    } else if (stocks[opt.label.toLowerCase()] !== undefined) {
      result[opt.id] = Number(stocks[opt.label.toLowerCase()]);
    } else {
      // Split total stock across colors evenly as default initial state
      result[opt.id] = idx === 0 ? (total - half * (opts.length - 1)) : half;
    }
  });

  return result;
}

