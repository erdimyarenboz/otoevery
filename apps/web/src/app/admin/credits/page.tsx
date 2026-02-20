'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface CreditCompany {
    id: string;
    name: string;
    creditBalance: number;
    _count: { vehicles: number };
    totalVehicleCredits: number;
}

export default function AdminCreditsPage() {
    const [companies, setCompanies] = useState<CreditCompany[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [amount, setAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const fetchData = useCallback(() => {
        setLoading(true);
        api.get('/api/v1/admin/credits').then(r => {
            if (r.success) setCompanies(r.data || []);
            setLoading(false);
        });
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleLoad = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompany || !amount || Number(amount) <= 0) return;

        setSubmitting(true);
        const res = await api.post('/api/v1/admin/credits/load', {
            companyId: selectedCompany,
            amount: Number(amount),
        });
        setSubmitting(false);

        if (res.success) {
            setMessage(res.message || 'İşlem tamamlandı');
            setAmount('');
            setSelectedCompany('');
            fetchData();
            setTimeout(() => setMessage(''), 4000);
        }
    };

    const totalCompanyBalance = companies.reduce((s, c) => s + c.creditBalance, 0);
    const totalVehicleBalance = companies.reduce((s, c) => s + c.totalVehicleCredits, 0);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">💳 Kredi Yönetimi</div>
                    <div className="page-description">Şirketlere kredi yükleyin, bakiyeleri takip edin</div>
                </div>
            </div>

            {message && (
                <div className="card animate-fadeIn" style={{ marginBottom: 20, padding: '14px 20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 600 }}>
                    ✅ {message}
                </div>
            )}

            {/* Summary */}
            <div className="grid grid-3" style={{ marginBottom: 28 }}>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#6366f1', '--stat-color-bg': 'rgba(99,102,241,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🏢</div>
                    <div className="stat-value">₺{totalCompanyBalance.toLocaleString('tr-TR')}</div>
                    <div className="stat-label">Şirket Bakiyeleri</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#10b981', '--stat-color-bg': 'rgba(16,185,129,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🚗</div>
                    <div className="stat-value">₺{totalVehicleBalance.toLocaleString('tr-TR')}</div>
                    <div className="stat-label">Araçlara Dağıtılan</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#f59e0b', '--stat-color-bg': 'rgba(245,158,11,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">📊</div>
                    <div className="stat-value">₺{(totalCompanyBalance + totalVehicleBalance).toLocaleString('tr-TR')}</div>
                    <div className="stat-label">Toplam Kredi</div>
                </div>
            </div>

            <div className="grid grid-2">
                {/* Load Credit Form */}
                <div className="card animate-fadeIn">
                    <div className="card-header">
                        <span className="card-title">➕ Kredi Yükle</span>
                    </div>
                    <form onSubmit={handleLoad} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label className="form-label">Şirket Seçin</label>
                            <select className="form-input" value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)} required>
                                <option value="">— Şirket seçin —</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} (Bakiye: ₺{c.creditBalance.toLocaleString('tr-TR')})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Tutar (₺)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="Ör: 5000"
                                min="1"
                                step="1"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', padding: '12px 0', fontSize: 15 }}>
                            {submitting ? '⏳ Yükleniyor...' : '💰 Kredi Yükle'}
                        </button>
                    </form>
                </div>

                {/* Companies Table */}
                <div className="card animate-fadeIn">
                    <div className="card-header">
                        <span className="card-title">🏢 Şirket Bakiyeleri</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {companies.map(c => (
                            <div key={c.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 16px', borderBottom: '1px solid var(--border)',
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {c._count.vehicles} araç • Araçlarda: ₺{c.totalVehicleCredits.toLocaleString('tr-TR')}
                                    </div>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: 16, color: c.creditBalance > 0 ? '#6366f1' : 'var(--text-muted)' }}>
                                    ₺{c.creditBalance.toLocaleString('tr-TR')}
                                </div>
                            </div>
                        ))}
                        {companies.length === 0 && <div className="empty-state"><p>Henüz şirket yok</p></div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
