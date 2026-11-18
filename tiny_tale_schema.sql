-- =============================================================================
-- DATABASE SCHEMA: tiny_tale
-- Sistem E-Commerce & Custom Aksesoris (Tiny Tale Atelier)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `tiny_tale` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tiny_tale`;

-- -----------------------------------------------------------------------------
-- 1. TABEL ADMIN / PENGELOLA (admin_users)
-- Untuk login otorisasi admin (PIN / Password)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `pin` VARCHAR(50) NOT NULL DEFAULT 'admin123',
  `role` VARCHAR(50) NOT NULL DEFAULT 'head_artisan',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admin_users` (`username`, `email`, `password`, `pin`, `role`) VALUES
('Head Artisan', 'admin@atelier.id', 'admin123', 'admin123', 'head_artisan');

-- -----------------------------------------------------------------------------
-- 2. TABEL KATALOG PRODUK (products)
-- Menyimpan katalog Custom Bagcharm & Koleksi Gelang
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` VARCHAR(100) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(50) NOT NULL, -- 'keychains' | 'bracelets'
  `type` VARCHAR(50) NOT NULL,     -- 'bag_charm' | 'gelang'
  `price` INT NOT NULL,
  `image` LONGTEXT NOT NULL,
  `description` TEXT,
  `highlights_strap` VARCHAR(255) DEFAULT NULL,
  `highlights_shapes` VARCHAR(255) DEFAULT NULL,
  `highlights_charms` VARCHAR(255) DEFAULT NULL,
  `stock` INT NOT NULL DEFAULT 50,
  `is_customizable` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `products` (`id`, `name`, `category`, `type`, `price`, `image`, `description`, `highlights_strap`, `highlights_shapes`, `highlights_charms`, `stock`, `is_customizable`) VALUES
('col-bundle-couple-1', 'Couple / Bestie 1 (2 Gelang)', 'bundling', 'bundling', 18000, '/images/cat_bracelets.png', 'Paket bundling hemat spesial Bestie & Pasangan berisi 2 pcs Gelang pilihanmu. Pilih 2 model gelang favoritmu (bisa kembaran atau beda model) untuk dipakai bersama sahabat atau pasangan tercinta.', '2x Tali Serut Adjustable / Elastis Korea High-Durability', '2 Pcs Gelang Pilihan Bebas (Bisa Mix & Match)', 'Desain Manik Huruf Custom, Mutiara Gading & Kristal Faset', 50, 0),
('col-bundle-couple-2', 'Couple / Bestie 2 (2 Bagcharm)', 'bundling', 'bundling', 28000, '/images/cat_keychains.png', 'Paket bundling hemat spesial Bestie & Pasangan berisi 2 pcs Custom Bagcharm. Bebas pilih template frame dan foto kenangan terindah untuk Bagcharm 1 dan Bagcharm 2.', '2x Paracord 550 / Metal Clasp Premium', '2x Custom Acrylic Frame (Bebas Pilih Frame)', '2x Charm Bintang Wavy Akrilik & Lonceng Mini Enamel', 50, 1),
('col-bundle-couple-3', 'Couple / Bestie 3 (1 Gelang & 1 Bagcharm)', 'bundling', 'bundling', 27000, '/images/custom_bagcharm_blue.jpg', 'Paket bundling combo terfavorit! Perpaduan 1 pcs Gelang mutiara pilihanmu dan 1 pcs Custom Bagcharm foto frame dalam satu paket hemat matching.', '1x Gelang Elastis Korea + 1x Paracord Bagcharm', '1x Gelang Pilihan Bebas + 1x Custom Frame Bagcharm', 'Charm Bintang Wavy, Lonceng Mini & Iridescent Star', 50, 1),
('col-bagcharm-baby-blue', 'Baby Blue Star Photostrip Bagcharm', 'keychains', 'bag_charm', 15000, '/images/bagcharm_baby_blue.jpg', 'Gantungan tas bernuansa baby blue dengan tali paracord bintik putih model twisted loop, lonceng mini putih, charm bintang akrilik wavy iridescent, dan frame photostrip akrilik bertema vintage stamp biru.', 'Paracord 550 Baby Blue bintik putih (Twisted Loop)', 'Frame Akrilik Photostrip 3 Pose (Vintage Stamp Edition)', 'Lonceng mini putih & charm bintang akrilik wavy iridescent', 45, 1),
('col-bagcharm-sweet-pink', 'Sweet Pastel Pink Photostrip Bagcharm', 'keychains', 'bag_charm', 15000, '/images/bagcharm_sweet_pink.jpg', 'Gantungan tas manis bernuansa soft pastel pink dengan tali paracord dual-tone pink & kuning ceria, lonceng enamel soft pink, charm bintang wavy pink pastel, dan frame photostrip floral bertema sweet aesthetic.', 'Paracord 550 Sweet Pink dual-tone (Twisted Loop & Dual Tassel)', 'Frame Akrilik 3 Pose Floral Sweet Pink', 'Bintang wavy akrilik pastel pink & lonceng mini enamel soft pink', 38, 1),
('col-bagcharm-tactical-black', 'Stealth Tactical Black Photostrip Bagcharm', 'keychains', 'bag_charm', 15000, '/images/bagcharm_tactical_black.jpg', 'Gaya tactical streetwear dengan carabiner clasp matte stealth black, tali paracord hitam bintik putih, charm bintang akrilik hitam glossy, gantungan bola bulat mutiara, dan frame photostrip 3 slot modern.', 'Paracord 550 Stealth Black & Matte Black Tactical Carabiner', 'Frame Akrilik 3 Pose Minimalist Black Border', 'Bintang wavy akrilik hitam, bola mutiara putih & silver star', 50, 1),
('col-bagcharm-polaroid-red-black', 'Classic Black & Red Polaroid Bagcharm', 'keychains', 'bag_charm', 15000, '/images/bagcharm_polaroid_red_black.jpg', 'Bagcharm bergaya retro pop Y2K dengan tali paracord hitam aksen bintik merah-putih, lonceng mini putih enamel bulat, bintang akrilik wavy hitam, dan frame photostrip strip Polaroid 3 foto vintage.', 'Paracord 550 Hitam aksen bintik merah & rumbai dual tassel', 'Frame Akrilik Polaroid Strip 3 Foto (Guts! Brave Edition)', 'Lonceng mini putih enamel bulat & charm bintang wavy hitam', 40, 1),
('col-bagcharm-earthy-mocha', 'Autumn Earthy Mocha Tassel Bagcharm', 'keychains', 'bag_charm', 15000, '/images/bagcharm_earthy_mocha.jpg', 'Desain aesthetic vintage bertema autumn warm earth tone. Perpaduan rumbai anyaman tali katun warna espresso brown, ivory cream, dan mocha beige dengan ring clasp, charm bunga wavy cream, dan frame foto perangko klasik.', 'Multi-Tassel Cord Katun Espresso, Ivory Cream & Mocha dengan Ring Clasp', 'Frame Akrilik 3 Slot Foto Mini Autumn Bloom Border', 'Liontin Bunga Wavy Cream Enamel & Lonceng Kayu Aesthetic', 35, 1),
('col-pearl-star-bracelet', 'Pearl Star Bracelet', 'bracelets', 'gelang', 10000, '/images/bracelet_pearl_star.jpg', 'Gelang manik-manik mutiara imitasi premium dengan aksen charm bintang akrilik transparan iridescent di tengah, tali elastis fleksibel nyaman dipakai.', 'Tali Elastis Korea High-Durability (Ukuran Fleksibel 15-18 cm)', 'Mutiara Kaca Sintetis Putih Gading Kilau Lembut', 'Charm Bintang Akrilik Hologram / Iridescent Tengah', 60, 0),
('col-white-pearl-bracelet', 'White Pearl Star Bracelet', 'bracelets', 'gelang', 10000, '/images/bracelet_white_pearl.jpg', 'Gelang mutiara putih bersih elegan dengan charm bintang putih susu minimalis, cocok untuk daily wear atau dipadukan dengan jam tangan.', 'Tali Serut Elastis Hypoallergenic', 'Mutiara Sintetis 6mm White Pearl', 'Charm Bintang Enamel Putih Minimalis', 55, 0),
('col-sage-green-bracelet', 'Sage Green Pearl Bracelet', 'bracelets', 'gelang', 10000, '/images/bracelet_sage_green.jpg', 'Kombinasi warna sage green pastel lembut dan mutiara putih gading dengan charm bunga mini dan manik akrilik transparan yang segar.', 'Tali Elastis Double Cord Extra Kuat', 'Mutiara Sintetis & Manik Kaca Sage Green Pastel', 'Charm Bunga Akrilik Mini & Spacer Beads', 42, 0),
('col-crystal-bloom-bracelet', 'Crystal Bloom Bracelet', 'bracelets', 'gelang', 10000, '/images/bracelet_crystal_bloom.jpg', 'Rangkaian manik kristal faset berkilau dipadu charm kelopak bunga transparan yang memantulkan cahaya indah di pergelangan tangan.', 'Tali Kristal Fleksibel Premium', 'Manik Kristal Kaca Faset Transparan & Pearl Beads', 'Charm Kelopak Bunga Sakura Transparan', 48, 0);

-- -----------------------------------------------------------------------------
-- 3. TABEL CHARMS & LIONTIN KUSTOM (charms)
-- Menyimpan stok charm di customizer studio
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `charms`;
CREATE TABLE `charms` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) NOT NULL, -- 'y2k', 'metal', 'cyber', 'streetwear', 'stone'
  `price` INT NOT NULL DEFAULT 5000,
  `stock` INT NOT NULL DEFAULT 40,
  `icon` VARCHAR(20) DEFAULT '⭐',
  `image` LONGTEXT DEFAULT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `charms` (`id`, `name`, `category`, `price`, `stock`, `icon`, `image`, `description`) VALUES
('ch-gitar', 'Gitar', 'metal', 5000, 50, '🎸', '/images/charm_guitar.png', 'Charm liontin gitar mini aesthetic'),
('ch-boneka-puppy', 'Boneka Puppy', 'cute', 5000, 50, '🐶', '/images/charm_balloon_puppy.jpg', 'Charm liontin balloon puppy chrome silver aesthetic');

-- -----------------------------------------------------------------------------
-- 4. TABEL PESANAN PELANGGAN (orders)
-- Menyimpan data order transaksi customer
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` VARCHAR(50) PRIMARY KEY,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_whatsapp` VARCHAR(50) NOT NULL,
  `address` TEXT DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT '-',
  `courier` VARCHAR(100) DEFAULT '-',
  `courier_cost` INT DEFAULT 0,
  `notes` TEXT DEFAULT NULL,
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'QRIS',
  `payment_status` VARCHAR(50) NOT NULL DEFAULT 'paid',   -- 'paid', 'unpaid', 'pending'
  `order_status` VARCHAR(50) NOT NULL DEFAULT 'processing', -- 'processing', 'production', 'shipped', 'completed', 'cancelled'
  `tracking_number` VARCHAR(100) DEFAULT NULL,
  `total_price` INT NOT NULL,
  `payment_proof` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `orders` (`id`, `customer_name`, `customer_whatsapp`, `address`, `city`, `courier`, `courier_cost`, `notes`, `payment_method`, `payment_status`, `order_status`, `tracking_number`, `total_price`, `created_at`) VALUES
('ATC-2026-8912', 'Rian Pratama', '081318409891', 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan', 'Jakarta Selatan', 'SiCepat Reguler (Rp 10.000)', 10000, 'Tolong packing ekstra bubble wrap ya, buat kado.', 'qris', 'paid', 'production', '004128912093', 82000, '2026-09-22 14:20:00'),
('ATC-2026-8905', 'Dinda Putri', '081298451120', 'Apartemen Sudirman Tower A Lt 15, Jakarta Pusat', 'Jakarta Pusat', 'J&T Express (Rp 11.000)', 11000, 'Warna charm jangan sampai tertukar ya', 'bca_va', 'paid', 'processing', NULL, 125000, '2026-09-22 11:05:00');

-- -----------------------------------------------------------------------------
-- 5. TABEL RINCIAN ITEM PESANAN (order_items)
-- Menyimpan detail item, qty, harga, dan konfigurasi kustom (JSON)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL,
  `product_type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `unit_price` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `subtotal` INT NOT NULL,
  `image` LONGTEXT,
  `custom_details` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `order_items` (`order_id`, `product_type`, `title`, `unit_price`, `quantity`, `subtotal`, `image`, `custom_details`) VALUES
('ATC-2026-8912', 'bag_charm', 'Baby Blue Star Photostrip Bagcharm', 15000, 1, 15000, '/images/bagcharm_baby_blue.jpg', '{"templateId": "layout-a", "strap": "Paracord 550 Baby Blue"}'),
('ATC-2026-8905', 'bag_charm', 'Custom Bag Charm Tactical Weave', 57000, 2, 114000, '/images/bagcharm_tactical_black.jpg', '{"baseId": "base-bc-tactical", "hardwareId": "hw-matte-black", "charms": ["ch-cyber-star"]}');
