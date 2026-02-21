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
}

const CATEGORIES = {
    request: { label: '📋 Talep', color: '#6366f1' },
    suggestion: { label: '💡 Öneri', color: '#10b981' },
    complaint: { label: '⚠️ Şikayet', color: '#f59e0b' },
};

const STATUSES = {
    open: { label: 'Açık', color: '#ef4444' },
    in_progress: { label: 'İşlemde', color: '#f59e0b' },
    closed: { label: 'Kapatıldı', color: '#6b7280' },
};

export default function CompanySupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNew, setShowNew] = useState(false);
    const [selected, setSelected] = useState<Ticket | null>(null);
    const [form, setForm] = useState({ subject: '', message: '', category: 'request' });
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadTickets(); }, []);

    const loadTickets = async () => {
        setLoading(true);
        const res = await api.get('/api/v1/company/tickets');
        if (res.success) setTickets(res.data);
        setLoading(false);
    };

    const createTicket = async () => {
        if (!form.subject || !form.message) return;
        setSaving(true);
        const res = await api.post('/api/v1/company/tickets', form);
        if (res.success) {
            setShowNew(false);
            setForm({ subject: '', message: '', category: 'request' });
            loadTickets();
        }
        setSaving(false);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">🆘 Destek & Çağrı</div>
                    <div className="page-description">İstek, öneri ve şikayetlerinizi iletebilirsiniz</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ Yeni Çağrı</button>
            </div>

            <div className="grid grid-3" style={{ marginBottom: 24 }}>
                {[
                    { icon: '📋', value: tickets.filter(t => t.status !== 'closed').length, label: 'Açık Talep', color: '#6366f1' },
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

            <div className="card">
                {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" style={{ width: 28, height: 28, borderWidth: 3, color: 'var(--primary)' }} /></div>
                    : tickets.length === 0
                        ? <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>🎫</div>
                            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Henüz çağrı yok</div>
                            <div style={{ fontSize: 14 }}>Bir destek talebi oluşturmak için + Yeni Çağrı butonuna tıklayın.</div>
                        </div>
                        : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {tickets.map(t => {
                                    const cat = CATEGORIES[t.category as keyof typeof CATEGORIES];
                                    const st = STATUSES[t.status as keyof typeof STATUSES];
                                    return (
                                        <div key={t.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = '')}
                                            onClick={() => setSelected(t)}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{t.subject}</div>
                                                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{t.message.slice(0, 120)}{t.message.length > 120 ? '...' : ''}</div>
                                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 100, background: `${cat?.color}18`, color: cat?.color, fontWeight: 600 }}>{cat?.label}</span>
                                                        <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 100, background: `${st?.color}18`, color: st?.color, fontWeight: 600 }}>{st?.label}</span>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 16 }}>
                                                    {new Date(t.createdAt).toLocaleDateString('tr-TR')}
                                                </div>
                                            </div>
                                            {t.adminReply && (
                                                <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(99,102,241,0.07)', borderLeft: '3px solid var(--primary)', borderRadius: '0 8px 8px 0', fontSize: 13 }}>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4 }}>DESTEK YANITI</span>
                                                    {t.adminReply}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
            </div>

            {/* New Ticket Modal */}
            {showNew && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowNew(false)}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 500, padding: 28 }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>🆘 Yeni Çağrı Oluştur</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Kategori</label>
                                <select className="form-input" style={{ margin: 0 }} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                                    <option value="request">📋 Talep</option>
                                    <option value="suggestion">💡 Öneri</option>
                                    <option value="complaint">⚠️ Şikayet</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Konu *</label>
                                <input className="form-input" style={{ margin: 0 }} placeholder="Konuyu kısaca belirtin" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Mesaj *</label>
                                <textarea className="form-input" style={{ margin: 0, minHeight: 120, resize: 'vertical' }} placeholder="Detayları açıklayın..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                            <button className="btn btn-secondary" onClick={() => setShowNew(false)} style={{ flex: 1 }}>İptal</button>
                            <button className="btn btn-primary" onClick={createTicket} disabled={saving || !form.subject || !form.message} style={{ flex: 1 }}>{saving ? 'Gönderiliyor...' : 'Gönder'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setSelected(null)}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 560, padding: 28 }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 800 }}>{selected.subject}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                                    {CATEGORIES[selected.category as keyof typeof CATEGORIES]?.label} · {new Date(selected.createdAt).toLocaleDateString('tr-TR')}
                                </div>
                            </div>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
                        </div>
                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{selected.message}</div>
                        {selected.adminReply && (
                            <div style={{ padding: '12px 16px', background: 'rgba(99,102,241,0.07)', borderLeft: '3px solid var(--primary)', borderRadius: '0 8px 8px 0' }}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 6 }}>DESTEK YANITI</div>
                                <div style={{ fontSize: 14, lineHeight: 1.7 }}>{selected.adminReply}</div>
                            </div>
                        )}
                        {!selected.adminReply && (
                            <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                                ⏳ Henüz yanıt verilmedi. Ekibimiz en kısa sürede dönüş yapacak.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
