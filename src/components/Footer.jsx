import React from 'react';

export default function Footer({ onNavigate, onOpenAdmin, isAdmin = false }) {
  const handleNav = (e, view, elementId) => {
    e.preventDefault();
    if (elementId) {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    if (onNavigate && view) {
      onNavigate(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="tt-footer">
      <div className="container">
        <div className="tt-footer-main">
          {/* Brand Col */}
          <div className="tt-footer-brand">
            <img
              src="/images/logo.png"
              alt="Tiny Tale Studio"
              className="tt-footer-logo"
            />
            <p className="tt-footer-desc">
              Personalized, handmade accessories that capture your best memories. Designed by you, crafted by us.
            </p>
          </div>

          {/* Nav Cols */}
          <div className="tt-footer-links-group">
            <div className="tt-footer-col">
              <h4 className="tt-footer-col-title">SHOP</h4>
              <ul className="tt-footer-list">
                <li>
                  <a href="#koleksi-lengkap" onClick={(e) => handleNav(e, 'collection', 'koleksi-lengkap')}>
                    Custom Keychains
                  </a>
                </li>
                <li>
                  <a href="#koleksi-lengkap" onClick={(e) => handleNav(e, 'collection', 'koleksi-lengkap')}>
                    Custom Bracelets
                  </a>
                </li>
                <li>
                  <a href="#koleksi-lengkap" onClick={(e) => handleNav(e, 'collection', 'koleksi-lengkap')}>
                    Photo Frames & Strips
                  </a>
                </li>
              </ul>
            </div>

            <div className="tt-footer-col">
              <h4 className="tt-footer-col-title">HELP</h4>
              <ul className="tt-footer-list">
                <li>
                  <a href="#custom-studio" onClick={(e) => handleNav(e, 'studio', null)}>
                    Custom Studio
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="tt-footer-divider" />

        {/* Bottom bar */}
        <div className="tt-footer-bottom">
          <p
            className="tt-footer-copy"
            onClick={onOpenAdmin}
            style={{ cursor: 'pointer', userSelect: 'none' }}
            title="Tiny Tale Studio"
          >
            © 2026 Tiny Tale Studio. All rights reserved. Made with love.
          </p>

          <div className="tt-footer-socials">
            <a
              href="https://wa.me/6281318409891?text=Halo%20Tiny%20Tale%2C%20saya%20ingin%20tanya%20dan%20pesan%20aksesoris%20custom"
              target="_blank"
              rel="noreferrer"
              className="tt-social-icon"
              aria-label="WhatsApp (+62 813-1840-9891)"
              title="Chat WhatsApp: +62 813-1840-9891"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.3z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="tt-social-icon"
              aria-label="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="tt-social-icon"
              aria-label="X (Twitter)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
