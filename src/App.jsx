import React, { useState, useEffect } from 'react';
import { store } from './data/store';

import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ExploreCategories from './components/ExploreCategories';
import RecommendationSection from './components/RecommendationSection';
import HowItWorks from './components/HowItWorks';
import TestimonialsSection from './components/TestimonialsSection';
import FrameLayoutSelector from './components/FrameLayoutSelector';
import CustomizerStudio from './components/CustomizerStudio';
import PresetCatalog from './components/PresetCatalog';
import AccessoriesCatalog from './components/AccessoriesCatalog';
import CollectionPage, { ALL_COLLECTION_ITEMS } from './components/CollectionPage';
import CartModal from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import Footer from './components/Footer';

import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminAuthModal from './components/AdminAuthModal';
import { useBodyScrollLock } from './utils/scrollLock';

export default function App() {
  // Reactive local snapshot of store
  const [, setTick] = useState(0);

  // UI Navigation states
  const [activeView, setActiveView] = useState('home'); // 'home' | 'studio' | 'catalog' | 'tracking'
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminLoginView, setIsAdminLoginView] = useState(false);
  const [isAdminDashboardView, setIsAdminDashboardView] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

  // Prevent background scrolling when any modal is open
  useBodyScrollLock(Boolean(isCartOpen || isCheckoutOpen || isAdminAuthModalOpen));

  // Template selection state for Bag Charm customizer
  const [selectedTemplate, setSelectedTemplate] = useState({
    id: 'frame-borcelle',
    type: 'custom_frame',
    frameId: 'frame-borcelle',
    layoutId: 'layout-a',
    name: 'Borcelle Vintage Mosaic'
  });

  // Studio preset remix config
  const [studioPresetConfig, setStudioPresetConfig] = useState(null);

  // Active Bundling Customization Session (For Bundle 3: 1 Gelang & 1 Bagcharm)
  const [bundlingSession, setBundlingSession] = useState(null);
  const [studioDraft, setStudioDraft] = useState(null);

  // Collection page view state
  const [collectionCategory, setCollectionCategory] = useState('all');
  const [collectionItem, setCollectionItem] = useState(null);

  // Store data getters
  const products = store.getProducts();
  const charms = store.getCharms();
  const colors = store.colors;
  const presets = store.getPresets();
  const isAdmin = store.isAdminLoggedIn();

  // Reactive State (Guarantees instant DOM update across all components)
  const [orders, setOrders] = useState(() => store.getOrders());
  const [collections, setCollections] = useState(() => store.getCollections());
  const [cart, setCart] = useState(() => store.getCart());
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [cartCount, setCartCount] = useState(() =>
    store.getCart().filter(Boolean).reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0)
  );
  const [isLiveDbConnected, setIsLiveDbConnected] = useState(() => store.isLiveDbConnected);
  const [isSyncingDb, setIsSyncingDb] = useState(() => store.isSyncing);

  useEffect(() => {
    const syncStore = () => {
      const freshCart = [...store.getCart()].filter(Boolean);
      setCart(freshCart);
      setCartCount(freshCart.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0));
      setCollections([...store.getCollections()]);
      setOrders([...store.getOrders()]);
      setIsLiveDbConnected(store.isLiveDbConnected);
      setIsSyncingDb(store.isSyncing);
      setTick((t) => t + 1);
    };

    const unsubscribe = store.subscribe(syncStore);
    syncStore();
    return unsubscribe;
  }, []);

  // Real-time synchronization loop when Admin Dashboard is active
  useEffect(() => {
    if (isAdmin && isAdminDashboardView) {
      store.startRealtimeSync(15000);
      return () => {
        store.stopRealtimeSync();
      };
    }
  }, [isAdmin, isAdminDashboardView]);

  // Navigation handlers
  const handleGoToStudio = () => {
    setActiveView('frames');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTemplateFromHome = (template) => {
    setSelectedTemplate(template);
    if (bundlingSession?.bundleType === 2) {
      if (bundlingSession.bundle2ActiveBagcharm === 2) {
        setBundlingSession((prev) => ({
          ...prev,
          selectedFrame2: template,
          savedBagcharm2: prev?.savedBagcharm2 ? {
            ...prev.savedBagcharm2,
            frameId: template.frameId || template.id,
            frameName: template.name,
            frameImage: template.imageSrc,
            layoutId: template.layoutId || 'layout-a'
          } : null
        }));
      } else {
        setBundlingSession((prev) => ({
          ...prev,
          selectedFrame1: template,
          savedBagcharm1: prev?.savedBagcharm1 ? {
            ...prev.savedBagcharm1,
            frameId: template.frameId || template.id,
            frameName: template.name,
            frameImage: template.imageSrc,
            layoutId: template.layoutId || 'layout-a'
          } : null
        }));
      }
    }
    setActiveView('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToFrameForBagcharm2 = (savedBagcharm1) => {
    setBundlingSession((prev) => ({
      ...prev,
      bundle2ActiveBagcharm: 2,
      savedBagcharm1
    }));
    setActiveView('frames');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToFramesFromStudio = (draft) => {
    if (draft) {
      setStudioDraft(draft);
      if (bundlingSession?.bundleType === 2) {
        if (draft.bundle2Step === 1 && draft.b1Data) {
          setBundlingSession((prev) => ({
            ...prev,
            bundle2ActiveBagcharm: 1,
            savedBagcharm1: draft.b1Data
          }));
        } else if (draft.bundle2Step === 2 && draft.b2Data) {
          setBundlingSession((prev) => ({
            ...prev,
            bundle2ActiveBagcharm: 2,
            savedBagcharm2: draft.b2Data
          }));
        }
      }
    }
    setActiveView('frames');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToCatalog = () => {
    setActiveView('catalog');
    setTimeout(() => {
      const el = document.getElementById('katalog-aksesoris') || document.getElementById('katalog-inspirasi');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleSelectCategory = (categoryType, specificItem = null) => {
    if (categoryType === 'bundling') {
      setCollectionCategory('bundling');
      setCollectionItem(specificItem || null);
      setActiveView('collection');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (categoryType === 'bracelets' || categoryType === 'gelang') {
      setCollectionCategory('bracelets');
      setCollectionItem(specificItem || null);
      setActiveView('collection');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (categoryType === 'all') {
      setCollectionCategory('all');
      setCollectionItem(specificItem || null);
      setActiveView('collection');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCollectionCategory('bagcharms');
      setCollectionItem(specificItem || null);
      setActiveView('collection');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateToCollectionFromHero = (collection) => {
    if (collection.actionType === 'studio') {
      handleGoToStudio();
      return;
    }
    let cat = 'bagcharms';
    if (collection.category === 'bundling' || collection.id?.includes('bundle')) {
      cat = 'bundling';
    } else if (
      collection.category === 'bracelets' ||
      collection.id?.includes('bracelet') ||
      (collection.subtitle && (collection.subtitle.includes('Beads') || collection.subtitle.includes('Star') || collection.subtitle.includes('Bloom')))
    ) {
      cat = 'bracelets';
    }

    const matchedItem = collections.find((it) => it.id === collection.id);
    handleSelectCategory(cat, matchedItem || null);
  };

  const handleCustomizeRecItem = (item) => {
    if (item && item.bundlingProduct) {
      const bType = item.bundleType || (
        item.bundlingProduct.id?.includes('couple-2') || (item.bundlingProduct.name || '').includes('2 Bagcharm') ? 2 : 3
      );

      const session = {
        bundleType: bType,
        bundleId: item.bundlingProduct.id,
        bundleTitle: item.bundlingProduct.name,
        bundlePrice: item.bundlingProduct.price || (bType === 2 ? 28000 : 27000),
        bundleImage: item.bundlingProduct.image,
        selectedGelang: item.selectedGelang || null,
        selectedFrame1: item.selectedFrame1 || null,
        selectedFrame2: item.selectedFrame2 || null,
        bundle2ActiveBagcharm: 1,
        savedBagcharm1: null
      };

      setBundlingSession(session);

      // Always choose frame first before editing in Studio!
      setActiveView('frames');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setBundlingSession(null);
    setActiveView('frames');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Catalog remix
  const handleRemixPreset = (preset) => {
    setStudioPresetConfig(preset.config);
    setActiveView('studio');
    setTimeout(() => {
      const el = document.getElementById('studio-customizer');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Cart actions with immediate synchronous state update
  const handleAddToCart = (item) => {
    store.addToCart(item);
    const fresh = [...store.getCart()];
    setCart(fresh);
    setCartCount(fresh.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0));
  };

  const handleRemoveFromCart = (cartItemId) => {
    store.removeFromCart(cartItemId);
    const fresh = [...store.getCart()];
    setCart(fresh);
    setCartCount(fresh.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0));
  };

  const handleClearCart = () => {
    store.clearCart();
    setCart([]);
    setCartCount(0);
  };

  const handleUpdateCartQuantity = (cartItemId, delta) => {
    store.updateCartQuantity(cartItemId, delta);
    const fresh = [...store.getCart()];
    setCart(fresh);
    setCartCount(fresh.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0));
  };

  const handleProceedCheckout = (selectedItems) => {
    const itemsToBuy = selectedItems && selectedItems.length > 0 ? selectedItems : cart;
    setCheckoutItems(itemsToBuy);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCreateOrder = (orderData) => {
    const order = store.createOrder(orderData);
    const freshCart = [...store.getCart()];
    setCart(freshCart);
    setCartCount(freshCart.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0));
    setCheckoutItems([]);
    return order;
  };

  // Admin handlers
  const handleAdminLogin = (email, password) => {
    const res = store.loginAdmin(email, password);
    if (res.success) {
      setIsAdminLoginView(false);
      setIsAdminDashboardView(true);
    }
    return res;
  };

  const handleAdminAuthSuccess = (pin) => {
    store.loginAdminWithPin(pin);
    setIsAdminAuthModalOpen(false);
    setIsAdminDashboardView(true);
  };

  const handleAdminLogout = () => {
    store.logoutAdmin();
    setIsAdminDashboardView(false);
  };

  // If Admin Dashboard is open
  if (isAdmin && isAdminDashboardView) {
    return (
      <AdminDashboard
        orders={orders}
        charms={charms}
        products={products}
        collections={collections}
        isLiveDbConnected={isLiveDbConnected}
        isSyncingDb={isSyncingDb}
        onManualSync={() => store.syncRealtime()}
        onUpdateOrderStatus={(id, updates) => store.updateOrderStatus(id, updates)}
        onAddOrder={(orderData) => store.addManualOrder(orderData)}
        onDeleteOrder={(id) => store.deleteOrder(id)}
        onDeleteCustomerOrders={(ids) => store.deleteCustomerOrders(ids)}
        onAddCharm={(newC) => store.addCharm(newC)}
        onUpdateCharm={(id, up) => store.updateCharm(id, up)}
        onDeleteCharm={(id) => store.deleteCharm(id)}
        onRestockCharm={(id, amt) => store.restockCharm(id, amt)}
        onAddCollection={(item) => store.addCollectionItem(item)}
        onUpdateCollection={(id, updates) => store.updateCollectionItem(id, updates)}
        onDeleteCollection={(id) => store.deleteCollectionItem(id)}
        onResetDemoData={() => store.syncRealtime()}
        onLogout={handleAdminLogout}
        onBackToStore={() => setIsAdminDashboardView(false)}
      />
    );
  }

  // If Admin Login screen is open
  if (isAdminLoginView) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <AdminLogin
          onLogin={handleAdminLogin}
          onBackToStore={() => setIsAdminLoginView(false)}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Site Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setIsAdminAuthModalOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardView(true)}
        onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
      />

      {/* Main View Router */}
      <main style={{ flexGrow: 1 }}>
        {activeView === 'home' && (
          <HeroBanner
            collections={collections}
            onGoToStudio={handleGoToStudio}
            onGoToCatalog={handleGoToCatalog}
            onSelectCategory={handleSelectCategory}
            onSelectTemplate={handleSelectTemplateFromHome}
            onNavigateToCollection={handleNavigateToCollectionFromHero}
          />
        )}

        {activeView === 'collection' && (
          <CollectionPage
            items={collections}
            initialCategory={collectionCategory}
            initialItem={collectionItem}
            onCustomizeItem={handleCustomizeRecItem}
            onAddToCart={handleAddToCart}
            onNavigateHome={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeView === 'frames' && (
          <div style={{ paddingTop: '24px', paddingBottom: '60px' }}>
            <div className="container" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setActiveView('collection');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  ← Kembali ke Koleksi
                </button>
                {bundlingSession && (
                  <div
                    style={{
                      background: 'rgba(79, 70, 229, 0.1)',
                      border: '1px solid rgba(79, 70, 229, 0.3)',
                      borderRadius: 'var(--radius-full)',
                      padding: '6px 16px',
                      fontSize: '0.85rem',
                      color: '#4F46E5',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>
                      {bundlingSession.bundleType === 2 ? (
                        bundlingSession.bundle2ActiveBagcharm === 2 ? (
                          <>🎁 <strong>Paket Bundling 2:</strong> Pilih desain frame untuk <strong>Bagcharm 2</strong> (Bagcharm 1 ✓ Sudah Siap)</>
                        ) : (
                          <>🎁 <strong>Paket Bundling 2:</strong> Pilih desain frame untuk <strong>Bagcharm 1</strong></>
                        )
                      ) : (
                        <>🎁 <strong>Paket Bundling 3:</strong> Pilih desain frame untuk Bagcharm pasangan Anda</>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBundlingSession(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        textDecoration: 'underline',
                        marginLeft: '4px'
                      }}
                    >
                      Batalkan Bundling
                    </button>
                  </div>
                )}
              </div>
            </div>
            <FrameLayoutSelector
              onSelectTemplate={handleSelectTemplateFromHome}
              selectedTemplateId={selectedTemplate?.id}
            />
          </div>
        )}

        {activeView === 'studio' && (
          <div style={{ paddingTop: '20px', paddingBottom: '60px' }}>
            <CustomizerStudio
              products={products}
              charms={charms}
              cordColors={colors}
              onAddToCart={handleAddToCart}
              initialConfig={studioPresetConfig}
              onResetPreset={() => setStudioPresetConfig(null)}
              onBackToFrames={handleBackToFramesFromStudio}
              currentTemplate={selectedTemplate}
              bundlingSession={bundlingSession}
              onClearBundlingSession={() => setBundlingSession(null)}
              onGoToFrameForBagcharm2={handleGoToFrameForBagcharm2}
              studioDraft={studioDraft}
            />
          </div>
        )}

        {activeView === 'catalog' && (
          <div style={{ paddingTop: '20px' }}>
            <AccessoriesCatalog
              onAddToCart={handleAddToCart}
            />
            <PresetCatalog
              presets={presets}
              onRemixPreset={handleRemixPreset}
            />
          </div>
        )}
      </main>

      {/* Site Footer */}
      <Footer onNavigate={setActiveView} />

      {/* Cart Modal */}
      {isCartOpen && (
        <CartModal
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onProceedCheckout={handleProceedCheckout}
        />
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={checkoutItems.length > 0 ? checkoutItems : cart}
          onCreateOrder={handleCreateOrder}
        />
      )}

      {/* Admin Authorization Modal (Screenshot 2 Match) */}
      {isAdminAuthModalOpen && (
        <AdminAuthModal
          isOpen={isAdminAuthModalOpen}
          onClose={() => setIsAdminAuthModalOpen(false)}
          onSuccess={handleAdminAuthSuccess}
        />
      )}

      {/* Floating WhatsApp Quick Action Button (Image 2 Reference Match) */}
      <a
        href="https://wa.me/6281318409891?text=Halo%20Tiny%20Tale%2C%20saya%20ingin%20tanya%20dan%20pesan%20aksesoris%20custom"
        target="_blank"
        rel="noopener noreferrer"
        className="wa-floating-btn"
        title="Pesan via WhatsApp (+62 813-1840-9891)"
        aria-label="Pesan via WhatsApp (+62 813-1840-9891)"
      >
        <span className="wa-floating-tooltip">Pesan via WhatsApp</span>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.3z" />
        </svg>
      </a>
    </div>
  );
}
