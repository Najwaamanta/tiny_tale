const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MySQL connection pool (Laragon / phpMyAdmin default localhost:3306)
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'tiny_tale',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 1. Health & Database Check
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ status: 'ok', database: 'tiny_tale', connected: true });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 2. Products Catalog
app.get('/api/products', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
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
    await pool.query(
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

    const [[saved]] = await pool.query('SELECT * FROM products WHERE id = ?', [prodId]);
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

    await pool.query(
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

    const [[updated]] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Charms & Inventory
app.get('/api/charms', async (req, res) => {
  try {
    const [charms] = await pool.query('SELECT * FROM charms ORDER BY id ASC');
    res.json(charms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/charms', async (req, res) => {
  try {
    const { id, name, category, price, stock, icon, image, description } = req.body;
    const charmId = id || `ch-${Date.now()}`;
    await pool.query(
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
    const [[saved]] = await pool.query('SELECT * FROM charms WHERE id = ?', [charmId]);
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
    await pool.query(
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
    const [[updated]] = await pool.query('SELECT * FROM charms WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    console.error('Error updating charm:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/charms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM charms WHERE id = ?', [id]);
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
    if (stock !== undefined) {
      await pool.query('UPDATE charms SET stock = ? WHERE id = ?', [stock, id]);
    } else if (delta !== undefined) {
      await pool.query('UPDATE charms SET stock = GREATEST(0, stock + ?) WHERE id = ?', [delta, id]);
    }
    const [[updated]] = await pool.query('SELECT * FROM charms WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Orders & Order Items
app.get('/api/orders', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    const [items] = await pool.query('SELECT * FROM order_items');
    
    // Attach items to orders
    const ordersWithItems = orders.map((order) => {
      const orderItems = items
        .filter((it) => it.order_id === order.id)
        .map((it) => {
          let cDetails = {};
          try {
            cDetails = typeof it.custom_details === 'string' ? JSON.parse(it.custom_details) : (it.custom_details || {});
          } catch (e) {
            cDetails = {};
          }
          return {
            id: it.id,
            productType: it.product_type,
            title: it.title,
            unitPrice: it.unit_price,
            quantity: it.quantity,
            subtotal: it.subtotal,
            image: it.image,
            customDetails: cDetails,
            framePhotos: cDetails.framePhotos || it.framePhotos || [],
            frameId: cDetails.frameId || it.frameId || null,
            frameName: cDetails.frameName || it.frameName || '',
            baseName: cDetails.baseName || it.baseName || '',
            cordColor: cDetails.cordColor || it.cordColor || '',
            cordColorName: cDetails.cordColorName || it.cordColorName || '',
            hardwareName: cDetails.hardwareName || it.hardwareName || '',
            customLetters: cDetails.customLetters || it.customLetters || '',
            charms: cDetails.charms || it.charms || []
          };
        });

      const totalAmt = order.total_price || 0;
      const craftingStat = order.order_status === 'processing' ? 'in_crafting' : (order.order_status || 'in_crafting');

      return {
        id: order.id,
        createdAt: order.created_at,
        customer: {
          name: order.customer_name || 'Pelanggan',
          whatsapp: order.customer_whatsapp || '-',
          address: order.address || '-',
          city: order.city || '-',
          courier: order.courier || 'SiCepat Reguler',
          courierCost: order.courier_cost || 0,
          notes: order.notes || ''
        },
        items: orderItems,
        total: totalAmt,
        totalAmount: totalAmt,
        paymentMethod: order.payment_method || 'QRIS',
        paymentStatus: order.payment_status || 'paid',
        paymentProof: order.payment_proof || null,
        paymentProofUrl: order.payment_proof || null,
        orderStatus: order.order_status || 'processing',
        craftingStatus: craftingStat,
        shippingTrackingNumber: order.tracking_number || '',
        trackingNumber: order.tracking_number || '',
        craftingNotes: order.notes || ''
      };
    });

    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      id = 'ATC-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
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

    await connection.query(
      `INSERT INTO orders (id, customer_name, customer_whatsapp, address, city, courier, courier_cost, notes, payment_method, payment_status, order_status, total_price, payment_proof)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        customer.name || 'Pelanggan',
        customer.whatsapp || '',
        customer.address || '',
        customer.city || '',
        customer.courier || '',
        customer.courierCost || 0,
        customer.notes || '',
        paymentMethod,
        paymentStatus,
        orderStatus,
        finalTotal,
        proof
      ]
    );

    for (const it of items) {
      const rawDetails = typeof it.customDetails === 'object' && it.customDetails !== null ? it.customDetails : {};
      const detailsToSave = {
        ...rawDetails,
        framePhotos: it.framePhotos || rawDetails.framePhotos || [],
        frameId: it.frameId || rawDetails.frameId || null,
        frameName: it.frameName || rawDetails.frameName || '',
        baseName: it.baseName || rawDetails.baseName || '',
        layoutId: it.layoutId || rawDetails.layoutId || 'layout-a',
        cordColor: it.cordColor || rawDetails.cordColor || '',
        cordColorName: it.cordColorName || rawDetails.cordColorName || '',
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
    res.status(201).json({ success: true, orderId: id });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
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
      await pool.query(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    res.json({ success: true, id });
  } catch (err) {
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

    const [rows] = await pool.query(query, params);
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

app.listen(PORT, () => {
  console.log(`[Tiny Tale Backend] API server running on http://localhost:${PORT}`);
  console.log(`[Tiny Tale Backend] Connected to MySQL database "tiny_tale" on localhost:3306`);
});
