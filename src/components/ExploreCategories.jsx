import React from 'react';

export default function ExploreCategories({ onSelectCategory }) {
  const categories = [
    {
      id: 'bundling',
      title: 'Bundling Couple / Bestie',
      description: 'Paket hemat 2 pcs (Gelang & Bagcharm matching)',
      image: '/images/custom_bagcharm_blue.jpg',
      alt: 'Paket Bundling Couple / Bestie',
      bgClass: 'cat-card-mint'
    },
    {
      id: 'keychains',
      title: 'Keychains & Bagcharm',
      description: 'Personalized polaroids & paracord charms',
      image: '/images/cat_keychains.png',
      alt: 'Custom Keychains with Polaroids and Charms',
      bgClass: 'cat-card-lavender'
    },
    {
      id: 'bracelets',
      title: 'Bracelets (Gelang)',
      description: 'Pastel beaded customized word bracelets',
      image: '/images/cat_bracelets.png',
      alt: 'Pastel Beaded Word Bracelets',
      bgClass: 'cat-card-pink'
    }
  ];

  return (
    <section className="section-categories" id="explore-categories">
      <div className="container">
        <h2 className="section-title-left">Explore Categories</h2>

        <div className="categories-grid">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`category-card ${cat.bgClass}`}
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCategory && onSelectCategory(cat.id);
                }
              }}
              title={`Buka koleksi ${cat.title}`}
              aria-label={`Buka koleksi ${cat.title}`}
            >
              <div className="category-img-container">
                <img
                  src={cat.image}
                  alt={cat.alt}
                  className="category-img"
                  loading="lazy"
                />
              </div>

              <div className="category-info">
                <h3 className="category-card-title">{cat.title}</h3>
                <p className="category-card-desc">{cat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
