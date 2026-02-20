'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';

// Dynamically import map to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/MapView') as any, { ssr: false }) as any;

interface ServiceCenter {
    id: string;
    name: string;
    address: string;
    type: string; // wash | maintenance | tire | both
    latitude: number | null;
    longitude: number | null;
    phone: string;
    contactEmail: string;
    workingHours: string | null;
    description: string | null;
    discountRate: number;
    monthlyLimit: number;
}

type TabKey = 'all' | 'wash' | 'maintenance' | 'tire';

const TABS: { key: TabKey; label: string; icon: string; color: string }[] = [
    { key: 'all', label: 'Tümü', icon: '🗺️', color: '#6366f1' },
    { key: 'wash', label: 'Yıkama', icon: '🧽', color: '#06b6d4' },
    { key: 'maintenance', label: 'Bakım', icon: '🔧', color: '#f59e0b' },
    { key: 'tire', label: 'Lastik', icon: '🛞', color: '#10b981' },
];

function matchesTab(type: string, tab: TabKey): boolean {
    if (tab === 'all') return true;
    if (type === 'both') return true; // "both" appears in all categories
    return type === tab;
}

const TYPE_LABELS: Record<string, string> = {
    wash: 'Yıkama',
    maintenance: 'Bakım',
    tire: 'Lastik',
    both: 'Yıkama + Bakım + Lastik',
};

export default function ServicePointsPage() {
    const [centers, setCenters] = useState<ServiceCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>('all');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        api.get('/api/v1/map/service-centers').then(r => {
            if (r.success) setCenters(r.data || []);
            setLoading(false);
        });
    }, []);

    const filtered = useMemo(
        () => centers.filter(c => matchesTab(c.type, activeTab)),
        [centers, activeTab]
    );

    const tabCounts = useMemo(() => ({
        all: centers.length,
        wash: centers.filter(c => c.type === 'wash' || c.type === 'both').length,
        maintenance: centers.filter(c => c.type === 'maintenance' || c.type === 'both').length,
        tire: centers.filter(c => c.type === 'tire' || c.type === 'both').length,
    }), [centers]);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, color: 'var(--primary)' }} /></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Anlaşmalı Servis Noktaları</div>
                    <div className="page-description">Şirketinizin anlaşmalı olduğu servis merkezleri — haritada görüntüleyin</div>
                </div>
            </div>

            {/* Category Tabs */}
            <div style={{
                display: 'flex', gap: 8, marginBottom: 24,
                background: 'var(--bg-secondary)', padding: 6, borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
            }}>
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setSelectedId(null); }}
                        style={{
                            flex: 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            padding: '12px 16px',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            background: activeTab === tab.key ? 'var(--bg-card)' : 'transparent',
                            color: activeTab === tab.key ? tab.color : 'var(--text-muted)',
                            fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 150ms ease',
                            boxShadow: activeTab === tab.key ? 'var(--shadow-sm)' : 'none',
                        }}
                    >
                        <span style={{ fontSize: 18 }}>{tab.icon}</span>
                        {tab.label}
                        <span style={{
                            background: activeTab === tab.key ? `${tab.color}20` : 'var(--bg-elevated)',
                            color: activeTab === tab.key ? tab.color : 'var(--text-muted)',
                            padding: '2px 8px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                        }}>
                            {tabCounts[tab.key]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Map + List */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, height: 'calc(100vh - 280px)', minHeight: 500 }}>
                {/* Map */}
                <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                    <MapView
                        centers={filtered}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        activeTab={activeTab}
                    />
                </div>

                {/* List */}
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden', display: 'flex', flexDirection: 'column',
                }}>
                    <div style={{
                        padding: '16px 20px', borderBottom: '1px solid var(--border)',
                        fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
                    }}>
                        📍 Servis Merkezleri ({filtered.length})
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {filtered.map(c => {
                            const tabInfo = TABS.find(t => t.key === c.type) || TABS.find(t => t.key === 'all')!;
                            const color = c.type === 'wash' ? '#06b6d4' : c.type === 'maintenance' ? '#f59e0b' : c.type === 'tire' ? '#10b981' : '#6366f1';
                            return (
                                <div
                                    key={c.id}
                                    onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                                    style={{
                                        padding: '16px 20px',
                                        borderBottom: '1px solid var(--border)',
                                        cursor: 'pointer',
                                        background: selectedId === c.id ? 'var(--bg-card-hover)' : 'transparent',
                                        borderLeft: selectedId === c.id ? `3px solid ${color}` : '3px solid transparent',
                                        transition: 'all 150ms ease',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <span style={{ fontSize: 16 }}>
                                            {c.type === 'wash' ? '🧽' : c.type === 'maintenance' ? '🔧' : c.type === 'tire' ? '🛞' : '⭐'}
                                        </span>
                                        <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, paddingLeft: 24 }}>
                                        📍 {c.address}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, paddingLeft: 24, flexWrap: 'wrap' }}>
                                        <span className="badge" style={{ background: `${color}15`, color, fontSize: 11 }}>
                                            {TYPE_LABELS[c.type] || c.type}
                                        </span>
                                        <span className="badge badge-success" style={{ fontSize: 11 }}>
                                            %{c.discountRate} indirim
                                        </span>
                                        {c.workingHours && (
                                            <span className="badge badge-neutral" style={{ fontSize: 11 }}>
                                                🕐 {c.workingHours}
                                            </span>
                                        )}
                                        {c.phone && (
                                            <span className="badge badge-neutral" style={{ fontSize: 11 }}>
                                                📞 {c.phone}
                                            </span>
                                        )}
                                    </div>
                                    {selectedId === c.id && (
                                        <div style={{
                                            marginTop: 12, paddingTop: 12, paddingLeft: 24,
                                            borderTop: '1px solid var(--border)',
                                            display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13,
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Aylık Limit</span>
                                                <span style={{ fontWeight: 600 }}>₺{c.monthlyLimit?.toLocaleString('tr-TR')}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>İndirim Oranı</span>
                                                <span style={{ fontWeight: 600, color: 'var(--success)' }}>%{c.discountRate}</span>
                                            </div>
                                            {c.contactEmail && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: 'var(--text-muted)' }}>E-posta</span>
                                                    <span style={{ fontWeight: 500 }}>{c.contactEmail}</span>
                                                </div>
                                            )}
                                            {c.description && (
                                                <div style={{ marginTop: 4, fontSize: 13, fontStyle: 'italic', color: 'var(--text-muted)' }}>
                                                    💬 {c.description}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {filtered.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-icon">🔍</div>
                                <h3>Bu kategoride servis merkezi yok</h3>
                                <p>Başka bir kategori seçmeyi deneyin</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
