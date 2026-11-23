import * as XLSX from 'xlsx';

/**
 * Format ISO Date to Readable Indonesian format matching the table
 */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Aggregate customer list from orders
 */
export function aggregateCustomersFromOrders(orders = []) {
  const customerMap = {};

  orders.forEach((ord) => {
    const cust = ord.customer || {};
    const key = (cust.whatsapp || '').trim() || (cust.name || '').trim().toLowerCase() || ord.id;
    if (!key) return;

    if (!customerMap[key]) {
      customerMap[key] = {
        key,
        name: cust.name || 'Pelanggan',
        whatsapp: cust.whatsapp || '-',
        city: cust.city || '-',
        address: cust.address || '-',
        ordersCount: 0,
        totalSpent: 0,
        lastOrderDate: ord.createdAt,
        orders: []
      };
    }

    const current = customerMap[key];
    current.ordersCount += 1;
    current.totalSpent += (ord.totalAmount ?? ord.total ?? 0);
    current.orders.push(ord);

    if (new Date(ord.createdAt) > new Date(current.lastOrderDate)) {
      current.lastOrderDate = ord.createdAt;
      current.city = cust.city || current.city;
      current.address = cust.address || current.address;
    }
  });

  return Object.values(customerMap).sort((a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate));
}

/**
 * Export Orders to .xlsx Excel spreadsheet matching exactly the table in orders section
 * Columns:
 * 1. No.
 * 2. No. Order
 * 3. Tanggal
 * 4. Pemesan & WhatsApp
 * 5. Item Kustom & Frame
 * 6. Total Belanja (Rp)
 * 7. Status Bayar
 */
export function exportOrdersToExcel(orders = [], customFilename) {
  const dataRows = orders.map((ord, idx) => {
    const items = ord.items || [];
    const itemDetails = items
      .map((it) => {
        let text = `${it.title || 'Aksesoris'}`;
        if (it.quantity > 1) text += ` (x${it.quantity})`;
        if (it.customLetters) text += ` [${it.customLetters}]`;
        return text;
      })
      .join('; ');

    const hasBagCharm = items.some(
      (it) => it.productType === 'bag_charm' || it.title?.toLowerCase().includes('bag charm') || it.title?.toLowerCase().includes('bagcharm')
    );
    const itemWithFrame = hasBagCharm ? `${itemDetails} (Frame Foto Tersedia)` : itemDetails;

    return {
      'No.': idx + 1,
      'No. Order': ord.id,
      'Tanggal': formatDate(ord.createdAt),
      'Pemesan & WhatsApp': `${ord.customer?.name || 'Pelanggan'} (${ord.customer?.whatsapp || '-'})`,
      'Tempat Pengambilan': ord.customer?.pickupLocation || ord.pickupLocation || ord.customer?.courier || ord.customer?.address || '-',
      'Item Kustom & Frame': itemWithFrame || '-',
      'Total Belanja (Rp)': ord.totalAmount ?? ord.total ?? 0,
      'Status Bayar': ord.paymentStatus === 'paid' ? 'Lunas' : 'Verifikasi'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  // Column width autogeneration exactly matching the table columns
  worksheet['!cols'] = [
    { wch: 6 },  // No.
    { wch: 18 }, // No. Order
    { wch: 22 }, // Tanggal
    { wch: 34 }, // Pemesan & WhatsApp
    { wch: 24 }, // Tempat Pengambilan
    { wch: 48 }, // Item Kustom & Frame
    { wch: 20 }, // Total Belanja (Rp)
    { wch: 16 }  // Status Bayar
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pesanan');

  const filename = customFilename || `Daftar_Pesanan_TinyTale_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, filename);
  return filename;
}

/**
 * Export Customer History to .xlsx Excel spreadsheet
 */
export function exportCustomersToExcel(customers = [], customFilename) {
  const dataRows = customers.map((c, idx) => ({
    'No.': idx + 1,
    'Nama Pelanggan': c.name,
    'Nomor WhatsApp': c.whatsapp,
    'Kota': c.city,
    'Alamat Lengkap': c.address,
    'Total Frekuensi Belanja': `${c.ordersCount} Pesanan`,
    'Total Pengeluaran LTV (Rp)': c.totalSpent,
    'Transaksi Terakhir': formatDate(c.lastOrderDate),
    'Tipe Pelanggan': c.ordersCount > 1 ? 'VIP / Repeat Buyer' : 'Customer Baru'
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 20 },
    { wch: 20 },
    { wch: 45 },
    { wch: 24 },
    { wch: 25 },
    { wch: 22 },
    { wch: 22 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat_Pelanggan');

  const filename = customFilename || `Riwayat_Pelanggan_TinyTale_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, filename);
  return filename;
}

/**
 * Export Complete Business & Customer Workbook with multiple sheets
 */
export function exportCompleteBusinessReport(orders = []) {
  const customers = aggregateCustomersFromOrders(orders);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount ?? o.total ?? 0), 0);

  // 1. Sheet Orders matching exactly the orders table
  const ordersRows = orders.map((ord, idx) => {
    const items = ord.items || [];
    const itemDetails = items
      .map((it) => {
        let text = `${it.title || 'Aksesoris'}`;
        if (it.quantity > 1) text += ` (x${it.quantity})`;
        if (it.customLetters) text += ` [${it.customLetters}]`;
        return text;
      })
      .join('; ');

    const hasBagCharm = items.some(
      (it) => it.productType === 'bag_charm' || it.title?.toLowerCase().includes('bag charm') || it.title?.toLowerCase().includes('bagcharm')
    );
    const itemWithFrame = hasBagCharm ? `${itemDetails} (Frame Foto Tersedia)` : itemDetails;

    return {
      'No.': idx + 1,
      'No. Order': ord.id,
      'Tanggal': formatDate(ord.createdAt),
      'Pemesan & WhatsApp': `${ord.customer?.name || 'Pelanggan'} (${ord.customer?.whatsapp || '-'})`,
      'Item Kustom & Frame': itemWithFrame || '-',
      'Total Belanja (Rp)': ord.totalAmount ?? ord.total ?? 0,
      'Status Bayar': ord.paymentStatus === 'paid' ? 'Lunas' : 'Verifikasi'
    };
  });
  const wsOrders = XLSX.utils.json_to_sheet(ordersRows);
  wsOrders['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 22 },
    { wch: 34 },
    { wch: 48 },
    { wch: 20 },
    { wch: 16 }
  ];

  // 2. Sheet Customers
  const custRows = customers.map((c, idx) => ({
    'No.': idx + 1,
    'Nama Pelanggan': c.name,
    'WhatsApp': c.whatsapp,
    'Kota': c.city,
    'Total Pesanan': c.ordersCount,
    'Total Belanja (Rp)': c.totalSpent,
    'Transaksi Terakhir': formatDate(c.lastOrderDate),
    'Kategori': c.ordersCount > 1 ? 'Loyal / Repeat' : 'Baru'
  }));
  const wsCustomers = XLSX.utils.json_to_sheet(custRows);

  // 3. Sheet Summary
  const summaryRows = [
    { 'Metrik Bisnis': 'Total Omset Pesanan', 'Nilai': `Rp ${totalRevenue.toLocaleString('id-ID')}` },
    { 'Metrik Bisnis': 'Total Pesanan Masuk', 'Nilai': `${orders.length} Transaksi` },
    { 'Metrik Bisnis': 'Total Database Pelanggan', 'Nilai': `${customers.length} Orang` },
    { 'Metrik Bisnis': 'Rata-rata Nilai Belanja (AOV)', 'Nilai': `Rp ${Math.round(totalRevenue / Math.max(orders.length, 1)).toLocaleString('id-ID')}` },
    { 'Metrik Bisnis': 'Tanggal Unduh Laporan', 'Nilai': formatDate(new Date().toISOString()) }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsOrders, 'Daftar_Pesanan');
  XLSX.utils.book_append_sheet(wb, wsCustomers, 'Riwayat_Pelanggan');
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan_Laporan');

  const filename = `Laporan_Lengkap_TinyTale_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
}
