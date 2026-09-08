import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin Panel — Radha Bali',
  description: 'Admin dashboard for managing Radha Bali travel platform',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
