import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronRight, Sparkles, Check, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { INITIAL_COLLECTIONS as ALL_COLLECTION_ITEMS } from '../data/initialData';
import BundlingSelectionModal from './BundlingSelectionModal';

export { ALL_COLLECTION_ITEMS };

export default function CollectionPage({
  items = ALL_COLLECTION_ITEMS,
  initialCategory = 'all',
  initialItem = null,
  onCustomizeItem,
  onAddToCart,
  onNavigateHome
}) {
  const collectionList = items && items.length > 0 ? items : ALL_COLLECTION_ITEMS;
  const [activeTab, setActiveTab] = useState(initialCategory || 'all');
  const [activeItem, setActiveItem] = useState(initialItem || collectionList[0]);
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);
  const [addedToast, setAddedToast] = useState(false);
  const [bundlingModalItem, setBundlingModalItem] = useState(null);

  useEffect(() => {
    if (initialCategory && initialCategory !== 'all') {
      const targetTab = initialCategory === 'frames' ? 'bagcharms' : initialCategory;
      setActiveTab(targetTab);
      if (initialItem) {
        setActiveItem(initialItem);
        setActiveThumbIndex(0);
      } else {
        const catKey = targetTab === 'bagcharms' ? 'keychains' : targetTab;
        const firstInCat = collectionList.find((it) => it.category === catKey);
        if (firstInCat) {
          setActiveItem(firstInCat);
          setActiveThumbIndex(0);
        }
      }
    } else if (initialItem) {
      setActiveItem(initialItem);
      setActiveThumbIndex(0);
    }
  }, [initialCategory, initialItem, collectionList]);

  // Keep activeItem valid if collectionList changes
  useEffect(() => {
    if (activeItem && !collectionList.some((it) => it.id === activeItem.id)) {
      setActiveItem(collectionList[0] || null);
      setActiveThumbIndex(0);
    }
  }, [collectionList]);

  const handleSelectShowcaseItem = (item) => {
    setActiveItem(item);
    setActiveThumbIndex(0);
    window.scrollTo({ top: 80, behavior: 'smooth' });
  };

  const isBundle2 = (item) => {
    if (!item) return false;
    const id = item.id || '';
    const name = (item.name || '').toLowerCase();
    return id.includes('bundle-couple-2') || name.includes('bestie 2') || name.includes('couple 2') || (name.includes('couple') && name.includes('2 bagcharm'));
  };

  const handleBuyShowcaseItem = () => {
    if (!activeItem) return;
    if (isBundle2(activeItem)) {
      if (onCustomizeItem) {
        onCustomizeItem({ bundlingProduct: activeItem, bundleType: 2 });
      }
      return;
    }
    if (activeItem.category === 'bundling' || activeItem.id?.startsWith('col-bundle')) {
      setBundlingModalItem(activeItem);
      return;
    }
    if (onAddToCart) {
      onAddToCart({
        productType: activeItem.type,
        title: activeItem.name,
        unitPrice: activeItem.price,
        quantity: 1,
        subtotal: activeItem.price,
        image: activeItem.image
      });
      confetti({
        particleCount: 45,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#EDE9FE', '#FDECEC']
      });
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2400);
    }
  };

  const filteredList = collectionList.filter((it) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'bracelets') return it.category === 'bracelets';
    if (activeTab === 'bagcharms' || activeTab === 'keychains') return it.category === 'keychains';
    if (activeTab === 'bundling') return it.category === 'bundling';
    return true;
  });

  // "You might also love" items
  const recommendedItems = collectionList.filter(
    (it) => it.id !== activeItem?.id
  ).slice(0, 3);

  const getCategoryLabel = (item) => {
    if (item?.category === 'bundling') return 'Paket Bundling Couple / Bestie';
    if (item?.category === 'bracelets') return 'Koleksi Gelang';
    return 'Custom Bagcharm';
  };

  const currentDisplayImage =
    activeItem?.thumbs && activeItem?.thumbs[activeThumbIndex]
      ? activeItem.thumbs[activeThumbIndex]
      : (activeItem?.image || '/images/cat_bagcharms.png');

  return (
    <div className="collection-page-wrap">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="tt-breadcrumb-nav" aria-label="Breadcrumb">
          <button type="button" className="tt-breadcrumb-link" onClick={onNavigateHome}>
            Home
          </button>
          <ChevronRight size={14} className="tt-breadcrumb-sep" />
          <button
            type="button"
            className="tt-breadcrumb-link"
            onClick={() => setActiveTab(activeItem?.category || 'all')}
          >
            {getCategoryLabel(activeItem)}
          </button>
          <ChevronRight size={14} className="tt-breadcrumb-sep" />
          <span className="tt-breadcrumb-current">{activeItem.name}</span>
        </nav>

        {/* ------------------------------------------------------------------
            TOP SHOWCASE SECTION (MATCHING SCREENSHOT)
            ------------------------------------------------------------------ */}
        <div className="tt-showcase-grid">
          {/* Left Column: Thumbnails + Main Image */}
          <div className="tt-showcase-visual">
            <div className="tt-thumbs-column">
              {activeItem.thumbs && activeItem.thumbs.length > 1 &&
                activeItem.thumbs.map((thumbUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`tt-thumb-box ${activeThumbIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveThumbIndex(idx)}
                    aria-label={`Lihat gambar ${idx + 1}`}
                  >
                    <img src={thumbUrl} alt="" className="tt-thumb-img" />
                  </button>
                ))}
            </div>

            <div className="tt-showcase-main-img-card">
              <img
                src={currentDisplayImage}
                alt={activeItem.name}
                className="tt-showcase-main-img"
              />
            </div>
          </div>

          {/* Right Column: Title, Price, Description, Highlights & CTA */}
          <div className="tt-showcase-details">
            <h1 className="tt-showcase-title">{activeItem.name}</h1>
            <div className="tt-showcase-price">{activeItem.priceFormatted}</div>

            <p className="tt-showcase-desc">{activeItem.description}</p>

            {/* Customization Highlights Box */}
            <div className="tt-highlights-card">
              <h4 className="tt-highlights-label">CUSTOMIZATION HIGHLIGHTS:</h4>
              <ul className="tt-highlights-list">
                <li>
                  <span className="highlight-dot">★</span>
                  <span><strong>Tali & Strap:</strong> {activeItem.highlights?.strap || '6 Vibrant cord choices'}</span>
                </li>
                <li>
                  <span className="highlight-dot">★</span>
                  <span>
                    <strong>
                      {activeItem.category === 'bracelets' || activeItem.id === 'col-bundle-couple-1'
                        ? 'Desain & Manik:'
                        : (activeItem.category === 'bundling' ? 'Komponen Paket:' : 'Bentuk Frame:')}
                    </strong>{' '}
                    {activeItem.highlights?.shapes || 'Custom Photostrip Slot'}
                  </span>
                </li>
                <li>
                  <span className="highlight-dot">★</span>
                  <span>
                    <strong>
                      {activeItem.category === 'bundling' ? 'Isi & Detail:' : 'Aksen Charms:'}
                    </strong>{' '}
                    {activeItem.highlights?.charms || 'Over 20+ charms & beads'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Main Action Button */}
            <div className="tt-showcase-action">
              {isBundle2(activeItem) ? (
                <button
                  type="button"
                  className="tt-btn-customize-now"
                  onClick={() => onCustomizeItem && onCustomizeItem({ bundlingProduct: activeItem, bundleType: 2 })}
                  style={{ background: '#4F46E5', color: '#ffffff' }}
                >
                  <Sparkles size={18} />
                  <span>Mulai Custom di Studio ({activeItem.priceFormatted})</span>
                </button>
              ) : activeItem.category === 'bundling' || activeItem.id?.startsWith('col-bundle') ? (
                <button
                  type="button"
                  className="tt-btn-customize-now"
                  onClick={() => setBundlingModalItem(activeItem)}
                  style={{ background: '#21201D' }}
                >
                  <ShoppingBag size={18} />
                  <span>+ Pilih Koleksi & Masukkan Keranjang ({activeItem.priceFormatted})</span>
                </button>
              ) : activeItem.isCustomizable ? (
                <div style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="tt-btn-customize-now"
                    onClick={() => onCustomizeItem && onCustomizeItem(activeItem)}
                    style={{ flex: 1, minWidth: '180px' }}
                  >
                    <Sparkles size={18} />
                    <span>Mulai Custom di Studio</span>
                  </button>
                  <button
                    type="button"
                    className="tt-btn-customize-now"
                    onClick={handleBuyShowcaseItem}
                    style={{ background: '#21201D', flex: 1, minWidth: '180px' }}
                  >
                    <ShoppingBag size={18} />
                    <span>+ Beli Langsung ({activeItem.priceFormatted})</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="tt-btn-customize-now"
                  onClick={handleBuyShowcaseItem}
                  style={{ background: '#21201D' }}
                >
                  <ShoppingBag size={18} />
                  <span>+ Masukkan Keranjang ({activeItem.priceFormatted})</span>
                </button>
              )}

              {addedToast && (
                <div className="tt-added-badge">
                  <Check size={16} /> Ditambahkan ke keranjang belanja!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------
            COLLECTION BROWSER: BAGCHARMS, BRACELETS & BUNDLING TABS
            ------------------------------------------------------------------ */}
        <div className="collection-browser-section" id="koleksi-lengkap">
          <div className="collection-tabs-bar">
            <h2 className="collection-section-heading">Koleksi Tersedia</h2>

            <div className="collection-pills-row">
              <button
                type="button"
                className={`collection-tab-pill ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Semua Koleksi ({collectionList.length})
              </button>
              <button
                type="button"
                className={`collection-tab-pill ${activeTab === 'bundling' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('bundling');
                  if (activeItem?.category !== 'bundling') {
                    const firstBundle = collectionList.find((it) => it.category === 'bundling');
                    if (firstBundle) {
                      setActiveItem(firstBundle);
                      setActiveThumbIndex(0);
                    }
                  }
                }}
              >
                Paket Bundling Couple / Bestie ({collectionList.filter((it) => it.category === 'bundling').length})
              </button>
              <button
                type="button"
                className={`collection-tab-pill ${activeTab === 'bagcharms' || activeTab === 'keychains' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('bagcharms');
                  if (activeItem?.category !== 'keychains') {
                    const firstItem = collectionList.find((it) => it.category === 'keychains');
                    if (firstItem) {
                      setActiveItem(firstItem);
                      setActiveThumbIndex(0);
                    }
                  }
                }}
              >
                Custom Bagcharm ({collectionList.filter((it) => it.category === 'keychains').length})
              </button>
              <button
                type="button"
                className={`collection-tab-pill ${activeTab === 'bracelets' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('bracelets');
                  if (activeItem?.category !== 'bracelets') {
                    const firstBrac = collectionList.find((it) => it.category === 'bracelets');
                    if (firstBrac) {
                      setActiveItem(firstBrac);
                      setActiveThumbIndex(0);
                    }
                  }
                }}
              >
                Koleksi Gelang ({collectionList.filter((it) => it.category === 'bracelets').length})
              </button>
            </div>
          </div>

          {/* Cards Grid - Cookie Box Styled Layout (Matching User Reference Image 2) */}
          <div className="collection-grid">
            {filteredList.map((item) => {
              const itemIsCustomizable = item.isCustomizable;

              return (
                <div
                  key={item.id}
                  className={`collection-item-card ${activeItem.id === item.id ? 'featured' : ''}`}
                >
                  {/* Top Inner Rounded Image Container with Soft Warm Beige Background */}
                  <div
                    className="col-img-wrapper"
                    onClick={() => handleSelectShowcaseItem(item)}
                    role="button"
                    tabIndex={0}
                    title="Klik untuk melihat detail produk di atas"
                  >
                    <img src={item.image} alt={item.name} loading="lazy" />
                  </div>

                  {/* Card Body: Title, Coral Red Price, 3-line Description, Bottom Pill Button */}
                  <div className="col-card-body">
                    <h3
                      className="col-card-title"
                      onClick={() => handleSelectShowcaseItem(item)}
                      title={item.name}
                    >
                      {item.name}
                    </h3>

                    <div className="col-price-row">
                      <span className="col-price-val">{item.priceFormatted}</span>
                    </div>

                    <p className="col-card-desc">
                      {item.description}
                    </p>

                    <div className="col-actions">
                      {isBundle2(item) ? (
                        <button
                          type="button"
                          className="col-order-pill-btn"
                          style={{ width: '100%', background: '#4F46E5', color: '#ffffff' }}
                          onClick={() => onCustomizeItem && onCustomizeItem({ bundlingProduct: item, bundleType: 2 })}
                        >
                          Mulai Custom di Studio →
                        </button>
                      ) : item.category === 'bundling' || item.id?.startsWith('col-bundle') ? (
                        <button
                          type="button"
                          className="col-order-pill-btn"
                          style={{ width: '100%', background: '#21201D', color: '#ffffff' }}
                          onClick={() => setBundlingModalItem(item)}
                        >
                          + Pilih Koleksi & Pesan
                        </button>
                      ) : itemIsCustomizable ? (
                        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                          <button
                            type="button"
                            className="col-order-pill-btn"
                            style={{ flex: 1, padding: '8px 6px', fontSize: '0.8rem' }}
                            onClick={() => onCustomizeItem && onCustomizeItem(item)}
                          >
                            + Custom
                          </button>
                          <button
                            type="button"
                            className="col-order-pill-btn"
                            style={{ flex: 1, padding: '8px 6px', fontSize: '0.8rem', background: '#21201D', color: '#ffffff' }}
                            onClick={() => {
                              if (onAddToCart) {
                                onAddToCart({
                                  productType: item.type,
                                  title: item.name,
                                  unitPrice: item.price,
                                  quantity: 1,
                                  subtotal: item.price,
                                  image: item.image
                                });
                                confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 } });
                                setAddedToast(true);
                                setTimeout(() => setAddedToast(false), 2400);
                              }
                            }}
                          >
                            + Beli
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="col-order-pill-btn"
                          onClick={() => {
                            if (onAddToCart) {
                              onAddToCart({
                                productType: item.type,
                                title: item.name,
                                unitPrice: item.price,
                                quantity: 1,
                                subtotal: item.price,
                                image: item.image
                              });
                              confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 } });
                              setAddedToast(true);
                              setTimeout(() => setAddedToast(false), 2400);
                            }
                          }}
                        >
                          + Tambah ke Pesanan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------------
            "YOU MIGHT ALSO LOVE" SECTION
            ------------------------------------------------------------------ */}
        <div className="section-you-might-love">
          <h2 className="section-title-left" style={{ marginBottom: '24px' }}>
            You might also love
          </h2>

          <div className="recommendation-grid">
            {recommendedItems.map((rec) => {
              const isCustom = rec.isCustomizable;

              return (
                <div key={rec.id} className="rec-card">
                  <div
                    className="rec-img-container"
                    onClick={() => handleSelectShowcaseItem(rec)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={rec.image} alt={rec.name} className="rec-img" loading="lazy" />
                  </div>

                  <div className="rec-card-body">
                    <h3
                      className="rec-card-title"
                      onClick={() => handleSelectShowcaseItem(rec)}
                      style={{ cursor: 'pointer' }}
                    >
                      {rec.name}
                    </h3>
                    <div className="col-price-row">
                      <span className="col-price-val">{rec.priceFormatted}</span>
                    </div>

                    <p className="col-card-desc">
                      {rec.description}
                    </p>

                    <div className="col-actions">
                      {isBundle2(rec) ? (
                        <button
                          type="button"
                          className="col-order-pill-btn"
                          style={{ width: '100%', background: '#4F46E5', color: '#ffffff' }}
                          onClick={() => onCustomizeItem && onCustomizeItem({ bundlingProduct: rec, bundleType: 2 })}
                        >
                          Mulai Custom di Studio →
                        </button>
                      ) : rec.category === 'bundling' || rec.id?.startsWith('col-bundle') ? (
                        <button
                          type="button"
                          className="col-order-pill-btn"
                          style={{ width: '100%', background: '#21201D', color: '#ffffff' }}
                          onClick={() => setBundlingModalItem(rec)}
                        >
                          + Pilih Koleksi & Pesan
                        </button>
                      ) : isCustom ? (
                        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                          <button
                            type="button"
                            className="col-order-pill-btn"
                            style={{ flex: 1, padding: '8px 6px', fontSize: '0.8rem' }}
                            onClick={() => onCustomizeItem && onCustomizeItem(rec)}
                          >
                            + Custom
                          </button>
                          <button
                            type="button"
                            className="col-order-pill-btn"
                            style={{ flex: 1, padding: '8px 6px', fontSize: '0.8rem', background: '#21201D', color: '#ffffff' }}
                            onClick={() => {
                              if (onAddToCart) {
                                onAddToCart({
                                  productType: rec.type,
                                  title: rec.name,
                                  unitPrice: rec.price,
                                  quantity: 1,
                                  subtotal: rec.price,
                                  image: rec.image
                                });
                                confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 } });
                                setAddedToast(true);
                                setTimeout(() => setAddedToast(false), 2400);
                              }
                            }}
                          >
                            + Beli
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="col-order-pill-btn"
                          onClick={() => {
                            if (onAddToCart) {
                              onAddToCart({
                                productType: rec.type,
                                title: rec.name,
                                unitPrice: rec.price,
                                quantity: 1,
                                subtotal: rec.price,
                                image: rec.image
                              });
                              confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 } });
                              setAddedToast(true);
                              setTimeout(() => setAddedToast(false), 2400);
                            }
                          }}
                        >
                          + Tambah ke Pesanan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bundling Selection Modal */}
      {bundlingModalItem && (
        <BundlingSelectionModal
          isOpen={Boolean(bundlingModalItem)}
          onClose={() => setBundlingModalItem(null)}
          bundlingProduct={bundlingModalItem}
          collections={collectionList}
          onConfirm={(bundlePayload) => {
            if (onAddToCart) {
              onAddToCart(bundlePayload);
              setAddedToast(true);
              setTimeout(() => setAddedToast(false), 2400);
            }
          }}
          onGoToCustomStudio={(bundleData) => {
            if (onCustomizeItem) {
              onCustomizeItem(bundleData);
            }
          }}
        />
      )}
    </div>
  );
}
