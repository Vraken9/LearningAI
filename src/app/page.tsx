'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  MapPin,
  Clock,
  Users,
  MessageSquare,
  ChevronRight,
  ArrowRight,
  Heart,
  Sparkles,
  ShieldCheck,
  Calendar,
  Smile,
  Coffee,
  Menu,
  X,
  Phone,
  Star,
  CheckCircle2,
} from 'lucide-react';
import ChatWidget from '@/components/chat/ChatWidget';

// ============================================
// Radha Bali - Storytelling & Warmth Homepage
// Focused on human stories, genuine laughter, warm memories,
// and stunning Balinese landscape imagery.
// 100% emoji-free & Admin Console completely unexposed.
// ============================================

// Format price to IDR
function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// ---- Destination Data with Warm Story Angles ----
const destinations = [
  {
    name: 'Ubud',
    story: 'Ketenangan Batin, Hutan Suci & Sawah Zamrud',
    count: '8 pilihan perjalanan',
    region: 'Gianyar',
    image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600',
  },
  {
    name: 'Nusa Penida',
    story: 'Tebing Karst Ikonik & Birunya Samudra Lepas',
    count: '5 pilihan perjalanan',
    region: 'Klungkung',
    image: '/images/nusa-penida.jpg',
  },
  {
    name: 'Kintamani',
    story: 'Fajar Emas di Atas Awan & Hangatnya Kopi Pagi',
    count: '4 pilihan perjalanan',
    region: 'Bangli',
    image: '/images/kintamani.jpg',
  },
  {
    name: 'Uluwatu',
    story: 'Senja Dramatis di Tebing Pura Samudra Selatan',
    count: '6 pilihan perjalanan',
    region: 'Badung',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600',
  },
];

// ---- Popular Packages Data ----
const popularPackages = [
  {
    name: 'Bali Beach Paradise 3D2N',
    slug: 'bali-beach-paradise-3d2n',
    destination: 'Bali Selatan',
    price: 3500000,
    duration: '3D2N',
    rating: 4.7,
    reviews: 234,
    description: 'Menyusuri pantai pasir putih tersembunyi, sunset dinner di Teluk Jimbaran, dan relaksasi spa.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600',
    category: 'Paket Wisata',
    perPerson: true,
  },
  {
    name: 'Ubud Cultural Retreat 4D3N',
    slug: 'ubud-cultural-retreat-4d3n',
    destination: 'Ubud',
    price: 4800000,
    duration: '4D3N',
    rating: 4.9,
    reviews: 187,
    description: 'Menemukan kedamaian di Tegallalang, Melukat di Tirta Empul, dan sentra seniman tradisional.',
    image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600',
    category: 'Paket Wisata',
    perPerson: true,
  },
  {
    name: 'Nusa Penida Island Hopping 2D1N',
    slug: 'nusa-penida-island-hopping-2d1n',
    destination: 'Nusa Penida',
    price: 2800000,
    duration: '2D1N',
    rating: 4.6,
    reviews: 312,
    description: 'Petualangan pulau eksotis: Tebing Kelingking, Angel Billabong, dan snorkeling bersama pari manta.',
    image: '/images/nusa-penida.jpg',
    category: 'Paket Wisata',
    perPerson: true,
  },
  {
    name: 'Mount Batur Sunrise Trekking',
    slug: 'mount-batur-sunrise-trekking',
    destination: 'Kintamani',
    price: 550000,
    duration: '1D',
    rating: 4.8,
    reviews: 428,
    description: 'Mendaki kaldera vulkanik di keheningan fajar, sarapan uap alami, dan berendam di kolam air panas.',
    image: '/images/kintamani.jpg',
    category: 'Aktivitas',
    perPerson: true,
  },
  {
    name: 'Lovina Sunrise Dolphin & Hot Springs 2D1N',
    slug: 'lovina-sunrise-dolphin-hot-springs-2d1n',
    destination: 'Lovina',
    price: 1950000,
    duration: '2D1N',
    rating: 4.9,
    reviews: 215,
    description: 'Menyaksikan lumba-lumba liar saat sunrise dengan perahu jukung tradisional dan Air Terjun Gitgit.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    category: 'Paket Wisata',
    perPerson: true,
  },
  {
    name: 'Uluwatu Sunset & Kecak Fire Dance',
    slug: 'uluwatu-sunset-kecak-fire-dance',
    destination: 'Uluwatu',
    price: 450000,
    duration: '1D',
    rating: 4.8,
    reviews: 512,
    description: 'Menyaksikan tarian magis Kecak di atas tebing karang 70 meter menghadap Samudera Hindia saat senja keemasan.',
    image: 'https://images.unsplash.com/photo-1559628233-100c798642d4?w=600',
    category: 'Aktivitas',
    perPerson: true,
  },
];



// ---- Heartfelt Testimonials ----
const heartfeltStories = [
  {
    quote:
      'Kami datang ke Bali membawa kepenatan, tetapi pulang membawa cerita dan tawa yang tak ada habisnya. Pemandu kami, Bli Wayan, bukan sekadar memandu rute, tapi bercerita tentang filosofi hidup orang Bali dengan sangat tulus. Rekomendasi Nusa AI juga sangat pas dengan ritme liburan keluarga kami.',
    author: 'Keluarga Hendrawan',
    origin: 'Surabaya',
    trip: 'Ubud & Jatiluwih Family Trip',
  },
  {
    quote:
      'Momen naik perahu jukung saat fajar di Lovina adalah memori paling indah dalam hidup kami berdua. Melihat lumba-lumba melompat bersamaan dengan terbitnya matahari adalah keajaiban nyata. Terima kasih Radha Bali telah merancang perjalanan ini dengan begitu hangat.',
    author: 'Reza & Amanda',
    origin: 'Bandung',
    trip: 'Lovina Sunrise & Secret Waterfalls',
  },
  {
    quote:
      'Sebagai rombongan sahabat kantor, kami hanya ingin tertawa lepas tanpa stres memikirkan logistik. Seluruh penjemputan, boat express, hingga makan siang di Nusa Penida berjalan tanpa kendala. Rasanya seperti berlibur bersama sahabat lama yang mengurus semuanya.',
    author: 'Dimas & Rekan Kerja',
    origin: 'Jakarta',
    trip: 'Nusa Penida Expedition 2D1N',
  },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFavorite = (name: string) => {
    setFavorites((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <>
      {/* ---- Navigation Bar (Clean & Focused on Package Catalog) ---- */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo" id="navbar-logo">
            <span>Radha Bali</span>
          </Link>

          <div className="navbar-links">
            <Link href="/" className="navbar-link">
              Beranda
            </Link>
            <Link href="/products" className="navbar-link navbar-link-highlight">
              <span>Katalog Paket Wisata</span>
              <span className="navbar-badge">44 Paket</span>
            </Link>
            <a href="#destinations" className="navbar-link">
              Destinasi Pilihan
            </a>
            <a href="#testimonials" className="navbar-link">
              Ulasan Wisatawan
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/products" className="btn btn-primary btn-sm">
              <span>Jelajahi Paket</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('openChat'));
              }}
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1" style={{ color: '#5c7ebd' }} />
              <span>Tanya Nusa AI</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ---- Hero Section: Warm Scenic Bali & Inspiring Travel ---- */}
      <section className="hero" id="hero">
        <div className="container">
          <div className="hero-travel-centered">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span>EKSPLORASI &amp; KEHANGATAN PULAU DEWATA</span>
            </div>

            <h1 className="hero-travel-title">
              Rencanakan Perjalanan Hangat &amp;<br />
              <span>Berkesan di Tanah Bali</span>
            </h1>

            <p className="hero-travel-desc">
              Dari puncak berkabut Kintamani, hijaunya terasering Ubud, hingga birunya samudra lepas Nusa Penida. Nikmati 44 paket wisata kurasi terbaik dengan pemandu lokal ramah, jadwal fleksibel, dan kenyamanan tanpa rasa terburu-buru.
            </p>

            {/* Quick Destination Exploration */}
            <div className="hero-quick-destinations">
              <span className="hero-dest-label">Destinasi Populer:</span>
              {destinations.map((d) => (
                <Link
                  key={d.name}
                  href={`/products?destination=${encodeURIComponent(d.name)}`}
                  className="hero-dest-pill"
                >
                  <MapPin className="w-3 h-3" style={{ color: '#00959c' }} />
                  <span>{d.name}</span>
                </Link>
              ))}
            </div>

            {/* Main CTAs */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
              <Link href="/products" className="btn btn-primary btn-lg">
                <span>Lihat Seluruh 44 Paket Wisata</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openChat'));
                }}
              >
                <MessageSquare className="w-4 h-4 mr-1.5" style={{ color: '#5c7ebd' }} />
                <span>Konsultasi dengan Nusa AI</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="hero-trust-bar">
              <div className="hero-trust-item">
                <Sparkles className="w-4 h-4" style={{ color: '#5c7ebd' }} />
                <span>44 Paket Wisata Kurasi Pilihan</span>
              </div>
              <div className="hero-trust-item">
                <ShieldCheck className="w-4 h-4" style={{ color: '#056653' }} />
                <span>Pemandu Berlisensi &amp; Ramah Warga Lokal</span>
              </div>
              <div className="hero-trust-item">
                <Smile className="w-4 h-4" style={{ color: '#79af93' }} />
                <span>Kenyamanan Santai &amp; Jadwal Fleksibel</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Section 2: Curated Destinations with Character ---- */}
      <section className="section" id="destinations">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <span className="badge" style={{ marginBottom: 'var(--space-3)' }}>
              RUANG &amp; WILAYAH ISTIMEWA
            </span>
            <h2 className="section-title">Destinasi Penuh Pesona di Bali</h2>
            <p className="section-subtitle">
              Klik destinasi di bawah ini untuk melihat paket perjalanan yang dirancang khusus di kawasan tersebut.
            </p>
          </div>

          <div className="destinations-grid">
            {destinations.map((dest) => (
              <Link
                key={dest.name}
                href={`/products?destination=${encodeURIComponent(dest.name)}`}
                className="destination-card"
                style={{ textDecoration: 'none' }}
              >
                <img src={dest.image} alt={dest.name} loading="lazy" />
                <div className="destination-card-overlay">
                  <span
                    className="badge badge-outline"
                    style={{
                      alignSelf: 'flex-start',
                      marginBottom: '0.5rem',
                      background: 'rgba(0, 0, 0, 0.4)',
                      color: '#ffffff',
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    {dest.region}
                  </span>
                  <div className="destination-card-name">{dest.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.92)', marginTop: '2px', lineHeight: 1.4 }}>
                    {dest.story}
                  </div>
                  <div
                    className="destination-card-count"
                    style={{
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#bae6fd',
                    }}
                  >
                    <span>{dest.count}</span>
                    <span style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#ffffff', fontWeight: 600 }}>
                      Lihat Paket <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Section 4: Popular Tour Packages ---- */}
      <section className="section" id="packages" style={{ background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <span className="badge badge-accent" style={{ marginBottom: 'var(--space-3)' }}>
              PILIHAN PERJALANAN TERBAIK
            </span>
            <h2 className="section-title">Katalog Paket Wisata Unggulan</h2>
            <p className="section-subtitle">
              Dirancang dengan ritme perjalanan yang nyaman, transparan, dan penuh momen berharga.
            </p>
          </div>

          <div className="packages-grid">
            {popularPackages.map((pkg) => (
              <div key={pkg.name} className="package-card">
                <Link href={`/products/${pkg.slug}`} className="package-card-image" style={{ display: 'block' }}>
                  <img src={pkg.image} alt={pkg.name} loading="lazy" />
                  <div className="package-card-badge">{pkg.category}</div>
                  <button
                    type="button"
                    className="package-card-favorite"
                    aria-label="Add to favorites"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(pkg.name);
                    }}
                    style={{
                      color: favorites[pkg.name] ? '#f43f5e' : undefined,
                      borderColor: favorites[pkg.name] ? 'rgba(244, 63, 94, 0.4)' : undefined,
                    }}
                  >
                    <Heart
                      className="w-4 h-4"
                      fill={favorites[pkg.name] ? 'currentColor' : 'none'}
                    />
                  </button>
                </Link>

                <div className="package-card-body">
                  <div className="package-card-destination">
                    <MapPin className="w-3.5 h-3.5" style={{ color: '#00959c' }} />
                    <span>{pkg.destination}</span>
                  </div>

                  <Link href={`/products/${pkg.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="package-card-name" style={{ transition: 'color 0.15s ease' }}>{pkg.name}</h3>
                  </Link>
                  <p className="package-card-description">{pkg.description}</p>

                  <div className="package-card-meta">
                    <span className="package-card-meta-item">
                      <Clock className="w-3.5 h-3.5" style={{ color: '#7994b6' }} />
                      <span>{pkg.duration}</span>
                    </span>
                    <span className="package-card-meta-item">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{pkg.reviews} ulasan</span>
                    </span>
                  </div>

                  <div className="package-card-footer">
                    <div>
                      <div className="package-card-price">{formatPrice(pkg.price)}</div>
                      <div className="package-card-price-unit">
                        {pkg.perPerson ? '/ orang' : '/ paket'}
                      </div>
                    </div>

                    <Link
                      href={`/products/${pkg.slug}`}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px' }}
                    >
                      <span>Lihat Detail</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA to All Products Catalog */}
          <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
            <Link
              href="/products"
              className="btn btn-primary btn-lg"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <span>Jelajahi Seluruh 44 Paket Wisata</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---- Section 5: Heartfelt Traveler Stories ---- */}
      <section className="section" id="testimonials">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <span className="badge" style={{ marginBottom: 'var(--space-3)' }}>
              CERITA DARI HATI
            </span>
            <h2 className="section-title">Kenangan Nyata Bersama Radha Bali</h2>
            <p className="section-subtitle">
              Bukan sekadar angka ulasan, inilah kesan jujur dari para wisatawan yang membawa pulang kehangatan dari Bali.
            </p>
          </div>

          <div className="testimonials-grid">
            {heartfeltStories.map((t, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-top-row">
                  <span className="testimonial-trip-badge">
                    {t.trip}
                  </span>
                  <div className="testimonial-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="testimonial-text">&ldquo;{t.quote}&rdquo;</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <div className="testimonial-author-name">
                      <span>{t.author}</span>
                      <span className="testimonial-verified-badge" title="Wisatawan Terverifikasi">
                        <CheckCircle2 className="w-3 h-3" style={{ color: '#056653' }} />
                        <span>Terverifikasi</span>
                      </span>
                    </div>
                    <div className="testimonial-author-location">
                      <MapPin className="w-3 h-3" style={{ color: '#00959c' }} />
                      <span>Wisatawan asal {t.origin}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Section 6: Inviting Call-To-Action (Warm & Hospitable) ---- */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <span
              className="badge"
              style={{
                marginBottom: 'var(--space-3)',
                background: '#eaf4fa',
                color: '#5c7ebd',
                border: '1px solid #cad9e8',
              }}
            >
              KONSULTASI PERJALANAN RAMAH &amp; TRANSPARAN
            </span>
            <h2 className="cta-title">Ingin Membicarakan Rencana Liburan Anda?</h2>
            <p className="cta-description">
              Sampaikan impian perjalanan, destinasi favorit, atau waktu liburan Anda kepada asisten digital cerdas Nusa AI atau tim lokal kami. Kami siap mendampingi Anda dengan sepenuh hati dan kehangatan khas Bali.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary btn-lg"
                id="cta-chat-btn"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openChat'));
                }}
              >
                <MessageSquare className="w-4 h-4 mr-1.5" />
                <span>Mulai Cerita dengan Nusa AI</span>
              </button>
              <Link href="/products" className="btn btn-secondary btn-lg">
                <span>Jelajahi Seluruh 44 Paket</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Footer (Clean & Secure - ZERO Admin Link) ---- */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <span>Radha Bali</span>
              </div>
              <p className="footer-brand-text">
                Menciptakan perjalanan liburan yang hangat, penuh tawa, dan berkesan di Pulau Dewata dengan pendampingan cerdas Nusa AI.
              </p>
            </div>

            <div>
              <div className="footer-heading">Kisah &amp; Destinasi</div>
              <div className="footer-links">
                <a href="#testimonials" className="footer-link">Kisah Wisatawan</a>
                <a href="#destinations" className="footer-link">Destinasi Pilihan</a>
                <a href="#packages" className="footer-link">Katalog Paket Tur</a>
                <a href="#philosophy" className="footer-link">Keramahan Bali</a>
              </div>
            </div>

            <div>
              <div className="footer-heading">Pilihan Liburan</div>
              <div className="footer-links">
                <a href="#packages" className="footer-link">Liburan Bersama Sahabat</a>
                <a href="#packages" className="footer-link">Momen Hangat Keluarga</a>
                <a href="#packages" className="footer-link">Romansa Pasangan &amp; Fajar</a>
                <a href="#packages" className="footer-link">Petualangan Alam Tropis</a>
              </div>
            </div>

            <div>
              <div className="footer-heading">Layanan &amp; Bantuan</div>
              <div className="footer-links">
                <a href="#" className="footer-link">Pusat Bantuan &amp; FAQ</a>
                <a href="#" className="footer-link">Ketentuan Reschedule Fleksibel</a>
                <a href="#" className="footer-link">Jaminan Asuransi Perjalanan</a>
                <a href="#" className="footer-link">Kebijakan Privasi</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div>&copy; 2026 Radha Bali. Merayakan Cerita dan Kehangatan di Tanah Dewata.</div>
            <div>Ditenagai oleh Nusa AI Assistant</div>
          </div>
        </div>
      </footer>

      {/* ---- Floating Chat Widget Component ---- */}
      <ChatWidget />
    </>
  );
}
