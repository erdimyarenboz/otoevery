'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Company {
    id: string;
    name: string;
    slug: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    creditBalance: number;
    contractFee?: number;
    contractMonths?: number;
    createdAt: string;
    _count: { vehicles: number; users: number; agreements: number };
}

interface Vehicle {
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    creditBalance: number;
    status: string;
    _count: { transactions: number; penalties: number };
}

interface Transaction {
    id: string;
    serviceType: string;
    amount: number;
    creditAmount: number;
    transactionDate: string;
    vehicle: { plate: string; brand: string; model: string };
    serviceCenter: { name: string };
    status: string;
}

export default function AdminCompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Company | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [detailTab, setDetailTab] = useState<'overview' | 'vehicles' | 'transactions'>('overview');
    const [detailLoading, setDetailLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCompany, setNewCompany] = useState({ name: '', slug: '', address: '', contactEmail: '', contactPhone: '', contractFee: '', contractMonths: '' });
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        setLoading(true);
        const res = await api.get('/api/v1/admin/companies');
        if (res.success) setCompanies(res.data);
        setLoading(false);
    };

    const openCompany = async (company: Company) => {
        setSelected(company);
        setDetailTab('overview');
        setDetailLoading(true);
        // Load vehicles and transactions for this company
        const [vRes, tRes] = await Promise.all([
            api.get(`/api/v1/admin/companies/${company.id}/vehicles`),
            api.get(`/api/v1/admin/companies/${company.id}/transactions`),
        ]);
        if (vRes.success) setVehicles(vRes.data);
        else setVehicles([]);
        if (tRes.success) setTransactions(tRes.data);
        else setTransactions([]);
        setDetailLoading(false);
    };

    const addCompany = async () => {
        if (!newCompany.name || !newCompany.slug) return;
        setSaving(true);
        const res = await api.post('/api/v1/admin/companies', {
            ...newCompany,
            contractFee: newCompany.contractFee ? Number(newCompany.contractFee) : undefined,
            contractMonths: newCompany.contractMonths ? Number(newCompany.contractMonths) : undefined,
        });
        if (res.success) {
            setShowAddModal(false);
            setNewCompany({ name: '', slug: '', address: '', contactEmail: '', contactPhone: '', contractFee: '', contractMonths: '' });
            loadCompanies();
        }
        setSaving(false);
    };

    const filtered = companies.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.contactEmail?.toLowerCase().includes(search.toLowerCase())
    );

    const totalFleet = companies.reduce((s, c) => s + c._count.vehicles, 0);
    const totalCredit = companies.reduce((s, c) => s + (c.creditBalance || 0), 0);

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">🏢 Şirketler</div>
                    <div className="page-description">Anlaşmalı şirketler ve filo detayları</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Şirket Ekle</button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-4" style={{ marginBottom: 24 }}>
                <div className="stat-card" style={{ '--stat-color': '#6366f1', '--stat-color-bg': 'rgba(99,102,241,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🏢</div>
                    <div className="stat-value">{companies.length}</div>
                    <div className="stat-label">Toplam Şirket</div>
                </div>
                <div className="stat-card" style={{ '--stat-color': '#10b981', '--stat-color-bg': 'rgba(16,185,129,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🚗</div>
                    <div className="stat-value">{totalFleet}</div>
                    <div className="stat-label">Toplam Araç</div>
                </div>
                <div className="stat-card" style={{ '--stat-color': '#f59e0b', '--stat-color-bg': 'rgba(245,158,11,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">💳</div>
                    <div className="stat-value">₺{totalCredit.toLocaleString('tr-TR')}</div>
                    <div className="stat-label">Toplam Kredi</div>
                </div>
                <div className="stat-card" style={{ '--stat-color': '#06b6d4', '--stat-color-bg': 'rgba(6,182,212,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">📋</div>
                    <div className="stat-value">{companies.reduce((s, c) => s + c._count.agreements, 0)}</div>
                    <div className="stat-label">Aktif Anlaşma</div>
                </div>
            </div>

            {/* Search */}
            <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }}>
                <input
                    className="form-input"
                    placeholder="🔍 Şirket adı veya e-posta ara..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ margin: 0, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, width: '100%', color: 'var(--text-primary)' }}
                />
            </div>

            {/* Table */}
            <div className="card">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, color: 'var(--primary)' }} />
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Şirket</th>
                                <th>İletişim</th>
                                <th>Filo</th>
                                <th>Sözleşme Ücreti</th>
                                <th>Anlaşma Süresi</th>
                                <th>Kredi Bakiye</th>
                                <th>Kuruluş</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => openCompany(c)}>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.address || '—'}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: 13 }}>{c.contactEmail || '—'}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.contactPhone || '—'}</div>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)' }}>{c._count.vehicles}</span>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>araç</span>
                                    </td>
                                    <td>
                                        {c.contractFee
                                            ? <span style={{ fontWeight: 700, color: 'var(--success)' }}>₺{Number(c.contractFee).toLocaleString('tr-TR')}</span>
                                            : <span style={{ color: 'var(--text-muted)' }}>—</span>
                                        }
                                    </td>
                                    <td>
                                        {c.contractMonths
                                            ? <span>{c.contractMonths} ay</span>
                                            : <span style={{ color: 'var(--text-muted)' }}>—</span>
                                        }
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 700, color: (c.creditBalance || 0) > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                                            ₺{(c.creditBalance || 0).toLocaleString('tr-TR')}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                        {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td>
                                        <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }}
                                            onClick={(e) => { e.stopPropagation(); openCompany(c); }}>
                                            Detay →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                                    Şirket bulunamadı
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Detail Modal */}
            {selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                    onClick={() => setSelected(null)}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 900, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                        onClick={e => e.stopPropagation()}>

                        {/* Modal header */}
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>🏢 {selected.name}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{selected.address}</div>
                            </div>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
                            {(['overview', 'vehicles', 'transactions'] as const).map(tab => (
                                <button key={tab} onClick={() => setDetailTab(tab)} style={{
                                    padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
                                    fontSize: 14, fontWeight: detailTab === tab ? 700 : 400,
                                    color: detailTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                    borderBottom: detailTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                                    marginBottom: -1,
                                }}>
                                    {tab === 'overview' ? '📊 Genel Bakış' : tab === 'vehicles' ? `🚗 Araçlar (${vehicles.length})` : `📋 İşlemler (${transactions.length})`}
                                </button>
                            ))}
                        </div>

                        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
                            {detailLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                                    <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3, color: 'var(--primary)' }} />
                                </div>
                            ) : detailTab === 'overview' ? (
                                <div>
                                    <div className="grid grid-3" style={{ marginBottom: 24 }}>
                                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 16 }}>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Filo Büyüklüğü</div>
                                            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>{selected._count.vehicles}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>araç</div>
                                        </div>
                                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 16 }}>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Kredi Bakiye</div>
                                            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>₺{(selected.creditBalance || 0).toLocaleString('tr-TR')}</div>
                                        </div>
                                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 16 }}>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Aktif Anlaşma</div>
                                            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--warning)' }}>{selected._count.agreements}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {[
                                            ['Şirket Adı', selected.name],
                                            ['Sözleşme Ücreti', selected.contractFee ? `₺${Number(selected.contractFee).toLocaleString('tr-TR')}` : '—'],
                                            ['Anlaşma Süresi', selected.contractMonths ? `${selected.contractMonths} ay` : '—'],
                                            ['E-posta', selected.contactEmail || '—'],
                                            ['Telefon', selected.contactPhone || '—'],
                                            ['Adres', selected.address || '—'],
                                            ['Kayıt Tarihi', new Date(selected.createdAt).toLocaleDateString('tr-TR')],
                                        ].map(([label, value]) => (
                                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{label}</span>
                                                <span style={{ fontWeight: 600, fontSize: 14 }}>{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : detailTab === 'vehicles' ? (
                                <table className="table">
                                    <thead><tr><th>Plaka</th><th>Araç</th><th>Kredi Bakiye</th><th>İşlem</th><th>Ceza</th><th>Durum</th></tr></thead>
                                    <tbody>
                                        {vehicles.length === 0
                                            ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Araç yok</td></tr>
                                            : vehicles.map(v => (
                                                <tr key={v.id}>
                                                    <td><span style={{ fontWeight: 700, background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 6, fontSize: 13 }}>{v.plate}</span></td>
                                                    <td>{v.brand} {v.model} {v.year && `(${v.year})`}</td>
                                                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>₺{(v.creditBalance || 0).toLocaleString('tr-TR')}</td>
                                                    <td>{v._count?.transactions || 0} adet</td>
                                                    <td>{v._count?.penalties || 0} adet</td>
                                                    <td><span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: v.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', color: v.status === 'active' ? 'var(--success)' : 'var(--text-muted)' }}>{v.status === 'active' ? 'Aktif' : 'Pasif'}</span></td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            ) : (
                                <table className="table">
                                    <thead><tr><th>Tarih</th><th>Plaka</th><th>Servis</th><th>Hizmet</th><th>Kredi</th><th>Tutar</th><th>Durum</th></tr></thead>
                                    <tbody>
                                        {transactions.length === 0
                                            ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>İşlem yok</td></tr>
                                            : transactions.slice(0, 100).map(t => (
                                                <tr key={t.id}>
                                                    <td style={{ fontSize: 13 }}>{new Date(t.transactionDate).toLocaleDateString('tr-TR')}</td>
                                                    <td><span style={{ fontWeight: 700, background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{t.vehicle?.plate}</span></td>
                                                    <td style={{ fontSize: 13 }}>{t.serviceCenter?.name}</td>
                                                    <td style={{ fontSize: 13 }}>{t.serviceType}</td>
                                                    <td style={{ fontWeight: 700, color: 'var(--warning)' }}>₺{(t.creditAmount || 0).toLocaleString('tr-TR')}</td>
                                                    <td style={{ fontWeight: 700 }}>₺{(t.amount || 0).toLocaleString('tr-TR')}</td>
                                                    <td><span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: t.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: t.status === 'completed' ? 'var(--success)' : 'var(--warning)' }}>{t.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}</span></td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Company Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                    onClick={() => setShowAddModal(false)}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 480, padding: 28 }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>+ Yeni Şirket</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { label: 'Şirket Adı *', key: 'name', placeholder: 'Örn: Demo Lojistik A.Ş.' },
                                { label: 'Slug *', key: 'slug', placeholder: 'demo-lojistik' },
                                { label: 'Adres', key: 'address', placeholder: 'İstanbul' },
                                { label: 'E-posta', key: 'contactEmail', placeholder: 'info@sirket.com' },
                                { label: 'Telefon', key: 'contactPhone', placeholder: '0212 555 0000' },
                                { label: 'Sözleşme Ücreti (₺)', key: 'contractFee', placeholder: '5000' },
                                { label: 'Anlaşma Süresi (ay)', key: 'contractMonths', placeholder: '12' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>{f.label}</label>
                                    <input className="form-input" placeholder={f.placeholder} style={{ margin: 0 }}
                                        value={(newCompany as any)[f.key]}
                                        onChange={e => setNewCompany(p => ({ ...p, [f.key]: e.target.value }))} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>İptal</button>
                            <button className="btn btn-primary" onClick={addCompany} disabled={saving} style={{ flex: 1 }}>
                                {saving ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
