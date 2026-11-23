import React, { useState, useMemo, useEffect } from 'react';
import { X, Plus, Trash2, Users, Calendar, ShoppingBag, CreditCard, Sparkles, Check, AlertCircle, MapPin, Phone } from 'lucide-react';
import { aggregateCustomersFromOrders } from '../utils/excelExport';
import { useBodyScrollLock } from '../utils/scrollLock';

export default function AdminAddCustomerHistoryModal({
  isOpen,
  onClose,
  onSave,
  orders = [],
  collections = []
}) {
  useBodyScrollLock(isOpen);

  // Existing customers database for auto-matching
  const existingCustomers = useMemo(() => aggregateCustomersFromOrders(orders), [orders]);

  // Customer info
  const [customerWhatsApp, setCustomerWhatsApp] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  // Transaction details
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [channel, setChannel] = useState('Bazaar / Pop-up Event');
  const [paymentMethod, setPaymentMethod] = useState('Tunai / Cash');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [orderStatus, setOrderStatus] = useState('delivered');
  const [notes, setNotes] = useState('');

  // Items list
  const [items, setItems] = useState([
    {
      id: `hist-item-${Date.now()}-1`,
      productType: 'bracelet',
      title: '',
      unitPrice: 10000,
      quantity: 1,
      customLetters: '',
      image: ''
    }
  ]);

  // Manual total input
  const itemsSubtotal = items.reduce((sum, it) => sum + (Number(it.unitPrice || 0) * Number(it.quantity || 1)), 0);
  const [totalBelanja, setTotalBelanja] = useState(10000);
  const [isManualTotal, setIsManualTotal] = useState(false);

  useEffect(() => {
    if (!isManualTotal && itemsSubtotal > 0) {
      setTotalBelanja(itemsSubtotal);
    }
  }, [itemsSubtotal, isManualTotal]);

  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  // Check if WhatsApp matches an existing customer
  const cleanCurrentWA = customerWhatsApp.replace(/[^0-9]/g, '');
  const matchedCustomer = useMemo(() => {
    if (!cleanCurrentWA || cleanCurrentWA.length < 5) return null;
    return existingCustomers.find((c) => {
      const cWA = (c.whatsapp || '').replace(/[^0-9]/g, '');
      return cWA.endsWith(cleanCurrentWA.slice(-6)) || cleanCurrentWA.endsWith(cWA.slice(-6));
    });
  }, [cleanCurrentWA, existingCustomers]);

  // Autofill from matched customer
  const handleApplyMatchedCustomer = () => {
    if (matchedCustomer) {
      if (matchedCustomer.name && matchedCustomer.name !== 'Pelanggan') {
        setCustomerName(matchedCustomer.name);
      }
      if (matchedCustomer.city && matchedCustomer.city !== '-') {
        setCity(matchedCustomer.city);
      }
      if (matchedCustomer.address && matchedCustomer.address !== '-') {
        setAddress(matchedCustomer.address);
      }
    }
  };

  // Add an item
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `hist-item-${Date.now()}-${prev.length + 1}`,
        productType: 'bag_charm',
        title: '',
        unitPrice: 15000,
        quantity: 1,
        customLetters: '',
        image: ''
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

  // Select collection
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
          productType: found.category === 'gelang' ? 'bracelet' : 'bag_charm'
        };
        return updated;
      });
    }
  };

  // Calculations
  const totalAmount = items.reduce((sum, it) => sum + (Number(it.unitPrice || 0) * Number(it.quantity || 1)), 0);

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!customerWhatsApp.trim()) {
      setFormError('Mohon isi nomor WhatsApp pembeli.');
      return;
    }
    if (!customerName.trim()) {
      setFormError('Mohon isi nama lengkap pembeli.');
      return;
    }
    const hasEmptyTitle = items.some((it) => !it.title.trim());
    if (hasEmptyTitle) {
      setFormError('Mohon lengkapi nama produk pada semua item.');
      return;
    }

    const finalAmount = Number(totalBelanja || 0);
    if (isNaN(finalAmount) || finalAmount < 0) {
      setFormError('Mohon masukkan total belanja yang valid.');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ATC-H-${new Date().getFullYear()}-${randomSuffix}`;

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
        notes: notes.trim(),
        channel
      }
    }));

    const craftingStat = orderStatus === 'delivered' ? 'completed' : 'in_crafting';

    const orderPayload = {
      id: orderId,
      createdAt: new Date(`${transactionDate}T${new Date().toTimeString().split(' ')[0]}`).toISOString(),
      customer: {
        name: customerName.trim(),
        whatsapp: customerWhatsApp.trim(),
        city: city.trim() || '-',
        address: address.trim() || '-',
        courier: channel.includes('Bazaar') || channel.includes('Toko') ? 'Langsung di Lokasi' : 'Ambil di Toko / COD',
        courierCost: 0,
        notes: notes.trim()
      },
      items: formattedItems,
      total: finalAmount,
      totalAmount: finalAmount,
      paymentMethod,
      paymentStatus,
      craftingStatus: craftingStat,
      orderStatus,
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
              <span className="badge badge-lime" style={{ fontSize: '0.72rem' }}>
                Pencatatan Riwayat Pembelian
              </span>
              <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                Database Customer & LTV
              </span>
            </div>
            <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>
              Tambah Riwayat Pembelian
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
          <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

            {/* Section 1: Customer Profile */}
            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                <Users size={16} color="var(--accent-purple)" />
                <span>Profil Pelanggan</span>
              </h4>

              <div className="admin-modal-form-grid" style={{ marginBottom: '12px' }}>
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
                    Nama Pembeli *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Amanda Putri"
                    className="form-input"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Kota / Wilayah
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Surabaya"
                    className="form-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              {/* Matched Customer Banner */}
              {matchedCustomer && (
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #86EFAC',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '8px'
                  }}
                >
                  <div style={{ fontSize: '0.82rem', color: '#166534' }}>
                    <strong>💡 Pelanggan Terdaftar:</strong> {matchedCustomer.name} (Pernah order {matchedCustomer.ordersCount}x, Total Rp {matchedCustomer.totalSpent.toLocaleString('id-ID')})
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={handleApplyMatchedCustomer}
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    Gunakan Data Profil
                  </button>
                </div>
              )}

              <div style={{ marginTop: '10px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Alamat Lengkap (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Alamat rumah / kantor pelanggan..."
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Section 2: Transaction History & Items */}
            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                  <ShoppingBag size={16} color="var(--accent-purple)" />
                  <span>Produk yang Dibeli ({items.length} Item)</span>
                </h4>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                >
                  <Plus size={14} />
                  <span>Tambah Item</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#F9FAFB',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                        Item {idx + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="btn btn-sm"
                          style={{
                            padding: '2px 6px',
                            color: '#EF4444',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem'
                          }}
                        >
                          <Trash2 size={12} />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>

                    <div className="admin-modal-form-grid" style={{ marginBottom: '8px' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                          Pilih dari Koleksi Toko
                        </label>
                        <select
                          className="form-select"
                          onChange={(e) => handleSelectCollection(idx, e.target.value)}
                          defaultValue=""
                        >
                          <option value="">-- Pilih Koleksi atau Ketik Manual --</option>
                          {collections.map((col) => (
                            <option key={col.id} value={col.id}>
                              {col.name} — Rp {(col.price || 0).toLocaleString('id-ID')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                          Nama Produk *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Misal: White Pearl Star Bracelet"
                          className="form-input"
                          value={item.title}
                          onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                          Kategori
                        </label>
                        <select
                          className="form-select"
                          value={item.productType}
                          onChange={(e) => handleUpdateItem(idx, 'productType', e.target.value)}
                        >
                          <option value="bracelet">Gelang Manik</option>
                          <option value="bag_charm">Bagcharm Custom</option>
                          <option value="bundle">Paket Bundling</option>
                          <option value="other">Aksesoris Lainnya</option>
                        </select>
                      </div>
                    </div>

                    <div className="admin-modal-form-grid">
                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                          Harga Satuan (Rp) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          className="form-input"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(idx, 'unitPrice', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
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

                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '6px' }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>
                          Subtotal: Rp {(Number(item.unitPrice || 0) * Number(item.quantity || 1)).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Transaction Info & Notes */}
            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                <CreditCard size={16} color="var(--accent-purple)" />
                <span>Informasi Pembayaran & Transaksi</span>
              </h4>

              <div className="admin-modal-form-grid" style={{ marginBottom: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Tanggal Pembelian / Transaksi
                  </label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Tempat / Saluran Pembelian
                  </label>
                  <select
                    className="form-select"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                  >
                    <option value="Bazaar / Pop-up Event">Bazaar / Pop-up Event</option>
                    <option value="Toko Offline / Workshop">Toko Offline / Workshop</option>
                    <option value="WhatsApp Direct">WhatsApp Direct</option>
                    <option value="Instagram / TikTok DM">Instagram / TikTok DM</option>
                    <option value="Pameran / Car Free Day">Pameran / Car Free Day</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Metode Pembayaran
                  </label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Tunai / Cash">Tunai / Cash</option>
                    <option value="QRIS">QRIS</option>
                    <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                    <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                    <option value="Transfer Bank BRI">Transfer Bank BRI</option>
                    <option value="Kartu Debit / EDC">Kartu Debit / EDC</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-form-grid">
                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Status Transaksi
                  </label>
                  <select
                    className="form-select"
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                  >
                    <option value="delivered">Selesai (Sudah Diterima Pelanggan)</option>
                    <option value="processing">Sedang Diproses</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Catatan Transaksi (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Pembelian langsung di booth Pop-up Market TP 3"
                    className="form-input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Input Total Belanja Sendiri */}
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
                  Total Belanja Transaksi (Rp) *
                </label>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  Input langsung nominal total belanja yang dibayar pelanggan
                </div>
                {itemsSubtotal > 0 && isManualTotal && (
                  <button
                    type="button"
                    onClick={() => {
                      setTotalBelanja(itemsSubtotal);
                      setIsManualTotal(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#059669',
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
                  value={totalBelanja}
                  onChange={(e) => {
                    setTotalBelanja(e.target.value);
                    setIsManualTotal(true);
                  }}
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: '#059669',
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
                background: '#059669',
                borderColor: '#047857',
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
              <span>Simpan Riwayat Pembelian</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
