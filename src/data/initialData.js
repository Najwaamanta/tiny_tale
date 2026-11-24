// Initial seed data for Atelier Craft Lab
// Unisex Modern Custom Accessories Store

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-bag-charm',
    type: 'bag_charm',
    name: 'Custom Bag Charm',
    subtitle: 'Gantungan Tas Kustom Unisex',
    tagline: 'Tactical, Y2K, or Cyberpunk — Rancang gantungan tas sesuai identitasmu.',
    basePrice: 15000,
    estimatedCraftTime: '1-2 Hari Kerja',
    description: 'Bag charm kokoh dengan material premium carabiner aerospace/alloy, tali paracord 550 militer atau rantai chunky, serta opsi hanging charm & inisial nama.',
    bases: [
      { id: 'base-bc-tactical', name: 'Tactical Paracord Weave', price: 0, previewType: 'paracord', defaultCordColor: '#1A1D20', maxCharms: 6, maxLetters: 6 },
      { id: 'base-bc-chain', name: 'Heavy Cuban Chain', price: 15000, previewType: 'cuban_chain', defaultCordColor: '#A0AEC0', maxCharms: 6, maxLetters: 4 },
      { id: 'base-bc-leather', name: 'Raw Leather & Ring', price: 20000, previewType: 'leather_strap', defaultCordColor: '#3E2723', maxCharms: 5, maxLetters: 5 },
      { id: 'base-bc-hybrid', name: 'Dual Utility Cord + Webbing', price: 12000, previewType: 'hybrid_cord', defaultCordColor: '#00F2FE', maxCharms: 7, maxLetters: 8 }
    ],
    hardwareFinishes: [
      { id: 'hw-matte-black', name: 'Matte Stealth Black', color: '#181A1F', border: '#2D3748' },
      { id: 'hw-chrome-silver', name: 'Liquid Chrome Silver', color: '#DCE2E6', border: '#CBD5E0' },
      { id: 'hw-titanium-gunmetal', name: 'Titanium Gunmetal', color: '#4A5568', border: '#718096' },
      { id: 'hw-antique-gold', name: 'Cyber Gold Brass', color: '#D4AF37', border: '#ECC94B' }
    ]
  },
  {
    id: 'prod-gelang',
    type: 'gelang',
    name: 'Custom Bracelet (Gelang)',
    subtitle: 'Gelang Rantai & Paracord Kustom',
    tagline: 'Kombinasi rantai metal, knot cord, pelat nama, dan charm eksklusif.',
    basePrice: 10000,
    estimatedCraftTime: '1 Hari Kerja',
    description: 'Gelang unisex dengan lock clasp magnetik atau serut paracord adjustable. Nyaman dipakai harian, anti-karat, dan tahan air.',
    bases: [
      { id: 'base-br-cuban', name: 'Cuban Link Chain 8mm', price: 15000, previewType: 'cuban_chain', defaultCordColor: '#CBD5E1', maxCharms: 5, maxLetters: 4 },
      { id: 'base-br-paracord', name: 'Adjustable Sliding Knot Cord', price: 0, previewType: 'paracord', defaultCordColor: '#1E293B', maxCharms: 5, maxLetters: 6 },
      { id: 'base-br-milanese', name: 'Milanese Mesh Band', price: 25000, previewType: 'mesh', defaultCordColor: '#475569', maxCharms: 4, maxLetters: 4 },
      { id: 'base-br-beads', name: 'Obsidian & Hematite Bead Base', price: 18000, previewType: 'beads_loop', defaultCordColor: '#0F172A', maxCharms: 5, maxLetters: 6 }
    ],
    hardwareFinishes: [
      { id: 'hw-matte-black', name: 'Matte Stealth Black', color: '#181A1F', border: '#2D3748' },
      { id: 'hw-chrome-silver', name: 'Liquid Chrome Silver', color: '#DCE2E6', border: '#CBD5E0' },
      { id: 'hw-titanium-gunmetal', name: 'Titanium Gunmetal', color: '#4A5568', border: '#718096' }
    ]
  }
];

export const INITIAL_CORD_COLORS = [
  { id: 'col-hitam-polos', name: 'Hitam Polos', type: 'polos', hex: '#18181B', textHex: '#ffffff', hasSpeckle: false, speckle: null, badge: 'Polos' },
  { id: 'col-putih-polos', name: 'Putih Polos', type: 'polos', hex: '#FFFFFF', border: '#CBD5E1', textHex: '#000000', hasSpeckle: false, speckle: null, badge: 'Polos' },
  { id: 'col-marun-polos', name: 'Marun Polos', type: 'polos', hex: '#7F1D1D', textHex: '#ffffff', hasSpeckle: false, speckle: null, badge: 'Polos' },
  { id: 'col-pink-muda', name: 'Pink Muda', type: 'bintik', hex: '#F9A8D4', textHex: '#831843', hasSpeckle: true, speckle: '#FFFFFF', badge: 'Bintik' },
  { id: 'col-kuning-muda', name: 'Kuning Muda', type: 'bintik', hex: '#FDE047', textHex: '#713F12', hasSpeckle: true, speckle: '#FFFFFF', badge: 'Bintik' },
  { id: 'col-biru-muda', name: 'Biru Muda', type: 'bintik', hex: '#93C5FD', textHex: '#1E3A8A', hasSpeckle: true, speckle: '#FFFFFF', badge: 'Bintik' },
  { id: 'col-coklat-muda', name: 'Coklat Muda', type: 'bintik', hex: '#B08968', textHex: '#3E2723', hasSpeckle: true, speckle: '#FFFBEB', badge: 'Bintik' }
];

export const PARACORD_MODELS = [
  {
    id: 'twisted-loop-tassel',
    name: 'Twisted Loop & Dual Tassel',
    desc: 'Model lilitan loop dengan 2 ujung simpul rumbai menjuntai (Sesuai Foto)',
    badge: 'Sesuai Foto',
    icon: '➰'
  },
  {
    id: 'tactical-snake-knot',
    name: 'Tactical Cobra / Snake Knot',
    desc: 'Anyaman tebal silang khas paracord militer menjuntai lurus',
    badge: 'Streetwear',
    icon: '🪢'
  },
  {
    id: 'spiral-pastel-cord',
    name: 'Pastel Aesthetic Rope',
    desc: 'Tali tambang pilin lembut dengan simpul pita aesthetic',
    badge: 'Cute Y2K',
    icon: '🎀'
  },
  {
    id: 'double-loop-wave',
    name: 'Dual Hanging Loop',
    desc: 'Dua untaian loop berjenjang dinamis & estetik',
    badge: 'Minimalist',
    icon: '⛓️'
  }
];

export const PARACORD_LENGTHS = [
  {
    id: 'medium',
    name: 'Medium — Setinggi Slot 2',
    desc: 'Menjuntai hingga Slot Foto 2 (~55% panjang photostrip)',
    badge: 'Sesuai Foto',
    loopEndY: 325,
    tassel1EndY: 265,
    tassel2EndY: 285
  },
  {
    id: 'long',
    name: 'Long Dangle — Setinggi Slot 3',
    desc: 'Menjuntai panjang hingga Slot Foto 3 (~75% frame)',
    badge: 'Ekstra Menjuntai',
    loopEndY: 410,
    tassel1EndY: 345,
    tassel2EndY: 370
  },
  {
    id: 'short',
    name: 'Compact Short — Setinggi Slot 1',
    desc: 'Ringkas setinggi Slot Foto 1 (~35% frame)',
    badge: 'Ringkas',
    loopEndY: 235,
    tassel1EndY: 195,
    tassel2EndY: 210
  }
];

export const ACCENT_COLORS = [
  { id: 'hitam', name: 'Hitam', hex: '#181A1F', border: '#000000' },
  { id: 'putih', name: 'Putih', hex: '#FFFFFF', border: '#CBD5E1' },
  { id: 'cokelat', name: 'Coklat Muda', hex: '#B08968', border: '#6F4E2F' }
];

export const PARACORD_ACCENTS = [
  {
    id: 'bell-white',
    name: 'Lonceng Mini Putih',
    desc: 'Lonceng enamel putih bulat (Seperti di Foto)',
    color: '#FFFFFF',
    border: '#CBD5E1',
    type: 'bell',
    badge: 'Sesuai Foto'
  },
  {
    id: 'bell-silver',
    name: 'Lonceng Mini Silver Logam',
    desc: 'Lonceng krom logam mengkilap',
    color: '#DCE2E6',
    border: '#94A3B8',
    type: 'bell'
  },
  {
    id: 'bell-gold',
    name: 'Lonceng Cyber Gold',
    desc: 'Lonceng finishing emas metalik',
    color: '#F3E5AB',
    border: '#D4AF37',
    type: 'bell'
  },
  {
    id: 'star-acrylic-black',
    name: 'Bintang Wavy Akrilik Hitam',
    desc: 'Liontin bintang wavy hollow hitam (Seperti di Foto)',
    color: '#181A1F',
    border: '#000000',
    type: 'star',
    badge: 'Sesuai Foto'
  },
  {
    id: 'none',
    name: 'Tanpa Aksen Tambahan',
    desc: 'Hanya tali paracord murni',
    type: 'none'
  }
];

export const INITIAL_CHARMS = [
  { id: 'ch-gitar', name: 'Gitar', category: 'metal', price: 5000, stock: 50, icon: '🎸', image: '/images/charm_guitar.png', desc: 'Charm liontin gitar mini aesthetic' },
  { id: 'ch-boneka-puppy', name: 'Boneka Puppy', category: 'cute', price: 5000, stock: 50, icon: '🐶', image: '/images/charm_balloon_puppy.jpg', desc: 'Charm liontin balloon puppy chrome silver aesthetic' }
];

export const INITIAL_PRESETS = [
  {
    id: 'preset-1',
    productType: 'bag_charm',
    name: 'Cyberpunk Tactical V1',
    subtitle: 'Streetwear & Utility Unisex Bag Charm',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80',
    price: 98000,
    tags: ['Best Seller', 'Tactical', 'Unisex'],
    config: {
      productType: 'bag_charm',
      baseId: 'base-bc-tactical',
      hardwareId: 'hw-matte-black',
      cordColor: '#111317',
      customLetters: 'CYBER',
      selectedCharms: ['ch-chrome-dice', 'ch-cyber-star', 'ch-barcode-tag']
    }
  },
  {
    id: 'preset-2',
    productType: 'gelang',
    name: 'Chunky Cuban Monogram',
    subtitle: 'Gelang Rantai Heavy Metal & Inisial',
    image: 'https://images.unsplash.com/photo-1611591475155-42e9fba5ce55?auto=format&fit=crop&w=700&q=80',
    price: 89000,
    tags: ['Trending', 'Minimalist', 'Waterproof'],
    config: {
      productType: 'gelang',
      baseId: 'base-br-cuban',
      hardwareId: 'hw-chrome-silver',
      cordColor: '#94A3B8',
      customLetters: 'AT92',
      selectedCharms: ['ch-liquid-drop', 'ch-flame-tag']
    }
  },
  {
    id: 'preset-4',
    productType: 'bag_charm',
    name: 'Raw Obsidian & Voyager Charm',
    subtitle: 'Kombinasi Kulit Asli & Batu Alam',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=700&q=80',
    price: 115000,
    tags: ['Premium', 'Dark Aesthetic', 'Unisex'],
    config: {
      productType: 'bag_charm',
      baseId: 'base-bc-leather',
      hardwareId: 'hw-titanium-gunmetal',
      cordColor: '#111317',
      customLetters: 'VOID',
      selectedCharms: ['ch-astro-tag', 'ch-obsidian-crystal']
    }
  }
];

export const INITIAL_ORDERS = [];

export const SAMPLE_FRAME_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80'
];

export const BAG_CHARM_FRAMES = [
  {
    id: 'frame-1',
    name: 'Frame 1',
    subtitle: 'Classic Perforated Stamp & Sardines',
    badge: '2 Slot Stamp',
    image: '/frames/1.png',
    overlayImage: '/frames/1_overlay.png',
    slotShape: 'rect',
    slots: [
      { id: 1, label: 'Foto 1 (Atas)', top: '17.2%', left: '14.0%', width: '71.9%', height: '22.5%', borderRadius: '0px' },
      { id: 2, label: 'Foto 2 (Bawah)', top: '72.4%', left: '14.0%', width: '71.9%', height: '22.6%', borderRadius: '0px' }
    ],
    accentColor: '#133155',
    tagline: 'Strip photobooth navy dengan tepi bergerigi perangko klasik dan ilustrasi sardine vintage.'
  },
  {
    id: 'frame-borcelle',
    name: 'Frame 2',
    subtitle: 'Classic Green Tile & Silver Emblem',
    badge: '3 Slot Mosaic',
    image: '/frames/2.png',
    overlayImage: '/frames/2_overlay.png',
    slotShape: 'rect',
    slots: [
      { id: 1, label: 'Foto 1 (Atas)', top: '4.6%', left: '11.8%', width: '77.1%', height: '24.1%', borderRadius: '0px' },
      { id: 2, label: 'Foto 2 (Tengah)', top: '31.0%', left: '11.8%', width: '77.1%', height: '24.1%', borderRadius: '0px' },
      { id: 3, label: 'Foto 3 (Bawah)', top: '57.4%', left: '11.8%', width: '77.1%', height: '24.1%', borderRadius: '0px' }
    ],
    accentColor: '#1B4D3E',
    tagline: 'Nuansa vintage mosaic dengan plat silver Borcelle dan 3 jendela foto elegan.'
  },
  {
    id: 'frame-the-moment',
    name: 'Frame 5',
    subtitle: 'Modern Ticket & Barcode Strip',
    badge: '3 Slot Persegi',
    image: '/frames/5.png',
    overlayImage: '/frames/5_overlay.png',
    slotShape: 'rect',
    slots: [
      { id: 1, label: 'Foto 1 (Atas)', top: '8.9%', left: '10.8%', width: '79.4%', height: '24.6%', borderRadius: '0px' },
      { id: 2, label: 'Foto 2 (Tengah)', top: '34.8%', left: '10.8%', width: '79.4%', height: '24.6%', borderRadius: '0px' },
      { id: 3, label: 'Foto 3 (Bawah)', top: '60.8%', left: '10.8%', width: '79.4%', height: '24.5%', borderRadius: '0px' }
    ],
    accentColor: '#1E1E1E',
    tagline: 'Gaya strip photobooth minimalis dengan tipografi Archive Memory dan 3 slot foto portrait.'
  },
  {
    id: 'frame-3',
    name: 'Frame 3',
    subtitle: 'Night Arched & Pop Comic Star',
    badge: '3 Slot Arched',
    image: '/frames/3.png',
    overlayImage: '/frames/3_overlay.png',
    slotShape: 'rect',
    slots: [
      { id: 1, label: 'Foto 1 (Atas)', top: '6.3%', left: '9.7%', width: '82.2%', height: '25.8%', borderRadius: '0px' },
      { id: 2, label: 'Foto 2 (Tengah)', top: '35.0%', left: '9.7%', width: '82.2%', height: '25.8%', borderRadius: '0px' },
      { id: 3, label: 'Foto 3 (Bawah)', top: '63.8%', left: '9.7%', width: '82.2%', height: '25.7%', borderRadius: '0px' }
    ],
    accentColor: '#121212',
    tagline: 'Frame lengkung hitam modern dengan aksen bintang kuning komik pop art nan playful.'
  },
  {
    id: 'frame-4',
    name: 'Frame 4',
    subtitle: 'Pastel Stripes & Elegant Lily Bloom',
    badge: '3 Slot Floral',
    image: '/frames/4.png',
    overlayImage: '/frames/4_overlay.png',
    slotShape: 'rect',
    slots: [
      { id: 1, label: 'Foto 1 (Atas)', top: '14.1%', left: '9.0%', width: '82.0%', height: '22.2%', borderRadius: '0px' },
      { id: 2, label: 'Foto 2 (Tengah)', top: '40.5%', left: '9.0%', width: '82.0%', height: '22.7%', borderRadius: '0px' },
      { id: 3, label: 'Foto 3 (Bawah)', top: '67.5%', left: '9.0%', width: '82.0%', height: '23.8%', borderRadius: '0px' }
    ],
    accentColor: '#B96A9C',
    tagline: 'Desain bermotif garis pastel hijau-pink dengan hiasan bunga lili mekar nan anggun di sudut frame.'
  }
];

export const FRAME_SLOTS_MAP = {
  'frame-1': [
    { id: 1, label: 'Foto 1 (Atas)', top: '17.2%', left: '14.0%', width: '71.9%', height: '22.5%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Bawah)', top: '72.4%', left: '14.0%', width: '71.9%', height: '22.6%', borderRadius: '0px' }
  ],
  'frame-2': [
    { id: 1, label: 'Foto 1 (Atas)', top: '4.6%', left: '11.8%', width: '77.1%', height: '24.1%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '31.0%', left: '11.8%', width: '77.1%', height: '24.1%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '57.4%', left: '11.8%', width: '77.1%', height: '24.1%', borderRadius: '0px' }
  ],
  'frame-borcelle': [
    { id: 1, label: 'Foto 1 (Atas)', top: '4.6%', left: '11.8%', width: '77.1%', height: '24.1%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '31.0%', left: '11.8%', width: '77.1%', height: '24.1%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '57.4%', left: '11.8%', width: '77.1%', height: '24.1%', borderRadius: '0px' }
  ],
  'frame-3': [
    { id: 1, label: 'Foto 1 (Atas)', top: '6.3%', left: '9.7%', width: '82.2%', height: '25.8%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '35.0%', left: '9.7%', width: '82.2%', height: '25.8%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '63.8%', left: '9.7%', width: '82.2%', height: '25.7%', borderRadius: '0px' }
  ],
  'frame-4': [
    { id: 1, label: 'Foto 1 (Atas)', top: '14.1%', left: '9.0%', width: '82.0%', height: '22.2%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '40.5%', left: '9.0%', width: '82.0%', height: '22.7%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '67.5%', left: '9.0%', width: '82.0%', height: '23.8%', borderRadius: '0px' }
  ],
  'frame-5': [
    { id: 1, label: 'Foto 1 (Atas)', top: '8.9%', left: '10.8%', width: '79.4%', height: '24.6%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '34.8%', left: '10.8%', width: '79.4%', height: '24.6%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '60.8%', left: '10.8%', width: '79.4%', height: '24.5%', borderRadius: '0px' }
  ],
  'frame-the-moment': [
    { id: 1, label: 'Foto 1 (Atas)', top: '8.9%', left: '10.8%', width: '79.4%', height: '24.6%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '34.8%', left: '10.8%', width: '79.4%', height: '24.6%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '60.8%', left: '10.8%', width: '79.4%', height: '24.5%', borderRadius: '0px' }
  ],
  'frame-6': [
    { id: 1, label: 'Foto 1 (Atas)', top: '4.3%', left: '10.6%', width: '78.8%', height: '25.3%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '31.8%', left: '10.6%', width: '78.8%', height: '25.3%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '59.3%', left: '10.6%', width: '78.8%', height: '25.3%', borderRadius: '0px' }
  ],
  'frame-7': [
    { id: 1, label: 'Foto 1 (Atas)', top: '12.6%', left: '10.0%', width: '81.6%', height: '25.4%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '40.4%', left: '10.0%', width: '81.6%', height: '25.4%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '68.1%', left: '10.0%', width: '81.6%', height: '25.4%', borderRadius: '0px' }
  ],
  'frame-8': [
    { id: 1, label: 'Foto 1 (Atas)', top: '3.5%', left: '8.8%', width: '82.5%', height: '25.8%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '30.7%', left: '8.8%', width: '82.5%', height: '25.8%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '58.0%', left: '8.8%', width: '82.5%', height: '25.8%', borderRadius: '0px' }
  ],
  'frame-9': [
    { id: 1, label: 'Foto 1 (Atas)', top: '3.1%', left: '7.1%', width: '85.2%', height: '25.5%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '30.8%', left: '7.1%', width: '85.2%', height: '25.4%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '58.4%', left: '7.1%', width: '85.2%', height: '25.5%', borderRadius: '0px' }
  ],
  'frame-10': [
    { id: 1, label: 'Foto 1 (Atas)', top: '10.7%', left: '11.3%', width: '78.6%', height: '25.8%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '38.8%', left: '11.3%', width: '78.6%', height: '25.8%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '67.0%', left: '11.3%', width: '78.6%', height: '25.8%', borderRadius: '0px' }
  ],
  'frame-11': [
    { id: 1, label: 'Foto 1 (Atas)', top: '4.3%', left: '8.2%', width: '83.4%', height: '26.1%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '32.7%', left: '8.2%', width: '83.4%', height: '26.1%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '61.1%', left: '8.2%', width: '83.4%', height: '26.1%', borderRadius: '0px' }
  ],
  'frame-12': [
    { id: 1, label: 'Foto 1 (Atas)', top: '10.3%', left: '11.6%', width: '76.8%', height: '24.0%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '36.4%', left: '11.6%', width: '76.8%', height: '24.0%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '65.9%', left: '12.4%', width: '76.8%', height: '21.4%', borderRadius: '0px' }
  ],
  'frame-13': [
    { id: 1, label: 'Foto 1 (Atas)', top: '4.3%', left: '7.7%', width: '84.6%', height: '26.5%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '33.1%', left: '7.7%', width: '84.6%', height: '26.5%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '61.8%', left: '7.7%', width: '84.6%', height: '26.5%', borderRadius: '0px' }
  ],
  'frame-14': [
    { id: 1, label: 'Foto 1 (Atas)', top: '4.3%', left: '8.8%', width: '82.3%', height: '25.7%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '32.3%', left: '8.8%', width: '82.3%', height: '25.7%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '60.2%', left: '8.8%', width: '82.3%', height: '25.7%', borderRadius: '0px' }
  ],
  'frame-15': [
    { id: 1, label: 'Foto 1 (Atas)', top: '4.3%', left: '8.4%', width: '83.3%', height: '26.1%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '32.6%', left: '8.4%', width: '83.3%', height: '26.0%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '60.9%', left: '8.4%', width: '83.3%', height: '26.0%', borderRadius: '0px' }
  ],
  'frame-16': [
    { id: 1, label: 'Foto 1 (Atas)', top: '4.3%', left: '8.1%', width: '83.6%', height: '26.2%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '32.7%', left: '8.1%', width: '83.6%', height: '26.2%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '61.1%', left: '8.1%', width: '83.6%', height: '26.2%', borderRadius: '0px' }
  ],
  'frame-17': [
    { id: 1, label: 'Foto 1 (Atas)', top: '5.7%', left: '9.3%', width: '82.2%', height: '25.7%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '33.7%', left: '9.3%', width: '82.2%', height: '25.7%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '61.6%', left: '9.3%', width: '82.2%', height: '25.7%', borderRadius: '0px' }
  ],
  'frame-18': [
    { id: 1, label: 'Foto 1 (Atas)', top: '4.2%', left: '8.8%', width: '82.5%', height: '25.8%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '32.1%', left: '8.8%', width: '82.5%', height: '25.8%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '60.0%', left: '8.8%', width: '82.5%', height: '25.8%', borderRadius: '0px' }
  ],
  'frame-19': [
    { id: 1, label: 'Foto 1 (Atas)', top: '4.3%', left: '13.2%', width: '73.5%', height: '23.1%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '30.1%', left: '13.2%', width: '73.5%', height: '23.1%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '55.9%', left: '13.2%', width: '73.5%', height: '23.1%', borderRadius: '0px' }
  ],
  'frame-20': [
    { id: 1, label: 'Foto 1 (Atas)', top: '6.5%', left: '12.1%', width: '80.7%', height: '25.2%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '33.4%', left: '12.1%', width: '80.7%', height: '25.2%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '60.3%', left: '12.1%', width: '80.7%', height: '25.2%', borderRadius: '0px' }
  ],
  'frame-21': [
    { id: 1, label: 'Foto 1 (Atas)', top: '4.3%', left: '9.0%', width: '82.0%', height: '25.6%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '30.7%', left: '9.0%', width: '82.0%', height: '25.6%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '57.0%', left: '9.0%', width: '82.0%', height: '25.6%', borderRadius: '0px' }
  ],
  'frame-22': [
    { id: 1, label: 'Foto 1 (Atas)', top: '3.3%', left: '8.4%', width: '85.3%', height: '27.0%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '33.3%', left: '8.4%', width: '85.3%', height: '27.0%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '63.3%', left: '8.4%', width: '85.3%', height: '27.0%', borderRadius: '0px' }
  ],
  'frame-23': [
    { id: 1, label: 'Foto 1 (Atas)', top: '4.8%', left: '11.2%', width: '79.6%', height: '24.6%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '32.6%', left: '11.2%', width: '79.6%', height: '24.6%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '60.2%', left: '11.2%', width: '79.6%', height: '24.6%', borderRadius: '0px' }
  ],
  'frame-24': [
    { id: 1, label: 'Foto 1 (Atas)', top: '4.8%', left: '9.9%', width: '80.9%', height: '24.9%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '32.1%', left: '9.9%', width: '80.9%', height: '24.9%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '59.6%', left: '9.9%', width: '80.9%', height: '24.8%', borderRadius: '0px' }
  ],
  'frame-25': [
    { id: 1, label: 'Foto 1 (Atas)', top: '3.6%', left: '8.0%', width: '84.3%', height: '26.2%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '31.8%', left: '7.8%', width: '84.3%', height: '26.2%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '60.2%', left: '7.8%', width: '84.3%', height: '26.2%', borderRadius: '0px' }
  ],
  'frame-26': [
    { id: 1, label: 'Foto 1 (Atas)', top: '7.5%', left: '10.6%', width: '78.8%', height: '24.7%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '33.2%', left: '10.6%', width: '78.8%', height: '24.6%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '58.9%', left: '10.6%', width: '78.8%', height: '24.6%', borderRadius: '0px' }
  ],
  'frame-27': [
    { id: 1, label: 'Foto 1 (Atas)', top: '6.1%', left: '8.4%', width: '82.4%', height: '25.5%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '33.7%', left: '8.4%', width: '82.4%', height: '25.5%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '61.3%', left: '8.4%', width: '82.4%', height: '25.6%', borderRadius: '0px' }
  ],
  'frame-28': [
    { id: 1, label: 'Foto 1 (Atas)', top: '4.7%', left: '8.7%', width: '82.6%', height: '25.6%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '32.3%', left: '8.7%', width: '82.6%', height: '25.6%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '59.9%', left: '8.7%', width: '82.6%', height: '25.6%', borderRadius: '0px' }
  ],
  'frame-29': [
    { id: 1, label: 'Foto 1 (Atas)', top: '2.7%', left: '8.9%', width: '82.8%', height: '25.7%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '30.4%', left: '8.9%', width: '82.8%', height: '25.7%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '58.1%', left: '8.9%', width: '82.8%', height: '25.7%', borderRadius: '0px' }
  ],
  'frame-30': [
    { id: 1, label: 'Foto 1', top: '10.4%', left: '18.8%', width: '65.5%', height: '19.7%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2', top: '31.1%', left: '18.8%', width: '65.5%', height: '19.7%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3', top: '51.8%', left: '18.8%', width: '65.5%', height: '19.7%', borderRadius: '0px' },
    { id: 4, label: 'Foto 4', top: '72.6%', left: '18.8%', width: '65.5%', height: '19.8%', borderRadius: '0px' }
  ]
};

export function getFrameSlots(frameId) {
  if (!frameId) return null;
  if (FRAME_SLOTS_MAP[frameId]) return FRAME_SLOTS_MAP[frameId];
  const num = String(frameId).replace('frame-', '');
  if (FRAME_SLOTS_MAP[`frame-${num}`]) return FRAME_SLOTS_MAP[`frame-${num}`];
  return [
    { id: 1, label: 'Foto 1 (Atas)', top: '4.3%', left: '8.5%', width: '83.0%', height: '25.8%', borderRadius: '0px' },
    { id: 2, label: 'Foto 2 (Tengah)', top: '32.5%', left: '8.5%', width: '83.0%', height: '25.8%', borderRadius: '0px' },
    { id: 3, label: 'Foto 3 (Bawah)', top: '60.5%', left: '8.5%', width: '83.0%', height: '25.8%', borderRadius: '0px' }
  ];
}

export const PHOTOSTRIP_LAYOUTS = [
  {
    id: 'layout-a',
    name: 'layout A',
    sizeText: 'Size 6 x 2 Strip',
    poseText: '(3 Pose)',
    slotCount: 3,
    hasRibbon: false,
    badgeText: 'Classic 3-Pose',
    tagline: 'Strip photobooth vertikal klasik 3 foto dengan border putih minimalis',
    slots: [
      { id: 1, label: 'Foto 1 (Atas)' },
      { id: 2, label: 'Foto 2 (Tengah)' },
      { id: 3, label: 'Foto 3 (Bawah)' }
    ],
    previewPhotos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'layout-b',
    name: 'layout B',
    sizeText: 'Size 6 x 2 Strip',
    poseText: '(4 Pose)',
    slotCount: 4,
    hasRibbon: true,
    ribbonText: 'NEW!',
    badgeText: 'Ribbon 4-Pose',
    tagline: 'Strip 4 pose dengan aksen pita ribbon pink aesthetic di tengah',
    slots: [
      { id: 1, label: 'Foto 1 (Atas 1)' },
      { id: 2, label: 'Foto 2 (Atas 2)' },
      { id: 3, label: 'Foto 3 (Bawah 1)' },
      { id: 4, label: 'Foto 4 (Bawah 2)' }
    ],
    previewPhotos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'layout-c',
    name: 'layout C',
    sizeText: 'Size 6 x 2 Strip',
    poseText: '(2 Pose)',
    slotCount: 2,
    hasRibbon: true,
    ribbonText: 'NEW!',
    badgeText: 'Duo Ribbon Pose',
    tagline: 'Strip 2 pose besar dengan aksen pita ribbon pink manis di tengah',
    slots: [
      { id: 1, label: 'Foto 1 (Atas)' },
      { id: 2, label: 'Foto 2 (Bawah)' }
    ],
    previewPhotos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'layout-d',
    name: 'layout D',
    sizeText: 'Size 6 x 4 Strip',
    poseText: '(6 Pose)',
    slotCount: 6,
    hasRibbon: true,
    ribbonText: 'NEW!',
    isGrid: true,
    badgeText: 'Grid 6-Pose',
    tagline: 'Strip grid 2 kolom x 3 baris untuk memuat lebih banyak memori foto',
    slots: [
      { id: 1, label: 'Foto 1' },
      { id: 2, label: 'Foto 2' },
      { id: 3, label: 'Foto 3' },
      { id: 4, label: 'Foto 4' },
      { id: 5, label: 'Foto 5' },
      { id: 6, label: 'Foto 6' }
    ],
    previewPhotos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80'
    ]
  }
];

export const ACCESSORIES_CATALOG_ITEMS = [
  // GELANG (BRACELETS)
  {
    id: 'cat-gelang-cuban',
    type: 'gelang',
    category: 'gelang',
    name: 'Pearl Star Charm Bracelet',
    subtitle: 'Pastel Pink Pearl + Star Accent',
    price: 10000,
    rating: 4.9,
    soldCount: 142,
    badge: 'Best Seller',
    image: '/images/bracelet_pearl_star.jpg',
    description: 'Gelang dengan kombinasi mutiara pastel pink, manik bening, dan charm bintang kecil yang memberi kesan feminine dan dreamy.',
    specs: ['Pearl Pink & Crystal Beads', 'Star Charm Detail', 'Soft Girly Aesthetic']
  },
  {
    id: 'cat-gelang-paracord',
    type: 'gelang',
    category: 'gelang',
    name: 'White Pearl & Silver Star Bracelet',
    subtitle: 'Pearl Minimalis dengan Accent Star',
    price: 10000,
    rating: 4.8,
    soldCount: 98,
    badge: 'Trending',
    image: '/images/bracelet_white_pearl.jpg',
    description: 'Desain pearl putih dengan kombinasi silver star charm, bead crystal, dan detail clean yang cocok untuk look minimal tetapi tetap statement.',
    specs: ['Freshwater Pearl', 'Silver Star Detail', 'Minimal & Elegant']
  },
  {
    id: 'cat-gelang-milanese',
    type: 'gelang',
    category: 'gelang',
    name: 'Crystal Bloom Bracelet',
    subtitle: 'Transparan + Pearl + Shell Motif',
    price: 10000,
    rating: 5.0,
    soldCount: 76,
    badge: 'Premium',
    image: '/images/bracelet_crystal_bloom.jpg',
    description: 'Gelang dengan nuansa clean dan romantis, menampilkan manik crystal bening, pearl creamy, serta motif shell agar terlihat lebih feminin.',
    specs: ['Crystal Glass Beads', 'Pearl Ivory Finish', 'Shell-Inspired Detail']
  },
  {
    id: 'cat-gelang-beads',
    type: 'gelang',
    category: 'gelang',
    name: 'Sage Green Pearl Bracelet',
    subtitle: 'Pearl + Green Glass + Star Charm',
    price: 10000,
    rating: 4.9,
    soldCount: 110,
    badge: 'Fresh Breeze',
    image: '/images/bracelet_sage_green.jpg',
    description: 'Kombinasi pearl creamy, green glass bead, dan star accessory memberi tampilan soft pastel yang fresh, light, dan aesthetic.',
    specs: ['Pastel Green Accent', 'Pearl Ivory', 'Soft Star Detail']
  }
];

export const INITIAL_COLLECTIONS = [
  // --- BUNDLING SPECIAL COUPLE / BESTIE ---
  {
    id: 'col-bundle-couple-1',
    category: 'bundling',
    type: 'bundling',
    name: 'Couple / Bestie 1 (2 Gelang)',
    price: 18000,
    priceFormatted: 'Rp 18.000',
    image: '/images/cat_bracelets.png',
    thumbs: [
      '/images/cat_bracelets.png',
      '/images/bracelet_pearl_star.jpg',
      '/images/bracelet_white_pearl.jpg',
      '/images/bracelet_sage_green.jpg'
    ],
    description: 'Paket bundling hemat spesial Bestie & Pasangan berisi 2 pcs Gelang pilihanmu. Pilih 2 model gelang favoritmu (bisa kembaran atau beda model) untuk dipakai bersama sahabat atau pasangan tercinta.',
    highlights: {
      strap: '2x Tali Serut Adjustable / Elastis Korea High-Durability',
      shapes: '2 Pcs Gelang Pilihan Bebas (Bisa Mix & Match)',
      charms: 'Desain Manik Huruf Custom, Mutiara Gading & Kristal Faset'
    },
    templateId: 'layout-a',
    isCustomizable: false
  },
  {
    id: 'col-bundle-couple-2',
    category: 'bundling',
    type: 'bundling',
    name: 'Couple / Bestie 2 (2 Bagcharm)',
    price: 28000,
    priceFormatted: 'Rp 28.000',
    image: '/images/cat_keychains.png',
    thumbs: [
      '/images/cat_keychains.png',
      '/images/bagcharm_sweet_pink.jpg',
      '/images/bagcharm_baby_blue.jpg',
      '/images/bagcharm_tactical_black.jpg'
    ],
    description: 'Paket bundling hemat spesial Bestie & Pasangan berisi 2 pcs Custom Bagcharm. Bebas pilih template frame dan foto kenangan terindah untuk Bagcharm 1 dan Bagcharm 2.',
    highlights: {
      strap: '2x Paracord 550 / Metal Clasp Premium',
      shapes: '2x Custom Acrylic Frame (Bebas Pilih Frame)',
      charms: '2x Charm Bintang Wavy Akrilik & Lonceng Mini Enamel'
    },
    templateId: 'layout-a',
    isCustomizable: true
  },
  {
    id: 'col-bundle-couple-3',
    category: 'bundling',
    type: 'bundling',
    name: 'Couple / Bestie 3 (1 Gelang & 1 Bagcharm)',
    price: 27000,
    priceFormatted: 'Rp 27.000',
    image: '/images/custom_bagcharm_blue.jpg',
    thumbs: [
      '/images/custom_bagcharm_blue.jpg',
      '/images/bracelet_crystal_bloom.jpg',
      '/images/bagcharm_sweet_pink.jpg'
    ],
    description: 'Paket bundling combo terfavorit! Perpaduan 1 pcs Gelang mutiara pilihanmu dan 1 pcs Custom Bagcharm foto frame dalam satu paket hemat matching.',
    highlights: {
      strap: '1x Gelang Elastis Korea + 1x Paracord Bagcharm',
      shapes: '1x Gelang Pilihan Bebas + 1x Custom Frame Bagcharm',
      charms: 'Charm Bintang Wavy, Lonceng Mini & Iridescent Star'
    },
    templateId: 'layout-a',
    isCustomizable: true
  },
  // --- CUSTOM BAGCHARMS & KEYCHAINS ---
  {
    id: 'col-bagcharm-baby-blue',
    category: 'keychains',
    type: 'bag_charm',
    name: 'Baby Blue Star Photostrip Bagcharm',
    price: 15000,
    priceFormatted: 'Rp 15.000',
    image: '/images/bagcharm_baby_blue.jpg',
    thumbs: [
      '/images/bagcharm_baby_blue.jpg'
    ],
    description: 'Gantungan tas bernuansa baby blue dengan tali paracord bintik putih model twisted loop, lonceng mini putih, charm bintang akrilik wavy iridescent, dan frame photostrip akrilik bertema vintage stamp biru.',
    highlights: {
      strap: 'Paracord 550 Baby Blue bintik putih (Twisted Loop)',
      shapes: 'Frame Akrilik Photostrip 3 Pose (Vintage Stamp Edition)',
      charms: 'Lonceng mini putih & charm bintang akrilik wavy iridescent'
    },
    templateId: 'layout-a',
    isCustomizable: true
  },
  {
    id: 'col-bagcharm-sweet-pink',
    category: 'keychains',
    type: 'bag_charm',
    name: 'Sweet Pastel Pink Photostrip Bagcharm',
    price: 15000,
    priceFormatted: 'Rp 15.000',
    image: '/images/bagcharm_sweet_pink.jpg',
    thumbs: [
      '/images/bagcharm_sweet_pink.jpg'
    ],
    description: 'Gantungan tas manis bernuansa soft pastel pink dengan tali paracord dual-tone pink & kuning ceria, lonceng enamel soft pink, charm bintang wavy pink pastel, dan frame photostrip floral bertema sweet aesthetic.',
    highlights: {
      strap: 'Paracord 550 Sweet Pink dual-tone (Twisted Loop & Dual Tassel)',
      shapes: 'Frame Akrilik 3 Pose Floral Sweet Pink',
      charms: 'Bintang wavy akrilik pastel pink & lonceng mini enamel soft pink'
    },
    templateId: 'layout-a',
    isCustomizable: true
  },
  {
    id: 'col-bagcharm-tactical-black',
    category: 'keychains',
    type: 'bag_charm',
    name: 'Stealth Tactical Black Photostrip Bagcharm',
    price: 15000,
    priceFormatted: 'Rp 15.000',
    image: '/images/bagcharm_tactical_black.jpg',
    thumbs: [
      '/images/bagcharm_tactical_black.jpg'
    ],
    description: 'Gaya tactical streetwear dengan carabiner clasp matte stealth black, tali paracord hitam bintik putih, charm bintang akrilik hitam glossy, gantungan bola bulat mutiara, dan frame photostrip 3 slot modern.',
    highlights: {
      strap: 'Paracord 550 Stealth Black & Matte Black Tactical Carabiner',
      shapes: 'Frame Akrilik 3 Pose Minimalist Black Border',
      charms: 'Bintang wavy akrilik hitam, bola mutiara putih & silver star'
    },
    templateId: 'layout-a',
    isCustomizable: true
  },
  {
    id: 'col-bagcharm-polaroid-red-black',
    category: 'keychains',
    type: 'bag_charm',
    name: 'Classic Black & Red Polaroid Bagcharm',
    price: 15000,
    priceFormatted: 'Rp 15.000',
    image: '/images/bagcharm_polaroid_red_black.jpg',
    thumbs: [
      '/images/bagcharm_polaroid_red_black.jpg'
    ],
    description: 'Bagcharm bergaya retro pop Y2K dengan tali paracord hitam aksen bintik merah-putih, lonceng mini putih enamel bulat, bintang akrilik wavy hitam, dan frame photostrip strip Polaroid 3 foto vintage.',
    highlights: {
      strap: 'Paracord 550 Hitam aksen bintik merah & rumbai dual tassel',
      shapes: 'Frame Akrilik Polaroid Strip 3 Foto (Guts! Brave Edition)',
      charms: 'Lonceng mini putih enamel bulat & charm bintang wavy hitam'
    },
    templateId: 'layout-a',
    isCustomizable: true
  },
  {
    id: 'col-bagcharm-earthy-mocha',
    category: 'keychains',
    type: 'bag_charm',
    name: 'Autumn Earthy Mocha Tassel Bagcharm',
    price: 15000,
    priceFormatted: 'Rp 15.000',
    image: '/images/bagcharm_earthy_mocha.jpg',
    thumbs: [
      '/images/bagcharm_earthy_mocha.jpg'
    ],
    description: 'Desain aesthetic vintage bertema autumn warm earth tone. Perpaduan rumbai anyaman tali katun warna espresso brown, ivory cream, dan mocha beige dengan ring clasp, charm bunga wavy cream, dan frame foto perangko klasik.',
    highlights: {
      strap: 'Multi-Tassel Cord Katun Espresso, Ivory Cream & Mocha dengan Ring Clasp',
      shapes: 'Frame Vintage Postage Stamp 3 Slot Foto',
      charms: 'Charm bunga wavy cream akrilik & manik wavy spacers'
    },
    templateId: 'layout-a',
    isCustomizable: true
  },

  // --- BRACELETS (GELANG) ---
  {
    id: 'col-pearl-star-bracelet',
    category: 'bracelets',
    type: 'gelang',
    name: 'Pearl Star Charm Bracelet',
    price: 10000,
    priceFormatted: 'Rp 10.000',
    image: '/images/bracelet_pearl_star.jpg',
    thumbs: [
      '/images/bracelet_pearl_star.jpg',
      '/images/bracelet_white_pearl.jpg',
      '/images/cat_bracelets.png'
    ],
    description: 'Gelang dengan kombinasi mutiara pastel pink, manik bening crystal, dan charm bintang kecil yang memberi kesan feminine dan dreamy.',
    highlights: {
      strap: 'Elastic crystal cord anti-putus',
      shapes: 'Baroque pearl ivory finish',
      charms: 'Dainty star charm accent'
    },
    isCustomizable: false
  },
  {
    id: 'col-white-pearl-bracelet',
    category: 'bracelets',
    type: 'gelang',
    name: 'White Pearl & Silver Star Bracelet',
    price: 10000,
    priceFormatted: 'Rp 10.000',
    image: '/images/bracelet_white_pearl.jpg',
    thumbs: [
      '/images/bracelet_white_pearl.jpg',
      '/images/bracelet_crystal_bloom.jpg',
      '/images/cat_bracelets.png'
    ],
    description: 'Desain pearl putih dengan kombinasi silver star charm, bead crystal, dan detail clean yang cocok untuk look minimal nan elegan.',
    highlights: {
      strap: 'Silver chain & smooth pearl beads',
      shapes: 'Minimal modern wrap',
      charms: 'Silver micro star & spacer'
    },
    stock: 55,
    colorStocks: { biru: 28, pink: 27 },
    isCustomizable: false
  },
  {
    id: 'col-crystal-bloom-bracelet',
    category: 'bracelets',
    type: 'gelang',
    name: 'Crystal Bloom Bracelet',
    price: 10000,
    priceFormatted: 'Rp 10.000',
    image: '/images/bracelet_crystal_bloom.jpg',
    thumbs: [
      '/images/bracelet_crystal_bloom.jpg',
      '/images/bracelet_sage_green.jpg',
      '/images/cat_bracelets.png'
    ],
    description: 'Gelang dengan nuansa clean dan romantis, menampilkan manik crystal bening, pearl creamy, serta motif shell agar terlihat lebih feminin.',
    highlights: {
      strap: 'Crystal glass wire',
      shapes: 'Floral shell motif',
      charms: 'Iridescent shell bloom'
    },
    isCustomizable: false
  },
  {
    id: 'col-sage-green-bracelet',
    category: 'bracelets',
    type: 'gelang',
    name: 'Sage Green Pearl Bracelet',
    price: 10000,
    priceFormatted: 'Rp 10.000',
    image: '/images/bracelet_sage_green.jpg',
    thumbs: [
      '/images/bracelet_sage_green.jpg',
      '/images/bracelet_pearl_star.jpg',
      '/images/cat_bracelets.png'
    ],
    description: 'Kombinasi pearl creamy, green glass bead, dan star accessory memberi tampilan soft pastel yang fresh, light, dan aesthetic.',
    highlights: {
      strap: 'Pastel cord wrap',
      shapes: 'Sage pearl loop',
      charms: 'Mint star charm'
    },
    stock: 42,
    colorStocks: { hitam: 21, merah: 21 },
    isCustomizable: false
  }
];



