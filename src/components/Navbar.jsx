import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShieldCheck, User, Menu, X, Settings } from 'lucide-react';

export default function Navbar({
  activeView,
  setActiveView,
  cartCount = 0,
  onOpenCart,
  isAdmin,
  onOpenAdminLogin,
  onOpenAdminDashboard,
  onOpenAdminAuth
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [badgeBump, setBadgeBump] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setBadgeBump(true);
      const timer = setTimeout(() => setBadgeBump(false), 350);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (view, targetId = null) => {
    setMobileMenuOpen(false);
    if (view === 'home' && targetId) {
      if (activeView !== 'home') {
        setActiveView('home');
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (view) {
      setActiveView(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isHeroMode = activeView === 'home' && !isScrolled;

  return (
    <header className={`tt-navbar-header ${isHeroMode ? 'tt-navbar-hero-mode' : 'tt-navbar-solid'}`}>
      <div className="container tt-navbar-container">
        {/* Left: Tiny Tale Logo */}
        <div
          className="tt-brand-logo"
          onClick={() => handleNavClick('home')}
          role="button"
          tabIndex={0}
        >
          <img
            src="/images/logo.png"
            alt="Tiny Tale"
            className="tt-navbar-logo-img"
          />
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="tt-desktop-nav" aria-label="Main navigation">
          <ul className="tt-nav-list">
            <li>
              <button
                type="button"
                className={`tt-nav-item ${activeView === 'home' ? 'active' : ''}`}
                onClick={() => handleNavClick('home')}
              >
                Home
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`tt-nav-item ${activeView === 'collection' ? 'active' : ''}`}
                onClick={() => handleNavClick('collection')}
              >
                Collection
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`tt-nav-item ${activeView === 'studio' || activeView === 'frames' ? 'active' : ''}`}
                onClick={() => handleNavClick('frames')}
              >
                Custom
              </button>
            </li>
          </ul>
        </nav>

        {/* Right: Cart, Admin & Mobile Hamburger */}
        <div className="tt-nav-actions">
          {/* Admin Panel Button (Image 1) */}
          <button
            type="button"
            className="tt-admin-panel-btn"
            onClick={onOpenAdminAuth || (isAdmin ? onOpenAdminDashboard : onOpenAdminLogin)}
            title="Admin Panel"
            aria-label="Admin Panel"
          >
            <Settings size={15} className="tt-admin-gear-icon" />
            <span>Admin Panel</span>
          </button>

          {/* Cart Icon / Badge Pill */}
          <button
            type="button"
            className={`tt-cart-pill-btn ${badgeBump ? 'tt-cart-bump' : ''}`}
            onClick={onOpenCart}
            aria-label={`Keranjang belanja (${cartCount} items)`}
          >
            <ShoppingBag size={18} />
            <span className="tt-cart-count">{cartCount}</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="tt-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="tt-mobile-menu">
          <ul className="tt-mobile-nav-list">
            <li>
              <button
                type="button"
                className={`tt-mobile-nav-item ${activeView === 'home' ? 'active' : ''}`}
                onClick={() => handleNavClick('home')}
              >
                Home
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`tt-mobile-nav-item ${activeView === 'collection' ? 'active' : ''}`}
                onClick={() => handleNavClick('collection')}
              >
                Collection
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`tt-mobile-nav-item ${activeView === 'studio' || activeView === 'frames' ? 'active' : ''}`}
                onClick={() => handleNavClick('frames')}
              >
                Custom Studio
              </button>
            </li>
            <li>
              <button
                type="button"
                className="tt-mobile-nav-item"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAdminAuth) onOpenAdminAuth();
                  else if (isAdmin) onOpenAdminDashboard();
                  else onOpenAdminLogin();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EEAB0A', fontWeight: 700 }}
              >
                <Settings size={16} />
                <span>Admin Panel</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
