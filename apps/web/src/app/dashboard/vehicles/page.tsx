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
    vehicleType: string;
    workingRegion: string;
    currentKm: number;
    status: string;
    ownership: string;
    createdAt: string;
}

const VEHICLE_TYPES = [
    { value: 'car', label: 'Binek Araç' },
    { value: 'lcv', label: 'Hafif Ticari' },
    { value: 'suv', label: 'SUV' },
    { value: 'cargo', label: 'Kamyon/Kamyonet' },
    { value: 'minibus', label: 'Minibüs' },
];

function VehicleModal({ vehicle, onClose, onSave }: { vehicle?: Vehicle | null, onClose: () => void, onSave: () => void }) {
    const [form, setForm] = useState({
        plate: vehicle?.plate || '',
        brand: vehicle?.brand || '',
        model: vehicle?.model || '',
        year: vehicle?.year || new Date().getFullYear(),
        fuelType: vehicle?.fuelType || 'Petrol',
        vehicleType: vehicle?.vehicleType || 'car',
        workingRegion: vehicle?.workingRegion || '',
        currentKm: vehicle?.currentKm || 0,
        ownership: vehicle?.ownership || 'owned',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.plate || !form.brand || !form.workingRegion) {
            setError('Lütfen tüm zorunlu alanları (Plaka, Marka, Çalışma Bölgesi) doldurun.');
            return;
        }
        setLoading(true);
        const res = vehicle
            ? await api.put(`/api/v1/vehicles/${vehicle.id}`, form)
            : await api.post('/api/v1/company/vehicles', form);

        if (res.success) {
            onSave();
            onClose();
        } else {
            setError(res.message || 'Bir hata oluştu');
        }
        setLoading(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-slideUp" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
                <div className="modal-header">
                    <h3 className="modal-title">{vehicle ? 'Aracı Düzenle' : 'Yeni Araç Ekle'}</h3>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 0' }}>
                    {error && <div style={{ color: '#ef4444', fontSize: 13, background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: 8 }}>⚠️ {error}</div>}
                    <div className="grid grid-2" style={{ gap: 12 }}>
                        <div>
                            <label className="form-label">Plaka *</label>
                            <input className="form-input" value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value })} placeholder="34 ABC 123" required />
                        </div>
                        <div>
                            <label className="form-label">Araç Türü *</label>
                            <select className="form-input" value={form.vehicleType} onChange={e => setForm({ ...form, vehicleType: e.target.value })}>
                                {VEHICLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-2" style={{ gap: 12 }}>
                        <div>
                            <label className="form-label">Marka *</label>
                            <input className="form-input" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Ör: Renault" required />
                        </div>
                        <div>
                            <label className="form-label">Model</label>
                            <input className="form-input" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="Ör: Megane" />
                        </div>
                    </div>
                    <div>
                        <label className="form-label">Çalışma Bölgesi *</label>
                        <input className="form-input" value={form.workingRegion} onChange={e => setForm({ ...form, workingRegion: e.target.value })} placeholder="Ör: İstanbul - Anadolu Yakası" required />
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Aracın ağırlıklı olarak hizmet alacağı bölge.</p>
                    </div>
                    <div className="grid grid-3" style={{ gap: 12 }}>
                        <div>
                            <label className="form-label">Yıl</label>
                            <input type="number" className="form-input" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <label className="form-label">KM</label>
                            <input type="number" className="form-input" value={form.currentKm} onChange={e => setForm({ ...form, currentKm: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <label className="form-label">Yakıt</label>
                            <select className="form-input" value={form.fuelType} onChange={e => setForm({ ...form, fuelType: e.target.value })}>
                                <option value="Petrol">Benzin</option>
                                <option value="Diesel">Dizel</option>
                                <option value="Electric">Elektrik</option>
                                <option value="Hybrid">Hibrit</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px 0', marginTop: 8 }}>
                        {loading ? '⏳ Kaydediliyor...' : '💾 Kaydet'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

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

    const handleAdd = () => {
        setSelectedVehicle(null);
        setIsModalOpen(true);
    };

    const handleEdit = (v: Vehicle) => {
        setSelectedVehicle(v);
        setIsModalOpen(true);
    };

    const filtered = vehicles.filter(v =>
        (v.plate + v.brand + v.model + (v.workingRegion || '')).toLowerCase().includes(search.toLowerCase())
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
                <button className="btn btn-primary" onClick={handleAdd}>➕ Yeni Araç Ekle</button>
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
                            placeholder="Plaka, marka, model veya bölge ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Plaka</th>
                            <th>Tür / Bölge</th>
                            <th>Marka / Model / Yıl</th>
                            <th>Yakıt</th>
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
                                <td>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{VEHICLE_TYPES.find(t => t.value === v.vehicleType)?.label || v.vehicleType}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {v.workingRegion || 'Bölge girilmemiş'}</div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 500 }}>{v.brand} {v.model}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.year} model</div>
                                </td>
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
                                        <button className="btn btn-ghost btn-sm" title="Düzenle" onClick={() => handleEdit(v)}>✏️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && <VehicleModal vehicle={selectedVehicle} onClose={() => setIsModalOpen(false)} onSave={loadVehicles} />}
        </div>
    );
}
