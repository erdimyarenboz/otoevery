'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.otoevery.com.tr';

export default function IndividualRegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPw, setShowPw] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/v1/individual/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!data.success) { setError(data.message); setLoading(false); return; }
            localStorage.setItem('individual_token', data.data.token);
            localStorage.setItem('individual_user', JSON.stringify(data.data.user));
            router.push('/individual/dashboard?welcome=1');
        } catch {
            setError('Bağlantı hatası. Tekrar deneyin.');
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            {/* Background glow */}
            <div style={{ position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', filter: 'blur(80px)', top: '20%', left: '30%', pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#fff' }}>OE</div>
                            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>OtoEvery</span>
                        </div>
                    </Link>
                    <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Bireysel Hesap Oluştur</div>
                        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>OtoEvery avantajlı dünyasına katılın</div>
                    </div>
                </div>

                {/* Card */}
                <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32 }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                            {[
                                { key: 'firstName', label: 'Ad', placeholder: 'Ahmet' },
                                { key: 'lastName', label: 'Soyad', placeholder: 'Yılmaz' },
                            ].map(f => (
                                <div key={f.key} style={{ flex: 1 }}>
                                    <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                                    <input
                                        required
                                        placeholder={f.placeholder}
                                        value={(form as any)[f.key]}
                                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                        style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            ))}
                        </div>

                        {[
                            { key: 'email', label: 'E-posta', placeholder: 'ahmet@example.com', type: 'email' },
                            { key: 'phone', label: 'Telefon', placeholder: '0532 000 00 00', type: 'tel' },
                        ].map(f => (
                            <div key={f.key} style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                                <input
                                    required
                                    type={f.type}
                                    placeholder={f.placeholder}
                                    value={(form as any)[f.key]}
                                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                        ))}

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 6 }}>Şifre</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    required
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="En az 6 karakter"
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    style={{ width: '100%', padding: '12px 44px 12px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.5 }}>
                                    {showPw ? '🙈' : '👁'}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: 14 }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ width: '100%', padding: '14px', background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                        >
                            {loading ? '⏳ Kayıt oluşturuluyor...' : '🚀 Hesabımı Oluştur'}
                        </button>
                    </form>

                    <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                        Zaten hesabın var mı?{' '}
                        <Link href="/login/individual" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Giriş Yap</Link>
                    </div>
                </div>

                {/* Back link */}
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none' }}>← Ana Sayfaya Dön</Link>
                </div>
            </div>
        </div>
    );
}
