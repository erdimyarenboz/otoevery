'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.otoevery.com.tr';

const plans = [
    {
        id: 'baslangic',
        name: 'Başlangıç',
        subtitle: 'Küçük İşletmeler İçin',
        target: '1 – 15 Araç',
        price: 299,
        priceLabel: '₺299',
        priceNote: '/ araç / ay',
        accessFee: null as null,
        badge: null as null,
        popular: false,
        accent: '#6366f1',
        features: [
            '📍 Gerçek Zamanlı GPS Takibi',
            '🗺️ Geçmiş Rota İzleme (30 Gün)',
            '⚠️ Temel Hız ve Rölanti Uyarıları',
            '📊 Günlük / Haftalık Özet Raporlar',
            '📧 Standart E-posta Desteği',
        ],
        cta: 'Hemen Başla',
        payable: true,
    },
    {
        id: 'profesyonel',
        name: 'Profesyonel',
        subtitle: 'Büyüyen İşletmeler İçin',
        target: '15 – 50 Araç',
        price: 499,
        priceLabel: '₺499',
        priceNote: '/ araç / ay',
        accessFee: '+ ₺999/ay sistem erişimi',
        badge: '🏆 En Popüler',
        popular: true,
        accent: '#818cf8',
        features: [
            '✅ Başlangıç Paketi\'nin Her Şeyi',
            '🤖 YZ Destekli Rota Optimizasyonu',
            '🧠 Gelişmiş Sürücü Davranış Analizi',
            '📱 Anlık SMS ve Mobil Bildirimler',
            '🔧 Araç Bakım ve Muayene Takvimi',
            '⭐ Öncelikli Destek',
        ],
        cta: 'Hemen Başla',
        payable: true,
    },
    {
        id: 'kurumsal',
        name: 'Kurumsal',
        subtitle: 'Büyük Filolar İçin',
        target: '50+ Araç',
        price: 0,
        priceLabel: 'Özel Teklif',
        priceNote: 'size özel fiyatlandırma',
        accessFee: null as null,
        badge: null as null,
        popular: false,
        accent: '#06b6d4',
        features: [
            '✅ Profesyonel Paketin Her Şeyi',
            '💾 Sınırsız Veri Saklama',
            '🔮 Öngörücü Bakım (YZ ile Arıza Tahmini)',
            '🔗 API Erişimi (ERP / CRM Entegrasyonu)',
            '👤 Özel Müşteri Yöneticisi',
            '🏷️ Beyaz Etiket (White-label) Seçeneği',
        ],
        cta: 'Bize Ulaşın',
        payable: false,
    },
];

// ── iyzico Checkout Modal ─────────────────────────────────
function IyzicoModal({ plan, onClose }: { plan: typeof plans[0]; onClose: () => void }) {
    const [step, setStep] = useState<'form' | 'checkout' | 'done'>('form');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [checkoutHtml, setCheckoutHtml] = useState('');
    const [form, setForm] = useState({
        name: '', surname: '', email: '', phone: '',
        company: '', vehicleCount: plan.id === 'baslangic' ? '5' : '20',
    });

    const totalAmount = plan.price * parseInt(form.vehicleCount || '1') + (plan.id === 'profesyonel' ? 999 : 0);

    const buildDoc = (html: string) => `<!DOCTYPE html><html lang="tr"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#fff}#iyzipay-checkout-form{width:100%}iframe{width:100%!important;border:none!important}</style>
  </head><body>${html}</body></html>`;

    const initiate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/v1/pricing/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: plan.id, vehicleCount: parseInt(form.vehicleCount), ...form }),
            });
            const data = await res.json();
            if (!data.success) { setError(data.message || 'Bir hata oluştu.'); setLoading(false); return; }
            setCheckoutHtml(data.data.checkoutFormContent);
            setStep('checkout');
        } catch {
            setError('Bağlantı hatası. Lütfen tekrar deneyin.');
        }
        setLoading(false);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{ background: '#13151e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, width: '100%', maxWidth: step === 'checkout' ? 560 : 500, position: 'relative', maxHeight: '94vh', overflowY: 'auto', animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
                {/* Close */}
                <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', zIndex: 1 }}>✕</button>

                {step === 'form' && (
                    <form onSubmit={initiate} style={{ padding: 32 }}>
                        {/* Header */}
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 100, background: `${plan.accent}22`, color: plan.accent, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>{plan.name} Paketi</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>Abonelik Başlat</div>
                        </div>

                        {/* Araç sayısı seçici */}
                        <label style={labelStyle}>Araç Sayısı *</label>
                        <input required type="number" min="1" max={plan.id === 'baslangic' ? 15 : 50}
                            value={form.vehicleCount} onChange={e => setForm({ ...form, vehicleCount: e.target.value })}
                            style={inputStyle} />
                        {/* Fiyat özeti */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#94a3b8' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span>Araç Başı</span><span style={{ color: plan.accent, fontWeight: 700 }}>₺{plan.price} × {form.vehicleCount || 1} araç = ₺{plan.price * parseInt(form.vehicleCount || '1')}</span>
                            </div>
                            {plan.id === 'profesyonel' && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>Sistem Erişimi</span><span>₺999</span></div>}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#f1f5f9', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 8, fontSize: 16 }}>
                                <span>Aylık Toplam</span><span style={{ color: plan.accent }}>₺{totalAmount.toLocaleString('tr-TR')}</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div><label style={labelStyle}>Ad *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ad" style={inputStyle} /></div>
                            <div><label style={labelStyle}>Soyad *</label><input required value={form.surname} onChange={e => setForm({ ...form, surname: e.target.value })} placeholder="Soyad" style={inputStyle} /></div>
                        </div>
                        <div style={{ marginBottom: 12 }}><label style={labelStyle}>E-posta *</label><input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ornek@sirket.com" style={inputStyle} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div><label style={labelStyle}>Telefon *</label><input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="05xx xxx xx xx" style={inputStyle} /></div>
                            <div><label style={labelStyle}>Şirket Adı</label><input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Şirket Adı" style={inputStyle} /></div>
                        </div>

                        {error && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 14 }}>{error}</div>}

                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? 'rgba(99,102,241,0.4)' : `linear-gradient(135deg, ${plan.accent}, #4f46e5)`, border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}>
                            {loading ? '⏳ Hazırlanıyor...' : `💳 ₺${totalAmount.toLocaleString('tr-TR')} — Ödemeye Geç`}
                        </button>
                        <div style={{ marginTop: 10, fontSize: 11, color: '#334155', textAlign: 'center' }}>🔒 iyzico güvenceli ödeme · İlk 30 gün ücretsiz deneme</div>
                    </form>
                )}

                {step === 'checkout' && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#0d0f1a' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <img src="https://www.iyzico.com/assets/images/iyzico_logo.png" alt="iyzico" style={{ height: 18 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                Güvenli Ödeme
                            </div>
                            <div style={{ fontSize: 13, color: '#818cf8', fontWeight: 700 }}>₺{totalAmount.toLocaleString('tr-TR')}</div>
                        </div>
                        <iframe
                            key={checkoutHtml}
                            srcDoc={buildDoc(checkoutHtml)}
                            style={{ width: '100%', height: 620, border: 'none', display: 'block' }}
                            sandbox="allow-scripts allow-forms allow-same-origin allow-top-navigation allow-popups allow-popups-to-escape-sandbox"
                            title="iyzico Ödeme Formu"
                            scrolling="yes"
                        />
                    </div>
                )}
            </div>
            <style>{`@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
        </div>
    );
}

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: '#64748b', display: 'block', marginBottom: 5 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, color: '#f1f5f9', fontFamily: 'inherit', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 0 };

// ── Pricing Section ───────────────────────────────────────
export default function PricingSection() {
    const [activePlan, setActivePlan] = useState<typeof plans[0] | null>(null);

    return (
        <>
            <section className="landing-section landing-section-alt" id="pricing">
                <div className="landing-container">
                    <div className="section-header">
                        <div className="section-badge">💰 Fiyatlandırma</div>
                        <h2 className="section-title">Filonuza Uygun Paketi Seçin</h2>
                        <p className="section-desc">Şeffaf fiyatlandırma. Gizli ücret yok. İstediğiniz zaman yükseltebilir veya iptal edebilirsiniz.</p>
                    </div>

                    <div className="pricing-grid">
                        {plans.map(plan => (
                            <div key={plan.id} className={`pricing-card${plan.popular ? ' pricing-card-popular' : ''}`}
                                style={{ '--accent': plan.accent } as React.CSSProperties}>
                                {plan.badge && <div className="pricing-popular-badge">{plan.badge}</div>}

                                <div className="pricing-card-header">
                                    <div className="pricing-target-pill">{plan.target}</div>
                                    <h3 className="pricing-plan-name">{plan.name}</h3>
                                    <p className="pricing-plan-subtitle">{plan.subtitle}</p>
                                </div>

                                <div className="pricing-price-block">
                                    <div className="pricing-price">
                                        <span className="pricing-price-amount" style={plan.price === 0 ? { fontSize: 28 } : {}}>{plan.priceLabel}</span>
                                        <span className="pricing-price-note">{plan.priceNote}</span>
                                    </div>
                                    {plan.accessFee && <div className="pricing-access-fee">{plan.accessFee}</div>}
                                </div>

                                <div className="pricing-divider" />

                                <ul className="pricing-features">
                                    {plan.features.map((f, i) => <li key={i} className="pricing-feature-item">{f}</li>)}
                                </ul>

                                <button
                                    className={`pricing-cta-btn${plan.popular ? ' pricing-cta-popular' : ''}`}
                                    style={plan.popular ? { background: `linear-gradient(135deg, ${plan.accent}, #4f46e5)` } : {}}
                                    onClick={() => {
                                        if (plan.payable) setActivePlan(plan);
                                        else document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    {plan.cta} {plan.payable && '→'}
                                </button>

                                {plan.payable && <p className="pricing-card-note">🔒 iyzico ile güvenli ödeme</p>}
                            </div>
                        ))}
                    </div>

                    <div className="pricing-trust-row">
                        {['✅ 30 Gün Ücretsiz Deneme', '🔒 iyzico Güvencesi', '↩️ İptal Garantisi', '📞 7/24 Destek'].map(t => (
                            <div key={t} className="pricing-trust-item">{t}</div>
                        ))}
                    </div>
                </div>
            </section>

            {activePlan && <IyzicoModal plan={activePlan} onClose={() => setActivePlan(null)} />}
        </>
    );
}
