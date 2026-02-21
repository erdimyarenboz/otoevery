'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface ServiceCenter {
    id: string;
    name: string;
    address: string;
    type: string;
    phone: string;
    contactEmail: string;
    contactName?: string;
    isActive: boolean;
    createdAt: string;
    _count: { agreements: number; transactions: number; qrCodes: number };
}

interface HakedisDetail {
    totalRevenue: number;
    totalPaid: number;
    hakedis: number;
    lastPayoutDate: string | null;
    lastPayoutAmount: number | null;
}

interface Transaction {
    id: string;
    serviceType: string;
    amount: number;
    creditAmount: number;
    transactionDate: string;
    vehicle: { plate: string; brand: string; model: string };
    status: string;
}

interface ServicePricing {
    id: string;
    serviceType: string;
    price: number;
    companyId: string | null;
    company?: { id: string; name: string } | null;
}

const SERVICE_TYPES: Record<string, string> = {
    wash: '🚿 Yıkama', maintenance: '🔧 Bakım', tire: '🔄 Lastik',
    fuel: '⛽ Yakıt', both: '🔧🚿 Tümü', repair: '🛠 Tamir',
};

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
};

export default function AdminServiceCentersPage() {
    const [centers, setCenters] = useState<ServiceCenter[]>([]);
    const [hakedisMap, setHakedisMap] = useState<Record<string, HakedisDetail>>({});
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<ServiceCenter | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [detailTab, setDetailTab] = useState<'overview' | 'transactions' | 'pricing'>('overview');
    const [detailLoading, setDetailLoading] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [newCenter, setNewCenter] = useState({ name: '', address: '', type: 'both', phone: '', contactEmail: '', contactName: '' });
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', address: '', type: 'both', phone: '', contactEmail: '', contactName: '', isActive: true });
    const [paying, setPaying] = useState(false);
    const [search, setSearch] = useState('');

    // Pricing state
    const [pricings, setPricings] = useState<ServicePricing[]>([]);
    const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
    const [pricingFilter, setPricingFilter] = useState<'default' | string>('default');
    const [newPrice, setNewPrice] = useState({ serviceType: 'wash_standard', price: '', companyId: '' });
    const [addingPrice, setAddingPrice] = useState(false);

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        setLoading(true);
        const [cRes, hRes] = await Promise.all([
            api.get('/api/v1/admin/service-centers'),
            api.get('/api/v1/admin/hakedis'),
        ]);
        if (cRes.success) setCenters(cRes.data);
        if (hRes.success) {
            const map: Record<string, HakedisDetail> = {};
            hRes.data.forEach((h: any) => { map[h.id] = h; });
            setHakedisMap(map);
        }
        setLoading(false);
    };

    const openCenter = async (center: ServiceCenter) => {
        setSelected(center);
        setDetailTab('overview');
        setDetailLoading(true);
        const [txRes, cRes] = await Promise.all([
            api.get(`/api/v1/admin/service-centers/${center.id}/transactions`),
            api.get(`/api/v1/admin/service-centers/${center.id}/pricing/companies`),
        ]);
        if (txRes.success) setTransactions(txRes.data);
        else setTransactions([]);
        if (cRes.success) setCompanies(cRes.data);
        setDetailLoading(false);
    };

    const loadPricings = async (centerId: string) => {
        const companyId = pricingFilter === 'default' ? undefined : pricingFilter;
        const params = companyId ? `?companyId=${companyId}` : '';
        const res = await api.get(`/api/v1/admin/service-centers/${centerId}/pricing${params}`);
        if (res.success) setPricings(res.data);
    };

    const openPricingTab = async () => {
        setDetailTab('pricing');
        if (selected) await loadPricings(selected.id);
    };

    const addPrice = async () => {
        if (!selected || !newPrice.serviceType || !newPrice.price) return;
        setAddingPrice(true);
        const body: any = { serviceType: newPrice.serviceType, price: Number(newPrice.price) };
        if (newPrice.companyId) body.companyId = newPrice.companyId;
        const res = await api.post(`/api/v1/admin/service-centers/${selected.id}/pricing`, body);
        if (res.success) {
            setNewPrice({ serviceType: 'wash_standard', price: '', companyId: '' });
            await loadPricings(selected.id);
        }
        setAddingPrice(false);
    };

    const removePrice = async (priceId: string) => {
        if (!selected) return;
        await api.delete(`/api/v1/admin/service-centers/${selected.id}/pricing/${priceId}`);
        await loadPricings(selected.id);
    };

    const handlePay = async () => {
        if (!selected) return;
        setPaying(true);
        const res = await api.post(`/api/v1/admin/hakedis/${selected.id}/pay`, {});
        if (res.success) { await loadAll(); setSelected(null); }
        setPaying(false);
    };

    const addCenter = async () => {
        if (!newCenter.name) return;
        setSaving(true);
        const res = await api.post('/api/v1/admin/service-centers', newCenter);
        if (res.success) {
            setShowAdd(false);
            setNewCenter({ name: '', address: '', type: 'both', phone: '', contactEmail: '', contactName: '' });
            loadAll();
        }
        setSaving(false);
    };

    const handleUpdate = async () => {
        if (!selected) return;
        setSaving(true);
        const res = await api.put(`/api/v1/admin/service-centers/${selected.id}`, editData);
        if (res.success) {
            setIsEditing(false);
            setSelected({ ...selected, ...editData });
            loadAll();
        }
        setSaving(false);
    };

    const startEditing = () => {
        if (!selected) return;
        setEditData({
            name: selected.name,
            address: selected.address || '',
            type: selected.type,
            phone: selected.phone || '',
            contactEmail: selected.contactEmail || '',
            contactName: selected.contactName || '',
            isActive: selected.isActive,
        });
        setIsEditing(true);
    };

    const filtered = centers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    const totalHakedis = Object.values(hakedisMap).reduce((s, h) => s + h.hakedis, 0);
    const totalRevenue = Object.values(hakedisMap).reduce((s, h) => s + h.totalRevenue, 0);


    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">🔧 Servis Merkezleri</div>
                    <div className="page-description">Anlaşmalı oto servisler ve hakediş yönetimi</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Servis Ekle</button>
            </div>

            <div className="grid grid-4" style={{ marginBottom: 24 }}>
                {[
                    { icon: '🔧', value: centers.length, label: 'Toplam Servis', color: '#06b6d4' },
                    { icon: '✅', value: centers.filter(c => c.isActive).length, label: 'Aktif', color: '#10b981' },
                    { icon: '💰', value: `₺${totalHakedis.toLocaleString('tr-TR')}`, label: 'Ödenecek Hakediş', color: '#f59e0b' },
                    { icon: '📊', value: `₺${totalRevenue.toLocaleString('tr-TR')}`, label: 'Toplam Ciro', color: '#6366f1' },
                ].map(s => (
                    <div key={s.label} className="stat-card" style={{ '--stat-color': s.color, '--stat-color-bg': `${s.color}1a` } as React.CSSProperties}>
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }}>
                <input className="form-input" placeholder="🔍 Servis ara..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ margin: 0, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, width: '100%', color: 'var(--text-primary)' }} />
            </div>

            <div className="card">
                {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, color: 'var(--primary)' }} /></div> : (
                    <table className="table">
                        <thead><tr><th>Servis Merkezi</th><th>Yetkili</th><th>Hizmet Türü</th><th>İletişim</th><th>İşlem Sayısı</th><th>Hakediş</th><th>Durum</th><th></th></tr></thead>
                        <tbody>
                            {filtered.map(c => {
                                const h = hakedisMap[c.id];
                                return (
                                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => openCenter(c)}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.address || '—'}</div>
                                        </td>
                                        <td style={{ fontSize: 13 }}>{(c as any).contactName || '—'}</td>
                                        <td><span style={{ padding: '3px 10px', borderRadius: 100, background: 'rgba(6,182,212,0.1)', color: '#06b6d4', fontSize: 12, fontWeight: 600 }}>{SERVICE_TYPES[c.type] || c.type}</span></td>
                                        <td>
                                            <div style={{ fontSize: 13 }}>{c.phone || '—'}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.contactEmail || '—'}</div>
                                        </td>
                                        <td><strong>{c._count.transactions}</strong><span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>işlem</span></td>
                                        <td style={{ fontWeight: 700, color: (h?.hakedis || 0) > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>₺{(h?.hakedis || 0).toLocaleString('tr-TR')}</td>
                                        <td><span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: c.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', color: c.isActive ? 'var(--success)' : 'var(--text-muted)' }}>{c.isActive ? 'Aktif' : 'Pasif'}</span></td>
                                        <td><button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }} onClick={e => { e.stopPropagation(); openCenter(c); }}>Detay →</button></td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Bulunamadı</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Detail Modal */}
            {selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setSelected(null)}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 900, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 800 }}>🔧 {selected.name}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                                    {SERVICE_TYPES[selected.type]} · {selected.address}
                                    {(selected as any).contactName && ` · ${(selected as any).contactName}`}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {!isEditing && detailTab === 'overview' && <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={startEditing}>✏️ Düzenle</button>}
                                <button onClick={() => { setSelected(null); setIsEditing(false); }} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
                            {(['overview', 'transactions', 'pricing'] as const).map(tab => (
                                <button key={tab} onClick={() => tab === 'pricing' ? openPricingTab() : setDetailTab(tab)} style={{ padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: detailTab === tab ? 700 : 400, color: detailTab === tab ? 'var(--primary)' : 'var(--text-muted)', borderBottom: detailTab === tab ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1 }}>
                                    {tab === 'overview' ? '📊 Genel & Hakediş' : tab === 'transactions' ? `📋 İşlemler (${transactions.length})` : '💰 Fiyatlandırma'}
                                </button>
                            ))}
                        </div>

                        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
                            {detailLoading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" style={{ width: 28, height: 28, borderWidth: 3, color: 'var(--primary)' }} /></div>
                                : detailTab === 'overview' ? (isEditing ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <div>
                                                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Servis Adı</label>
                                                <input className="form-input" style={{ margin: 0 }} value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Hizmet Türü</label>
                                                <select className="form-input" style={{ margin: 0 }} value={editData.type} onChange={e => setEditData({ ...editData, type: e.target.value })}>
                                                    <option value="wash">🚿 Yıkama</option>
                                                    <option value="maintenance">🔧 Bakım</option>
                                                    <option value="tire">🔄 Lastik</option>
                                                    <option value="fuel">⛽ Yakıt</option>
                                                    <option value="both">🔧🚿 Tümü</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Yetkili Adı Soyadı</label>
                                            <input className="form-input" style={{ margin: 0 }} value={editData.contactName} onChange={e => setEditData({ ...editData, contactName: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Adres</label>
                                            <input className="form-input" style={{ margin: 0 }} value={editData.address} onChange={e => setEditData({ ...editData, address: e.target.value })} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <div>
                                                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Telefon</label>
                                                <input className="form-input" style={{ margin: 0 }} value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>E-posta</label>
                                                <input className="form-input" style={{ margin: 0 }} value={editData.contactEmail} onChange={e => setEditData({ ...editData, contactEmail: e.target.value })} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                                            <input type="checkbox" id="edit-active" checked={editData.isActive} onChange={e => setEditData({ ...editData, isActive: e.target.checked })} />
                                            <label htmlFor="edit-active" style={{ fontSize: 14, fontWeight: 600 }}>Aktif Servis</label>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>İptal</button>
                                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleUpdate} disabled={saving}>{saving ? 'Değişiklikler Kaydediliyor...' : 'Değişiklikleri Kaydet'}</button>
                                        </div>
                                    </div>
                                ) : (() => {
                                    const h = hakedisMap[selected.id];
                                    return (
                                        <div>
                                            <div className="grid grid-3" style={{ marginBottom: 20 }}>
                                                {[
                                                    { label: 'Toplam Ciro', val: `₺${(h?.totalRevenue || 0).toLocaleString('tr-TR')}`, color: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', textColor: 'var(--success)' },
                                                    { label: 'Ödenecek Hakediş', val: `₺${(h?.hakedis || 0).toLocaleString('tr-TR')}`, color: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', textColor: 'var(--warning)' },
                                                    { label: 'Ödenen Toplam', val: `₺${(h?.totalPaid || 0).toLocaleString('tr-TR')}`, color: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', textColor: 'var(--primary)' },
                                                ].map(b => (
                                                    <div key={b.label} style={{ background: b.color, border: `1px solid ${b.border}`, borderRadius: 12, padding: 16 }}>
                                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{b.label}</div>
                                                        <div style={{ fontSize: 22, fontWeight: 800, color: b.textColor }}>{b.val}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            {h?.lastPayoutDate && <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>Son ödeme: <strong>₺{(h.lastPayoutAmount || 0).toLocaleString('tr-TR')}</strong> — {new Date(h.lastPayoutDate).toLocaleDateString('tr-TR')}</div>}
                                            {(h?.hakedis || 0) > 0 && <button className="btn btn-primary" disabled={paying} onClick={handlePay} style={{ marginBottom: 20, width: '100%' }}>{paying ? 'Ödeniyor...' : `💰 ₺${(h?.hakedis || 0).toLocaleString('tr-TR')} Hakediş Öde`}</button>}
                                            {[
                                                ['Yetkili Adı Soyadı', (selected as any).contactName || '—'],
                                                ['Adres', selected.address || '—'],
                                                ['Telefon', selected.phone || '—'],
                                                ['E-posta', selected.contactEmail || '—'],
                                                ['Toplam QR Kod', `${selected._count.qrCodes} adet`],
                                                ['Durum', selected.isActive ? 'Aktif' : 'Pasif'],
                                                ['Kayıt Tarihi', new Date(selected.createdAt).toLocaleDateString('tr-TR')],
                                            ].map(([l, v]) => <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}><span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{l}</span><span style={{ fontWeight: 600, fontSize: 14 }}>{v}</span></div>)}
                                        </div>
                                    );
                                })()) : detailTab === 'transactions' ? (
                                    <table className="table">
                                        <thead><tr><th>Tarih</th><th>Plaka</th><th>Hizmet</th><th>Kredi</th><th>Tutar</th><th>Durum</th></tr></thead>
                                        <tbody>
                                            {transactions.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>İşlem yok</td></tr>
                                                : transactions.slice(0, 100).map(t => (
                                                    <tr key={t.id}>
                                                        <td style={{ fontSize: 13 }}>{new Date(t.transactionDate).toLocaleDateString('tr-TR')}</td>
                                                        <td><span style={{ fontWeight: 700, background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{t.vehicle?.plate}</span></td>
                                                        <td style={{ fontSize: 13 }}>{t.serviceType}</td>
                                                        <td style={{ fontWeight: 700, color: 'var(--warning)' }}>₺{(t.creditAmount || 0).toLocaleString('tr-TR')}</td>
                                                        <td style={{ fontWeight: 700 }}>₺{(t.amount || 0).toLocaleString('tr-TR')}</td>
                                                        <td><span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: t.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: t.status === 'completed' ? 'var(--success)' : 'var(--warning)' }}>{t.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}</span></td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    /* PRICING TAB */
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>💰 Hizmet Fiyatlandırması</div>

                                        {/* Filter by company */}
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                                            <button onClick={() => { setPricingFilter('default'); loadPricings(selected.id); }} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: pricingFilter === 'default' ? 700 : 400, background: pricingFilter === 'default' ? 'var(--primary)' : 'var(--bg-secondary)', color: pricingFilter === 'default' ? '#fff' : 'var(--text-primary)', border: 'none', cursor: 'pointer' }}>Varsayılan</button>
                                            {companies.map(co => (
                                                <button key={co.id} onClick={() => { setPricingFilter(co.id); loadPricings(selected.id); }} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: pricingFilter === co.id ? 700 : 400, background: pricingFilter === co.id ? 'var(--primary)' : 'var(--bg-secondary)', color: pricingFilter === co.id ? '#fff' : 'var(--text-primary)', border: 'none', cursor: 'pointer' }}>{co.name}</button>
                                            ))}
                                        </div>

                                        {/* Add price form */}
                                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text-muted)' }}>Yeni Fiyat Ekle</div>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                                <div style={{ flex: 2, minWidth: 160 }}>
                                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Hizmet Türü</label>
                                                    <select className="form-input" style={{ margin: 0 }} value={newPrice.serviceType} onChange={e => setNewPrice(p => ({ ...p, serviceType: e.target.value }))}>
                                                        {Object.entries(SERVICE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                                    </select>
                                                </div>
                                                <div style={{ flex: 1, minWidth: 100 }}>
                                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Fiyat (₺)</label>
                                                    <input className="form-input" style={{ margin: 0 }} type="number" placeholder="150" value={newPrice.price} onChange={e => setNewPrice(p => ({ ...p, price: e.target.value }))} />
                                                </div>
                                                <div style={{ flex: 2, minWidth: 140 }}>
                                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Şirkete Özel (opsiyonel)</label>
                                                    <select className="form-input" style={{ margin: 0 }} value={newPrice.companyId} onChange={e => setNewPrice(p => ({ ...p, companyId: e.target.value }))}>
                                                        <option value="">— Varsayılan —</option>
                                                        {companies.map(co => <option key={co.id} value={co.id}>{co.name}</option>)}
                                                    </select>
                                                </div>
                                                <button className="btn btn-primary" disabled={addingPrice} onClick={addPrice} style={{ padding: '8px 18px', alignSelf: 'flex-end' }}>{addingPrice ? '...' : '+ Ekle'}</button>
                                            </div>
                                        </div>

                                        <table className="table">
                                            <thead><tr><th>Hizmet</th><th>Fiyat</th><th>Kapsam</th><th></th></tr></thead>
                                            <tbody>
                                                {pricings.length === 0
                                                    ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Fiyat tanımlanmamış</td></tr>
                                                    : pricings.map(p => (
                                                        <tr key={p.id}>
                                                            <td style={{ fontWeight: 600 }}>{SERVICE_TYPE_LABELS[p.serviceType] || p.serviceType}</td>
                                                            <td style={{ fontWeight: 800, color: 'var(--success)', fontSize: 16 }}>₺{p.price.toLocaleString('tr-TR')}</td>
                                                            <td style={{ fontSize: 13 }}>{p.company ? <span style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{p.company.name}</span> : <span style={{ color: 'var(--text-muted)' }}>Tüm şirketler</span>}</td>
                                                            <td><button onClick={() => removePrice(p.id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Kaldır</button></td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showAdd && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowAdd(false)}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 480, padding: 28 }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>+ Yeni Servis Merkezi</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { label: 'Servis Adı *', key: 'name', placeholder: 'Hızlı Wash & Go' },
                                { label: 'Yetkili Adı Soyadı', key: 'contactName', placeholder: 'Ahmet Yılmaz' },
                                { label: 'Adres', key: 'address', placeholder: 'Kadıköy, İstanbul' },
                                { label: 'Telefon', key: 'phone', placeholder: '0216 555 0000' },
                                { label: 'E-posta', key: 'contactEmail', placeholder: 'info@servis.com' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>{f.label}</label>
                                    <input className="form-input" placeholder={f.placeholder} style={{ margin: 0 }} value={(newCenter as any)[f.key]} onChange={e => setNewCenter(p => ({ ...p, [f.key]: e.target.value }))} />
                                </div>
                            ))}
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Hizmet Türü</label>
                                <select className="form-input" style={{ margin: 0 }} value={newCenter.type} onChange={e => setNewCenter(p => ({ ...p, type: e.target.value }))}>
                                    <option value="wash">🚿 Yıkama</option>
                                    <option value="maintenance">🔧 Bakım</option>
                                    <option value="tire">🔄 Lastik</option>
                                    <option value="fuel">⛽ Yakıt</option>
                                    <option value="both">🔧🚿 Tümü</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                            <button className="btn btn-secondary" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>İptal</button>
                            <button className="btn btn-primary" onClick={addCenter} disabled={saving} style={{ flex: 1 }}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
