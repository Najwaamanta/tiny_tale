import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Atelier Craft Runtime Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem('atelier_cart_v1');
      localStorage.removeItem('atelier_admin_auth_v1');
    } catch (e) {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: '#FAFAF8',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              maxWidth: '440px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '32px 24px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
              border: '1px solid #E5E7EB'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✨</div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#1F2937',
                marginBottom: '8px'
              }}
            >
              Memuat Ulang Tampilan
            </h2>
            <p
              style={{
                fontSize: '0.88rem',
                color: '#6B7280',
                lineHeight: 1.5,
                marginBottom: '20px'
              }}
            >
              Terjadi sedikit penyesuaian pada peramban. Klik tombol di bawah untuk memuat ulang halaman dengan lancar.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  background: '#1F2937',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Muat Ulang Halaman
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  background: '#F3F4F6',
                  color: '#4B5563',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Kembali ke Beranda Awal
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
