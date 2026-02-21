'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Transaction {
    id: string;
    type: 'allocate' | 'spend' | 'right_allocate';
    amount: number;
    serviceType: string | null;
    description: string;
    createdAt: string;
    vehicle: { plate: string; brand: string; model: string };
    serviceCenter?: { name: string };
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
    wash_standard: 'Standart Oto Yıkama',
    wash_light_commercial: 'Hafif Ticari Oto Yıkama',
    wash_suv: 'SUV Oto Yıkama',
    wash_commercial: 'Ticari Oto Yıkama',
    wash_minibus: 'Minibüs Oto Yıkama',
    tire_repair: 'Lastik Tamiri',
    tire_change_4x2: '4x2 Lastik Değişimi',
    tire_change_4x4: '4x4 Lastik Değişimi',
    maintenance_petrol: 'Benzinli Araç Oto Bakım',
    maintenance_diesel: 'Dizel Araç Oto Bakım',
    wash: 'Yıkama',
    maintenance: 'Bakım',
    tire: 'Lastik',
};

export default function RightsTrackingPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const res = await api.get('/api/v1/company/credits/history');
        if (res.success && res.data) {
            setTransactions(res.data);
        }
        setLoading(false);
    };

    const filtered = transactions.filter(t => {
        if (filter === 'all') return true;
        if (filter === 'allocation') return t.type === 'allocate' || t.type === 'right_allocate';
        if (filter === 'usage') return t.type === 'spend';
        return true;
    });

    if (loading) return <div className="p-12 text-center">Yükleniyor...</div>;

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Hak & Kullanım Takibi</h1>
                    <p className="page-description">Araçlara atanan hakların ve yapılan kullanımların detaylı dökümü</p>
                </div>
            </div>

            <div className="table-container">
                <div className="table-toolbar">
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilter('all')}
                        >Hepsi</button>
                        <button
                            className={`btn btn-sm ${filter === 'allocation' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilter('allocation')}
                        >Yüklemeler</button>
                        <button
                            className={`btn btn-sm ${filter === 'usage' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilter('usage')}
                        >Filli Kullanımlar</button>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Tarih</th>
                            <th>Araç</th>
                            <th>İşlem Türü</th>
                            <th>Hizmet / Açıklama</th>
                            <th>Miktar / Puan</th>
                            <th>Nokta</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(t => (
                            <tr key={t.id}>
                                <td style={{ fontSize: 13 }}>{new Date(t.createdAt).toLocaleString('tr-TR')}</td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{t.vehicle.plate}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.vehicle.brand} {t.vehicle.model}</div>
                                </td>
                                <td>
                                    <span className={`badge ${t.type === 'spend' ? 'badge-error' : 'badge-success'}`}>
                                        {t.type === 'spend' ? 'Kullanım' : 'Yükleme'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 500 }}>{t.serviceType ? (SERVICE_TYPE_LABELS[t.serviceType] || t.serviceType) : 'Genel Kredi'}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.description}</div>
                                </td>
                                <td style={{ fontWeight: 700, color: t.type === 'spend' ? '#ef4444' : '#10b981' }}>
                                    {t.type === 'spend' ? '-' : '+'}{t.amount.toLocaleString('tr-TR')}
                                </td>
                                <td>
                                    {t.serviceCenter?.name || '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
