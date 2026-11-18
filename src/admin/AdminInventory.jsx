import React, { useState } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, Check, RefreshCw, Layers } from 'lucide-react';

export default function AdminInventory({
  charms = [],
  onAddCharm,
  onUpdateCharm,
  onDeleteCharm,
  onRestockCharm
}) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Charm form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('metal');
  const [price, setPrice] = useState(12000);
  const [stock, setStock] = useState(25);
  const [icon, setIcon] = useState('★');
  const [desc, setDesc] = useState('');

  // Edit Charm inline or modal state
  const [editingCharm, setEditingCharm] = useState(null);

  const filteredCharms = charms.filter((c) => {
    if (filterCategory === 'low_stock') return (c.stock || 0) <= 20;
    if (filterCategory === 'all') return true;
    return c.category === filterCategory;
  });

  const handleCreateCharm = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCharm({
      name: name.trim(),
      category,
      price: Number(price),
      stock: Number(stock),
      icon: icon.trim() || '★',
      desc: desc.trim() || 'Aksesoris kustom Atelier'
    });

    setName('');
    setDesc('');
    setShowAddModal(false);
    alert('Komponen baru berhasil ditambahkan ke Studio Kustom!');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingCharm) return;
    onUpdateCharm(editingCharm.id, {
      name: editingCharm.name,
      category: editingCharm.category,
      price: Number(editingCharm.price),
      stock: Number(editingCharm.stock),
      icon: editingCharm.icon,
      desc: editingCharm.desc
    });
    setEditingCharm(null);
  };

  return (
    <div>
      {/* Header bar */}
      <div className="admin-subnav-row" style={{ justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} />
          <span>Tambah Komponen Baru</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="admin-table-card">
        <div className="admin-table-head">
          <h3 style={{ fontSize: '1.15rem' }}>Stok Charms, Pendants & Beads Studio</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Total {filteredCharms.length} item aktif
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="admin-desktop-table table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ikon</th>
                <th>Nama Komponen</th>
                <th>Kategori</th>
                <th>Harga Satuan</th>
                <th>Sisa Stok</th>
                <th>Status Stok</th>
                <th>Restock Cepat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCharms.map((ch) => {
                const isLow = (ch.stock || 0) <= 20;
                const isOut = (ch.stock || 0) <= 0;

                return (
                  <tr key={ch.id}>
                    <td style={{ fontSize: '1.4rem' }}>{ch.icon || '★'}</td>
                    <td>
                      <strong>{ch.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ch.desc}</div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{ch.category}</span>
                    </td>
                    <td>
                      <strong>Rp {(ch.price || 0).toLocaleString('id-ID')}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: '1rem', fontWeight: 800 }}>{ch.stock || 0} unit</span>
                    </td>
                    <td>
                      <span className={`badge ${isOut ? 'badge-rose' : isLow ? 'stock-badge-low' : 'stock-badge-good'}`}>
                        {isOut ? 'Habis' : isLow ? 'Menipis' : 'Aman'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => onRestockCharm(ch.id, 10)}
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => onRestockCharm(ch.id, 25)}
                        >
                          +25
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => onRestockCharm(ch.id, 50)}
                        >
                          +50
                        </button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-icon"
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => setEditingCharm(ch)}
                          title="Edit Komponen"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-icon"
                          style={{ width: '32px', height: '32px', color: 'var(--accent-rose)' }}
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus ${ch.name}?`)) {
                              onDeleteCharm(ch.id);
                            }
                          }}
                          title="Hapus Komponen"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View (Clean & Responsive on HP) */}
        <div className="admin-mobile-cards">
          {filteredCharms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <Layers size={36} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 600 }}>Tidak ada komponen aktif</div>
            </div>
          ) : (
            filteredCharms.map((ch) => {
              const isLow = (ch.stock || 0) <= 20;
              return (
                <div key={ch.id} className="admin-mobile-card-item">
                  <div className="admin-mobile-card-top">
                    <div style={{ fontSize: '2rem', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF8F4', borderRadius: '10px', flexShrink: 0 }}>
                      {ch.icon || '★'}
                    </div>
                    <div className="admin-mobile-card-info">
                      <div className="admin-mobile-card-title">{ch.name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.92rem' }}>Rp {(ch.price || 0).toLocaleString('id-ID')}</strong>
                        <span className={`badge ${isLow ? 'badge-rose' : 'badge-lime'}`} style={{ fontSize: '0.7rem' }}>
                          Stok: {ch.stock || 0} unit
                        </span>
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>{ch.category}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', paddingTop: '6px', borderTop: '1px dashed var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Restock Cepat:</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.75rem', height: '28px' }}
                        onClick={() => onRestockCharm(ch.id, 5)}
                      >
                        +5
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.75rem', height: '28px' }}
                        onClick={() => onRestockCharm(ch.id, 10)}
                      >
                        +10
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.75rem', height: '28px' }}
                        onClick={() => onRestockCharm(ch.id, 25)}
                      >
                        +25
                      </button>
                    </div>
                  </div>

                  <div className="admin-mobile-card-actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setEditingCharm(ch)}
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ color: 'var(--accent-rose)', borderColor: 'rgba(225, 29, 72, 0.3)' }}
                      onClick={() => {
                        if (confirm(`Hapus charm "${ch.name}"?`)) {
                          onDeleteCharm(ch.id);
                        }
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAF8F4' }}>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Tambah Charm / Komponen Baru</h3>
              <button
                type="button"
                className="btn btn-outline btn-icon"
                style={{ width: '32px', height: '32px' }}
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCharm} className="admin-modal-body">
              <div className="form-group">
                <label className="form-label">Nama Komponen / Charm *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Chrome Mini Skull"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="admin-modal-form-grid">
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="metal">Metal & Stainless</option>
                    <option value="cyber">Cyberpunk</option>
                    <option value="streetwear">Streetwear</option>
                    <option value="y2k">Y2K Acid</option>
                    <option value="stone">Batu Alam</option>
                    <option value="beads">Beads & Spacers</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Ikon / Simbol Visual (Emoji/Teks)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Contoh: 💀 / ⚡ / ★"
                    required
                  />
                </div>
              </div>

              <div className="admin-modal-form-grid">
                <div className="form-group">
                  <label className="form-label">Harga Satuan (Rp) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Jumlah Stok Awal *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Deskripsi Material Singkat</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Stainless steel finishing cermin anti-karat"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '42px', fontWeight: 700 }}>
                <span>Simpan ke Katalog Studio</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCharm && (
        <div className="admin-modal-overlay" onClick={() => setEditingCharm(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAF8F4' }}>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Edit Komponen: {editingCharm.name}</h3>
              <button
                type="button"
                className="btn btn-outline btn-icon"
                style={{ width: '32px', height: '32px' }}
                onClick={() => setEditingCharm(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="admin-modal-body">
              <div className="form-group">
                <label className="form-label">Nama Komponen</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingCharm.name}
                  onChange={(e) => setEditingCharm({ ...editingCharm, name: e.target.value })}
                  required
                />
              </div>

              <div className="admin-modal-form-grid">
                <div className="form-group">
                  <label className="form-label">Harga (Rp)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editingCharm.price}
                    onChange={(e) => setEditingCharm({ ...editingCharm, price: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stok Fisik</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editingCharm.stock}
                    onChange={(e) => setEditingCharm({ ...editingCharm, stock: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px', height: '42px', fontWeight: 700 }}>
                <span>Update Komponen</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
