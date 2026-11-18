import React from 'react';
import { Sparkles, ArrowRight, Camera, Check } from 'lucide-react';
import { BAG_CHARM_FRAMES, PHOTOSTRIP_LAYOUTS } from '../data/initialData';

export const ALL_FRAME_TEMPLATES = [
  {
    id: 'frame-1',
    type: 'custom_frame',
    frameId: 'frame-1',
    layoutId: 'layout-a',
    name: 'Frame 1',
    subtitle: 'Size 6 x 2 Strip (2 Pose)',
    badge: 'Classic 2-Pose',
    badgeClass: 'badge-cyan',
    imageSrc: '/frames/1.png',
    isPublicFrame: true,
    description: 'Strip photobooth navy dengan tepi bergerigi perangko klasik dan ilustrasi sardine vintage.'
  },
    {
      id: 'frame-borcelle',
      type: 'custom_frame',
      frameId: 'frame-borcelle',
      layoutId: 'layout-a',
      name: 'Frame 2',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Mosaic Emblem',
      badgeClass: 'badge-lime',
      imageSrc: '/frames/2.png',
      isPublicFrame: true,
      description: 'Template eksklusif keramik mosaic hijau tua dengan plat logam Borcelle dan emblem Tiny Tale perak.'
    },
    {
      id: 'frame-3',
      type: 'custom_frame',
      frameId: 'frame-3',
      layoutId: 'layout-a',
      name: 'Frame 3',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Comic Arched',
      badgeClass: 'badge-purple',
      imageSrc: '/frames/3.png',
      overlayImage: '/frames/3_overlay.png',
      isPublicFrame: true,
      description: 'Frame lengkung hitam modern dengan aksen bintang kuning komik pop art nan playful.'
    },
    {
      id: 'frame-4',
      type: 'custom_frame',
      frameId: 'frame-4',
      layoutId: 'layout-a',
      name: 'Frame 4',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Sweet Floral',
      badgeClass: 'badge-rose',
      imageSrc: '/frames/4.png',
      overlayImage: '/frames/4_overlay.png',
      isPublicFrame: true,
      description: 'Desain bermotif garis pastel hijau-pink dengan hiasan bunga lili mekar nan anggun di sudut frame.'
    },
    {
      id: 'frame-the-moment',
      type: 'custom_frame',
      frameId: 'frame-the-moment',
      layoutId: 'layout-a',
      name: 'Frame 5',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Barcode Ticket',
      badgeClass: 'badge-purple',
      imageSrc: '/frames/5.png',
      isPublicFrame: true,
      description: 'Strip photobooth editorial hitam modern bergaya tiket archive dengan barcode unik dan tipografi Tiny Tale.'
    },
    {
      id: 'frame-6',
      type: 'custom_frame',
      frameId: 'frame-6',
      layoutId: 'layout-a',
      name: 'Frame 6',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Linen Dots',
      badgeClass: 'badge-lime',
      imageSrc: '/frames/6.png',
      isPublicFrame: true,
      description: 'Tekstur kain kanvas cokelat bertabur motif polkadot putih dengan pinggiran tiket dan teks MEMORIES.'
    },
    {
      id: 'frame-7',
      type: 'custom_frame',
      frameId: 'frame-7',
      layoutId: 'layout-a',
      name: 'Frame 7',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Pastel Dots',
      badgeClass: 'badge-rose',
      imageSrc: '/frames/7.png',
      isPublicFrame: true,
      description: 'Kain kanvas blush pink lembut dengan motif polkadot manis dan logo Tiny Tale.'
    },
    {
      id: 'frame-8',
      type: 'custom_frame',
      frameId: 'frame-8',
      layoutId: 'layout-a',
      name: 'Frame 8',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Lace Vintage',
      badgeClass: 'badge-lime',
      imageSrc: '/frames/8.png',
      overlayImage: '/frames/8_overlay.png',
      isPublicFrame: true,
      description: 'Tekstur goni halus warna sage green dengan bordir renda putih vintage di bagian bawah dan logo emas Tiny Tale.'
    },
    {
      id: 'frame-9',
      type: 'custom_frame',
      frameId: 'frame-9',
      layoutId: 'layout-a',
      name: 'Frame 9',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Mono Polka',
      badgeClass: 'badge-cyan',
      imageSrc: '/frames/9.png',
      isPublicFrame: true,
      description: 'Frame putih bersih berhias polkadot hitam kontras dengan tipografi Tiny Tale minimalis.'
    },
    {
      id: 'frame-10',
      type: 'custom_frame',
      frameId: 'frame-10',
      layoutId: 'layout-a',
      name: 'Frame 10',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Retro Dots',
      badgeClass: 'badge-purple',
      imageSrc: '/frames/10.png',
      overlayImage: '/frames/10_overlay.png',
      isPublicFrame: true,
      description: 'Kain katun hitam pekat dengan polkadot putih klasik yang timeless dan estetik.'
    },
    {
      id: 'frame-11',
      type: 'custom_frame',
      frameId: 'frame-11',
      layoutId: 'layout-a',
      name: 'Frame 11',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Hero Edition',
      badgeClass: 'badge-rose',
      imageSrc: '/frames/11.png',
      isPublicFrame: true,
      description: 'Desain photostrip berani bernuansa superhero komik dengan ornamen web crest dan gaya pop art.'
    },
    {
      id: 'frame-12',
      type: 'custom_frame',
      frameId: 'frame-12',
      layoutId: 'layout-a',
      name: 'Frame 12',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Artisan Stripe',
      badgeClass: 'badge-rose',
      imageSrc: '/frames/12.png',
      overlayImage: '/frames/12_overlay.png',
      isPublicFrame: true,
      description: 'Sapuan kuas cat air vertikal warna terracotta dan peach hangat dengan logo Tiny Tale silver.'
    },
    {
      id: 'frame-13',
      type: 'custom_frame',
      frameId: 'frame-13',
      layoutId: 'layout-a',
      name: 'Frame 13',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Indie Rock',
      badgeClass: 'badge-cyan',
      imageSrc: '/frames/13.png',
      overlayImage: '/frames/13_overlay.png',
      isPublicFrame: true,
      description: 'Nuansa rock indie 90-an dengan ornamen gitar elektrik, kaset pita vintage, dan pita film negatif.'
    },
    {
      id: 'frame-14',
      type: 'custom_frame',
      frameId: 'frame-14',
      layoutId: 'layout-a',
      name: 'Frame 14',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Pure Minimal',
      badgeClass: 'badge-cyan',
      imageSrc: '/frames/14.png',
      overlayImage: '/frames/14_overlay.png',
      isPublicFrame: true,
      description: 'Strip photobooth vertikal klasik 3 foto dengan border putih minimalis dan logo rose gold.'
    },
    {
      id: 'frame-15',
      type: 'custom_frame',
      frameId: 'frame-15',
      layoutId: 'layout-a',
      name: 'Frame 15',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Deep Navy',
      badgeClass: 'badge-purple',
      imageSrc: '/frames/15.png',
      overlayImage: '/frames/15_overlay.png',
      isPublicFrame: true,
      description: 'Warna biru midnight elegan yang memberikan kontras tajam nan estetik pada setiap foto kenanganmu.'
    },
    {
      id: 'frame-16',
      type: 'custom_frame',
      frameId: 'frame-16',
      layoutId: 'layout-a',
      name: 'Frame 16',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Onyx Black',
      badgeClass: 'badge-purple',
      imageSrc: '/frames/16.png',
      overlayImage: '/frames/16_overlay.png',
      isPublicFrame: true,
      description: 'Warna hitam pekat minimalis dengan aksen logo Tiny Tale emas bernuansa modern editorial.'
    },
    {
      id: 'frame-17',
      type: 'custom_frame',
      frameId: 'frame-17',
      layoutId: 'layout-a',
      name: 'Frame 17',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Maroon Velvet',
      badgeClass: 'badge-rose',
      imageSrc: '/frames/17.png',
      overlayImage: '/frames/17_overlay.png',
      isPublicFrame: true,
      description: 'Warna merah maroon anggun nan mewah dengan logo Tiny Tale emas berkilau hangat.'
    },
    {
      id: 'frame-18',
      type: 'custom_frame',
      frameId: 'frame-18',
      layoutId: 'layout-a',
      name: 'Frame 18',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Warm Mocha',
      badgeClass: 'badge-lime',
      imageSrc: '/frames/18.png',
      overlayImage: '/frames/18_overlay.png',
      isPublicFrame: true,
      description: 'Nuansa cokelat espresso hangat yang menenangkan dengan sentuhan logo metallic Tiny Tale.'
    },
    {
      id: 'frame-19',
      type: 'custom_frame',
      frameId: 'frame-19',
      layoutId: 'layout-a',
      name: 'Frame 19',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Luxury Foil',
      badgeClass: 'badge-purple',
      imageSrc: '/frames/19.png',
      overlayImage: '/frames/19_overlay.png',
      isPublicFrame: true,
      description: 'Sentuhan kemewahan tekstur foil burgundy dengan kilau metalik elegan dan logo timbul emas.'
    },
    {
      id: 'frame-20',
      type: 'custom_frame',
      frameId: 'frame-20',
      layoutId: 'layout-a',
      name: 'Frame 20',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Daisy Pastel',
      badgeClass: 'badge-lime',
      imageSrc: '/frames/20.png',
      overlayImage: '/frames/20_overlay.png',
      isPublicFrame: true,
      description: 'Desain manis bermotif bunga daisy ceria nan feminin dengan aksen pastel yang menyegarkan.'
    },
    {
      id: 'frame-21',
      type: 'custom_frame',
      frameId: 'frame-21',
      layoutId: 'layout-a',
      name: 'Frame 21',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Editorial News',
      badgeClass: 'badge-purple',
      imageSrc: '/frames/21.png',
      overlayImage: '/frames/21_overlay.png',
      isPublicFrame: true,
      description: 'Aksen kolase koran vintage bergaya retro monokrom yang estetik dan klasik.'
    },
    {
      id: 'frame-22',
      type: 'custom_frame',
      frameId: 'frame-22',
      layoutId: 'layout-a',
      name: 'Frame 22',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Lavender Dream',
      badgeClass: 'badge-purple',
      imageSrc: '/frames/22.png',
      overlayImage: '/frames/22_overlay.png',
      isPublicFrame: true,
      description: 'Gradasi ungu lavender lembut dengan detail bintang-bintang kilau impian.'
    },
    {
      id: 'frame-23',
      type: 'custom_frame',
      frameId: 'frame-23',
      layoutId: 'layout-a',
      name: 'Frame 23',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Golden Sunset',
      badgeClass: 'badge-rose',
      imageSrc: '/frames/23.png',
      overlayImage: '/frames/23_overlay.png',
      isPublicFrame: true,
      description: 'Nuansa hangat jingga senja keemasan yang memberikan kesan nostalgia manis.'
    },
    {
      id: 'frame-24',
      type: 'custom_frame',
      frameId: 'frame-24',
      layoutId: 'layout-a',
      name: 'Frame 24',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Botanical Leaf',
      badgeClass: 'badge-lime',
      imageSrc: '/frames/24.png',
      overlayImage: '/frames/24_overlay.png',
      isPublicFrame: true,
      description: 'Bingkai daun botani hijau pinus alami yang menenangkan dan organik.'
    },
    {
      id: 'frame-25',
      type: 'custom_frame',
      frameId: 'frame-25',
      layoutId: 'layout-a',
      name: 'Frame 25',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Cyber Y2K',
      badgeClass: 'badge-cyan',
      imageSrc: '/frames/25.png',
      overlayImage: '/frames/25_overlay.png',
      isPublicFrame: true,
      description: 'Gaya futuristik era 2000-an dengan elemen chrome metallic dan bintang tribal.'
    },
    {
      id: 'frame-26',
      type: 'custom_frame',
      frameId: 'frame-26',
      layoutId: 'layout-a',
      name: 'Frame 26',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Matcha Ribbon',
      badgeClass: 'badge-lime',
      imageSrc: '/frames/26.png',
      overlayImage: '/frames/26_overlay.png',
      isPublicFrame: true,
      description: 'Perpaduan warna hijau matcha dan pita krem aesthetic yang manis nan lembut.'
    },
    {
      id: 'frame-27',
      type: 'custom_frame',
      frameId: 'frame-27',
      layoutId: 'layout-a',
      name: 'Frame 27',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Fluffy Sky',
      badgeClass: 'badge-cyan',
      imageSrc: '/frames/27.png',
      overlayImage: '/frames/27_overlay.png',
      isPublicFrame: true,
      description: 'Langit biru cerah bertabur awan putih menggemaskan untuk memori penuh keceriaan.'
    },
    {
      id: 'frame-28',
      type: 'custom_frame',
      frameId: 'frame-28',
      layoutId: 'layout-a',
      name: 'Frame 28',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Coquette Pearl',
      badgeClass: 'badge-rose',
      imageSrc: '/frames/28.png',
      overlayImage: '/frames/28_overlay.png',
      isPublicFrame: true,
      description: 'Aksen pita coquette dan untaian mutiara anggun bernuansa dusty pink lembut.'
    },
    {
      id: 'frame-29',
      type: 'custom_frame',
      frameId: 'frame-29',
      layoutId: 'layout-a',
      name: 'Frame 29',
      subtitle: 'Size 6 x 2 Strip (3 Pose)',
      badge: 'Galaxy Star',
      badgeClass: 'badge-purple',
      imageSrc: '/frames/29.png',
      overlayImage: '/frames/29_overlay.png',
      isPublicFrame: true,
      description: 'Hamparan langit malam berbintang kosmik dengan garis konstelasi zodiak estetik.'
    },
    {
      id: 'frame-30',
      type: 'custom_frame',
      frameId: 'frame-30',
      layoutId: 'layout-b',
      name: 'Frame 30',
      subtitle: 'Size 6 x 2 Strip (4 Pose)',
      badge: 'Polaroid Gold',
      badgeClass: 'badge-cyan',
      imageSrc: '/frames/30.png',
      overlayImage: '/frames/30_overlay.png',
      isPublicFrame: true,
      description: 'Tampilan strip polaroid klasik dengan foil emas mewah dan tipografi kenangan.'
    }
  ];

export default function FrameLayoutSelector({ onSelectTemplate, selectedTemplateId }) {
  const allTemplates = ALL_FRAME_TEMPLATES;

  return (
    <section className="section-frame-selector" id="pilih-frame" style={{ paddingTop: '40px', paddingBottom: '70px' }}>
      <div className="container">
        {/* ========================================================
            CHOOSE YOUR LAYOUT - PHOTOBOOTH HEADER (MATCHING IMAGE 1)
            ======================================================== */}
        <div className="choose-layout-container" id="choose-layout">
          {/* Sparkle star decorations */}
          <div className="sparkle-decoration" style={{ top: '24px', left: '36px', fontSize: '1.8rem' }}>✦</div>
          <div className="sparkle-decoration" style={{ top: '38px', right: '48px', fontSize: '2.2rem' }}>✧</div>
          <div className="sparkle-decoration" style={{ bottom: '24px', left: '48px', fontSize: '1.4rem' }}>✧</div>
          <div className="sparkle-decoration" style={{ bottom: '28px', right: '64px', fontSize: '1.8rem' }}>✦</div>

          <div className="choose-layout-header">
            <h2 className="choose-layout-title">choose your layout</h2>
            <p className="choose-layout-note">NOTE: YOU HAVE 3 SECONDS FOR EACH SHOT</p>
            <p style={{ color: '#4B5563', fontSize: '0.88rem', marginTop: '6px' }}>
              Klik salah satu frame di bawah untuk mulai mengunggah foto dan merancang Bag Charm di studio kustomisasi.
            </p>
          </div>

          {/* Frame & Layout Cards Gallery */}
          <div className="photostrip-gallery" aria-label="Pilihan frame foto untuk bag charm">
            {allTemplates.map((template) => {
              const isSelected = selectedTemplateId === template.id;

              return (
                <div
                  key={template.id}
                  className={`photostrip-picker-card ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectTemplate(template)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onSelectTemplate(template)}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {/* Paper Strip Visual */}
                  <div
                    className="photostrip-paper"
                    style={{
                      position: 'relative',
                      background: template.isPublicFrame ? '#FAF8F5' : '#FFFFFF',
                      borderRadius: '8px',
                      padding: '10px 8px 14px 8px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minHeight: '290px'
                    }}
                  >
                    {isSelected && (
                      <span className="photostrip-active-badge">✓ Terpilih</span>
                    )}

                    {template.imageSrc ? (
                      /* Render public frame asset directly */
                      <div
                        style={{
                          width: '100%',
                          height: '240px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: '4px',
                          background: '#E5E7EB'
                        }}
                      >
                        <img
                          src={template.imageSrc}
                          alt={template.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '8px',
                            background: 'rgba(0,0,0,0.65)',
                            color: '#FFFFFF',
                            fontSize: '0.68rem',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            backdropFilter: 'blur(4px)'
                          }}
                        >
                          Frame Template
                        </div>
                      </div>
                    ) : (
                      /* Render Photostrip Preview Slots */
                      <div className="photostrip-slots-wrap" style={{ width: '100%' }}>
                        {template.isGrid ? (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', position: 'relative' }}>
                            {template.previewPhotos.map((imgUrl, pIdx) => (
                              <div key={pIdx} className="photostrip-thumb-slot" style={{ height: '42px' }}>
                                <img src={imgUrl} alt={`Pose ${pIdx + 1}`} />
                              </div>
                            ))}
                            {template.hasRibbon && (
                              <div
                                className="photostrip-ribbon-badge"
                                style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '-4px',
                                  right: '-4px',
                                  transform: 'translateY(-50%)',
                                  zIndex: 3
                                }}
                              >
                                {template.ribbonText}
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            {template.id === 'layout-b' ? (
                              <>
                                <div className="photostrip-thumb-slot" style={{ height: '44px' }}>
                                  <img src={template.previewPhotos[0]} alt="Pose 1" />
                                </div>
                                <div className="photostrip-thumb-slot" style={{ height: '44px' }}>
                                  <img src={template.previewPhotos[1]} alt="Pose 2" />
                                </div>
                                <div className="photostrip-ribbon-badge">{template.ribbonText}</div>
                                <div className="photostrip-thumb-slot" style={{ height: '44px' }}>
                                  <img src={template.previewPhotos[2]} alt="Pose 3" />
                                </div>
                                <div className="photostrip-thumb-slot" style={{ height: '44px' }}>
                                  <img src={template.previewPhotos[3]} alt="Pose 4" />
                                </div>
                              </>
                            ) : template.id === 'layout-c' ? (
                              <>
                                <div className="photostrip-thumb-slot" style={{ height: '88px' }}>
                                  <img src={template.previewPhotos[0]} alt="Pose 1" />
                                </div>
                                <div className="photostrip-ribbon-badge">{template.ribbonText}</div>
                                <div className="photostrip-thumb-slot" style={{ height: '88px' }}>
                                  <img src={template.previewPhotos[1]} alt="Pose 2" />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="photostrip-thumb-slot" style={{ height: '58px' }}>
                                  <img src={template.previewPhotos[0]} alt="Pose 1" />
                                </div>
                                <div className="photostrip-thumb-slot" style={{ height: '58px' }}>
                                  <img src={template.previewPhotos[1]} alt="Pose 2" />
                                </div>
                                <div className="photostrip-thumb-slot" style={{ height: '58px' }}>
                                  <img src={template.previewPhotos[2]} alt="Pose 3" />
                                </div>
                              </>
                            )}
                          </>
                        )}
                        <div className="photostrip-footer-text">
                          photobooth <br />
                          <span style={{ fontSize: '0.45rem', color: '#64748B' }}>23.09.2026</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Metadata below card */}
                  <div className="photostrip-meta" style={{ marginTop: '12px', textAlign: 'center' }}>
                    <div className="photostrip-label" style={{ fontSize: '1rem', fontWeight: 800 }}>
                      {template.name}
                    </div>
                    <div className="photostrip-subtext" style={{ fontSize: '0.78rem', color: '#6B7280', margin: '4px 0 0' }}>
                      {template.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
