import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, ShoppingBag, ArrowRight, ArrowLeft, Camera, Upload, Trash2, Heart, Search } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ALL_FRAME_TEMPLATES } from './FrameLayoutSelector.jsx';

export default function BundlingSelectionModal({
  isOpen,
  onClose,
  bundlingProduct,
  collections = [],
  onConfirm,
  onGoToCustomStudio
}) {
  if (!isOpen || !bundlingProduct) return null;

  // Determine exact bundle type: 1, 2, or 3
  const getBundleType = (prod) => {
    const id = prod?.id || '';
    if (id.includes('bundle-couple-1') || id.endsWith('-1') || id.endsWith('couple-1')) return 1;
    if (id.includes('bundle-couple-2') || id.endsWith('-2') || id.endsWith('couple-2')) return 2;
    if (id.includes('bundle-couple-3') || id.endsWith('-3') || id.endsWith('couple-3')) return 3;

    const name = (prod?.name || '').toLowerCase();
    if (name.includes('bestie 1') || name.includes('couple 1')) return 1;
    if (name.includes('bestie 2') || name.includes('couple 2')) return 2;
    if (name.includes('bestie 3') || name.includes('couple 3')) return 3;

    return 1;
  };

  const bundleType = getBundleType(bundlingProduct);

  // If Bundle 2 (2 Bagcharm), never show modal - redirect directly to custom studio!
  useEffect(() => {
    if (bundleType === 2) {
      if (onGoToCustomStudio) {
        onGoToCustomStudio({
          bundlingProduct,
          bundleType: 2
        });
      }
      onClose();
    }
  }, [bundleType]);

  if (bundleType === 2) return null;

  // Available bracelets from live collections
  const availableBracelets = collections.filter(
    (c) => c.category === 'bracelets' || c.type === 'gelang' || c.id?.includes('bracelet')
  );

  // Fallback if collections is empty
  const defaultBracelets = availableBracelets.length > 0 ? availableBracelets : [
    { id: 'col-pearl-star-bracelet', name: 'Pearl Star Bracelet', image: '/images/bracelet_pearl_star.jpg', description: 'Mutiara putih gading kilau lembut & charm iridescent star' },
    { id: 'col-white-pearl-bracelet', name: 'White Pearl Star Bracelet', image: '/images/bracelet_white_pearl.jpg', description: 'Mutiara putih bersih elegan & star charm minimalis' },
    { id: 'col-sage-green-bracelet', name: 'Sage Green Pearl Bracelet', image: '/images/bracelet_sage_green.jpg', description: 'Sage green pastel lembut & mutiara putih gading' },
    { id: 'col-crystal-bloom-bracelet', name: 'Crystal Bloom Bracelet', image: '/images/bracelet_crystal_bloom.jpg', description: 'Manik kristal faset transparan & charm kelopak sakura' }
  ];

  // ALL 30 Frames for Bagcharm
  const allFrames = ALL_FRAME_TEMPLATES && ALL_FRAME_TEMPLATES.length > 0 ? ALL_FRAME_TEMPLATES : [
    { id: 'frame-1', name: '01: Tiny Tale Stamp Classic', badge: '2 Slot Stamp', imageSrc: '/frames/1.png' },
    { id: 'frame-borcelle', name: '02: Borcelle Vintage Mosaic', badge: '3 Slot Mosaic', imageSrc: '/frames/2.png' },
    { id: 'frame-3', name: '03: Night Arched Comic Star', badge: '3 Slot Arched', imageSrc: '/frames/3.png' },
    { id: 'frame-4', name: '04: Cottagecore Lily', badge: '3 Slot Floral', imageSrc: '/frames/4.png' },
    { id: 'frame-the-moment', name: '05: Archive Memory Editorial', badge: '3 Slot Persegi', imageSrc: '/frames/5.png' }
  ];

  // Step state (for Bundle 1 & 2)
  const [currentStep, setCurrentStep] = useState(1);
  const [frameSearch, setFrameSearch] = useState('');

  // Bundle 1 Selections (2 Gelang)
  const [selectedGelang1, setSelectedGelang1] = useState(defaultBracelets[0] || null);
  const [selectedGelang2, setSelectedGelang2] = useState(defaultBracelets[1] || defaultBracelets[0] || null);

  // Bundle 2 Selections (2 Bagcharm - All 30 Frames)
  const [selectedFrame1, setSelectedFrame1] = useState(allFrames[0] || null);
  const [selectedFrame2, setSelectedFrame2] = useState(allFrames[1] || allFrames[0] || null);
  const [photo1, setPhoto1] = useState('');
  const [photo2, setPhoto2] = useState('');

  // Bundle 3 Selection (1 Gelang & 1 Bagcharm)
  const [selectedGelangB3, setSelectedGelangB3] = useState(defaultBracelets[0] || null);

  // Reset when product opens
  useEffect(() => {
    setCurrentStep(1);
    setFrameSearch('');
    if (defaultBracelets.length > 0) {
      setSelectedGelang1(defaultBracelets[0]);
      setSelectedGelang2(defaultBracelets[1] || defaultBracelets[0]);
      setSelectedGelangB3(defaultBracelets[0]);
    }
    if (allFrames.length > 0) {
      setSelectedFrame1(allFrames[0]);
      setSelectedFrame2(allFrames[1] || allFrames[0]);
    }
  }, [bundlingProduct?.id]);

  // Filtered frames by search
  const filteredFrames = allFrames.filter((f) => {
    if (!frameSearch.trim()) return true;
    const q = frameSearch.toLowerCase();
    return (f.name || '').toLowerCase().includes(q) || (f.badge || '').toLowerCase().includes(q);
  });

  // Handle Photo upload helper for Bundle 2
  const handlePhotoUpload = (e, setPhotoFn) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoFn(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Bundle 1 (2 Gelang)
  const handleConfirmBundle1 = () => {
    if (!selectedGelang1 || !selectedGelang2) return;
    if (onConfirm) {
      onConfirm({
        id: bundlingProduct.id,
        productType: 'bundling',
        title: bundlingProduct.name,
        unitPrice: Number(bundlingProduct.price),
        quantity: 1,
        subtotal: Number(bundlingProduct.price),
        image: bundlingProduct.image,
        bundleChoices: {
          item1: {
            label: 'Gelang 1',
            name: selectedGelang1.name,
            image: selectedGelang1.image,
            id: selectedGelang1.id
          },
          item2: {
            label: 'Gelang 2',
            name: selectedGelang2.name,
            image: selectedGelang2.image,
            id: selectedGelang2.id
          }
        },
        bundleDescription: `Gelang 1: ${selectedGelang1.name} | Gelang 2: ${selectedGelang2.name}`
      });
    }
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    onClose();
  };

  // Bundle 2 Action: Navigate to Custom Studio with both selected frames
  const handleProceedToStudioBundle2 = () => {
    if (!selectedFrame1 || !selectedFrame2) return;
    if (onGoToCustomStudio) {
      onGoToCustomStudio({
        bundlingProduct,
        bundleType: 2,
        selectedFrame1,
        selectedFrame2
      });
    }
    onClose();
  };

  // Bundle 3 Action: Navigate to Custom Studio with selected gelang
  const handleProceedToStudioBundle3 = () => {
    if (!selectedGelangB3) return;
    if (onGoToCustomStudio) {
      onGoToCustomStudio({
        bundlingProduct,
        bundleType: 3,
        selectedGelang: selectedGelangB3
      });
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1200 }}>
      <div
        className="modal-container"
        style={{
          maxWidth: '780px',
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.22)'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            background: '#FAF9F6',
            borderBottom: '1px solid #EBE8E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#4F46E5',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-purple" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                  Kustomisasi Paket Bundling
                </span>
                <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>
                  Rp {Number(bundlingProduct.price).toLocaleString('id-ID')}
                </span>
              </div>
              <h3 style={{ fontSize: '1.18rem', margin: '3px 0 0', fontWeight: 800, color: '#181A1F' }}>
                {bundlingProduct.name}
              </h3>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-icon"
            style={{ width: '36px', height: '36px', borderRadius: '50%' }}
            onClick={onClose}
            title="Tutup"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Navigation Tabs (For Bundle 1 & 2) */}
        {(bundleType === 1 || bundleType === 2) && (
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #E5E7EB',
              background: '#FFFFFF',
              padding: '8px 24px 0'
            }}
          >
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              style={{
                flex: 1,
                padding: '12px 14px',
                border: 'none',
                background: 'transparent',
                borderBottom: currentStep === 1 ? '3px solid #4F46E5' : '3px solid transparent',
                fontWeight: currentStep === 1 ? 800 : 600,
                color: currentStep === 1 ? '#4F46E5' : '#6B7280',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: currentStep === 1 ? '#4F46E5' : '#10B981',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}
              >
                {currentStep === 1 ? '1' : '✓'}
              </span>
              <span>{bundleType === 1 ? '1. Pilih Gelang Pertama' : '1. Pilih Frame Bagcharm 1'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              style={{
                flex: 1,
                padding: '12px 14px',
                border: 'none',
                background: 'transparent',
                borderBottom: currentStep === 2 ? '3px solid #4F46E5' : '3px solid transparent',
                fontWeight: currentStep === 2 ? 800 : 600,
                color: currentStep === 2 ? '#4F46E5' : '#6B7280',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: currentStep === 2 ? '#4F46E5' : '#E5E7EB',
                  color: currentStep === 2 ? '#ffffff' : '#6B7280',
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}
              >
                2
              </span>
              <span>{bundleType === 1 ? '2. Pilih Gelang Kedua' : '2. Pilih Frame Bagcharm 2'}</span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, background: '#F9FAFB' }}>
          {/* =========================================================================
              CASE 1: BUNDLE 1 (2 GELANG) — HANYA GELANG, TANPA FRAME!
              ========================================================================= */}
          {bundleType === 1 && (
            <div>
              {currentStep === 1 ? (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px', color: '#111827' }}>
                      Pilih Gelang Pertama (Gelang 1)
                    </h4>
                    <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: 0 }}>
                      Pilih model gelang favorit pertama untuk paket couple / bestie kalian:
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '14px' }}>
                    {defaultBracelets.map((item) => {
                      const isSelected = selectedGelang1?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedGelang1(item)}
                          style={{
                            background: '#FFFFFF',
                            borderRadius: '16px',
                            padding: '12px',
                            border: isSelected ? '2px solid #4F46E5' : '1px solid #E5E7EB',
                            boxShadow: isSelected ? '0 8px 20px rgba(79, 70, 229, 0.15)' : '0 2px 6px rgba(0,0,0,0.03)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative'
                          }}
                        >
                          {isSelected && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: '#4F46E5',
                                color: '#ffffff',
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                zIndex: 2
                              }}
                            >
                              ✓
                            </span>
                          )}
                          <div
                            style={{
                              width: '100%',
                              height: '140px',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              background: '#F3F4F6',
                              marginBottom: '10px'
                            }}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#181A1F', marginBottom: '4px' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.35 }}>
                            {item.description ? item.description.substring(0, 70) + '...' : 'Gelang manik handmade aesthetic'}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setCurrentStep(2)}
                      style={{ padding: '10px 22px' }}
                    >
                      <span>Lanjut Pilih Gelang Kedua</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px', color: '#111827' }}>
                      Pilih Gelang Kedua (Gelang 2)
                    </h4>
                    <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: 0 }}>
                      Bisa pilih model yang sama (kembaran) atau pilih varian gelang lainnya:
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '14px' }}>
                    {defaultBracelets.map((item) => {
                      const isSelected = selectedGelang2?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedGelang2(item)}
                          style={{
                            background: '#FFFFFF',
                            borderRadius: '16px',
                            padding: '12px',
                            border: isSelected ? '2px solid #4F46E5' : '1px solid #E5E7EB',
                            boxShadow: isSelected ? '0 8px 20px rgba(79, 70, 229, 0.15)' : '0 2px 6px rgba(0,0,0,0.03)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative'
                          }}
                        >
                          {isSelected && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: '#4F46E5',
                                color: '#ffffff',
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                zIndex: 2
                              }}
                            >
                              ✓
                            </span>
                          )}
                          <div
                            style={{
                              width: '100%',
                              height: '140px',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              background: '#F3F4F6',
                              marginBottom: '10px'
                            }}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#181A1F', marginBottom: '4px' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.35 }}>
                            {item.description ? item.description.substring(0, 70) + '...' : 'Gelang manik handmade aesthetic'}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setCurrentStep(1)}
                      style={{ padding: '10px 18px' }}
                    >
                      <ArrowLeft size={16} />
                      <span>Ubah Gelang 1</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              CASE 2: BUNDLE 2 (2 BAGCHARM) — SEMUA 30 FRAME DITAMPILKAN LENGKAP!
              ========================================================================= */}
          {bundleType === 2 && (
            <div>
              {/* Search Bar for Frames */}
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input
                    type="text"
                    placeholder="Cari frame photostrip (tersedia 30 frame)..."
                    value={frameSearch}
                    onChange={(e) => setFrameSearch(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '36px', height: '40px', fontSize: '0.86rem' }}
                  />
                </div>
                <span className="badge badge-cyan" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
                  Menampilkan {filteredFrames.length} dari {allFrames.length} Frame
                </span>
              </div>

              {currentStep === 1 ? (
                <div>
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px', color: '#111827' }}>
                      Pilih Frame untuk Bagcharm Pertama (Bagcharm 1)
                    </h4>
                    <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: 0 }}>
                      Pilih desain frame akrilik photostrip favoritmu dari koleksi lengkap di bawah ini:
                    </p>
                  </div>

                  {/* 30 Frames Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                    {filteredFrames.map((frame) => {
                      const isSelected = selectedFrame1?.id === frame.id;
                      const imgSrc = frame.imageSrc || frame.image;
                      return (
                        <div
                          key={frame.id}
                          onClick={() => setSelectedFrame1(frame)}
                          style={{
                            background: '#FFFFFF',
                            borderRadius: '16px',
                            padding: '10px',
                            border: isSelected ? '2px solid #4F46E5' : '1px solid #E5E7EB',
                            boxShadow: isSelected ? '0 8px 20px rgba(79, 70, 229, 0.15)' : '0 2px 5px rgba(0,0,0,0.03)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative'
                          }}
                        >
                          {isSelected && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '6px',
                                right: '6px',
                                background: '#4F46E5',
                                color: '#ffffff',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                zIndex: 2
                              }}
                            >
                              ✓
                            </span>
                          )}
                          <div
                            style={{
                              width: '100%',
                              height: '145px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              background: '#F3F4F6',
                              marginBottom: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <img
                              src={imgSrc}
                              alt={frame.name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              loading="lazy"
                            />
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#181A1F', marginBottom: '2px', lineHeight: 1.25 }}>
                            {frame.name}
                          </div>
                          <span className={`badge ${frame.badgeClass || 'badge-purple'}`} style={{ fontSize: '0.66rem', alignSelf: 'flex-start' }}>
                            {frame.badge || 'Photostrip'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Photo Upload Option for Bagcharm 1 */}
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '12px 16px',
                      background: '#FFFFFF',
                      borderRadius: '14px',
                      border: '1px dashed #D1D5DB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Camera size={18} color="#4F46E5" />
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#111827' }}>
                          Upload Foto untuk Bagcharm 1 (Opsional)
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>
                          Bisa upload foto sekarang atau kirim via WhatsApp setelah checkout
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {photo1 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img
                            src={photo1}
                            alt="Foto Bagcharm 1"
                            style={{ width: '34px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #4F46E5' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={() => setPhoto1('')}
                            style={{ color: '#EF4444', borderColor: '#FCA5A5' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : (
                        <label
                          className="btn btn-secondary btn-sm"
                          style={{ cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
                        >
                          <Upload size={13} />
                          <span>Pilih Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handlePhotoUpload(e, setPhoto1)}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setCurrentStep(2)}
                      style={{ padding: '10px 22px' }}
                    >
                      <span>Lanjut Pilih Frame Bagcharm 2</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px', color: '#111827' }}>
                      Pilih Frame untuk Bagcharm Kedua (Bagcharm 2)
                    </h4>
                    <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: 0 }}>
                      Bisa pilih template yang sama (kembaran) atau pilih frame model lainnya:
                    </p>
                  </div>

                  {/* 30 Frames Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                    {filteredFrames.map((frame) => {
                      const isSelected = selectedFrame2?.id === frame.id;
                      const imgSrc = frame.imageSrc || frame.image;
                      return (
                        <div
                          key={frame.id}
                          onClick={() => setSelectedFrame2(frame)}
                          style={{
                            background: '#FFFFFF',
                            borderRadius: '16px',
                            padding: '10px',
                            border: isSelected ? '2px solid #4F46E5' : '1px solid #E5E7EB',
                            boxShadow: isSelected ? '0 8px 20px rgba(79, 70, 229, 0.15)' : '0 2px 5px rgba(0,0,0,0.03)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative'
                          }}
                        >
                          {isSelected && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '6px',
                                right: '6px',
                                background: '#4F46E5',
                                color: '#ffffff',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                zIndex: 2
                              }}
                            >
                              ✓
                            </span>
                          )}
                          <div
                            style={{
                              width: '100%',
                              height: '145px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              background: '#F3F4F6',
                              marginBottom: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <img
                              src={imgSrc}
                              alt={frame.name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              loading="lazy"
                            />
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#181A1F', marginBottom: '2px', lineHeight: 1.25 }}>
                            {frame.name}
                          </div>
                          <span className={`badge ${frame.badgeClass || 'badge-purple'}`} style={{ fontSize: '0.66rem', alignSelf: 'flex-start' }}>
                            {frame.badge || 'Photostrip'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Photo Upload Option for Bagcharm 2 */}
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '12px 16px',
                      background: '#FFFFFF',
                      borderRadius: '14px',
                      border: '1px dashed #D1D5DB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Camera size={18} color="#4F46E5" />
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#111827' }}>
                          Upload Foto untuk Bagcharm 2 (Opsional)
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>
                          Bisa upload foto sekarang atau kirim via WhatsApp setelah checkout
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {photo2 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img
                            src={photo2}
                            alt="Foto Bagcharm 2"
                            style={{ width: '34px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #4F46E5' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={() => setPhoto2('')}
                            style={{ color: '#EF4444', borderColor: '#FCA5A5' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : (
                        <label
                          className="btn btn-secondary btn-sm"
                          style={{ cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
                        >
                          <Upload size={13} />
                          <span>Pilih Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handlePhotoUpload(e, setPhoto2)}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setCurrentStep(1)}
                      style={{ padding: '10px 18px' }}
                    >
                      <ArrowLeft size={16} />
                      <span>Ubah Bagcharm 1</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              CASE 3: BUNDLE 3 (1 GELANG & 1 BAGCHARM)
              HANYA PILIH GELANG, KEMUDIAN BAGCHARM DIALIHKAN KE STUDIO CUSTOM!
              ========================================================================= */}
          {bundleType === 3 && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EDE9FE', color: '#4F46E5', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px' }}>
                  <span>Langkah 1 dari 2</span>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px', color: '#111827' }}>
                  Pilih Jenis Gelang yang Diinginkan
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0, lineHeight: 1.45 }}>
                  Pilih model gelang favoritmu terlebih dahulu. Setelah memilih gelang, kamu akan langsung <strong>dialihkan ke Studio Kustomisasi</strong> untuk merancang Bagcharm (pilih frame, foto & charm) seharga paket bundling <strong>Rp 27.000</strong>!
                </p>
              </div>

              {/* Bracelet Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '14px' }}>
                {defaultBracelets.map((item) => {
                  const isSelected = selectedGelangB3?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedGelangB3(item)}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '12px',
                        border: isSelected ? '2px solid #4F46E5' : '1px solid #E5E7EB',
                        boxShadow: isSelected ? '0 8px 20px rgba(79, 70, 229, 0.15)' : '0 2px 6px rgba(0,0,0,0.03)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                      }}
                    >
                      {isSelected && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: '#4F46E5',
                            color: '#ffffff',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            zIndex: 2
                          }}
                        >
                          ✓
                        </span>
                      )}
                      <div
                        style={{
                          width: '100%',
                          height: '140px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          background: '#F3F4F6',
                          marginBottom: '10px'
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#181A1F', marginBottom: '4px' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.35 }}>
                        {item.description ? item.description.substring(0, 70) + '...' : 'Gelang manik handmade aesthetic'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Informational Callout */}
              <div
                style={{
                  marginTop: '18px',
                  padding: '14px 16px',
                  background: '#F5F3FF',
                  border: '1px solid #DDD6FE',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ fontSize: '1.4rem' }}>✨</div>
                <div style={{ fontSize: '0.82rem', color: '#5B21B6', lineHeight: 1.45 }}>
                  <strong>Langkah berikutnya:</strong> Bagcharm akan dirancang langsung di <strong>Halaman Custom Studio</strong> agar kamu leluasa memilih frame foto, upload foto favorit, dan memilih aksen tali.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            background: '#FFFFFF',
            borderTop: '1px solid #EBE8E1',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {/* Summary Box */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              background: '#F8F9FA',
              border: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                Ringkasan Pilihan Paket:
              </div>
              <div style={{ fontSize: '0.84rem', color: '#111827', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                {bundleType === 1 && (
                  <>
                    <span><strong>Gelang 1:</strong> {selectedGelang1?.name || '(belum dipilih)'}</span>
                    <span><strong>Gelang 2:</strong> {selectedGelang2?.name || '(belum dipilih)'}</span>
                  </>
                )}
                {bundleType === 2 && (
                  <>
                    <span><strong>Bagcharm 1:</strong> {selectedFrame1?.name || '(belum dipilih)'}</span>
                    <span><strong>Bagcharm 2:</strong> {selectedFrame2?.name || '(belum dipilih)'}</span>
                    <span style={{ color: '#4F46E5', fontWeight: 600 }}>• Lanjut ke Studio Custom</span>
                  </>
                )}
                {bundleType === 3 && (
                  <>
                    <span><strong>Gelang:</strong> {selectedGelangB3?.name || '(belum dipilih)'}</span>
                    <span><strong>Bagcharm:</strong> <em>Dialihkan ke Studio Custom</em></span>
                  </>
                )}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Total Paket Bundling:</div>
              <div style={{ fontSize: '1.18rem', fontWeight: 800, color: '#4F46E5' }}>
                Rp {Number(bundlingProduct.price).toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              style={{ flex: 1, padding: '12px' }}
            >
              Batal
            </button>

            {bundleType === 1 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmBundle1}
                disabled={!selectedGelang1 || !selectedGelang2}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: selectedGelang1 && selectedGelang2 ? '#21201D' : '#9CA3AF',
                  borderColor: selectedGelang1 && selectedGelang2 ? '#21201D' : '#9CA3AF',
                  cursor: selectedGelang1 && selectedGelang2 ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 700
                }}
              >
                <ShoppingBag size={18} />
                <span>+ Masukkan ke Keranjang (Rp {Number(bundlingProduct.price).toLocaleString('id-ID')})</span>
              </button>
            )}

            {bundleType === 2 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleProceedToStudioBundle2}
                disabled={!selectedFrame1 || !selectedFrame2}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: selectedFrame1 && selectedFrame2 ? '#4F46E5' : '#9CA3AF',
                  borderColor: selectedFrame1 && selectedFrame2 ? '#4F46E5' : '#9CA3AF',
                  cursor: selectedFrame1 && selectedFrame2 ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  boxShadow: selectedFrame1 && selectedFrame2 ? '0 4px 14px rgba(79, 70, 229, 0.35)' : 'none'
                }}
              >
                <span>Lanjut Kustom 2 Bagcharm di Studio</span>
                <ArrowRight size={18} />
              </button>
            )}

            {bundleType === 3 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleProceedToStudioBundle3}
                disabled={!selectedGelangB3}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: selectedGelangB3 ? '#4F46E5' : '#9CA3AF',
                  borderColor: selectedGelangB3 ? '#4F46E5' : '#9CA3AF',
                  cursor: selectedGelangB3 ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  boxShadow: selectedGelangB3 ? '0 4px 14px rgba(79, 70, 229, 0.35)' : 'none'
                }}
              >
                <span>Lanjut Kustom Bagcharm di Studio</span>
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
