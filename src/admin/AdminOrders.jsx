import React, { useState } from 'react';
import { Truck, Check, Clock, Eye, AlertCircle, Sparkles, Send, ShieldCheck, Filter, Download, Search, Image as ImageIcon, MapPin, Phone, Package, Plus, Trash2 } from 'lucide-react';
import { exportOrdersToExcel } from '../utils/excelExport';
import { downloadPhotostripFrame, resolveFrameConfig, getFramePhotosForItem } from '../utils/frameExport';
import AdminAddOrderModal from './AdminAddOrderModal';

export default function AdminOrders({ orders = [], collections = [], onUpdateOrderStatus, onAddOrder, onDeleteOrder }) {
  const [localOrders, setLocalOrders] = useState(orders);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [downloadingItemId, setDownloadingItemId] = useState(null);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);

  React.useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  const handleDeleteOrder = async (order) => {
    if (!order) return;
    const customerName = order.customer?.name || 'Pelanggan';
    const confirmMsg = `Hapus pesanan ${order.id} atas nama "${customerName}"?\n\nData pesanan akan dihapus permanen dari database.`;
    if (window.confirm(confirmMsg)) {
      setLocalOrders((prev) => prev.filter((o) => o.id !== order.id));
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder(null);
      }
      if (onDeleteOrder) {
        await onDeleteOrder(order.id);
      }
    }
  };

  // Filter orders by search keyword
  const filteredOrders = localOrders.filter((o) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const idMatch = (o.id || '').toLowerCase().includes(q);
    const nameMatch = (o.customer?.name || '').toLowerCase().includes(q);
    const waMatch = (o.customer?.whatsapp || '').toLowerCase().includes(q);
    const itemMatch = (o.items || []).some((it) => (it.title || '').toLowerCase().includes(q));

    return idMatch || nameMatch || waMatch || itemMatch;
  });

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
  };

  const handleExportExcel = () => {
    exportOrdersToExcel(filteredOrders);
  };

  const handleDownloadFrame = async (item, order) => {
    const key = `${order.id}-${item.id || item.title}`;
    setDownloadingItemId(key);
    try {
      await downloadPhotostripFrame({
        item,
        orderId: order.id,
        customerName: order.customer?.name || 'Customer'
      });
    } catch (err) {
      console.error('Download frame error:', err);
      alert('Gagal mengunduh frame foto. Pastikan aset frame tersedia.');
    } finally {
      setDownloadingItemId(null);
    }
  };

  return (
    <div>
      {/* Top Search Bar & Download Excel Button */}
      <div className="admin-toolbar-row">
        <div className="admin-search-wrap">
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Cari order ID, nama pembeli, WhatsApp, produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px', height: '40px', fontSize: '0.88rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsAddOrderOpen(true)}
            style={{
              background: '#21201D',
              borderColor: '#21201D',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              height: '40px',
              padding: '0 16px'
            }}
            title="Input Pesanan Manual dari WhatsApp, DM, atau Offline"
          >
            <Plus size={16} />
            <span>Tambah Pesanan</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleExportExcel}
            style={{
              background: '#059669',
              borderColor: '#047857',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              height: '40px',
              padding: '0 16px'
            }}
            title="Download Data Pesanan ke File Excel (.xlsx)"
          >
            <Download size={15} />
            <span>Download Excel Pesanan</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-table-card">
        <div className="admin-table-head">
          <div>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Daftar Antrean Pesanan Custom</span>
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Menampilkan {filteredOrders.length} dari total {localOrders.length} pesanan
            </span>
          </div>

          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Klik <strong>Detail</strong> untuk melihat panduan perakitan & download frame foto
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="admin-desktop-table table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>No. Order</th>
                <th>Tanggal</th>
                <th>Pemesan & WhatsApp</th>
                <th>Item Kustom & Frame</th>
                <th>Total Belanja</th>
                <th>Status Bayar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Package size={36} color="var(--border-medium)" />
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        Belum Ada Pesanan Masuk
                      </div>
                      <div style={{ fontSize: '0.82rem', maxWidth: '380px' }}>
                        Pesanan baru dari customer yang checkout melalui website akan otomatis muncul di tabel ini secara realtime.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const hasBagCharm = (ord.items || []).some(
                    (it) => it.productType === 'bag_charm' || it.title?.toLowerCase().includes('bag charm') || it.title?.toLowerCase().includes('bagcharm')
                  );

                  return (
                    <tr key={ord.id}>
                      <td>
                        <strong style={{ color: 'var(--accent-purple)', fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>
                          {ord.id}
                        </strong>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.92rem' }}>{ord.customer?.name || 'Pelanggan'}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {ord.customer?.whatsapp || '-'}
                        </div>
                      </td>
                      <td>
                        {(ord.items || []).map((it, i) => (
                          <div key={i} style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                            • <strong>{it.title}</strong> {it.customLetters && <span style={{ color: 'var(--accent-purple)' }}>[{it.customLetters}]</span>}
                          </div>
                        ))}
                        {hasBagCharm && (
                          <span className="badge badge-purple" style={{ fontSize: '0.72rem', marginTop: '4px' }}>
                            🖼️ Frame Foto Tersedia
                          </span>
                        )}
                      </td>
                      <td>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                          Rp {(ord.totalAmount ?? ord.total ?? 0).toLocaleString('id-ID')}
                        </strong>
                      </td>
                      <td>
                        <span className={`badge ${ord.paymentStatus === 'paid' ? 'badge-lime' : 'badge-amber'}`}>
                          {ord.paymentStatus === 'paid' ? 'Lunas' : 'Verifikasi'}
                        </span>
                        {(ord.paymentProof || ord.paymentProofUrl) && (
                          <div style={{ marginTop: '4px' }}>
                            <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                              🧾 Bukti Ada
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenDetail(ord)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 10px' }}
                            title="Lihat detail pesanan & frame"
                          >
                            <Eye size={14} />
                            <span>Detail</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => handleDeleteOrder(ord)}
                            title="Hapus pesanan ini"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 10px',
                              color: '#E11D48',
                              borderColor: 'rgba(225, 29, 72, 0.3)'
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View (Clean & Responsive on HP) */}
        <div className="admin-mobile-cards">
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <Package size={36} color="var(--border-medium)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 700 }}>Belum Ada Pesanan Masuk</div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Pesanan baru dari website akan tampil otomatis di sini.</div>
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const itemsCount = (ord.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);
              const hasFrame = (ord.items || []).some(
                (it) => it.customDetails?.photos?.some(Boolean) || (it.photos && it.photos.length > 0)
              );

              return (
                <div key={ord.id} className="admin-mobile-card-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '0.98rem', color: 'var(--accent-purple)' }}>{ord.id}</strong>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </div>
                    </div>
                    <span className="badge badge-lime">
                      {ord.paymentStatus === 'paid' ? 'Lunas' : 'Menunggu'}
                    </span>
                  </div>

                  <div className="admin-mobile-card-meta">
                    <div><strong>Pemesan:</strong> {ord.customer?.name || 'Pelanggan'} ({ord.customer?.whatsapp || '-'})</div>
                    <div><strong>Total:</strong> Rp {(ord.totalAmount || ord.total || 0).toLocaleString('id-ID')} ({itemsCount} item)</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {(ord.paymentProof || ord.paymentProofUrl) && (
                        <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>🧾 Bukti Bayar QRIS</span>
                      )}
                      {hasFrame && (
                        <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>🖼️ Frame Foto Tersedia</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleOpenDetail(ord)}
                      style={{ flex: 1, justifyContent: 'center', height: '38px', fontWeight: 700 }}
                    >
                      <Eye size={14} />
                      <span>Lihat Panduan & Frame</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleDeleteOrder(ord)}
                      title="Hapus pesanan"
                      style={{
                        height: '38px',
                        padding: '0 14px',
                        color: '#E11D48',
                        borderColor: 'rgba(225, 29, 72, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 700
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px', maxHeight: '92vh' }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAF8F4' }}>
              <div>
                <span className="badge badge-purple" style={{ marginBottom: '4px' }}>Meja Artisan Lab</span>
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Detail Pesanan: {selectedOrder.id}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleDeleteOrder(selectedOrder)}
                  title="Hapus pesanan ini dari database"
                  style={{
                    color: '#E11D48',
                    borderColor: 'rgba(225, 29, 72, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  <Trash2 size={14} />
                  <span>Hapus Pesanan</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-icon"
                  style={{ width: '34px', height: '34px' }}
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="admin-modal-body">
              {/* Customer & Payment Summary */}
              <div
                className="admin-modal-form-grid"
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  fontSize: '0.85rem'
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Pemesan:</div>
                  <strong style={{ fontSize: '0.95rem' }}>{selectedOrder.customer?.name || 'Pelanggan'}</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Phone size={13} color="#059669" />
                    <span>WhatsApp: {selectedOrder.customer?.whatsapp || '-'}</span>
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                      Metode: {selectedOrder.paymentMethod || 'QRIS'}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Total Pembayaran:</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    Rp {(selectedOrder.totalAmount ?? selectedOrder.total ?? 0).toLocaleString('id-ID')}
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <span className={`badge ${selectedOrder.paymentStatus === 'paid' ? 'badge-lime' : 'badge-amber'}`}>
                      Status: {selectedOrder.paymentStatus === 'paid' ? 'Lunas' : 'Verifikasi'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Payment Proof (Bukti Transfer QRIS) */}
              {(selectedOrder.paymentProof || selectedOrder.paymentProofUrl) && (
                <div
                  style={{
                    background: 'rgba(0, 242, 254, 0.05)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    marginBottom: '20px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--accent-cyan)' }}>
                      🧾 Bukti Pembayaran QRIS dari Pembeli:
                    </strong>
                    <a
                      href={selectedOrder.paymentProof || selectedOrder.paymentProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    >
                      Buka Gambar Penuh
                    </a>
                  </div>
                  <div style={{ maxWidth: '280px', maxHeight: '220px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                    <img
                      src={selectedOrder.paymentProof || selectedOrder.paymentProofUrl}
                      alt="Bukti Transfer QRIS"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#000000' }}
                    />
                  </div>
                </div>
              )}

              {/* Items Blueprint Breakdown for Crafter */}
              <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} />
                <span>Daftar Komponen & Frame Foto untuk Pengerajin:</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {(selectedOrder.items || []).map((it, idx) => {
                  const isBagCharm = it.productType === 'bag_charm' || it.title?.toLowerCase().includes('bag charm') || it.title?.toLowerCase().includes('bagcharm');
                  const frameConf = resolveFrameConfig(it);
                  const photos = getFramePhotosForItem(it);
                  const dlKey = `${selectedOrder.id}-${it.id || idx}`;
                  const isDownloading = downloadingItemId === dlKey;

                  return (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                        padding: '18px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '1rem' }}>{it.title || 'Custom Item'}</strong>
                        <span className="badge badge-purple">{(it.productType || 'custom').toUpperCase()}</span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        • Base Model: <strong>{it.baseName || 'Custom'}</strong> (Warna Tali: {it.cordColor || it.cordColorName || '-'})
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        • Hardware Clasp: <strong>{it.hardwareName || 'Standard Clasp'}</strong>
                      </div>

                      {/* Custom Letters */}
                      {it.customLetters && (
                        <div style={{ margin: '10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Manik Huruf Nama:</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {it.customLetters.split('').map((char, cI) => (
                              <span
                                key={cI}
                                style={{
                                  padding: '3px 9px',
                                  background: '#21201D',
                                  color: '#FFFFFF',
                                  fontWeight: 800,
                                  borderRadius: '4px',
                                  fontSize: '0.85rem'
                                }}
                              >
                                {char}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Charms */}
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Charms / Pendants:</div>
                        {it.charms && it.charms.length > 0 ? (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                            {it.charms.map((ch, cI) => (
                              <span key={cI} className="crafter-component-tag">
                                {ch.icon || '★'} {ch.name || ch}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tidak ada charm tambahan</span>
                        )}
                      </div>

                      {/* Photostrip Frame Download Box (Specific User Request) */}
                      {isBagCharm && (
                        <div className="admin-photostrip-box">
                          {/* Left: Thumbnail preview rendered WITH EXACT SLOTS and OVERLAY */}
                          <div
                            style={{
                              width: '92px',
                              height: '216px',
                              position: 'relative',
                              borderRadius: '4px',
                              overflow: 'hidden',
                              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                              background: '#FFFFFF',
                              flexShrink: 0
                            }}
                          >
                            {/* 1. Base frame image */}
                            <img
                              src={frameConf.baseImage}
                              alt={frameConf.name}
                              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            />

                            {/* 2. Photos in exact percentage slot coordinates */}
                            {frameConf.slots.map((s, sIdx) => {
                              const pSrc = photos[sIdx];
                              return (
                                <div
                                  key={sIdx}
                                  style={{
                                    position: 'absolute',
                                    top: s.top,
                                    left: s.left,
                                    width: s.width,
                                    height: s.height,
                                    borderRadius: s.borderRadius || '0px',
                                    overflow: 'hidden',
                                    background: '#E2E8F0'
                                  }}
                                >
                                  {pSrc && (
                                    <img
                                      src={pSrc}
                                      alt={`Slot ${sIdx + 1}`}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    />
                                  )}
                                </div>
                              );
                            })}

                            {/* 3. Overlay image on top */}
                            {frameConf.overlayImage && (
                              <img
                                src={frameConf.overlayImage}
                                alt=""
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  pointerEvents: 'none'
                                }}
                              />
                            )}
                          </div>

                          {/* Right: Info and Download Button */}
                          <div style={{ flex: 1, minWidth: '240px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <ImageIcon size={16} color="var(--accent-purple)" />
                              <strong style={{ fontSize: '0.98rem' }}>{frameConf.name}</strong>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              Terdiri dari {frameConf.slots.length} foto photostrip yang telah rapi terpasang pada frame.
                            </div>

                            {/* Download Action */}
                            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn btn-sm"
                                disabled={isDownloading}
                                onClick={() => handleDownloadFrame(it, selectedOrder)}
                                style={{
                                  background: '#4F46E5',
                                  color: '#FFFFFF',
                                  borderColor: '#4338CA',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontWeight: 700,
                                  padding: '8px 16px'
                                }}
                              >
                                <Download size={14} />
                                <span>{isDownloading ? 'Sedang Memproses PNG...' : 'Download Frame Foto Siap Cetak (PNG)'}</span>
                              </button>
                            </div>

                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                              ✓ Resolusi tinggi (849 × 1993 px), siap langsung diprint dan dimasukkan ke casing bagcharm.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add Manual Order Modal */}
      {isAddOrderOpen && (
        <AdminAddOrderModal
          isOpen={isAddOrderOpen}
          onClose={() => setIsAddOrderOpen(false)}
          onSave={(orderData) => {
            if (onAddOrder) {
              onAddOrder(orderData);
            }
          }}
          collections={collections}
        />
      )}
    </div>
  );
}
