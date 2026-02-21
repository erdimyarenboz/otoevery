'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

const TYPE_EMOJIS: Record<string, string> = {
    wash: '🧽',
    maintenance: '🔧',
    tire: '🛞',
    both: '⭐',
};

interface HakedisItem {
    id: string;
    name: string;
    type: string;
    phone: string;
    contactEmail: string;
    totalRevenue: number;
    totalPaid: number;
    hakedis: number;
    lastPayoutDate: string | null;
    lastPayoutAmount: number | null;
}

export default function AdminHakedisPage() {
    const [items, setItems] = useState<HakedisItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState<string | null>(null); // id being paid

    const fetchData = useCallback((silent = false) => {
        if (!silent) setLoading(true);
        api.get('/api/v1/admin/hakedis').then(r => {
            if (r.success) setItems(r.data || []);
            setLoading(false);
        });
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handlePay = async (e: React.MouseEvent, id: string, name: string, amount: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm(`"${name}" servis merkezine ₺${amount.toLocaleString('tr-TR')} hakediş ödemesi yapılacak.\n\nOnaylıyor musunuz?`)) return;

        setPaying(id);
        try {
            const res = await api.post(`/api/v1/admin/hakedis/${id}/pay`, {});
            if (res.success) {
                await fetchData(true); // silent refresh
            }
        } finally {
            setPaying(null);
        }
    };

    const totalHakedis = items.reduce((sum, i) => sum + i.hakedis, 0);
    const totalRevenue = items.reduce((sum, i) => sum + i.totalRevenue, 0);
    const centersWithHakedis = items.filter(i => i.hakedis > 0).length;

    if (loading && items.length === 0) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, color: 'var(--primary)' }} /></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">💰 Hakediş Yönetimi</div>
                    <div className="page-description">Servis merkezlerinin birikmiş kazançlarını görüntüleyin ve ödemeleri yapın</div>
                </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-3" style={{ marginBottom: 28 }}>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#f59e0b', '--stat-color-bg': 'rgba(245,158,11,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">💰</div>
                    <div className="stat-value">₺{totalHakedis.toLocaleString('tr-TR')}</div>
                    <div className="stat-label">Toplam Bekleyen Hakediş</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#10b981', '--stat-color-bg': 'rgba(16,185,129,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">📊</div>
                    <div className="stat-value">₺{totalRevenue.toLocaleString('tr-TR')}</div>
                    <div className="stat-label">Toplam Ciro (Tüm Zamanlar)</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#6366f1', '--stat-color-bg': 'rgba(99,102,241,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🏪</div>
                    <div className="stat-value">{centersWithHakedis} / {items.length}</div>
                    <div className="stat-label">Hakediş Bekleyen Servis</div>
                </div>
            </div>

            {/* Hakediş Table */}
            <div className="card animate-fadeIn">
                <div className="card-header">
                    <span className="card-title">Servis Merkezi Hakedişleri</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Servis Merkezi</th>
                                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Toplam Ciro</th>
                                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Ödenen</th>
                                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Bekleyen Hakediş</th>
                                <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Son Ödeme</th>
                                <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 150ms ease' }}>
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ fontSize: 20 }}>{TYPE_EMOJIS[item.type] || '🏪'}</span>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.phone || item.contactEmail || '—'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '14px 16px', fontWeight: 500, fontSize: 14 }}>
                                        ₺{item.totalRevenue.toLocaleString('tr-TR')}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '14px 16px', fontSize: 14, color: 'var(--text-muted)' }}>
                                        ₺{item.totalPaid.toLocaleString('tr-TR')}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '14px 16px' }}>
                                        <span style={{
                                            fontWeight: 700, fontSize: 15,
                                            color: item.hakedis > 0 ? '#f59e0b' : 'var(--success)',
                                        }}>
                                            {item.hakedis > 0 ? `₺${item.hakedis.toLocaleString('tr-TR')}` : '✅ Ödendi'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '14px 16px', fontSize: 13, color: 'var(--text-muted)' }}>
                                        {item.lastPayoutDate
                                            ? new Date(item.lastPayoutDate).toLocaleDateString('tr-TR')
                                            : '—'}
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '14px 16px' }}>
                                        {item.hakedis > 0 ? (
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={(e) => handlePay(e, item.id, item.name, item.hakedis)}
                                                disabled={paying === item.id}
                                                style={{ fontSize: 13, padding: '8px 16px' }}
                                            >
                                                {paying === item.id ? '⏳...' : '💸 Ödendi'}
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                        Henüz servis merkezi yok
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
