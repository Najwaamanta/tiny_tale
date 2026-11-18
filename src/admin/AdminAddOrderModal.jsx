import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Package, User, CreditCard, Image as ImageIcon, Calendar, Check, AlertCircle } from 'lucide-react';
import { useBodyScrollLock } from '../utils/scrollLock';

export default function AdminAddOrderModal({
  isOpen,
  onClose,
  onSave,
  collections = []
}) {
  useBodyScrollLock(isOpen);

  // Customer state
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsApp, setCustomerWhatsApp] = useState('');
  const [channel, setChannel] = useState('WhatsApp Direct');
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Payment & notes
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank BCA');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [notes, setNotes] = useState('');

  // Items list
  const [items, setItems] = useState([
    {
      id: `item-${Date.now()}-1`,
      productType: 'bag_charm',
      title: '',
      unitPrice: 15000,
      quantity: 1,
      customLetters: '',
      cordColor: '',
      image: '',
      notes: ''
    }
  ]);

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
      {
        id: `item-${Date.now()}-${prev.length + 1}`,
        productType: 'bracelet',
        title: '',
        unitPrice: 10000,
        quantity: 1,
        customLetters: '',
        cordColor: '',
        image: '',
        notes: ''
      }
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
        updated[idx] = {
          ...updated[idx],
          title: found.name,
          unitPrice: found.price || 15000,
          image: found.image || '',
          productType: found.category === 'gelang' ? 'bracelet' : 'bag_charm'
        };
        return updated;
      });
    }
  };

  // Photo upload for an item
  const handleImageUpload = (idx, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleUpdateItem(idx, 'image', reader.result);
      };
      reader.readAsDataURL(file);
    }
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

    const formattedItems = items.map((it, i) => ({
      id: `${orderId}-it-${i + 1}`,
      productType: it.productType,
      title: it.title,
      unitPrice: Number(it.unitPrice || 0),
      quantity: Number(it.quantity || 1),
      subtotal: Number(it.unitPrice || 0) * Number(it.quantity || 1),
      image: it.image || null,
      customLetters: it.customLetters || '',
      customDetails: {
        cordColor: it.cordColor || '',
        notes: it.notes || '',
        variant: it.productType
      }
    }));

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
        style={{ maxWidth: '800px', maxHeight: '92vh' }}
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#F9FAFB',
                      padding: '14px',
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.74rem' }}>
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

                    <div className="admin-modal-form-grid" style={{ marginBottom: '10px' }}>
                      {/* Pick existing collection */}
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

                      {/* Product Name */}
                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          Nama Produk / Aksesoris *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Misal: Pastel Pink Bagcharm"
                          className="form-input"
                          value={item.title}
                          onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                        />
                      </div>

                      {/* Product Type */}
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

                    <div className="admin-modal-form-grid" style={{ marginBottom: '10px' }}>
                      {/* Price */}
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

                      {/* Quantity */}
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

                      {/* Custom Letters */}
                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          Inisial / Huruf Kustom (Opsional)
                        </label>
                        <input
                          type="text"
                          placeholder="Misal: CLARA"
                          className="form-input"
                          value={item.customLetters}
                          onChange={(e) => handleUpdateItem(idx, 'customLetters', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Image / Photo upload (Optional) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '6px' }}>
                      {item.image ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img
                            src={item.image}
                            alt="Preview"
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={() => handleUpdateItem(idx, 'image', '')}
                            style={{ color: '#EF4444', borderColor: '#FCA5A5', padding: '4px 8px', fontSize: '0.72rem' }}
                          >
                            Hapus Foto
                          </button>
                        </div>
                      ) : (
                        <label
                          className="btn btn-secondary btn-sm"
                          style={{ cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}
                        >
                          <ImageIcon size={13} />
                          <span>Upload Foto Item / Frame (Opsional)</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleImageUpload(idx, e)}
                          />
                        </label>
                      )}

                      <span style={{ fontSize: '0.82rem', color: '#6B7280', marginLeft: 'auto', fontWeight: 600 }}>
                        Subtotal Item: Rp {(Number(item.unitPrice || 0) * Number(item.quantity || 1)).toLocaleString('id-ID')}
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
                    <option value="Tunai / Cash">Tunai / Cash</option>
                    <option value="COD (Bayar di Tempat)">COD (Bayar di Tempat)</option>
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
                    <option value="paid">Lunas (Sudah Dibayar)</option>
                    <option value="pending_verification">Menunggu Konfirmasi Bukti</option>
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
