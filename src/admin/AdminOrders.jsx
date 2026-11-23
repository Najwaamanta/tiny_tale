import React, { useState } from 'react';
import { Truck, Check, Clock, Eye, AlertCircle, Sparkles, Send, ShieldCheck, Filter, Download, Search, Image as ImageIcon, MapPin, Phone, Package, Plus, Trash2, X } from 'lucide-react';
import { exportOrdersToExcel } from '../utils/excelExport';
import { downloadPhotostripFrame, resolveFrameConfig, getFramePhotosForItem } from '../utils/frameExport';
import { getAccentDisplay, isGelangItem, isBagCharmItem, getGelangImage, getCharmIcon, resolveCordName } from '../utils/accentHelper';
import AdminAddOrderModal from './AdminAddOrderModal';

export default function AdminOrders({ orders = [], collections = [], onUpdateOrderStatus, onAddOrder, onDeleteOrder }) {
  const [localOrders, setLocalOrders] = useState(orders);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [downloadingItemId, setDownloadingItemId] = useState(null);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [frameOverrides, setFrameOverrides] = useState({});
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  const handleDeleteOrder = (order) => {
    if (!order) return;
    setOrderToDelete(order);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    const targetOrder = orderToDelete;
    try {
      setLocalOrders((prev) => prev.filter((o) => o.id !== targetOrder.id));
      if (selectedOrder && selectedOrder.id === targetOrder.id) {
        setSelectedOrder(null);
      }
      if (onDeleteOrder) {
        await onDeleteOrder(targetOrder.id);
      }
    } catch (err) {
      console.error('Error deleting order:', err);
    } finally {
      setIsDeleting(false);
      setOrderToDelete(null);
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newStatus) => {
    // 1. Optimistic update in local state
    setLocalOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: newStatus } : o))
    );

    // 2. Update selectedOrder if it's currently open in modal
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, paymentStatus: newStatus }));
    }

    // 3. Persist to store & MySQL database
    if (onUpdateOrderStatus) {
      try {
        await onUpdateOrderStatus(orderId, { paymentStatus: newStatus });
      } catch (err) {
        console.error('Failed to update payment status:', err);
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

  const handleDownloadFrame = async (item, order, subLabel = '', overrideConfig = null, overridePhotos = null) => {
    const key = `${order.id}-${item.id || item.title || 'item'}-${subLabel}`;
    setDownloadingItemId(key);
    try {
      await downloadPhotostripFrame({
        item,
        orderId: order.id,
        customerName: order.customer?.name || 'Customer',
        subLabel,
        overrideFrameConfig: overrideConfig,
        overridePhotos
      });
    } catch (err) {
      console.error('Download frame error:', err);
      alert('Gagal mengunduh frame foto. Pastikan aset frame tersedia.');
    } finally {
      setDownloadingItemId(null);
    }
  };

  const handleFrameChange = (key, num) => {
    setFrameOverrides((prev) => ({
      ...prev,
      [key]: num
    }));
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
                        {(ord.items || []).map((it, i) => {
                          const isGelang = isGelangItem(it);
                          const itAcc = getAccentDisplay(it);
                          return (
                            <div key={i} style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                              • <strong>{it.title}</strong> {it.customLetters && <span style={{ color: 'var(--accent-purple)' }}>[{it.customLetters}]</span>}
                              {it.bundleChoices ? (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: '8px', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  {it.bundleChoices.item1 && (
                                    <div>
                                      - {it.bundleChoices.item1.name || it.bundleChoices.item1.label}
                                      {it.bundleChoices.item1.cordColor || it.bundleChoices.item1.cordColorName ? (
                                        <span> (Tali: <strong>{resolveCordName(it.bundleChoices.item1.cordColorName || it.bundleChoices.item1.cordColor)}</strong>, Bintang: <strong>{getAccentDisplay(it.bundleChoices.item1).name}</strong>)</span>
                                      ) : null}
                                    </div>
                                  )}
                                  {it.bundleChoices.item2 && (
                                    <div>
                                      - {it.bundleChoices.item2.name || it.bundleChoices.item2.label}
                                      {it.bundleChoices.item2.cordColor || it.bundleChoices.item2.cordColorName ? (
                                        <span> (Tali: <strong>{resolveCordName(it.bundleChoices.item2.cordColorName || it.bundleChoices.item2.cordColor)}</strong>, Bintang: <strong>{getAccentDisplay(it.bundleChoices.item2).name}</strong>)</span>
                                      ) : null}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                !isGelang && (
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '1px' }}>
                                    <span>Aksen:</span>
                                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: itAcc.hex, border: `1px solid ${itAcc.border}`, display: 'inline-block' }} />
                                    <strong>{itAcc.name}</strong>
                                    {(it.cordColor || it.cordColorName) && (
                                      <span style={{ marginLeft: '4px' }}>
                                        • Tali: <strong>{resolveCordName(it.cordColorName || it.cordColor)}</strong>
                                      </span>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          );
                        })}
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
                        {(() => {
                          const isCash = (ord.paymentMethod || '').toLowerCase().includes('cash') || (ord.paymentMethod || '').toLowerCase().includes('tunai');
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                              {isCash ? (
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                  <select
                                    value={ord.paymentStatus === 'paid' ? 'paid' : 'pending'}
                                    onChange={(e) => handleUpdatePaymentStatus(ord.id, e.target.value)}
                                    style={{
                                      appearance: 'none',
                                      WebkitAppearance: 'none',
                                      MozAppearance: 'none',
                                      background: ord.paymentStatus === 'paid' ? '#ECFDF5' : '#FEF3C7',
                                      color: ord.paymentStatus === 'paid' ? '#065F46' : '#92400E',
                                      border: ord.paymentStatus === 'paid' ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                                      borderRadius: '9999px',
                                      padding: '4px 22px 4px 10px',
                                      fontSize: '0.76rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      outline: 'none',
                                      transition: 'all 0.2s',
                                      display: 'inline-flex',
                                      alignItems: 'center'
                                    }}
                                    title="Klik untuk mengubah status pembayaran cash"
                                  >
                                    <option value="paid" style={{ background: '#FFFFFF', color: '#065F46' }}>✓ Lunas</option>
                                    <option value="pending" style={{ background: '#FFFFFF', color: '#92400E' }}>⏳ Verifikasi</option>
                                  </select>
                                  <span
                                    style={{
                                      position: 'absolute',
                                      right: '7px',
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      pointerEvents: 'none',
                                      fontSize: '8px',
                                      color: ord.paymentStatus === 'paid' ? '#065F46' : '#92400E'
                                    }}
                                  >
                                    ▼
                                  </span>
                                </div>
                              ) : (
                                <span className="badge badge-lime" style={{ fontSize: '0.76rem', padding: '4px 10px', borderRadius: '9999px' }}>
                                  ✓ Lunas
                                </span>
                              )}

                              {ord.paymentMethod && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  {isCash ? '💵 Tunai/Cash' : '📱 QRIS'}
                                </span>
                              )}
                              {(ord.paymentProof || ord.paymentProofUrl) && (
                                <span className="badge badge-purple" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                                  🧾 Bukti Ada
                                </span>
                              )}
                            </div>
                          );
                        })()}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '1rem', color: 'var(--accent-purple)', fontFamily: 'var(--font-display)' }}>
                        {ord.id}
                      </strong>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </div>
                    </div>
                    {(() => {
                      const isCash = (ord.paymentMethod || '').toLowerCase().includes('cash') || (ord.paymentMethod || '').toLowerCase().includes('tunai');
                      if (!isCash) {
                        return (
                          <span
                            className="badge badge-lime"
                            style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px' }}
                          >
                            ✓ Lunas
                          </span>
                        );
                      }
                      return (
                        <div style={{ position: 'relative' }}>
                          <select
                            value={ord.paymentStatus === 'paid' ? 'paid' : 'pending'}
                            onChange={(e) => handleUpdatePaymentStatus(ord.id, e.target.value)}
                            style={{
                              appearance: 'none',
                              WebkitAppearance: 'none',
                              MozAppearance: 'none',
                              background: ord.paymentStatus === 'paid' ? '#ECFDF5' : '#FEF3C7',
                              color: ord.paymentStatus === 'paid' ? '#065F46' : '#92400E',
                              border: ord.paymentStatus === 'paid' ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                              borderRadius: '9999px',
                              padding: '3px 20px 3px 8px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                            title="Klik untuk mengubah status bayar"
                          >
                            <option value="paid">✓ Lunas</option>
                            <option value="pending">⏳ Verifikasi</option>
                          </select>
                          <span
                            style={{
                              position: 'absolute',
                              right: '6px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              pointerEvents: 'none',
                              fontSize: '8px',
                              color: ord.paymentStatus === 'paid' ? '#065F46' : '#92400E'
                            }}
                          >
                            ▼
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  <div
                    className="admin-mobile-card-meta"
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Pemesan: </span>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.84rem' }}>{ord.customer?.name || 'Pelanggan'}</strong>
                      </div>
                      {ord.customer?.whatsapp && ord.customer.whatsapp !== '-' && (
                        <a
                          href={`https://wa.me/${ord.customer.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.72rem',
                            color: '#059669',
                            background: 'rgba(5, 150, 105, 0.08)',
                            padding: '2px 7px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontWeight: 700,
                            flexShrink: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                          title="Buka Chat WhatsApp Pelanggan"
                        >
                          <Phone size={11} />
                          <span>{ord.customer.whatsapp}</span>
                        </a>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Total: </span>
                        <strong style={{ color: 'var(--accent-purple)', fontSize: '0.9rem' }}>
                          Rp {(ord.totalAmount || ord.total || 0).toLocaleString('id-ID')}
                        </strong>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.74rem', marginLeft: '4px' }}>
                          ({itemsCount} item)
                        </span>
                      </div>
                    </div>

                    {((ord.paymentProof || ord.paymentProofUrl) || hasFrame) && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px', paddingTop: '6px', borderTop: '1px dashed var(--border-subtle)' }}>
                        {(ord.paymentProof || ord.paymentProofUrl) && (
                          <span className="badge badge-purple" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                            🧾 Bukti Bayar QRIS
                          </span>
                        )}
                        {hasFrame && (
                          <span className="badge badge-cyan" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                            🖼️ Frame Foto Tersedia
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '8px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleOpenDetail(ord)}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        justifyContent: 'center',
                        height: '38px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        padding: '0 10px',
                        borderRadius: '8px',
                        gap: '6px'
                      }}
                    >
                      <Eye size={15} style={{ flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Panduan & Frame
                      </span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleDeleteOrder(ord)}
                      title="Hapus pesanan"
                      style={{
                        flexShrink: 0,
                        height: '38px',
                        padding: '0 14px',
                        color: '#E11D48',
                        borderColor: 'rgba(225, 29, 72, 0.3)',
                        background: 'rgba(225, 29, 72, 0.04)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        borderRadius: '8px'
                      }}
                    >
                      <Trash2 size={14} style={{ flexShrink: 0 }} />
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
                  {selectedOrder.customer?.whatsapp && selectedOrder.customer?.whatsapp !== '-' && (
                    <div style={{ marginTop: '4px' }}>
                      <a
                        href={`https://wa.me/${selectedOrder.customer.whatsapp.replace(/\D/g, '').replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.74rem',
                          color: '#059669',
                          fontWeight: 600,
                          textDecoration: 'underline'
                        }}
                      >
                        Buka Chat WhatsApp Pemesan ↗
                      </a>
                    </div>
                  )}
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
                  {(() => {
                    const isCash = (selectedOrder.paymentMethod || '').toLowerCase().includes('cash') || (selectedOrder.paymentMethod || '').toLowerCase().includes('tunai');
                    if (!isCash) {
                      return (
                        <div style={{ marginTop: '6px' }}>
                          <span className="badge badge-lime" style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px' }}>
                            Status: ✓ Lunas (QRIS)
                          </span>
                        </div>
                      );
                    }
                    return (
                      <>
                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            Status Bayar:
                          </span>
                          <select
                            value={selectedOrder.paymentStatus === 'paid' ? 'paid' : 'pending'}
                            onChange={(e) => handleUpdatePaymentStatus(selectedOrder.id, e.target.value)}
                            style={{
                              background: selectedOrder.paymentStatus === 'paid' ? '#ECFDF5' : '#FEF3C7',
                              color: selectedOrder.paymentStatus === 'paid' ? '#065F46' : '#92400E',
                              border: selectedOrder.paymentStatus === 'paid' ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                            title="Klik untuk mengubah status pembayaran cash"
                          >
                            <option value="paid">✓ Lunas</option>
                            <option value="pending">⏳ Menunggu Verifikasi</option>
                          </select>
                        </div>
                        {selectedOrder.paymentStatus !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'paid')}
                            className="btn btn-sm"
                            style={{
                              marginTop: '8px',
                              background: '#10B981',
                              color: '#FFFFFF',
                              border: '1px solid #059669',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              padding: '5px 12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              cursor: 'pointer'
                            }}
                            title="Ubah status pesanan ini menjadi Lunas"
                          >
                            <Check size={13} /> Tandai Lunas (Uang Tunai/Cash Diterima)
                          </button>
                        )}
                      </>
                    );
                  })()}
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                {(selectedOrder.items || []).map((it, idx) => {
                  const titleLower = (it.title || '').toLowerCase();
                  const isBundle = it.productType === 'bundling' ||
                    titleLower.includes('bundle') ||
                    titleLower.includes('couple') ||
                    titleLower.includes('bestie') ||
                    Boolean(it.bundleChoices) ||
                    Boolean(it.customDetails?.bundleChoices);

                  if (isBundle) {
                    const bChoices = it.bundleChoices || it.customDetails?.bundleChoices || {};
                    const isB2 = titleLower.includes('couple 2') || titleLower.includes('bestie 2') || titleLower.includes('2 bagcharm');
                    const isB3 = titleLower.includes('couple 3') || titleLower.includes('bestie 3') || (titleLower.includes('gelang') && titleLower.includes('bagcharm'));

                    // Sub-item 1
                    let sub1 = bChoices.item1 ? { ...bChoices.item1 } : null;
                    if (!sub1) {
                      if (isB2) {
                        sub1 = {
                          label: 'Bagcharm 1',
                          name: 'Bagcharm 1',
                          isBagCharm: true,
                          cordColorName: resolveCordName(it.cordColorName || it.cordColor || ''),
                          hardwareName: it.hardwareName || 'Standard Clasp',
                          customLetters: it.customLetters || '',
                          charms: it.charms || []
                        };
                      } else if (isB3) {
                        sub1 = {
                          label: 'Gelang',
                          name: 'Gelang Pilihan',
                          isBagCharm: false,
                          image: '/images/bracelet_pearl_star.jpg'
                        };
                      } else {
                        sub1 = {
                          label: 'Gelang 1',
                          name: 'Gelang 1',
                          isBagCharm: false,
                          image: it.image || '/images/cat_bracelets.png'
                        };
                      }
                    } else if (isB2) {
                      sub1.isBagCharm = true;
                    }

                    // Sub-item 2
                    let sub2 = bChoices.item2 ? { ...bChoices.item2 } : null;
                    if (!sub2) {
                      if (isB2) {
                        sub2 = {
                          label: 'Bagcharm 2',
                          name: 'Bagcharm 2',
                          isBagCharm: true,
                          cordColorName: resolveCordName(it.cordColorName || it.cordColor || ''),
                          hardwareName: it.hardwareName || 'Standard Clasp',
                          customLetters: it.customLetters || '',
                          charms: it.charms || []
                        };
                      } else if (isB3) {
                        sub2 = {
                          label: 'Custom Bagcharm',
                          name: 'Custom Bagcharm',
                          isBagCharm: true,
                          cordColorName: resolveCordName(it.cordColorName || it.cordColor || ''),
                          hardwareName: it.hardwareName || 'Standard Clasp',
                          customLetters: it.customLetters || '',
                          charms: it.charms || []
                        };
                      } else {
                        sub2 = {
                          label: 'Gelang 2',
                          name: 'Gelang 2',
                          isBagCharm: false,
                          image: it.image || '/images/cat_bracelets.png'
                        };
                      }
                    } else if (isB2 || isB3) {
                      sub2.isBagCharm = true;
                    }

                    const subItems = [sub1, sub2].filter(Boolean);

                    return (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '2px solid rgba(79, 70, 229, 0.25)',
                          borderRadius: 'var(--radius-md)',
                          padding: '18px'
                        }}
                      >
                        {/* Bundle Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '1.05rem', color: '#1E1B4B' }}>{it.title || 'Paket Bundling'}</strong>
                            <span className="badge badge-purple" style={{ background: '#4F46E5', color: '#FFFFFF' }}>PAKET BUNDLING</span>
                          </div>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4F46E5' }}>
                            Rp {Number(it.unitPrice || it.price || 0).toLocaleString('id-ID')}
                          </span>
                        </div>

                        {it.bundleDescription && (
                          <div style={{ fontSize: '0.82rem', color: '#4338CA', background: 'rgba(79, 70, 229, 0.08)', padding: '6px 10px', borderRadius: '4px', marginBottom: '14px', fontWeight: 600 }}>
                            {it.bundleDescription}
                          </div>
                        )}

                        {/* List of Sub-Items in Bundle */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
                          {subItems.map((sub, sIdx) => {
                            const subIsBagCharm = sub.isBagCharm ?? (
                              (sub.label || '').toLowerCase().includes('bagcharm') ||
                              (sub.name || '').toLowerCase().includes('bagcharm') ||
                              Boolean(sub.frameId) ||
                              Boolean(sub.framePhotos && sub.framePhotos.length > 0)
                            );

                            const overrideKey = `${selectedOrder.id}-${it.id || idx}-sub${sIdx + 1}`;
                            const chosenOverride = frameOverrides[overrideKey];
                            const subFrameConf = resolveFrameConfig(
                              chosenOverride ? { frameId: `frame-${chosenOverride}` } : sub
                            );
                            const subPhotos = getFramePhotosForItem(sub);
                            const dlSubKey = `${selectedOrder.id}-${it.id || idx}-sub${sIdx + 1}`;
                            const isSubDownloading = downloadingItemId === dlSubKey;

                            return (
                              <div
                                key={sIdx}
                                style={{
                                  background: '#FFFFFF',
                                  border: '1px solid var(--border-medium)',
                                  borderRadius: '8px',
                                  padding: '14px',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                  <strong style={{ fontSize: '0.96rem', color: '#4F46E5' }}>
                                    ✨ {sub.label || `Item ${sIdx + 1}`}: {sub.name || sub.title || 'Pilihan'}
                                  </strong>
                                  <span className="badge badge-lime" style={{ fontSize: '0.72rem' }}>
                                    {subIsBagCharm ? 'BAGCHARM' : 'GELANG'}
                                  </span>
                                </div>

                                {subIsBagCharm ? (
                                  <>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                      • Warna Tali: <strong>{resolveCordName(sub.cordColorName || sub.cordColor) || '-'}</strong> | Clasp: <strong>{sub.hardwareName || 'Standard Clasp'}</strong>
                                    </div>
                                    {(() => {
                                      const subAcc = getAccentDisplay(sub);
                                      return (
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <span>• Warna Aksen (Bintang & Lonceng):</span>
                                          <span
                                            style={{
                                              width: '11px',
                                              height: '11px',
                                              borderRadius: '50%',
                                              background: subAcc.hex,
                                              border: `1.5px solid ${subAcc.border}`,
                                              display: 'inline-block',
                                              flexShrink: 0
                                            }}
                                          />
                                          <strong style={{ color: 'var(--text-primary)' }}>{subAcc.name}</strong>
                                        </div>
                                      );
                                    })()}

                                    {/* Custom Letters */}
                                    {sub.customLetters && (
                                      <div style={{ margin: '6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Manik Huruf:</span>
                                        <div style={{ display: 'flex', gap: '3px' }}>
                                          {sub.customLetters.split('').map((char, cI) => (
                                            <span
                                              key={cI}
                                              style={{
                                                padding: '2px 7px',
                                                background: '#21201D',
                                                color: '#FFFFFF',
                                                fontWeight: 800,
                                                borderRadius: '3px',
                                                fontSize: '0.78rem'
                                              }}
                                            >
                                              {char}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Charms */}
                                    {sub.charms && sub.charms.length > 0 && (
                                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', margin: '6px 0' }}>
                                        {sub.charms.map((ch, cI) => (
                                          <span key={cI} className="crafter-component-tag" style={{ fontSize: '0.74rem' }}>
                                            {getCharmIcon(ch)} {ch.name || ch}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {/* Photostrip Box for this sub-bagcharm */}
                                    <div className="admin-photostrip-box" style={{ marginTop: '10px' }}>
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
                                        <img
                                          src={subFrameConf.baseImage}
                                          alt={subFrameConf.name}
                                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                        />

                                        {subFrameConf.slots.map((s, slotIdx) => {
                                          const pSrc = subPhotos[slotIdx];
                                          return (
                                            <div
                                              key={slotIdx}
                                              style={{
                                                position: 'absolute',
                                                top: s.top,
                                                left: s.left,
                                                width: s.width,
                                                height: s.height,
                                                borderRadius: s.borderRadius || '0px',
                                                overflow: 'hidden',
                                                background: pSrc ? '#000000' : 'rgba(226, 232, 240, 0.75)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                              }}
                                            >
                                              {pSrc ? (
                                                <img
                                                  src={pSrc}
                                                  alt={`Slot ${slotIdx + 1}`}
                                                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                />
                                              ) : (
                                                <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 600 }}>Foto {slotIdx + 1}</span>
                                              )}
                                            </div>
                                          );
                                        })}

                                        {subFrameConf.overlayImage && (
                                          <img
                                            src={subFrameConf.overlayImage}
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
                                      <div style={{ flex: 1, minWidth: '220px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <ImageIcon size={16} color="var(--accent-purple)" />
                                            <strong style={{ fontSize: '0.98rem' }}>{subFrameConf.name}</strong>
                                          </div>

                                          {/* Frame Switcher Dropdown */}
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Ganti Frame:</span>
                                            <select
                                              value={subFrameConf.num}
                                              onChange={(e) => handleFrameChange(overrideKey, e.target.value)}
                                              className="form-input"
                                              style={{ padding: '2px 6px', fontSize: '0.76rem', height: '26px', width: 'auto', borderRadius: '4px' }}
                                            >
                                              {Array.from({ length: 30 }, (_, i) => i + 1).map((fNum) => (
                                                <option key={fNum} value={String(fNum)}>
                                                  Frame {fNum}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                        </div>

                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                          Terdiri dari {subFrameConf.slots.length} foto photostrip sesuai template.
                                        </div>

                                        {/* Photos status notice */}
                                        <div style={{ marginTop: '6px' }}>
                                          {subPhotos.length > 0 ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                              <Check size={12} />
                                              {subPhotos.length} Foto customer terpasang
                                            </span>
                                          ) : (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', color: '#B45309', background: '#FEF3C7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                              <AlertCircle size={12} />
                                              Foto dikirim via WhatsApp ({selectedOrder.customer?.whatsapp || '-'})
                                            </span>
                                          )}
                                        </div>

                                        <div style={{ marginTop: '10px' }}>
                                          <button
                                            type="button"
                                            className="btn btn-sm"
                                            disabled={isSubDownloading}
                                            onClick={() => handleDownloadFrame(sub, selectedOrder, sub.label || `Bagcharm-${sIdx + 1}`, subFrameConf, subPhotos)}
                                            style={{
                                              background: '#4F46E5',
                                              color: '#FFFFFF',
                                              borderColor: '#4338CA',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '6px',
                                              fontWeight: 700,
                                              padding: '6px 14px',
                                              fontSize: '0.8rem'
                                            }}
                                          >
                                            <Download size={13} />
                                            <span>{isSubDownloading ? 'Memproses PNG...' : `Download Frame ${sub.label || `Bagcharm ${sIdx + 1}`} (PNG)`}</span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  /* Gelang sub-item */
                                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)', flexShrink: 0, background: '#FFFFFF' }}>
                                      <img
                                        src={getGelangImage(sub, collections)}
                                        alt={sub.name || 'Gelang'}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = '/images/cat_bracelets.png'; }}
                                      />
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                      <div>Varian / Model: <strong>{sub.color || sub.variant || sub.name || 'Standar Sesuai Foto'}</strong></div>
                                      <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginTop: '2px' }}>
                                        ✓ Dirakit langsung sesuai manik & elastis gelang (tanpa cetak frame foto).
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  // Non-Bundle (Single Item)
                  const itemIsGelang = isGelangItem(it);
                  const isBagCharm = !itemIsGelang && (it.productType === 'bag_charm' || titleLower.includes('bag charm') || titleLower.includes('bagcharm') || Boolean(it.frameId));
                  const singleKey = `${selectedOrder.id}-${it.id || idx}-single`;
                  const singleOverride = frameOverrides[singleKey];
                  const frameConf = resolveFrameConfig(
                    singleOverride ? { ...it, frameId: `frame-${singleOverride}` } : it
                  );
                  const photos = getFramePhotosForItem(it);
                  const dlKey = `${selectedOrder.id}-${it.id || idx}`;
                  const isDownloading = downloadingItemId === dlKey;

                  if (itemIsGelang) {
                    const gelangImg = getGelangImage(it, collections);
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <strong style={{ fontSize: '1rem', color: '#1E1B4B' }}>{it.title || 'Gelang Kustom'}</strong>
                          <span className="badge badge-purple" style={{ background: '#059669', color: '#FFFFFF' }}>GELANG / BRACELET</span>
                        </div>

                        {/* Gelang Image & Info */}
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                          <div
                            style={{
                              width: '100px',
                              height: '100px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: '1.5px solid var(--border-medium)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                              flexShrink: 0,
                              background: '#FFFFFF'
                            }}
                          >
                            <img
                              src={gelangImg}
                              alt={it.title || 'Gelang'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              onError={(e) => {
                                e.target.src = '/images/cat_bracelets.png';
                              }}
                            />
                          </div>

                          <div style={{ flex: 1, minWidth: '220px' }}>
                            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                              • Model / Varian: <strong style={{ color: 'var(--text-primary)' }}>{it.variant || it.color || it.baseName || it.title}</strong>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                              • Tipe: Gelang Manik / Adjustable Bracelet
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#059669', background: 'rgba(5, 150, 105, 0.08)', padding: '6px 10px', borderRadius: '6px', fontWeight: 600 }}>
                              ✓ Dirakit langsung sesuai manik & elastis gelang (tanpa cetak frame foto).
                            </div>

                            {/* Custom Letters if any */}
                            {it.customLetters && (
                              <div style={{ margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Manik Huruf:</span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  {it.customLetters.split('').map((char, cI) => (
                                    <span
                                      key={cI}
                                      style={{
                                        padding: '2px 8px',
                                        background: '#21201D',
                                        color: '#FFFFFF',
                                        fontWeight: 800,
                                        borderRadius: '4px',
                                        fontSize: '0.82rem'
                                      }}
                                    >
                                      {char}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Charms if any */}
                            {it.charms && it.charms.length > 0 && (
                              <div style={{ marginTop: '8px' }}>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Charms / Pendants:</div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                                  {it.charms.map((ch, cI) => (
                                    <span key={cI} className="crafter-component-tag">
                                      {getCharmIcon(ch)} {ch.name || ch}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

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
                        • Base Model: <strong>{it.baseName || 'Custom'}</strong> (Warna Tali: {resolveCordName(it.cordColorName || it.cordColor) || '-'})
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        • Hardware Clasp: <strong>{it.hardwareName || 'Standard Clasp'}</strong>
                      </div>
                      {(() => {
                        const itAcc = getAccentDisplay(it);
                        return (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>• Warna Aksen (Bintang Akrilik & Lonceng):</span>
                            <span
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: itAcc.hex,
                                border: `1.5px solid ${itAcc.border}`,
                                display: 'inline-block',
                                flexShrink: 0
                              }}
                            />
                            <strong style={{ color: 'var(--text-primary)' }}>{itAcc.name}</strong>
                          </div>
                        );
                      })()}

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
                                {getCharmIcon(ch)} {ch.name || ch}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tidak ada charm tambahan</span>
                        )}
                      </div>

                      {/* Photostrip Frame Download Box */}
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
                            <img
                              src={frameConf.baseImage}
                              alt={frameConf.name}
                              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            />

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
                                    background: pSrc ? '#000000' : 'rgba(226, 232, 240, 0.75)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  {pSrc ? (
                                    <img
                                      src={pSrc}
                                      alt={`Slot ${sIdx + 1}`}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    />
                                  ) : (
                                    <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 600 }}>Foto {sIdx + 1}</span>
                                  )}
                                </div>
                              );
                            })}

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

                          {/* Right: Info, Switcher, and Download Button */}
                          <div style={{ flex: 1, minWidth: '240px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <ImageIcon size={16} color="var(--accent-purple)" />
                                <strong style={{ fontSize: '0.98rem' }}>{frameConf.name}</strong>
                              </div>

                              {/* Frame Switcher Dropdown */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Ganti Frame:</span>
                                <select
                                  value={frameConf.num}
                                  onChange={(e) => handleFrameChange(singleKey, e.target.value)}
                                  className="form-input"
                                  style={{ padding: '2px 6px', fontSize: '0.76rem', height: '26px', width: 'auto', borderRadius: '4px' }}
                                >
                                  {Array.from({ length: 30 }, (_, i) => i + 1).map((fNum) => (
                                    <option key={fNum} value={String(fNum)}>
                                      Frame {fNum}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              Terdiri dari {frameConf.slots.length} foto photostrip sesuai template.
                            </div>

                            {/* Photos status notice */}
                            <div style={{ marginTop: '8px' }}>
                              {photos.length > 0 ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', color: '#059669', background: '#ECFDF5', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                  <Check size={12} />
                                  {photos.length} Foto customer terpasang
                                </span>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', color: '#B45309', background: '#FEF3C7', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                  <AlertCircle size={12} />
                                  Foto belum diunggah di web / dikirim via WhatsApp ({selectedOrder.customer?.whatsapp || '-'})
                                </span>
                              )}
                            </div>

                            {/* Download Action */}
                            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn btn-sm"
                                disabled={isDownloading}
                                onClick={() => handleDownloadFrame(it, selectedOrder, frameConf.name, frameConf, photos)}
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

      {/* Modern Aesthetic Delete Order Confirmation Modal */}
      {orderToDelete && (
        <div
          className="modal-backdrop"
          onClick={() => !isDeleting && setOrderToDelete(null)}
          style={{
            zIndex: 1200,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '430px',
              width: '100%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px',
              padding: '28px 24px',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.35)',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => !isDeleting && setOrderToDelete(null)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Tutup"
            >
              <X size={18} />
            </button>

            {/* Glowing Danger Icon */}
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#EF4444',
                border: '2px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)'
              }}
            >
              <Trash2 size={26} strokeWidth={2.2} />
            </div>

            <h4 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Hapus Pesanan?
            </h4>

            {/* Order Target Info Highlight */}
            <div
              style={{
                background: 'var(--bg-primary)',
                border: '1px dashed var(--border-medium)',
                borderRadius: '12px',
                padding: '12px 14px',
                margin: '14px 0 16px',
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-purple)', fontFamily: 'var(--font-display)' }}>
                {orderToDelete.id}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Pemesan: <strong style={{ color: 'var(--text-primary)' }}>{orderToDelete.customer?.name || 'Pelanggan'}</strong>
                {orderToDelete.customer?.whatsapp ? ` (${orderToDelete.customer.whatsapp})` : ''}
              </span>
            </div>

            <p style={{ margin: '0 0 24px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Data pesanan ini akan dihapus secara permanen dari database dan antrean perakitan. Tindakan ini tidak dapat dibatalkan.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setOrderToDelete(null)}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  borderRadius: '10px'
                }}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn"
                onClick={confirmDeleteOrder}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  background: '#EF4444',
                  borderColor: '#DC2626',
                  color: '#FFFFFF',
                  padding: '10px 16px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                <Trash2 size={15} />
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
