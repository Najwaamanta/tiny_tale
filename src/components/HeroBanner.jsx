import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export const HERO_COLLECTIONS = [
  {
    id: 'col-bagcharm-sweet-pink',
    number: '01',
    subtitle: 'Sweet Aesthetic',
    title: 'PASTEL PINK CHARM',
    priceFormatted: 'Rp 15.000',
    cardImage: '/images/bagcharm_sweet_pink.jpg',
    bgImage: '/images/hero_bg_artisan.jpg',
    actionType: 'studio'
  },
  {
    id: 'col-pearl-star-bracelet',
    number: '02',
    subtitle: 'Handmade Beads',
    title: 'PEARL STAR BRACELET',
    priceFormatted: 'Rp 10.000',
    cardImage: '/images/bracelet_pearl_star.jpg',
    bgImage: '/images/hero_bg_bracelets.jpg',
    actionType: 'collection'
  },
  {
    id: 'col-white-pearl-bracelet',
    number: '03',
    subtitle: 'Minimal Star',
    title: 'WHITE PEARL STAR',
    priceFormatted: 'Rp 10.000',
    cardImage: '/images/bracelet_white_pearl.jpg',
    bgImage: '/images/hero_bg_bracelets.jpg',
    actionType: 'collection'
  },
  {
    id: 'col-sage-green-bracelet',
    number: '04',
    subtitle: 'Fresh Breeze',
    title: 'SAGE GREEN PEARL',
    priceFormatted: 'Rp 10.000',
    cardImage: '/images/bracelet_sage_green.jpg',
    bgImage: '/images/hero_bg_bracelets.jpg',
    actionType: 'collection'
  },
  {
    id: 'col-crystal-bloom-bracelet',
    number: '05',
    subtitle: 'Floral Bloom',
    title: 'CRYSTAL BLOOM',
    priceFormatted: 'Rp 10.000',
    cardImage: '/images/bracelet_crystal_bloom.jpg',
    bgImage: '/images/hero_bg_bracelets.jpg',
    actionType: 'collection'
  }
];

export default function HeroBanner({
  collections = [],
  onGoToStudio,
  onGoToCatalog,
  onSelectCategory,
  onSelectTemplate,
  onNavigateToCollection
}) {
  const displayCollections = (collections && collections.length > 0)
    ? collections.map((col, idx) => {
        const isGelang =
          col.type === 'gelang' ||
          col.category === 'bracelets' ||
          col.name?.toLowerCase().includes('bracelet') ||
          col.name?.toLowerCase().includes('gelang');

        let subtitle = isGelang ? 'Handmade Beads' : 'Sweet Aesthetic';
        if (col.highlights?.strap) {
          subtitle = col.highlights.strap.split('(')[0].trim();
        } else if (isGelang) {
          subtitle = 'Koleksi Gelang';
        }

        return {
          id: col.id,
          number: String(idx + 1).padStart(2, '0'),
          subtitle: subtitle,
          title: (col.name || 'Produk Koleksi').toUpperCase(),
          priceFormatted: col.priceFormatted || `Rp ${(col.price || 0).toLocaleString('id-ID')}`,
          cardImage: col.image || '/images/cat_bagcharms.png',
          bgImage: isGelang ? '/images/hero_bg_bracelets.jpg' : '/images/hero_bg_artisan.jpg',
          actionType: isGelang ? 'collection' : (col.isCustomizable ? 'studio' : 'collection'),
          rawItem: col
        };
      })
    : HERO_COLLECTIONS;

  const [activeIndex, setActiveIndex] = useState(0);

  const safeIndex = displayCollections.length > 0 ? (activeIndex % displayCollections.length) : 0;
  const activeCollection = displayCollections[safeIndex] || displayCollections[0] || HERO_COLLECTIONS[0];

  // Auto transition every 7s
  useEffect(() => {
    if (displayCollections.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayCollections.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [displayCollections.length]);

  // Handle arrow navigation
  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + displayCollections.length) % displayCollections.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % displayCollections.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayCollections.length]);

  // Handle card click - Clicking ANY card immediately navigates to collection page
  const handleCardClick = (index, collection) => {
    setActiveIndex(index);
    if (onNavigateToCollection) {
      onNavigateToCollection(collection.rawItem || collection);
    } else if (onSelectCategory) {
      if (
        collection.id.includes('bracelet') ||
        collection.subtitle.includes('Beads') ||
        collection.subtitle.includes('Star') ||
        collection.subtitle.includes('Bloom')
      ) {
        onSelectCategory('bracelets');
      } else if (
        collection.id.includes('frame') ||
        collection.subtitle.includes('Artisan') ||
        collection.subtitle.includes('Retro')
      ) {
        onSelectCategory('frames');
      } else {
        onSelectCategory('keychains');
      }
    } else if (onGoToCatalog) {
      onGoToCatalog();
    }
  };

  return (
    <section className="tt-hero-v2-container" aria-label="Tiny Tale Hero Showcase">
      {/* Background Image Slides with Crossfade */}
      <div className="tt-hero-v2-bg-wrapper">
        {displayCollections.slice(0, 8).map((col, index) => (
          <div
            key={col.id}
            className={`tt-hero-v2-bg-slide ${index === safeIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url("${col.bgImage}")` }}
            aria-hidden="true"
          />
        ))}
        {/* Multi-layered cinematic gradient overlays */}
        <div className="tt-hero-v2-overlay-left" />
        <div className="tt-hero-v2-overlay-bottom" />
        <div className="tt-hero-v2-overlay-top" />
      </div>

      {/* Main Content Layout */}
      <div className="tt-hero-v2-main-row">
        {/* Left Column: Headline, Descriptions, and Action Buttons (Exact Reference Match) */}
        <div className="tt-hero-v2-left">
          {/* Main Headline */}
          <h1 className="tt-hero-v2-title">
            CREATE SOMETHING<br />
            THAT'S YOURS
          </h1>

          {/* Descriptive text */}
          <p className="tt-hero-v2-desc">
            Personalized handmade accessories, created by you. Hand-assembled with your chosen photos and charms.
          </p>

          {/* Action Buttons: Circle icon + Pill button + WhatsApp button */}
          <div className="tt-hero-v2-actions">
            <button
              type="button"
              className="tt-hero-cta-circle-btn"
              onClick={onGoToStudio}
              title="Start Customizing"
              aria-label="Start Customizing"
            >
              <Sparkles size={18} />
            </button>

            <button
              type="button"
              className="tt-hero-cta-pill-btn"
              onClick={onGoToStudio}
              id="hero-start-customizing-btn"
            >
              START CUSTOMIZING
            </button>

            <a
              href="https://wa.me/6281318409891?text=Halo%20Tiny%20Tale%2C%20saya%20ingin%20tanya%20dan%20pesan%20aksesoris%20custom"
              target="_blank"
              rel="noopener noreferrer"
              className="tt-hero-cta-wa-btn"
              id="hero-wa-btn"
              title="Pesan via WhatsApp (+62 813-1840-9891)"
              style={{ textAlign: 'center', justifyContent: 'center' }}
            >
              <span style={{ textAlign: 'center', display: 'block', width: '100%' }}>PESAN VIA WHATSAPP</span>
            </a>
          </div>
        </div>

        {/* Right Column: 4 Cards Stack with Bleed to Right Edge (Exact Reference Match) */}
        <div className="tt-hero-v2-right">
          {/* Cards Viewport & Sliding Track */}
          <div
            className="tt-hero-cards-viewport"
            role="region"
            aria-label="Product Collections Slider"
          >
            <div
              className="tt-hero-cards-track"
              style={{
                transform: `translateX(-${safeIndex * 230}px)`
              }}
            >
              {displayCollections.map((col, index) => {
                const isActive = index === safeIndex;
                return (
                  <div
                    key={col.id}
                    className={`tt-hero-portrait-card ${isActive ? 'is-active' : ''}`}
                    onClick={() => handleCardClick(index, col)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardClick(index, col);
                      }
                    }}
                    aria-label={`Collection ${col.title}. ${isActive ? 'Currently active' : 'Click to select'}`}
                    aria-pressed={isActive}
                  >
                    {/* Card Photo (Clean top, exactly as in reference) */}
                    <img
                      src={col.cardImage}
                      alt={col.title}
                      className="tt-portrait-card-img"
                      loading="eager"
                    />

                    {/* Gradient Overlay */}
                    <div className="tt-portrait-card-gradient" />

                    {/* Bottom Card Typography (Exact Reference Match) */}
                    <div className="tt-portrait-card-info">
                      <span className="tt-portrait-cat">— {col.subtitle}</span>
                      <h3 className="tt-portrait-title">{col.title}</h3>
                      <span className="tt-portrait-price">{col.priceFormatted}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigation Controls Bar (Directly underneath the cards) */}
          <div className="tt-hero-controls-bar">
            {/* Arrow Buttons: Circular transparent rings */}
            <div className="tt-hero-nav-arrows">
              <button
                type="button"
                className="tt-hero-arrow-btn"
                onClick={handlePrev}
                aria-label="Previous collection"
                title="Previous collection"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="tt-hero-arrow-btn"
                onClick={handleNext}
                aria-label="Next collection"
                title="Next collection"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Horizontal Line Indicator */}
            <div className="tt-hero-progress-track">
              <div
                className="tt-hero-progress-fill"
                style={{
                  width: `${100 / displayCollections.length}%`,
                  transform: `translateX(${safeIndex * 100}%)`
                }}
              />
            </div>

            {/* Slide Counter on Right: "01", "02", etc. */}
            <div className="tt-hero-counter">
              <span className="tt-hero-counter-current">{activeCollection.number}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
