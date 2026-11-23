const dns = require('dns');
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Path normalizer: ensures /api routes work across local, Vercel, and Netlify Functions
app.use((req, res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '');
  }
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  next();
});

// Database configuration (supports localhost/Laragon & Filess.io/Aiven)
const isCloudOrSSL = process.env.DB_SSL === 'true' || 
  (process.env.DB_HOST && !['localhost', '127.0.0.1'].includes(process.env.DB_HOST));

const rawHost = process.env.DB_HOST || '127.0.0.1';
// Direct IPv4 mapping for Filess.io to eliminate Windows IPv6 latency & ETIMEDOUT
const dbHost = (rawHost === 'w0aeps.h.filess.io') ? '188.245.153.167' : rawHost;

const dbConfig = {
  host: dbHost,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'defaultdb',
  connectTimeout: 8000,
  ...(isCloudOrSSL ? { ssl: { rejectUnauthorized: false } } : {})
};

// Safe, stateless connection executor with auto-retry and backoff
// Ensures connections are NEVER left in 'Sleep' state, preventing ER_USER_LIMIT_REACHED (max 5 connections on Filess.io)
async function withConnection(fn, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    let conn = null;
    try {
      conn = await mysql.createConnection(dbConfig);
      return await fn(conn);
    } catch (err) {
      const isLimitErr = err.code === 'ER_USER_LIMIT_REACHED' || 
                         err.code === 'ETIMEDOUT' || 
                         err.code === 'PROTOCOL_CONNECTION_LOST' ||
                         (err.message && err.message.includes('max_user_connections'));
      if (attempt < retries && isLimitErr) {
        const delay = Math.floor(250 * Math.pow(1.8, attempt - 1) + Math.random() * 100);
        console.warn(`[Tiny Tale DB] Connection limit or timeout hit (attempt ${attempt}/${retries}). Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    } finally {
      if (conn) {
        try {
          await conn.end();
        } catch (e) {
          try { conn.destroy(); } catch (_) {}
        }
      }
    }
  }
}

// Single-query shortcut
async function dbQuery(sql, params = []) {
  return await withConnection(async (conn) => {
    return await conn.query(sql, params);
  });
}

// 1. Health & Database Check
app.get('/api/health', async (req, res) => {
  try {
    await dbQuery('SELECT 1 + 1 AS solution');
    res.json({ status: 'ok', database: process.env.DB_NAME || 'defaultdb', host: dbHost, connected: true });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 2. Products Catalog
app.get('/api/products', async (req, res) => {
  try {
    const products = await withConnection(async (conn) => {
      const [rows] = await conn.query('SELECT * FROM products ORDER BY created_at DESC');
      return rows;
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const {
      id,
      name,
      category,
      type,
      price,
      image,
      description,
      highlights_strap,
      highlights_shapes,
      highlights_charms,
      stock,
      is_customizable
    } = req.body;

    const prodId = id || `col-${Date.now()}`;
    const saved = await withConnection(async (conn) => {
      await conn.query(
        `INSERT INTO products 
          (id, name, category, type, price, image, description, highlights_strap, highlights_shapes, highlights_charms, stock, is_customizable)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          category = VALUES(category),
          type = VALUES(type),
          price = VALUES(price),
          image = VALUES(image),
          description = VALUES(description),
          highlights_strap = VALUES(highlights_strap),
          highlights_shapes = VALUES(highlights_shapes),
          highlights_charms = VALUES(highlights_charms),
          stock = VALUES(stock),
          is_customizable = VALUES(is_customizable)`,
        [
          prodId,
          name || 'Koleksi Baru',
          category || 'keychains',
          type || (category === 'bracelets' ? 'gelang' : 'bag_charm'),
          Number(price || 0),
          image || '/images/cat_bagcharms.png',
          description || '',
          highlights_strap || '',
          highlights_shapes || '',
          highlights_charms || '',
          stock !== undefined ? Number(stock) : 50,
          is_customizable ? 1 : 0
        ]
      );
      const [[row]] = await conn.query('SELECT * FROM products WHERE id = ?', [prodId]);
      return row;
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      type,
      price,
      image,
      description,
      highlights_strap,
      highlights_shapes,
      highlights_charms,
      stock,
      is_customizable
    } = req.body;

    const updated = await withConnection(async (conn) => {
      await conn.query(
        `UPDATE products SET
          name = COALESCE(?, name),
          category = COALESCE(?, category),
          type = COALESCE(?, type),
          price = COALESCE(?, price),
          image = COALESCE(?, image),
          description = COALESCE(?, description),
          highlights_strap = COALESCE(?, highlights_strap),
          highlights_shapes = COALESCE(?, highlights_shapes),
          highlights_charms = COALESCE(?, highlights_charms),
          stock = COALESCE(?, stock),
          is_customizable = COALESCE(?, is_customizable)
         WHERE id = ?`,
        [
          name,
          category,
          type,
          price !== undefined ? Number(price) : null,
          image,
          description,
          highlights_strap,
          highlights_shapes,
          highlights_charms,
          stock !== undefined ? Number(stock) : null,
          is_customizable !== undefined ? (is_customizable ? 1 : 0) : null,
          id
        ]
      );
      const [[row]] = await conn.query('SELECT * FROM products WHERE id = ?', [id]);
      return row;
    });

    res.json(updated);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbQuery('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Charms & Inventory
app.get('/api/charms', async (req, res) => {
  try {
    const charms = await withConnection(async (conn) => {
      const [rows] = await conn.query('SELECT * FROM charms ORDER BY id ASC');
      return rows;
    });
    res.json(charms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/charms', async (req, res) => {
  try {
    const { id, name, category, price, stock, icon, image, description } = req.body;
    const charmId = id || `ch-${Date.now()}`;
    const saved = await withConnection(async (conn) => {
      await conn.query(
        `INSERT INTO charms (id, name, category, price, stock, icon, image, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          category = VALUES(category),
          price = VALUES(price),
          stock = VALUES(stock),
          icon = VALUES(icon),
          image = VALUES(image),
          description = VALUES(description)`,
        [
          charmId,
          name || 'Charm Baru',
          category || 'general',
          Number(price || 5000),
          Number(stock !== undefined ? stock : 50),
          icon || '★',
          image || null,
          description || ''
        ]
      );
      const [[row]] = await conn.query('SELECT * FROM charms WHERE id = ?', [charmId]);
      return row;
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error('Error saving charm:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/charms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, icon, image, description } = req.body;
    const updated = await withConnection(async (conn) => {
      await conn.query(
        `UPDATE charms SET
          name = COALESCE(?, name),
          category = COALESCE(?, category),
          price = COALESCE(?, price),
          stock = COALESCE(?, stock),
          icon = COALESCE(?, icon),
          image = COALESCE(?, image),
          description = COALESCE(?, description)
         WHERE id = ?`,
        [
          name,
          category,
          price !== undefined ? Number(price) : null,
          stock !== undefined ? Number(stock) : null,
          icon,
          image,
          description,
          id
        ]
      );
      const [[row]] = await conn.query('SELECT * FROM charms WHERE id = ?', [id]);
      return row;
    });

    res.json(updated);
  } catch (err) {
    console.error('Error updating charm:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/charms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbQuery('DELETE FROM charms WHERE id = ?', [id]);
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting charm:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/charms/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { delta, stock } = req.body;
    const updated = await withConnection(async (conn) => {
      if (stock !== undefined) {
        await conn.query('UPDATE charms SET stock = ? WHERE id = ?', [stock, id]);
      } else if (delta !== undefined) {
        await conn.query('UPDATE charms SET stock = GREATEST(0, stock + ?) WHERE id = ?', [delta, id]);
      }
      const [[row]] = await conn.query('SELECT * FROM charms WHERE id = ?', [id]);
      return row;
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to format orders and their line items
function formatOrders(orders, items) {
  return orders.map((order) => {
    const orderItems = items
      .filter((it) => it.order_id === order.id)
      .map((it) => {
        let cDetails = {};
        try {
          cDetails = typeof it.custom_details === 'string' ? JSON.parse(it.custom_details) : (it.custom_details || {});
        } catch (e) {
          cDetails = {};
        }

        // Extract frame photos and avoid duplicating them inside customDetails
        const framePhotos = cDetails.framePhotos || it.framePhotos || [];
        const cleanDetails = { ...cDetails };
        delete cleanDetails.framePhotos;

        const isGelang = it.product_type === 'gelang' || (it.title || '').toLowerCase().includes('gelang') || (it.title || '').toLowerCase().includes('bracelet');
        const safeImage = (isGelang && it.image && it.image.length > 5000) ? null : it.image;

        return {
          id: it.id,
          productType: it.product_type,
          title: it.title,
          unitPrice: it.unit_price,
          quantity: it.quantity,
          subtotal: it.subtotal,
          image: safeImage,
          bundleChoices: cleanDetails.bundleChoices || it.bundleChoices || null,
          bundleDescription: cleanDetails.bundleDescription || it.bundleDescription || '',
          variant: cleanDetails.variant || it.variant || '',
          color: cleanDetails.color || it.color || '',
          customDetails: cleanDetails,
          framePhotos: framePhotos,
          frameId: cleanDetails.frameId || it.frameId || null,
          frameName: cleanDetails.frameName || it.frameName || '',
          baseName: cleanDetails.baseName || it.baseName || '',
          cordColor: cleanDetails.cordColor || it.cordColor || '',
          cordColorName: cleanDetails.cordColorName || it.cordColorName || '',
          accentColor: cleanDetails.accentColor || it.accentColor || '',
          accentColorName: cleanDetails.accentColorName || it.accentColorName || '',
          starColor: cleanDetails.starColor || it.starColor || '',
          starColorName: cleanDetails.starColorName || it.starColorName || '',
          bellColor: cleanDetails.bellColor || it.bellColor || '',
          bellColorName: cleanDetails.bellColorName || it.bellColorName || '',
          hardwareName: cleanDetails.hardwareName || it.hardwareName || '',
          customLetters: cleanDetails.customLetters || it.customLetters || '',
          charms: cleanDetails.charms || it.charms || []
        };
      });

    const totalAmt = order.total_price || 0;
    const craftingStat = order.order_status === 'processing' ? 'in_crafting' : (order.order_status || 'in_crafting');
    const resolvedPickup = (order.courier && order.courier !== 'SiCepat Reguler' && order.courier !== '-')
      ? order.courier
      : (order.address && order.address !== '-' ? order.address : '-');

    return {
      id: order.id,
      createdAt: order.created_at,
      customer: {
        name: order.customer_name || 'Pelanggan',
        whatsapp: order.customer_whatsapp || '-',
        address: order.address || '-',
        city: order.city || '-',
        courier: order.courier || 'SiCepat Reguler',
        pickupLocation: resolvedPickup,
        courierCost: order.courier_cost || 0,
        notes: order.notes || ''
      },
      pickupLocation: resolvedPickup,
      items: orderItems,
      total: totalAmt,
      totalAmount: totalAmt,
      paymentMethod: order.payment_method || 'QRIS',
      paymentStatus: order.payment_status || 'paid',
      paymentProof: order.payment_proof || null,
      paymentProofUrl: null, // Avoid duplicate proof base64 payload
      orderStatus: order.order_status || 'processing',
      craftingStatus: craftingStat,
      shippingTrackingNumber: order.tracking_number || '',
      trackingNumber: order.tracking_number || '',
      craftingNotes: order.notes || ''
    };
  });
}

// Optimized single-roundtrip sync endpoint (fetches products, charms, and orders in one shot)
app.get('/api/sync', async (req, res) => {
  try {
    const data = await withConnection(async (conn) => {
      const [products] = await conn.query('SELECT * FROM products ORDER BY created_at DESC');
      const [charms] = await conn.query('SELECT * FROM charms ORDER BY category, name ASC');
      const [orders] = await conn.query('SELECT * FROM orders ORDER BY created_at DESC');
      const [items] = await conn.query('SELECT * FROM order_items');
      return {
        products,
        charms,
        orders: formatOrders(orders, items)
      };
    });

    res.json({
      success: true,
      ...data
    });
  } catch (err) {
    console.error('Error in /api/sync:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Orders & Order Items
app.get('/api/orders', async (req, res) => {
  try {
    const formatted = await withConnection(async (conn) => {
      const [orders] = await conn.query('SELECT * FROM orders ORDER BY created_at DESC');
      const [items] = await conn.query('SELECT * FROM order_items');
      return formatOrders(orders, items);
    });

    res.json(formatted);
  } catch (err) {
    console.error('Error in /api/orders:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const {
      id = 'ATC-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
      createdAt = null,
      customer = {},
      items = [],
      total = 0,
      totalAmount = 0,
      paymentMethod = 'QRIS',
      paymentStatus = 'paid',
      paymentProof = null,
      paymentProofUrl = null,
      orderStatus = 'processing'
    } = req.body;

    const proof = paymentProof || paymentProofUrl || null;
    const finalTotal = total || totalAmount || 0;
    const orderDate = createdAt ? new Date(createdAt) : new Date();

    await withConnection(async (connection) => {
      await connection.beginTransaction();
      try {
        await connection.query(
          `INSERT INTO orders (id, customer_name, customer_whatsapp, address, city, courier, courier_cost, notes, payment_method, payment_status, order_status, total_price, payment_proof, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             customer_name = VALUES(customer_name),
             customer_whatsapp = VALUES(customer_whatsapp),
             address = VALUES(address),
             city = VALUES(city),
             courier = VALUES(courier),
             courier_cost = VALUES(courier_cost),
             notes = VALUES(notes),
             payment_method = VALUES(payment_method),
             payment_status = VALUES(payment_status),
             order_status = VALUES(order_status),
             total_price = VALUES(total_price),
             payment_proof = VALUES(payment_proof)`,
          [
            id,
            customer.name || 'Pelanggan',
            customer.whatsapp || '',
            customer.address || customer.pickupLocation || '',
            customer.city || '',
            customer.courier || customer.pickupLocation || '',
            customer.courierCost || 0,
            customer.notes || '',
            paymentMethod,
            paymentStatus,
            orderStatus,
            finalTotal,
            proof,
            orderDate
          ]
        );

        // Delete any existing items for this order before re-inserting
        await connection.query('DELETE FROM order_items WHERE order_id = ?', [id]);

        for (const it of items) {
          const rawDetails = typeof it.customDetails === 'object' && it.customDetails !== null ? it.customDetails : {};
          const detailsToSave = {
            ...rawDetails,
            bundleChoices: it.bundleChoices || rawDetails.bundleChoices || null,
            bundleDescription: it.bundleDescription || rawDetails.bundleDescription || '',
            variant: it.variant || rawDetails.variant || '',
            color: it.color || rawDetails.color || '',
            customization: it.customization || rawDetails.customization || null,
            framePhotos: it.framePhotos || rawDetails.framePhotos || [],
            frameId: it.frameId || rawDetails.frameId || null,
            frameName: it.frameName || rawDetails.frameName || '',
            baseName: it.baseName || rawDetails.baseName || '',
            layoutId: it.layoutId || rawDetails.layoutId || 'layout-a',
            cordColor: it.cordColor || rawDetails.cordColor || '',
            cordColorName: it.cordColorName || rawDetails.cordColorName || '',
            accentColor: it.accentColor || rawDetails.accentColor || '',
            accentColorName: it.accentColorName || rawDetails.accentColorName || '',
            starColor: it.starColor || rawDetails.starColor || '',
            starColorName: it.starColorName || rawDetails.starColorName || '',
            bellColor: it.bellColor || rawDetails.bellColor || '',
            bellColorName: it.bellColorName || rawDetails.bellColorName || '',
            hardwareName: it.hardwareName || rawDetails.hardwareName || '',
            customLetters: it.customLetters || rawDetails.customLetters || '',
            charms: it.charms || rawDetails.charms || []
          };

          await connection.query(
            `INSERT INTO order_items (order_id, product_type, title, unit_price, quantity, subtotal, image, custom_details)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              it.productType || it.type || 'bag_charm',
              it.title || it.name || 'Custom Product',
              it.unitPrice || it.price || 0,
              it.quantity || 1,
              it.subtotal || (it.unitPrice || 0) * (it.quantity || 1),
              it.image || null,
              JSON.stringify(detailsToSave)
            ]
          );
        }

        await connection.commit();
      } catch (e) {
        await connection.rollback();
        throw e;
      }
    });

    res.status(201).json({ success: true, orderId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, trackingNumber, paymentStatus } = req.body;

    const updates = [];
    const values = [];

    if (orderStatus !== undefined) {
      updates.push('order_status = ?');
      values.push(orderStatus);
    }
    if (trackingNumber !== undefined) {
      updates.push('tracking_number = ?');
      values.push(trackingNumber);
    }
    if (paymentStatus !== undefined) {
      updates.push('payment_status = ?');
      values.push(paymentStatus);
    }

    if (updates.length > 0) {
      values.push(id);
      await dbQuery(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await withConnection(async (conn) => {
      await conn.query('DELETE FROM order_items WHERE order_id = ?', [id]);
      await conn.query('DELETE FROM orders WHERE id = ?', [id]);
    });
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Admin Authorization (PIN / Email)
app.post('/api/admin/login', async (req, res) => {
  try {
    const { pin, email, password } = req.body;
    let query = '';
    let params = [];

    if (pin) {
      query = 'SELECT * FROM admin_users WHERE pin = ? OR password = ? LIMIT 1';
      params = [pin.trim(), pin.trim()];
    } else if (email && password) {
      query = 'SELECT * FROM admin_users WHERE email = ? AND password = ? LIMIT 1';
      params = [email.trim().toLowerCase(), password];
    } else {
      return res.status(400).json({ success: false, message: 'Harap masukkan PIN atau email & password' });
    }

    const [rows] = await dbQuery(query, params);
    if (rows.length > 0) {
      const user = rows[0];
      return res.json({
        success: true,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      });
    }

    res.status(401).json({ success: false, message: 'PIN atau password admin tidak valid' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`[Tiny Tale Backend] API server running on http://localhost:${PORT}`);
    try {
      await dbQuery('SELECT 1 + 1 AS solution');
      console.log(`[Tiny Tale Backend] Berhasil terhubung ke database MySQL "${process.env.DB_NAME || 'tiny_tale'}" di ${dbHost}:${process.env.DB_PORT || 3306}`);
    } catch (err) {
      console.error(`[Tiny Tale Backend] Gagal terhubung ke database:`, err.message);
    }
  });
}

module.exports = app;
