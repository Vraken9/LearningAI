import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Compass, Sparkles, Phone, ArrowLeft } from 'lucide-react';
import { getServerSupabaseClient } from '@/lib/supabase';
import { seedProducts } from '@/data/seed-products';
import type { Product } from '@/lib/types';
import ChatWidget from '@/components/chat/ChatWidget';
import ProductCatalogClient from './ProductCatalogClient';

export const metadata: Metadata = {
  title: 'Katalog Paket Wisata Bali — Radha Bali Tour & Travel',
  description:
    'Jelajahi 44 paket perjalanan dan wisata alam Bali terlengkap. Dari keindahan tebing Nusa Penida, terasering Ubud, sunrise Gunung Batur, hingga ketenangan spiritual Pura Tirta Empul.',
};

async function getAllProducts(): Promise<Product[]> {
  try {
    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as Product[];
    }
  } catch (err) {
    console.warn('Database fetch failed, falling back to seed products:', err);
  }

  // Fallback to seedProducts
  return seedProducts.filter((p) => p.is_active) as unknown as Product[];
}

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="warm-page-container">
      {/* Top Warm Navigation Header */}
      <header className="warm-site-header">
        <div className="warm-header-inner">
          <Link href="/" className="warm-logo-link">
            <div className="warm-logo-text">
              <span className="warm-brand-name">Radha Bali</span>
              <span className="warm-brand-sub">Tour & Hospitality</span>
            </div>
          </Link>

          <nav className="warm-header-nav">
            <Link href="/" className="warm-nav-item">
              Beranda
            </Link>
            <Link href="/products" className="warm-nav-item warm-nav-item-active">
              Katalog Paket
            </Link>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Radha%20Bali%2C%20saya%20ingin%20konsultasi%20paket%20wisata"
              target="_blank"
              rel="noopener noreferrer"
              className="warm-nav-cta"
            >
              <Phone size={15} />
              <span>Hubungi Kami</span>
            </a>
          </nav>
        </div>
      </header>

      {/* Catalog Hero Header */}
      <section className="catalog-hero-banner">
        <div className="catalog-hero-inner">
          <div className="catalog-breadcrumb">
            <Link href="/" className="catalog-breadcrumb-link">
              <ArrowLeft size={14} />
              <span>Kembali ke Beranda</span>
            </Link>
            <span className="catalog-breadcrumb-sep">/</span>
            <span className="catalog-breadcrumb-current">Seluruh Paket</span>
          </div>

          <div className="catalog-hero-badge">
            <Sparkles size={14} />
            <span>Koleksi Terlengkap Pulau Dewata</span>
          </div>

          <h1 className="catalog-hero-title">
            Katalog Perjalanan & Eksplorasi Bali
          </h1>

          <p className="catalog-hero-subtitle">
            Temukan 44 destinasi pemandangan alam, petualangan tropis, dan sanctuary istimewa yang dirancang dengan ketulusan keramahan Bali. Harga transparan, pemandu lokal terpercaya, dan fleksibilitas penuh.
          </p>
        </div>
      </section>

      {/* Interactive Catalog with Filter & Search */}
      <main className="catalog-main-content">
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Memuat katalog paket wisata...</div>}>
          <ProductCatalogClient initialProducts={products} />
        </Suspense>
      </main>

      {/* Warm Footer */}
      <footer className="warm-site-footer">
        <div className="warm-footer-inner">
          <div className="warm-footer-brand">
            <div className="warm-footer-logo">
              <span className="warm-brand-name">Radha Bali</span>
            </div>
            <p className="warm-footer-tagline">
              Menghadirkan keindahan alam dan kehangatan tradisi Bali dalam setiap langkah perjalanan Anda.
            </p>
          </div>

          <div className="warm-footer-links">
            <div className="warm-footer-col">
              <h4>Destinasi Unggulan</h4>
              <ul>
                <li><Link href="/products?dest=Nusa+Penida">Nusa Penida</Link></li>
                <li><Link href="/products?dest=Ubud">Ubud & Gianyar</Link></li>
                <li><Link href="/products?dest=Kintamani">Kintamani & Batur</Link></li>
                <li><Link href="/products?dest=Uluwatu">Uluwatu & Badung</Link></li>
              </ul>
            </div>
            <div className="warm-footer-col">
              <h4>Kategori Wisata</h4>
              <ul>
                <li><Link href="/products">Tour Harian</Link></li>
                <li><Link href="/products">Sanctuary & Villa</Link></li>
                <li><Link href="/products">Petualangan Alam</Link></li>
                <li><Link href="/products">Transport & Sewa Mobil</Link></li>
              </ul>
            </div>
            <div className="warm-footer-col">
              <h4>Layanan & Reservasi</h4>
              <p className="warm-footer-contact">WhatsApp: +62 812-3456-7890</p>
              <p className="warm-footer-contact">Email: info@radhabali.com</p>
              <p className="warm-footer-contact">Jam Operasional: 07.00 - 22.00 WITA</p>
            </div>
          </div>
        </div>

        <div className="warm-footer-bottom">
          <p>© {new Date().getFullYear()} Radha Bali Tour & Travel. Hak Cipta Dilindungi.</p>
        </div>
      </footer>

      {/* Floating AI Travel Assistant Widget */}
      <ChatWidget />
    </div>
  );
}
