'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function DriverDashboard() {
    const { user } = useAuth();
    const [vehicle, setVehicle] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [penalties, setPenalties] = useState<any[]>([]);

    useEffect(() => {
        api.get('/api/v1/driver/my-vehicle').then(r => r.success && setVehicle(r.data));
        api.get('/api/v1/driver/transactions').then(r => r.success && setTransactions(r.data || []));
        api.get('/api/v1/driver/penalties').then(r => r.success && setPenalties(r.data || []));
    }, []);

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Merhaba, {user?.firstName} 👋</div>
                    <div className="page-description">Aracınız ve işlemleriniz</div>
                </div>
                <a href="/driver/pay" className="btn btn-primary">📱 QR ile Ödeme Yap</a>
            </div>

            {/* Vehicle Info Card */}
            {vehicle && (
                <div className="card animate-fadeIn" style={{ marginBottom: 28, background: 'linear-gradient(135deg, var(--bg-card), var(--bg-elevated))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div style={{ fontSize: 56 }}>🚗</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '2px', marginBottom: 4 }}>{vehicle.plate}</div>
                            <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>{vehicle.brand} {vehicle.model} — {vehicle.year}</div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                                <span className="badge badge-neutral">🎨 {vehicle.color}</span>
                                <span className="badge badge-neutral">⛽ {vehicle.fuelType}</span>
                                <span className="badge badge-neutral">📏 {vehicle.currentKm?.toLocaleString('tr-TR')} km</span>
                                <span className={`badge ${vehicle.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                    {vehicle.status === 'active' ? '✅ Aktif' : '🔧 Bakımda'}
                                </span>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                                Şirket: {vehicle.company?.name}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-3" style={{ marginBottom: 28 }}>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#6366f1', '--stat-color-bg': 'rgba(99,102,241,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">💳</div>
                    <div className="stat-value">{transactions.length}</div>
                    <div className="stat-label">Toplam İşlem</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#10b981', '--stat-color-bg': 'rgba(16,185,129,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🧽</div>
                    <div className="stat-value">{transactions.filter(t => t.type === 'wash').length}</div>
                    <div className="stat-label">Yıkama</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#ef4444', '--stat-color-bg': 'rgba(239,68,68,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🚨</div>
                    <div className="stat-value">{penalties.filter(p => p.status === 'unpaid').length}</div>
                    <div className="stat-label">Ödenmemiş Ceza</div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="card animate-fadeIn">
                <div className="card-header">
                    <span className="card-title">Son İşlemler</span>
                    <a href="/driver/transactions" style={{ fontSize: 13 }}>Tümü →</a>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {transactions.slice(0, 5).map(t => (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ fontSize: 22 }}>{t.type === 'wash' ? '🧽' : '🔧'}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500 }}>{t.description}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.serviceCenter?.name} • {new Date(t.transactionDate).toLocaleDateString('tr-TR')}</div>
                            </div>
                            <span style={{ fontWeight: 700 }}>₺{t.amount?.toLocaleString('tr-TR')}</span>
                        </div>
                    ))}
                    {transactions.length === 0 && <div className="empty-state"><div className="empty-icon">💳</div><h3>Henüz işlem yok</h3><p>QR ile ilk ödemenizi yapın</p></div>}
                </div>
            </div>
        </div>
    );
}
