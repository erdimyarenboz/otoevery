'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function CompanyDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        api.get('/api/v1/company/stats').then(r => r.success && setStats(r.data));
        api.get('/api/v1/company/vehicles').then(r => r.success && setVehicles(r.data || []));
        api.get('/api/v1/company/transactions').then(r => r.success && setTransactions((r.data || []).slice(0, 5)));
    }, []);

    if (!stats) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, color: 'var(--primary)' }} /></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Merhaba, {user?.firstName} 👋</div>
                    <div className="page-description">{user?.company?.name} — Filo durumunuza genel bakış</div>
                </div>
            </div>

            <div className="grid grid-4" style={{ marginBottom: 28 }}>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#6366f1', '--stat-color-bg': 'rgba(99,102,241,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🚗</div>
                    <div className="stat-value">{stats.totalVehicles}</div>
                    <div className="stat-label">Toplam Araç</div>
                    <div className="stat-change up">↑ {stats.activeVehicles} aktif</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#10b981', '--stat-color-bg': 'rgba(16,185,129,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">💳</div>
                    <div className="stat-value">{stats.totalTransactions}</div>
                    <div className="stat-label">Toplam İşlem</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#f59e0b', '--stat-color-bg': 'rgba(245,158,11,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">💰</div>
                    <div className="stat-value">₺{stats.totalTransactionAmount?.toLocaleString('tr-TR')}</div>
                    <div className="stat-label">Toplam Harcama</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#ef4444', '--stat-color-bg': 'rgba(239,68,68,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🚨</div>
                    <div className="stat-value">{stats.totalPenalties}</div>
                    <div className="stat-label">Ceza</div>
                    <div className="stat-change down">₺{stats.totalPenaltyAmount?.toLocaleString('tr-TR')}</div>
                </div>
            </div>

            <div className="grid grid-2">
                {/* Vehicles */}
                <div className="table-container animate-fadeIn">
                    <div className="table-toolbar">
                        <span className="card-title">Araçlar</span>
                        <a href="/company/vehicles" style={{ fontSize: 13 }}>Tümü →</a>
                    </div>
                    <table>
                        <thead>
                            <tr><th>Plaka</th><th>Araç</th><th>Durum</th><th>İşlem</th></tr>
                        </thead>
                        <tbody>
                            {vehicles.slice(0, 5).map(v => (
                                <tr key={v.id}>
                                    <td style={{ fontWeight: 700 }}>{v.plate}</td>
                                    <td>{v.brand} {v.model}</td>
                                    <td><span className={`badge ${v.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{v.status === 'active' ? 'Aktif' : 'Bakımda'}</span></td>
                                    <td>{v._count?.transactions || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Recent Transactions */}
                <div className="card animate-fadeIn">
                    <div className="card-header">
                        <span className="card-title">Son İşlemler</span>
                        <a href="/company/transactions" style={{ fontSize: 13 }}>Tümü →</a>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {transactions.map(t => (
                            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ fontSize: 20 }}>{t.type === 'wash' ? '🧽' : t.type === 'maintenance' ? '🔧' : '🚨'}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500, fontSize: 14 }}>{t.description}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.vehicle?.plate} • {t.serviceCenter?.name}</div>
                                </div>
                                <span style={{ fontWeight: 700, color: 'var(--warning)' }}>₺{t.amount?.toLocaleString('tr-TR')}</span>
                            </div>
                        ))}
                        {transactions.length === 0 && <div className="empty-state"><p>Henüz işlem yok</p></div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
