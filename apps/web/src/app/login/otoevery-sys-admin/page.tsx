'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SecretAdminLoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const res = await login({ email, password });
        if (res.success) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role === 'SUPER_ADMIN') {
                router.push('/admin');
            } else {
                setError('Bu sayfa yalnızca sistem yöneticilerine aittir.');
            }
        } else {
            setError('Kimlik doğrulama başarısız.');
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#050709',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, fontFamily: 'Inter, monospace',
        }}>
            <div style={{
                width: '100%', maxWidth: 380,
                background: '#0d1117',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: 36,
            }}>
                {/* Minimal logo */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{
                        width: 32, height: 32,
                        background: 'rgba(99,102,241,0.15)',
                        borderRadius: 8, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 13, fontWeight: 900,
                        color: '#6366f1', marginBottom: 12,
                    }}>⚙</div>
                    <div style={{ fontSize: 12, color: '#334155', letterSpacing: '0.1em' }}>SYSTEM ACCESS</div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>identifier</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                            style={{
                                padding: '10px 14px', background: '#080b14',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: 8, color: '#94a3b8', fontSize: 14,
                                fontFamily: 'monospace', outline: 'none',
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>credential</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPw ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    padding: '10px 44px 10px 14px', background: '#080b14',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: 8, color: '#94a3b8', fontSize: 14,
                                    fontFamily: 'monospace', outline: 'none', width: '100%',
                                }}
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)} style={{
                                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.4, color: '#94a3b8',
                            }}>
                                {showPw ? '🙈' : '👁'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            padding: '8px 12px', background: 'rgba(239,68,68,0.07)',
                            border: '1px solid rgba(239,68,68,0.15)',
                            borderRadius: 6, color: '#f87171', fontSize: 12, fontFamily: 'monospace',
                        }}>{error}</div>
                    )}

                    <button type="submit" disabled={loading} style={{
                        marginTop: 4, padding: '11px',
                        background: loading ? '#1a1d27' : 'rgba(99,102,241,0.15)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        borderRadius: 8, color: '#818cf8', fontSize: 13, fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'monospace',
                        transition: 'all 0.2s',
                    }}>
                        {loading ? 'authenticating...' : '→ authenticate'}
                    </button>
                </form>
            </div>
        </div>
    );
}
