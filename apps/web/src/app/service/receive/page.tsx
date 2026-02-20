'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

const SERVICE_TYPES = [
    { key: 'wash', label: '🧽 Yıkama', color: '#3b82f6' },
    { key: 'maintenance', label: '🔧 Bakım', color: '#10b981' },
    { key: 'tire', label: '🛞 Lastik', color: '#f59e0b' },
];

export default function ServiceReceivePage() {
    const [plate, setPlate] = useState('');
    const [serviceType, setServiceType] = useState('');
    const [amount, setAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!plate || !serviceType || !amount) return;

        setSubmitting(true);
        setError('');
        setResult(null);

        const res = await api.post('/api/v1/service/use-credit', {
            vehiclePlate: plate.toUpperCase().trim(),
            serviceType,
            amount: Number(amount),
        });

        setSubmitting(false);

        if (res.success) {
            setResult(res);
            // Reset form
            setPlate('');
            setServiceType('');
            setAmount('');
        } else {
            setError(res.message || 'İşlem başarısız');
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">💳 Kredi ile Ödeme Al</div>
                    <div className="page-description">Araç plakası girerek kredi bakiyesinden hizmet ödemesi alın</div>
                </div>
                <a href="/service" className="btn" style={{ background: 'var(--bg-secondary)', color: 'var(--text)' }}>← Dashboard</a>
            </div>

            {/* Success */}
            {result && (
                <div className="card animate-fadeIn" style={{
                    marginBottom: 24, padding: 24,
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))',
                    border: '1px solid rgba(16,185,129,0.3)',
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>{result.message}</div>
                        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                            Kalan bakiye: ₺{result.data?.remainingBalance?.toLocaleString('tr-TR') || 0}
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="card animate-fadeIn" style={{
                    marginBottom: 24, padding: 24,
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))',
                    border: '1px solid rgba(239,68,68,0.3)',
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#ef4444' }}>{error}</div>
                    </div>
                </div>
            )}

            {/* Form */}
            <div className="card animate-fadeIn" style={{ maxWidth: 520, margin: '0 auto' }}>
                <div className="card-header">
                    <span className="card-title">Ödeme Bilgileri</span>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Plate */}
                    <div>
                        <label className="form-label">Araç Plakası</label>
                        <input
                            type="text"
                            className="form-input"
                            value={plate}
                            onChange={e => setPlate(e.target.value.toUpperCase())}
                            placeholder="34 ABC 1234"
                            style={{ fontSize: 18, fontWeight: 700, textAlign: 'center', letterSpacing: 1 }}
                            required
                        />
                    </div>

                    {/* Service Type */}
                    <div>
                        <label className="form-label">Hizmet Türü</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                            {SERVICE_TYPES.map(st => (
                                <button
                                    key={st.key}
                                    type="button"
                                    onClick={() => setServiceType(st.key)}
                                    style={{
                                        padding: '16px 8px',
                                        borderRadius: 'var(--radius-lg)',
                                        border: serviceType === st.key ? `2px solid ${st.color}` : '2px solid var(--border)',
                                        background: serviceType === st.key ? `${st.color}15` : 'var(--bg-secondary)',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        fontSize: 14,
                                        fontWeight: serviceType === st.key ? 700 : 500,
                                        color: serviceType === st.key ? st.color : 'var(--text)',
                                        transition: 'all 200ms ease',
                                    }}
                                >
                                    <div style={{ fontSize: 24, marginBottom: 4 }}>{st.label.split(' ')[0]}</div>
                                    {st.label.split(' ')[1]}
                                </button>
                            ))}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
                            Her araç günde 1 yıkama, 1 bakım, 1 lastik hizmeti kullanabilir
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="form-label">Tutar (₺)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="Hizmet tutarı"
                            min="1"
                            step="1"
                            style={{ fontSize: 18, fontWeight: 600, textAlign: 'center' }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting || !plate || !serviceType || !amount}
                        style={{ width: '100%', padding: '14px 0', fontSize: 16, fontWeight: 700 }}
                    >
                        {submitting ? '⏳ İşleniyor...' : '💰 Ödeme Al'}
                    </button>
                </form>
            </div>
        </div>
    );
}
