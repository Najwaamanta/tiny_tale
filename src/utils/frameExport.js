import { BAG_CHARM_FRAMES, getFrameSlots, SAMPLE_FRAME_PHOTOS } from '../data/initialData.js';

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
 * Resolve exact frame configuration based on what the customer actually ordered
 */
export function resolveFrameConfig(item = {}) {
  let frameId = item.frameId || item.baseId || item.layoutId;
  if (!frameId && item.customDetails) {
    frameId = item.customDetails.frameId || item.customDetails.templateId || item.customDetails.layoutId;
  }

  const titleLower = (item.title || item.name || '').toLowerCase();

  // Match ordered product to exact frame model
  if (
    titleLower.includes('baby blue') ||
    titleLower.includes('stamp') ||
    frameId === 'layout-a' ||
    frameId === 'frame-1' ||
    (item.image && item.image.includes('baby_blue'))
  ) {
    frameId = 'frame-1';
  } else if (titleLower.includes('sweet pink') || titleLower.includes('pastel pink') || frameId === 'frame-4') {
    frameId = 'frame-4';
  } else if (titleLower.includes('tactical') || titleLower.includes('moment') || frameId === 'frame-5' || frameId === 'frame-the-moment') {
    frameId = 'frame-the-moment';
  } else if (titleLower.includes('borcelle') || frameId === 'frame-borcelle' || frameId === 'frame-2') {
    frameId = 'frame-borcelle';
  } else if (!frameId) {
    frameId = 'frame-1';
  }

  let frame = BAG_CHARM_FRAMES.find((f) => f.id === frameId);

  let num = '1';
  if (frameId === 'frame-1' || frameId === '1') num = '1';
  else if (frameId === 'frame-borcelle' || frameId === 'frame-2') num = '2';
  else if (frameId === 'frame-the-moment' || frameId === 'frame-5') num = '5';
  else if (typeof frameId === 'string' && frameId.startsWith('frame-')) {
    num = frameId.replace('frame-', '');
  } else if (!isNaN(Number(frameId))) {
    num = String(frameId);
  }

  const baseImage = frame?.image || `/frames/${num}.png`;
  const overlayImage = frame?.overlayImage || `/frames/${num}_overlay.png`;
  const slots = frame?.slots || getFrameSlots(frameId) || getFrameSlots(`frame-${num}`) || [
    { id: 1, label: 'Foto 1 (Atas)', top: '17.2%', left: '14.0%', width: '71.9%', height: '22.5%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Bawah)', top: '72.4%', left: '14.0%', width: '71.9%', height: '22.6%', borderRadius: '0px' }
  ];

  let frameDisplayName = item.frameName || frame?.name;
  if (!frameDisplayName || frameDisplayName.includes('#') || frameDisplayName.includes(':')) {
    frameDisplayName = `Frame ${num || '1'}`;
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

export function getFramePhotosForItem(item = {}) {
  if (Array.isArray(item.framePhotos) && item.framePhotos.some(Boolean)) {
    return item.framePhotos;
  }
  if (item.customDetails && Array.isArray(item.customDetails.framePhotos) && item.customDetails.framePhotos.some(Boolean)) {
    return item.customDetails.framePhotos;
  }
  if (item.customPhotos && Array.isArray(item.customPhotos) && item.customPhotos.some(Boolean)) {
    return item.customPhotos;
  }
  // High quality sample photos
  return SAMPLE_FRAME_PHOTOS;
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

  // 2. Draw photos in exact slots
  const slots = frameConfig.slots || [];
  for (let idx = 0; idx < slots.length; idx++) {
    const slot = slots[idx];
    const photoSrc = photos[idx] || SAMPLE_FRAME_PHOTOS[idx % SAMPLE_FRAME_PHOTOS.length];
    if (!photoSrc) continue;

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

export async function downloadPhotostripFrame({ item, orderId = 'ATC', customerName = 'Customer' }) {
  const frameConfig = resolveFrameConfig(item);
  const photos = getFramePhotosForItem(item);
  const canvas = await renderPhotostripCanvas({ frameConfig, photos, targetW: 849, targetH: 1993 });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve(false);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const cleanName = (customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
      const cleanOrder = (orderId || 'ATC').replace(/[^a-zA-Z0-9-]/g, '_');
      a.href = url;
      a.download = `Frame-Photostrip_${cleanOrder}_${cleanName}.png`;
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
