'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  MapPin,
  Clock,
  Star,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  Compass,
  MessageCircle,
  Tag,
  ChevronDown,
} from 'lucide-react';
import { generateWhatsAppBookingUrl } from '@/lib/destinations';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductCatalogClientProps {
  initialProducts: Product[];
}

// Category options
const CATEGORIES = [
  { id: 'all', label: 'Semua Paket' },
  { id: 'paket_wisata', label: 'Tour & Day Trip' },
  { id: 'aktivitas', label: 'Aktivitas & Alam' },
  { id: 'hotel', label: 'Resort & Sanctuary' },
  { id: 'transport', label: 'Transportasi' },
  { id: 'custom', label: 'Paket Kustom' },
];

// Sort options
const SORT_OPTIONS = [
  { id: 'popular', label: 'Paling Populer' },
  { id: 'rating', label: 'Rating Tertinggi' },
  { id: 'price_asc', label: 'Harga: Rendah ke Tinggi' },
  { id: 'price_desc', label: 'Harga: Tinggi ke Rendah' },
  { id: 'duration', label: 'Durasi Terpanjang' },
];

// function formatPrice(price: number): string {
//   return new Intl.NumberFormat('id-ID', {
//     style: 'currency',
//     currency: 'IDR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(price);
// }

export default function ProductCatalogClient({ initialProducts }: ProductCatalogClientProps) {
  const searchParams = useSearchParams();
  const urlDestination = searchParams?.get('destination') || searchParams?.get('dest') || '';
  const urlSearch = searchParams?.get('search') || '';

  const [destinationFilter, setDestinationFilter] = useState(urlDestination);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const { formatCurrency, language } = useLanguage();

  useEffect(() => {
    if (urlDestination) {
      setDestinationFilter(urlDestination);
    }
  }, [urlDestination]);

  // Extract unique regions
  const regions = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.region) set.add(p.region);
    });
    return Array.from(set).sort();
  }, [initialProducts]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        // Destination filter (e.g., from homepage destination click or direct parameter)
        if (destinationFilter.trim()) {
          const d = destinationFilter.toLowerCase();
          const matchDest = product.destination?.toLowerCase().includes(d);
          const matchRegion = product.region?.toLowerCase().includes(d);
          const matchName = product.name?.toLowerCase().includes(d);
          const matchDesc = product.description?.toLowerCase().includes(d);
          if (!matchDest && !matchRegion && !matchName && !matchDesc) {
            return false;
          }
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = product.name.toLowerCase().includes(q);
          const matchDest = product.destination?.toLowerCase().includes(q);
          const matchRegion = product.region?.toLowerCase().includes(q);
          const matchDesc = product.short_description?.toLowerCase().includes(q) ||
            product.description?.toLowerCase().includes(q);
          const matchHighlight = product.highlights?.some((h) => h.toLowerCase().includes(q));

          if (!matchName && !matchDest && !matchRegion && !matchDesc && !matchHighlight) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && product.category !== selectedCategory) {
          return false;
        }

        // Region filter
        if (selectedRegion !== 'all' && product.region !== selectedRegion) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return (b.review_count || 0) - (a.review_count || 0);
        }
        if (sortBy === 'rating') {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (sortBy === 'price_asc') {
          return a.price - b.price;
        }
        if (sortBy === 'price_desc') {
          return b.price - a.price;
        }
        if (sortBy === 'duration') {
          return (b.duration_days || 1) - (a.duration_days || 1);
        }
        return 0;
      });
  }, [initialProducts, destinationFilter, searchQuery, selectedCategory, selectedRegion, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setDestinationFilter('');
    setSelectedCategory('all');
    setSelectedRegion('all');
    setSortBy('popular');
  };

  return (
    <div className="catalog-wrapper">
      {/* Active Destination Filter Banner */}
      {destinationFilter && (
        <div className="catalog-active-filter-alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <MapPin size={18} className="text-amber-600" />
            <span>
              Menampilkan paket wisata untuk destinasi: <strong>{destinationFilter}</strong> ({filteredProducts.length} paket ditemukan)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDestinationFilter('')}
            className="btn btn-secondary btn-sm"
          >
            <span>Tampilkan Semua Destinasi (Reset)</span>
          </button>
        </div>
      )}

      {/* Search and Filter Panel */}
      <section className="catalog-controls-section">
        <div className="catalog-controls-container">
          {/* Search Bar */}
          <div className="catalog-search-bar">
            <Search className="catalog-search-icon" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari destinasi, nama paket, aktivitas (contoh: Nusa Penida, Snorkeling, Kintamani, Ubud)..."
              className="catalog-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="catalog-search-clear"
                title="Hapus pencarian"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="catalog-category-pills">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const count =
                cat.id === 'all'
                  ? initialProducts.length
                  : initialProducts.filter((p) => p.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`catalog-pill ${isActive ? 'catalog-pill-active' : ''}`}
                >
                  <span>{cat.label}</span>
                  <span className="catalog-pill-badge">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Secondary Controls: Region & Sort */}
          <div className="catalog-secondary-bar">
            <div className="catalog-dropdown-group">
              <div className="catalog-dropdown-item">
                <label htmlFor="region-select" className="catalog-label">
                  <MapPin size={14} />
                  <span>Wilayah</span>
                </label>
                <div className="catalog-select-wrapper">
                  <select
                    id="region-select"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="catalog-select"
                  >
                    <option value="all">Semua Wilayah</option>
                    {regions.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="catalog-select-chevron" />
                </div>
              </div>

              <div className="catalog-dropdown-item">
                <label htmlFor="sort-select" className="catalog-label">
                  <SlidersHorizontal size={14} />
                  <span>Urutan</span>
                </label>
                <div className="catalog-select-wrapper">
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="catalog-select"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="catalog-select-chevron" />
                </div>
              </div>
            </div>

            {/* Results Count & Reset */}
            <div className="catalog-stats-row">
              <span className="catalog-count-text">
                Menampilkan <strong>{filteredProducts.length}</strong> dari {initialProducts.length} paket
              </span>
              {(searchQuery || selectedCategory !== 'all' || selectedRegion !== 'all' || sortBy !== 'popular') && (
                <button type="button" onClick={resetFilters} className="catalog-reset-btn">
                  <RotateCcw size={13} />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="catalog-grid-section">
        {filteredProducts.length === 0 ? (
          <div className="catalog-empty-state">
            <div className="catalog-empty-icon">
              <Compass size={44} />
            </div>
            <h3 className="catalog-empty-title">Tidak Ada Paket Yang Sesuai</h3>
            <p className="catalog-empty-desc">
              Kami tidak menemukan paket yang cocok dengan kata kunci atau filter yang Anda pilih. Silakan sesuaikan pencarian atau reset filter.
            </p>
            <button type="button" onClick={resetFilters} className="btn btn-primary">
              <RotateCcw size={16} />
              <span>Tampilkan Semua Paket</span>
            </button>
          </div>
        ) : (
          <div className="catalog-cards-grid">
            {filteredProducts.map((product) => {
              const waUrl = generateWhatsAppBookingUrl(
                product.name,
                formatCurrency(product.price)
              );

              return (
                <article key={product.id || product.slug} className="warm-product-card">
                  {/* Card Thumbnail */}
                  <div className="warm-product-thumb-container">
                    <img
                      src={product.image_url || '/images/bali-warm-landscape.jpg'}
                      alt={product.name}
                      className="warm-product-thumb"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/bali-warm-landscape.jpg';
                      }}
                    />
                    <div className="warm-thumb-overlay" />

                    {/* Badges on Thumbnail */}
                    <div className="warm-thumb-badges">
                      <span className="warm-badge-category">
                        {product.category === 'paket_wisata'
                          ? 'Paket Wisata'
                          : product.category === 'aktivitas'
                          ? 'Aktivitas'
                          : product.category === 'hotel'
                          ? 'Sanctuary'
                          : product.category === 'transport'
                          ? 'Transport'
                          : 'Kustom'}
                      </span>
                      <span className="warm-badge-duration">
                        <Clock size={12} />
                        <span>
                          {product.duration_days > 1
                            ? `${product.duration_days} Hari`
                            : '1 Hari Penuh'}
                        </span>
                      </span>
                    </div>

                    {/* Destination Pill */}
                    <div className="warm-thumb-dest">
                      <MapPin size={12} />
                      <span>{product.destination}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="warm-product-body">
                    {/* Rating & Review */}
                    <div className="warm-product-rating">
                      <div className="warm-stars">
                        <Star size={14} className="warm-star-filled" />
                        <span className="warm-rating-num">{product.rating.toFixed(1)}</span>
                      </div>
                      <span className="warm-review-count">({product.review_count} ulasan)</span>
                    </div>

                    {/* Title */}
                    <h3 className="warm-product-title">
                      <Link href={`/products/${product.slug}`} className="warm-title-link">
                        {product.name}
                      </Link>
                    </h3>

                    {/* Description */}
                    <p className="warm-product-desc">
                      {product.short_description || product.description?.slice(0, 110) + '...'}
                    </p>

                    {/* Highlights */}
                    {product.highlights && product.highlights.length > 0 && (
                      <div className="warm-product-tags">
                        {product.highlights.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="warm-product-tag">
                            <Tag size={10} />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Card Footer: Price & Actions */}
                    <div className="warm-product-footer">
                      <div className="warm-price-col">
                        <span className="warm-price-label">{language === 'en' ? 'Starting from' : 'Mulai dari'}</span>
                        <div className="warm-price-val">
                          {formatCurrency(product.price)}
                          <span className="warm-price-unit">
                            {product.price_per_person ? (language === 'en' ? '/person' : '/org') : (language === 'en' ? '/unit' : '/unit')}
                          </span>
                        </div>
                      </div>

                      <div className="warm-action-buttons">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="warm-btn-wa"
                          title="Konsultasi langsung via WhatsApp"
                        >
                          <MessageCircle size={15} />
                        </a>
                        <Link
                          href={`/products/${product.slug}`}
                          className="warm-btn-detail"
                        >
                          <span>Detail</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
