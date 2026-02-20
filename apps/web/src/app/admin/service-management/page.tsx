'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface ServiceCenter {
    id: string;
    name: string;
    type: string;
    address: string | null;
    phone: string | null;
    contactEmail: string | null;
    iban: string | null;
    bankAccountName: string | null;
    bankName: string | null;
    paymentDay: number | null;
    isActive: boolean;
    _count: { agreements: number; transactions: number };
}

const TYPE_LABELS: Record<string, string> = {
    wash: '🧽 Yıkama',
    maintenance: '🔧 Bakım',
    tire: '🛞 Lastik',
    both: '⭐ Hepsi',
};

export default function AdminServiceCenters() {
    const [centers, setCenters] = useState<ServiceCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCenter, setSelectedCenter] = useState<ServiceCenter | null>(null);
    const [paymentDay, setPaymentDay] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const load = async () => {
        const res = await api.get('/api/v1/admin/service-centers');
        if (res.success) setCenters(res.data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleSetPaymentDay = async (centerId: string) => {
        const day = parseInt(paymentDay);
        if (!day || day < 1 || day > 28) {
            setMessage('❌ Ödeme günü 1-28 arasında olmalı');
            return;
        }
        setSaving(true);
        const res = await api.put(`/api/v1/admin/service-centers/${centerId}/payment-day`, { paymentDay: day });
        if (res.success) {
            setMessage(`✅ ${res.message}`);
            setCenters(prev => prev.map(c => c.id === centerId ? { ...c, paymentDay: day } : c));
            if (selectedCenter?.id === centerId) setSelectedCenter({ ...selectedCenter, paymentDay: day });
        } else {
            setMessage(`❌ ${res.message || 'Hata oluştu'}`);
        }
        setSaving(false);
        setTimeout(() => setMessage(''), 3000);
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">🏪 Servis Merkezleri Yönetimi</div>
                    <div className="page-description">Banka bilgileri ve ödeme günü yönetimi</div>
                </div>
            </div>

            {message && (
                <div style={{
                    padding: '12px 20px', borderRadius: 'var(--radius-md)', marginBottom: 20,
                    background: message.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${message.startsWith('✅') ? 'var(--success)' : 'var(--danger)'}`,
                    color: message.startsWith('✅') ? 'var(--success)' : 'var(--danger)',
                    fontWeight: 500, fontSize: 14,
                }}>
                    {message}
                </div>
            )}

            <div className="grid grid-2" style={{ gap: 24, alignItems: 'start' }}>
                {/* Left — Service Center List */}
                <div className="card animate-fadeIn">
                    <div className="card-header">
                        <span className="card-title">Servis Merkezleri ({centers.length})</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {centers.map(center => (
                            <button
                                key={center.id}
                                onClick={() => {
                                    setSelectedCenter(center);
                                    setPaymentDay(center.paymentDay?.toString() || '');
                                }}
                                style={{
                                    padding: '14px 16px',
                                    border: selectedCenter?.id === center.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    background: selectedCenter?.id === center.id ? 'rgba(99,102,241,0.08)' : 'var(--bg-secondary)',
                                    cursor: 'pointer', textAlign: 'left',
                                    fontFamily: 'inherit', transition: 'all 150ms ease',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{center.name}</span>
                                    <span className="badge" style={{ fontSize: 11 }}>{TYPE_LABELS[center.type] || center.type}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                                    <span>📄 {center._count?.agreements || 0} anlaşma</span>
                                    <span>💳 {center._count?.transactions || 0} işlem</span>
                                    {center.paymentDay && <span style={{ color: 'var(--primary)' }}>📅 Ayın {center.paymentDay}&apos;i</span>}
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 12 }}>
                                    {center.iban ? (
                                        <span style={{ color: 'var(--success)' }}>🏦 Banka bilgisi var</span>
                                    ) : (
                                        <span style={{ color: 'var(--warning)' }}>⚠️ Banka bilgisi yok</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right — Selected Center Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {selectedCenter ? (
                        <>
                            {/* Bank Info Card */}
                            <div className="card animate-fadeIn">
                                <div className="card-header">
                                    <span className="card-title">🏦 Banka Bilgileri — {selectedCenter.name}</span>
                                </div>

                                {selectedCenter.iban ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        <div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>IBAN</div>
                                            <div style={{
                                                fontFamily: 'monospace', fontSize: 15, fontWeight: 600, letterSpacing: 1,
                                                color: 'var(--text-primary)', padding: '10px 14px',
                                                background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
                                            }}>
                                                {selectedCenter.iban}
                                            </div>
                                        </div>
                                        <div className="grid grid-2" style={{ gap: 16 }}>
                                            <div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Alıcı Adı Soyadı</div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedCenter.bankAccountName || '—'}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Banka</div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedCenter.bankName || '—'}</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: '24px', textAlign: 'center', color: 'var(--text-muted)',
                                        background: 'rgba(245,158,11,0.05)', borderRadius: 'var(--radius-md)',
                                        border: '1px dashed var(--warning)',
                                    }}>
                                        <div style={{ fontSize: 32, marginBottom: 8 }}>🏦</div>
                                        <div style={{ fontWeight: 500 }}>Banka bilgisi henüz girilmemiş</div>
                                        <div style={{ fontSize: 12, marginTop: 4 }}>Servis merkezi profilinden banka bilgilerini girebilir</div>
                                    </div>
                                )}
                            </div>

                            {/* Payment Day Card */}
                            <div className="card animate-fadeIn">
                                <div className="card-header">
                                    <span className="card-title">📅 Ödeme Günü Belirle</span>
                                </div>

                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                                    Her ay hangi gün hakediş ödemesi yapılacağını belirleyin. Servis merkezi bu bilgiyi kendi panelinde görebilir.
                                </div>

                                {selectedCenter.paymentDay && (
                                    <div style={{
                                        padding: '10px 16px', borderRadius: 'var(--radius-md)', marginBottom: 16,
                                        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    }}>
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Mevcut ödeme günü:</span>
                                        <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>Her ayın {selectedCenter.paymentDay}&apos;i</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label className="form-label">Ödeme Günü (1-28)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            min={1}
                                            max={28}
                                            value={paymentDay}
                                            onChange={e => setPaymentDay(e.target.value)}
                                            placeholder="Örn: 15"
                                        />
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleSetPaymentDay(selectedCenter.id)}
                                        disabled={saving}
                                        style={{ minWidth: 120, height: 42 }}
                                    >
                                        {saving ? '⏳...' : '💾 Kaydet'}
                                    </button>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="card animate-fadeIn">
                                <div className="card-header">
                                    <span className="card-title">📋 İletişim Bilgileri</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <span style={{ color: 'var(--text-muted)', width: 80 }}>📍 Adres:</span>
                                        <span>{selectedCenter.address || '—'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <span style={{ color: 'var(--text-muted)', width: 80 }}>📞 Telefon:</span>
                                        <span>{selectedCenter.phone || '—'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <span style={{ color: 'var(--text-muted)', width: 80 }}>📧 E-posta:</span>
                                        <span>{selectedCenter.contactEmail || '—'}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="card animate-fadeIn" style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>👈</div>
                            <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-secondary)' }}>
                                Servis merkezi seçin
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                                Sol listeden bir servis merkezi seçerek banka bilgilerini görüntüleyin ve ödeme gününü belirleyin
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
