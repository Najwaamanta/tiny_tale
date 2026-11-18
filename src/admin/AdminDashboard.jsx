import React, { useState } from 'react';
import { Package, Layers, BarChart2, LogOut, Store, ShieldCheck, AlertTriangle, Hammer, DollarSign, Users, Download, FileSpreadsheet, Sparkles, RefreshCw, Database } from 'lucide-react';
import AdminOrders from './AdminOrders';
import AdminInventory from './AdminInventory';
import AdminReports from './AdminReports';
import AdminCustomers from './AdminCustomers';
import AdminCollections from './AdminCollections';
import { exportCompleteBusinessReport, aggregateCustomersFromOrders } from '../utils/excelExport';

export default function AdminDashboard({
  orders = [],
  charms = [],
  products = [],
  collections = [],
  isLiveDbConnected = true,
  onManualSync,
  onUpdateOrderStatus,
  onAddOrder,
  onDeleteOrder,
  onDeleteCustomerOrders,
  onAddCharm,
  onUpdateCharm,
  onDeleteCharm,
  onRestockCharm,
  onAddCollection,
  onUpdateCollection,
  onDeleteCollection,
  onResetDemoData,
  onLogout,
  onBackToStore
}) {
  const [activeAdminTab, setActiveAdminTab] = useState('orders');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(false);

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
  const pendingCraftingCount = orders.filter((o) => (o.craftingStatus || o.orderStatus) === 'in_crafting' || (o.craftingStatus || o.orderStatus) === 'paid_verified' || o.orderStatus === 'processing').length;
  const lowStockCount = charms.filter((c) => (c.stock || 0) <= 20).length;
  const customers = aggregateCustomersFromOrders(orders);
  const customersCount = customers.length;

  const handleDownloadAllExcel = () => {
    exportCompleteBusinessReport(orders);
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    if (onManualSync) {
      await onManualSync();
    }
    setSyncFeedback(true);
    setTimeout(() => {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(false), 2000);
    }, 400);
  };

  return (
    <div className="admin-layout">
      {/* Admin Top Header */}
      <header className="admin-header">
        <div className="admin-header-brand">
          <div className="admin-header-tag">
            ADMIN PANEL
          </div>
          <div className="admin-header-info">
            <div className="admin-header-title-wrap">
              <h2 className="admin-header-title">TINY TALE MANAGEMENT</h2>
              <div
                className="admin-header-status-badge"
                style={{
                  background: isLiveDbConnected ? '#ECFDF5' : '#FEF3C7',
                  border: `1px solid ${isLiveDbConnected ? '#A7F3D0' : '#FDE68A'}`,
                  color: isLiveDbConnected ? '#065F46' : '#92400E'
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: isLiveDbConnected ? '#10B981' : '#F59E0B',
                    boxShadow: isLiveDbConnected ? '0 0 6px #10B981' : 'none'
                  }}
                />
                <span>{isLiveDbConnected ? 'MySQL Live Realtime' : 'Database Offline'}</span>
              </div>
            </div>
            <div className="admin-header-user">
              Logged as: <strong>admin@atelier.id</strong> (Head Artisan & Owner)
            </div>
          </div>
        </div>

        <div className="admin-header-actions">
          {/* Realtime Manual Sync Button */}
          <button
            type="button"
            className="btn btn-outline btn-sm admin-action-btn"
            onClick={handleTriggerSync}
            disabled={isSyncing}
            style={{
              color: syncFeedback ? '#059669' : 'var(--text-primary)',
              borderColor: syncFeedback ? '#059669' : 'var(--border-medium)'
            }}
            title="Tarik data transaksi & inventaris realtime langsung dari database MySQL"
          >
            <RefreshCw size={14} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{syncFeedback ? 'Tersinkron!' : isSyncing ? 'Sinkron...' : 'Sinkronkan'}</span>
          </button>

          {/* Global Complete Excel Export */}
          <button
            type="button"
            className="btn btn-sm admin-action-btn"
            onClick={handleDownloadAllExcel}
            style={{
              background: '#059669',
              color: '#FFFFFF',
              borderColor: '#047857'
            }}
            title="Download Laporan Lengkap (.xlsx)"
          >
            <FileSpreadsheet size={15} />
            <span>Unduh Excel</span>
          </button>

          <button
            type="button"
            className="btn btn-outline btn-sm admin-action-btn"
            onClick={onBackToStore}
            title="Lihat Tampilan Toko Customer"
          >
            <Store size={15} />
            <span>Lihat Toko</span>
          </button>

          <button
            type="button"
            className="btn btn-outline btn-sm admin-action-btn"
            style={{ color: 'var(--accent-rose)', borderColor: 'rgba(225, 29, 72, 0.3)' }}
            onClick={onLogout}
            title="Logout dari Admin"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <div className="admin-container">
        {/* Key Metrics Bar */}
        <div className="admin-metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <span>TOTAL PENDAPATAN</span>
              <div className="metric-icon-wrap" style={{ background: 'rgba(2, 132, 199, 0.1)', color: 'var(--accent-cyan)' }}>
                <DollarSign size={18} />
              </div>
            </div>
            <div className="metric-value">Rp {totalRevenue.toLocaleString('id-ID')}</div>
            <div className="metric-sub">{orders.length} transaksi pesanan masuk</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span>PERLU DIRAKIT</span>
              <div className="metric-icon-wrap" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent-purple)' }}>
                <Hammer size={18} />
              </div>
            </div>
            <div className="metric-value">{pendingCraftingCount} Pesanan</div>
            <div className="metric-sub">Antrean di meja kerja pengerajin</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span>RIWAYAT PEMBELI</span>
              <div className="metric-icon-wrap" style={{ background: 'rgba(5, 150, 105, 0.1)', color: 'var(--accent-lime)' }}>
                <Users size={18} />
              </div>
            </div>
            <div className="metric-value">{customersCount} Customer</div>
            <div className="metric-sub">Total database pembeli terdata</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span>PERINGATAN STOK</span>
              <div className="metric-icon-wrap" style={{ background: 'rgba(225, 29, 72, 0.1)', color: 'var(--accent-rose)' }}>
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="metric-value">{lowStockCount} Komponen</div>
            <div className="metric-sub">Stok charm & beads &lt; 20 unit</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-nav-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeAdminTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('orders')}
          >
            <Package size={16} />
            <span className="desktop-tab-label">Pesanan ({orders.length})</span>
            <span className="mobile-tab-label">Pesanan ({orders.length})</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeAdminTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('customers')}
          >
            <Users size={16} />
            <span className="desktop-tab-label">Riwayat Pembeli ({customersCount})</span>
            <span className="mobile-tab-label">Pembeli ({customersCount})</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeAdminTab === 'collections' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('collections')}
          >
            <Sparkles size={16} />
            <span className="desktop-tab-label">Koleksi Produk ({collections.length})</span>
            <span className="mobile-tab-label">Koleksi ({collections.length})</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeAdminTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('inventory')}
          >
            <Layers size={16} />
            <span className="desktop-tab-label">Komponen & Stok Charms ({charms.length})</span>
            <span className="mobile-tab-label">Komponen ({charms.length})</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeAdminTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('reports')}
          >
            <BarChart2 size={16} />
            <span className="desktop-tab-label">Laporan & Analitik</span>
            <span className="mobile-tab-label">Laporan</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div style={{ marginTop: '24px' }}>
          {activeAdminTab === 'orders' && (
            <AdminOrders
              orders={orders}
              collections={collections}
              onUpdateOrderStatus={onUpdateOrderStatus}
              onAddOrder={onAddOrder}
              onDeleteOrder={onDeleteOrder}
            />
          )}

          {activeAdminTab === 'customers' && (
            <AdminCustomers
              orders={orders}
              collections={collections}
              onAddOrder={onAddOrder}
              onDeleteOrder={onDeleteOrder}
              onDeleteCustomerOrders={onDeleteCustomerOrders}
            />
          )}

          {activeAdminTab === 'collections' && (
            <AdminCollections
              collections={collections}
              onAddCollection={onAddCollection}
              onUpdateCollection={onUpdateCollection}
              onDeleteCollection={onDeleteCollection}
            />
          )}

          {activeAdminTab === 'inventory' && (
            <AdminInventory
              charms={charms}
              onAddCharm={onAddCharm}
              onUpdateCharm={onUpdateCharm}
              onDeleteCharm={onDeleteCharm}
              onRestockCharm={onRestockCharm}
            />
          )}

          {activeAdminTab === 'reports' && (
            <AdminReports
              orders={orders}
              charms={charms}
              onResetDemoData={onResetDemoData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
