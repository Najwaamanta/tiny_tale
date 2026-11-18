import React from 'react';
import { Star } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      quote: '"Honestly obsessed with my photo keychain! The polaroid frame is so cute and the photo quality came out perfect."',
      author: 'Alisha R.',
      rating: 5
    },
    {
      id: 2,
      quote: '"Got matching custom bracelets for me and my partner. Super premium feel and fast WhatsApp updates."',
      author: 'Kevin M.',
      rating: 5
    },
    {
      id: 3,
      quote: '"My custom lavender phone charm gets compliments literally every single day. 10/10 customizer was so fun to use."',
      author: 'Nisha T.',
      rating: 5
    }
  ];

  return (
    <section className="section-testimonials" id="testimonials">
      <div className="container">
        <h2 className="section-title-left">Loved by Collectors</h2>

        <div className="testimonials-grid">
          {testimonials.map((item) => (
            <div key={item.id} className="testimonial-card">
              <div className="testimonial-stars" aria-label={`${item.rating} out of 5 stars`}>
                {[...Array(item.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="testimonial-star-icon"
                    strokeWidth={1.8}
                  />
                ))}
              </div>

              <blockquote className="testimonial-quote">
                {item.quote}
              </blockquote>

              <div className="testimonial-author">
                {item.author}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
