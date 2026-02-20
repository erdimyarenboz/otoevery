'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type LoginMode = 'email' | 'plate';

const ROLE_REDIRECTS: Record<string, string> = {
    SUPER_ADMIN: '/admin',
    COMPANY_MANAGER: '/company',
    DRIVER: '/driver',
    SERVICE_CENTER: '/service',
};

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [mode, setMode] = useState<LoginMode>('email');
    const [email, setEmail] = useState('');
    const [plateNumber, setPlateNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const credentials = mode === 'email'
            ? { email, password }
            : { plateNumber, password };

        const res = await login(credentials);

        if (res.success) {
            // Redirect based on role
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const target = ROLE_REDIRECTS[user.role] || '/dashboard';
            router.push(target);
        } else {
            setError(res.message || 'Giriş başarısız');
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-logo">OE</div>
                <h1 className="login-title">OtoEvery</h1>
                <p className="login-subtitle">Filo Yönetim Platformu</p>

                {/* Tab Switcher */}
                <div className="login-tabs">
                    <button
                        className={`login-tab ${mode === 'email' ? 'active' : ''}`}
                        onClick={() => { setMode('email'); setError(''); }}
                        type="button"
                    >
                        📧 E-posta ile Giriş
                    </button>
                    <button
                        className={`login-tab ${mode === 'plate' ? 'active' : ''}`}
                        onClick={() => { setMode('plate'); setError(''); }}
                        type="button"
                    >
                        🚗 Plaka ile Giriş
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {mode === 'email' ? (
                        <div className="form-group">
                            <label className="form-label">E-posta Adresi</label>
                            <input
                                className="form-input"
                                type="email"
                                placeholder="ornek@sirket.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    ) : (
                        <div className="form-group">
                            <label className="form-label">Araç Plakası</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="34 ABC 123"
                                value={plateNumber}
                                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                                required
                                autoFocus
                                style={{ letterSpacing: '1px', fontWeight: 600 }}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Şifre</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="form-input"
                                type={showPw ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, opacity: 0.5,
                                }}
                            >
                                {showPw ? '🙈' : '👁'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            padding: '10px 14px', borderRadius: 'var(--radius-md)',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            color: '#ef4444', fontSize: 14, marginBottom: 16
                        }}>
                            {error}
                        </div>
                    )}

                    <button className="btn btn-primary" type="submit" disabled={loading}
                        style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 4 }}>
                        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>

                <div style={{
                    marginTop: 24, padding: '16px', borderRadius: 'var(--radius-md)',
                    background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', fontSize: 13
                }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>Demo Hesaplar</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--text-secondary)' }}>
                        <div>🔴 Admin: <b>admin@otoevery.com</b></div>
                        <div>🏢 Şirket: <b>yonetici@demolojistik.com</b></div>
                        <div>🚗 Sürücü: <b>34 ABC 123</b> (Plaka tab)</div>
                        <div>🔧 Servis: <b>temiz@otoevery.com</b></div>
                        <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>Tümü: <b>Demo123!</b></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
