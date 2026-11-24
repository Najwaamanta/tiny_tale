import { BAG_CHARM_FRAMES, getFrameSlots } from '../data/initialData.js';

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback without crossOrigin in case of strict origin restrictions
      const fallback = new Image();
      fallback.onload = () => resolve(fallback);
      fallback.onerror = () => resolve(null);
      fallback.src = src;
    };
    img.src = src;
  });
}

function drawImageCover(ctx, img, rx, ry, rw, rh, borderRadius = 0) {
  if (!img) return;
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  if (!imgW || !imgH) return;

  const targetAspect = rw / rh;
  const imgAspect = imgW / imgH;

  let sx, sy, sw, sh;
  if (imgAspect > targetAspect) {
    sh = imgH;
    sw = imgH * targetAspect;
    sx = (imgW - sw) / 2;
    sy = 0;
  } else {
    sw = imgW;
    sh = imgW / targetAspect;
    sx = 0;
    sy = (imgH - sh) / 2;
  }

  ctx.save();
  if (borderRadius > 0) {
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(rx, ry, rw, rh, borderRadius);
    } else {
      ctx.rect(rx, ry, rw, rh);
    }
    ctx.clip();
  }
  ctx.drawImage(img, sx, sy, sw, sh, rx, ry, rw, rh);
  ctx.restore();
}

/**
 * Resolve exact frame configuration (1-30) based on what the customer actually ordered
 */
export function resolveFrameConfig(item = {}) {
  const customDetails = item.customDetails || item.custom_details || {};
  const frameIdRaw = String(item.frameId || customDetails.frameId || item.baseId || '').trim();
  const frameNameRaw = String(item.frameName || customDetails.frameName || '').trim();
  const titleRaw = String(item.title || item.name || '').trim();
  const baseNameRaw = String(item.baseName || customDetails.baseName || '').trim();
  const imageRaw = String(item.frameImage || item.image || item.imageSrc || '').trim();

  let num = null;

  // 1. Check known aliases
  const combined = `${frameIdRaw} ${frameNameRaw} ${titleRaw} ${baseNameRaw} ${imageRaw}`.toLowerCase();
  if (frameIdRaw === 'frame-borcelle' || combined.includes('borcelle')) {
    num = '2';
  } else if (frameIdRaw === 'frame-the-moment' || combined.includes('the moment') || combined.includes('tactical')) {
    num = '5';
  } else if (combined.includes('baby blue') || combined.includes('stamp') || frameIdRaw === 'frame-1') {
    num = '1';
  } else if (combined.includes('sweet pink') || combined.includes('pastel pink') || frameIdRaw === 'frame-4') {
    num = '4';
  }

  // 2. Parse from frameIdRaw (e.g. "frame-7", "7")
  if (!num && frameIdRaw) {
    const matchId = frameIdRaw.match(/^(?:frame-)?(\d{1,2})$/i);
    if (matchId) {
      num = String(parseInt(matchId[1], 10));
    }
  }

  // 3. Parse from image URL (e.g. "/frames/18.png" or "/frames/18_overlay.png")
  if (!num && imageRaw) {
    const matchImg = imageRaw.match(/\/frames\/(\d{1,2})(?:_overlay)?\.png/i);
    if (matchImg) {
      num = String(parseInt(matchImg[1], 10));
    }
  }

  // 4. Parse from frameNameRaw (e.g. "Frame 7", "06: Brown Polka Dot", "Frame 12")
  if (!num && frameNameRaw) {
    const matchName = frameNameRaw.match(/frame\s*(\d{1,2})/i) || frameNameRaw.match(/^0?(\d{1,2}):/);
    if (matchName) {
      num = String(parseInt(matchName[1], 10));
    }
  }

  // 5. Parse from titleRaw or baseNameRaw (e.g. "Custom Photostrip Bag Charm — 06: Brown Polka Dot Fabric", "Custom Photostrip Bag Charm — Frame 7")
  if (!num && (titleRaw || baseNameRaw)) {
    const textToSearch = `${titleRaw} ${baseNameRaw}`;
    const matchTitle = textToSearch.match(/frame\s*(\d{1,2})/i) ||
                       textToSearch.match(/—\s*0?(\d{1,2}):/i) ||
                       textToSearch.match(/\b0?(\d{1,2}):/i) ||
                       textToSearch.match(/bagcharm\s*(\d{1,2})\b/i);
    if (matchTitle) {
      num = String(parseInt(matchTitle[1], 10));
    }
  }

  // Ensure num is within 1..30 if found, else default to '1'
  const parsedNum = parseInt(num, 10);
  if (isNaN(parsedNum) || parsedNum < 1 || parsedNum > 30) {
    num = '1';
  } else {
    num = String(parsedNum);
  }

  const frameId = `frame-${num}`;
  const baseImage = `/frames/${num}.png`;
  const overlayImage = `/frames/${num}_overlay.png`;
  const slots = getFrameSlots(frameId) || [
    { id: 1, label: 'Foto 1 (Atas)', top: '17.2%', left: '14.0%', width: '71.9%', height: '22.5%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Bawah)', top: '72.4%', left: '14.0%', width: '71.9%', height: '22.6%', borderRadius: '0px' }
  ];

  let frameDisplayName = frameNameRaw;
  if (!frameDisplayName || frameDisplayName.toLowerCase() === 'custom' || frameDisplayName.includes('#') || frameDisplayName.includes(':')) {
    frameDisplayName = `Frame ${num}`;
  }

  return {
    id: frameId,
    num,
    name: frameDisplayName,
    baseImage,
    overlayImage,
    slots
  };
}

/**
 * Return only genuine customer uploaded photos for this item
 */
export function getFramePhotosForItem(item = {}) {
  const customDetails = item.customDetails || item.custom_details || {};
  const candidates = [
    item.framePhotos,
    item.photos,
    customDetails.framePhotos,
    customDetails.photos,
    item.customPhotos
  ];

  for (const list of candidates) {
    if (Array.isArray(list) && list.some(Boolean)) {
      return list.filter((p) => typeof p === 'string' && p.trim().length > 0 && p !== 'PHOTO_ATTACHED');
    }
  }

  // Return empty array if customer has not uploaded photos, so crafter knows actual status
  return [];
}

export async function renderPhotostripCanvas({ frameConfig, photos = [], targetW = 849, targetH = 1993 }) {
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');

  // Background base
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 1. Draw frame background
  const baseImg = await loadImage(frameConfig.baseImage);
  if (baseImg) {
    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
  }

  // 2. Draw photos in exact slots ONLY if photo is provided by customer
  const slots = frameConfig.slots || [];
  for (let idx = 0; idx < slots.length; idx++) {
    const slot = slots[idx];
    const photoSrc = photos[idx];
    if (!photoSrc) continue; // Don't burn dummy stock photos onto customer print!

    const leftPct = parseFloat(slot.left || '10') / 100;
    const topPct = parseFloat(slot.top || '10') / 100;
    const widthPct = parseFloat(slot.width || '80') / 100;
    const heightPct = parseFloat(slot.height || '25') / 100;

    const sx = leftPct * canvas.width;
    const sy = topPct * canvas.height;
    const sw = widthPct * canvas.width;
    const sh = heightPct * canvas.height;
    const radius = slot.borderRadius ? (parseInt(slot.borderRadius, 10) * (canvas.width / 341)) : 0;

    const photoImg = await loadImage(photoSrc);
    if (photoImg) {
      drawImageCover(ctx, photoImg, sx, sy, sw, sh, radius);
    }
  }

  // 3. Draw frame overlay on top
  const overlayImg = await loadImage(frameConfig.overlayImage);
  if (overlayImg) {
    ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
  }

  return canvas;
}

export async function downloadPhotostripFrame({
  item,
  overrideFrameConfig = null,
  overridePhotos = null,
  subLabel = '',
  orderId = 'ATC',
  customerName = 'Customer'
}) {
  const frameConfig = overrideFrameConfig || resolveFrameConfig(item);
  const photos = overridePhotos !== null ? overridePhotos : getFramePhotosForItem(item);
  const canvas = await renderPhotostripCanvas({ frameConfig, photos, targetW: 849, targetH: 1993 });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve(false);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const cleanName = (customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
      const cleanOrder = (orderId || 'ATC').replace(/[^a-zA-Z0-9-]/g, '_');
      const cleanLabel = (subLabel || frameConfig.name || 'Frame').replace(/[^a-zA-Z0-9]/g, '_');
      a.href = url;
      a.download = `Frame-Photostrip_${cleanOrder}_${cleanName}_${cleanLabel}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      resolve(true);
    }, 'image/png', 0.95);
  });
}

export async function generatePhotostripPreviewUrl({ item, targetW = 424, targetH = 996 }) {
  const frameConfig = resolveFrameConfig(item);
  const photos = getFramePhotosForItem(item);
  const canvas = await renderPhotostripCanvas({ frameConfig, photos, targetW, targetH });
  return canvas.toDataURL('image/png', 0.85);
}
