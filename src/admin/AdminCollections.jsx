import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  ExternalLink,
  Tag,
  AlertCircle,
  HelpCircle,
  Layers,
  ShoppingBag
} from 'lucide-react';

export default function AdminCollections({
  collections = [],
  onAddCollection,
  onUpdateCollection,
  onDeleteCollection
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('keychains'); // 'keychains' or 'bracelets'
  const [formPrice, setFormPrice] = useState(15000);
  const [formStock, setFormStock] = useState(50);
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStrap, setFormStrap] = useState('');
  const [formShapes, setFormShapes] = useState('');
  const [formCharms, setFormCharms] = useState('');
  const [formIsCustomizable, setFormIsCustomizable] = useState(true);
  const [formTemplateId, setFormTemplateId] = useState('layout-a');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Counts
  const bagcharmsCount = collections.filter((c) => c.category === 'keychains' || c.type === 'bag_charm').length;
  const braceletsCount = collections.filter((c) => c.category === 'bracelets' || c.type === 'gelang').length;
  const bundlingCount = collections.filter((c) => c.category === 'bundling' || c.type === 'bundling').length;
  const customizableCount = collections.filter((c) => c.isCustomizable).length;

  // Filtered collection list
  const filteredCollections = collections.filter((item) => {
    // Category filter
    if (activeCategory === 'keychains' && item.category !== 'keychains' && item.type !== 'bag_charm') return false;
    if (activeCategory === 'bracelets' && item.category !== 'bracelets' && item.type !== 'gelang') return false;
    if (activeCategory === 'bundling' && item.category !== 'bundling' && item.type !== 'bundling') return false;
    if (activeCategory === 'customizable' && !item.isCustomizable) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (item.name || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchStrap = (item.highlights?.strap || '').toLowerCase().includes(q);
      const matchCharms = (item.highlights?.charms || '').toLowerCase().includes(q);
      return matchName || matchDesc || matchStrap || matchCharms;
    }

    return true;
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory(activeCategory === 'bundling' ? 'bundling' : (activeCategory === 'bracelets' ? 'bracelets' : 'keychains'));
    setFormPrice(15000);
    setFormStock(50);
    setFormImage('/images/bagcharm_baby_blue.jpg');
    setFormDescription('');
    setFormStrap('');
    setFormShapes('');
    setFormCharms('');
    setFormIsCustomizable(true);
    setFormTemplateId('layout-a');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormName(item.name || '');
    setFormCategory(item.category || (item.type === 'gelang' ? 'bracelets' : (item.type === 'bundling' ? 'bundling' : 'keychains')));
    setFormPrice(item.price || 15000);
    setFormStock(item.stock !== undefined ? item.stock : 50);
    setFormImage(item.image || '');
    setFormDescription(item.description || '');
    setFormStrap(item.highlights?.strap || '');
    setFormShapes(item.highlights?.shapes || '');
    setFormCharms(item.highlights?.charms || '');
    setFormIsCustomizable(Boolean(item.isCustomizable));
    setFormTemplateId(item.templateId || 'layout-a');
    setFormError('');
    setIsModalOpen(true);
  };

  // Compress image to ensure lightweight storage, snappy saves and fast loading
  const compressImage = (file, maxWidth = 1000, maxHeight = 1000, quality = 0.85) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(event.target.result);
      };
      reader.onerror = () => resolve('');
    });
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setFormError('Ukuran file foto maksimal 15 MB.');
        return;
      }
      try {
        const compressedBase64 = await compressImage(file, 1000, 1000, 0.85);
        setFormImage(compressedBase64);
        setFormError('');
      } catch (err) {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => setFormImage(uploadEvent.target.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Mohon masukkan nama produk koleksi.');
      return;
    }
    if (!formPrice || Number(formPrice) <= 0) {
      setFormError('Mohon masukkan harga produk yang valid.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    const payload = {
      name: formName.trim(),
      category: formCategory,
      type: formCategory === 'bracelets' ? 'gelang' : (formCategory === 'bundling' ? 'bundling' : 'bag_charm'),
      price: Number(formPrice),
      stock: Number(formStock || 0),
      image: formImage || (formCategory === 'bracelets' ? '/images/cat_bracelets.png' : (formCategory === 'bundling' ? '/images/custom_bagcharm_blue.jpg' : '/images/cat_bagcharms.png')),
      description: formDescription.trim(),
      highlights: {
        strap: formStrap.trim(),
        shapes: formShapes.trim(),
        charms: formCharms.trim()
      },
      isCustomizable: formCategory === 'bracelets' ? false : formIsCustomizable,
      templateId: formTemplateId || 'layout-a'
    };

    try {
      if (editingItem) {
        if (onUpdateCollection) {
          await onUpdateCollection(editingItem.id, payload);
        }
      } else {
        if (onAddCollection) {
          await onAddCollection(payload);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan produk ke database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id) => {
    if (onDeleteCollection) {
      onDeleteCollection(id);
    }
    setDeletingId(null);
  };

  return (
    <div>
      {/* Top Filter and Actions Row */}
      <div className="admin-subnav-row">
        {/* Category Pills */}
        <div className="filter-pills-wrap" style={{ margin: 0 }}>
          <button
            type="button"
            className={`filter-pill ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            Semua Koleksi ({collections.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeCategory === 'bundling' ? 'active' : ''}`}
            onClick={() => setActiveCategory('bundling')}
          >
            Paket Bundling ({bundlingCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeCategory === 'keychains' ? 'active' : ''}`}
            onClick={() => setActiveCategory('keychains')}
          >
            Custom Bagcharm ({bagcharmsCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeCategory === 'bracelets' ? 'active' : ''}`}
            onClick={() => setActiveCategory('bracelets')}
          >
            Koleksi Gelang ({braceletsCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeCategory === 'customizable' ? 'active' : ''}`}
            onClick={() => setActiveCategory('customizable')}
          >
            Bisa di-Custom ({customizableCount})
          </button>
        </div>

        {/* Add Product Button */}
        <button
          type="button"
          className="btn"
          onClick={handleOpenAddModal}
          style={{
            background: '#21201D',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            padding: '10px 20px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Plus size={18} />
          <span>Tambah Koleksi Baru</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="admin-table-card">
        {/* Table Header Controls */}
        <div className="admin-table-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--accent-purple)" />
              <span>Daftar Katalog Koleksi Toko</span>
            </h3>
            <span className="badge badge-neutral">
              {filteredCollections.length} dari {collections.length} Produk
            </span>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              placeholder="Cari nama, tali, atau charm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '36px',
                paddingRight: searchQuery ? '32px' : '14px',
                width: '100%'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="admin-desktop-table table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>FOTO</th>
                <th>PRODUK & KATEGORI</th>
                <th>HARGA</th>
                <th>STOK</th>
                <th>STATUS KUSTOMISASI</th>
                <th>SPESIFIKASI & HIGHLIGHTS</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <Layers size={36} color="var(--text-muted)" />
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Tidak ada koleksi produk yang cocok</div>
                      <div style={{ fontSize: '0.82rem' }}>Coba ubah kata kunci pencarian atau ganti filter kategori.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCollections.map((item) => {
                  const isBundling = item.category === 'bundling' || item.type === 'bundling';
                  const isBagcharm = item.category === 'keychains' || item.type === 'bag_charm';
                  return (
                    <tr key={item.id}>
                      {/* Image Thumbnail */}
                      <td style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            background: '#F3F4F6',
                            border: '1px solid var(--border-subtle)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                          }}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = isBundling ? '/images/custom_bagcharm_blue.jpg' : (isBagcharm ? '/images/cat_bagcharms.png' : '/images/cat_bracelets.png');
                              }}
                            />
                          ) : (
                            <ImageIcon size={22} color="var(--text-muted)" />
                          )}
                        </div>
                      </td>

                      {/* Product Name & Category */}
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                          {item.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <span className={`badge ${isBundling ? 'badge-amber' : (isBagcharm ? 'badge-purple' : 'badge-cyan')}`}>
                            {isBundling ? 'Paket Bundling' : (isBagcharm ? 'Custom Bagcharm' : 'Koleksi Gelang')}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            ID: {item.id}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {item.priceFormatted || `Rp ${Number(item.price || 0).toLocaleString('id-ID')}`}
                        </div>
                      </td>

                      {/* Stock */}
                      <td>
                        <span
                          className={`badge ${
                            (item.stock || 0) <= 20
                              ? 'badge-rose'
                              : 'badge-lime'
                          }`}
                        >
                          {item.stock !== undefined ? `${item.stock} unit` : '50 unit'}
                        </span>
                      </td>

                      {/* Customizability Status */}
                      <td>
                        {item.isCustomizable ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="badge badge-lime" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={12} />
                              <span>Bisa Custom di Studio</span>
                            </span>
                          </div>
                        ) : (
                          <span className="badge badge-neutral">
                            Ready Stock (Non-custom)
                          </span>
                        )}
                      </td>

                      {/* Highlights */}
                      <td>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: 1.4 }}>
                          {item.highlights?.strap && (
                            <div>
                              <strong style={{ color: 'var(--text-primary)' }}>Tali:</strong> {item.highlights.strap}
                            </div>
                          )}
                          {item.highlights?.shapes && (
                            <div>
                              <strong style={{ color: 'var(--text-primary)' }}>Frame/Bentuk:</strong> {item.highlights.shapes}
                            </div>
                          )}
                          {item.highlights?.charms && (
                            <div>
                              <strong style={{ color: 'var(--text-primary)' }}>Charms:</strong> {item.highlights.charms}
                            </div>
                          )}
                          {!item.highlights?.strap && !item.highlights?.shapes && !item.highlights?.charms && (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              {item.description || 'Spesifikasi standar studio atelier'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit koleksi ini"
                            style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => setDeletingId(item.id)}
                            title="Hapus koleksi ini"
                            style={{
                              padding: '6px 10px',
                              fontSize: '0.78rem',
                              color: 'var(--accent-rose)',
                              borderColor: 'rgba(225, 29, 72, 0.3)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
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

        {/* Mobile Card List View (Clean, Native & Responsive on HP) */}
        <div className="admin-mobile-cards">
          {filteredCollections.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <Layers size={36} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 600 }}>Tidak ada produk yang cocok</div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Coba ubah filter kategori atau kata kunci pencarian.</div>
            </div>
          ) : (
            filteredCollections.map((item) => {
              const isBagcharm = item.category === 'keychains' || item.type === 'bag_charm';
              return (
                <div key={item.id} className="admin-mobile-card-item">
                  <div className="admin-mobile-card-top">
                    <img
                      src={item.image || (isBagcharm ? '/images/cat_bagcharms.png' : '/images/cat_bracelets.png')}
                      alt={item.name}
                      className="admin-mobile-card-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/cat_bagcharms.png';
                      }}
                    />
                    <div className="admin-mobile-card-info">
                      <div className="admin-mobile-card-title">{item.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <span className="admin-mobile-card-price">
                          {item.priceFormatted || `Rp ${Number(item.price || 0).toLocaleString('id-ID')}`}
                        </span>
                        <span className={`badge ${item.stock <= 10 ? 'badge-rose' : 'badge-lime'}`} style={{ fontSize: '0.7rem' }}>
                          Stok: {item.stock ?? 50}
                        </span>
                      </div>
                      <div className="admin-mobile-card-tags">
                        <span className={`badge ${isBagcharm ? 'badge-purple' : 'badge-cyan'}`} style={{ fontSize: '0.68rem' }}>
                          {isBagcharm ? 'Bagcharm' : 'Gelang'}
                        </span>
                        {item.isCustomizable && (
                          <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>
                            Bisa Custom
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {(item.highlights?.strap || item.highlights?.shapes || item.highlights?.charms) && (
                    <div className="admin-mobile-card-meta">
                      {item.highlights?.strap && <div><strong>Tali:</strong> {item.highlights.strap}</div>}
                      {item.highlights?.shapes && <div><strong>Frame:</strong> {item.highlights.shapes}</div>}
                      {item.highlights?.charms && <div><strong>Charms:</strong> {item.highlights.charms}</div>}
                    </div>
                  )}

                  <div className="admin-mobile-card-actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleOpenEditModal(item)}
                    >
                      <Edit2 size={13} />
                      <span>Edit Produk</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ color: 'var(--accent-rose)', borderColor: 'rgba(225, 29, 72, 0.3)' }}
                      onClick={() => setDeletingId(item.id)}
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

      {/* =========================================================================
          MODAL: TAMBAH / EDIT KOLEKSI
          ========================================================================= */}
      {isModalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            className="admin-modal-card"
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#21201D',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                    {editingItem ? 'Edit Koleksi Produk' : 'Tambah Koleksi Produk Baru'}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Produk ini akan langsung tampil di halaman koleksi toko customer.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="admin-modal-body">
              {formError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#FFE4E6',
                    color: '#BE123C',
                    border: '1px solid #FECDD3',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form Grid */}
              <div className="admin-modal-form-grid">
                {/* Product Name */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    NAMA KOLEKSI PRODUK *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Baby Blue Star Photostrip Bagcharm"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', height: '42px', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    KATEGORI KOLEKSI *
                  </label>
                  <select
                    className="form-select"
                    value={formCategory}
                    onChange={(e) => {
                      const nextCat = e.target.value;
                      setFormCategory(nextCat);
                      if (nextCat === 'bracelets') {
                        setFormIsCustomizable(false);
                      }
                    }}
                    style={{ width: '100%' }}
                  >
                    <option value="keychains">Custom Bagcharm (Gantungan Tas)</option>
                    <option value="bracelets">Koleksi Gelang (Bracelet Beads)</option>
                    <option value="bundling">Paket Bundling Couple / Bestie</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    HARGA JUAL (RP) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="500"
                    placeholder="15000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="form-input"
                    style={{ width: '100%', height: '42px', fontSize: '0.9rem' }}
                  />
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Tampil sebagai: Rp {Number(formPrice || 0).toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    STOK TERSEDIA (UNIT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="50"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="form-input"
                    style={{ width: '100%', height: '42px', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Customizable Studio Toggle */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                    KUSTOMISASI STUDIO
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      height: '42px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formIsCustomizable}
                      disabled={formCategory === 'bracelets'}
                      onChange={(e) => setFormIsCustomizable(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#21201D' }}
                    />
                    <span>{formCategory === 'bracelets' ? 'Gelang (Ready Stock)' : 'Bisa Custom Foto Frame di Studio'}</span>
                  </label>
                </div>
              </div>

              {/* Product Photo Upload & Preview */}
              <div
                style={{
                  background: '#F9FAFB',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px'
                }}
              >
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '10px' }}>
                  FOTO PRODUK KOLEKSI
                </label>
                <div className="admin-photo-upload-row">
                  {/* Image Preview Box */}
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1.5px dashed var(--border-medium)',
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {formImage ? (
                      <img src={formImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ImageIcon size={26} color="var(--text-muted)" />
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                      <label
                        className="btn btn-outline btn-sm"
                        style={{
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 700
                        }}
                      >
                        <Upload size={14} />
                        <span>Pilih Foto dari Perangkat</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleImageFileUpload}
                        />
                      </label>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Atau masukkan URL / path gambar langsung:
                    </div>
                    <input
                      type="text"
                      placeholder="/images/bagcharm_baby_blue.jpg"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="form-input"
                      style={{ width: '100%', height: '36px', fontSize: '0.82rem', marginTop: '4px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  DESKRIPSI ESTETIKA PRODUK
                </label>
                <textarea
                  rows={2}
                  placeholder="Ceritakan detail keunikan produk, tone warna, atau vibes yang ingin disampaikan..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', minHeight: '65px', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              {/* Highlights & Specifications */}
              <div
                style={{
                  background: '#FAF8F4',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px'
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                  SPESIFIKASI & KOMPONEN (HIGHLIGHTS TOKO)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Bahan Tali / Strap
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Paracord 550 Baby Blue bintik putih (Twisted Loop)"
                      value={formStrap}
                      onChange={(e) => setFormStrap(e.target.value)}
                      className="form-input"
                      style={{ width: '100%', height: '36px', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Bentuk Frame Foto / Manik Beads
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Frame Akrilik Photostrip 3 Pose (Vintage Stamp Edition)"
                      value={formShapes}
                      onChange={(e) => setFormShapes(e.target.value)}
                      className="form-input"
                      style={{ width: '100%', height: '36px', fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Charms & Aksesoris Tambahan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Lonceng mini putih & charm bintang akrilik wavy iridescent"
                      value={formCharms}
                      onChange={(e) => setFormCharms(e.target.value)}
                      className="form-input"
                      style={{ width: '100%', height: '36px', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 20px', fontWeight: 600 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn"
                  style={{
                    background: isSaving ? '#6B7280' : '#21201D',
                    color: '#FFFFFF',
                    padding: '10px 24px',
                    fontWeight: 700,
                    boxShadow: 'var(--shadow-sm)',
                    cursor: isSaving ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isSaving ? 'Menyimpan ke Database...' : (editingItem ? 'Simpan Perubahan' : 'Terbitkan Koleksi Baru')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRM DELETE MODAL
          ========================================================================= */}
      {deletingId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              maxWidth: '420px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#FFE4E6',
                color: 'var(--accent-rose)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <Trash2 size={24} />
            </div>
            <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800 }}>Hapus Koleksi Produk?</h4>
            <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Koleksi ini akan dihapus dari katalog toko customer dan database. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setDeletingId(null)}
                style={{ padding: '8px 18px', fontWeight: 600 }}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => handleDelete(deletingId)}
                style={{
                  background: 'var(--accent-rose)',
                  color: '#FFFFFF',
                  padding: '8px 20px',
                  fontWeight: 700,
                  borderColor: 'var(--accent-rose)'
                }}
              >
                Ya, Hapus Koleksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
