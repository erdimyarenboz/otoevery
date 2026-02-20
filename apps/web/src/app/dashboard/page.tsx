'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface DashboardStats {
    totalVehicles: number;
    activeVehicles: number;
    totalEmployees: number;
    pendingRequests: number;
    monthlyExpenses: number;
    fuelCostThisMonth: number;
    activePenalties: number;
    upcomingDocs: number;
}

const CHART_DATA = [65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95, 88];
const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalVehicles: 0,
        activeVehicles: 0,
        totalEmployees: 0,
        pendingRequests: 0,
        monthlyExpenses: 0,
        fuelCostThisMonth: 0,
        activePenalties: 0,
        upcomingDocs: 0,
    });
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        const [vehiclesRes] = await Promise.all([
            api.get('/api/v1/vehicles'),
        ]);

        if (vehiclesRes.success && vehiclesRes.data) {
            const vehicleList = vehiclesRes.data;
            setVehicles(vehicleList.slice(0, 5));
            setStats({
                totalVehicles: vehicleList.length,
                activeVehicles: vehicleList.filter((v: any) => v.status === 'active').length,
                totalEmployees: 12,
                pendingRequests: 3,
                monthlyExpenses: 45780,
                fuelCostThisMonth: 28450,
                activePenalties: 2,
                upcomingDocs: 5,
            });
        }

        setRecentActivities([
            { id: 1, type: 'vehicle', icon: '🚗', text: 'Toyota Corolla servise gönderildi', time: '2 saat önce', user: 'Mehmet K.' },
            { id: 2, type: 'fuel', icon: '⛽', text: 'Ford Transit yakıt alımı — 420 ₺', time: '3 saat önce', user: 'Ayşe D.' },
            { id: 3, type: 'penalty', icon: '🚨', text: 'Yeni trafik cezası — 34 ABC 123', time: '5 saat önce', user: 'Sistem' },
            { id: 4, type: 'doc', icon: '📄', text: 'Kasko poliçesi yenilendi', time: '1 gün önce', user: 'Ali Y.' },
            { id: 5, type: 'request', icon: '📩', text: 'Bakım talebi oluşturuldu', time: '1 gün önce', user: 'Fatma S.' },
        ]);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Merhaba, {user?.firstName} 👋</div>
                    <div className="page-description">{user?.tenant?.name} — Filo durumunuza genel bakış</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary">
                        📥 Rapor İndir
                    </button>
                    <button className="btn btn-primary">
                        ➕ Yeni Araç
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-4" style={{ marginBottom: '28px' }}>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#6366f1', '--stat-color-bg': 'rgba(99,102,241,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🚗</div>
                    <div className="stat-value">{stats.totalVehicles}</div>
                    <div className="stat-label">Toplam Araç</div>
                    <div className="stat-change up">↑ {stats.activeVehicles} aktif</div>
                </div>

                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#06b6d4', '--stat-color-bg': 'rgba(6,182,212,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">👥</div>
                    <div className="stat-value">{stats.totalEmployees}</div>
                    <div className="stat-label">Çalışan</div>
                    <div className="stat-change up">↑ 2 yeni bu ay</div>
                </div>

                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#f59e0b', '--stat-color-bg': 'rgba(245,158,11,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">💰</div>
                    <div className="stat-value">₺{stats.monthlyExpenses.toLocaleString('tr-TR')}</div>
                    <div className="stat-label">Aylık Gider</div>
                    <div className="stat-change down">↓ 8% geçen aya göre</div>
                </div>

                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#ef4444', '--stat-color-bg': 'rgba(239,68,68,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🚨</div>
                    <div className="stat-value">{stats.activePenalties}</div>
                    <div className="stat-label">Aktif Ceza</div>
                    <div className="stat-change">⏳ {stats.pendingRequests} bekleyen talep</div>
                </div>
            </div>

            {/* Charts + Activities Row */}
            <div className="grid grid-2" style={{ marginBottom: '28px' }}>
                {/* Expense Chart */}
                <div className="card animate-fadeIn">
                    <div className="card-header">
                        <span className="card-title">Aylık Gider Trendi</span>
                        <span className="badge badge-primary">2026</span>
                    </div>
                    <div className="chart-container">
                        {CHART_DATA.map((value, i) => (
                            <div
                                key={i}
                                className="chart-bar"
                                style={{ height: `${value}%` }}
                                title={`${MONTHS[i]}: ₺${(value * 500).toLocaleString('tr-TR')}`}
                            />
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
                        {MONTHS.map(m => (
                            <span key={m} style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m}</span>
                        ))}
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="card animate-fadeIn">
                    <div className="card-header">
                        <span className="card-title">Son Hareketler</span>
                        <a href="#" style={{ fontSize: '13px' }}>Tümünü Gör →</a>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {recentActivities.map((activity) => (
                            <div
                                key={activity.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 12px',
                                    borderRadius: 'var(--radius-md)',
                                    transition: 'background 150ms',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                <span style={{ fontSize: '20px' }}>{activity.icon}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{activity.text}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        {activity.user} • {activity.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Vehicles Table */}
            <div className="table-container animate-fadeIn">
                <div className="table-toolbar">
                    <span className="card-title">Araç Listesi</span>
                    <div className="table-search">
                        <span style={{ color: 'var(--text-muted)' }}>🔍</span>
                        <input placeholder="Plaka, marka veya model ara..." />
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Plaka</th>
                            <th>Marka / Model</th>
                            <th>Yıl</th>
                            <th>Yakıt</th>
                            <th>KM</th>
                            <th>Durum</th>
                            <th>Sahiplik</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.map((v) => (
                            <tr key={v.id}>
                                <td style={{ fontWeight: 600 }}>{v.plate}</td>
                                <td>{v.brand} {v.model}</td>
                                <td>{v.year}</td>
                                <td>
                                    <span className="badge badge-neutral">{v.fuelType || '-'}</span>
                                </td>
                                <td>{v.currentKm?.toLocaleString('tr-TR')} km</td>
                                <td>
                                    <span className={`badge ${v.status === 'active' ? 'badge-success' : v.status === 'maintenance' ? 'badge-warning' : 'badge-neutral'}`}>
                                        {v.status === 'active' ? 'Aktif' : v.status === 'maintenance' ? 'Bakımda' : v.status}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${v.ownership === 'owned' ? 'badge-primary' : 'badge-warning'}`}>
                                        {v.ownership === 'owned' ? 'Şirket' : 'Kiralık'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {vehicles.length === 0 && (
                            <tr>
                                <td colSpan={7}>
                                    <div className="empty-state">
                                        <div className="empty-icon">🚗</div>
                                        <h3>Henüz araç yok</h3>
                                        <p>İlk aracınızı ekleyerek başlayın</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {vehicles.length > 0 && (
                    <div className="table-pagination">
                        <span>{vehicles.length} araç gösteriliyor</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn btn-ghost btn-sm" disabled>← Önceki</button>
                            <button className="btn btn-ghost btn-sm" disabled>Sonraki →</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
