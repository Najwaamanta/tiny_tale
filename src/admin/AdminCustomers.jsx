import React, { useState } from 'react';
import { Users, Search, Download, ExternalLink, Calendar, ShoppingBag, MapPin, Phone, Award, Eye, Clock, CheckCircle, Package, Plus, Trash2, X } from 'lucide-react';
import { aggregateCustomersFromOrders, exportCustomersToExcel } from '../utils/excelExport';
import { downloadPhotostripFrame, resolveFrameConfig, getFramePhotosForItem } from '../utils/frameExport';
import { getAccentDisplay, isBagCharmItem, isGelangItem, getGelangImage } from '../utils/accentHelper';
import AdminAddCustomerHistoryModal from './AdminAddCustomerHistoryModal';

export default function AdminCustomers({ orders = [], collections = [], onAddOrder, onDeleteOrder, onDeleteCustomerOrders }) {
  const [localOrders, setLocalOrders] = useState(orders);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'spent', 'count'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [downloadingItemId, setDownloadingItemId] = useState(null);
  const [isAddHistoryOpen, setIsAddHistoryOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  const handleDeleteCustomer = (cust) => {
    if (!cust) return;
    setDeleteTarget({ type: 'customer', data: cust });
  };

  const handleDeleteSingleOrder = (ord) => {
    if (!ord) return;
    setDeleteTarget({ type: 'order', data: ord });
  };

  const confirmDeleteAction = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'customer') {
        const cust = deleteTarget.data;
        const orderIds = (cust.orders || []).map((o) => o.id);
        setLocalOrders((prev) => prev.filter((o) => !orderIds.includes(o.id)));
        if (selectedCustomer && selectedCustomer.name === cust.name) {
          setSelectedCustomer(null);
        }
        if (onDeleteCustomerOrders) {
          await onDeleteCustomerOrders(orderIds);
        } else if (onDeleteOrder) {
          await Promise.all(orderIds.map((id) => onDeleteOrder(id)));
        }
      } else if (deleteTarget.type === 'order') {
        const ord = deleteTarget.data;
        setLocalOrders((prev) => prev.filter((o) => o.id !== ord.id));
        if (selectedCustomer) {
          const remaining = (selectedCustomer.orders || []).filter((o) => o.id !== ord.id);
          if (remaining.length === 0) {
            setSelectedCustomer(null);
          } else {
            setSelectedCustomer({
              ...selectedCustomer,
              orders: remaining,
              ordersCount: remaining.length,
              totalSpent: remaining.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0)
            });
          }
        }
        if (onDeleteOrder) {
          await onDeleteOrder(ord.id);
        }
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Aggregate customers from localOrders
  const customers = aggregateCustomersFromOrders(localOrders);

  // Filter by search
  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.whatsapp.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  // Sort
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortBy === 'spent') return b.totalSpent - a.totalSpent;
    if (sortBy === 'count') return b.ordersCount - a.ordersCount;
    return new Date(b.lastOrderDate) - new Date(a.lastOrderDate);
  });

  // Metrics
  const totalCustomers = customers.length;
  const repeatCustomers = customers.filter((c) => c.ordersCount > 1).length;
  const totalLTV = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgLTV = totalCustomers > 0 ? Math.round(totalLTV / totalCustomers) : 0;

  const handleExportExcel = () => {
    exportCustomersToExcel(sortedCustomers);
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
      {/* Sub-metrics */}
      <div className="admin-metrics-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span>DATABASE PELANGGAN</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent-purple)' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="metric-value">{totalCustomers} Customer</div>
          <div className="metric-sub">Tercatat di riwayat order Tiny Tale</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>PELANGGAN LOYAL / REPEAT</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(5, 150, 105, 0.1)', color: 'var(--accent-lime)' }}>
              <Award size={18} />
            </div>
          </div>
          <div className="metric-value">{repeatCustomers} Customer</div>
          <div className="metric-sub">
            {totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0}% belanja lebih dari 1 kali
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>RATA-RATA NILAI BELANJA (LTV)</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(2, 132, 199, 0.1)', color: 'var(--accent-cyan)' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="metric-value">Rp {avgLTV.toLocaleString('id-ID')}</div>
          <div className="metric-sub">Total belanja per akun pembeli</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-table-card">
        {/* Table Top Controls */}
        <div className="admin-table-head">
          <div>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="var(--accent-purple)" />
              <span>Riwayat & Database Pelanggan</span>
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Daftar seluruh pembeli yang pernah bertransaksi kustom di toko Anda
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Cari nama, WhatsApp, kota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 14px 8px 36px',
                  height: '40px',
                  fontSize: '0.88rem',
                  lineHeight: 'normal',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Sort */}
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                height: '40px',
                padding: '8px 34px 8px 14px',
                fontSize: '0.88rem',
                lineHeight: 'normal',
                width: 'auto',
                boxSizing: 'border-box'
              }}
            >
              <option value="recent">Transaksi Terbaru</option>
              <option value="spent">Total Belanja Tertinggi</option>
              <option value="count">Paling Sering Order</option>
            </select>

            {/* Add Purchase History Button */}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddHistoryOpen(true)}
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
              title="Catat Riwayat Pembelian dari Customer Offline / WhatsApp / Bazaar"
            >
              <Plus size={16} />
              <span>Tambah Riwayat Pembelian</span>
            </button>

            {/* Export Excel Button */}
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
              title="Download Data Pembeli ke Excel (.xlsx)"
            >
              <Download size={15} />
              <span>Download Excel Pelanggan</span>
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="admin-desktop-table table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pelanggan</th>
                <th>Kontak WhatsApp</th>
                <th>Kota & Alamat</th>
                <th>Frekuensi Order</th>
                <th>Total Belanja (LTV)</th>
                <th>Pesanan Terakhir</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Users size={36} color="var(--border-medium)" />
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        Belum Ada Riwayat Pembeli
                      </div>
                      <div style={{ fontSize: '0.82rem', maxWidth: '380px' }}>
                        Database pembeli akan otomatis terisi dan diperbarui dari setiap pesanan yang masuk melalui website.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedCustomers.map((cust) => {
                  const cleanWA = (cust.whatsapp || '').replace(/[^0-9]/g, '');
                  const waUrl = cleanWA.startsWith('0')
                    ? `https://wa.me/62${cleanWA.slice(1)}`
                    : `https://wa.me/${cleanWA}`;

                  return (
                    <tr key={cust.key}>
                      {/* Name & Initials */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: 'var(--pastel-lavender)',
                              color: 'var(--accent-purple)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.9rem',
                              flexShrink: 0
                            }}
                          >
                            {cust.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.95rem' }}>{cust.name}</strong>
                            {cust.ordersCount > 1 && (
                              <div style={{ marginTop: '2px' }}>
                                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                                  ⭐ VIP ({cust.ordersCount}x Order)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* WhatsApp with click to chat */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} color="#059669" />
                          <span style={{ fontWeight: 600 }}>{cust.whatsapp}</span>
                          {cleanWA && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline btn-icon"
                              style={{ width: '26px', height: '26px', padding: 0 }}
                              title="Chat via WhatsApp"
                            >
                              <ExternalLink size={12} color="#059669" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Address */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', maxWidth: '240px' }}>
                          <MapPin size={14} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <div>
                            <strong>{cust.city}</strong>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'normal' }}>
                              {cust.address}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Orders Count */}
                      <td>
                        <span className="badge badge-cyan" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                          {cust.ordersCount} Transaksi
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td>
                        <strong style={{ fontSize: '1rem', color: 'var(--accent-lime)' }}>
                          Rp {cust.totalSpent.toLocaleString('id-ID')}
                        </strong>
                      </td>

                      {/* Last Order Date */}
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} />
                          <span>
                            {new Date(cust.lastOrderDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedCustomer(cust)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 10px' }}
                            title="Lihat riwayat pembelian"
                          >
                            <Eye size={14} />
                            <span>Riwayat ({cust.ordersCount})</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => handleDeleteCustomer(cust)}
                            title="Hapus riwayat pembeli ini"
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
          {sortedCustomers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <Users size={36} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 600 }}>Belum ada data pelanggan</div>
            </div>
          ) : (
            sortedCustomers.map((cust, idx) => (
              <div key={idx} className="admin-mobile-card-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: '0.98rem' }}>{cust.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {cust.whatsapp} • {cust.city}
                    </div>
                  </div>
                  <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                    {cust.ordersCount}x Order
                  </span>
                </div>

                <div className="admin-mobile-card-meta">
                  <div><strong>Total Belanja:</strong> <span style={{ color: '#059669', fontWeight: 800 }}>Rp {cust.totalSpent.toLocaleString('id-ID')}</span></div>
                  <div style={{ marginTop: '2px' }}><strong>Alamat:</strong> {cust.address}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', width: '100%', boxSizing: 'border-box' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedCustomer(cust)}
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
                      Riwayat Belanja ({cust.ordersCount})
                    </span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => handleDeleteCustomer(cust)}
                    title="Hapus riwayat pembeli"
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
            ))
          )}
        </div>
      </div>

      {/* Customer Order History Modal / Drawer */}
      {selectedCustomer && (
        <div className="admin-modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '800px', maxHeight: '92vh' }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#FAF8F4'
              }}
            >
              <div>
                <span className="badge badge-purple" style={{ marginBottom: '4px' }}>
                  Profil & Riwayat Pembeli
                </span>
                <h3 style={{ fontSize: '1.25rem', marginTop: '2px' }}>{selectedCustomer.name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  WhatsApp: {selectedCustomer.whatsapp} • {selectedCustomer.city} • Total Belanja: Rp {selectedCustomer.totalSpent.toLocaleString('id-ID')}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleDeleteCustomer(selectedCustomer)}
                  title="Hapus seluruh riwayat pembeli ini dari database"
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
                  <span>Hapus Riwayat Pembeli</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-icon"
                  style={{ width: '34px', height: '34px' }}
                  onClick={() => setSelectedCustomer(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
                  Daftar Pesanan ({selectedCustomer.orders.length})
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Urutan transaksi dari terbaru
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedCustomer.orders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      padding: '18px'
                    }}
                  >
                    {/* Top order summary */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        borderBottom: '1px solid var(--border-subtle)',
                        paddingBottom: '12px',
                        marginBottom: '14px',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--accent-purple)' }}>
                          {ord.id}
                        </strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={13} />
                          <span>
                            {new Date(ord.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          Rp {(ord.totalAmount ?? ord.total ?? 0).toLocaleString('id-ID')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge ${ord.paymentStatus === 'paid' ? 'badge-lime' : 'badge-amber'}`}>
                            {ord.paymentStatus === 'paid' ? 'Lunas' : 'Menunggu Bayar'}
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => handleDeleteSingleOrder(ord)}
                            title="Hapus pesanan ini dari riwayat"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              fontSize: '0.72rem',
                              color: '#E11D48',
                              borderColor: 'rgba(225, 29, 72, 0.3)'
                            }}
                          >
                            <Trash2 size={12} />
                            <span>Hapus Pesanan</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Order Items Breakdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(ord.items || []).map((it, idx) => {
                        const isBagCharm = it.productType === 'bag_charm' || it.title?.toLowerCase().includes('bag charm') || it.title?.toLowerCase().includes('bagcharm');
                        const frameConf = resolveFrameConfig(it);
                        const photos = getFramePhotosForItem(it);
                        const dlKey = `${ord.id}-${it.id || idx}`;
                        const isDownloading = downloadingItemId === dlKey;

                        return (
                          <div
                            key={idx}
                            style={{
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '8px',
                              padding: '12px 14px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '12px'
                            }}
                          >
                            <div style={{ flex: 1, minWidth: '220px' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                {it.title} {it.quantity > 1 && `(x${it.quantity})`}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                {isGelangItem(it) ? (
                                  <span>• Varian: <strong>{it.variant || it.color || it.baseName || 'Standar Sesuai Foto'}</strong></span>
                                ) : (
                                  <span>• Model: <strong>{it.baseName || 'Custom'}</strong></span>
                                )}
                                {it.customLetters && <span>• Huruf: <strong>[{it.customLetters}]</strong></span>}
                                {isBagCharmItem(it) && (() => {
                                  const itAcc = getAccentDisplay(it);
                                  return (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      • Aksen:
                                      <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: itAcc.hex, border: `1px solid ${itAcc.border}`, display: 'inline-block' }} />
                                      <strong>{itAcc.name}</strong>
                                    </span>
                                  );
                                })()}
                              </div>

                              {/* Charm info */}
                              {it.charms && it.charms.length > 0 && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                  Charms: {it.charms.map((c) => c.name || c).join(', ')}
                                </div>
                              )}
                            </div>

                            {/* Thumbnail for Gelang */}
                            {isGelangItem(it) && (
                              <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)', flexShrink: 0, background: '#FFFFFF' }}>
                                <img
                                  src={getGelangImage(it, collections)}
                                  alt={it.title}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => { e.target.src = '/images/cat_bracelets.png'; }}
                                />
                              </div>
                            )}

                            {/* Download Frame button for Bag Charms with photo */}
                            {isBagCharm && (
                              <button
                                type="button"
                                className="btn btn-sm"
                                disabled={isDownloading}
                                onClick={() => handleDownloadFrame(it, ord)}
                                style={{
                                  background: '#4F46E5',
                                  color: '#FFFFFF',
                                  borderColor: '#4338CA',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontWeight: 700,
                                  fontSize: '0.8rem'
                                }}
                                title="Download frame photostrip lengkap dengan foto yang diupload pembeli"
                              >
                                <Download size={14} />
                                <span>{isDownloading ? 'Menyiapkan...' : 'Download Frame Foto'}</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add Customer Purchase History Modal */}
      {isAddHistoryOpen && (
        <AdminAddCustomerHistoryModal
          isOpen={isAddHistoryOpen}
          onClose={() => setIsAddHistoryOpen(false)}
          onSave={(orderData) => {
            if (onAddOrder) {
              onAddOrder(orderData);
            }
          }}
          orders={orders}
          collections={collections}
        />
      )}

      {/* Modern Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="modal-backdrop"
          onClick={() => !isDeleting && setDeleteTarget(null)}
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
            <button
              type="button"
              onClick={() => !isDeleting && setDeleteTarget(null)}
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
              {deleteTarget.type === 'customer' ? 'Hapus Riwayat Pelanggan?' : 'Hapus Pesanan?'}
            </h4>

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
              {deleteTarget.type === 'customer' ? (
                <>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
                    {deleteTarget.data.name}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Total: {deleteTarget.data.ordersCount || deleteTarget.data.orders?.length || 0} transaksi pesanan
                  </span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-purple)', fontFamily: 'var(--font-display)' }}>
                    {deleteTarget.data.id}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Rp {(deleteTarget.data.totalAmount || deleteTarget.data.total || 0).toLocaleString('id-ID')}
                  </span>
                </>
              )}
            </div>

            <p style={{ margin: '0 0 24px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {deleteTarget.type === 'customer'
                ? 'Semua data riwayat pembelian untuk pelanggan ini akan dihapus permanen dari database.'
                : 'Data pesanan ini akan dihapus dari riwayat transaksi pelanggan secara permanen.'}
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setDeleteTarget(null)}
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
                onClick={confirmDeleteAction}
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
