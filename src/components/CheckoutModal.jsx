import { isGelangItem, isBagCharmItem, resolveCordName, getAccentDisplay } from '../utils/accentHelper';
import React, { useState, useRef } from 'react';
import { X, Send, QrCode, CheckCircle2, Copy, ArrowRight, ExternalLink, Upload, Image as ImageIcon, Trash2, Check, RefreshCw, Download, Banknote, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBodyScrollLock } from '../utils/scrollLock';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems = [],
  onCreateOrder
}) {
  useBodyScrollLock(isOpen);

  // Form states - Name, WhatsApp, Pickup Location & Payment Method
  const [customerName, setCustomerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Market Day');
  const [customPickupLocation, setCustomPickupLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('QRIS'); // 'QRIS' | 'Cash'
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Checkout flow state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Calculations - Direct subtotal without courier shipping cost
  const itemsSubtotal = cartItems.reduce((acc, i) => acc + (i.subtotal || (i.unitPrice || 0) * (i.quantity || 1)), 0);
  const grandTotal = itemsSubtotal;

  // Handle Image Upload with Client-Side Canvas Compression
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxDim = 1000;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to lightweight JPEG base64 (~70-120 KB)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPaymentProofUrl(compressedDataUrl);
          setUploadFileName(file.name);
        } catch (err) {
          console.error('Image compression error:', err);
          setPaymentProofUrl(event.target.result);
          setUploadFileName(file.name);
        } finally {
          setIsCompressing(false);
        }
      };
      img.onerror = () => {
        setIsCompressing(false);
        alert('Gagal memuat gambar. Silakan gunakan format file JPG atau PNG.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProof = () => {
    setPaymentProofUrl('');
    setUploadFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Submit Order
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Mohon isi nama lengkap Anda.');
      return;
    }
    if (!whatsapp.trim() || whatsapp.trim().length < 9) {
      alert('Mohon masukkan nomor WhatsApp yang aktif dan valid (minimal 9 digit).');
      return;
    }
    if (pickupLocation === 'Lainnya' && !customPickupLocation.trim()) {
      alert('Mohon tuliskan tempat pengambilan yang Anda inginkan.');
      return;
    }
    if (paymentMethod === 'QRIS' && !paymentProofUrl) {
      alert('Mohon upload bukti pembayaran QRIS (foto/screenshot transfer) terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    const finalPickup = pickupLocation === 'Lainnya' ? (customPickupLocation.trim() || 'Lainnya') : pickupLocation;
    const isCash = paymentMethod === 'Cash';
    const orderData = {
      customer: {
        name: customerName.trim(),
        whatsapp: whatsapp.trim(),
        address: finalPickup,
        city: '-',
        courier: finalPickup,
        pickupLocation: finalPickup,
        courierCost: 0,
        notes: isCash ? `Bayar Tunai di Tempat (Cash) - Ambil di ${finalPickup}` : `Ambil di ${finalPickup}`
      },
      pickupLocation: finalPickup,
      items: cartItems,
      totalAmount: grandTotal,
      paymentMethod: isCash ? 'Tunai / Cash' : 'QRIS',
      paymentStatus: isCash ? 'pending' : 'paid',
      paymentProofUrl: isCash ? null : paymentProofUrl
    };

    const order = onCreateOrder(orderData);
    setCreatedOrder(order);
    setIsSubmitting(false);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Langsung arahkan ke WhatsApp dengan detail pesanan
    const waUrl = `https://wa.me/6281318409891?text=${generateWhatsAppMessage(order)}`;
    window.open(waUrl, '_blank');
  };

  // WhatsApp Order payload message
  const generateWhatsAppMessage = (order = createdOrder) => {
    if (!order) return '';
    const isCash = order.paymentMethod?.toLowerCase().includes('cash') || order.paymentMethod?.toLowerCase().includes('tunai');
    const pickup = order.customer?.pickupLocation || order.pickupLocation || order.customer?.courier || order.customer?.address || '-';
    const itemLines = (order.items || []).map((it, idx) => {
      const header = `${idx + 1}. *${it.title}* (Qty: ${it.quantity || 1}) - Rp ${(it.subtotal || it.unitPrice || 0).toLocaleString('id-ID')}`;
      if (it.bundleChoices) {
        const formatSub = (sub, defaultLabel) => {
          if (!sub) return '';
          const label = sub.label || defaultLabel;
          const isGelang = label.toLowerCase().includes('gelang') || (sub.name || '').toLowerCase().includes('gelang');

          if (isGelang) {
            const variantStr = sub.variant || sub.color ? ` (Varian: ${sub.variant || sub.color})` : '';
            const lettersStr = sub.customLetters ? ` [${sub.customLetters}]` : '';
            return `\n   • ${label}: ${sub.name || 'Gelang Pilihan'}${variantStr}${lettersStr}`;
          }

          // Bagcharm sub-item
          const cord = resolveCordName(sub.cordColorName || sub.cordColor);
          const accent = getAccentDisplay(sub).name;
          const details = [];
          if (cord) details.push(`Warna Tali: ${cord}`);
          if (accent) details.push(`Bintang & Lonceng: ${accent}`);
          const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
          const lettersStr = sub.customLetters ? ` [${sub.customLetters}]` : '';
          return `\n   • ${label}: ${sub.name || 'Custom Bagcharm'}${detailsStr}${lettersStr}`;
        };

        const item1Str = formatSub(it.bundleChoices.item1, 'Bagcharm 1');
        const item2Str = formatSub(it.bundleChoices.item2, 'Bagcharm 2');
        return header + item1Str + item2Str;
      }

      if (isGelangItem(it)) {
        return header +
          `\n   • Kategori: Gelang / Bracelet` +
          `\n   • Varian: ${it.variant || it.color || it.baseName || 'Standar Sesuai Foto'}` +
          (it.customLetters ? `\n   • Manik Huruf: [${it.customLetters}]` : '') +
          `\n   • Charms: ${it.charms?.map((c) => c.name || c).join(', ') || 'Tanpa charm tambahan'}`;
      }

      const itAccent = it.accentColorName || it.accentColor || it.starColorName || it.starColor || 'Hitam';
      return header +
        `\n   • Model: ${it.baseName || it.title}` +
        `\n   • Warna Tali: ${resolveCordName(it.cordColorName || it.cordColor) || '-'}` +
        `\n   • Warna Aksen (Bintang & Lonceng): ${itAccent}` +
        `\n   • Clasp: ${it.hardwareName || 'Standard Clasp'}` +
        (it.customLetters ? `\n   • Manik Huruf: [${it.customLetters}]` : '') +
        `\n   • Charms: ${it.charms?.map((c) => c.name || c).join(', ') || 'Tanpa charm tambahan'}`;
    }).join('\n\n');

    const msg = isCash
      ? `Halo Tiny Tale! Saya ingin konfirmasi pesanan dengan metode pembayaran *Cash / Tunai di Tempat*:\n\n` +
      `*NOMOR ORDER:* ${order.id}\n` +
      `*Nama Pemesan:* ${order.customer?.name || '-'}\n` +
      `*No. WhatsApp:* ${order.customer?.whatsapp || '-'}\n` +
      `*Tempat Pengambilan:* ${pickup}\n` +
      `*Metode Bayar:* Tunai / Cash (Bayar Langsung di Studio)\n\n` +
      `*Detail Item Kustom:*\n${itemLines}\n\n` +
      `*TOTAL PEMBAYARAN: Rp ${(order.totalAmount || 0).toLocaleString('id-ID')}*\n\n` +
      `Saya akan melakukan pembayaran tunai saat serah terima pesanan di ${pickup}. Mohon konfirmasi dan segera diproses perakitannya ya kak. Terima kasih!`
      : `Halo Tiny Tale! Saya telah melakukan pembayaran QRIS untuk pesanan:\n\n` +
      `*NOMOR ORDER:* ${order.id}\n` +
      `*Nama Pemesan:* ${order.customer?.name || '-'}\n` +
      `*No. WhatsApp:* ${order.customer?.whatsapp || '-'}\n` +
      `*Tempat Pengambilan:* ${pickup}\n` +
      `*Metode Bayar:* QRIS (Bukti Transfer Terlampir)\n\n` +
      `*Detail Item Kustom:*\n${itemLines}\n\n` +
      `*TOTAL PEMBAYARAN: Rp ${(order.totalAmount || 0).toLocaleString('id-ID')}*\n\n` +
      `Bukti pembayaran sudah saya upload di sistem. Mohon konfirmasi dan segera diproses perakitannya ya kak. Terima kasih!`;

    return encodeURIComponent(msg);
  };

  const handleCopyOrderId = () => {
    if (createdOrder) {
      navigator.clipboard.writeText(createdOrder.id);
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', maxHeight: '92vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className={`badge ${createdOrder ? 'badge-lime' : 'badge-cyan'}`} style={{ marginBottom: '4px' }}>
              {createdOrder ? 'Pesanan Sukses' : 'Checkout Cepat'}
            </span>
            <h3 style={{ fontSize: '1.25rem' }}>
              {createdOrder ? 'Pesanan Berhasil!' : 'Pembayaran Pesanan'}
            </h3>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-icon"
            style={{ width: '34px', height: '34px' }}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div style={{ padding: '22px 24px' }}>
          {createdOrder ? (
            /* SUCCESS CONFIRMATION VIEW */
            <div>
              <div style={{ textAlign: 'center', padding: '10px 0 18px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(163, 230, 53, 0.15)',
                    color: 'var(--accent-lime)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                    border: '2px solid rgba(163, 230, 53, 0.4)'
                  }}
                >
                  <CheckCircle2 size={34} />
                </div>
                <h4 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Terima Kasih, {createdOrder.customer.name}!</h4>

                {/* Info Tempat Pengambilan */}
                <div
                  style={{
                    background: 'rgba(0, 242, 254, 0.08)',
                    border: '1px solid rgba(0, 242, 254, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 16px',
                    margin: '10px auto 14px',
                    maxWidth: '420px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)'
                  }}
                >
                  <MapPin size={16} color="var(--accent-cyan)" />
                  <span>Tempat Pengambilan: <strong>{createdOrder.customer?.pickupLocation || createdOrder.pickupLocation || createdOrder.customer?.courier || '-'}</strong></span>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, maxWidth: '420px', margin: '0 auto' }}>
                  {createdOrder.paymentMethod?.toLowerCase().includes('cash') || createdOrder.paymentMethod?.toLowerCase().includes('tunai')
                    ? 'Pesananmu telah terkonfirmasi ke WhatsApp dan metode pembayaran Cash di Tempat telah dicatat. Tim studio kami akan segera merakit pesanan kustommu!'
                    : 'Pesananmu telah terkonfirmasi ke WhatsApp dan bukti pembayaran QRIS telah kami terima. Tim studio kami akan segera merakit pesanan kustommu!'}
                </p>
              </div>

              {/* Primary Action Button: Selesai & Kembali ke Beranda */}
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: 'var(--radius-md)'
                }}
                onClick={onClose}
              >
                <span>Selesai & Kembali ke Beranda</span>
                <CheckCircle2 size={18} />
              </button>

              {/* Optional Subtle WhatsApp link if user closed tab accidentally */}
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <a
                  href={`https://wa.me/6281318409891?text=${generateWhatsAppMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.76rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Buka kembali chat WhatsApp jika tertutup"
                >
                  <span>Chat WhatsApp tertutup? Buka kembali di sini</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM VIEW */
            <form onSubmit={handleSubmit}>
              {/* 1. INFORMASI PEMESAN (Nama Lengkap & WhatsApp Aktif Saja) */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(0, 242, 254, 0.15)',
                      color: 'var(--accent-cyan)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    1
                  </span>
                  <h4 style={{ fontSize: '1rem', color: 'var(--accent-cyan)', margin: 0 }}>
                    Informasi Pemesan
                  </h4>
                </div>

                <div className="checkout-grid-two-col">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nama Lengkap *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Bima Perkasa"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nomor WhatsApp yang Aktif *</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Contoh: 081318409891"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* TEMPAT PENGAMBILAN */}
                <div style={{ marginTop: '16px' }}>
                  <label className="form-label" style={{ fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px' }}>
                    <MapPin size={15} color="var(--accent-cyan)" />
                    <span>Tempat Pengambilan *</span>
                  </label>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr',
                      gap: '8px'
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        border: '2px solid var(--accent-cyan)',
                        background: 'rgba(0, 242, 254, 0.12)',
                        color: 'var(--accent-cyan)',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        cursor: 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.05rem' }}>📍</span>
                        <span>Market Day</span>
                      </div>
                      <Check size={16} strokeWidth={3} />
                    </button>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px', marginLeft: '2px' }}>
                    * Khusus pengambilan langsung di booth <strong>Market Day</strong>.
                  </div>
                </div>
              </div>

              {/* 2. METODE PEMBAYARAN: PILIHAN QRIS ATAU CASH */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(0, 242, 254, 0.15)',
                      color: 'var(--accent-cyan)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    2
                  </span>
                  <h4 style={{ fontSize: '1rem', color: 'var(--accent-cyan)', margin: 0 }}>
                    Pilih Metode Pembayaran
                  </h4>
                </div>

                {/* PILIHAN METODE: QRIS vs CASH */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    marginBottom: '16px'
                  }}
                >
                  {/* Card 1: QRIS */}
                  <div
                    onClick={() => setPaymentMethod('QRIS')}
                    style={{
                      border: paymentMethod === 'QRIS' ? '2px solid var(--accent-cyan)' : '1.5px solid var(--border-subtle)',
                      background: paymentMethod === 'QRIS' ? 'rgba(0, 242, 254, 0.08)' : 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: paymentMethod === 'QRIS' ? 'rgba(0, 242, 254, 0.2)' : 'var(--bg-tertiary)',
                        color: paymentMethod === 'QRIS' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <QrCode size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.94rem', color: paymentMethod === 'QRIS' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                        QRIS
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.25 }}>
                        E-Wallet & M-Banking
                      </div>
                    </div>
                    {paymentMethod === 'QRIS' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: 'var(--accent-cyan)',
                          color: '#000000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Card 2: Cash */}
                  <div
                    onClick={() => setPaymentMethod('Cash')}
                    style={{
                      border: paymentMethod === 'Cash' ? '2px solid var(--accent-cyan)' : '1.5px solid var(--border-subtle)',
                      background: paymentMethod === 'Cash' ? 'rgba(0, 242, 254, 0.08)' : 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: paymentMethod === 'Cash' ? 'rgba(0, 242, 254, 0.2)' : 'var(--bg-tertiary)',
                        color: paymentMethod === 'Cash' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Banknote size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.94rem', color: paymentMethod === 'Cash' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                        Tunai / Cash
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.25 }}>
                        Bayar di Tempat
                      </div>
                    </div>
                    {paymentMethod === 'Cash' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: 'var(--accent-cyan)',
                          color: '#000000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>

                {/* TAMPILAN BERDASARKAN METODE YANG DIPILIH */}
                {paymentMethod === 'QRIS' ? (
                  <>
                    {/* QRIS CARD */}
                    <div
                      style={{
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '20px',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginBottom: '12px', textAlign: 'center' }}>
                        <span className="badge badge-purple" style={{ fontSize: '0.74rem', fontWeight: 700, padding: '4px 12px' }}>
                          QRIS STANDAR NASIONAL
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          Tiny Tale • NMID: <strong style={{ color: 'var(--text-primary)' }}>ID1026641495415</strong>
                        </span>
                      </div>

                      {/* QRIS Official Image Display */}
                      <div
                        style={{
                          maxWidth: '260px',
                          width: '100%',
                          margin: '14px auto',
                          background: '#FFFFFF',
                          borderRadius: '14px',
                          overflow: 'hidden',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                          border: '2px solid rgba(255, 255, 255, 0.2)'
                        }}
                      >
                        <img
                          src="/images/qris.jpg"
                          alt="QRIS Tiny Tale"
                          style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block'
                          }}
                        />
                      </div>

                      <div style={{ marginTop: '8px', marginBottom: '14px' }}>
                        <a
                          href="/images/qris.jpg"
                          download="QRIS-TinyTale.jpg"
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.78rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '999px', fontWeight: 600 }}
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = '/images/qris.jpg';
                            link.download = 'QRIS-TinyTale.jpg';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <Download size={14} />
                          <span>Unduh QRIS</span>
                        </a>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Total Pembayaran:
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                        Rp {grandTotal.toLocaleString('id-ID')}
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                        Scan QRIS menggunakan <strong>GoPay, OVO, DANA, ShopeePay, BCA, Mandiri, BRI, BNI</strong> atau semua Mobile Banking.
                      </p>
                    </div>

                    {/* 3. UPLOAD BUKTI PEMBAYARAN */}
                    <div style={{ marginTop: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px 8px', marginBottom: '8px' }}>
                        <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                          Upload Bukti Pembayaran <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                          (Screenshot / Foto Struk)
                        </span>
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                      />

                      {paymentProofUrl ? (
                        /* UPLOADED PREVIEW - RESPONSIVE 2-TIER CARD */
                        <div
                          style={{
                            background: 'rgba(163, 230, 53, 0.08)',
                            border: '1.5px solid var(--accent-lime)',
                            borderRadius: 'var(--radius-md)',
                            padding: '12px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                        >
                          {/* Top Info Row: Thumbnail + Status Text */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                background: '#000000',
                                flexShrink: 0,
                                border: '1px solid rgba(163, 230, 53, 0.35)',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                              }}
                            >
                              <img
                                src={paymentProofUrl}
                                alt="Bukti Transfer"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-lime)', fontWeight: 700, fontSize: '0.86rem' }}>
                                <Check size={15} style={{ flexShrink: 0 }} />
                                <span style={{ lineHeight: 1.25 }}>Bukti Pembayaran Terpasang</span>
                              </div>
                              <div
                                style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--text-secondary)',
                                  marginTop: '3px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {uploadFileName || 'bukti-transfer-qris.jpg'}
                              </div>
                            </div>
                          </div>

                          {/* Bottom Action Row: Wide Responsive Buttons */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              paddingTop: '8px',
                              borderTop: '1px dashed rgba(163, 230, 53, 0.25)'
                            }}
                          >
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{
                                flex: 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '7px 12px',
                                fontSize: '0.8rem'
                              }}
                              onClick={() => fileInputRef.current?.click()}
                              title="Ganti Foto Bukti Pembayaran"
                            >
                              <RefreshCw size={13} />
                              <span>Ganti Foto Bukti</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px',
                                padding: '7px 12px',
                                fontSize: '0.8rem',
                                color: '#EF4444',
                                borderColor: 'rgba(239, 68, 68, 0.35)',
                                background: 'rgba(239, 68, 68, 0.04)'
                              }}
                              onClick={handleRemoveProof}
                              title="Hapus Bukti Pembayaran"
                            >
                              <Trash2 size={13} />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* UPLOAD DROPZONE / BUTTON */
                        <div
                          onClick={() => !isCompressing && fileInputRef.current?.click()}
                          style={{
                            background: 'var(--bg-tertiary)',
                            border: '1.5px dashed var(--border-medium)',
                            borderRadius: 'var(--radius-md)',
                            padding: '18px 16px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s, background 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                            e.currentTarget.style.background = 'rgba(0, 242, 254, 0.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-medium)';
                            e.currentTarget.style.background = 'var(--bg-tertiary)';
                          }}
                        >
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              background: 'rgba(0, 242, 254, 0.1)',
                              color: 'var(--accent-cyan)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 8px'
                            }}
                          >
                            {isCompressing ? <RefreshCw size={18} className="spin" /> : <Upload size={18} />}
                          </div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                            {isCompressing ? 'Sedang Memproses Foto...' : 'Klik untuk Upload Bukti Pembayaran'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Pilih foto atau screenshot bukti transfer (JPG, PNG)
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* TAMPILAN TUNAI / CASH */
                  <div
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '24px 20px',
                      textAlign: 'center'
                    }}
                  >
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                        border: '1.5px solid rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Banknote size={28} />
                    </div>

                    <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Pembayaran Tunai/Cash
                    </h5>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px', maxWidth: '380px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                      Silakan siapkan uang pas saat pembayaran langsung di kasir Atelier Studio atau saat serah terima pesanan.
                    </p>

                    <div
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px dashed var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px 20px',
                        display: 'inline-flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        marginBottom: '16px'
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total yang Harus Disiapkan:</span>
                      <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)' }}>
                        Rp {grandTotal.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.45,
                        background: 'rgba(0, 242, 254, 0.04)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        border: '1px solid rgba(0, 242, 254, 0.15)',
                        textAlign: 'left'
                      }}
                    >
                      💡 <strong>Informasi:</strong> Tidak perlu upload bukti transfer. Pesanan Anda akan langsung tercatat dan masuk ke antrean perakitan pengrajin setelah menekan tombol <strong>Konfirmasi Pesanan</strong>.
                    </div>
                  </div>
                )}
              </div>

              {/* TOTAL & SUBMIT BUTTON */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)' }}>Total Pesanan:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)' }}>
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  disabled={isSubmitting || isCompressing}
                >
                  <Send size={18} />
                  <span>{isSubmitting ? 'Memproses Pesanan...' : 'Konfirmasi Pesanan'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
