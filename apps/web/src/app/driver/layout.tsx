'use client';

import RoleLayout from '@/components/RoleLayout';

const NAV_ITEMS = [
    { label: 'Aracım', icon: '🚗', href: '/driver' },
    { label: 'Servis Noktaları', icon: '🗺️', href: '/driver/service-points' },
    { label: 'İşlemlerim', icon: '💳', href: '/driver/transactions' },
    { label: 'QR Ödeme', icon: '📱', href: '/driver/pay' },
    { label: 'Cezalarım', icon: '🚨', href: '/driver/penalties' },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleLayout title="Sürücü Paneli" navItems={NAV_ITEMS} roleBadge="Sürücü" roleColor="#10b981">
            {children}
        </RoleLayout>
    );
}
