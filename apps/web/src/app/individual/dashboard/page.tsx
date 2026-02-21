'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.otoevery.com.tr';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    creditBalance: number;
}

interface Payment {
    id: string;
    amount: number;
    creditAmount: number;
    status: string;
    createdAt: string;
}

function DashboardContent() {
    const router = useRouter();
    const params = useSearchParams();
    const [user, setUser] = useState<User | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState(500);
    const [customAmount, setCustomAmount] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [iyzicoPanelOpen, setIyzicoPanelOpen] = useState(false);
    const [checkoutContent, setCheckoutContent] = useState('');

    // Build full HTML doc for iframe srcDoc — ensures scripts execute
    const buildIyzicoDoc = (content: string) => `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #fff; }
    #iyzipay-checkout-form { width: 100%; }
    iframe { width: 100% !important; border: none !important; }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;


    const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 5000);
    };

    const token = typeof window !== 'undefined' ? localStorage.getItem('individual_token') : null;

    useEffect(() => {
        if (!token) { router.push('/login/individual'); return; }
        loadData();

        // Check payment result from URL
        const paymentResult = params.get('payment');
        if (paymentResult === 'success') {
            const amt = params.get('amount');
            showToast(`✅ ₺${Number(amt).toLocaleString('tr-TR')} kredi başarıyla yüklendi!`, 'success');
        } else if (paymentResult === 'failed') {
            showToast('❌ Ödeme başarısız veya iptal edildi.', 'error');
        } else if (paymentResult === 'already') {
            showToast('ℹ️ Bu ödeme zaten işlendi.', 'info');
        }
        if (params.get('welcome') === '1') {
            showToast('🎉 OtoEvery\'e hoş geldiniz! Kredi yükleyerek başlayabilirsiniz.', 'success');
        }
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [uRes, pRes] = await Promise.all([
            fetch(`${API_URL}/api/v1/individual/me`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_URL}/api/v1/individual/payment/history`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const uData = await uRes.json();
        const pData = await pRes.json();
        if (!uData.success) { router.push('/login/individual'); return; }
        setUser(uData.data);
        if (pData.success) setPayments(pData.data);
        setLoading(false);
    };

    const initiatePayment = async () => {
        const finalAmount = customAmount ? parseFloat(customAmount) : amount;
        if (finalAmount < 500) { showToast('Minimum kredi yükleme tutarı 500₺', 'error'); return; }

        setPaymentLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/v1/individual/payment/initiate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ amount: finalAmount }),
            });
            const data = await res.json();
            if (!data.success) { showToast(data.message || 'Ödeme başlatılamadı', 'error'); setPaymentLoading(false); return; }

            // Set iyzico checkout form content and open panel
            setCheckoutContent(data.data.checkoutFormContent);
            setIyzicoPanelOpen(true);
            setPaymentLoading(false);
        } catch (err) {
            showToast('Bağlantı hatası', 'error');
            setPaymentLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('individual_token');
        localStorage.removeItem('individual_user');
        router.push('/');
    };

    const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0d0d1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    const totalLoaded = payments.filter(p => p.status === 'success').reduce((s, p) => s + p.creditAmount, 0);

    return (
        <div style={{ minHeight: '100vh', background: '#0d0d1a', color: '#fff', fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '14px 20px', borderRadius: 12, background: toast.type === 'success' ? 'rgba(16,185,129,0.9)' : toast.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(99,102,241,0.9)', backdropFilter: 'blur(10px)', color: '#fff', fontWeight: 600, fontSize: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', maxWidth: 360 }}>
                    {toast.msg}
                </div>
            )}

            {/* iyzico Payment Overlay — iframe srcDoc for reliable script execution */}
            {iyzicoPanelOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.80)' }}>
                    <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 540, boxShadow: '0 32px 80px rgba(0,0,0,0.5)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '95vh' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: '#111' }}>
                                <img src="https://www.iyzico.com/assets/images/iyzico_logo.png" alt="iyzico" style={{ height: 20, objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                Güvenli Ödeme
                            </div>
                            <button onClick={() => setIyzicoPanelOpen(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#666', lineHeight: 1, padding: '0 4px' }}>×</button>
                        </div>
                        {/* iyzico form inside iframe */}
                        <iframe
                            key={checkoutContent}
                            srcDoc={buildIyzicoDoc(checkoutContent)}
                            style={{ width: '100%', height: 620, border: 'none', flexShrink: 0 }}
                            sandbox="allow-scripts allow-forms allow-same-origin allow-top-navigation allow-popups allow-popups-to-escape-sandbox"
                            title="iyzico Ödeme Formu"
                            scrolling="yes"
                        />
                    </div>
                </div>
            )}


            {/* Header */}
            <header style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: '#fff' }}>OE</div>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>OtoEvery</span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>👤 {user?.firstName} {user?.lastName}</span>
                    <button onClick={logout} style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}>Çıkış</button>
                </div>
            </header>

            <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
                {/* Balance Hero Card */}
                <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 24, padding: 32, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', filter: 'blur(60px)', top: -100, right: -50, pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>Kredi Bakiyeniz</div>
                        <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 8 }}>
                            ₺{(user?.creditBalance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Toplam yüklenen: ₺{totalLoaded.toLocaleString('tr-TR')}</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                    {/* Load Credit Card */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>💳</span> Kredi Yükle
                        </div>

                        {/* Quick amounts */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                            {QUICK_AMOUNTS.map(a => (
                                <button key={a} onClick={() => { setAmount(a); setCustomAmount(''); }}
                                    style={{ padding: '10px', borderRadius: 10, border: amount === a && !customAmount ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', background: amount === a && !customAmount ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', color: amount === a && !customAmount ? '#818cf8' : 'rgba(255,255,255,0.7)', cursor: 'pointer', fontWeight: amount === a && !customAmount ? 700 : 400, fontSize: 15 }}>
                                    ₺{a.toLocaleString('tr-TR')}
                                </button>
                            ))}
                        </div>

                        {/* Custom amount */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Özel tutar (min. ₺500)</label>
                            <input
                                type="number"
                                min="500"
                                placeholder="₺ tutar girin"
                                value={customAmount}
                                onChange={e => setCustomAmount(e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>

                        <button
                            onClick={initiatePayment}
                            disabled={paymentLoading}
                            style={{ width: '100%', padding: '14px', background: paymentLoading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: paymentLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                            {paymentLoading ? '⏳ Yükleniyor...' : `💳 ₺${(customAmount ? parseFloat(customAmount) : amount).toLocaleString('tr-TR')} Kredi Yükle`}
                        </button>

                        <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                            🔒 Güvenli ödeme — iyzico altyapısı
                        </div>
                    </div>

                    {/* Info Card */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>⚡ OtoEvery Avantajları</div>
                        {[
                            ['🔧', 'Anlaşmalı Servisler', 'Türkiye genelinde 1000+ servis ve yıkama'],
                            ['💳', 'Kredi Sistemi', 'Yüklediğin krediyle tüm servislerde ödeme'],
                            ['📱', 'QR ile Ödeme', 'Serviste QR okutarak anında öde'],
                            ['📊', 'Harcama Takibi', 'Tüm işlemlerin burada görünsün'],
                        ].map(([icon, title, desc]) => (
                            <div key={title} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                                <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{icon}</div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{title}</div>
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment History */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📋 Ödeme Geçmişi</div>
                    {payments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                            Henüz ödeme yapılmadı.<br />
                            <span style={{ fontSize: 12 }}>İlk kredinizi yüklemek için yukarıyı kullanın.</span>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Tarih', 'Tutar', 'Kredi', 'Durum'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(p => (
                                    <tr key={p.id}>
                                        <td style={{ padding: '12px 12px', fontSize: 13, color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            {new Date(p.createdAt).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td style={{ padding: '12px 12px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>₺{p.amount.toLocaleString('tr-TR')}</td>
                                        <td style={{ padding: '12px 12px', fontWeight: 700, color: '#10b981', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>+₺{p.creditAmount.toLocaleString('tr-TR')}</td>
                                        <td style={{ padding: '12px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: p.status === 'success' ? 'rgba(16,185,129,0.15)' : p.status === 'pending' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', color: p.status === 'success' ? '#10b981' : p.status === 'pending' ? '#f59e0b' : '#ef4444' }}>
                                                {p.status === 'success' ? '✓ Başarılı' : p.status === 'pending' ? '⏳ Bekliyor' : '✗ Başarısız'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                input::placeholder { color: rgba(255,255,255,0.25); }
                input[type=number] { -moz-appearance: textfield; }
                input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
            `}</style>
        </div>
    );
}

export default function IndividualDashboardPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0d0d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Yükleniyor...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
