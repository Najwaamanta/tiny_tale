import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Check,
  RotateCw,
  FlipHorizontal,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Move,
  Upload,
  Crop,
  Sliders
} from 'lucide-react';
import { useBodyScrollLock } from '../utils/scrollLock';

export default function PhotoAdjustModal({
  isOpen = false,
  onClose,
  imageSrc,
  slotIndex = 0,
  slotLabel = 'Foto',
  slotRatio = 1.35, // width / height
  slotRadius = '8px',
  initialTransform = null,
  onApply,
  onChangePhoto
}) {
  useBodyScrollLock(isOpen);

  // Transform states
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [flipX, setFlipX] = useState(false);

  // Dragging states
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });
  const pinchStartDistRef = useRef(null);
  const pinchStartZoomRef = useRef(1);

  // Viewport container measurement
  const viewportRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });

  // Initialize or reset transform when modal opens or image changes
  useEffect(() => {
    if (isOpen && imageSrc) {
      if (initialTransform) {
        setZoom(initialTransform.zoom || 1);
        setPanX(initialTransform.panX || 0);
        setPanY(initialTransform.panY || 0);
        setRotate(initialTransform.rotate || 0);
        setFlipX(initialTransform.flipX || false);
      } else {
        setZoom(1);
        setPanX(0);
        setPanY(0);
        setRotate(0);
        setFlipX(false);
      }

      // Load natural image dimensions
      const img = new Image();
      img.onload = () => {
        setImageSize({
          width: img.naturalWidth || 600,
          height: img.naturalHeight || 600
        });
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc, initialTransform]);

  // Calculate viewport dimensions to fit modal
  // Max width in modal is 320px on mobile, 380px on desktop
  const maxViewportW = Math.min(340, typeof window !== 'undefined' ? window.innerWidth - 64 : 340);
  let viewportW = maxViewportW;
  let viewportH = Math.round(viewportW / (slotRatio || 1.35));

  // If height is too tall for screen, scale down
  if (viewportH > 320) {
    viewportH = 320;
    viewportW = Math.round(viewportH * (slotRatio || 1.35));
  }

  // Pointer drag event handlers (Mouse + Touch)
  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: panX,
      initialPanY: panY
    };
    if (e.target.setPointerCapture) {
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanX(dragStartRef.current.initialPanX + dx);
    setPanY(dragStartRef.current.initialPanY + dy);
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    if (e.target.releasePointerCapture) {
      try {
        e.target.releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => Math.min(3.0, Math.max(1.0, parseFloat((prev + delta).toFixed(2)))));
  };

  // Touch pinch-to-zoom
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      pinchStartZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchStartDistRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleDelta = dist / pinchStartDistRef.current;
      const newZoom = Math.min(3.0, Math.max(1.0, pinchStartZoomRef.current * scaleDelta));
      setZoom(parseFloat(newZoom.toFixed(2)));
    }
  };

  const handleTouchEnd = () => {
    pinchStartDistRef.current = null;
  };

  // Quick Action buttons
  const handleRotate = () => {
    setRotate((prev) => (prev + 90) % 360);
  };

  const handleFlip = () => {
    setFlipX((prev) => !prev);
  };

  const handleCenter = () => {
    setPanX(0);
    setPanY(0);
  };

  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setRotate(0);
    setFlipX(false);
  };

  // Compute base cover scale
  const isRotated90 = rotate % 180 !== 0;
  const effW = isRotated90 ? imageSize.height : imageSize.width;
  const effH = isRotated90 ? imageSize.width : imageSize.height;
  const baseScale = Math.max(viewportW / effW, viewportH / effH) || 1;
  const activeScale = baseScale * zoom;

  // Export cropped & adjusted high-res image
  const handleSave = () => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        // High-res output canvas
        const exportW = Math.max(1000, img.naturalWidth);
        const exportH = Math.round(exportW / (slotRatio || 1.35));
        const factor = exportW / viewportW;

        const canvas = document.createElement('canvas');
        canvas.width = exportW;
        canvas.height = exportH;
        const ctx = canvas.getContext('2d');

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Translate to canvas center + pan offset
        ctx.translate(exportW / 2 + panX * factor, exportH / 2 + panY * factor);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.scale((flipX ? -1 : 1) * activeScale * factor, activeScale * factor);

        // Draw image centered
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2, img.naturalWidth, img.naturalHeight);

        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.94);
        const transformConfig = { zoom, panX, panY, rotate, flipX, originalSrc: imageSrc };

        if (onApply) {
          onApply(croppedDataUrl, transformConfig);
        }
        onClose();
      } catch (err) {
        console.error('Failed to export cropped image:', err);
        // Fallback to raw image if export fails
        if (onApply) {
          onApply(imageSrc, { zoom, panX, panY, rotate, flipX, originalSrc: imageSrc });
        }
        onClose();
      }
    };
    img.onerror = () => {
      if (onApply) onApply(imageSrc, null);
      onClose();
    };
    img.src = imageSrc;
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 12, 25, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="photo-adjust-modal"
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
          animation: 'slideUpModal 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #F1ECE6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FAF8F5'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#EEF2FF',
                color: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Crop size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>
                Atur Posisi Foto
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#6B7280', margin: '2px 0 0' }}>
                {slotLabel} • Geser dan perbesar seperti di Canva
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '18px 20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          {/* Instructions Hint */}
          <div
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '10px',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#15803D',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              lineHeight: 1.4
            }}
          >
            <span>💡</span>
            <span>
              <strong>Tarik foto</strong> untuk menggeser posisinya, lalu gunakan slider zoom di bawah untuk perbesar bagian favoritmu.
            </span>
          </div>

          {/* Interactive Crop Viewport */}
          <div
            style={{
              position: 'relative',
              width: `${viewportW}px`,
              height: `${viewportH}px`,
              borderRadius: slotRadius || '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15), 0 0 0 2px #4F46E5',
              cursor: isDragging ? 'grabbing' : 'grab',
              backgroundColor: '#1E1B24',
              userSelect: 'none',
              touchAction: 'none'
            }}
            ref={viewportRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* The Scaled & Translated Image */}
            {imageSrc && (
              <img
                src={imageSrc}
                alt="Adjust preview"
                draggable={false}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) translate(${panX}px, ${panY}px) rotate(${rotate}deg) scale(${flipX ? -1 : 1}, 1) scale(${activeScale})`,
                  transformOrigin: 'center center',
                  pointerEvents: 'none',
                  maxWidth: 'none',
                  maxHeight: 'none',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
              />
            )}

            {/* Rule of Thirds Grid Overlay (Canva Style) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(3, 1fr)',
                border: '1px solid rgba(255, 255, 255, 0.45)',
                boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.2)'
              }}
            >
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    borderRight: (i % 3 !== 2) ? '1px dashed rgba(255, 255, 255, 0.35)' : 'none',
                    borderBottom: (Math.floor(i / 3) !== 2) ? '1px dashed rgba(255, 255, 255, 0.35)' : 'none'
                  }}
                />
              ))}
            </div>

            {/* Floating Quick Pan Indicator Badge */}
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(0, 0, 0, 0.65)',
                color: '#FFFFFF',
                fontSize: '0.68rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                pointerEvents: 'none',
                backdropFilter: 'blur(4px)'
              }}
            >
              <Move size={11} />
              <span>Geser</span>
            </div>
          </div>

          {/* Zoom Slider Control */}
          <div
            style={{
              width: '100%',
              background: '#FAF8F5',
              padding: '12px 16px',
              borderRadius: '16px',
              border: '1px solid #ECE6DC'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}
            >
              <label
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sliders size={14} color="#4F46E5" />
                <span>Skala / Perbesar Foto</span>
              </label>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#4F46E5',
                  background: '#EEF2FF',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}
              >
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1.0, parseFloat((z - 0.1).toFixed(2))))}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#4B5563',
                  flexShrink: 0
                }}
                title="Perkecil"
              >
                <ZoomOut size={16} />
              </button>

              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.02"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: '#4F46E5',
                  cursor: 'pointer',
                  height: '6px'
                }}
              />

              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3.0, parseFloat((z + 0.1).toFixed(2))))}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#4F46E5',
                  flexShrink: 0
                }}
                title="Perbesar"
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>

          {/* Quick Action Toolbar (Rotate, Flip, Center, Reset) */}
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px'
            }}
          >
            <button
              type="button"
              onClick={handleRotate}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 4px',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                cursor: 'pointer',
                color: '#374151',
                fontSize: '0.72rem',
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
              title="Putar 90 derajat searah jarum jam"
            >
              <RotateCw size={16} color="#4F46E5" />
              <span>Putar 90°</span>
            </button>

            <button
              type="button"
              onClick={handleFlip}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 4px',
                background: flipX ? '#EEF2FF' : '#FFFFFF',
                border: flipX ? '1.5px solid #6366F1' : '1px solid #E5E7EB',
                borderRadius: '12px',
                cursor: 'pointer',
                color: flipX ? '#4F46E5' : '#374151',
                fontSize: '0.72rem',
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
              title="Cerminkan foto ke kiri/kanan"
            >
              <FlipHorizontal size={16} color={flipX ? '#4F46E5' : '#6B7280'} />
              <span>Balik</span>
            </button>

            <button
              type="button"
              onClick={handleCenter}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 4px',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                cursor: 'pointer',
                color: '#374151',
                fontSize: '0.72rem',
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
              title="Kembalikan posisi ke tengah"
            >
              <Move size={16} color="#059669" />
              <span>Tengah</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 4px',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                cursor: 'pointer',
                color: '#6B7280',
                fontSize: '0.72rem',
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
              title="Reset ke pengaturan awal"
            >
              <RefreshCw size={15} color="#DC2626" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #F1ECE6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            background: '#FAF8F5'
          }}
        >
          {onChangePhoto ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onChangePhoto(slotIndex);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                background: '#FFFFFF',
                color: '#4B5563',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Upload size={14} />
              <span>Ganti Foto</span>
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                background: '#FFFFFF',
                color: '#4B5563',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSave}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 20px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
              }}
            >
              <Check size={16} strokeWidth={2.5} />
              <span>Simpan Posisi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
