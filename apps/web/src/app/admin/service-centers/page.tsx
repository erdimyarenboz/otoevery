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

const SERVICE_TYPES: Record<string, string> = {
    wash: '🚿 Yıkama', maintenance: '🔧 Bakım', tire: '🔄 Lastik',
    fuel: '⛽ Yakıt', both: '🔧🚿 Tümü', repair: '🛠 Tamir',
};

export default function AdminServiceCentersPage() {
    const [centers, setCenters] = useState<ServiceCenter[]>([]);
    const [hakedisMap, setHakedisMap] = useState<Record<string, HakedisDetail>>({});
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<ServiceCenter | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [detailTab, setDetailTab] = useState<'overview' | 'transactions'>('overview');
    const [detailLoading, setDetailLoading] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [newCenter, setNewCenter] = useState({ name: '', address: '', type: 'both', phone: '', contactEmail: '' });
    const [saving, setSaving] = useState(false);
    const [paying, setPaying] = useState(false);
    const [search, setSearch] = useState('');

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
        const res = await api.get(`/api/v1/admin/service-centers/${center.id}/transactions`);
        if (res.success) setTransactions(res.data);
        else setTransactions([]);
        setDetailLoading(false);
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
        if (res.success) { setShowAdd(false); setNewCenter({ name: '', address: '', type: 'both', phone: '', contactEmail: '' }); loadAll(); }
        setSaving(false);
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
                        <thead><tr><th>Servis Merkezi</th><th>Hizmet Türü</th><th>İletişim</th><th>İşlem Sayısı</th><th>Toplam Ciro</th><th>Hakediş</th><th>Durum</th><th></th></tr></thead>
                        <tbody>
                            {filtered.map(c => {
                                const h = hakedisMap[c.id];
                                return (
                                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => openCenter(c)}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.address || '—'}</div>
                                        </td>
                                        <td><span style={{ padding: '3px 10px', borderRadius: 100, background: 'rgba(6,182,212,0.1)', color: '#06b6d4', fontSize: 12, fontWeight: 600 }}>{SERVICE_TYPES[c.type] || c.type}</span></td>
                                        <td>
                                            <div style={{ fontSize: 13 }}>{c.phone || '—'}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.contactEmail || '—'}</div>
                                        </td>
                                        <td><strong>{c._count.transactions}</strong><span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>işlem</span></td>
                                        <td style={{ fontWeight: 700 }}>₺{(h?.totalRevenue || 0).toLocaleString('tr-TR')}</td>
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
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 860, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 800 }}>🔧 {selected.name}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{SERVICE_TYPES[selected.type]} · {selected.address}</div>
                            </div>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
                        </div>

                        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
                            {(['overview', 'transactions'] as const).map(tab => (
                                <button key={tab} onClick={() => setDetailTab(tab)} style={{ padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: detailTab === tab ? 700 : 400, color: detailTab === tab ? 'var(--primary)' : 'var(--text-muted)', borderBottom: detailTab === tab ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1 }}>
                                    {tab === 'overview' ? '📊 Genel & Hakediş' : `📋 İşlemler (${transactions.length})`}
                                </button>
                            ))}
                        </div>

                        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
                            {detailLoading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" style={{ width: 28, height: 28, borderWidth: 3, color: 'var(--primary)' }} /></div>
                                : detailTab === 'overview' ? (() => {
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
                                                ['Adres', selected.address || '—'],
                                                ['Telefon', selected.phone || '—'],
                                                ['E-posta', selected.contactEmail || '—'],
                                                ['Toplam QR Kod', `${selected._count.qrCodes} adet`],
                                                ['Kayıt Tarihi', new Date(selected.createdAt).toLocaleDateString('tr-TR')],
                                            ].map(([l, v]) => <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}><span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{l}</span><span style={{ fontWeight: 600, fontSize: 14 }}>{v}</span></div>)}
                                        </div>
                                    );
                                })() : (
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
                                )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showAdd && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowAdd(false)}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 440, padding: 28 }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>+ Yeni Servis Merkezi</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { label: 'Servis Adı *', key: 'name', placeholder: 'Hızlı Wash & Go' },
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
