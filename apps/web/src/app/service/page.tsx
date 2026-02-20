'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const TYPE_LABELS: Record<string, string> = {
    wash: '🧽 Yıkama',
    maintenance: '🔧 Bakım',
    tire: '🛞 Lastik',
    both: '⭐ Yıkama + Bakım + Lastik',
};

export default function ServiceDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [hakedis, setHakedis] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        api.get('/api/v1/service/stats').then(r => r.success && setStats(r.data));
        api.get('/api/v1/service/profile').then(r => r.success && setProfile(r.data));
        api.get('/api/v1/service/hakedis').then(r => r.success && setHakedis(r.data));
        api.get('/api/v1/service/transactions').then(r => r.success && setTransactions((r.data || []).slice(0, 5)));
    }, []);

    if (!stats) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, color: 'var(--primary)' }} /></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">{profile?.name || user?.serviceCenter?.name}</div>
                    <div className="page-description">Servis merkezi yönetim paneli</div>
                </div>
                <a href="/service/receive" className="btn btn-primary">📱 Ödeme Al</a>
            </div>

            {/* Hakediş Banner */}
            {hakedis && (
                <div className="card animate-fadeIn" style={{
                    marginBottom: 24,
                    background: hakedis.hakedis > 0
                        ? 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))'
                        : 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))',
                    border: hakedis.hakedis > 0
                        ? '1px solid rgba(245,158,11,0.3)'
                        : '1px solid rgba(16,185,129,0.3)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                                💰 Güncel Hakediş
                            </div>
                            <div style={{
                                fontSize: 32, fontWeight: 800, letterSpacing: -1,
                                color: hakedis.hakedis > 0 ? '#f59e0b' : 'var(--success)',
                            }}>
                                ₺{hakedis.hakedis.toLocaleString('tr-TR')}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                {hakedis.hakedis > 0
                                    ? 'Bu tutar ödeme bekliyor. Ödeme yapıldığında sıfırlanacaktır.'
                                    : '✅ Tüm hakedişleriniz ödenmiştir.'}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Toplam Ciro</div>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>₺{hakedis.totalRevenue.toLocaleString('tr-TR')}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Ödenen</div>
                                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--success)' }}>₺{hakedis.totalPaid.toLocaleString('tr-TR')}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>İşlem Sayısı</div>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>{hakedis.totalTransactions}</div>
                            </div>
                        </div>
                    </div>
                    {/* Payout history */}
                    {hakedis.payoutHistory && hakedis.payoutHistory.length > 0 && (
                        <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Son Ödemeler</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {hakedis.payoutHistory.slice(0, 3).map((p: any) => (
                                    <div key={p.id} style={{
                                        padding: '6px 12px', borderRadius: 'var(--radius-md)',
                                        background: 'var(--bg-secondary)', fontSize: 12,
                                    }}>
                                        <span style={{ fontWeight: 600, color: 'var(--success)' }}>₺{p.amount.toLocaleString('tr-TR')}</span>
                                        <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>
                                            {new Date(p.paidAt).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-4" style={{ marginBottom: 28 }}>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#10b981', '--stat-color-bg': 'rgba(16,185,129,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">💰</div>
                    <div className="stat-value">₺{stats.totalRevenue?.toLocaleString('tr-TR')}</div>
                    <div className="stat-label">Toplam Gelir</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#6366f1', '--stat-color-bg': 'rgba(99,102,241,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">💳</div>
                    <div className="stat-value">{stats.totalTransactions}</div>
                    <div className="stat-label">Toplam İşlem</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#f59e0b', '--stat-color-bg': 'rgba(245,158,11,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">📋</div>
                    <div className="stat-value">{stats.activeAgreements}</div>
                    <div className="stat-label">Aktif Anlaşma</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#06b6d4', '--stat-color-bg': 'rgba(6,182,212,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🏷️</div>
                    <div className="stat-value">{stats.activeQrCodes}</div>
                    <div className="stat-label">QR Kod</div>
                </div>
            </div>

            <div className="grid grid-2">
                {/* Profile Info */}
                <div className="card animate-fadeIn">
                    <div className="card-header">
                        <span className="card-title">🏪 İşletme Bilgileri</span>
                        <a href="/service/profile" style={{ fontSize: 13 }}>Düzenle →</a>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Hizmet Türü</span>
                            <span className="badge" style={{ background: 'var(--bg-elevated)' }}>{TYPE_LABELS[profile?.type] || profile?.type}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>📍 Adres</span>
                            <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{profile?.address || '—'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>📞 Telefon</span>
                            <span style={{ fontWeight: 500 }}>{profile?.phone || '—'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>🕐 Çalışma Saati</span>
                            <span style={{ fontWeight: 500 }}>{profile?.workingHours || 'Belirtilmemiş'}</span>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="card animate-fadeIn">
                    <div className="card-header">
                        <span className="card-title">💳 Son İşlemler</span>
                        <a href="/service/transactions" style={{ fontSize: 13 }}>Tümü →</a>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {transactions.map(t => (
                            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ fontSize: 20 }}>{t.type === 'wash' ? '🧽' : t.type?.includes('tire') ? '🛞' : '🔧'}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500 }}>{t.description}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {t.vehicle?.plate} • {new Date(t.transactionDate).toLocaleDateString('tr-TR')}
                                    </div>
                                </div>
                                <span style={{ fontWeight: 700, color: 'var(--success)' }}>+₺{t.amount?.toLocaleString('tr-TR')}</span>
                            </div>
                        ))}
                        {transactions.length === 0 && <div className="empty-state"><p>Henüz işlem yok</p></div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
