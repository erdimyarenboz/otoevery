'use client';

import RoleLayout from '@/components/RoleLayout';

const NAV_ITEMS = [
    { label: 'Genel Bakış', icon: '📊', href: '/company' },
    { label: 'Araçlar', icon: '🚗', href: '/company/vehicles' },
    { label: 'Krediler & Haklar', icon: '💳', href: '/company/credits' },
    { label: 'Destek & Çağrı', icon: '🆘', href: '/company/support' },
    { label: 'Profil', icon: '🏢', href: '/company/profile' },
    { label: 'Servis Noktaları', icon: '🗺️', href: '/company/service-points' },
    { label: 'İşlemler', icon: '📋', href: '/company/transactions' },
    { label: 'Cezalar', icon: '🚨', href: '/company/penalties' },
];

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleLayout title="Filo Yönetimi" navItems={NAV_ITEMS} roleBadge="Şirket Yöneticisi" roleColor="#6366f1">
            {children}
        </RoleLayout>
    );
}
