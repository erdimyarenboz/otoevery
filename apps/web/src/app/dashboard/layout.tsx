'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import Link from 'next/link';

const NAV_ITEMS = [
    {
        section: 'Ana Menü', items: [
            { href: '/dashboard', icon: '📊', label: 'Dashboard' },
        ]
    },
    {
        section: 'Operasyon', items: [
            { href: '/dashboard/vehicles', icon: '🚗', label: 'Araçlar' },
            { href: '/dashboard/employees', icon: '👥', label: 'Çalışanlar' },
            { href: '/dashboard/assignments', icon: '🔗', label: 'Zimmetler' },
        ]
    },
    {
        section: 'Finansal', items: [
            { href: '/dashboard/fuel', icon: '⛽', label: 'Yakıt Kayıtları' },
            { href: '/dashboard/expenses', icon: '💰', label: 'Giderler' },
            { href: '/dashboard/penalties', icon: '🚨', label: 'Cezalar' },
            { href: '/dashboard/rentals', icon: '📋', label: 'Kiralama' },
        ]
    },
    {
        section: 'Yönetim', items: [
            { href: '/dashboard/documents', icon: '📄', label: 'Belgeler' },
            { href: '/dashboard/requests', icon: '📩', label: 'Talepler' },
            { href: '/dashboard/tires', icon: '🛞', label: 'Lastikler' },
            { href: '/dashboard/notifications', icon: '🔔', label: 'Bildirimler', badge: 3 },
        ]
    },
    {
        section: 'Raporlar', items: [
            { href: '/dashboard/reports', icon: '📈', label: 'Raporlar' },
        ]
    },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, color: 'var(--primary)' }} />
            </div>
        );
    }

    if (!isAuthenticated || !user) return null;

    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
    const roleName = user.roles?.[0]?.replace(/_/g, ' ') || 'Kullanıcı';

    return (
        <>
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon">OE</div>
                        <span className="logo-text">OtoEvery</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((section) => (
                        <div key={section.section}>
                            <div className="nav-section">
                                <span className="nav-section-title">{section.section}</span>
                            </div>
                            {section.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span>{item.label}</span>
                                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user" onClick={logout}>
                        <div className="user-avatar">{initials}</div>
                        <div className="user-info">
                            <div className="user-name">{user.firstName} {user.lastName}</div>
                            <div className="user-role">{roleName}</div>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>⏻</span>
                    </div>
                </div>
            </aside>

            {/* Header */}
            <header className="header">
                <div className="header-left">
                    <h2 className="header-title">
                        {pathname === '/dashboard' && 'Dashboard'}
                        {pathname === '/dashboard/vehicles' && 'Araç Yönetimi'}
                        {pathname === '/dashboard/employees' && 'Çalışan Yönetimi'}
                        {pathname === '/dashboard/assignments' && 'Zimmet Yönetimi'}
                        {pathname === '/dashboard/fuel' && 'Yakıt Kayıtları'}
                        {pathname === '/dashboard/expenses' && 'Gider Yönetimi'}
                        {pathname === '/dashboard/penalties' && 'Ceza Takibi'}
                        {pathname === '/dashboard/rentals' && 'Kiralama Yönetimi'}
                        {pathname === '/dashboard/documents' && 'Belge Yönetimi'}
                        {pathname === '/dashboard/requests' && 'Talep Yönetimi'}
                        {pathname === '/dashboard/tires' && 'Lastik Takibi'}
                        {pathname === '/dashboard/notifications' && 'Bildirimler'}
                        {pathname === '/dashboard/reports' && 'Raporlar'}
                    </h2>
                </div>
                <div className="header-right">
                    <button className="header-icon-btn" title="Bildirimler">
                        🔔
                        <span className="notif-dot" />
                    </button>
                    <button className="header-icon-btn" title="Ayarlar">⚙️</button>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '4px 12px',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        fontSize: '13px',
                    }}>
                        <span style={{ color: 'var(--text-muted)' }}>🏢</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{user.tenant?.name || 'Tenant'}</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                {children}
            </main>
        </>
    );
}
