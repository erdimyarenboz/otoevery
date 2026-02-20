# OtoEvery — Kurumsal Filo Yönetimi SaaS v1 PRD

> **Versiyon:** 1.0 · **Tarih:** 2026-02-19 · **Yazar:** Solution Architect

---

## 1. Vizyon & Kapsam

**Ürün:** Çoklu kiracılı (multi-tenant), web tabanlı Kurumsal Filo Yönetim Platformu.  
**Hedef Kitle:** KOBİ ve kurumsal filolar (20–5 000 araç).  
**Değer Önerisi:** Tüm filo operasyonları tek panelde; evrak/ceza/bakım hatırlatmaları otomatik; gider/yakıt/ceza analizi anlık; onay süreçleri dijital.

### Kapsam Dışı (v1)
- Mobil native uygulama (responsive web yeterli).
- Gerçek GPS/telematik API entegrasyonu (sadece adapter pattern placeholder).
- Gerçek OCR motor entegrasyonu (sadece placeholder).
- Gerçek e-fatura/e-arşiv entegrasyonu (sadece placeholder).

---

## 2. Roller & RBAC

| # | Rol | Açıklama | Erişim Kapsamı |
|---|-----|----------|----------------|
| 1 | **Super Admin** | SaaS platform sahibi | Tüm tenant'lar, planlar, sistem ayarları |
| 2 | **Firma Admin** | Kiracı firma yöneticisi | Kendi tenant'ında tüm modüller |
| 3 | **Filo Yöneticisi** | Operasyon sorumlusu | Araç, zimmet, bakım, lastik, yakıt, talep, ceza, evrak |
| 4 | **Finans/Muhasebe** | Gider/fatura sorumlusu | Gider, fatura, bütçe, rapor, ceza ödeme |
| 5 | **Sürücü/Kullanıcı** | Araç kullanan personel | Kendi araç bilgisi, kendi talepleri |
| 6 | **Servis/Tedarikçi** | Dış servis firması (opsiyonel) | Atanan iş emirleri |

### RBAC Modeli
- **Modül bazlı + aksiyon bazlı**: `permission = module:action` (ör. `vehicles:create`, `expenses:approve`).
- **Aksiyonlar:** `view`, `create`, `update`, `delete`, `approve`, `export`.
- Her kritik aksiyon `activity_logs` tablosuna yazılır (`user_id`, `action`, `resource_type`, `resource_id`, `old_value`, `new_value`, `ip`, `timestamp`).
- Rate limiting: API endpoint başına token bucket (tenant bazlı + kullanıcı bazlı).

---

## 3. Modüller & Kullanıcı Hikayeleri

### 3.1 Araç & Envanter

**Varlık Alanları:** plaka, marka, model, yıl, şasi no, motor no, yakıt tipi (benzin/dizel/LPG/elektrik/hibrit), güncel km, lokasyon, departman, durum (aktif/pasif/bakımda/satıldı), sahiplik (özmal/kiralık), araç grubu, etiketler.

| ID | Kullanıcı Hikayesi | Kabul Kriteri |
|----|-------------------|---------------|
| V-01 | Filo yöneticisi olarak araç kartı oluşturabilirim | Zorunlu alanlar dolu, plaka unique (tenant scope) |
| V-02 | Araçları liste, filtre, arama ile görebilirim | Server-side pagination, saved filters, sütun seçici |
| V-03 | Araç detay sayfasında sekmeleri görebilirim | Genel / Zimmet / Yakıt / Gider / Ceza / Lastik / Evrak / Rapor sekmeleri |
| V-04 | Toplu araç import yapabilirim (CSV) | Hata satırları raporlanır, başarılı satırlar eklenir |
| V-05 | Araç verilerini export edebilirim (CSV/XLSX) | Filtrelenmiş sonuçlar export edilir |
| V-06 | Kilometre güncelleyebilirim (manuel) | Önceki km'den düşük girilirse uyarı |
| V-07 | Araç grupları ve etiketleri yönetebilirim | CRUD + araçlara atama |

### 3.2 Zimmet Yönetimi

| ID | Kullanıcı Hikayesi | Kabul Kriteri |
|----|-------------------|---------------|
| Z-01 | Araç bir çalışana zimmetleyebilirim | Başlangıç/bitiş tarihi, aynı anda bir araç tek kişiye |
| Z-02 | Zimmet geçmişini görebilirim | Araç veya çalışan bazlı timeline |
| Z-03 | Teslim tutanağı PDF oluşturabilirim | Araç durumu, km, hasar notu, tarih bilgileri |
| Z-04 | Kullanıcı "teslim aldım" onayı verebilir | Dijital imza placeholder (e-imzaya hazır) |
| Z-05 | Zimmet bitirince araç havuza döner | Araç durumu otomatik güncellenir |

### 3.3 Talep / İş Akışı (Workflow)

**Talep türleri:** bakım/servis, yakıt, harcama, lastik, evrak yenileme, ceza itirazı, genel.

| ID | Kullanıcı Hikayesi | Kabul Kriteri |
|----|-------------------|---------------|
| T-01 | Talep oluşturabilirim (tip, öncelik, açıklama, ekler) | Talep oluşturulunca durumu "Taslak" |
| T-02 | Talebi onaya gönderebilirim | Akış: Taslak → Onay Bekliyor → Onaylandı/Reddedildi → Uygulamada → Kapandı |
| T-03 | 2 seviyeli onay akışı çalışır | Seviye 1 onaylarsa Seviye 2'ye gider; Seviye 2 onaylarsa talep onaylanır |
| T-04 | Talepleri Kanban görünümünde görebilirim | Sütunlar duruma göre, sürükle-bırak desteği |
| T-05 | Talebe yorum ve dosya ekleyebilirim | Yorum history, dosya ekleri |
| T-06 | SLA süresi ayarlayabilirim | SLA aşımında uyarı |
| T-07 | Görev atayabilirim | Atanan kişiye bildirim |

### 3.4 Yakıt Yönetimi

| ID | Kullanıcı Hikayesi | Kabul Kriteri |
|----|-------------------|---------------|
| Y-01 | Yakıt alım kaydı oluşturabilirim | Tarih, istasyon, litre, tutar, km, plaka, sürücü |
| Y-02 | CSV ile toplu yakıt kaydı import edebilirim | Format şablonu indir, hata raporu |
| Y-03 | Anomali kuralları tanımlayabilirim | km/lt eşiği, kısa sürede tekrar alım, ortalama aşımı |
| Y-04 | Anomali tespit edilince bildirim alırım | Kural eşleşince bildirim + yakıt kaydına flag |
| Y-05 | Araç/sürücü/aylık tüketim raporu görebilirim | Grafik + tablo, filtre, export |

### 3.5 Lastik Yönetimi

| ID | Kullanıcı Hikayesi | Kabul Kriteri |
|----|-------------------|---------------|
| L-01 | Lastik stoku oluşturabilirim | Marka, ebat, DOT, diş derinliği, maliyet |
| L-02 | Lastiği aracın konumuna atayabilirim | Sol ön / sağ ön / sol arka / sağ arka / stepne |
| L-03 | Rotasyon planı oluşturabilirim | Takvim/km bazlı, hatırlatma |
| L-04 | Lastik değişim geçmişini görebilirim | Hangi araçta, ne zaman, kaç km |
| L-05 | Lastik ömrü ve maliyet raporu alabilirim | Marka karşılaştırma, km/TL |

### 3.6 Ceza Yönetimi

| ID | Kullanıcı Hikayesi | Kabul Kriteri |
|----|-------------------|---------------|
| C-01 | Ceza kaydı oluşturabilirim | Tarih, tutar, plaka, lokasyon, tebliğ tarihi, son ödeme |
| C-02 | Ödeme durumu ve dekontunu girebilirim | Ödenmedi/Ödendi/İndirimli ödendi |
| C-03 | İtiraz süreci başlatabilirim | İtiraz talebi → sonuç |
| C-04 | Cezayı sürücüyle otomatik eşleştirebilirim | Zimmet tarih aralığına göre ceza tarihinde aracı kullanan sürücü bulunur |
| C-05 | Sürücüye rücu raporu oluşturabilirim | Sürücü bazlı ceza toplamı |

### 3.7 Gider Yönetimi

| ID | Kullanıcı Hikayesi | Kabul Kriteri |
|----|-------------------|---------------|
| G-01 | Gider kategorilerini yönetebilirim | Varsayılan + özel kategoriler |
| G-02 | Gider kaydı + fiş/fatura upload yapabilirim | OCR placeholder mevcut |
| G-03 | Bütçe tanımlayabilirim (kategori/araç/ay) | CRUD |
| G-04 | Bütçe aşımında uyarı alırım | Eşik %80 ve %100'de bildirim |
| G-05 | TCO raporu görebilirim | Araç bazlı toplam sahip olma maliyeti |

### 3.8 Evrak & Sözleşme Yönetimi

| ID | Kullanıcı Hikayesi | Kabul Kriteri |
|----|-------------------|---------------|
| E-01 | Belge türlerini yönetebilirim | Sigorta, kasko, muayene, ruhsat, kira sözleşmesi vb. |
| E-02 | Belge yükleyebilir, tag ile arama yapabilirim | Güvenli dosya saklama (signed URL) |
| E-03 | Son geçerlilik tarihine göre otomatik hatırlatma | 30/15/7 gün kala bildirim |
| E-04 | Belge arşivini export edebilirim | ZIP download |

### 3.9 Rapor Yönetimi

| ID | Kullanıcı Hikayesi | Kabul Kriteri |
|----|-------------------|---------------|
| R-01 | Dashboard KPI kartlarını görebilirim | Toplam araç, aktif araç, aylık yakıt, aylık gider, ceza toplamı, bakım sayısı, lastik maliyeti |
| R-02 | Filtreler uygulayabilirim | Tarih aralığı, araç grubu, departman, sürücü |
| R-03 | Saved reports oluşturabilirim | Rapor adı + filtre parametreleri kayıt |
| R-04 | CSV/XLSX/PDF export yapabilirim | Async export (büyük veri setleri) |

### 3.10 Kiralık Araç Yönetimi

| ID | Kullanıcı Hikayesi | Kabul Kriteri |
|----|-------------------|---------------|
| K-01 | Kiralama sözleşmesi oluşturabilirim | Firma, başlangıç/bitiş, aylık bedel, km limiti, aşım bedeli |
| K-02 | Sözleşme hatırlatması alırım | Bitiş tarihine 30/15 gün kala |
| K-03 | Kiralama faturalarını takip edebilirim | Fatura tarihi, tutar, ödeme durumu |

### 3.11 GPS/Telematik (Opsiyonel Placeholder)

| ID | Kullanıcı Hikayesi | Kabul Kriteri |
|----|-------------------|---------------|
| GPS-01 | Provider adapter tanımı yapılabilir | Adapter pattern interface hazır |
| GPS-02 | Konum/rota/sürüş davranışı veri modeli mevcut | DB tabloları + API endpoint'leri hazır, gerçek data yok |

---

## 4. Bildirimler & Kurallar Motoru

### Bildirim Kanalları
1. **Panel içi** (notification center — bell icon)
2. **E-posta** (SMTP / transactional email service)
3. **Webhook** (outgoing, tenant'ın kendi sistemine)

### Varsayılan Kural Örnekleri

| Kural | Tetikleyici | Alıcı |
|-------|-------------|-------|
| Evrak bitiş uyarısı | Son geçerlilik − 30/15/7 gün | Filo Yöneticisi, Firma Admin |
| Ceza son ödeme uyarısı | Son ödeme − 7/3 gün | Finans, Filo Yöneticisi |
| Bakım periyodu | KM veya tarih eşiğine ulaşınca | Filo Yöneticisi |
| Bütçe aşımı | Harcama ≥ bütçe × %80 | Finans, Firma Admin |
| Yakıt anomalisi | Kural eşleşince | Filo Yöneticisi |
| Talep onay bildirimi | Talep onaya gelince | Onaylayıcı |
| Kiralama sözleşme bitiş | Bitiş − 30/15 gün | Filo Yöneticisi, Finans |

### Konfigürasyon
- Her tenant kendi bildirim kurallarını ayarlayabilir (eşik değerleri, alıcılar, aktif/pasif).
- Bildirim şablonları TR/EN olarak saklanır.

---

## 5. Güvenlik Gereksinimleri

| Alan | Uygulama |
|------|----------|
| Tenant İzolasyonu | Her sorgu `tenant_id` filtresi, RLS (Row Level Security) PostgreSQL |
| Kimlik Doğrulama | JWT + refresh token, opsiyonel 2FA (TOTP placeholder) |
| Yetkilendirme | RBAC middleware, her endpoint'te kontrol |
| Rate Limiting | Token bucket, tenant + user bazlı |
| Input Validation | Zod/Joi schema validation, SQL injection koruması (parameterized queries) |
| Encryption | Hassas alanlar AES-256 (şasi no, TC kimlik vb.), TLS in transit |
| Dosya Güvenliği | Signed URL (expiring), dosya tipi + boyut doğrulama |
| CSRF/XSS | CSRF token, Content Security Policy, output encoding |
| Audit Log | Tüm CRUD + onay aksiyonları loglanır |
| Hata İzleme | Sentry / benzeri entegrasyon noktası hazır |

---

## 6. Performans Gereksinimleri

| Metrik | Hedef |
|--------|-------|
| Sayfa yüklenme | < 2s (50th), < 4s (95th) |
| API yanıt süresi | < 200ms CRUD, < 500ms raporlar |
| Eş zamanlı kullanıcı | 500 / tenant |
| Veri hacmi | 100 000 araç / tenant |
| Liste pagination | Server-side, varsayılan 25 satır, max 100 |
| Indeksleme | tenant_id + sık filtrelenen alanlar composite index |
| Caching | Redis — session, sık okunan config, dashboard KPI |

---

## 7. Çoklu Dil (i18n)

- Panel varsayılan dili TR; İngilizce tam çeviri altyapısı hazır.
- i18n kütüphanesi: `i18next` (frontend) + backend hata mesajları için `accept-language` header.
- Tarih formatı: locale-aware (`dd.MM.yyyy` TR, `MM/dd/yyyy` EN).
- Para birimi: tenant profili üzerinden ayarlanır (varsayılan TRY).

---

## 8. Entegrasyon Placeholder'ları

| Entegrasyon | Durum v1 | Arayüz |
|-------------|----------|--------|
| GPS/Telematik | Adapter interface + mock | `ITelematicsProvider` |
| Yakıt Kartı | CSV import + API placeholder | `IFuelCardProvider` |
| e-Fatura/e-Arşiv | Placeholder | `IInvoiceProvider` |
| SSO (SAML/OIDC) | Placeholder | Auth middleware hook |
| Outgoing Webhooks | Çalışan | Webhook URL + secret + retry |
| OCR | Placeholder | `IOcrProvider` |

---

## 9. Teknoloji Kararları (Gerekçeli)

| Karar | Seçim | Gerekçe |
|-------|-------|---------|
| Backend | **Node.js + Express/Fastify** | JS ekosistem tutarlılığı, hız, ekip yaygınlığı |
| Frontend | **Next.js 14 (App Router)** | SSR/SSG performansı, file-based routing, React ekosistemi |
| DB | **PostgreSQL 16** | RLS (tenant isolation), JSONB, full-text search, olgunluk |
| ORM | **Prisma** | Type-safe, migration yönetimi, introspection |
| Cache | **Redis** | Session, rate limit, KPI cache |
| File Storage | **S3 uyumlu (MinIO local, AWS S3 prod)** | Signed URL, ucuz, ölçeklenebilir |
| Auth | **Supabase Auth veya custom JWT** | Sosyal login hazır, RLS desteği |
| Bildirim | **SMTP (Resend/SES) + WebSocket (panel içi)** | Güvenilir, ucuz |
| CI/CD | **Docker + GitHub Actions** | Standart, tekrarlanabilir |
| Monitoring | **Sentry + Prometheus/Grafana placeholder** | Hata izleme + metrik |
