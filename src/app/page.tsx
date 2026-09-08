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
import { useLanguage } from '@/contexts/LanguageContext';

// ---- Destination Data ----
const destinations = [
  {
    name: 'Ubud',
    story_id: 'Ketenangan Batin, Hutan Suci & Sawah Zamrud',
    story_en: 'Inner Peace, Sacred Forests & Emerald Terraces',
    count_id: '8 pilihan perjalanan',
    count_en: '8 travel options',
    region: 'Gianyar',
    image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600',
  },
  {
    name: 'Nusa Penida',
    story_id: 'Tebing Karst Ikonik & Birunya Samudra Lepas',
    story_en: 'Iconic Karst Cliffs & Open Blue Ocean',
    count_id: '5 pilihan perjalanan',
    count_en: '5 travel options',
    region: 'Klungkung',
    image: '/images/nusa-penida.jpg',
  },
  {
    name: 'Kintamani',
    story_id: 'Fajar Emas di Atas Awan & Hangatnya Kopi Pagi',
    story_en: 'Golden Dawn Above the Clouds & Warm Morning Coffee',
    count_id: '4 pilihan perjalanan',
    count_en: '4 travel options',
    region: 'Bangli',
    image: '/images/kintamani.jpg',
  },
  {
    name: 'Uluwatu',
    story_id: 'Senja Dramatis di Tebing Pura Samudra Selatan',
    story_en: 'Dramatic Sunset at the Southern Ocean Temple Cliff',
    count_id: '6 pilihan perjalanan',
    count_en: '6 travel options',
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
    description_id: 'Menyusuri pantai pasir putih tersembunyi, sunset dinner di Teluk Jimbaran, dan relaksasi spa.',
    description_en: 'Explore hidden white sand beaches, sunset dinner at Jimbaran Bay, and spa relaxation.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600',
    category_id: 'Paket Wisata',
    category_en: 'Tour Package',
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
    description_id: 'Menemukan kedamaian di Tegallalang, Melukat di Tirta Empul, dan sentra seniman tradisional.',
    description_en: 'Find peace in Tegallalang, Melukat at Tirta Empul, and visit traditional artist centers.',
    image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600',
    category_id: 'Paket Wisata',
    category_en: 'Tour Package',
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
    description_id: 'Petualangan pulau eksotis: Tebing Kelingking, Angel Billabong, dan snorkeling bersama pari manta.',
    description_en: 'Exotic island adventure: Kelingking Cliff, Angel Billabong, and snorkeling with manta rays.',
    image: '/images/nusa-penida.jpg',
    category_id: 'Paket Wisata',
    category_en: 'Tour Package',
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
    description_id: 'Mendaki kaldera vulkanik di keheningan fajar, sarapan uap alami, dan berendam di kolam air panas.',
    description_en: 'Hike the volcanic caldera in the silence of dawn, natural steam breakfast, and soak in hot springs.',
    image: '/images/kintamani.jpg',
    category_id: 'Aktivitas',
    category_en: 'Activity',
    perPerson: true,
  },
];

// ---- Heartfelt Testimonials ----
const heartfeltStories = [
  {
    quote_id: 'Kami datang ke Bali membawa kepenatan, tetapi pulang membawa cerita dan tawa yang tak ada habisnya. Pemandu kami, Bli Wayan, bukan sekadar memandu rute, tapi bercerita tentang filosofi hidup orang Bali dengan sangat tulus. Rekomendasi Nusa AI juga sangat pas dengan ritme liburan keluarga kami.',
    quote_en: 'We came to Bali carrying exhaustion, but returned with endless stories and laughter. Our guide, Bli Wayan, did not just guide the route, but told the philosophy of Balinese life very sincerely. Nusa AI recommendations also fit perfectly with our family holiday rhythm.',
    author: 'Keluarga Hendrawan',
    origin: 'Surabaya',
    trip: 'Ubud & Jatiluwih Family Trip',
  },
  {
    quote_id: 'Momen naik perahu jukung saat fajar di Lovina adalah memori paling indah dalam hidup kami berdua. Melihat lumba-lumba melompat bersamaan dengan terbitnya matahari adalah keajaiban nyata. Terima kasih Radha Bali telah merancang perjalanan ini dengan begitu hangat.',
    quote_en: 'The moment taking a jukung boat at dawn in Lovina is the most beautiful memory in our lives. Seeing dolphins jumping along with the sunrise is a real miracle. Thank you Radha Bali for designing this trip so warmly.',
    author: 'Reza & Amanda',
    origin: 'Bandung',
    trip: 'Lovina Sunrise & Secret Waterfalls',
  },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  
  // Use Language Context
  const { language, t, toggleLanguage, formatCurrency } = useLanguage();

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
              <span>{t.nav.products}</span>
            </Link>
            <a href="#destinations" className="navbar-link">
              {t.nav.destinations}
            </a>
            <a href="#testimonials" className="navbar-link">
              {t.nav.testimonials}
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem 0.6rem', fontWeight: 'bold' }}
            >
              {language === 'id' ? 'EN' : 'ID'}
            </button>
            
            <Link href="/products" className="btn btn-primary btn-sm">
              <span>{t.hero.cta_primary}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('openChat'));
              }}
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1" style={{ color: '#5c7ebd' }} />
              <span>{t.hero.cta_secondary}</span>
            </button>
          </div>
        </div>
      </nav>

      <section className="hero" id="hero">
        <div className="container">
          <div className="hero-travel-centered">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span>{t.hero.badge}</span>
            </div>

            <h1 className="hero-travel-title">
              {t.hero.title}
            </h1>

            <p className="hero-travel-desc">
              {t.hero.subtitle}
            </p>

            <div className="hero-quick-destinations">
              <span className="hero-dest-label">{t.nav.destinations}:</span>
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

            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
              <Link href="/products" className="btn btn-primary btn-lg">
                <span>{t.hero.cta_primary}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openChat'));
                }}
              >
                <MessageSquare className="w-4 h-4 mr-1.5" style={{ color: '#5c7ebd' }} />
                <span>{t.hero.cta_secondary}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="destinations">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <span className="badge" style={{ marginBottom: 'var(--space-3)' }}>
              {t.destinations.badge}
            </span>
            <h2 className="section-title">{t.destinations.title}</h2>
            <p className="section-subtitle">
              {t.destinations.subtitle}
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
                    {language === 'id' ? dest.story_id : dest.story_en}
                  </div>
                  <div
                    className="destination-card-count"
                    style={{
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#cad9e8',
                    }}
                  >
                    <span>{language === 'id' ? dest.count_id : dest.count_en}</span>
                    <span style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#ffffff', fontWeight: 600 }}>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="packages" style={{ background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <span className="badge badge-accent" style={{ marginBottom: 'var(--space-3)' }}>
              {t.hero.badge}
            </span>
            <h2 className="section-title">{t.nav.products}</h2>
          </div>

          <div className="packages-grid">
            {popularPackages.map((pkg) => (
              <div key={pkg.name} className="package-card">
                <Link href={`/products/${pkg.slug}`} className="package-card-image" style={{ display: 'block' }}>
                  <img src={pkg.image} alt={pkg.name} loading="lazy" />
                  <div className="package-card-badge">{language === 'id' ? pkg.category_id : pkg.category_en}</div>
                  <button
                    type="button"
                    className="package-card-favorite"
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
                    <Heart className="w-4 h-4" fill={favorites[pkg.name] ? 'currentColor' : 'none'} />
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
                  <p className="package-card-description">{language === 'id' ? pkg.description_id : pkg.description_en}</p>

                  <div className="package-card-meta">
                    <span className="package-card-meta-item">
                      <Clock className="w-3.5 h-3.5" style={{ color: '#7994b6' }} />
                      <span>{pkg.duration}</span>
                    </span>
                    <span className="package-card-meta-item">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{pkg.reviews} {language === 'id' ? 'ulasan' : 'reviews'}</span>
                    </span>
                  </div>

                  <div className="package-card-footer">
                    <div>
                      <div className="package-card-price">{formatCurrency(pkg.price)}</div>
                      <div className="package-card-price-unit">
                        {pkg.perPerson ? (language === 'id' ? '/ orang' : '/ person') : (language === 'id' ? '/ paket' : '/ package')}
                      </div>
                    </div>

                    <Link href={`/products/${pkg.slug}`} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px' }}>
                      <span>{language === 'id' ? 'Lihat Detail' : 'View Details'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="testimonials">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <span className="badge" style={{ marginBottom: 'var(--space-3)' }}>
              {t.testimonials.badge}
            </span>
            <h2 className="section-title">{t.testimonials.title}</h2>
            <p className="section-subtitle">{t.testimonials.subtitle}</p>
          </div>

          <div className="testimonials-grid">
            {heartfeltStories.map((t, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-top-row">
                  <span className="testimonial-trip-badge">{t.trip}</span>
                  <div className="testimonial-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="testimonial-text">&ldquo;{language === 'id' ? t.quote_id : t.quote_en}&rdquo;</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.author.charAt(0)}</div>
                  <div>
                    <div className="testimonial-author-name">
                      <span>{t.author}</span>
                      <span className="testimonial-verified-badge">
                        <CheckCircle2 className="w-3 h-3" style={{ color: '#056653' }} />
                        <span>{language === 'id' ? 'Terverifikasi' : 'Verified'}</span>
                      </span>
                    </div>
                    <div className="testimonial-author-location">
                      <MapPin className="w-3 h-3" style={{ color: '#00959c' }} />
                      <span>{language === 'id' ? `Wisatawan asal ${t.origin}` : `Traveler from ${t.origin}`}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <span className="badge" style={{ marginBottom: 'var(--space-3)', background: '#eaf4fa', color: '#5c7ebd', border: '1px solid #cad9e8' }}>
              {t.cta.badge}
            </span>
            <h2 className="cta-title">{t.cta.title}</h2>
            <p className="cta-description">{t.cta.subtitle}</p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => window.dispatchEvent(new CustomEvent('openChat'))}>
                <MessageSquare className="w-4 h-4 mr-1.5" />
                <span>{t.cta.button}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand"><span>Radha Bali</span></div>
              <p className="footer-brand-text">{t.footer.description}</p>
            </div>
          </div>
          <div className="footer-bottom">
            <div>&copy; 2026 Radha Bali.</div>
          </div>
        </div>
      </footer>

      <ChatWidget />
    </>
  );
}
