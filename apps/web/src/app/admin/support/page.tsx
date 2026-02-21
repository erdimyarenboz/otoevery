'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Ticket {
    id: string;
    subject: string;
    message: string;
    category: string;
    status: string;
    adminReply?: string;
    closedAt?: string;
    createdAt: string;
    company: { id: string; name: string };
}

const CATEGORIES: Record<string, { label: string; color: string }> = {
    request: { label: '📋 Talep', color: '#6366f1' },
    suggestion: { label: '💡 Öneri', color: '#10b981' },
    complaint: { label: '⚠️ Şikayet', color: '#f59e0b' },
};
const STATUSES: Record<string, { label: string; color: string }> = {
    open: { label: 'Açık', color: '#ef4444' },
    in_progress: { label: 'İşlemde', color: '#f59e0b' },
    closed: { label: 'Kapatıldı', color: '#6b7280' },
};

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [selected, setSelected] = useState<Ticket | null>(null);
    const [reply, setReply] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadTickets(); }, [statusFilter]);

    const loadTickets = async () => {
        setLoading(true);
        const params = statusFilter ? `?status=${statusFilter}` : '';
        const res = await api.get(`/api/v1/admin/tickets${params}`);
        if (res.success) setTickets(res.data);
        setLoading(false);
    };

    const openTicket = (t: Ticket) => {
        setSelected(t);
        setReply(t.adminReply || '');
    };

    const resolve = async (status: string) => {
        if (!selected) return;
        setSaving(true);
        const body: any = { status };
        if (reply.trim()) body.adminReply = reply.trim();
        const res = await api.put(`/api/v1/admin/tickets/${selected.id}/resolve`, body);
        if (res.success) {
            setSelected(null);
            loadTickets();
        }
        setSaving(false);
    };

    const openCount = tickets.filter(t => t.status !== 'closed').length;

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">🎫 Destek Talepleri</div>
                    <div className="page-description">Şirketlerden gelen istek, öneri ve şikayetler</div>
                </div>
            </div>

            <div className="grid grid-4" style={{ marginBottom: 24 }}>
                {[
                    { icon: '🎫', value: tickets.length, label: 'Toplam', color: '#6366f1' },
                    { icon: '🔴', value: tickets.filter(t => t.status === 'open').length, label: 'Açık', color: '#ef4444' },
                    { icon: '⏳', value: tickets.filter(t => t.status === 'in_progress').length, label: 'İşlemde', color: '#f59e0b' },
                    { icon: '✅', value: tickets.filter(t => t.status === 'closed').length, label: 'Kapatıldı', color: '#10b981' },
                ].map(s => (
                    <div key={s.label} className="stat-card" style={{ '--stat-color': s.color, '--stat-color-bg': `${s.color}1a` } as React.CSSProperties}>
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Status filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {[{ val: '', label: 'Tümü' }, { val: 'open', label: '🔴 Açık' }, { val: 'in_progress', label: '⏳ İşlemde' }, { val: 'closed', label: '✅ Kapatıldı' }].map(f => (
                    <button key={f.val} onClick={() => setStatusFilter(f.val)} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: statusFilter === f.val ? 700 : 400, background: statusFilter === f.val ? 'var(--primary)' : 'var(--bg-secondary)', color: statusFilter === f.val ? '#fff' : 'var(--text-primary)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="card">
                {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" style={{ width: 28, height: 28, borderWidth: 3, color: 'var(--primary)' }} /></div>
                    : tickets.length === 0
                        ? <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                            <div style={{ fontWeight: 600 }}>Tüm talepler çözüldü</div>
                        </div>
                        : (
                            <table className="table">
                                <thead><tr><th>Şirket</th><th>Konu</th><th>Kategori</th><th>Durum</th><th>Tarih</th><th></th></tr></thead>
                                <tbody>
                                    {tickets.map(t => {
                                        const cat = CATEGORIES[t.category];
                                        const st = STATUSES[t.status];
                                        return (
                                            <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => openTicket(t)}>
                                                <td style={{ fontWeight: 700 }}>{t.company.name}</td>
                                                <td>
                                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.subject}</div>
                                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t.message.slice(0, 60)}{t.message.length > 60 ? '...' : ''}</div>
                                                </td>
                                                <td><span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100, background: `${cat?.color}18`, color: cat?.color, fontWeight: 600 }}>{cat?.label}</span></td>
                                                <td><span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100, background: `${st?.color}18`, color: st?.color, fontWeight: 600 }}>{st?.label}</span></td>
                                                <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleDateString('tr-TR')}</td>
                                                <td><button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }}>Yanıtla →</button></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
            </div>

            {/* Detail & Reply Modal */}
            {selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setSelected(null)}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 580, padding: 28 }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 800 }}>{selected.subject}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                                    {selected.company.name} · {CATEGORIES[selected.category]?.label} · {new Date(selected.createdAt).toLocaleDateString('tr-TR')}
                                </div>
                            </div>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
                        </div>

                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                            {selected.message}
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Yanıt (opsiyonel)</label>
                            <textarea className="form-input" style={{ margin: 0, minHeight: 100, resize: 'vertical' }} placeholder="Şirkete yanıt yazın..." value={reply} onChange={e => setReply(e.target.value)} />
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button className="btn btn-secondary" onClick={() => setSelected(null)} style={{ flex: 1 }}>İptal</button>
                            {selected.status !== 'in_progress' && (
                                <button onClick={() => resolve('in_progress')} disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                                    {saving ? '...' : '⏳ İşleme Al'}
                                </button>
                            )}
                            <button onClick={() => resolve('closed')} disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>
                                {saving ? 'Kaydediliyor...' : '✅ Kapat & Yanıtla'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
