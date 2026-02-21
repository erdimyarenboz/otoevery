'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface IndividualUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    creditBalance: number;
    isActive: boolean;
    createdAt: string;
    individualPayments: { amount: number; creditAmount: number; createdAt: string }[];
}

export default function AdminIndividualUsersPage() {
    const [users, setUsers] = useState<IndividualUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        const res = await api.get('/api/v1/admin/individual-users');
        if (res.success) setUsers(res.data);
        setLoading(false);
    };

    const filtered = users.filter(u =>
        `${u.firstName} ${u.lastName} ${u.email} ${u.phone}`.toLowerCase().includes(search.toLowerCase())
    );

    const totalUsers = users.length;
    const totalCredit = users.reduce((s, u) => s + (u.creditBalance || 0), 0);
    const totalRevenue = users.reduce((s, u) => s + u.individualPayments.reduce((ps, p) => ps + p.amount, 0), 0);
    const activeUsers = users.filter(u => u.isActive).length;

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">👤 Bireysel Kullanıcılar</div>
                    <div className="page-description">OtoEvery avantajlı dünyasına katılan bireysel üyeler</div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-4" style={{ marginBottom: 24 }}>
                {[
                    { icon: '👤', value: totalUsers, label: 'Toplam Üye', color: '#6366f1' },
                    { icon: '✅', value: activeUsers, label: 'Aktif', color: '#10b981' },
                    { icon: '💳', value: `₺${totalCredit.toLocaleString('tr-TR')}`, label: 'Toplam Bakiye', color: '#f59e0b' },
                    { icon: '💰', value: `₺${totalRevenue.toLocaleString('tr-TR')}`, label: 'Toplam Gelir', color: '#06b6d4' },
                ].map(s => (
                    <div key={s.label} className="stat-card" style={{ '--stat-color': s.color, '--stat-color-bg': `${s.color}1a` } as React.CSSProperties}>
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }}>
                <input className="form-input" placeholder="🔍 İsim, e-posta veya telefon ara..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    style={{ margin: 0, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, width: '100%', color: 'var(--text-primary)' }} />
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, color: 'var(--primary)' }} />
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Kullanıcı</th>
                                <th>İletişim</th>
                                <th>Kredi Bakiye</th>
                                <th>Toplam Ödeme</th>
                                <th>Ödeme Sayısı</th>
                                <th>Kayıt Tarihi</th>
                                <th>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => {
                                const totalPaid = u.individualPayments.reduce((s, p) => s + p.amount, 0);
                                return (
                                    <tr key={u.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{u.id.slice(0, 8)}...</div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: 13 }}>📧 {u.email}</div>
                                            {u.phone && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📞 {u.phone}</div>}
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 700, fontSize: 16, color: (u.creditBalance || 0) > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                                                ₺{(u.creditBalance || 0).toLocaleString('tr-TR')}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 700 }}>₺{totalPaid.toLocaleString('tr-TR')}</td>
                                        <td>
                                            <span style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '2px 10px', borderRadius: 100, fontSize: 13, fontWeight: 600 }}>
                                                {u.individualPayments.length} ödeme
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                            {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td>
                                            <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: u.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', color: u.isActive ? 'var(--success)' : 'var(--text-muted)' }}>
                                                {u.isActive ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                                    {search ? 'Kullanıcı bulunamadı' : 'Henüz bireysel kullanıcı yok'}
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
