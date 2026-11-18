import React from 'react';

export const RECOMMENDATION_ITEMS = [
  {
    id: 'rec-2',
    name: 'Sweet Pastel Pink Bagcharm',
    price: 15000,
    priceFormatted: 'Rp 15.000',
    image: '/images/bagcharm_sweet_pink.jpg',
    productType: 'bag_charm',
    templateId: 'layout-a'
  },
  {
    id: 'rec-3',
    name: 'Stealth Tactical Black Bagcharm',
    price: 15000,
    priceFormatted: 'Rp 15.000',
    image: '/images/bagcharm_tactical_black.jpg',
    productType: 'bag_charm',
    templateId: 'layout-a'
  },
  {
    id: 'rec-4',
    name: 'Classic Black & Red Polaroid Bagcharm',
    price: 15000,
    priceFormatted: 'Rp 15.000',
    image: '/images/bagcharm_polaroid_red_black.jpg',
    productType: 'bag_charm',
    templateId: 'layout-a'
  },
  {
    id: 'rec-5',
    name: 'Autumn Earthy Mocha Bagcharm',
    price: 15000,
    priceFormatted: 'Rp 15.000',
    image: '/images/bagcharm_earthy_mocha.jpg',
    productType: 'bag_charm',
    templateId: 'layout-a'
  },
  {
    id: 'rec-6',
    name: 'Pearl Star Charm Bracelet',
    price: 10000,
    priceFormatted: 'Rp 10.000',
    image: '/images/bracelet_pearl_star.jpg',
    productType: 'gelang'
  }
];

export default function RecommendationSection({ onCustomizeItem, onAddToCart }) {
  const isBracelet = (item) => item.productType === 'gelang';

  return (
    <section className="section-recommendation" id="recommendation">
      <div className="container">
        <h2 className="section-title-center">Recommendation</h2>

        <div className="recommendation-grid">
          {RECOMMENDATION_ITEMS.map((item) => {
            const bracelet = isBracelet(item);

            return (
              <div key={item.id} className="rec-card">
                <div className="rec-img-container">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="rec-img"
                    loading="lazy"
                  />
                </div>

                <div className="rec-card-body">
                  <h3 className="rec-card-title">{item.name}</h3>
                  <div className="rec-price-row">
                    <span className="rec-price-label">{bracelet ? 'Harga: ' : 'Starting from '}</span>
                    <span className="rec-price-amount">{item.priceFormatted}</span>
                  </div>

                  <div className="rec-action-wrapper">
                    {!bracelet ? (
                      <>
                        <span className="rec-customize-text">Customize</span>
                        <button
                          type="button"
                          className="rec-lavender-bar"
                          onClick={() => onCustomizeItem && onCustomizeItem(item)}
                          aria-label={`Customize ${item.name}`}
                        >
                          <span className="rec-bar-label">Customize</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="rec-lavender-bar"
                          onClick={() => {
                            if (onAddToCart) {
                              onAddToCart({
                                productType: 'gelang',
                                title: item.name,
                                unitPrice: item.price,
                                quantity: 1,
                                subtotal: item.price,
                                image: item.image
                              });
                            } else if (onCustomizeItem) {
                              onCustomizeItem(item);
                            }
                          }}
                          aria-label={`Beli ${item.name}`}
                          style={{ marginTop: '16px' }}
                        >
                          <span className="rec-bar-label">+ Keranjang ({item.priceFormatted})</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
