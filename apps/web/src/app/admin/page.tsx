'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        api.get('/api/v1/admin/stats').then(res => {
            if (res.success) setStats(res.data);
        });
    }, []);

    if (!stats) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, color: 'var(--primary)' }} /></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Platform Yönetimi</div>
                    <div className="page-description">Tüm platform istatistikleri</div>
                </div>
            </div>

            <div className="grid grid-4" style={{ marginBottom: 28 }}>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#6366f1', '--stat-color-bg': 'rgba(99,102,241,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🏢</div>
                    <div className="stat-value">{stats.companies}</div>
                    <div className="stat-label">Şirket</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#06b6d4', '--stat-color-bg': 'rgba(6,182,212,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🔧</div>
                    <div className="stat-value">{stats.serviceCenters}</div>
                    <div className="stat-label">Servis Merkezi</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#10b981', '--stat-color-bg': 'rgba(16,185,129,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">🚗</div>
                    <div className="stat-value">{stats.vehicles}</div>
                    <div className="stat-label">Araç</div>
                </div>
                <div className="stat-card animate-fadeIn" style={{ '--stat-color': '#f59e0b', '--stat-color-bg': 'rgba(245,158,11,0.1)' } as React.CSSProperties}>
                    <div className="stat-icon">👥</div>
                    <div className="stat-value">{stats.users}</div>
                    <div className="stat-label">Kullanıcı</div>
                </div>
            </div>

            <div className="grid grid-2">
                <div className="card animate-fadeIn">
                    <div className="card-header">
                        <span className="card-title">💰 Finansal Özet</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Toplam İşlem</span>
                            <span style={{ fontWeight: 700 }}>{stats.totalTransactions} adet</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Toplam Ciro</span>
                            <span style={{ fontWeight: 700, color: 'var(--success)' }}>₺{stats.totalTransactionAmount?.toLocaleString('tr-TR')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Toplam Ceza</span>
                            <span style={{ fontWeight: 700, color: 'var(--error)' }}>{stats.totalPenalties} adet</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Ceza Tutarı</span>
                            <span style={{ fontWeight: 700, color: 'var(--error)' }}>₺{stats.totalPenaltyAmount?.toLocaleString('tr-TR')}</span>
                        </div>
                    </div>
                </div>

                <div className="card animate-fadeIn">
                    <div className="card-header">
                        <span className="card-title">🔗 Hızlı Erişim</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <a href="/admin/companies" className="nav-item" style={{ textDecoration: 'none' }}>
                            <span className="nav-icon">🏢</span> Şirketleri Yönet
                        </a>
                        <a href="/admin/service-centers" className="nav-item" style={{ textDecoration: 'none' }}>
                            <span className="nav-icon">🔧</span> Servis Merkezlerini Yönet
                        </a>
                        <a href="/admin/users" className="nav-item" style={{ textDecoration: 'none' }}>
                            <span className="nav-icon">👥</span> Kullanıcıları Yönet
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
