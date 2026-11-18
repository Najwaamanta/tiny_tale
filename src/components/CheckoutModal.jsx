import React, { useState, useRef } from 'react';
import { X, Send, QrCode, CheckCircle2, Copy, ArrowRight, ExternalLink, Upload, Image as ImageIcon, Trash2, Check, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems = [],
  onCreateOrder
}) {
  if (!isOpen) return null;

  // Form states - Only Name and WhatsApp as requested
  const [customerName, setCustomerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Checkout flow state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  const fileInputRef = useRef(null);

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
    if (!paymentProofUrl) {
      alert('Mohon upload bukti pembayaran QRIS (foto/screenshot transfer) terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const orderData = {
        customer: {
          name: customerName.trim(),
          whatsapp: whatsapp.trim(),
          address: '-',
          city: '-',
          courier: '-',
          courierCost: 0,
          notes: ''
        },
        items: cartItems,
        totalAmount: grandTotal,
        paymentMethod: 'QRIS',
        paymentProofUrl: paymentProofUrl
      };

      const order = onCreateOrder(orderData);
      setCreatedOrder(order);
      setIsSubmitting(false);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 500);
  };

  // WhatsApp Order payload message
  const generateWhatsAppMessage = () => {
    if (!createdOrder) return '';
    const itemLines = createdOrder.items.map((it, idx) => {
      const header = `${idx + 1}. *${it.title}* (Qty: ${it.quantity || 1}) - Rp ${(it.subtotal || it.unitPrice || 0).toLocaleString('id-ID')}`;
      if (it.bundleChoices) {
        const item1Str = it.bundleChoices.item1 ? `\n   • ${it.bundleChoices.item1.label || 'Item 1'}: ${it.bundleChoices.item1.name}` : '';
        const item2Str = it.bundleChoices.item2 ? `\n   • ${it.bundleChoices.item2.label || 'Item 2'}: ${it.bundleChoices.item2.name}` : '';
        return header + item1Str + item2Str;
      }
      return header +
        `\n   • Model: ${it.baseName || it.title}` +
        `\n   • Warna Tali: ${it.cordColorName || it.cordColor || '-'}` +
        `\n   • Charms: ${it.charms?.map((c) => c.name || c).join(', ') || 'Tanpa charm tambahan'}`;
    }).join('\n\n');

    const msg = `Halo Tiny Tale! Saya telah melakukan pembayaran QRIS untuk pesanan:\n\n` +
      `*NOMOR ORDER:* ${createdOrder.id}\n` +
      `*Nama Pemesan:* ${createdOrder.customer.name}\n` +
      `*No. WhatsApp:* ${createdOrder.customer.whatsapp}\n` +
      `*Metode Bayar:* QRIS (Bukti Transfer Terlampir)\n\n` +
      `*Detail Item Kustom:*\n${itemLines}\n\n` +
      `*TOTAL PEMBAYARAN: Rp ${createdOrder.totalAmount.toLocaleString('id-ID')}*\n\n` +
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
            <span className="badge badge-cyan" style={{ marginBottom: '4px' }}>Checkout Cepat</span>
            <h3 style={{ fontSize: '1.25rem' }}>
              {createdOrder ? 'Pesanan Berhasil Dibuat!' : 'Pembayaran Pesanan'}
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
              <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(163, 230, 53, 0.15)',
                    color: 'var(--accent-lime)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    border: '2px solid rgba(163, 230, 53, 0.4)'
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>
                <h4 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>Terima Kasih, {createdOrder.customer.name}!</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  Pembayaran QRIS dan bukti transfer telah kami terima. Pesanan Anda kini masuk ke antrean perakitan Atelier Studio.
                </p>
              </div>

              {/* Order ID Badge Box */}
              <div
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    KODE / NOMOR IDENTITAS PESANAN:
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)' }}>
                    {createdOrder.id}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    WhatsApp: <strong>{createdOrder.customer.whatsapp}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopyOrderId}
                >
                  <Copy size={14} />
                  <span>{copiedOrderId ? 'Tersalin!' : 'Salin Kode'}</span>
                </button>
              </div>

              {/* WhatsApp Notification CTA Button */}
              <div style={{ marginBottom: '18px' }}>
                <a
                  href={`https://wa.me/6281318409891?text=${generateWhatsAppMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-lime btn-lg"
                  style={{ width: '100%', textDecoration: 'none' }}
                >
                  <Send size={18} />
                  <span>Konfirmasi ke WhatsApp Kami</span>
                  <ExternalLink size={14} />
                </a>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px' }}>
                  Pengerajin kami siap memverifikasi detail kustom dan memproses perakitan Anda.
                </p>
              </div>

              {/* Close Button */}
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={onClose}
              >
                <span>Selesai & Kembali ke Beranda</span>
                <CheckCircle2 size={16} />
              </button>
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
              </div>

              {/* 2. METODE PEMBAYARAN: HANYA QRIS */}
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
                    Pembayaran QRIS
                  </h4>
                </div>

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
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span className="badge badge-purple" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                      QRIS STANDAR NASIONAL
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Tiny Tale • NMID: ID1026641495415
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
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.76rem', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ExternalLink size={13} />
                      <span>Buka / Simpan Gambar QRIS</span>
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
                <div style={{ marginTop: '16px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>Upload Bukti Pembayaran *</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Screenshot / Foto Struk</span>
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />

                  {paymentProofUrl ? (
                    /* UPLOADED PREVIEW */
                    <div
                      style={{
                        background: 'rgba(163, 230, 53, 0.08)',
                        border: '1.5px solid var(--accent-lime)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          background: '#000000',
                          flexShrink: 0,
                          border: '1px solid var(--border-medium)'
                        }}
                      >
                        <img
                          src={paymentProofUrl}
                          alt="Bukti Transfer"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-lime)', fontWeight: 700, fontSize: '0.85rem' }}>
                          <Check size={14} />
                          <span>Bukti Pembayaran Terpasang</span>
                        </div>
                        <div
                          style={{
                            fontSize: '0.76rem',
                            color: 'var(--text-secondary)',
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {uploadFileName || 'bukti-transfer-qris.jpg'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          onClick={() => fileInputRef.current?.click()}
                          title="Ganti Foto Bukti"
                        >
                          <RefreshCw size={12} />
                          <span>Ganti</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '6px 8px', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          onClick={handleRemoveProof}
                          title="Hapus Bukti"
                        >
                          <Trash2 size={13} />
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
                  style={{ width: '100%' }}
                  disabled={isSubmitting || isCompressing}
                >
                  {isSubmitting ? 'Memproses Pesanan...' : 'Konfirmasi & Kirim Pesanan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
