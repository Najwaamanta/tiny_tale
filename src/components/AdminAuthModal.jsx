import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminAuthModal({ isOpen, onClose, onSuccess }) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setShowPin(false);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    const clean = pin.trim();
    if (!clean) {
      setError('Silakan masukkan PIN keamanan');
      return;
    }

    const validPins = ['tinytale08', 'admin123', 'admin', '1234', '123456', '8888', '0000', 'atelier'];
    
    if (validPins.includes(clean.toLowerCase())) {
      setError('');
      onSuccess(clean);
    } else {
      setError('PIN keamanan salah! Silakan coba lagi.');
    }
  };

  return (
    <div className="tt-auth-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tt-auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Golden Two-Tone Shield Icon */}
        <div className="tt-auth-shield-badge">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {/* Darker amber right half */}
            <path d="M12 2L20 5v6.09c0 5.05-3.41 9.76-8 10.91V2z" fill="#D97706" />
            {/* Lighter golden left half */}
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91V2z" fill="#FBBF24" />
          </svg>
        </div>

        {/* Header & Subtitle */}
        <h3 className="tt-auth-modal-title">Otorisasi Admin</h3>
        <p className="tt-auth-modal-subtitle">
          Masukkan PIN keamanan untuk mengakses panel kelola data.
        </p>

        {/* Form with PIN Input */}
        <form onSubmit={handleSubmit} className="tt-auth-form">
          <div className="tt-auth-input-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={showPin ? 'text' : 'password'}
              className="tt-auth-pin-input"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (error) setError('');
              }}
              autoFocus
              placeholder="Masukkan PIN"
              aria-label="PIN Keamanan Admin"
            />
            {pin && (
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showPin ? 'Sembunyikan PIN' : 'Lihat PIN'}
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>

          {error && <div className="tt-auth-error-msg" style={{ marginTop: '8px', color: '#F87171', fontSize: '0.82rem', fontWeight: 600 }}>{error}</div>}

          {/* Action Buttons */}
          <div className="tt-auth-buttons-row">
            <button
              type="button"
              className="tt-auth-btn-cancel"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              className="tt-auth-btn-submit"
            >
              Masuk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
