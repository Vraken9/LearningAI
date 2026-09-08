'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  LayoutDashboard,
  Package,
  BookOpen,
  MessageSquare,
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Activity,
  Zap,
  ExternalLink,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Bot,
  MapPin,
  Star,
  ArrowLeft,
  FileText,
  Lock,
  LogOut,
  ShieldCheck,
  Clock,
} from 'lucide-react';

// ============================================
// Radha Bali - Admin Panel (Supabase Aesthetic)
// Dashboard, Products, Documents, Conversations
// Clean dark theme, precision tokens, zero emojis
// ============================================

type Tab = 'dashboard' | 'products' | 'documents' | 'conversations';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---- Toast Component ----
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`admin-toast ${type}`}>
      {type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      ) : (
        <AlertCircle className="w-4 h-4 text-rose-400" />
      )}
      <span>{message}</span>
    </div>
  );
}

// ============================================
// ADMIN SECURITY GATE (LOGIN MODAL / VIEW)
// Progressive lockout cooldown timer
// ============================================
function AdminLoginGate({ onLoginSuccess }: { onLoginSuccess: (user: string) => void }) {
  const [email, setEmail] = useState('admin@radhabali.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        onLoginSuccess(data.user || email);
      } else {
        setError(data.error || 'Autentikasi gagal.');
        if (data.retryAfterSeconds) {
          setCooldown(data.retryAfterSeconds);
        }
      }
    } catch {
      setError('Gagal menghubungi server autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <h1 className="admin-login-title">Radha Bali Management</h1>
          <p className="admin-login-subtitle">
            Gerbang Autentikasi Pengelola Terverifikasi
          </p>
        </div>

        {error && (
          <div className="admin-login-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {cooldown > 0 && (
          <div className="admin-login-cooldown">
            <Clock className="w-4 h-4 shrink-0 text-amber-600" />
            <div>
              <div className="font-bold text-amber-800">Waktu Jeda Keamanan Aktif</div>
              <div className="text-xs text-amber-700">
                Silakan tunggu {cooldown} detik sebelum mencoba login kembali.
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label className="admin-form-label">Email Administrator</label>
            <input
              type="email"
              className="admin-form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || cooldown > 0}
              required
              placeholder="admin@radhabali.com"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Kata Sandi Kuat</label>
            <div className="admin-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="admin-form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || cooldown > 0}
                required
                placeholder="Masukkan kata sandi admin"
              />
              <button
                type="button"
                className="admin-toggle-pwd"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full admin-login-btn"
            disabled={loading || cooldown > 0 || !email || !password}
          >
            {loading ? (
              'Memverifikasi Kredensial...'
            ) : cooldown > 0 ? (
              `Menunggu Jeda (${cooldown}s)`
            ) : (
              <>
                <Lock className="w-4 h-4 mr-1.5" />
                <span>Masuk ke Admin Console</span>
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <a href="/" className="admin-login-back">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda Radha Bali</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN ADMIN PAGE
// ============================================
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<string>('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Verify session on mount
  useEffect(() => {
    fetch('/api/admin/auth')
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Not authenticated');
      })
      .then((data) => {
        setIsAuthenticated(true);
        setAdminUser(data.user || 'admin@radhabali.com');
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
      setAdminUser('');
      setToast({ message: 'Sesi admin berhasil diakhiri.', type: 'success' });
    } catch {
      setIsAuthenticated(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Checking session
  if (isAuthenticated === null) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-spinner" />
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Memverifikasi sesi keamanan...
        </span>
      </div>
    );
  }

  // Not authenticated: Show Login Gate
  if (!isAuthenticated) {
    return (
      <>
        <AdminLoginGate
          onLoginSuccess={(user) => {
            setIsAuthenticated(true);
            setAdminUser(user);
            showToast('Selamat datang di Admin Management Console.', 'success');
          }}
        />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </>
    );
  }

  // Authenticated: Render Admin Dashboard
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brand-icon">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="admin-sidebar-brand-name">Radha Bali</span>
            <span className="admin-sidebar-brand-tag">MANAGEMENT CONSOLE</span>
          </div>
        </div>

        <div className="admin-user-profile-badge">
          <div className="admin-user-avatar">
            <User className="w-3 h-3 text-emerald-600" />
          </div>
          <div className="admin-user-info">
            <span className="admin-user-email">{adminUser}</span>
            <span className="admin-user-role">Super Administrator</span>
          </div>
        </div>

        <nav className="admin-nav">
          {([
            { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { key: 'products', icon: Package, label: 'Products' },
            { key: 'documents', icon: BookOpen, label: 'Knowledge Base' },
            { key: 'conversations', icon: MessageSquare, label: 'Conversations' },
          ] as { key: Tab; icon: typeof LayoutDashboard; label: string }[]).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`admin-nav-item ${activeTab === item.key ? 'active' : ''}`}
                onClick={() => setActiveTab(item.key)}
              >
                <span className="admin-nav-icon">
                  <Icon className="w-4 h-4" />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-button" onClick={handleLogout}>
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span>Keluar Console</span>
          </button>
          <a href="/" className="admin-back-link">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ke Beranda Website</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'products' && <ProductsTab showToast={showToast} />}
        {activeTab === 'documents' && <DocumentsTab showToast={showToast} />}
        {activeTab === 'conversations' && <ConversationsTab />}
      </main>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ============================================
// DASHBOARD TAB
// ============================================
function DashboardTab() {
  const [stats, setStats] = useState<AnyRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
      </div>
    );
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="admin-header-subtitle">Status operasional dan performa platform Radha Bali</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <Package className="w-4 h-4" />
          </div>
          <div className="admin-stat-value">{stats?.total_products || 0}</div>
          <div className="admin-stat-label">Total Produk Katalog</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="admin-stat-value">{stats?.active_products || 0}</div>
          <div className="admin-stat-label">Produk Aktif</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon orange">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="admin-stat-value">{stats?.total_documents || 0}</div>
          <div className="admin-stat-label">Dokumen RAG Knowledge</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="admin-stat-value">{stats?.total_conversations || 0}</div>
          <div className="admin-stat-label">Sesi Percakapan AI</div>
        </div>
      </div>

      {/* Quick info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
        <div className="admin-table-container" style={{ padding: 'var(--space-6)' }}>
          <h3
            style={{
              marginBottom: 'var(--space-4)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: 'var(--text-base)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Aktivitas Hari Ini</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Percakapan aktif hari ini</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{stats?.conversations_today || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Entri cache semantic</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{stats?.cache_entries || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Cache hit rate</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{stats?.cache_hit_rate || 0}%</strong>
            </div>
          </div>
        </div>

        <div className="admin-table-container" style={{ padding: 'var(--space-6)' }}>
          <h3
            style={{
              marginBottom: 'var(--space-4)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: 'var(--text-base)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Aksi Cepat</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <a
              href="/api/health"
              target="_blank"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
              <span>Diagnostik API & Database</span>
            </a>
            <button
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => {
                window.open('/', '_blank');
              }}
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Buka Website Publik</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================
// PRODUCTS TAB
// ============================================
function ProductsTab({ showToast }: { showToast: (msg: string, type: 'success' | 'error') => void }) {
  const [products, setProducts] = useState<AnyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<AnyRecord | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10', search });
      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    } catch {
      showToast('Gagal memuat daftar produk', 'error');
    }
    setLoading(false);
  }, [page, search, showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Nonaktifkan produk ini dari katalog?')) return;
    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showToast('Status produk berhasil dinonaktifkan', 'success');
        fetchProducts();
      } else {
        showToast('Gagal menonaktifkan produk', 'error');
      }
    } catch {
      showToast('Gagal menonaktifkan produk', 'error');
    }
  };

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Manajemen Produk</h1>
          <p className="admin-header-subtitle">Daftar {total} paket wisata dan aktivitas terdaftar</p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setEditProduct(null);
            setShowModal(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Produk</span>
        </button>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <div className="admin-table-title">Katalog Produk</div>
          <div className="admin-table-actions">
            <div className="admin-search-wrapper">
              <Search className="w-3.5 h-3.5 admin-search-icon" />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
          </div>
        ) : products.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <Package className="w-8 h-8" />
            </div>
            <div className="admin-empty-text">Tidak ada produk ditemukan</div>
            <div className="admin-empty-subtext">Tambahkan produk baru atau jalankan seed data</div>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Kategori</th>
                  <th>Tarif</th>
                  <th>Durasi</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-table-product-name">
                        {p.image_url && (
                          <img src={p.image_url} alt={p.name} className="admin-table-product-img" />
                        )}
                        <div className="admin-table-product-info">
                          <h4>{p.name}</h4>
                          <span>
                            <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                            {p.destination}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge">{p.category}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{formatPrice(p.price)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{p.duration_days}D</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'var(--font-mono)' }}>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {p.rating}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status ${p.is_active ? 'active' : 'inactive'}`}>
                        <span className="admin-status-dot" />
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                          className="admin-action-btn"
                          onClick={() => {
                            setEditProduct(p);
                            setShowModal(true);
                          }}
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          className="admin-action-btn danger"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="admin-pagination">
              <div className="admin-pagination-info">
                Halaman {page} dari {totalPages}
              </div>
              <div className="admin-pagination-buttons">
                <button
                  className="admin-pagination-btn"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  className="admin-pagination-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchProducts();
            showToast('Produk berhasil disimpan', 'success');
          }}
          showToast={showToast}
        />
      )}
    </>
  );
}

// ---- Product Modal ----
function ProductModal({
  product,
  onClose,
  onSave,
  showToast,
}: {
  product: AnyRecord | null;
  onClose: () => void;
  onSave: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [form, setForm] = useState<AnyRecord>(
    product || {
      name: '',
      category: 'paket_wisata',
      destination: '',
      region: 'Bali',
      price: 0,
      price_per_person: true,
      duration_days: 1,
      highlights: [],
      description: '',
      short_description: '',
      image_url: '',
      max_participants: null,
      includes: [],
      excludes: [],
      is_active: true,
      rating: 0,
      review_count: 0,
    }
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.destination || !form.description) {
      showToast('Nama produk, destinasi, dan deskripsi wajib diisi', 'error');
      return;
    }

    setSaving(true);
    try {
      const method = product ? 'PUT' : 'POST';
      const body = product ? { ...form, id: product.id } : form;

      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSave();
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Gagal menyimpan data', 'error');
      }
    } catch {
      showToast('Gagal menyimpan produk', 'error');
    }
    setSaving(false);
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">
            <Package className="w-4 h-4 text-emerald-400" />
            <span>{product ? 'Edit Data Produk' : 'Tambah Produk Baru'}</span>
          </h2>
          <button className="admin-modal-close" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Nama Produk *</label>
              <input
                className="admin-form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Kategori</label>
              <select
                className="admin-form-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="paket_wisata">Paket Wisata</option>
                <option value="hotel">Hotel</option>
                <option value="transport">Transport</option>
                <option value="aktivitas">Aktivitas</option>
              </select>
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Destinasi *</label>
              <input
                className="admin-form-input"
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Wilayah (Region)</label>
              <input
                className="admin-form-input"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Tarif (IDR)</label>
              <input
                className="admin-form-input"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Durasi (Hari)</label>
              <input
                className="admin-form-input"
                type="number"
                min="1"
                value={form.duration_days}
                onChange={(e) => setForm({ ...form, duration_days: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Ringkasan Singkat</label>
            <input
              className="admin-form-input"
              value={form.short_description}
              onChange={(e) => setForm({ ...form, short_description: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Deskripsi Lengkap *</label>
            <textarea
              className="admin-form-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">URL Gambar Sampul</label>
            <input
              className="admin-form-input"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Highlights (pisahkan dengan koma)</label>
            <input
              className="admin-form-input"
              value={Array.isArray(form.highlights) ? form.highlights.join(', ') : ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  highlights: e.target.value
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter(Boolean),
                })
              }
            />
            <span className="admin-form-hint">Contoh: snorkeling, sunset dinner, private villa</span>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Menyimpan...' : product ? 'Simpan Perubahan' : 'Buat Produk'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DOCUMENTS TAB (Knowledge Base)
// ============================================
function DocumentsTab({ showToast }: { showToast: (msg: string, type: 'success' | 'error') => void }) {
  const [documents, setDocuments] = useState<AnyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editDoc, setEditDoc] = useState<AnyRecord | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      const res = await fetch(`/api/admin/documents?${params}`);
      const data = await res.json();
      setDocuments(data.documents || []);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    } catch {
      showToast('Gagal memuat dokumen knowledge base', 'error');
    }
    setLoading(false);
  }, [page, showToast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus dokumen knowledge ini? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      const res = await fetch('/api/admin/documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showToast('Dokumen berhasil dihapus', 'success');
        fetchDocuments();
      } else {
        showToast('Gagal menghapus dokumen', 'error');
      }
    } catch {
      showToast('Gagal menghapus dokumen', 'error');
    }
  };

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Knowledge Base (RAG)</h1>
          <p className="admin-header-subtitle">{total} dokumen pengetahuan tervektorisasi untuk Nusa AI</p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setEditDoc(null);
            setShowModal(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Dokumen</span>
        </button>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <div className="admin-table-title">Dokumen Terindeks</div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
          </div>
        ) : documents.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="admin-empty-text">Belum ada dokumen knowledge</div>
            <div className="admin-empty-subtext">Tambahkan dokumen panduan atau jalankan seed RAG</div>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Judul Dokumen</th>
                  <th>Tipe Sumber</th>
                  <th>Pratinjau Konten</th>
                  <th>Dibuat Pada</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600, color: 'white' }}>{d.title}</td>
                    <td>
                      <span className="badge">{d.source_type}</span>
                    </td>
                    <td
                      style={{
                        maxWidth: '320px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {d.content?.substring(0, 100)}...
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                      {formatDate(d.created_at)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                          className="admin-action-btn"
                          onClick={() => {
                            setEditDoc(d);
                            setShowModal(true);
                          }}
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          className="admin-action-btn danger"
                          onClick={() => handleDelete(d.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="admin-pagination">
              <div className="admin-pagination-info">
                Halaman {page} dari {totalPages}
              </div>
              <div className="admin-pagination-buttons">
                <button
                  className="admin-pagination-btn"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  className="admin-pagination-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <DocumentModal
          doc={editDoc}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchDocuments();
            showToast('Dokumen berhasil disimpan dan divektorisasi', 'success');
          }}
          showToast={showToast}
        />
      )}
    </>
  );
}

// ---- Document Modal ----
function DocumentModal({
  doc,
  onClose,
  onSave,
  showToast,
}: {
  doc: AnyRecord | null;
  onClose: () => void;
  onSave: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [form, setForm] = useState({
    title: doc?.title || '',
    content: doc?.content || '',
    source_type: doc?.source_type || 'guide',
    metadata: doc?.metadata || {},
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.content) {
      showToast('Konten dokumen wajib diisi', 'error');
      return;
    }

    setSaving(true);
    try {
      const method = doc ? 'PUT' : 'POST';
      const body = doc ? { ...form, id: doc.id } : form;

      const res = await fetch('/api/admin/documents', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSave();
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Gagal menyimpan data', 'error');
      }
    } catch {
      showToast('Gagal menyimpan dokumen', 'error');
    }
    setSaving(false);
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>{doc ? 'Edit Dokumen Knowledge' : 'Tambah Dokumen Baru'}</span>
          </h2>
          <button className="admin-modal-close" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Judul Dokumen</label>
              <input
                className="admin-form-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Tipe Sumber</label>
              <select
                className="admin-form-select"
                value={form.source_type}
                onChange={(e) => setForm({ ...form, source_type: e.target.value })}
              >
                <option value="guide">Guide</option>
                <option value="faq">FAQ</option>
                <option value="policy">Policy</option>
                <option value="tips">Tips</option>
                <option value="description">Description</option>
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Konten Teks *</label>
            <textarea
              className="admin-form-textarea"
              style={{ minHeight: '220px' }}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            <span className="admin-form-hint">
              {doc
                ? 'Pembaruan konten akan memicu kalkulasi ulang embedding secara otomatis'
                : 'Sistem embedding Gemini 768-dimensi akan dibuat otomatis saat disimpan'}
            </span>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Menyimpan & Vektorisasi...' : doc ? 'Simpan Perubahan' : 'Buat Dokumen'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CONVERSATIONS TAB
// ============================================
function ConversationsTab() {
  const [conversations, setConversations] = useState<AnyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedConv, setSelectedConv] = useState<AnyRecord | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      const res = await fetch(`/api/admin/conversations?${params}`);
      const data = await res.json();
      setConversations(data.conversations || []);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total || 0);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const viewConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/conversations/${id}`);
      const data = await res.json();
      setSelectedConv(data.conversation);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Log Percakapan</h1>
          <p className="admin-header-subtitle">Audit trail {total} sesi interaksi pengguna dengan Nusa AI</p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <div className="admin-table-title">Daftar Sesi Chat</div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className="admin-empty-text">Belum ada sesi percakapan</div>
            <div className="admin-empty-subtext">Percakapan akan muncul otomatis ketika pengunjung berinteraksi dengan Nusa AI</div>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Session Identifier</th>
                  <th>Volume Pesan</th>
                  <th>Aktivitas Terakhir</th>
                  <th>Waktu Pembuatan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary-light)' }}>
                      {c.session_id?.substring(0, 8)}...
                    </td>
                    <td>
                      <span className="badge">{c.message_count || 0} pesan</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                      {formatDate(c.last_activity)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                      {formatDate(c.created_at)}
                    </td>
                    <td>
                      <button className="admin-action-btn" onClick={() => viewConversation(c.id)}>
                        <Eye className="w-3 h-3" />
                        <span>Lihat Chat</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="admin-pagination">
              <div className="admin-pagination-info">
                Halaman {page} dari {totalPages}
              </div>
              <div className="admin-pagination-buttons">
                <button
                  className="admin-pagination-btn"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  className="admin-pagination-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Conversation Detail Modal */}
      {selectedConv && (
        <div className="admin-modal-overlay" onClick={() => setSelectedConv(null)}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px' }}
          >
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Log Transkrip Sesi</span>
              </h2>
              <button className="admin-modal-close" onClick={() => setSelectedConv(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="admin-modal-body">
              <div
                style={{
                  marginBottom: 'var(--space-4)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--color-border)',
                  paddingBottom: 'var(--space-2)',
                }}
              >
                <span>ID: {selectedConv.session_id}</span>
                <span>Total: {selectedConv.message_count} pesan</span>
              </div>
              <div className="admin-conversation-messages">
                {(selectedConv.messages || []).map((msg: AnyRecord, i: number) => (
                  <div key={i}>
                    <div className={`admin-conv-bubble ${msg.role}`}>
                      {msg.content}
                    </div>
                    <div
                      className="admin-conv-meta"
                      style={{
                        textAlign: msg.role === 'user' ? 'right' : 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        gap: '4px',
                      }}
                    >
                      {msg.role === 'user' ? (
                        <>
                          <span>Pengguna</span>
                          <User className="w-2.5 h-2.5 inline" />
                        </>
                      ) : (
                        <>
                          <Bot className="w-2.5 h-2.5 inline text-emerald-400" />
                          <span>Nusa AI</span>
                        </>
                      )}
                      <span>• {msg.timestamp ? formatDate(msg.timestamp) : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
