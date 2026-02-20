'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function DriverPayPage() {
    const [qrCode, setQrCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handlePay = async () => {
        if (!qrCode.trim()) return;
        setLoading(true);
        setError('');
        setResult(null);

        const res = await api.post('/api/v1/driver/pay', { qrCode: qrCode.trim() });

        if (res.success) {
            setResult(res.data);
            setQrCode('');
        } else {
            setError(res.message || 'Ödeme başarısız');
        }
        setLoading(false);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">QR ile Ödeme</div>
                    <div className="page-description">Servis merkezinin QR kodunu girerek ödeme yapın</div>
                </div>
            </div>

            <div className="grid grid-2">
                {/* QR Input */}
                <div className="card animate-fadeIn">
                    <div className="card-header">
                        <span className="card-title">📱 QR Kod Girişi</span>
                    </div>

                    <div className="form-group" style={{ marginBottom: 20 }}>
                        <label className="form-label">QR Kod</label>
                        <input
                            className="form-input"
                            type="text"
                            placeholder="QR-TEMIZ-DIS-001"
                            value={qrCode}
                            onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                            style={{ fontSize: 16, padding: '14px 16px', letterSpacing: '1px', fontWeight: 600 }}
                        />
                    </div>

                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: 16 }}>
                            ❌ {error}
                        </div>
                    )}

                    <button className="btn btn-primary btn-lg" onClick={handlePay} disabled={loading || !qrCode.trim()} style={{ width: '100%' }}>
                        {loading ? 'İşleniyor...' : '💳 Ödeme Yap'}
                    </button>

                    {/* Demo QR Codes */}
                    <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Demo QR Kodları:</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                            {['QR-TEMIZ-DIS-001 (Dış Yıkama — 150₺)', 'QR-TEMIZ-IC-002 (İç+Dış — 300₺)', 'QR-HIZLI-YAG-001 (Yağ Değişimi — 1200₺)'].map(qr => (
                                <button
                                    key={qr}
                                    onClick={() => setQrCode(qr.split(' ')[0])}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary-light)', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontFamily: 'inherit' }}
                                >
                                    {qr}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Result */}
                <div className="card animate-fadeIn">
                    <div className="card-header">
                        <span className="card-title">Ödeme Sonucu</span>
                    </div>

                    {result ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Ödeme Başarılı!</div>
                            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>{result.transaction?.description}</div>
                            <div style={{ display: 'grid', gap: 12, textAlign: 'left', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Servis</span>
                                    <span style={{ fontWeight: 600 }}>{result.transaction?.serviceCenter?.name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Plaka</span>
                                    <span style={{ fontWeight: 600 }}>{result.transaction?.vehicle?.plate}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Normal Fiyat</span>
                                    <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>₺{result.originalAmount}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>İndirim</span>
                                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>%{result.discountRate}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                                    <span style={{ fontWeight: 700, fontSize: 16 }}>Ödenen</span>
                                    <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--primary-light)' }}>₺{result.discountedAmount?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📱</div>
                            <h3>QR kod girin</h3>
                            <p>Servis merkezinin QR kodunu girerek ödeme yapabilirsiniz</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
