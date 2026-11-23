import React from 'react';
import { getFrameSlots, INITIAL_CORD_COLORS } from '../data/initialData';

export default function VisualCanvas({
  productType = 'bag_charm',
  baseModel,
  cordColor = '#111317',
  paracordModel = 'twisted-loop-tassel',
  paracordLength = 'long',
  starColor = 'hitam',
  bellColor = 'putih',
  hardware,
  customLetters = '',
  selectedCharms = [],
  selectedFrame = null,
  selectedLayoutId = 'layout-a',
  framePhotos = [],
  onSlotClick = null,
  zoomMode = false,
  onToggleZoom = null,
  onChangeFrame = null,
  isFrameConfirmed = false
}) {
  const hwColor = hardware?.color || '#F3E5AB'; // Soft gold/silver by default like ref image
  const hwBorder = hardware?.border || '#D4AF37';
  const letters = (customLetters || '').toUpperCase().slice(0, 8).split('');

  // Check if selected cord is polos (no speckle) or has speckle
  const cordObj = INITIAL_CORD_COLORS.find(
    (c) => c.hex.toLowerCase() === (cordColor || '').toLowerCase()
  );
  const isPolos = cordObj ? !cordObj.hasSpeckle : false;

  // Dynamic speckle contrast for authentic 550 paracord weave
  const getSpeckleColor = (hex) => {
    if (isPolos) return 'none'; // Solid / Polos: no dashed speckle pattern!
    if (cordObj?.speckle) return cordObj.speckle;
    if (!hex) return '#FFFFFF';
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16) || 0;
    const g = parseInt(c.substring(2, 4), 16) || 0;
    const b = parseInt(c.substring(4, 6), 16) || 0;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 135 ? '#FFFFFF' : '#1E293B';
  };
  const speckleColor = getSpeckleColor(cordColor);

  // Paracord length configurations matching reference photo
  const lengthConfig = {
    medium: { loopEndY: 325, tassel1EndY: 265, tassel2EndY: 285 },
    long: { loopEndY: 410, tassel1EndY: 345, tassel2EndY: 370 },
    short: { loopEndY: 235, tassel1EndY: 195, tassel2EndY: 210 }
  };
  const activeLength = lengthConfig[paracordLength] || lengthConfig.long;
  const { loopEndY, tassel1EndY, tassel2EndY } = activeLength;

  // Bell accent styling: 'putih' | 'hitam' | 'cokelat'
  let bellStop1 = '#FFFFFF';
  let bellStop2 = '#E2E8F0';
  let bellBorder = '#334155';
  let bellSlit = '#1E293B';
  if (bellColor === 'hitam') {
    bellStop1 = '#4A5568';
    bellStop2 = '#0F172A';
    bellBorder = '#000000';
    bellSlit = '#E2E8F0';
  } else if (bellColor === 'cokelat') {
    bellStop1 = '#D8BFAC';
    bellStop2 = '#B08968';
    bellBorder = '#6F4E2F';
    bellSlit = '#54391F';
  }

  // Star accent styling: 'hitam' | 'putih' | 'cokelat'
  let starFill = 'url(#blackStarGrad)';
  let starStroke = '#000000';
  let starStrokeWidth = '1.6';
  let starGloss = 'rgba(255,255,255,0.35)';
  if (starColor === 'putih') {
    starFill = 'url(#whiteStarGrad)';
    starStroke = '#1E293B';
    starStrokeWidth = '1.8';
    starGloss = 'rgba(255,255,255,0.95)';
  } else if (starColor === 'cokelat') {
    starFill = 'url(#brownStarGrad)';
    starStroke = '#6F4E2F';
    starStrokeWidth = '1.6';
    starGloss = 'rgba(255,255,255,0.45)';
  }

  const isBorcelle = selectedFrame?.id === 'frame-borcelle' || selectedFrame?.id === 'frame-2';
  const isTheMoment = selectedFrame?.id === 'frame-the-moment' || selectedFrame?.id === 'frame-5';
  const frameImageSrc =
    selectedFrame?.image ||
    selectedFrame?.imageSrc ||
    (isBorcelle ? '/frames/2.png' : isTheMoment ? '/frames/5.png' : (selectedFrame?.id && typeof selectedFrame.id === 'string' && selectedFrame.id.startsWith('frame-') ? `/frames/${selectedFrame.id.replace('frame-', '')}.png` : null));
  const resolveFrameNum = (fId) => {
    if (!fId) return null;
    if (fId === 'frame-borcelle' || fId === 'frame-2') return '2';
    if (fId === 'frame-the-moment' || fId === 'frame-5') return '5';
    if (typeof fId === 'string' && fId.startsWith('frame-')) {
      return fId.replace('frame-', '');
    }
    return null;
  };
  const activeFrameNum = resolveFrameNum(selectedFrame?.id);
  const baseOverlaySrc =
    selectedFrame?.overlayImage ||
    (activeFrameNum ? `/frames/${activeFrameNum}_overlay.png` : null);
  const frameOverlaySrc = baseOverlaySrc ? `${baseOverlaySrc}${baseOverlaySrc.includes('?') ? '&' : '?'}v=v28_v29_seamless` : null;
  const isLayoutB = selectedLayoutId === 'layout-b' && !frameImageSrc;
  const isLayoutC = selectedLayoutId === 'layout-c' && !frameImageSrc;
  const isLayoutD = selectedLayoutId === 'layout-d' && !frameImageSrc;

  // Resolve exact slots matching Canva landscape placement
  const activeFrameSlots = selectedFrame?.slots || getFrameSlots(selectedFrame?.id) || (
    selectedLayoutId === 'layout-b' ? [
      { id: 1, label: 'Foto 1', top: '2.6%', left: '6.7%', width: '86.6%', height: '20.5%' },
      { id: 2, label: 'Foto 2', top: '23.2%', left: '6.7%', width: '86.6%', height: '20.5%' },
      { id: 3, label: 'Foto 3', top: '55.3%', left: '6.7%', width: '86.6%', height: '20.5%' },
      { id: 4, label: 'Foto 4', top: '75.8%', left: '6.7%', width: '86.6%', height: '20.5%' }
    ] : [
      { id: 1, label: 'Foto 1 (Atas)', top: '4.3%', left: '8.5%', width: '83.0%', height: '25.8%' },
      { id: 2, label: 'Foto 2 (Tengah)', top: '32.5%', left: '8.5%', width: '83.0%', height: '25.8%' },
      { id: 3, label: 'Foto 3 (Bawah)', top: '60.5%', left: '8.5%', width: '83.0%', height: '25.8%' }
    ]
  );

  return (
    <div className="canvas-viewport" id="custom-live-canvas">
      {/* Zoom Mode Toggle Button & Ganti Frame Button */}
      {productType === 'bag_charm' && (
        <div
          className="canvas-top-controls"
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            right: '10px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
            pointerEvents: 'none'
          }}
        >
          <div className="canvas-view-toggle" style={{ flexShrink: 0, pointerEvents: 'auto' }}>
            <button
              type="button"
              className={!zoomMode ? 'active' : ''}
              onClick={() => onToggleZoom && onToggleZoom(false)}
            >
              <span className="canvas-btn-text-full">Charm View</span>
              <span className="canvas-btn-text-short">Charm</span>
            </button>
            <button
              type="button"
              className={zoomMode ? 'active' : ''}
              onClick={() => onToggleZoom && onToggleZoom(true)}
            >
              <span className="canvas-btn-text-full">Close-up Zoom</span>
              <span className="canvas-btn-text-short">Zoom</span>
            </button>
          </div>

          {onChangeFrame && (
            <button
              type="button"
              className="canvas-change-frame-btn"
              onClick={onChangeFrame}
              style={{
                pointerEvents: 'auto',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                background: isFrameConfirmed ? '#10B981' : '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '999px',
                padding: '5px 12px',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isFrameConfirmed
                  ? '0 2px 8px rgba(16, 185, 129, 0.4)'
                  : '0 2px 8px rgba(37, 99, 235, 0.4)'
              }}
              title="Ganti desain frame photostrip"
            >
              <span>{isFrameConfirmed ? '✓ Ganti Frame' : 'Ganti Frame'}</span>
            </button>
          )}
        </div>
      )}

      {/* SVG Canvas */}
      {productType === 'bag_charm' && zoomMode ? (
        /* DETAIL PHOTOSTRIP ZOOM VIEW */
        <svg
          className="canvas-svg"
          viewBox="0 0 341 1024"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ maxHeight: '520px', cursor: 'pointer' }}
        >
          <defs>
            <clipPath id="zoom-slot-oval-1">
              <ellipse cx="170" cy="168" rx="146" ry="110" />
            </clipPath>
            <clipPath id="zoom-slot-oval-2">
              <ellipse cx="170" cy="423" rx="146" ry="110" />
            </clipPath>
            <clipPath id="zoom-slot-oval-3">
              <ellipse cx="170" cy="678" rx="146" ry="110" />
            </clipPath>
          </defs>

          {frameImageSrc ? (
            <image href={frameImageSrc} x="0" y="0" width="341" height="1024" preserveAspectRatio="none" />
          ) : (
            <rect x="0" y="0" width="341" height="1024" rx="12" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="4" />
          )}

          {activeFrameSlots.map((slot, idx) => {
            const leftPct = parseFloat(slot.left || '8.5') / 100;
            const topPct = parseFloat(slot.top || '4.3') / 100;
            const widthPct = parseFloat(slot.width || '83.0') / 100;
            const heightPct = parseFloat(slot.height || '25.8') / 100;

            const zx = 341 * leftPct;
            const zy = 1024 * topPct;
            const zw = 341 * widthPct;
            const zh = 1024 * heightPct;
            const photo = framePhotos[idx];

            const pillW = Math.min(zw - 20, 140);
            const pillH = 36;
            const cx = zx + zw / 2;
            const cy = zy + zh / 2;
            const slotRx = slot.borderRadius !== undefined ? parseInt(slot.borderRadius, 10) * 2 : 0;

            return photo ? (
              <g
                key={idx}
                className="slot-canvas-interactive"
                onClick={() => onSlotClick && onSlotClick(idx)}
                style={{ cursor: 'pointer' }}
              >
                <defs>
                  <clipPath id={`zoom-slot-clip-${idx}`}>
                    <rect x={zx} y={zy} width={zw} height={zh} rx={slotRx} />
                  </clipPath>
                </defs>
                <image
                  href={photo}
                  x={zx}
                  y={zy}
                  width={zw}
                  height={zh}
                  clipPath={`url(#zoom-slot-clip-${idx})`}
                  preserveAspectRatio="xMidYMid slice"
                />
              </g>
            ) : (
              <g
                key={idx}
                className="slot-canvas-interactive"
                onClick={() => onSlotClick && onSlotClick(idx)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={zx}
                  y={zy}
                  width={zw}
                  height={zh}
                  fill="rgba(79, 70, 229, 0.06)"
                  stroke="#4F46E5"
                  strokeWidth="2.5"
                  strokeDasharray="8 6"
                  rx={slotRx}
                />
                <rect
                  x={cx - pillW / 2}
                  y={cy - pillH / 2}
                  width={pillW}
                  height={pillH}
                  rx={pillH / 2}
                  fill="#FFFFFF"
                  stroke="#4F46E5"
                  strokeWidth="1.5"
                  filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))"
                />
                <text
                  x={cx}
                  y={cy + 5}
                  fill="#4F46E5"
                  fontSize="13"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  + Upload Foto {idx + 1}
                </text>
              </g>
            );
          })}

          {frameOverlaySrc && (
            <image
              href={frameOverlaySrc}
              x="0"
              y="0"
              width="341"
              height="1024"
              preserveAspectRatio="none"
              style={{ pointerEvents: 'none' }}
            />
          )}
        </svg>
      ) : (
        /* ------------------------------------------------------------------
           WIDENED REAL-TIME CHARM PREVIEW CANVAS (MATCHING IMAGE 2)
           Wide, clear, large frame and authentic boutique charm assembly
           ------------------------------------------------------------------ */
        <svg
          className="canvas-svg"
          viewBox="82 10 250 505"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gold / Metallic Clasp Shading */}
            <linearGradient id="hwGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF9E6" />
              <stop offset="45%" stopColor={hwColor} />
              <stop offset="100%" stopColor="#B38F24" />
            </linearGradient>

            <linearGradient id="cordGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="35%" stopColor={cordColor} />
              <stop offset="100%" stopColor={cordColor} />
            </linearGradient>

            <radialGradient id="bellGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor={bellStop1} />
              <stop offset="65%" stopColor={bellStop2} />
              <stop offset="100%" stopColor="rgba(0,0,0,0.22)" />
            </radialGradient>

            <linearGradient id="whiteStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>

            <linearGradient id="blackStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#374151" />
              <stop offset="45%" stopColor="#181A1F" />
              <stop offset="100%" stopColor="#0B0D0F" />
            </linearGradient>

            <linearGradient id="brownStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4B996" />
              <stop offset="45%" stopColor="#B08968" />
              <stop offset="100%" stopColor="#8E6845" />
            </linearGradient>

            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#5C4D3C" floodOpacity="0.14" />
            </filter>

            <filter id="charmShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#3F382E" floodOpacity="0.2" />
            </filter>

            {/* Borcelle natural oval clip paths (width 128, height 80) */}
            <clipPath id="wide-bc-slot-1">
              <ellipse cx="230" cy="178" rx="64" ry="40" />
            </clipPath>
            <clipPath id="wide-bc-slot-2">
              <ellipse cx="230" cy="276" rx="64" ry="40" />
            </clipPath>
            <clipPath id="wide-bc-slot-3">
              <ellipse cx="230" cy="374" rx="64" ry="40" />
            </clipPath>

            {/* Rounded rect clip paths for Layout A (width 142, height 98) */}
            <clipPath id="layout-rect-1">
              <rect x="159" y="132" width="142" height="98" rx="4" />
            </clipPath>
            <clipPath id="layout-rect-2">
              <rect x="159" y="242" width="142" height="98" rx="4" />
            </clipPath>
            <clipPath id="layout-rect-3">
              <rect x="159" y="352" width="142" height="98" rx="4" />
            </clipPath>
          </defs>

          {/* ---------------- BAG CHARM RENDER ---------------- */}
          {productType === 'bag_charm' && (
            <g filter="url(#softShadow)">
              {/* TOP METALLIC KEYRING & CLASP (SESUAI FOTO REFERENSI) */}
              <g id="top-keyring-group">
                {/* Metallic Split Ring / Keyring Hoop */}
                <circle cx="230" cy="94" r="14.5" stroke="url(#hwGrad)" strokeWidth="3" fill="none" />
                <circle cx="230" cy="94" r="11" stroke={hwBorder} strokeWidth="0.8" fill="none" opacity="0.65" />
                <line x1="228" y1="79.5" x2="232" y2="79.5" stroke="#FFFFFF" strokeWidth="1.2" />

                {/* Connector jump ring connecting to frame rivet */}
                <circle cx="230" cy="112" r="5" stroke="url(#hwGrad)" strokeWidth="2.2" fill="none" />
              </g>

              {/* --------------------------------------------------------
                  NATURAL PHOTOSTRIP FRAME BODY (SLENDER & NEAT BOOKMARK)
                  Center X: 230, Width: 164, Height: 380 (From y:116 to 496)
                  -------------------------------------------------------- */}
              <g id="photostrip-group">
                {/* Base Frame Rendering */}
                {frameImageSrc ? (
                  <image
                    href={frameImageSrc}
                    x="148"
                    y="116"
                    width="164"
                    height="380"
                    preserveAspectRatio="none"
                    style={{ borderRadius: '8px' }}
                  />
                ) : (
                  <g>
                    {/* Clean White Polaroid / Photobooth Frame with soft border */}
                    <rect
                      x="148"
                      y="116"
                      width="164"
                      height="380"
                      rx="8"
                      fill="#FFFFFF"
                      stroke="#E5E0D8"
                      strokeWidth="2"
                    />
                    <text
                      x="230"
                      y="484"
                      fill="#71717A"
                      fontSize="8"
                      fontWeight="800"
                      letterSpacing="0.08em"
                      textAnchor="middle"
                    >
                      TINY TALE STUDIO
                    </text>
                  </g>
                )}

                {/* Top Rivet */}
                <circle cx="230" cy="124" r="3.5" fill="url(#hwGrad)" stroke="#3E3424" strokeWidth="1" />

                {/* DYNAMIC PHOTOSTRIP SLOTS MATCHING TRUE LANDSCAPE WINDOWS */}
                {activeFrameSlots.map((slot, idx) => {
                  const leftPct = parseFloat(slot.left || '8.5') / 100;
                  const topPct = parseFloat(slot.top || '4.3') / 100;
                  const widthPct = parseFloat(slot.width || '83.0') / 100;
                  const heightPct = parseFloat(slot.height || '25.8') / 100;

                  const sx = 148 + 164 * leftPct;
                  const sy = 116 + 380 * topPct;
                  const sw = 164 * widthPct;
                  const sh = 380 * heightPct;
                  const photo = framePhotos[idx];

                  const pillW = Math.min(sw - 16, 88);
                  const pillH = 24;
                  const cx = sx + sw / 2;
                  const cy = sy + sh / 2;
                  const charmSlotRx = slot.borderRadius !== undefined ? parseInt(slot.borderRadius, 10) : 0;

                  return photo ? (
                    <g
                      key={idx}
                      className="slot-canvas-interactive"
                      onClick={() => onSlotClick && onSlotClick(idx)}
                      style={{ cursor: 'pointer' }}
                    >
                      <defs>
                        <clipPath id={`charm-slot-clip-${idx}`}>
                          <rect x={sx} y={sy} width={sw} height={sh} rx={charmSlotRx} />
                        </clipPath>
                      </defs>
                      <image
                        href={photo}
                        x={sx}
                        y={sy}
                        width={sw}
                        height={sh}
                        clipPath={`url(#charm-slot-clip-${idx})`}
                        preserveAspectRatio="xMidYMid slice"
                      />
                    </g>
                  ) : (
                    <g
                      key={idx}
                      className="slot-canvas-interactive"
                      onClick={() => onSlotClick && onSlotClick(idx)}
                      style={{ cursor: 'pointer' }}
                    >
                      <rect
                        x={sx}
                        y={sy}
                        width={sw}
                        height={sh}
                        rx={charmSlotRx}
                        fill="rgba(79, 70, 229, 0.04)"
                        stroke="#4F46E5"
                        strokeWidth="1.8"
                        strokeDasharray="5 3"
                      />
                      <rect
                        x={cx - pillW / 2}
                        y={cy - pillH / 2}
                        width={pillW}
                        height={pillH}
                        rx={pillH / 2}
                        fill="#FFFFFF"
                        stroke="#4F46E5"
                        strokeWidth="1.2"
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.12))"
                      />
                      <text
                        x={cx}
                        y={cy + 4}
                        fill="#4F46E5"
                        fontSize="10"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        + Foto {idx + 1}
                      </text>
                    </g>
                  );
                })}

                {frameOverlaySrc && (
                  <image
                    href={frameOverlaySrc}
                    x="148"
                    y="116"
                    width="164"
                    height="380"
                    preserveAspectRatio="none"
                    style={{ pointerEvents: 'none', borderRadius: '8px' }}
                  />
                )}
              </g>

              {/* --------------------------------------------------------
                  TALI PARACORD / AKSEN SAMPING (SESUAI GAMBAR REFERENSI)
                  Hanging along the left side of photostrip frame
                  -------------------------------------------------------- */}
              <g id="side-paracord-group" filter="url(#charmShadow)">
                {/* TOP GATHERING / PARACORD KNOT AT CLASP */}
                <g className="paracord-top-knot">
                  <rect x="210" y="104" width="16" height="4.5" rx="2" fill={cordColor} stroke={isPolos ? 'none' : speckleColor} strokeWidth="0.6" />
                  <rect x="209" y="108" width="17" height="4.5" rx="2" fill={cordColor} stroke={isPolos ? 'none' : speckleColor} strokeWidth="0.6" />
                  <rect x="210" y="112" width="16" height="4.5" rx="2" fill={cordColor} stroke={isPolos ? 'none' : speckleColor} strokeWidth="0.6" />
                  <rect x="211" y="116" width="15" height="4.5" rx="2" fill={cordColor} stroke={isPolos ? 'none' : speckleColor} strokeWidth="0.6" />
                  <rect x="215" y="107" width="5" height="12" rx="1" fill="url(#hwGrad)" stroke={hwBorder} strokeWidth="0.5" />
                </g>

                {/* MODEL 1: TWISTED LOOP & DUAL TASSEL (SESUAI FOTO REFERENSI) */}
                {paracordModel === 'twisted-loop-tassel' && (
                  <g className="model-twisted-loop">
                    {/* 1. Main Paracord Loop */}
                    <path
                      d={`M 213 120 C 185 140, 116 175, 115 ${(120 + loopEndY) / 2} C 114 ${loopEndY - 20}, 121 ${loopEndY}, 131 ${loopEndY} C 141 ${loopEndY}, 145 ${loopEndY - 25}, 146 ${(120 + loopEndY) / 2} C 147 185, 185 145, 218 120`}
                      stroke={cordColor}
                      strokeWidth="6.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d={`M 213 120 C 185 140, 116 175, 115 ${(120 + loopEndY) / 2} C 114 ${loopEndY - 20}, 121 ${loopEndY}, 131 ${loopEndY} C 141 ${loopEndY}, 145 ${loopEndY - 25}, 146 ${(120 + loopEndY) / 2} C 147 185, 185 145, 218 120`}
                      stroke={speckleColor}
                      strokeWidth="2.2"
                      strokeDasharray="3 4"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {!isPolos && (
                      <path
                        d={`M 213 120 C 185 140, 116 175, 115 ${(120 + loopEndY) / 2} C 114 ${loopEndY - 20}, 121 ${loopEndY}, 131 ${loopEndY} C 141 ${loopEndY}, 145 ${loopEndY - 25}, 146 ${(120 + loopEndY) / 2} C 147 185, 185 145, 218 120`}
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="1.2"
                        strokeDasharray="2 6"
                        fill="none"
                      />
                    )}

                    {/* 2. Dangling Strand 1 with Knot & Tassel */}
                    <path
                      d={`M 212 122 C 180 150, 130 185, 130 ${tassel1EndY}`}
                      stroke={cordColor}
                      strokeWidth="5.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d={`M 212 122 C 180 150, 130 185, 130 ${tassel1EndY}`}
                      stroke={speckleColor}
                      strokeWidth="1.8"
                      strokeDasharray="3 4"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx="130" cy={tassel1EndY} r="4.5" fill={cordColor} stroke={isPolos ? 'none' : speckleColor} strokeWidth="0.8" />
                    <line x1="128" y1={tassel1EndY + 3} x2="125" y2={tassel1EndY + 12} stroke={cordColor} strokeWidth="1.6" strokeLinecap="round" />
                    <line x1="130" y1={tassel1EndY + 4} x2="130" y2={tassel1EndY + 14} stroke={isPolos ? cordColor : speckleColor} strokeWidth="1.4" strokeLinecap="round" />
                    <line x1="132" y1={tassel1EndY + 3} x2="135" y2={tassel1EndY + 12} stroke={cordColor} strokeWidth="1.6" strokeLinecap="round" />

                    {/* 3. Dangling Strand 2 with Knot & Tassel */}
                    <path
                      d={`M 215 122 C 175 160, 140 195, 140 ${tassel2EndY}`}
                      stroke={cordColor}
                      strokeWidth="5.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d={`M 215 122 C 175 160, 140 195, 140 ${tassel2EndY}`}
                      stroke={speckleColor}
                      strokeWidth="1.8"
                      strokeDasharray="3 4"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx="140" cy={tassel2EndY} r="4.5" fill={cordColor} stroke={isPolos ? 'none' : speckleColor} strokeWidth="0.8" />
                    <line x1="138" y1={tassel2EndY + 3} x2="135" y2={tassel2EndY + 13} stroke={cordColor} strokeWidth="1.6" strokeLinecap="round" />
                    <line x1="140" y1={tassel2EndY + 4} x2="140" y2={tassel2EndY + 15} stroke={isPolos ? cordColor : speckleColor} strokeWidth="1.4" strokeLinecap="round" />
                    <line x1="142" y1={tassel2EndY + 3} x2="145" y2={tassel2EndY + 13} stroke={cordColor} strokeWidth="1.6" strokeLinecap="round" />
                  </g>
                )}

                {/* MODEL 2: TACTICAL SNAKE KNOT */}
                {paracordModel === 'tactical-snake-knot' && (
                  <g className="model-tactical-snake">
                    <path
                      d={`M 213 120 L 138 135 L 138 ${loopEndY - 20}`}
                      stroke={cordColor}
                      strokeWidth="10"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {Array.from({ length: Math.max(4, Math.round((loopEndY - 150) / 16)) }).map((_, i) => {
                      const ny = 135 + i * 16;
                      const nx = 138 + (i % 2 === 0 ? -2 : 2);
                      return (
                        <g key={i}>
                          <rect x={nx - 9} y={ny} width="18" height="12" rx="3.5" fill={cordColor} stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" />
                          <rect x={nx - 7} y={ny + 2} width="14" height="4" rx="1.5" fill={speckleColor === 'none' ? 'none' : speckleColor} opacity="0.85" />
                        </g>
                      );
                    })}
                    {/* Ending cords */}
                    <line x1="134" y1={loopEndY - 20} x2="131" y2={tassel1EndY} stroke={cordColor} strokeWidth="4.5" strokeLinecap="round" />
                    <circle cx="131" cy={tassel1EndY} r="4" fill={cordColor} stroke={isPolos ? 'none' : speckleColor} strokeWidth="0.8" />
                    <line x1="142" y1={loopEndY - 20} x2="144" y2={tassel2EndY} stroke={cordColor} strokeWidth="4.5" strokeLinecap="round" />
                    <circle cx="144" cy={tassel2EndY} r="4" fill={cordColor} stroke={isPolos ? 'none' : speckleColor} strokeWidth="0.8" />
                  </g>
                )}

                {/* MODEL 3: PASTEL AESTHETIC ROPE */}
                {paracordModel === 'spiral-pastel-cord' && (
                  <g className="model-spiral-pastel">
                    {/* Cute ribbon bow at top */}
                    <ellipse cx="206" cy="118" rx="8" ry="4.5" transform="rotate(-25 206 118)" fill={cordColor} stroke="#FFFFFF" strokeWidth="1" />
                    <ellipse cx="220" cy="118" rx="8" ry="4.5" transform="rotate(25 220 118)" fill={cordColor} stroke="#FFFFFF" strokeWidth="1" />
                    <circle cx="213" cy="118" r="3.5" fill={cordColor} stroke="#FFFFFF" strokeWidth="1" />
                    {/* Soft braided rope loops */}
                    <path
                      d={`M 213 120 C 175 140, 120 175, 122 ${(120 + loopEndY) / 2} C 124 ${loopEndY}, 136 ${loopEndY}, 138 ${loopEndY - 15} C 140 ${loopEndY - 40}, 144 185, 215 120`}
                      stroke={cordColor}
                      strokeWidth="6"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d={`M 213 120 C 175 140, 120 175, 122 ${(120 + loopEndY) / 2} C 124 ${loopEndY}, 136 ${loopEndY}, 138 ${loopEndY - 15} C 140 ${loopEndY - 40}, 144 185, 215 120`}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      strokeDasharray="5 5"
                      fill="none"
                    />
                    {/* Dangling tails */}
                    <path d={`M 210 122 C 170 160, 134 200, 134 ${tassel2EndY}`} stroke={cordColor} strokeWidth="4.5" strokeLinecap="round" fill="none" />
                    <circle cx="134" cy={tassel2EndY} r="4" fill="#FFFFFF" stroke={cordColor} strokeWidth="1.5" />
                  </g>
                )}

                {/* MODEL 4: DUAL HANGING LOOP */}
                {paracordModel === 'double-loop-wave' && (
                  <g className="model-double-loop">
                    {/* Outer loop */}
                    <path
                      d={`M 213 120 C 170 145, 114 180, 115 ${(120 + loopEndY) / 2} C 116 ${loopEndY}, 132 ${loopEndY}, 138 ${(120 + loopEndY) / 2} C 140 185, 175 140, 218 120`}
                      stroke={cordColor}
                      strokeWidth="5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d={`M 213 120 C 170 145, 114 180, 115 ${(120 + loopEndY) / 2} C 116 ${loopEndY}, 132 ${loopEndY}, 138 ${(120 + loopEndY) / 2} C 140 185, 175 140, 218 120`}
                      stroke={speckleColor}
                      strokeWidth="1.8"
                      strokeDasharray="3 4"
                      fill="none"
                    />
                    {/* Inner loop */}
                    <path
                      d={`M 213 122 C 180 145, 126 175, 128 ${(120 + tassel1EndY) / 2} C 129 ${tassel1EndY}, 142 ${tassel1EndY}, 145 180 C 146 160, 185 135, 216 122`}
                      stroke={cordColor}
                      strokeWidth="5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d={`M 213 122 C 180 145, 126 175, 128 ${(120 + tassel1EndY) / 2} C 129 ${tassel1EndY}, 142 ${tassel1EndY}, 145 180 C 146 160, 185 135, 216 122`}
                      stroke={speckleColor}
                      strokeWidth="1.8"
                      strokeDasharray="3 4"
                      fill="none"
                    />
                  </g>
                )}

                {/* AKSEN LONCENG & BINTANG WAVY AKRILIK (SESUAI FOTO REFERENSI) */}
                <g id="paracord-side-accents">
                  {/* Ball chain hanging from top ring */}
                  <g className="ball-chain">
                    {[
                      { x: 216, y: 106 },
                      { x: 200, y: 110 },
                      { x: 184, y: 115 },
                      { x: 168, y: 122 },
                      { x: 152, y: 128 },
                      { x: 136, y: 134 },
                      { x: 120, y: 140 },
                      { x: 110, y: 145 }
                    ].map((pt, i, arr) => (
                      <React.Fragment key={i}>
                        {i > 0 && (
                          <line x1={arr[i - 1].x} y1={arr[i - 1].y} x2={pt.x} y2={pt.y} stroke="url(#hwGrad)" strokeWidth="1" />
                        )}
                        <circle cx={pt.x} cy={pt.y} r="1.8" fill="url(#hwGrad)" stroke={hwBorder} strokeWidth="0.5" />
                      </React.Fragment>
                    ))}
                  </g>

                  {/* Wavy Star Acrylic Charm with dynamic color: Hitam / Putih / Cokelat */}
                  <g transform="translate(100, 142)" filter="url(#charmShadow)">
                    {/* Top Jump Ring to Chain */}
                    <circle cx="0" cy="-21" r="3" fill="none" stroke="url(#hwGrad)" strokeWidth="1.2" />

                    {/* Compound Wavy Star Ring with hollow star center */}
                    <path
                      d="M -3.4 -16.3 Q 0.0 -21.0 3.4 -16.3 L 4.7 -14.6 Q 7.6 -10.5 12.4 -9.0 L 14.4 -8.3 Q 20.0 -6.5 16.5 -1.8 L 15.3 -0.0 Q 12.4 4.0 12.4 9.0 L 12.4 11.2 Q 12.3 17.0 6.8 15.2 L 4.8 14.5 Q 0.0 13.0 -4.8 14.5 L -6.8 15.2 Q -12.3 17.0 -12.4 11.2 L -12.4 9.0 Q -12.4 4.0 -15.3 -0.0 L -16.5 -1.8 Q -20.0 -6.5 -14.4 -8.3 L -12.4 -9.0 Q -7.6 -10.5 -4.7 -14.6 Z M -1.7 -8.7 Q 0.0 -11.5 1.7 -8.7 L 2.3 -7.8 Q 3.8 -5.3 6.7 -4.6 L 7.7 -4.3 Q 10.9 -3.6 8.8 -1.1 L 8.1 -0.3 Q 6.2 2.0 6.4 5.0 L 6.5 6.0 Q 6.8 9.3 3.7 8.0 L 2.8 7.6 Q 0.0 6.5 -2.8 7.6 L -3.7 8.0 Q -6.8 9.3 -6.5 6.0 L -6.4 5.0 Q -6.2 2.0 -8.1 -0.3 L -8.8 -1.1 Q -10.9 -3.6 -7.7 -4.3 L -6.7 -4.6 Q -3.8 -5.3 -2.3 -7.8 Z"
                      fillRule="evenodd"
                      fill={starFill}
                      stroke={starStroke}
                      strokeWidth={starStrokeWidth}
                      strokeLinejoin="round"
                    />

                    {/* Glossy Acrylic Surface Sheen Highlight */}
                    <path
                      d="M -13 -7 Q -6 -9 0 -17 Q 6 -9 13 -7"
                      fill="none"
                      stroke={starGloss}
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* Hanging Bell with dynamic color: Putih / Hitam / Cokelat */}
                  <g transform="translate(118, 175)" filter="url(#charmShadow)">
                    <line x1="-8" y1="-30" x2="0" y2="-12" stroke="url(#hwGrad)" strokeWidth="1.2" />
                    <circle cx="0" cy="-12" r="3" fill="none" stroke={bellBorder} strokeWidth="1.2" />
                    <circle cx="0" cy="0" r="10.5" fill="url(#bellGrad)" stroke={bellBorder} strokeWidth="1.4" />
                    <line x1="-9" y1="1" x2="9" y2="1" stroke="rgba(0,0,0,0.22)" strokeWidth="1" />
                    <path
                      d="M -6 4 Q 0 7 6 4"
                      stroke={bellSlit}
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx="0" cy="5" r="1.8" fill={bellSlit} />
                    <ellipse cx="-3.5" cy="-4" rx="3.5" ry="2" fill="#FFFFFF" opacity="0.8" transform="rotate(-25 -3.5 -4)" />
                  </g>
                </g>
              </g>

              {/* Custom Initial Tag at bottom of frame if entered */}
              {letters.length > 0 && (
                <g transform="translate(230, 480)">
                  <rect
                    x={-(letters.length * 6 + 10)}
                    y="-8"
                    width={letters.length * 12 + 20}
                    height="16"
                    rx="3.5"
                    fill="#FFFFFF"
                    stroke="rgba(0,0,0,0.18)"
                    strokeWidth="1"
                    filter="url(#charmShadow)"
                  />
                  <text
                    x="0"
                    y="3.5"
                    fill="#181A1F"
                    fontSize="8.5"
                    fontWeight="800"
                    letterSpacing="0.1em"
                    textAnchor="middle"
                  >
                    {letters.join(' ')}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* ---------------- GELANG (BRACELET) RENDER ---------------- */}
          {productType === 'gelang' && (
            <g filter="url(#softShadow)">
              {/* Bracelet Loop */}
              <ellipse cx="230" cy="280" rx="140" ry="110" stroke={cordColor} strokeWidth="18" fill="none" />
              <ellipse cx="230" cy="280" rx="140" ry="110" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeDasharray="6 6" fill="none" />

              {/* Adjustable Clasp */}
              <g transform="translate(212, 380)">
                <rect width="36" height="16" rx="4" fill="url(#hwGrad)" stroke={hwBorder} strokeWidth="1.5" />
                <circle cx="10" cy="8" r="3" fill="#21201D" />
                <circle cx="26" cy="8" r="3" fill="#21201D" />
              </g>

              {/* Hanging cord ends */}
              <line x1="222" y1="396" x2="212" y2="450" stroke={cordColor} strokeWidth="4.5" strokeLinecap="round" />
              <circle cx="212" cy="450" r="4.5" fill="url(#hwGrad)" />
              <line x1="238" y1="396" x2="248" y2="450" stroke={cordColor} strokeWidth="4.5" strokeLinecap="round" />
              <circle cx="248" cy="450" r="4.5" fill="url(#hwGrad)" />

              {/* Name letters in center */}
              {letters.length > 0 && (
                <g transform="translate(230, 180)">
                  <rect
                    x={-(letters.length * 15 + 10)}
                    y="-15"
                    width={letters.length * 30 + 20}
                    height="30"
                    rx="8"
                    fill="#FFFFFF"
                    stroke="#E5E0D8"
                    strokeWidth="2"
                  />
                  {letters.map((char, i) => (
                    <text
                      key={i}
                      x={-(letters.length - 1) * 15 + i * 30}
                      y="6"
                      fill="#21201D"
                      fontSize="14"
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      {char}
                    </text>
                  ))}
                </g>
              )}

              {/* Selected charms dangling on neat accent chain */}
              {selectedCharms.length > 0 && (
                <g id="selected-charms-group" filter="url(#charmShadow)">
                  {selectedCharms.map((ch, i) => {
                    const cx = 86 + i * 36;
                    const cy = 224;
                    return (
                      <g key={ch.id || i}>
                        {/* Hanging ball chain */}
                        <line x1={cx} y1="185" x2={cx} y2={cy - 16} stroke="url(#hwGrad)" strokeWidth="1.5" strokeDasharray="2,2" />
                        <circle cx={cx} cy={cy - 16} r="3" fill="none" stroke="url(#hwGrad)" strokeWidth="1.2" />
                        {/* Charm Ring & Badge */}
                        <circle cx={cx} cy={cy} r="15" fill="#FFFFFF" stroke="url(#hwGrad)" strokeWidth="2" />
                        {ch.image ? (
                          <g>
                            <clipPath id={`charm-circle-clip-${i}`}>
                              <circle cx={cx} cy={cy} r="13.5" />
                            </clipPath>
                            <image
                              href={ch.image}
                              x={cx - 13.5}
                              y={cy - 13.5}
                              width="27"
                              height="27"
                              clipPath={`url(#charm-circle-clip-${i})`}
                              preserveAspectRatio="xMidYMid slice"
                            />
                          </g>
                        ) : (
                          <>
                            <circle cx={cx} cy={cy} r="13" fill="#F8FAFC" />
                            <text x={cx} y={cy + 6} fontSize="16" textAnchor="middle" style={{ userSelect: 'none' }}>
                              {ch.icon || '⭐'}
                            </text>
                          </>
                        )}
                      </g>
                    );
                  })}
                </g>
              )}
            </g>
          )}
        </svg>
      )}
    </div>
  );
}
