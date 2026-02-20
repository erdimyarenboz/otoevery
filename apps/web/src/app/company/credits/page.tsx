'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface Vehicle {
    id: string;
    plate: string;
    brand: string;
    model: string;
    creditBalance: number;
}

export default function CompanyCreditsPage() {
    const [company, setCompany] = useState<any>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Allocation form
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [amount, setAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const fetchData = useCallback(() => {
        setLoading(true);
        Promise.all([
            api.get('/api/v1/company/credits'),
            api.get('/api/v1/company/credits/history'),
        ]).then(([creds, hist]) => {
            if (creds.success) {
                setCompany(creds.data.company);
                setVehicles(creds.data.vehicles || []);
            }
            if (hist.success) setHistory(hist.data || []);
            setLoading(false);
        });
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAllocate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVehicle || !amount || Number(amount) <= 0) return;

        setSubmitting(true);
        setErrorMsg('');
        const res = await api.post('/api/v1/company/credits/allocate', {
            vehicleId: selectedVehicle,
            amount: Number(amount),
        });
        setSubmitting(false);

        if (res.success) {
            setMessage(res.message);
            setAmount('');
            setSelectedVehicle('');
            fetchData();
            setTimeout(() => setMessage(''), 4000);
        } else {
            setErrorMsg(res.message || 'Hata oluştu');
            setTimeout(() => setErrorMsg(''), 4000);
        }
    };

    const totalVehicleCredits = vehicles.reduce((s, v) => s + v.creditBalance, 0);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">💳 Kredi Yönetimi</div>
                    <div className="page-description">Şirket kredisini araçlara dağıtın</div>
                </div>
            </div>

            {message && (
                <div className="card animate-fadeIn" style={{ marginBottom: 20, padding: '14px 20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 600 }}>
                    ✅ {message}
                </div>
            )}
            {errorMsg && (
                <div className="card animate-fadeIn" style={{ marginBottom: 20, padding: '14px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontWeight: 600 }}>
                    ❌ {errorMsg}
                </div>
            )}

            {/* Summary */}
            <div className="grid grid-3" style={{ marginBottom: 28 }}>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#6366f1', '--stat-color-bg': 'rgba(99,102,241,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🏢</div>
                    <div className="stat-value">₺{(company?.creditBalance || 0).toLocaleString('tr-TR')}</div>
                    <div className="stat-label">Şirket Bakiyesi</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#10b981', '--stat-color-bg': 'rgba(16,185,129,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🚗</div>
                    <div className="stat-value">₺{totalVehicleCredits.toLocaleString('tr-TR')}</div>
                    <div className="stat-label">Araçlardaki Kredi</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#f59e0b', '--stat-color-bg': 'rgba(245,158,11,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">📊</div>
                    <div className="stat-value">{vehicles.length}</div>
                    <div className="stat-label">Araç Sayısı</div>
                </div>
            </div>

            <div className="grid grid-2">
                {/* Allocate Form */}
                <div className="card animate-fadeIn">
                    <div className="card-header">
                        <span className="card-title">➡️ Araca Kredi Yükle</span>
                    </div>
                    <form onSubmit={handleAllocate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label className="form-label">Araç Seçin</label>
                            <select className="form-input" value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} required>
                                <option value="">— Araç seçin —</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.plate} {v.brand && `— ${v.brand} ${v.model || ''}`} (₺{v.creditBalance.toLocaleString('tr-TR')})
                                    </option>
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
                                placeholder="Ör: 500"
                                min="1"
                                step="1"
                                required
                            />
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                Kullanılabilir bakiye: ₺{(company?.creditBalance || 0).toLocaleString('tr-TR')}
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', padding: '12px 0', fontSize: 15 }}>
                            {submitting ? '⏳...' : '💰 Kredi Yükle'}
                        </button>
                    </form>
                </div>

                {/* Vehicle Balances */}
                <div className="card animate-fadeIn">
                    <div className="card-header">
                        <span className="card-title">🚗 Araç Bakiyeleri</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {vehicles.map(v => (
                            <div key={v.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 16px', borderBottom: '1px solid var(--border)',
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{v.plate}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {v.brand} {v.model}
                                    </div>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: 16, color: v.creditBalance > 0 ? '#10b981' : 'var(--text-muted)' }}>
                                    ₺{v.creditBalance.toLocaleString('tr-TR')}
                                </div>
                            </div>
                        ))}
                        {vehicles.length === 0 && <div className="empty-state"><p>Araç yok</p></div>}
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            {history.length > 0 && (
                <div className="card animate-fadeIn" style={{ marginTop: 24 }}>
                    <div className="card-header">
                        <span className="card-title">📋 Kredi Geçmişi</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {history.map(t => (
                            <div key={t.id} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 16px', borderBottom: '1px solid var(--border)',
                            }}>
                                <span style={{ fontSize: 18 }}>
                                    {t.type === 'load' ? '➡️' : t.type === 'allocate' ? '🚗' : '🔧'}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500, fontSize: 13 }}>{t.description}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                        {new Date(t.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        {t.vehicle && ` • ${t.vehicle.plate}`}
                                        {t.serviceCenter && ` • ${t.serviceCenter.name}`}
                                    </div>
                                </div>
                                <span style={{
                                    fontWeight: 700, fontSize: 14,
                                    color: t.type === 'load' ? '#10b981' : t.type === 'spend' ? '#ef4444' : '#6366f1',
                                }}>
                                    {t.type === 'spend' ? '-' : ''}₺{t.amount.toLocaleString('tr-TR')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
