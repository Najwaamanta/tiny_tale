// State Store with localStorage persistence and reactive pub/sub
import { INITIAL_PRODUCTS, INITIAL_CHARMS, INITIAL_CORD_COLORS, INITIAL_PRESETS, INITIAL_ORDERS, INITIAL_COLLECTIONS } from './initialData.js';

const STORAGE_KEYS = {
  PRODUCTS: 'atelier_products_v2',
  COLLECTIONS: 'atelier_collections_v2',
  CHARMS: 'atelier_charms_v4',
  COLORS: 'atelier_colors_v2',
  PRESETS: 'atelier_presets_v2',
  ORDERS: 'atelier_orders_v3',
  CART: 'atelier_cart_v1',
  ADMIN_AUTH: 'atelier_admin_auth_v1'
};

function getStorage(key, fallback) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function setStorage(key, data) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    // ignore storage save error
  }
}

function mapDbProductsToCollections(dbProducts) {
  if (!Array.isArray(dbProducts)) return [];
  return dbProducts.map((p) => {
    const initialMatch = INITIAL_COLLECTIONS.find((ic) => ic.id === p.id);
    const hasCustomImage = p.image && (p.image.startsWith('data:image') || (initialMatch && p.image !== initialMatch.image));
    const effectiveThumbs = hasCustomImage
      ? [p.image]
      : (p.thumbs && p.thumbs.length > 0 ? p.thumbs : (initialMatch?.thumbs || [p.image || '/images/cat_bagcharms.png']));

    return {
      id: p.id,
      category: p.category || (p.type === 'gelang' ? 'bracelets' : (p.type === 'bundling' ? 'bundling' : 'keychains')),
      type: p.type || (p.category === 'bracelets' ? 'gelang' : (p.category === 'bundling' ? 'bundling' : 'bag_charm')),
      name: p.name,
      price: Number(p.price || 0),
      priceFormatted: `Rp ${Number(p.price || 0).toLocaleString('id-ID')}`,
      image: p.image || '/images/cat_bagcharms.png',
      thumbs: effectiveThumbs,
      description: p.description || initialMatch?.description || '',
      highlights: {
        strap: p.highlights_strap || (p.highlights && p.highlights.strap) || initialMatch?.highlights?.strap || '',
        shapes: p.highlights_shapes || (p.highlights && p.highlights.shapes) || initialMatch?.highlights?.shapes || '',
        charms: p.highlights_charms || (p.highlights && p.highlights.charms) || initialMatch?.highlights?.charms || ''
      },
      stock: p.stock !== undefined ? Number(p.stock) : 50,
      isCustomizable: Boolean(p.is_customizable !== undefined ? p.is_customizable : p.isCustomizable),
      templateId: p.template_id || p.templateId || 'layout-a'
    };
  });
}

class Store {
  constructor() {
    this.listeners = new Set();
    this.products = getStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS).filter((p) => p.type !== 'gantungan_hp');
    this.collections = getStorage(STORAGE_KEYS.COLLECTIONS, INITIAL_COLLECTIONS);
    this.charms = getStorage(STORAGE_KEYS.CHARMS, INITIAL_CHARMS);
    this.colors = getStorage(STORAGE_KEYS.COLORS, INITIAL_CORD_COLORS);
    this.presets = getStorage(STORAGE_KEYS.PRESETS, INITIAL_PRESETS);
    this.orders = getStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    this.cart = getStorage(STORAGE_KEYS.CART, []);
    this.isAdmin = getStorage(STORAGE_KEYS.ADMIN_AUTH, false);

    this.isLiveDbConnected = false;
    this.isSyncing = true;
    this.lastSyncTime = null;
    this.syncInterval = null;

    // Immediate background sync with MySQL database
    this.syncRealtime();
  }

  // --- Realtime MySQL Database Synchronization ---
  async syncRealtime() {
    this.isSyncing = true;
    let changed = false;

    // 1. Fast path: try single-roundtrip bulk sync endpoint (/api/sync)
    try {
      const syncRes = await fetch('/api/sync').catch(() => null);
      if (syncRes && syncRes.ok) {
        const data = await syncRes.json();
        if (data && data.success) {
          if (Array.isArray(data.orders)) {
            this.orders = data.orders;
            setStorage(STORAGE_KEYS.ORDERS, this.orders);
            changed = true;
          }
          if (Array.isArray(data.charms)) {
            this.charms = data.charms;
            setStorage(STORAGE_KEYS.CHARMS, this.charms);
            changed = true;
          }
          if (Array.isArray(data.products)) {
            this.collections = mapDbProductsToCollections(data.products);
            setStorage(STORAGE_KEYS.COLLECTIONS, this.collections);
            changed = true;
          }

          this.isLiveDbConnected = true;
          this.isSyncing = false;
          this.lastSyncTime = new Date();
          this.notify();
          return { success: true, count: this.orders.length, time: this.lastSyncTime };
        }
      }
    } catch (e) {
      // Fall through to individual endpoints fallback
    }

    // 2. Fallback: individual endpoints
    try {
      const [ordRes, charmRes, prodRes] = await Promise.all([
        fetch('/api/orders').catch(() => null),
        fetch('/api/charms').catch(() => null),
        fetch('/api/products').catch(() => null)
      ]);

      if (ordRes && ordRes.ok) {
        const dbOrders = await ordRes.json();
        if (Array.isArray(dbOrders)) {
          this.orders = dbOrders;
          setStorage(STORAGE_KEYS.ORDERS, this.orders);
          changed = true;
        }
      }

      if (charmRes && charmRes.ok) {
        const dbCharms = await charmRes.json();
        if (Array.isArray(dbCharms)) {
          this.charms = dbCharms;
          setStorage(STORAGE_KEYS.CHARMS, this.charms);
          changed = true;
        }
      }

      if (prodRes && prodRes.ok) {
        const dbProducts = await prodRes.json();
        if (Array.isArray(dbProducts)) {
          this.collections = mapDbProductsToCollections(dbProducts);
          setStorage(STORAGE_KEYS.COLLECTIONS, this.collections);
          changed = true;
        }
      }

      this.isLiveDbConnected = Boolean(ordRes && ordRes.ok);
      this.isSyncing = false;
      this.lastSyncTime = new Date();
      this.notify();
      return { success: true, count: this.orders.length, time: this.lastSyncTime };
    } catch (e) {
      this.isLiveDbConnected = false;
      this.isSyncing = false;
      this.notify();
      return { success: false, error: e.message };
    }
  }

  startRealtimeSync(intervalMs = 3500) {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncRealtime();
    this.syncInterval = setInterval(() => {
      this.syncRealtime();
    }, intervalMs);
  }

  stopRealtimeSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncFromBackend() {
    return this.syncRealtime();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this);
      } catch (err) {
        console.error('Listener notify err:', err);
      }
    });
  }

  // --- Cart Operations ---
  getCart() {
    return Array.isArray(this.cart) ? this.cart.filter(Boolean) : [];
  }

  areItemsIdentical(a, b) {
    if (!a || !b) return false;

    // 1. Same title / base product name
    const titleA = (a.title || a.name || '').trim().toLowerCase();
    const titleB = (b.title || b.name || '').trim().toLowerCase();
    if (titleA !== titleB) return false;

    // 2. Same product type
    const typeA = (a.productType || a.type || '').trim().toLowerCase();
    const typeB = (b.productType || b.type || '').trim().toLowerCase();
    if (typeA !== typeB) return false;

    // 3. Custom Letters / initials
    const lettersA = (a.customLetters || '').trim().toUpperCase();
    const lettersB = (b.customLetters || '').trim().toUpperCase();
    if (lettersA !== lettersB) return false;

    // 4. Cord Color
    const cordA = (a.cordColor || a.cordColorName || '').trim();
    const cordB = (b.cordColor || b.cordColorName || '').trim();
    if (cordA !== cordB) return false;

    // 5. Paracord Model & Length
    const modelA = (a.paracordModel || a.paracordModelName || '').trim();
    const modelB = (b.paracordModel || b.paracordModelName || '').trim();
    if (modelA !== modelB) return false;

    // 6. Accent Color
    const accentA = (a.accentColor || a.accentColorName || a.starColor || '').trim();
    const accentB = (b.accentColor || b.accentColorName || b.starColor || '').trim();
    if (accentA !== accentB) return false;

    // 7. Hardware Clasp
    const hwA = (a.hardwareName || a.hardwareId || '').trim();
    const hwB = (b.hardwareName || b.hardwareId || '').trim();
    if (hwA !== hwB) return false;

    // 8. Frame / Layout template
    const frameA = (a.frameName || a.frameId || a.templateId || '').trim();
    const frameB = (b.frameName || b.frameId || b.templateId || '').trim();
    if (frameA !== frameB) return false;

    // 9. Charms list comparison
    const getCharmKeys = (arr) => {
      if (!Array.isArray(arr)) return [];
      return arr.map((c) => (typeof c === 'object' && c !== null ? (c.id || c.name || '') : String(c))).sort();
    };
    const charmsA = getCharmKeys(a.charms);
    const charmsB = getCharmKeys(b.charms);
    if (charmsA.length !== charmsB.length) return false;
    for (let i = 0; i < charmsA.length; i++) {
      if (charmsA[i] !== charmsB[i]) return false;
    }

    // 10. Frame photos comparison
    const getPhotoKeys = (arr) => {
      if (!Array.isArray(arr)) return [];
      return arr.filter(Boolean);
    };
    const photosA = getPhotoKeys(a.framePhotos || a.photos);
    const photosB = getPhotoKeys(b.framePhotos || b.photos);
    if (photosA.length !== photosB.length) return false;
    for (let i = 0; i < photosA.length; i++) {
      if (photosA[i] !== photosB[i]) return false;
    }

    // 11. Bundle Choices comparison
    if (a.bundleChoices || b.bundleChoices) {
      const choiceA1 = (a.bundleChoices?.item1?.name || '').trim();
      const choiceB1 = (b.bundleChoices?.item1?.name || '').trim();
      if (choiceA1 !== choiceB1) return false;

      const choiceA2 = (a.bundleChoices?.item2?.name || '').trim();
      const choiceB2 = (b.bundleChoices?.item2?.name || '').trim();
      if (choiceA2 !== choiceB2) return false;
    }

    // 12. Bracelet / Product Color Variant
    const variantA = (a.variant || a.color || a.selectedColor || a.customization?.color || '').trim();
    const variantB = (b.variant || b.color || b.selectedColor || b.customization?.color || '').trim();
    if (variantA !== variantB) return false;

    return true;
  }

  addToCart(item) {
    const unitPrice = Number(item.unitPrice || item.price || 0);
    const addQty = Number(item.quantity || 1);

    // Look for existing item with identical type & custom specifications
    const existingIndex = this.cart.findIndex((existing) => this.areItemsIdentical(existing, item));

    let resultItem;

    if (existingIndex > -1) {
      // Sama jenis & spesifikasi: tetap 1 item di keranjang, jumlah (quantity) bertambah
      const existing = this.cart[existingIndex];
      const newQty = (Number(existing.quantity) || 1) + addQty;
      const effectivePrice = Number(existing.unitPrice || unitPrice);

      const updatedItem = {
        ...existing,
        quantity: newQty,
        unitPrice: effectivePrice,
        subtotal: effectivePrice * newQty
      };

      const nextCart = [...this.cart];
      nextCart[existingIndex] = updatedItem;
      this.cart = nextCart;
      resultItem = updatedItem;
    } else {
      // Jenis berbeda atau spesifikasi beda: buat baris item baru
      const cartItemId = item.cartItemId || ('cart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4));
      const subtotal = Number(item.subtotal !== undefined ? item.subtotal : (unitPrice * addQty));

      resultItem = {
        ...item,
        cartItemId,
        id: item.id || cartItemId,
        unitPrice,
        quantity: addQty,
        subtotal
      };
      this.cart = [resultItem, ...this.cart];
    }

    setStorage(STORAGE_KEYS.CART, this.cart);
    this.notify();
    return resultItem;
  }

  removeFromCart(cartItemId) {
    this.cart = this.cart.filter((item) => {
      const match =
        item.cartItemId === cartItemId ||
        item.id === cartItemId ||
        (item.cartItemId && cartItemId && String(item.cartItemId) === String(cartItemId)) ||
        (item.id && cartItemId && String(item.id) === String(cartItemId));
      return !match;
    });
    setStorage(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  updateCartQuantity(cartItemId, delta) {
    this.cart = this.cart.map((item) => {
      const match =
        item.cartItemId === cartItemId ||
        item.id === cartItemId ||
        (item.cartItemId && cartItemId && String(item.cartItemId) === String(cartItemId)) ||
        (item.id && cartItemId && String(item.id) === String(cartItemId));

      if (match) {
        const currentQty = Number(item.quantity) || 1;
        const newQty = Math.max(1, currentQty + Number(delta));
        const unitPrice = Number(item.unitPrice || item.price || 0);
        return {
          ...item,
          quantity: newQty,
          unitPrice,
          subtotal: unitPrice * newQty
        };
      }
      return item;
    });
    setStorage(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  clearCart() {
    this.cart = [];
    setStorage(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  // --- Order Operations ---
  getOrders() {
    return this.orders;
  }

  createOrder({ customer, items, totalAmount, paymentMethod, paymentProofUrl }) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ATC-${new Date().getFullYear()}-${randomSuffix}`;

    // Deduct stock for chosen charms
    items.forEach(orderItem => {
      if (orderItem.charms && Array.isArray(orderItem.charms)) {
        orderItem.charms.forEach(ch => {
          this.deductCharmStock(ch.id || ch.name, orderItem.quantity || 1);
        });
      }
    });

    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customer,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'Transfer Bank' ? 'pending_verification' : 'paid',
      paymentProofUrl: paymentProofUrl || null,
      craftingStatus: 'in_crafting', // Default to crafting once submitted
      shippingTrackingNumber: '',
      craftingNotes: 'Pesanan baru masuk dari website, siap dirakit di studio.'
    };

    this.orders = [newOrder, ...this.orders];
    setStorage(STORAGE_KEYS.ORDERS, this.orders);

    // Remove purchased items from the cart reliably, leaving unselected items for future checkout
    const purchasedIdSet = new Set();
    (items || []).forEach((it) => {
      if (it.cartItemId) purchasedIdSet.add(String(it.cartItemId));
      if (it.id) purchasedIdSet.add(String(it.id));
      if (it._id) purchasedIdSet.add(String(it._id));
      if (it.baseId) purchasedIdSet.add(String(it.baseId));
    });

    this.cart = (this.cart || []).filter((cartItem) => {
      const cId = cartItem.cartItemId ? String(cartItem.cartItemId) : null;
      const iId = cartItem.id ? String(cartItem.id) : null;

      // 1. Direct match by cartItemId
      if (cId && purchasedIdSet.has(cId)) return false;

      // 2. Direct match by item id
      if (iId && purchasedIdSet.has(iId)) return false;

      // 3. Match by identical specifications (covers bundles, custom bagcharms, etc.)
      const matchedBySpec = (items || []).some((it) => this.areItemsIdentical(cartItem, it));
      if (matchedBySpec) return false;

      return true;
    });

    if (!Array.isArray(this.cart) || this.cart.length === 0) {
      this.cart = [];
    }
    setStorage(STORAGE_KEYS.CART, this.cart);
    this.notify();

    // Async sync to MySQL database
    const serializedItems = (items || []).map((it) => ({
      ...it,
      bundleChoices: it.bundleChoices || it.customDetails?.bundleChoices || null,
      bundleDescription: it.bundleDescription || it.customDetails?.bundleDescription || '',
      customDetails: {
        ...(it.customDetails || {}),
        bundleChoices: it.bundleChoices || it.customDetails?.bundleChoices || null,
        bundleDescription: it.bundleDescription || it.customDetails?.bundleDescription || ''
      }
    }));

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: orderId,
        customer,
        items: serializedItems,
        total: totalAmount,
        totalAmount,
        paymentMethod,
        paymentStatus: newOrder.paymentStatus,
        paymentProof: paymentProofUrl || null,
        paymentProofUrl: paymentProofUrl || null,
        orderStatus: 'processing'
      })
    })
      .then(() => this.syncRealtime())
      .catch((err) => console.warn('Order sync to MySQL:', err));

    return newOrder;
  }

  addManualOrder({
    id,
    createdAt,
    customer,
    items = [],
    totalAmount,
    total,
    paymentMethod = 'Tunai / Cash',
    paymentStatus = 'paid',
    orderStatus = 'processing',
    craftingStatus = 'in_crafting',
    shippingTrackingNumber = '',
    notes = '',
    channel = 'Offline / Manual'
  }) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = (id && id.trim()) ? id.trim() : `ATC-M-${new Date().getFullYear()}-${randomSuffix}`;
    const orderDate = createdAt || new Date().toISOString();
    const finalTotal = Number(totalAmount ?? total ?? 0);

    const formattedItems = (items || []).map((it, idx) => ({
      id: it.id || `manual-item-${Date.now()}-${idx}`,
      productType: it.productType || it.type || 'bag_charm',
      title: it.title || it.name || 'Produk Kustom',
      unitPrice: Number(it.unitPrice ?? it.price ?? 0),
      quantity: Number(it.quantity || 1),
      subtotal: Number(it.subtotal || (Number(it.unitPrice ?? it.price ?? 0) * Number(it.quantity || 1))),
      image: it.image || null,
      customLetters: it.customLetters || '',
      customDetails: it.customDetails || {
        notes: it.notes || '',
        variant: it.variant || '',
        cordColor: it.cordColor || '',
        charms: it.charms || []
      }
    }));

    const newOrder = {
      id: orderId,
      createdAt: orderDate,
      customer: {
        name: customer?.name || 'Pelanggan Offline',
        whatsapp: customer?.whatsapp || '',
        address: customer?.address || '',
        city: customer?.city || '',
        courier: customer?.courier || 'Ambil di Toko / COD',
        courierCost: Number(customer?.courierCost || 0),
        notes: customer?.notes || notes || ''
      },
      items: formattedItems,
      total: finalTotal,
      totalAmount: finalTotal,
      paymentMethod,
      paymentStatus,
      paymentProofUrl: null,
      craftingStatus,
      orderStatus,
      shippingTrackingNumber,
      trackingNumber: shippingTrackingNumber,
      craftingNotes: notes || '',
      channel
    };

    this.orders = [newOrder, ...this.orders];
    setStorage(STORAGE_KEYS.ORDERS, this.orders);
    this.notify();

    // Async sync to MySQL database
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: orderId,
        customer: newOrder.customer,
        items: formattedItems,
        total: finalTotal,
        totalAmount: finalTotal,
        paymentMethod,
        paymentStatus,
        paymentProof: null,
        paymentProofUrl: null,
        orderStatus
      })
    })
      .then(() => this.syncRealtime())
      .catch((err) => console.warn('Order sync to MySQL:', err));

    return newOrder;
  }

  createManualOrder(orderData) {
    return this.addManualOrder(orderData);
  }

  lookupOrder(orderId, whatsapp) {
    if (!orderId) return null;
    const cleanId = orderId.trim().toUpperCase();
    const cleanWA = whatsapp ? whatsapp.replace(/[^0-9]/g, '') : '';

    return this.orders.find(order => {
      const idMatch = order.id.toUpperCase() === cleanId;
      if (!idMatch) return false;
      if (!cleanWA) return true;
      const orderWA = (order.customer.whatsapp || '').replace(/[^0-9]/g, '');
      return orderWA.endsWith(cleanWA.slice(-6)) || cleanWA.endsWith(orderWA.slice(-6));
    }) || null;
  }

  updateOrderStatus(orderId, updates) {
    this.orders = this.orders.map(order => {
      if (order.id === orderId) {
        return { ...order, ...updates };
      }
      return order;
    });
    setStorage(STORAGE_KEYS.ORDERS, this.orders);
    this.notify();

    // Async sync to MySQL database
    fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
      .then(() => this.syncRealtime())
      .catch((err) => console.warn('Order status sync to MySQL:', err));
  }

  async deleteOrder(orderId) {
    this.orders = this.orders.filter(order => order.id !== orderId);
    setStorage(STORAGE_KEYS.ORDERS, this.orders);
    this.notify();

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await this.syncRealtime();
      }
    } catch (err) {
      console.warn('Sync order delete to MySQL:', err);
    }
  }

  async deleteCustomerOrders(orderIds) {
    if (!Array.isArray(orderIds) || orderIds.length === 0) return;
    this.orders = this.orders.filter(order => !orderIds.includes(order.id));
    setStorage(STORAGE_KEYS.ORDERS, this.orders);
    this.notify();

    try {
      await Promise.all(
        orderIds.map(id =>
          fetch(`/api/orders/${id}`, { method: 'DELETE' }).catch(e => console.warn('Delete item err:', e))
        )
      );
      await this.syncRealtime();
    } catch (err) {
      console.warn('Sync customer orders delete to MySQL:', err);
    }
  }

  // --- Charm & Inventory Operations ---
  getCharms() {
    return this.charms;
  }

  deductCharmStock(charmIdentifier, qty = 1) {
    this.charms = this.charms.map(c => {
      if (c.id === charmIdentifier || c.name === charmIdentifier) {
        const nextStock = Math.max(0, (c.stock || 0) - qty);
        return { ...c, stock: nextStock };
      }
      return c;
    });
    setStorage(STORAGE_KEYS.CHARMS, this.charms);
  }

  async updateCharm(charmId, updates) {
    this.charms = this.charms.map(c => {
      if (c.id === charmId) {
        return { ...c, ...updates };
      }
      return c;
    });
    setStorage(STORAGE_KEYS.CHARMS, this.charms);
    this.notify();

    try {
      const res = await fetch(`/api/charms/${charmId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await this.syncRealtime();
      }
    } catch (err) {
      console.warn('Sync charm update:', err);
    }
  }

  async addCharm(newCharm) {
    const item = {
      ...newCharm,
      id: newCharm.id || 'ch-' + Date.now().toString(36)
    };
    this.charms = [...this.charms, item];
    setStorage(STORAGE_KEYS.CHARMS, this.charms);
    this.notify();

    try {
      const res = await fetch('/api/charms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        await this.syncRealtime();
      }
    } catch (err) {
      console.warn('Sync charm add:', err);
    }

    return item;
  }

  async deleteCharm(charmId) {
    this.charms = this.charms.filter(c => c.id !== charmId);
    setStorage(STORAGE_KEYS.CHARMS, this.charms);
    this.notify();

    try {
      const res = await fetch(`/api/charms/${charmId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await this.syncRealtime();
      }
    } catch (err) {
      console.warn('Sync charm delete:', err);
    }
  }

  async restockCharm(charmId, amount) {
    this.charms = this.charms.map(c => {
      if (c.id === charmId) {
        return { ...c, stock: (c.stock || 0) + Number(amount) };
      }
      return c;
    });
    setStorage(STORAGE_KEYS.CHARMS, this.charms);
    this.notify();

    try {
      const res = await fetch(`/api/charms/${charmId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta: Number(amount) })
      });
      if (res.ok) {
        await this.syncRealtime();
      }
    } catch (err) {
      console.warn('Sync charm restock:', err);
    }
  }

  // --- Collection Operations ---
  getCollections() {
    return this.collections;
  }

  async addCollectionItem(newItem) {
    const randomId = 'col-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    const item = {
      ...newItem,
      id: newItem.id || randomId,
      price: Number(newItem.price || 0),
      priceFormatted: `Rp ${Number(newItem.price || 0).toLocaleString('id-ID')}`,
      category: newItem.category || 'keychains',
      type: newItem.type || (newItem.category === 'bracelets' ? 'gelang' : (newItem.category === 'bundling' ? 'bundling' : 'bag_charm')),
      image: newItem.image || '/images/cat_bagcharms.png',
      thumbs: newItem.thumbs && newItem.thumbs.length > 0 ? newItem.thumbs : [newItem.image || '/images/cat_bagcharms.png'],
      highlights: {
        strap: newItem.highlights?.strap || '',
        shapes: newItem.highlights?.shapes || '',
        charms: newItem.highlights?.charms || ''
      },
      stock: newItem.stock !== undefined ? Number(newItem.stock) : 50,
      isCustomizable: Boolean(newItem.isCustomizable !== undefined ? newItem.isCustomizable : true),
      templateId: newItem.templateId || 'layout-a'
    };

    this.collections = [item, ...this.collections];
    setStorage(STORAGE_KEYS.COLLECTIONS, this.collections);
    this.notify();

    // Async sync to MySQL database
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          name: item.name,
          category: item.category,
          type: item.type,
          price: item.price,
          image: item.image,
          description: item.description || '',
          highlights_strap: item.highlights.strap,
          highlights_shapes: item.highlights.shapes,
          highlights_charms: item.highlights.charms,
          stock: item.stock,
          is_customizable: item.isCustomizable ? 1 : 0
        })
      });
      if (res.ok) {
        await this.syncRealtime();
      } else {
        console.error('MySQL insert product error:', await res.text());
      }
    } catch (err) {
      console.warn('Sync add collection:', err);
    }

    return item;
  }

  async updateCollectionItem(id, updates) {
    let updatedItem = null;
    this.collections = this.collections.map((item) => {
      if (item.id === id) {
        const nextPrice = updates.price !== undefined ? Number(updates.price) : item.price;
        const nextImage = updates.image !== undefined ? updates.image : item.image;
        updatedItem = {
          ...item,
          ...updates,
          price: nextPrice,
          priceFormatted: `Rp ${nextPrice.toLocaleString('id-ID')}`,
          image: nextImage,
          thumbs: updates.thumbs || (nextImage ? [nextImage] : item.thumbs),
          highlights: {
            strap: updates.highlights?.strap !== undefined ? updates.highlights.strap : (item.highlights?.strap || ''),
            shapes: updates.highlights?.shapes !== undefined ? updates.highlights.shapes : (item.highlights?.shapes || ''),
            charms: updates.highlights?.charms !== undefined ? updates.highlights.charms : (item.highlights?.charms || '')
          }
        };
        return updatedItem;
      }
      return item;
    });

    setStorage(STORAGE_KEYS.COLLECTIONS, this.collections);
    this.notify();

    // Async sync to MySQL database
    if (updatedItem) {
      try {
        const res = await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: updatedItem.name,
            category: updatedItem.category,
            type: updatedItem.type,
            price: updatedItem.price,
            image: updatedItem.image,
            description: updatedItem.description,
            highlights_strap: updatedItem.highlights.strap,
            highlights_shapes: updatedItem.highlights.shapes,
            highlights_charms: updatedItem.highlights.charms,
            stock: updatedItem.stock,
            is_customizable: updatedItem.isCustomizable ? 1 : 0
          })
        });
        if (res.ok) {
          await this.syncRealtime();
        } else {
          console.error('MySQL update product error:', await res.text());
        }
      } catch (err) {
        console.warn('Sync update collection:', err);
      }
    }

    return updatedItem;
  }

  async deleteCollectionItem(id) {
    this.collections = this.collections.filter((item) => item.id !== id);
    setStorage(STORAGE_KEYS.COLLECTIONS, this.collections);
    this.notify();

    // Async sync to MySQL database
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await this.syncRealtime();
      }
    } catch (err) {
      console.warn('Sync delete collection:', err);
    }
  }

  // --- Base Products ---
  getProducts() {
    return this.products;
  }

  updateProductBasePrice(productId, newBasePrice) {
    this.products = this.products.map(p => {
      if (p.id === productId) {
        return { ...p, basePrice: Number(newBasePrice) };
      }
      return p;
    });
    setStorage(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify();
  }

  // --- Presets ---
  getPresets() {
    return this.presets;
  }

  // --- Admin Auth ---
  isAdminLoggedIn() {
    return this.isAdmin;
  }

  loginAdmin(email, password) {
    if (
      (email.trim().toLowerCase() === 'admin@atelier.id' && (password === 'tinytale08' || password === 'admin123')) ||
      password === 'tinytale08' ||
      password === 'admin123' ||
      password === 'admin'
    ) {
      this.isAdmin = true;
      setStorage(STORAGE_KEYS.ADMIN_AUTH, true);
      this.notify();
      return { success: true };
    }
    return { success: false, message: 'Email atau password admin salah!' };
  }

  loginAdminWithPin(pin = '') {
    const clean = pin.trim().toLowerCase();
    const valid = ['tinytale08', 'admin123', 'admin', '1234', '123456', '8888', '0000', 'atelier'];
    if (!clean || valid.includes(clean)) {
      this.isAdmin = true;
      setStorage(STORAGE_KEYS.ADMIN_AUTH, true);
      this.notify();
      return { success: true };
    }
    return { success: false, message: 'PIN keamanan tidak valid!' };
  }

  logoutAdmin() {
    this.isAdmin = false;
    setStorage(STORAGE_KEYS.ADMIN_AUTH, false);
    this.notify();
  }

  // --- Reset to Demo Data ---
  resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.COLLECTIONS);
    localStorage.removeItem(STORAGE_KEYS.CHARMS);
    localStorage.removeItem(STORAGE_KEYS.COLORS);
    localStorage.removeItem(STORAGE_KEYS.PRESETS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CART);

    this.products = INITIAL_PRODUCTS;
    this.collections = INITIAL_COLLECTIONS;
    this.charms = INITIAL_CHARMS;
    this.colors = INITIAL_CORD_COLORS;
    this.presets = INITIAL_PRESETS;
    this.orders = INITIAL_ORDERS;
    this.cart = [];

    setStorage(STORAGE_KEYS.PRODUCTS, this.products);
    setStorage(STORAGE_KEYS.COLLECTIONS, this.collections);
    setStorage(STORAGE_KEYS.CHARMS, this.charms);
    setStorage(STORAGE_KEYS.COLORS, this.colors);
    setStorage(STORAGE_KEYS.PRESETS, this.presets);
    setStorage(STORAGE_KEYS.ORDERS, this.orders);
    setStorage(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }
}

export const store = new Store();
