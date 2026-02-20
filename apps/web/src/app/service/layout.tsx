'use client';

import RoleLayout from '@/components/RoleLayout';

const NAV_ITEMS = [
    { label: 'Genel Bakış', icon: '📊', href: '/service' },
    { label: 'Profilim', icon: '🏪', href: '/service/profile' },
    { label: 'İşlemler', icon: '💳', href: '/service/transactions' },
    { label: 'Ödeme Al', icon: '📱', href: '/service/receive' },
    { label: 'QR Kodlarım', icon: '🏷️', href: '/service/qr-codes' },
];

export default function ServiceLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleLayout title="Servis Merkezi" navItems={NAV_ITEMS} roleBadge="Servis Merkezi" roleColor="#f59e0b">
            {children}
        </RoleLayout>
    );
}
