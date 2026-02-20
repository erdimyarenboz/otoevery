'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Vehicle {
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    fuelType: string;
    currentKm: number;
    status: string;
    ownership: string;
    createdAt: string;
}

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadVehicles();
    }, []);

    const loadVehicles = async () => {
        const res = await api.get('/api/v1/vehicles');
        if (res.success && res.data) {
            setVehicles(res.data);
        }
        setLoading(false);
    };

    const filtered = vehicles.filter(v =>
        (v.plate + v.brand + v.model).toLowerCase().includes(search.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const map: Record<string, { label: string; cls: string }> = {
            active: { label: 'Aktif', cls: 'badge-success' },
            passive: { label: 'Pasif', cls: 'badge-neutral' },
            maintenance: { label: 'Bakımda', cls: 'badge-warning' },
            sold: { label: 'Satıldı', cls: 'badge-error' },
        };
        const s = map[status] || { label: status, cls: 'badge-neutral' };
        return <span className={`badge ${s.cls}`}>{s.label}</span>;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Araçlar</div>
                    <div className="page-description">{vehicles.length} araç kayıtlı</div>
                </div>
                <button className="btn btn-primary">➕ Yeni Araç Ekle</button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-4" style={{ marginBottom: '24px' }}>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#10b981', '--stat-color-bg': 'rgba(16,185,129,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">✅</div>
                    <div className="stat-value">{vehicles.filter(v => v.status === 'active').length}</div>
                    <div className="stat-label">Aktif Araç</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#f59e0b', '--stat-color-bg': 'rgba(245,158,11,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🔧</div>
                    <div className="stat-value">{vehicles.filter(v => v.status === 'maintenance').length}</div>
                    <div className="stat-label">Bakımda</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#6366f1', '--stat-color-bg': 'rgba(99,102,241,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🏢</div>
                    <div className="stat-value">{vehicles.filter(v => v.ownership === 'owned').length}</div>
                    <div className="stat-label">Şirket Aracı</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#06b6d4', '--stat-color-bg': 'rgba(6,182,212,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">📋</div>
                    <div className="stat-value">{vehicles.filter(v => v.ownership === 'rented').length}</div>
                    <div className="stat-label">Kiralık Araç</div>
                </div>
            </div>

            {/* Table */}
            <div className="table-container animate-fadeIn">
                <div className="table-toolbar">
                    <div className="table-search">
                        <span style={{ color: 'var(--text-muted)' }}>🔍</span>
                        <input
                            placeholder="Plaka, marka veya model ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-ghost btn-sm">🔽 Filtrele</button>
                        <button className="btn btn-ghost btn-sm">📥 Dışa Aktar</button>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Plaka</th>
                            <th>Marka / Model</th>
                            <th>Yıl</th>
                            <th>Yakıt Tipi</th>
                            <th>KM</th>
                            <th>Durum</th>
                            <th>Sahiplik</th>
                            <th>İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((v) => (
                            <tr key={v.id}>
                                <td style={{ fontWeight: 700 }}>{v.plate}</td>
                                <td>{v.brand} {v.model}</td>
                                <td>{v.year}</td>
                                <td><span className="badge badge-neutral">{v.fuelType || '-'}</span></td>
                                <td>{v.currentKm?.toLocaleString('tr-TR')} km</td>
                                <td>{getStatusBadge(v.status)}</td>
                                <td>
                                    <span className={`badge ${v.ownership === 'owned' ? 'badge-primary' : 'badge-warning'}`}>
                                        {v.ownership === 'owned' ? 'Şirket' : 'Kiralık'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button className="btn btn-ghost btn-sm" title="Detay">👁</button>
                                        <button className="btn btn-ghost btn-sm" title="Düzenle">✏️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={8}>
                                    <div className="empty-state">
                                        <div className="empty-icon">🔍</div>
                                        <h3>Sonuç bulunamadı</h3>
                                        <p>Arama kriterlerinize uygun araç bulunamadı</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="table-pagination">
                    <span>{filtered.length} / {vehicles.length} araç</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-ghost btn-sm" disabled>← Önceki</button>
                        <button className="btn btn-ghost btn-sm" disabled>Sonraki →</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
