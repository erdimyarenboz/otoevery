'use client';

import { useState } from 'react';
import Link from 'next/link';
import './landing.css';
import PricingSection from './components/PricingSection';

export default function LandingPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contact: '',
    phone: '',
    fleetSize: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const text = `🚗 *Yeni OtoEvery Başvurusu*%0A%0A🏢 Şirket: ${formData.companyName}%0A👤 Yetkili: ${formData.contact}%0A📞 Telefon: ${formData.phone}%0A🚙 Araç Sayısı: ${formData.fleetSize}%0A💬 Mesaj: ${formData.message || '-'}`;
    window.open(`https://wa.me/905077605747?text=${text}`, '_blank');
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
    }, 800);
  };

  const features = [
    { icon: '🏢', title: 'Filo Yönetimi', desc: 'Tüm araçlarınızı tek panelden yönetin. Anlık konum, km takibi ve durum bilgisi.' },
    { icon: '⛽', title: 'Akıllı Kredi Sistemi', desc: 'Şirket kredisi araçlara dağıtın. Bakım ve yıkama ödemeleri QR kod ile.' },
    { icon: '🔧', title: '1000+ Anlaşmalı Servis', desc: 'Türkiye genelinde anlaşmalı yıkama ve bakım istasyonları ağı.' },
    { icon: '📊', title: 'Gerçek Zamanlı Raporlar', desc: 'Harcama analizleri, ceza takibi ve ödeme raporları anlık olarak görüntüleyin.' },
    { icon: '📱', title: 'QR ile Hızlı Ödeme', desc: 'Sürücüler serviste QR okutarak öder — nakit veya kart gerekmez.' },
    { icon: '🔐', title: 'Rol Bazlı Erişim', desc: 'Admin, şirket yöneticisi, sürücü ve servis için ayrı panel ve yetkiler.' },
  ];

  const stats = [
    { value: '500+', label: 'Aktif Şirket' },
    { value: '12.000+', label: 'Yönetilen Araç' },
    { value: '1.000+', label: 'Anlaşmalı Servis' },
    { value: '₺50M+', label: 'İşlem Hacmi' },
  ];

  return (
    <div className="landing-root">
      {/* NAV */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <div className="landing-logo-icon">OE</div>
            <span className="landing-logo-text">OtoEvery</span>
          </div>
          <div className={`landing-nav-links ${mobileMenu ? 'open' : ''}`}>
            <a href="#features">Özellikler</a>
            <a href="#how">Nasıl Çalışır?</a>
            <a href="#pricing">Fiyatlandırma</a>
            <a href="#contact">İletişim</a>
          </div>
          <div className="landing-nav-cta">
            <Link href="/login" className="landing-btn-outline">Şirket Girişi</Link>
            <Link href="/login/service" className="landing-btn-primary">Oto Servis Girişi</Link>
          </div>
          <button className="landing-hamburger" onClick={() => setMobileMenu(!mobileMenu)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="landing-hero">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
        <div className="hero-inner">
          <div className="hero-badge">🚀 Türkiye&apos;nin #1 Filo Yönetim Platformu</div>
          <h1 className="hero-title">
            Filonuzu Akıllıca<br />
            <span className="hero-gradient">Yönetin, Tasarruf Edin</span>
          </h1>
          <p className="hero-desc">
            OtoEvery ile araç filonuzu tek ekrandan yönetin. QR kodlu ödeme, anlaşmalı servis ağı
            ve akıllı kredi sistemiyle operasyonel maliyetlerinizi %30 azaltın.
          </p>
          <div className="hero-actions">
            <a href="#contact" className="landing-btn-primary landing-btn-xl">
              Ücretsiz Demo İste 🎯
            </a>
            <a href="#features" className="landing-btn-ghost landing-btn-xl">
              Nasıl Çalışır? →
            </a>
          </div>
          <div className="hero-stats">
            {stats.map((s) => (
              <div key={s.label} className="hero-stat">
                <div className="hero-stat-value">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Dashboard mockup */}
        <div className="hero-mockup">
          <div className="mockup-window">
            <div className="mockup-bar">
              <span /><span /><span />
            </div>
            <div className="mockup-content">
              <div className="mockup-sidebar">
                {['🏠', '🚗', '🔧', '📊', '💳', '👥'].map((i, idx) => (
                  <div key={idx} className={`mockup-nav-item ${idx === 0 ? 'active' : ''}`}>{i}</div>
                ))}
              </div>
              <div className="mockup-main">
                <div className="mockup-stats-row">
                  {[['12', 'Araç'], ['₺24K', 'Kredi'], ['8', 'Servis']].map(([v, l]) => (
                    <div key={l} className="mockup-stat-card">
                      <div className="msv">{v}</div>
                      <div className="msl">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="mockup-table">
                  {['34 ABC 123 — Yıkama — ₺150', '34 DEF 456 — Bakım — ₺1.200', '34 GHI 789 — Fren — ₺800'].map((r) => (
                    <div key={r} className="mockup-row">{r}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="landing-section" id="features">
        <div className="landing-container">
          <div className="section-header">
            <div className="section-badge">✨ Özellikler</div>
            <h2 className="section-title">Her Şey Tek Platformda</h2>
            <p className="section-desc">Filo yönetimi için ihtiyaç duyduğunuz tüm araçlar, birbirine entegre şekilde</p>
          </div>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="landing-section landing-section-alt" id="how">
        <div className="landing-container">
          <div className="section-header">
            <div className="section-badge">⚡ Hızlı Başlangıç</div>
            <h2 className="section-title">3 Adımda Başlayın</h2>
          </div>
          <div className="steps-grid">
            {[
              { n: '01', title: 'Başvurun', desc: 'Formu doldurun, ekibimiz sizi 24 saat içinde arar ve ihtiyaçlarınızı değerlendirir.' },
              { n: '02', title: 'Kurulum', desc: 'Araçlarınız ve sürücüleriniz sisteme eklenir. Anlaşmalı servis ağına erişim açılır.' },
              { n: '03', title: 'Yönetin', desc: 'Filo panelinizden araçları takip edin, kredi dağıtın ve raporları inceleyin.' },
            ].map((s) => (
              <div key={s.n} className="step-card">
                <div className="step-number">{s.n}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDIVIDUAL USER SECTION */}
      <section className="landing-section" id="bireysel">
        <div className="landing-container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            {/* Left: Text */}
            <div>
              <div className="section-badge" style={{ marginBottom: 16, display: 'inline-block' }}>🧑 Bireysel Kullanım</div>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 16 }}>
                Şirket Olmadan da<br />
                <span className="hero-gradient">OtoEvery&apos;i Kullanın</span>
              </h2>
              <p className="section-desc" style={{ textAlign: 'left', marginBottom: 24 }}>
                Bireysel üye olun, kredi yükleyin ve Türkiye genelindeki anlaşmalı servis &amp; yıkama noktalarından avantajlı fiyatlarla yararlanın.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {[
                  ['💳', 'Kredi Yükle', 'Minimum 500₺ ile başlayın, istediğiniz zaman doldurun'],
                  ['🔧', 'Anlaşmalı Servisler', '1000+ noktada indirimli bakım ve yıkama'],
                  ['📱', 'QR ile Ödeme', 'Serviste hızlı ve temassız ödeme yapın'],
                  ['📊', 'Harcama Takibi', 'Tüm işlem geçmişinizi takip edin'],
                ].map(([icon, title, desc]) => (
                  <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 2 }}>{title}</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/register/individual" className="landing-btn-primary" style={{ display: 'inline-block' }}>
                  Ücretsiz Kayıt Ol →
                </Link>
                <Link href="/login/individual" className="landing-btn-outline" style={{ display: 'inline-block' }}>
                  Giriş Yap
                </Link>
              </div>
            </div>
            {/* Right: Card mockup */}
            <div style={{ position: 'relative' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 24, padding: 28, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', filter: 'blur(50px)', top: -50, right: -50 }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Kredi Bakiyeniz</div>
                  <div style={{ fontSize: 40, fontWeight: 900, color: '#fff', marginBottom: 16 }}>₺2.500</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                    {[['₺500', ''], ['₺1.000', ''], ['₺2.000', ''], ['Özel', '']].map(([v], i) => (
                      <div key={i} style={{ padding: '10px', borderRadius: 10, background: i === 1 ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)', border: i === 1 ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)', textAlign: 'center', fontSize: 14, fontWeight: i === 1 ? 700 : 400, color: i === 1 ? '#a5b4fc' : 'rgba(255,255,255,0.6)' }}>
                        {v}
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 12, textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 12 }}>
                    💳 ₺1.000 Kredi Yükle
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>🔒 iyzico güvencesiyle</div>
                </div>
              </div>
              {/* Son ödeme etiketi */}
              <div style={{ position: 'absolute', bottom: -12, left: -12, background: 'rgba(16,185,129,0.9)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: '8px 14px', fontSize: 12, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                ✅ +₺1.000 kredi yüklendi
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <PricingSection />

      {/* CTA BANNER */}
      <section className="landing-cta-banner">
        <div className="landing-container">
          <div className="cta-banner-inner">
            <div className="cta-banner-glow" />
            <h2 className="cta-banner-title">Filonuzu OtoEvery&apos;e Taşıyın</h2>
            <p className="cta-banner-desc">30 günlük ücretsiz deneme. Kredi kartı gerekmez.</p>
            <a href="#contact" className="landing-btn-primary landing-btn-xl">Hemen Başvur</a>
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="landing-section" id="contact">
        <div className="landing-container">
          <div className="section-header">
            <div className="section-badge">📞 İletişim</div>
            <h2 className="section-title">Demo Talep Edin</h2>
            <p className="section-desc">Bilgilerinizi bırakın, uzmanımız sizi arasın</p>
          </div>
          <div className="contact-wrapper">
            <div className="contact-info">
              <h3>Neden OtoEvery?</h3>
              <ul className="contact-benefits">
                <li>✅ 30 gün ücretsiz deneme</li>
                <li>✅ Kurulum desteği dahil</li>
                <li>✅ 7/24 teknik destek</li>
                <li>✅ Sözleşme zorunluluğu yok</li>
                <li>✅ Verileriniz Türkiye&apos;de saklanır</li>
              </ul>
              <div className="contact-whatsapp">
                <a href="https://wa.me/905077605747" target="_blank" rel="noopener noreferrer" className="landing-btn-whatsapp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp ile Ulaşın
                </a>
              </div>
            </div>

            <div className="contact-form-wrapper">
              {submitted ? (
                <div className="contact-success">
                  <div className="success-icon">✅</div>
                  <h3>WhatsApp Açıldı!</h3>
                  <p>Mesajınız hazırlandı. Ekibimiz en kısa sürede size dönecek.</p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Şirket Adı *</label>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="Örn: ABC Lojistik A.Ş."
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Yetkili Adı *</label>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="Ad Soyad"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Telefon *</label>
                      <input
                        className="form-input"
                        type="tel"
                        placeholder="0555 000 00 00"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Araç Sayısı</label>
                      <select
                        className="form-input"
                        value={formData.fleetSize}
                        onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })}
                      >
                        <option value="">Seçiniz</option>
                        <option>1-10 araç</option>
                        <option>11-50 araç</option>
                        <option>51-200 araç</option>
                        <option>200+ araç</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mesajınız</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      placeholder="İhtiyaçlarınızı kısaca belirtin..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    className="landing-btn-primary landing-btn-xl"
                    style={{ width: '100%' }}
                    disabled={submitting}
                  >
                    {submitting ? 'Gönderiliyor...' : '📱 WhatsApp ile Gönder'}
                  </button>
                  <p className="form-note">* Bilgileriniz güvende. Üçüncü taraflarla paylaşılmaz.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="landing-brand">
                <div className="landing-logo-icon" style={{ width: 28, height: 28, fontSize: 13 }}>OE</div>
                <span className="landing-logo-text" style={{ fontSize: 16 }}>OtoEvery</span>
              </div>
              <p>Türkiye&apos;nin lider filo yönetim platformu</p>
            </div>
            <div className="footer-links">
              <Link href="/login">Şirket Girişi</Link>
              <Link href="/login/service">Oto Servis Girişi</Link>
              <Link href="/login/driver">Sürücü Girişi</Link>
              <a href="https://wa.me/905077605747" target="_blank" rel="noopener noreferrer">Destek</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 OtoEvery. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
