import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, AlertTriangle, Check } from 'lucide-react';
import { useBodyScrollLock } from '../utils/scrollLock';

export default function CartModal({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedCheckout
}) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const [itemToDelete, setItemToDelete] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Set of selected item keys
  const [selectedKeys, setSelectedKeys] = useState(() => {
    return new Set(cartItems.map((item, idx) => item.cartItemId || item.id || `cart-it-${idx}`));
  });

  // Synchronize selection with cart items
  useEffect(() => {
    const allKeys = cartItems.map((item, idx) => item.cartItemId || item.id || `cart-it-${idx}`);
    setSelectedKeys((prev) => {
      if (prev.size === 0 && allKeys.length > 0) {
        return new Set(allKeys);
      }
      const next = new Set();
      allKeys.forEach((k) => {
        if (prev.has(k)) {
          next.add(k);
        } else {
          // Check new items added to cart by default
          next.add(k);
        }
      });
      return next;
    });
  }, [cartItems]);

  const toggleSelectItem = (key) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const isAllSelected = cartItems.length > 0 && selectedKeys.size === cartItems.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(cartItems.map((item, idx) => item.cartItemId || item.id || `cart-it-${idx}`)));
    }
  };

  const handleQuantityChange = (item, delta) => {
    const currentQty = Number(item.quantity) || 1;
    if (currentQty + delta < 1) {
      setItemToDelete(item);
      return;
    }
    const targetKey = item.cartItemId || item.id;
    if (onUpdateQuantity) {
      onUpdateQuantity(targetKey, delta);
    }
  };

  // Only calculate total for selected items
  const selectedItems = cartItems.filter((item, idx) => {
    const key = item.cartItemId || item.id || `cart-it-${idx}`;
    return selectedKeys.has(key);
  });

  const totalAmount = selectedItems.reduce(
    (acc, item) => acc + (Number(item.unitPrice || item.price || 0) * Number(item.quantity || 1)),
    0
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', position: 'relative', overflow: 'hidden' }}
      >
        {/* Header */}
        <div
          className="cart-modal-header"
          style={{
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(0, 242, 254, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShoppingBag size={20} color="var(--accent-cyan)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Keranjang Pesanan</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} kustom
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {cartItems.length > 0 && onClearCart && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowClearConfirm(true)}
                style={{ fontSize: '0.78rem', padding: '6px 12px', color: 'var(--text-muted)' }}
                title="Hapus semua item di keranjang"
              >
                Kosongkan
              </button>
            )}

            <button
              type="button"
              className="btn btn-outline btn-icon"
              style={{ width: '34px', height: '34px' }}
              onClick={onClose}
              title="Tutup Keranjang"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="cart-modal-body">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-secondary)' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <ShoppingBag size={28} color="var(--text-muted)" />
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Keranjang pesananmu masih kosong
              </h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '340px', margin: '0 auto' }}>
                Pilih koleksi aksesoris favoritmu atau rancang gantungan tas unikmu sendiri di Studio Kustomisasi!
              </p>
            </div>
          ) : (
            <div>
              {/* Select All Checkbox Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  userSelect: 'none'
                }}
              >
                <div
                  onClick={toggleSelectAll}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)'
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '5px',
                      border: isAllSelected ? '2px solid var(--accent-cyan)' : '2px solid var(--border-medium)',
                      background: isAllSelected ? 'var(--accent-cyan)' : 'var(--bg-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      flexShrink: 0
                    }}
                  >
                    {isAllSelected && <Check size={14} color="#000" strokeWidth={3} />}
                  </div>
                  <span>Pilih Semua ({cartItems.length} item)</span>
                </div>

                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: selectedItems.length > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                    {selectedItems.length}
                  </strong> dari {cartItems.length} dipilih
                </span>
              </div>

              {/* Items List */}
              <div className="cart-items-list" style={{ margin: 0 }}>
                {cartItems.map((item, idx) => {
                  const itemKey = item.cartItemId || item.id || `cart-it-${idx}`;
                  const isSelected = selectedKeys.has(itemKey);
                  const itemUnitPrice = Number(item.unitPrice || item.price || 0);
                  const itemQty = Number(item.quantity || 1);
                  const itemTotal = itemUnitPrice * itemQty;

                  return (
                    <div
                      key={itemKey}
                      className="cart-item-card"
                      style={{
                        transition: 'all 0.15s ease',
                        border: isSelected ? '1px solid rgba(0, 242, 254, 0.4)' : '1px solid var(--border-subtle)',
                        background: isSelected ? 'rgba(0, 242, 254, 0.02)' : 'var(--bg-tertiary)',
                        alignItems: 'center'
                      }}
                    >
                      {/* Checkbox per Item */}
                      <div
                        onClick={() => toggleSelectItem(itemKey)}
                        style={{
                          width: '22px',
                          height: '22px',
                          minWidth: '22px',
                          borderRadius: '6px',
                          border: isSelected ? '2px solid var(--accent-cyan)' : '2px solid var(--border-medium)',
                          background: isSelected ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0,
                          alignSelf: 'center',
                          margin: 'auto 0',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 2px 6px rgba(0, 242, 254, 0.25)' : 'none'
                        }}
                        title={isSelected ? 'Batalkan pilihan item ini' : 'Pilih item ini untuk dibeli'}
                      >
                        {isSelected && <Check size={14} color="#000" strokeWidth={3} />}
                      </div>

                      {/* Thumbnail: Product Photo or Photostrip */}
                      <div
                        className="cart-item-thumb"
                        style={{
                          opacity: isSelected ? 1 : 0.65,
                          width: '56px',
                          height: '56px',
                          minWidth: '56px',
                          minHeight: '56px',
                          borderRadius: '8px',
                          flexShrink: 0,
                          alignSelf: 'center',
                          margin: 'auto 0'
                        }}
                      >
                        {item.image ? (
                          <img src={item.image} alt={item.title} />
                        ) : item.frameImage ? (
                          <img src={item.frameImage} alt={item.frameName || 'Frame'} />
                        ) : (
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: item.cordColor || '#00F2FE',
                              border: `2px solid ${item.hardwareColor || '#94A3B8'}`
                            }}
                          />
                        )}
                      </div>

                      {/* Item Information */}
                      <div className="cart-item-info" style={{ flex: 1, minWidth: 0 }}>
                        <div className="cart-item-title" style={{ fontSize: '0.94rem', fontWeight: 700, wordBreak: 'break-word', lineHeight: 1.35, marginBottom: '4px' }}>
                          {item.title}
                          {item.productType === 'bundling' && (
                            <span
                              className="badge badge-purple"
                              style={{ fontSize: '0.68rem', padding: '1px 6px', marginLeft: '6px' }}
                            >
                              Paket Bundling
                            </span>
                          )}
                        </div>

                      {/* Bundling Package Choices Details */}
                      {item.bundleChoices && (
                        <div
                          style={{
                            marginTop: '6px',
                            background: '#F9FAFB',
                            border: '1px solid #E5E7EB',
                            borderRadius: '10px',
                            padding: '8px 10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px'
                          }}
                        >
                          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Pilihan Isi Paket:
                          </div>
                          {item.bundleChoices.item1 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                              {item.bundleChoices.item1.image && (
                                <img
                                  src={item.bundleChoices.item1.image}
                                  alt=""
                                  style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }}
                                />
                              )}
                              <span>
                                <strong>{item.bundleChoices.item1.label || 'Item 1'}:</strong> {item.bundleChoices.item1.name}
                              </span>
                            </div>
                          )}
                          {item.bundleChoices.item2 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                              {item.bundleChoices.item2.image && (
                                <img
                                  src={item.bundleChoices.item2.image}
                                  alt=""
                                  style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }}
                                />
                              )}
                              <span>
                                <strong>{item.bundleChoices.item2.label || 'Item 2'}:</strong> {item.bundleChoices.item2.name}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="cart-item-details" style={{ fontSize: '0.8rem', marginTop: '2px', lineHeight: 1.45 }}>
                        {item.frameName && (
                          <div>
                            Template: <strong style={{ color: 'var(--accent-cyan)' }}>{item.frameName}</strong>
                          </div>
                        )}
                        {item.cordColorName && (
                          <div>
                            Warna Tali: <strong>{item.cordColorName}</strong>
                          </div>
                        )}
                        {item.hardwareName && (
                          <div>
                            Hardware: <strong>{item.hardwareName}</strong>
                          </div>
                        )}
                        {item.customLetters && (
                          <div>
                            Manik Inisial: <strong style={{ color: 'var(--accent-cyan)' }}>{item.customLetters}</strong>
                          </div>
                        )}
                      </div>

                      {/* Photostrip Mini Slots Preview */}
                      {item.framePhotos && item.framePhotos.some(Boolean) && (
                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            Foto ({item.framePhotos.filter(Boolean).length}/3):
                          </span>
                          {item.framePhotos.map((photo, pIdx) =>
                            photo ? (
                              <img
                                key={pIdx}
                                src={photo}
                                alt={`Slot ${pIdx + 1}`}
                                style={{
                                  width: '20px',
                                  height: '24px',
                                  borderRadius: '3px',
                                  objectFit: 'cover',
                                  border: '1px solid var(--accent-cyan)'
                                }}
                              />
                            ) : null
                          )}
                        </div>
                      )}

                      {/* Charms Pills */}
                      {item.charms && item.charms.length > 0 && (
                        <div style={{ marginTop: '5px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {item.charms.map((ch, cIdx) => (
                            <span
                              key={cIdx}
                              style={{
                                fontSize: '0.72rem',
                                background: 'var(--bg-primary)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              {ch.icon || '★'} {ch.name || ch}
                            </span>
                          ))}
                        </div>
                      )}

                        {/* Bottom Row: Price on left, Quantity & Delete on right */}
                        <div
                          style={{
                            marginTop: '10px',
                            paddingTop: '8px',
                            borderTop: '1px dashed var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                            flexWrap: 'wrap'
                          }}
                        >
                          {/* Pricing */}
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                            <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '0.98rem', whiteSpace: 'nowrap' }}>
                              Rp {itemTotal.toLocaleString('id-ID')}
                            </span>
                            {itemQty > 1 && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                (@ Rp {itemUnitPrice.toLocaleString('id-ID')})
                              </span>
                            )}
                          </div>

                          {/* Controls Group */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {/* Quantity Controls */}
                            <div className="qty-counter" style={{ padding: '2px 4px' }}>
                              <button
                                type="button"
                                className="qty-btn"
                                style={{ width: '26px', height: '26px', minWidth: '26px', minHeight: '26px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(item, -1);
                                }}
                                title={itemQty === 1 ? 'Hapus item' : 'Kurangi jumlah'}
                                aria-label="Kurangi jumlah"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="qty-value" style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.86rem', fontWeight: 700 }}>
                                {itemQty}
                              </span>
                              <button
                                type="button"
                                className="qty-btn"
                                style={{ width: '26px', height: '26px', minWidth: '26px', minHeight: '26px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(item, 1);
                                }}
                                title="Tambah jumlah"
                                aria-label="Tambah jumlah"
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            {/* Delete Button */}
                            <button
                              type="button"
                              className="btn btn-outline btn-icon"
                              style={{
                                width: '30px',
                                height: '30px',
                                minWidth: '30px',
                                borderColor: 'transparent',
                                color: 'var(--accent-rose)',
                                padding: 0
                              }}
                              onClick={() => setItemToDelete(item)}
                              title="Hapus item ini dari keranjang"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
          </div>
        )}
      </div>

      {/* Footer Checkout */}
      {cartItems.length > 0 && (
        <div
          className="cart-modal-footer"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-primary)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total Pesanan</span>
              <div style={{ fontSize: '0.78rem', color: selectedItems.length > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                {selectedItems.length > 0 ? `${selectedItems.length} item dipilih` : 'Belum ada item yang dipilih'}
              </div>
            </div>
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: selectedItems.length > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)',
                fontFamily: 'var(--font-display)'
              }}
            >
              Rp {totalAmount.toLocaleString('id-ID')}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-lg"
            style={{
              width: '100%',
              opacity: selectedItems.length === 0 ? 0.45 : 1,
              cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            disabled={selectedItems.length === 0}
            onClick={() => {
              if (selectedItems.length === 0) return;
              if (onProceedCheckout) {
                onProceedCheckout(selectedItems);
              }
            }}
          >
            <span>
              {selectedItems.length > 0
                ? `Pembayaran (${selectedItems.length} item)`
                : 'Pilih Item untuk Dibeli'}
            </span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

        {/* ========================================================
            POPUP KONFIRMASI HAPUS ITEM (Sesuai Permintaan Pengguna)
            ======================================================== */}
        {itemToDelete && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.72)',
              backdropFilter: 'blur(5px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setItemToDelete(null)}
          >
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 20px',
                maxWidth: '380px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                animation: 'scaleIn 0.2s ease-out'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '1.5px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                <Trash2 size={26} />
              </div>

              <h4 style={{ fontSize: '1.15rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Hapus dari Keranjang?
              </h4>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                Apakah anda yakin ingin menghapusnya?
                <br />
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginTop: '6px' }}>
                  "{itemToDelete.title}"
                </strong>
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setItemToDelete(null)}
                  style={{ height: '40px', fontWeight: 600 }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{
                    background: '#EF4444',
                    color: '#FFFFFF',
                    borderColor: '#DC2626',
                    fontWeight: 700,
                    height: '40px'
                  }}
                  onClick={() => {
                    onRemoveItem(itemToDelete.cartItemId || itemToDelete.id);
                    setItemToDelete(null);
                  }}
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POPUP KONFIRMASI KOSONGKAN SEMUA KERANJANG */}
        {showClearConfirm && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.72)',
              backdropFilter: 'blur(5px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setShowClearConfirm(false)}
          >
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 20px',
                maxWidth: '380px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '1.5px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                <AlertTriangle size={26} />
              </div>

              <h4 style={{ fontSize: '1.15rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Kosongkan Keranjang?
              </h4>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                Apakah Anda yakin ingin menghapus semua ({cartItems.length}) item dari keranjang belanja?
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowClearConfirm(false)}
                  style={{ height: '40px', fontWeight: 600 }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{
                    background: '#EF4444',
                    color: '#FFFFFF',
                    borderColor: '#DC2626',
                    fontWeight: 700,
                    height: '40px'
                  }}
                  onClick={() => {
                    if (onClearCart) onClearCart();
                    setShowClearConfirm(false);
                  }}
                >
                  Ya, Kosongkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
