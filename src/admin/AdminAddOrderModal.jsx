import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Package, User, CreditCard, Image as ImageIcon, Calendar, Check, AlertCircle, Sparkles, Upload } from 'lucide-react';
import { useBodyScrollLock } from '../utils/scrollLock';
import { INITIAL_CORD_COLORS, ACCENT_COLORS, INITIAL_CHARMS } from '../data/initialData';
import { ALL_FRAME_TEMPLATES } from '../components/FrameLayoutSelector';
import { getCharmIcon, resolveCordName } from '../utils/accentHelper';

export default function AdminAddOrderModal({
  isOpen,
  onClose,
  onSave,
  collections = [],
  charms = []
}) {
  useBodyScrollLock(isOpen);

  // Merge database/live charms with INITIAL_CHARMS so admin has all options
  const allCharmsMap = new Map();
  INITIAL_CHARMS.forEach((c) => allCharmsMap.set(c.id || c.name, c));
  (charms || []).forEach((c) => allCharmsMap.set(c.id || c.name, { ...allCharmsMap.get(c.id || c.name), ...c }));
  const availableCharms = Array.from(allCharmsMap.values());

  // Customer state
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsApp, setCustomerWhatsApp] = useState('');
  const [channel, setChannel] = useState('WhatsApp Direct');
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Payment & notes
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank BCA');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [notes, setNotes] = useState('');

  // Default item creator
  const createDefaultItem = (index) => ({
    id: `item-${Date.now()}-${index}`,
    productType: 'bag_charm',
    title: 'Custom Photostrip Bag Charm — Frame 1',
    frameId: 'frame-1',
    frameName: 'Frame 1',
    baseName: 'Frame 1 (2 Pose)',
    cordColor: '#18181B',
    cordColorName: 'Hitam Polos',
    accentColor: 'hitam',
    accentColorName: 'Hitam',
    hardwareName: 'Matte Stealth Black',
    customLetters: '',
    charms: [],
    unitPrice: 15000,
    basePrice: 15000,
    quantity: 1,
    image: '',
    framePhotos: [],
    variant: '',
    notes: ''
  });

  // Items list
  const [items, setItems] = useState([createDefaultItem(1)]);

  // Total pesanan input manual
  const itemsSubtotal = items.reduce((sum, it) => sum + (Number(it.unitPrice || 0) * Number(it.quantity || 1)), 0);
  const [totalPesanan, setTotalPesanan] = useState(15000);
  const [isManualTotal, setIsManualTotal] = useState(false);

  // Auto-fill total pesanan with items subtotal if admin hasn't typed a custom total yet
  useEffect(() => {
    if (!isManualTotal && itemsSubtotal > 0) {
      setTotalPesanan(itemsSubtotal);
    }
  }, [itemsSubtotal, isManualTotal]);

  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  // Add a new empty item
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      createDefaultItem(prev.length + 1)
    ]);
  };

  // Remove an item
  const handleRemoveItem = (idx) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Update item field
  const handleUpdateItem = (idx, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  // Pick from existing collections
  const handleSelectCollection = (idx, collectionId) => {
    if (!collectionId) {
      handleUpdateItem(idx, 'title', '');
      return;
    }
    const found = collections.find((c) => String(c.id) === String(collectionId));
    if (found) {
      setItems((prev) => {
        const updated = [...prev];
        const isGelang = found.category === 'gelang';
        const pType = isGelang ? 'bracelet' : (found.category === 'bundle' ? 'bundle' : 'bag_charm');

        // Look for matching frame template if bag charm
        let matchedFrame = null;
        if (!isGelang) {
          const lower = found.name.toLowerCase();
          matchedFrame = ALL_FRAME_TEMPLATES.find((f) => lower.includes(f.name.toLowerCase()));
        }

        updated[idx] = {
          ...updated[idx],
          title: found.name,
          unitPrice: found.price || (isGelang ? 10000 : 15000),
          basePrice: found.price || (isGelang ? 10000 : 15000),
          productType: pType,
          // CRITICAL: Do NOT auto-fill image from collection, allow admin to upload custom photo!
          frameId: matchedFrame?.id || updated[idx].frameId || 'frame-1',
          frameName: matchedFrame?.name || updated[idx].frameName || 'Frame 1',
          baseName: matchedFrame ? `${matchedFrame.name} (${matchedFrame.subtitle || 'Custom'})` : updated[idx].baseName
        };
        return updated;
      });
    }
  };

  // Photo upload for an item (supports 1 or multiple photos for photostrip)
  const handleImageUpload = (idx, e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    Promise.all(
      files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      })
    ).then((newPhotos) => {
      setItems((prev) => {
        const updated = [...prev];
        const existingPhotos = updated[idx].framePhotos || [];
        const mergedPhotos = [...existingPhotos, ...newPhotos];
        updated[idx] = {
          ...updated[idx],
          framePhotos: mergedPhotos,
          image: mergedPhotos[0] || updated[idx].image || ''
        };
        return updated;
      });
    });
  };

  // Remove a single photo from item's photo list
  const handleRemovePhoto = (idx, photoIdx) => {
    setItems((prev) => {
      const updated = [...prev];
      const photos = (updated[idx].framePhotos || []).filter((_, pI) => pI !== photoIdx);
      updated[idx] = {
        ...updated[idx],
        framePhotos: photos,
        image: photos[0] || ''
      };
      return updated;
    });
  };

  // Clear all photos for an item
  const handleClearAllPhotos = (idx) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        framePhotos: [],
        image: ''
      };
      return updated;
    });
  };

  // Toggle additional charm on an item
  const handleToggleCharm = (idx, charm) => {
    setItems((prev) => {
      const updated = [...prev];
      const currentItem = updated[idx];
      const currentCharms = currentItem.charms || [];
      const charmKey = charm.id || charm.name;
      const isSelected = currentCharms.some((c) => (c.id || c.name) === charmKey);

      const priceDiff = Number(charm.price || 5000);

      if (isSelected) {
        const nextCharms = currentCharms.filter((c) => (c.id || c.name) !== charmKey);
        updated[idx] = {
          ...currentItem,
          charms: nextCharms,
          unitPrice: Math.max(0, Number(currentItem.unitPrice || 0) - priceDiff)
        };
      } else {
        const nextCharms = [
          ...currentCharms,
          {
            id: charm.id || `ch-${Date.now()}`,
            name: charm.name,
            price: priceDiff,
            icon: charm.icon || getCharmIcon(charm),
            image: charm.image || ''
          }
        ];
        updated[idx] = {
          ...currentItem,
          charms: nextCharms,
          unitPrice: Number(currentItem.unitPrice || 0) + priceDiff
        };
      }
      return updated;
    });
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Mohon isi nama lengkap pemesan.');
      return;
    }
    if (!customerWhatsApp.trim()) {
      setFormError('Mohon isi nomor WhatsApp pemesan.');
      return;
    }
    const hasEmptyTitle = items.some((it) => !it.title.trim());
    if (hasEmptyTitle) {
      setFormError('Mohon lengkapi nama produk pada semua item.');
      return;
    }

    const finalAmount = Number(totalPesanan || 0);
    if (isNaN(finalAmount) || finalAmount < 0) {
      setFormError('Mohon masukkan nominal total pesanan yang valid.');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ATC-M-${new Date().getFullYear()}-${randomSuffix}`;

    const formattedItems = items.map((it, i) => {
      const isBagCharm = it.productType === 'bag_charm';
      const frameObj = ALL_FRAME_TEMPLATES.find((f) => f.id === it.frameId);
      const cordObj = INITIAL_CORD_COLORS.find((c) => c.hex === it.cordColor || c.name === it.cordColorName);
      const accentObj = ACCENT_COLORS.find((a) => a.id === it.accentColor);
      const framePhotos = it.framePhotos && it.framePhotos.length > 0 ? it.framePhotos : (it.image ? [it.image] : []);

      return {
        id: `${orderId}-it-${i + 1}`,
        productType: it.productType,
        title: it.title || (isBagCharm ? `Custom Photostrip Bag Charm — ${frameObj?.name || 'Custom'}` : 'Custom Item'),
        baseName: isBagCharm
          ? (frameObj ? `${frameObj.name} (${frameObj.subtitle || '3 Pose'})` : (it.baseName || 'Custom Photostrip Bag Charm'))
          : (it.title || 'Custom Item'),
        baseId: it.frameId || null,
        frameId: it.frameId || null,
        frameName: frameObj?.name || it.frameName || null,
        frameImage: frameObj?.imageSrc || null,
        framePhotos: framePhotos,
        photos: framePhotos,
        cordColor: it.cordColor || '#18181B',
        cordColorName: it.cordColorName || cordObj?.name || resolveCordName(it.cordColor) || 'Hitam Polos',
        accentColor: it.accentColor || 'hitam',
        accentColorName: it.accentColorName || accentObj?.name || 'Hitam',
        starColor: it.accentColor || 'hitam',
        starColorName: it.accentColorName || accentObj?.name || 'Hitam',
        bellColor: it.accentColor || 'hitam',
        bellColorName: it.accentColorName || accentObj?.name || 'Hitam',
        hardwareName: it.hardwareName || 'Matte Stealth Black',
        customLetters: (it.customLetters || '').toUpperCase().trim(),
        charms: it.charms || [],
        unitPrice: Number(it.unitPrice || 0),
        quantity: Number(it.quantity || 1),
        subtotal: Number(it.unitPrice || 0) * Number(it.quantity || 1),
        image: it.image || framePhotos[0] || null,
        customDetails: {
          frameId: it.frameId,
          frameName: frameObj?.name || it.frameName,
          cordColor: it.cordColor,
          cordColorName: it.cordColorName || cordObj?.name,
          accentColor: it.accentColor,
          accentColorName: it.accentColorName || accentObj?.name,
          hardwareName: it.hardwareName,
          customLetters: (it.customLetters || '').toUpperCase().trim(),
          charms: it.charms || [],
          photos: framePhotos,
          notes: it.notes || '',
          variant: it.variant || it.productType
        }
      };
    });

    const orderPayload = {
      id: orderId,
      createdAt: new Date(`${orderDate}T${new Date().toTimeString().split(' ')[0]}`).toISOString(),
      customer: {
        name: customerName.trim(),
        whatsapp: customerWhatsApp.trim(),
        city: '-',
        address: '-',
        courier: 'Offline / Direct',
        courierCost: 0,
        notes: notes.trim()
      },
      items: formattedItems,
      total: finalAmount,
      totalAmount: finalAmount,
      paymentMethod,
      paymentStatus,
      craftingStatus: 'in_crafting',
      orderStatus: 'processing',
      channel,
      notes: notes.trim()
    };

    onSave(orderPayload);
    onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '850px', maxHeight: '92vh' }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#FAF8F4'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                Input Manual Admin
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                Offline / WhatsApp / DM
              </span>
            </div>
            <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>
              Tambah Pesanan Baru
            </h3>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-icon"
            style={{ width: '34px', height: '34px' }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {formError && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#B91C1C',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            {/* Section 1: Customer Data */}
            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                <User size={16} color="var(--accent-purple)" />
                <span>Data Pemesan & Sumber Pesanan</span>
              </h4>

              <div className="admin-modal-form-grid">
                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Nama Lengkap Pemesan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jessica Aurelia"
                    className="form-input"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Nomor WhatsApp / Telp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    className="form-input"
                    value={customerWhatsApp}
                    onChange={(e) => setCustomerWhatsApp(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Sumber / Saluran Pesanan
                  </label>
                  <select
                    className="form-select"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                  >
                    <option value="WhatsApp Direct">WhatsApp Direct</option>
                    <option value="Instagram DM">Instagram DM</option>
                    <option value="TikTok Shop / DM">TikTok Shop / DM</option>
                    <option value="Bazaar / Pop-up Event">Bazaar / Pop-up Event</option>
                    <option value="Toko Fisik / Offline">Toko Fisik / Offline</option>
                    <option value="Pesanan Langsung / Lainnya">Pesanan Langsung / Lainnya</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Items List */}
            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                  <Package size={16} color="var(--accent-purple)" />
                  <span>Item & Produk Pesanan ({items.length} Item)</span>
                </h4>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                >
                  <Plus size={14} />
                  <span>Tambah Item Lain</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#F9FAFB',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1.5px solid #E5E7EB',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.76rem', fontWeight: 700 }}>
                        Item {idx + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="btn btn-sm"
                          style={{
                            padding: '4px 8px',
                            color: '#EF4444',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.78rem'
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Hapus Item</span>
                        </button>
                      )}
                    </div>

                    {/* Basic Info: Collection Picker, Name, Category */}
                    <div className="admin-modal-form-grid">
                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          Pilih dari Koleksi Toko (Otomatis)
                        </label>
                        <select
                          className="form-select"
                          onChange={(e) => handleSelectCollection(idx, e.target.value)}
                          defaultValue=""
                        >
                          <option value="">-- Pilih Koleksi Toko atau Ketik Manual --</option>
                          {collections.map((col) => (
                            <option key={col.id} value={col.id}>
                              {col.name} — Rp {(col.price || 0).toLocaleString('id-ID')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          Nama Produk / Aksesoris *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Misal: Custom Photostrip Bag Charm"
                          className="form-input"
                          value={item.title}
                          onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          Kategori Produk
                        </label>
                        <select
                          className="form-select"
                          value={item.productType}
                          onChange={(e) => handleUpdateItem(idx, 'productType', e.target.value)}
                        >
                          <option value="bag_charm">Bagcharm Custom (Photostrip)</option>
                          <option value="bracelet">Gelang Manik / Beads</option>
                          <option value="bundle">Paket Bundling Couple / Bestie</option>
                          <option value="other">Aksesoris Lainnya</option>
                        </select>
                      </div>
                    </div>

                    {/* Price, Qty, and Custom Letters */}
                    <div className="admin-modal-form-grid">
                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          Harga Satuan (Rp) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          placeholder="15000"
                          className="form-input"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(idx, 'unitPrice', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          Jumlah (Qty) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          className="form-input"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', Math.max(1, parseInt(e.target.value, 10) || 1))}
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          Inisial / Huruf Kustom (Opsional)
                        </label>
                        <input
                          type="text"
                          placeholder="Misal: CLARA"
                          maxLength={8}
                          className="form-input"
                          value={item.customLetters}
                          onChange={(e) => handleUpdateItem(idx, 'customLetters', e.target.value.toUpperCase())}
                        />
                        {item.customLetters && (
                          <div style={{ display: 'flex', gap: '3px', marginTop: '4px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>Manik:</span>
                            {item.customLetters.split('').map((char, cI) => (
                              <span
                                key={cI}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '3px',
                                  background: '#21201D',
                                  color: '#FFFFFF',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {char}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Custom Features for Bag Charm */}
                    {item.productType === 'bag_charm' && (
                      <div
                        style={{
                          background: '#FAF5FF',
                          border: '1.5px solid #E9D5FF',
                          borderRadius: '10px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={15} color="#7C3AED" />
                          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#6B21A8' }}>
                            Fitur Kustom Bagcharm (Sesuai Pilihan Pelanggan)
                          </span>
                        </div>

                        {/* Frame Photostrip Selection */}
                        <div>
                          <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                            Template Frame Photostrip
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <select
                              className="form-select"
                              value={item.frameId || 'frame-1'}
                              onChange={(e) => {
                                const fId = e.target.value;
                                const fObj = ALL_FRAME_TEMPLATES.find((f) => f.id === fId);
                                setItems((prev) => {
                                  const updated = [...prev];
                                  updated[idx] = {
                                    ...updated[idx],
                                    frameId: fId,
                                    frameName: fObj?.name || 'Frame',
                                    baseName: fObj ? `${fObj.name} (${fObj.subtitle || 'Photostrip'})` : 'Custom Photostrip'
                                  };
                                  return updated;
                                });
                              }}
                              style={{ flex: 1 }}
                            >
                              {ALL_FRAME_TEMPLATES.map((f) => (
                                <option key={f.id} value={f.id}>
                                  {f.name} — {f.subtitle} ({f.badge})
                                </option>
                              ))}
                            </select>
                            {(() => {
                              const selF = ALL_FRAME_TEMPLATES.find((f) => f.id === (item.frameId || 'frame-1'));
                              return selF?.imageSrc ? (
                                <img
                                  src={selF.imageSrc}
                                  alt={selF.name}
                                  style={{ width: '36px', height: '46px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #D8B4FE', background: '#FFFFFF' }}
                                  title={selF.name}
                                />
                              ) : null;
                            })()}
                          </div>
                        </div>

                        {/* Warna Tali (Cord Color) */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>
                              Warna Tali Paracord
                            </label>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7C3AED' }}>
                              {item.cordColorName || 'Hitam Polos'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {INITIAL_CORD_COLORS.map((c) => {
                              const isSelected = (item.cordColor || '#18181B') === c.hex || item.cordColorName === c.name;
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setItems((prev) => {
                                      const updated = [...prev];
                                      updated[idx] = {
                                        ...updated[idx],
                                        cordColor: c.hex,
                                        cordColorName: c.name
                                      };
                                      return updated;
                                    });
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px 9px',
                                    borderRadius: '6px',
                                    border: isSelected ? '2px solid #7C3AED' : '1px solid #E5E7EB',
                                    background: isSelected ? '#FFFFFF' : '#F9FAFB',
                                    cursor: 'pointer',
                                    fontSize: '0.76rem',
                                    fontWeight: isSelected ? 700 : 500,
                                    color: isSelected ? '#6B21A8' : '#374151'
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '12px',
                                      height: '12px',
                                      borderRadius: '50%',
                                      background: c.hex,
                                      border: `1px solid ${c.border || 'rgba(0,0,0,0.2)'}`,
                                      display: 'inline-block'
                                    }}
                                  />
                                  <span>{c.name}</span>
                                  {isSelected && <Check size={11} color="#7C3AED" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Warna Aksen (Bintang Akrilik & Lonceng) */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>
                              Warna Aksen (Bintang Akrilik & Lonceng)
                            </label>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7C3AED' }}>
                              {item.accentColorName || 'Hitam'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {ACCENT_COLORS.map((a) => {
                              const isSelected = (item.accentColor || 'hitam') === a.id;
                              return (
                                <button
                                  key={a.id}
                                  type="button"
                                  onClick={() => {
                                    setItems((prev) => {
                                      const updated = [...prev];
                                      updated[idx] = {
                                        ...updated[idx],
                                        accentColor: a.id,
                                        accentColorName: a.name
                                      };
                                      return updated;
                                    });
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    border: isSelected ? '2px solid #7C3AED' : '1px solid #E5E7EB',
                                    background: isSelected ? '#FFFFFF' : '#F9FAFB',
                                    cursor: 'pointer',
                                    fontSize: '0.76rem',
                                    fontWeight: isSelected ? 700 : 500,
                                    color: isSelected ? '#6B21A8' : '#374151'
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '12px',
                                      height: '12px',
                                      borderRadius: '50%',
                                      background: a.hex,
                                      border: `1px solid ${a.border || 'rgba(0,0,0,0.2)'}`,
                                      display: 'inline-block'
                                    }}
                                  />
                                  <span>{a.name}</span>
                                  {isSelected && <Check size={11} color="#7C3AED" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Hardware Clasp */}
                        <div>
                          <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                            Hardware Clasp (Pengait Logam)
                          </label>
                          <select
                            className="form-select"
                            value={item.hardwareName || 'Matte Stealth Black'}
                            onChange={(e) => handleUpdateItem(idx, 'hardwareName', e.target.value)}
                          >
                            <option value="Matte Stealth Black">Matte Stealth Black (Hitam Doff)</option>
                            <option value="Liquid Chrome Silver">Liquid Chrome Silver (Krom Perak Mengkilap)</option>
                            <option value="Light Gold">Light Gold (Emas Lembut)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Charm Tambahan (Add-on Charms) */}
                    <div style={{ marginTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>
                          Charm / Liontin Tambahan (Opsional)
                        </label>
                        {item.charms && item.charms.length > 0 && (
                          <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>
                            ✓ {item.charms.length} Charm Terpilih
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {availableCharms.map((ch) => {
                          const isSelected = (item.charms || []).some((c) => (c.id || c.name) === (ch.id || ch.name));
                          return (
                            <button
                              key={ch.id}
                              type="button"
                              onClick={() => handleToggleCharm(idx, ch)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '5px 11px',
                                borderRadius: '8px',
                                border: isSelected ? '2px solid #4F46E5' : '1px solid #D1D5DB',
                                background: isSelected ? 'rgba(79, 70, 229, 0.08)' : '#FFFFFF',
                                color: isSelected ? '#4F46E5' : '#374151',
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span style={{ fontSize: '1rem' }}>{getCharmIcon(ch)}</span>
                              <span>{ch.name}</span>
                              <span style={{ fontSize: '0.72rem', color: isSelected ? '#4F46E5' : '#6B7280', fontWeight: 500 }}>
                                (+Rp {(ch.price || 5000).toLocaleString('id-ID')})
                              </span>
                              {isSelected && <Check size={12} color="#4F46E5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Customer Photo Upload */}
                    <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ImageIcon size={14} color="#4F46E5" />
                          <span>Upload Foto Pelanggan (Photostrip / Produk)</span>
                        </label>
                        {item.framePhotos && item.framePhotos.length > 0 && (
                          <span style={{ fontSize: '0.74rem', color: '#4F46E5', fontWeight: 700 }}>
                            {item.framePhotos.length} Foto Terpasang
                          </span>
                        )}
                      </div>

                      {(item.framePhotos && item.framePhotos.length > 0) || item.image ? (
                        <div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
                            {(item.framePhotos && item.framePhotos.length > 0 ? item.framePhotos : [item.image]).map((pSrc, pIdx) => (
                              <div
                                key={pIdx}
                                style={{
                                  position: 'relative',
                                  width: '56px',
                                  height: '56px',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  border: '1.5px solid #D1D5DB',
                                  background: '#FFFFFF'
                                }}
                              >
                                <img src={pSrc} alt={`Foto ${pIdx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(idx, pIdx)}
                                  style={{
                                    position: 'absolute',
                                    top: '2px',
                                    right: '2px',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    background: 'rgba(239, 68, 68, 0.9)',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    padding: 0
                                  }}
                                  title="Hapus foto ini"
                                >
                                  <X size={11} />
                                </button>
                                <span
                                  style={{
                                    position: 'absolute',
                                    bottom: '2px',
                                    left: '2px',
                                    background: 'rgba(0,0,0,0.65)',
                                    color: '#FFFFFF',
                                    fontSize: '8px',
                                    padding: '0 3px',
                                    borderRadius: '2px',
                                    fontWeight: 700
                                  }}
                                >
                                  #{pIdx + 1}
                                </span>
                              </div>
                            ))}

                            <label
                              className="btn btn-secondary btn-sm"
                              style={{ cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '4px', height: '40px', fontSize: '0.74rem' }}
                            >
                              <Upload size={13} />
                              <span>+ Tambah Foto</span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                                onChange={(e) => handleImageUpload(idx, e)}
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => handleClearAllPhotos(idx)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#EF4444',
                                fontSize: '0.74rem',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                fontWeight: 600
                              }}
                            >
                              Hapus Semua Foto
                            </button>
                          </div>
                          <p style={{ fontSize: '0.72rem', color: '#6B7280', margin: 0 }}>
                            Foto yang diupload otomatis masuk ke blueprint photostrip frame pesanan dan dapat diunduh oleh pengerajin.
                          </p>
                        </div>
                      ) : (
                        <div
                          style={{
                            border: '1.5px dashed #CBD5E1',
                            borderRadius: '8px',
                            padding: '14px',
                            background: '#FFFFFF',
                            textAlign: 'center'
                          }}
                        >
                          <label
                            className="btn btn-secondary btn-sm"
                            style={{ cursor: 'pointer', margin: '0 auto 6px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
                          >
                            <Upload size={14} />
                            <span>Pilih Foto dari Komputer (Bisa pilih 1 atau banyak)</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              style={{ display: 'none' }}
                              onChange={(e) => handleImageUpload(idx, e)}
                            />
                          </label>
                          <div style={{ fontSize: '0.74rem', color: '#9CA3AF' }}>
                            Foto koleksi toko tidak akan otomatis masuk ke sini. Admin dapat mengupload foto asli kiriman pelanggan langsung.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Subtotal Item Footer */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E5E7EB', paddingTop: '8px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 700 }}>
                        Subtotal Item: <span style={{ color: 'var(--accent-purple)' }}>Rp {(Number(item.unitPrice || 0) * Number(item.quantity || 1)).toLocaleString('id-ID')}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Status & Payment */}
            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                <CreditCard size={16} color="var(--accent-purple)" />
                <span>Metode Pembayaran & Tanggal</span>
              </h4>

              <div className="admin-modal-form-grid" style={{ marginBottom: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Metode Pembayaran
                  </label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                    <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                    <option value="Transfer Bank BRI">Transfer Bank BRI</option>
                    <option value="QRIS">QRIS</option>
                    <option value="Pembayaran Tunai/Cash">Pembayaran Tunai/Cash</option>
                    <option value="Bayar di Tempat">Bayar di Tempat</option>
                    <option value="ShopeePay / GoPay">ShopeePay / GoPay</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Status Pembayaran
                  </label>
                  <select
                    className="form-select"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value="paid">✓ Lunas (Sudah Dibayar)</option>
                    <option value="pending_verification">⏳ Menunggu Konfirmasi Bukti</option>
                    <option value="unpaid">Belum Bayar</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Tanggal Pesanan
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Catatan Pesanan / Instruksi Khusus (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Misal: Customer minta pita warna biru muda, packing kado"
                  className="form-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Input Total Pesanan Sendiri */}
            <div
              style={{
                background: '#FAF8F4',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div>
                <label className="form-label" style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                  Total Pesanan (Rp) *
                </label>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  Input langsung nominal total pesanan yang disepakati dengan pembeli
                </div>
                {itemsSubtotal > 0 && isManualTotal && (
                  <button
                    type="button"
                    onClick={() => {
                      setTotalPesanan(itemsSubtotal);
                      setIsManualTotal(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-purple)',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: '4px'
                    }}
                  >
                    Gunakan Subtotal Item (Rp {itemsSubtotal.toLocaleString('id-ID')})
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Rp</span>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="0"
                  className="form-input"
                  value={totalPesanan}
                  onChange={(e) => {
                    setTotalPesanan(e.target.value);
                    setIsManualTotal(true);
                  }}
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: 'var(--accent-purple)',
                    width: '180px',
                    height: '46px',
                    textAlign: 'right'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="admin-modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              style={{ padding: '0 20px', height: '42px' }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                background: '#21201D',
                borderColor: '#21201D',
                color: '#FFFFFF',
                padding: '0 24px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700
              }}
            >
              <Check size={16} />
              <span>Simpan Pesanan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
