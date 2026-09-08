import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Calendar,
  Compass,
  Navigation,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { getServerSupabaseClient } from '@/lib/supabase';
import { seedProducts } from '@/data/seed-products';
import type { Product } from '@/lib/types';
import {
  getDestinationLocation,
  generateWhatsAppBookingUrl,
  getItineraryStops,
} from '@/lib/destinations';
import ChatWidget from '@/components/chat/ChatWidget';

// ============================================
// Radha Bali - Product Detail Page
// Clean, simple, readable, and 100% emoji-free
// ============================================

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Format IDR Currency
function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Fetch main product from Supabase or fallback to seed
async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (!error && data) {
      return data as Product;
    }
  } catch {
    // Supabase query failed, fallback to local seed data
  }

  // Fallback to local seed products
  const localMatch = seedProducts.find((p) => p.slug === slug);
  if (localMatch) {
    return {
      ...localMatch,
      id: localMatch.slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Product;
  }

  return null;
}

// Fetch other packages in the same destination / region
async function getRelatedProducts(currentSlug: string, destination: string, region: string): Promise<Product[]> {
  try {
    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .neq('slug', currentSlug)
      .eq('is_active', true)
      .or(`destination.eq.${destination},region.eq.${region}`)
      .limit(3);

    if (!error && data && data.length > 0) {
      return data as Product[];
    }
  } catch {
    // Fallback to local seed products
  }

  return seedProducts
    .filter(
      (p) =>
        p.slug !== currentSlug &&
        p.is_active &&
        (p.destination.toLowerCase() === destination.toLowerCase() ||
          p.region.toLowerCase() === region.toLowerCase())
    )
    .slice(0, 3) as Product[];
}

// Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Paket Wisata Tidak Ditemukan — Radha Bali',
      description: 'Paket perjalanan wisata Bali yang Anda cari tidak ditemukan.',
    };
  }

  return {
    title: `${product.name} — Radha Bali`,
    description: product.short_description || product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | Radha Bali`,
      description: product.short_description || product.description.slice(0, 160),
      images: [
        {
          url: product.image_url,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const geoInfo = getDestinationLocation(product.destination, product.region);
  const formattedPrice = formatPrice(product.price);
  const whatsappUrl = generateWhatsAppBookingUrl(product.name, formattedPrice);
  const itineraryStops = getItineraryStops(product.slug, product.destination, product.description);
  const relatedProducts = await getRelatedProducts(product.slug, product.destination, product.region);

  const categoryLabels: Record<string, string> = {
    paket_wisata: 'Paket Wisata',
    aktivitas: 'Aktivitas & Tour',
    hotel: 'Resort & Villa',
    transport: 'Transportasi VIP',
  };

  return (
    <div className="product-detail-page">
      {/* ---- Top Navigation Bar ---- */}
      <header className="product-detail-nav">
        <div className="container">
          <div className="product-nav-inner">
            <div className="product-nav-left">
              <Link href="/products" className="product-nav-back-catalog">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Katalog Paket</span>
              </Link>
              <div className="product-breadcrumb">
                <Link href="/" className="breadcrumb-link">Beranda</Link>
                <span className="breadcrumb-separator">/</span>
                <Link href="/products" className="breadcrumb-link">Katalog Paket</Link>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-item">{categoryLabels[product.category] || 'Wisata'}</span>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">{product.name}</span>
              </div>
            </div>

            <div className="product-nav-right">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1" style={{ color: '#5c7ebd' }} />
                <span>Konsultasi Pemilik</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ---- Main Content ---- */}
      <main className="product-detail-main">
        <div className="container">
          {/* Header Title & Basic Info */}
          <div className="product-header-section">
            <div className="product-badges-row">
              <span className="badge badge-accent">
                {categoryLabels[product.category] || 'Paket Wisata'}
              </span>
              <span className="badge">
                Terverifikasi Lapangan
              </span>
              <span className="badge">
                Konfirmasi Cepat
              </span>
            </div>

            <h1 className="product-title">{product.name}</h1>

            <div className="product-meta-row">
              <div className="product-meta-item">
                <MapPin className="w-4 h-4" style={{ color: '#00959c' }} />
                <span className="font-medium">Lokasi: {product.destination}, {product.region}</span>
              </div>
              <div className="product-meta-item">
                <Clock className="w-4 h-4" style={{ color: '#7994b6' }} />
                <span>Durasi: {product.duration_days} Hari</span>
              </div>
              <div className="product-meta-item">
                <span className="font-semibold text-slate-800">Rating: {product.rating} / 5.0</span>
                <span className="text-slate-500">({product.review_count} ulasan terverifikasi)</span>
              </div>
            </div>
          </div>

          {/* 2-Column Content Layout */}
          <div className="product-layout-grid">
            {/* Left Column: Details, Itinerary, Facilities, Map, Related */}
            <div className="product-content-left">
              {/* Clean Cover Photo (No distracting overlay text) */}
              <div className="product-media-card">
                <img
                  src={product.image_url || '/images/bali-warm-landscape.jpg'}
                  alt={product.name}
                  className="product-cover-image"
                />
              </div>

              {/* Highlights Clean Tags */}
              <div className="product-clean-tags">
                <span className="tags-label">Kategori Minat:</span>
                {product.highlights.map((tag) => (
                  <span key={tag} className="clean-tag">
                    {tag.charAt(0).toUpperCase() + tag.slice(1).replace(/_/g, ' ')}
                  </span>
                ))}
              </div>

              {/* Overview / Deskripsi Paket */}
              <div className="product-section-card">
                <div className="section-card-header">
                  <div className="section-card-icon">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="section-card-title">Ringkasan Paket Wisata</h2>
                    <p className="section-card-subtitle">
                      Gambaran menyeluruh agenda perjalanan dan keunggulan paket
                    </p>
                  </div>
                </div>
                <div className="product-description-text">
                  <p>{product.description}</p>
                </div>
              </div>

              {/* ============================================ */}
              {/* DETAIL PAKET WISATA PER LOKASI (ITINERARY) */}
              {/* ============================================ */}
              <div className="product-section-card">
                <div className="section-card-header">
                  <div className="section-card-icon">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="section-card-title">Rute &amp; Destinasi Singgah per Lokasi</h2>
                    <p className="section-card-subtitle">
                      Rincian tempat yang dikunjungi dan aktivitas terencana di setiap lokasi
                    </p>
                  </div>
                </div>

                <div className="itinerary-stops-list">
                  {itineraryStops.map((stop) => (
                    <div key={stop.stopNumber} className="itinerary-stop-item">
                      <div className="stop-number-badge">
                        <span>{stop.stopNumber}</span>
                      </div>
                      <div className="stop-content">
                        <div className="stop-header">
                          <h3 className="stop-title">{stop.locationName}</h3>
                          <span className="stop-tag">Lokasi {stop.stopNumber}</span>
                        </div>
                        <p className="stop-activity">{stop.activity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fasilitas Include & Exclude */}
              <div className="product-section-card">
                <div className="section-card-header">
                  <div className="section-card-icon">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="section-card-title">Fasilitas &amp; Ketentuan Layanan</h2>
                    <p className="section-card-subtitle">
                      Daftar fasilitas yang sudah termasuk dan yang belum termasuk dalam paket
                    </p>
                  </div>
                </div>

                <div className="facilities-grid">
                  {/* Fasilitas Termasuk */}
                  <div className="facility-card facility-includes">
                    <div className="facility-title-row">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      <h3 className="facility-column-title">Fasilitas Termasuk</h3>
                    </div>
                    <ul className="facility-list">
                      {product.includes.map((item, idx) => (
                        <li key={idx} className="facility-item">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Fasilitas Tidak Termasuk */}
                  <div className="facility-card facility-excludes">
                    <div className="facility-title-row">
                      <XCircle className="w-4 h-4 text-slate-400" />
                      <h3 className="facility-column-title">Tidak Termasuk</h3>
                    </div>
                    <ul className="facility-list">
                      {product.excludes.map((item, idx) => (
                        <li key={idx} className="facility-item">
                          <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Informasi Operasional */}
              <div className="product-section-card">
                <h2 className="section-card-title" style={{ marginBottom: 'var(--space-4)' }}>
                  Ketentuan Operasional
                </h2>
                <div className="specs-grid">
                  <div className="spec-card">
                    <Users className="w-5 h-5 mb-2" style={{ color: '#5c7ebd' }} />
                    <div className="spec-label">Kapasitas Peserta</div>
                    <div className="spec-value">
                      {product.max_participants ? `${product.max_participants} Orang` : 'Fleksibel'}
                    </div>
                  </div>
                  <div className="spec-card">
                    <Calendar className="w-5 h-5 mb-2" style={{ color: '#056653' }} />
                    <div className="spec-label">Jadwal Operasional</div>
                    <div className="spec-value">Tersedia Setiap Hari</div>
                  </div>
                  <div className="spec-card">
                    <ShieldCheck className="w-5 h-5 mb-2" style={{ color: '#79af93' }} />
                    <div className="spec-label">Ketentuan Reschedule</div>
                    <div className="spec-value">Gratis 1 Kali Penjadwalan</div>
                  </div>
                </div>
              </div>

              {/* ============================================ */}
              {/* PETA LOKASI GOOGLE MAPS */}
              {/* ============================================ */}
              <div className="product-section-card map-section-card" id="location-map">
                <div className="section-card-header">
                  <div className="section-card-icon">
                    <MapPin className="w-5 h-5" style={{ color: '#00959c' }} />
                  </div>
                  <div>
                    <h2 className="section-card-title">Peta Lokasi Destinasi</h2>
                    <p className="section-card-subtitle">
                      Titik lokasi area wisata di Google Maps
                    </p>
                  </div>
                </div>

                {/* Banner Lokasi */}
                <div className="location-info-banner">
                  <div className="location-info-left">
                    <MapPin className="w-5 h-5 shrink-0" style={{ color: '#00959c' }} />
                    <div>
                      <div className="location-name">{product.destination}</div>
                      <div className="location-address">{geoInfo.formattedAddress}</div>
                    </div>
                  </div>

                  <a
                    href={geoInfo.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    <span>Buka di Google Maps</span>
                  </a>
                </div>

                {/* Iframe Peta Interaktif */}
                <div className="map-frame-wrapper">
                  <iframe
                    title={`Peta Lokasi ${product.destination}`}
                    src={geoInfo.embedMapUrl}
                    className="map-iframe"
                    loading="lazy"
                    allowFullScreen
                  />
                  <a
                    href={geoInfo.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-open-overlay"
                    aria-label="Buka lokasi di Google Maps"
                  >
                    <span className="map-overlay-badge">
                      <ExternalLink className="w-3.5 h-3.5 mr-1" />
                      Klik untuk Petunjuk Arah
                    </span>
                  </a>
                </div>
              </div>

              {/* ============================================ */}
              {/* PAKET LAIN DI LOKASI / DESTINASI INI */}
              {/* ============================================ */}
              {relatedProducts.length > 0 && (
                <div className="product-section-card">
                  <div className="section-card-header">
                    <div className="section-card-icon">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="section-card-title">
                        Paket Wisata Lainnya di Wilayah {product.destination}
                      </h2>
                      <p className="section-card-subtitle">
                        Pilihan aktivitas dan paket wisata serupa di kawasan yang sama
                      </p>
                    </div>
                  </div>

                  <div className="related-packages-grid">
                    {relatedProducts.map((item) => (
                      <Link
                        key={item.slug}
                        href={`/products/${item.slug}`}
                        className="related-package-card"
                      >
                        <div className="related-image-wrapper">
                          <img src={item.image_url} alt={item.name} loading="lazy" />
                        </div>
                        <div className="related-content">
                          <div className="related-meta">
                            <span>{item.destination}</span>
                            <span className="text-slate-300">/</span>
                            <span>{item.duration_days} Hari</span>
                          </div>
                          <h4 className="related-title">{item.name}</h4>
                          <div className="related-footer">
                            <span className="related-price">{formatPrice(item.price)}</span>
                            <span className="related-arrow">
                              Detail <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sticky Booking Card & WhatsApp Owner */}
            <div className="product-content-right">
              <div className="booking-sticky-card">
                {/* Tarif Paket */}
                <div className="booking-price-header">
                  <div className="price-label">Tarif Paket Resmi</div>
                  <div className="price-number-row">
                    <span className="price-amount">{formattedPrice}</span>
                    <span className="price-unit">
                      {product.price_per_person ? '/ orang' : '/ paket'}
                    </span>
                  </div>
                  <div className="price-subtext">
                    Sudah termasuk asuransi dan seluruh fasilitas yang tercantum
                  </div>
                </div>

                {/* ============================================ */}
                {/* Kontak Langsung WhatsApp Pemilik / Pengelola */}
                {/* ============================================ */}
                <div className="whatsapp-inquiry-box">
                  <div className="concierge-profile-row">
                    <div className="concierge-avatar">
                      <MessageCircle className="w-5 h-5" style={{ color: '#5c7ebd' }} />
                    </div>
                    <div className="concierge-info">
                      <div className="concierge-name">Layanan Pemilik &amp; Reservasi</div>
                      <div className="concierge-role">Radha Bali Travel Concierge</div>
                      <div className="concierge-status">
                        Status: Siap Melayani | Respon Cepat
                      </div>
                    </div>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp-direct"
                  >
                    <MessageCircle className="w-5 h-5 shrink-0" />
                    <span>Hubungi Pemilik via WhatsApp</span>
                  </a>

                  <p className="whatsapp-guarantee-note">
                    Pesan reservasi dan nama paket akan otomatis terisi di chat WhatsApp Anda.
                  </p>
                </div>

                {/* Opsi Konsultasi Nusa AI */}
                <div className="nusa-consult-box">
                  <div className="nusa-consult-header">
                    <Sparkles className="w-4 h-4" style={{ color: '#5c7ebd' }} />
                    <span>Perlu bantuan pertanyaan?</span>
                  </div>
                  <p className="nusa-consult-desc">
                    Tanyakan ketersediaan tanggal atau rute khusus kepada asisten digital Nusa AI kami.
                  </p>
                  <a href="#location-map" className="btn btn-secondary btn-sm w-full">
                    Lihat Peta Lokasi
                  </a>
                </div>

                {/* Keunggulan Layanan */}
                <div className="trust-features-list">
                  <div className="trust-feature-item">
                    <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Harga Terbuka Tanpa Biaya Tersembunyi</span>
                  </div>
                  <div className="trust-feature-item">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Pemandu Wisata Lokal Terverifikasi</span>
                  </div>
                  <div className="trust-feature-item">
                    <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Kemudahan Penjadwalan Ulang</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom Back to Catalog Banner */}
          <div className="product-detail-catalog-banner">
            <div>
              <div className="catalog-banner-title">Ingin Melihat Pilihan Liburan Lainnya?</div>
              <div className="catalog-banner-sub">
                Temukan 43 paket wisata Bali lainnya di katalog lengkap dengan filter destinasi dan kategori.
              </div>
            </div>
            <Link href="/products" className="btn btn-primary">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Kembali ke Seluruh Katalog Paket</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}
