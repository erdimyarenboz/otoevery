'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface NavItem {
    label: string;
    icon: string;
    href: string;
}

interface RoleLayoutProps {
    children: ReactNode;
    title: string;
    navItems: NavItem[];
    roleBadge: string;
    roleColor: string;
}

export default function RoleLayout({ children, title, navItems, roleBadge, roleColor }: RoleLayoutProps) {
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, color: 'var(--primary)' }} />
            </div>
        );
    }

    const currentTitle = navItems.find(n => pathname === n.href)?.label || title;

    return (
        <>
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src="/logo.png" alt="OtoEvery" style={{ height: 32 }} />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-title">Menü</div>
                    </div>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{user?.firstName} {user?.lastName}</div>
                            <div className="user-role" style={{ color: roleColor }}>{roleBadge}</div>
                        </div>
                        <button
                            onClick={logout}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)' }}
                            title="Çıkış Yap"
                        >
                            ⏻
                        </button>
                    </div>
                </div>
            </aside>

            {/* Header */}
            <header className="header">
                <div className="header-left">
                    <h1 className="header-title">{currentTitle}</h1>
                </div>
                <div className="header-right">
                    <span className="badge" style={{ background: `${roleColor}15`, color: roleColor, fontSize: 12 }}>
                        {roleBadge}
                    </span>
                    {user?.company && (
                        <span className="badge badge-neutral">{user.company.name}</span>
                    )}
                    {user?.serviceCenter && (
                        <span className="badge badge-neutral">{user.serviceCenter.name}</span>
                    )}
                </div>
            </header>

            {/* Content */}
            <main className="main-content">
                {children}
            </main>
        </>
    );
}
