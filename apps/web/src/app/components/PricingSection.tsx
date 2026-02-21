'use client';

import { useState } from 'react';

interface Plan {
    id: string;
    name: string;
    subtitle: string;
    target: string;
    price: string | null;
    priceNote: string;
    period: string | null;
    accessFee: string | null;
    badge: string | null;
    popular: boolean;
    color: string;
    accentColor: string;
    features: string[];
    cta: string;
    ctaHref: string;
    paymentEnabled: boolean;
}

const plans: Plan[] = [
    {
        id: 'baslangic',
        name: 'Başlangıç',
        subtitle: 'Küçük İşletmeler İçin',
        target: '1 – 15 Araç',
        price: '₺299',
        priceNote: 'araç / ay',
        period: 'aylık',
        accessFee: null,
        badge: null,
        popular: false,
        color: 'rgba(99,102,241,0.08)',
        accentColor: '#6366f1',
        features: [
            '📍 Gerçek Zamanlı GPS Takibi',
            '🗺️ Geçmiş Rota İzleme (30 Gün)',
            '⚠️ Temel Hız ve Rölanti Uyarıları',
            '📊 Günlük / Haftalık Özet Raporlar',
            '📧 Standart E-posta Desteği',
        ],
        cta: 'Hemen Başla',
        ctaHref: '#contact',
        paymentEnabled: true,
    },
    {
        id: 'profesyonel',
        name: 'Profesyonel',
        subtitle: 'Büyüyen İşletmeler İçin',
        target: '15 – 50 Araç',
        price: '₺499',
        priceNote: 'araç / ay',
        period: 'aylık',
        accessFee: '+ ₺999 / ay sistem erişim bedeli',
        badge: '🏆 En Popüler',
        popular: true,
        color: 'rgba(99,102,241,0.14)',
        accentColor: '#818cf8',
        features: [
            '✅ Başlangıç Paketi\'ndeki Her Şey',
            '🤖 Yapay Zeka Destekli Rota Optimizasyonu',
            '🧠 Gelişmiş Sürücü Davranış Analizi',
            '📱 Anlık SMS ve Mobil Bildirimler',
            '🔧 Araç Bakım ve Muayene Takvimi',
            '⭐ Öncelikli Destek',
        ],
        cta: 'Hemen Başla',
        ctaHref: '#contact',
        paymentEnabled: true,
    },
    {
        id: 'kurumsal',
        name: 'Kurumsal',
        subtitle: 'Büyük Filolar İçin',
        target: '50+ Araç',
        price: null,
        priceNote: 'Özel teklif',
        period: null,
        accessFee: null,
        badge: null,
        popular: false,
        color: 'rgba(6,182,212,0.06)',
        accentColor: '#06b6d4',
        features: [
            '✅ Profesyonel Paket\'teki Her Şey',
            '💾 Sınırsız Veri Saklama',
            '🔮 Öngörücü Bakım (YZ ile Arıza Tahmini)',
            '🔗 API Erişimi (ERP / CRM Entegrasyonu)',
            '👤 Özel Müşteri Yöneticisi',
            '🏷️ Beyaz Etiket (White-label) Seçeneği',
        ],
        cta: 'Bize Ulaşın',
        ctaHref: '#contact',
        paymentEnabled: false,
    },
];

// iyzico checkout modal (for payable plans)
function IyzicoCheckoutModal({
    plan,
    onClose,
}: {
    plan: Plan;
    onClose: () => void;
}) {
    const [step, setStep] = useState<'summary' | 'form' | 'success'>('summary');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        vehicleCount: '',
        cardNumber: '',
        cardHolder: '',
        expiry: '',
        cvv: '',
    });

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // In production, call the iyzico API via your backend here
        await new Promise((r) => setTimeout(r, 1800));
        setLoading(false);
        setStep('success');
    };

    return (
        <div className="pricing-modal-overlay" onClick={onClose}>
            <div className="pricing-modal" onClick={(e) => e.stopPropagation()}>
                <button className="pricing-modal-close" onClick={onClose}>✕</button>

                {step === 'summary' && (
                    <>
                        <div className="pricing-modal-header">
                            <div className="pricing-modal-badge" style={{ background: `${plan.accentColor}22`, color: plan.accentColor }}>
                                {plan.name} Paketi
                            </div>
                            <h3 className="pricing-modal-title">Abonelik Özeti</h3>
                        </div>
                        <div className="pricing-modal-summary">
                            <div className="pricing-modal-row">
                                <span>Plan</span>
                                <span>{plan.name}</span>
                            </div>
                            <div className="pricing-modal-row">
                                <span>Araç Başı Ücret</span>
                                <span style={{ color: plan.accentColor, fontWeight: 700 }}>{plan.price} / araç / ay</span>
                            </div>
                            {plan.accessFee && (
                                <div className="pricing-modal-row">
                                    <span>Sistem Erişim Bedeli</span>
                                    <span>₺999 / ay</span>
                                </div>
                            )}
                            <div className="pricing-modal-row pricing-modal-total">
                                <span>Ödeme Güvencesi</span>
                                <span>🔒 iyzico</span>
                            </div>
                        </div>
                        <button className="pricing-pay-btn" style={{ background: `linear-gradient(135deg, ${plan.accentColor}, #4f46e5)` }} onClick={() => setStep('form')}>
                            Ödemeye Geç →
                        </button>
                        <p className="pricing-modal-note">İlk 30 gün ücretsiz. İstediğiniz zaman iptal edebilirsiniz.</p>
                    </>
                )}

                {step === 'form' && (
                    <>
                        <div className="pricing-modal-header">
                            <h3 className="pricing-modal-title">Bilgilerinizi Girin</h3>
                        </div>
                        <form className="pricing-pay-form" onSubmit={handlePay}>
                            <div className="pricing-form-row">
                                <div className="pricing-form-group">
                                    <label>Ad Soyad *</label>
                                    <input required placeholder="Ad Soyad" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="pricing-form-group">
                                    <label>E-posta *</label>
                                    <input required type="email" placeholder="ornek@sirket.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                </div>
                            </div>
                            <div className="pricing-form-row">
                                <div className="pricing-form-group">
                                    <label>Telefon *</label>
                                    <input required type="tel" placeholder="0555 000 00 00" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <div className="pricing-form-group">
                                    <label>Şirket Adı</label>
                                    <input placeholder="Şirket Adı" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
                                </div>
                            </div>
                            <hr className="pricing-form-divider" />
                            <p className="pricing-form-card-label">Kart Bilgileri (iyzico güvencesi)</p>
                            <div className="pricing-form-group pricing-form-full">
                                <label>Kart Numarası *</label>
                                <input required placeholder="**** **** **** ****" maxLength={19} value={form.cardNumber}
                                    onChange={e => setForm({ ...form, cardNumber: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() })} />
                            </div>
                            <div className="pricing-form-group pricing-form-full">
                                <label>Kart Üzerindeki İsim *</label>
                                <input required placeholder="JOHN DOE" value={form.cardHolder} onChange={e => setForm({ ...form, cardHolder: e.target.value.toUpperCase() })} />
                            </div>
                            <div className="pricing-form-row">
                                <div className="pricing-form-group">
                                    <label>Son Kullanma (AA/YY) *</label>
                                    <input required placeholder="12/28" maxLength={5} value={form.expiry}
                                        onChange={e => {
                                            const v = e.target.value.replace(/\D/g, '');
                                            setForm({ ...form, expiry: v.length >= 2 ? v.slice(0, 2) + '/' + v.slice(2) : v });
                                        }} />
                                </div>
                                <div className="pricing-form-group">
                                    <label>CVV *</label>
                                    <input required placeholder="***" maxLength={4} type="password" value={form.cvv} onChange={e => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '') })} />
                                </div>
                            </div>
                            <button type="submit" className="pricing-pay-btn" style={{ background: `linear-gradient(135deg, ${plan.accentColor}, #4f46e5)` }} disabled={loading}>
                                {loading ? '⏳ İşleniyor...' : `🔒 ${plan.price} Öde (iyzico)`}
                            </button>
                            <div className="pricing-iyzico-badge">
                                <span>🔒</span> Bu ödeme <strong>iyzico</strong> altyapısı ile güvence altındadır
                            </div>
                        </form>
                    </>
                )}

                {step === 'success' && (
                    <div className="pricing-modal-success">
                        <div className="pricing-success-icon">🎉</div>
                        <h3>Ödeme Başarılı!</h3>
                        <p>Aboneliğiniz aktif edildi. Detaylar e-posta adresinize gönderildi.</p>
                        <button className="pricing-pay-btn" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={onClose}>
                            ✅ Tamam
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PricingSection() {
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    return (
        <>
            <section className="landing-section landing-section-alt" id="pricing">
                <div className="landing-container">
                    <div className="section-header">
                        <div className="section-badge">💰 Fiyatlandırma</div>
                        <h2 className="section-title">Filonuza Uygun Paketi Seçin</h2>
                        <p className="section-desc">
                            Şeffaf fiyatlandırma. Gizli ücret yok. İstediğiniz zaman yükseltebilir veya iptal edebilirsiniz.
                        </p>
                    </div>

                    <div className="pricing-grid">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`pricing-card${plan.popular ? ' pricing-card-popular' : ''}`}
                                style={{ '--accent': plan.accentColor } as React.CSSProperties}
                            >
                                {/* Popular badge */}
                                {plan.badge && (
                                    <div className="pricing-popular-badge">{plan.badge}</div>
                                )}

                                {/* Header */}
                                <div className="pricing-card-header">
                                    <div className="pricing-target-pill">{plan.target}</div>
                                    <h3 className="pricing-plan-name">{plan.name}</h3>
                                    <p className="pricing-plan-subtitle">{plan.subtitle}</p>
                                </div>

                                {/* Price */}
                                <div className="pricing-price-block">
                                    {plan.price ? (
                                        <>
                                            <div className="pricing-price">
                                                <span className="pricing-price-amount">{plan.price}</span>
                                                <span className="pricing-price-note">{plan.priceNote}</span>
                                            </div>
                                            {plan.accessFee && (
                                                <div className="pricing-access-fee">{plan.accessFee}</div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="pricing-price-custom">
                                            <span className="pricing-price-amount" style={{ fontSize: 28 }}>Özel Teklif</span>
                                            <span className="pricing-price-note">size özel fiyatlandırma</span>
                                        </div>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="pricing-divider" />

                                {/* Features */}
                                <ul className="pricing-features">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="pricing-feature-item">{f}</li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <button
                                    className={`pricing-cta-btn${plan.popular ? ' pricing-cta-popular' : ''}`}
                                    style={plan.popular ? { background: `linear-gradient(135deg, ${plan.accentColor}, #4f46e5)` } : {}}
                                    onClick={() => {
                                        if (plan.paymentEnabled) {
                                            setSelectedPlan(plan);
                                        } else {
                                            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                >
                                    {plan.cta}
                                    {plan.paymentEnabled && <span className="pricing-cta-arrow"> →</span>}
                                </button>

                                {plan.paymentEnabled && (
                                    <p className="pricing-card-note">🔒 iyzico ile güvenli ödeme</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Bottom trust row */}
                    <div className="pricing-trust-row">
                        {['✅ 30 Gün Ücretsiz Deneme', '🔒 iyzico ile Güvenli Ödeme', '↩️ İptal Garantisi', '📞 7/24 Destek'].map((t) => (
                            <div key={t} className="pricing-trust-item">{t}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* iyzico payment modal */}
            {selectedPlan && (
                <IyzicoCheckoutModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
            )}
        </>
    );
}
