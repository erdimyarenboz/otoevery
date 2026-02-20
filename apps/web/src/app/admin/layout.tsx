'use client';

import RoleLayout from '@/components/RoleLayout';

const NAV_ITEMS = [
    { label: 'Genel Bakış', icon: '📊', href: '/admin' },
    { label: 'Şirketler', icon: '🏢', href: '/admin/companies' },
    { label: 'Servis Merkezleri', icon: '🔧', href: '/admin/service-centers' },
    { label: 'Servis Yönetimi', icon: '🏦', href: '/admin/service-management' },
    { label: 'Krediler', icon: '💳', href: '/admin/credits' },
    { label: 'Hakediş', icon: '💰', href: '/admin/hakedis' },
    { label: 'Kullanıcılar', icon: '👥', href: '/admin/users' },
    { label: 'Anlaşmalar', icon: '📋', href: '/admin/agreements' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleLayout title="Super Admin" navItems={NAV_ITEMS} roleBadge="Super Admin" roleColor="#ef4444">
            {children}
        </RoleLayout>
    );
}
