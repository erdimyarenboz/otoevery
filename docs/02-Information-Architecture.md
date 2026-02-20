# OtoEvery — Bilgi Mimarisi & Ekran Akışları

---

## 1. Navigasyon Yapısı

### Sol Sidebar (Ana Menü)

```
📊 Dashboard
🚗 Araçlar
  └─ Araç Listesi
  └─ Araç Grupları
  └─ Etiketler
👤 Zimmet
📋 Talepler
⛽ Yakıt
🔧 Lastik
⚠️ Cezalar
💰 Gider & Bütçe
📄 Evrak & Sözleşme
📈 Raporlar
🏢 Kiralık Araç
📡 GPS/Telematik (opsiyonel)
─────────────────
⚙️ Ayarlar
  └─ Firma Profili
  └─ Kullanıcılar & Roller
  └─ Bildirim Kuralları
  └─ Entegrasyonlar
🔔 Bildirimler (üst bar)
👤 Profil (üst bar)
```

### Üst Bar
- Tenant adı + logo
- Global arama
- Bildirim zili (unread count)
- Dil seçici (TR/EN)
- Kullanıcı avatar + dropdown (profil, çıkış)

---

## 2. Ekran Akışları

### 2.1 Auth Akışı

```
Login ─────────────────────────────────┐
  ├─ E-posta + Şifre                   │
  ├─ "Şifremi Unuttum" → Reset Flow    │
  ├─ Opsiyonel 2FA → TOTP girişi       │
  └─ Başarılı → Dashboard              │
                                       │
Onboarding (ilk giriş) ───────────────┘
  1. Firma bilgileri (ad, logo, sektör)
  2. CSV ile araç import
  3. Kullanıcı ekleme (e-posta davet)
  4. → Dashboard
```

### 2.2 Araç Akışı

```
Araç Listesi ──→ [+ Yeni Araç] ──→ Araç Formu ──→ Kaydet ──→ Araç Detay
     │                                                           │
     ├─ Filtre/Arama                                             ├─ Genel Bilgi (düzenle)
     ├─ Sütun seçici                                             ├─ Zimmet sekmesi
     ├─ Saved Filters                                            ├─ Yakıt sekmesi
     ├─ Toplu İşlem (durum değiştir, export)                     ├─ Gider sekmesi
     └─ CSV/XLSX Export                                          ├─ Ceza sekmesi
                                                                 ├─ Lastik sekmesi
                                                                 ├─ Evrak sekmesi
                                                                 └─ Rapor sekmesi (araç TCO)
```

### 2.3 Zimmet Akışı

```
Zimmet Listesi ──→ [Zimmet Ver] ──→ Araç seç → Kişi seç → Tarih → Kaydet
     │                                  │
     ├─ Aktif Zimmetler                 └─ Teslim Tutanağı PDF
     ├─ Geçmiş Zimmetler
     └─ [Zimmet Bitir] → Teslim formu → "Teslim Aldım" onayı
```

### 2.4 Talep Akışı

```
Talepler (Kanban / Liste) ──→ [+ Yeni Talep]
     │                              │
     │  ┌───────────────────────────┘
     │  │
     │  ▼
     │  Talep Formu
     │    ├─ Tür seç (bakım/yakıt/harcama/lastik/evrak/ceza itirazı)
     │    ├─ Öncelik (düşük/normal/yüksek/acil)
     │    ├─ Açıklama + Dosya ekleri
     │    └─ Kaydet (Taslak)
     │
     ▼
  Talep Detay
     ├─ Durum geçişi: Taslak → Onay Bekliyor → Seviye 1 Onay → Seviye 2 Onay → Uygulamada → Kapandı
     ├─ Yorum akışı
     ├─ Görev atama
     ├─ SLA takip
     └─ Red → sebep notu
```

### 2.5 Yakıt Akışı

```
Yakıt Kayıtları ──→ [+ Yeni Kayıt] ──→ Form (tarih, istasyon, litre, tutar, km, plaka, sürücü)
     │                                       │
     ├─ CSV Import ──→ Şablon İndir           └─ Kaydet → anomali kontrolü
     ├─ Anomali Flag'li kayıtlar
     └─ Tüketim Analizi ──→ Grafikler (araç/sürücü/aylık)
```

### 2.6 Lastik Akışı

```
Lastik Stoku ──→ [+ Yeni Lastik] ──→ Form
     │
     ├─ Araç Üzeri ──→ Araç seç → lastik pozisyonları görsel
     ├─ Rotasyon Planı
     └─ Değişim Geçmişi
```

### 2.7 Ceza Akışı

```
Ceza Listesi ──→ [+ Yeni Ceza] ──→ Form
     │
     ├─ Ödeme Yap → Dekont upload
     ├─ İtiraz Başlat → Talep oluştur
     └─ Sürücü Eşleştir → Zimmet tarih kontrolü → Rücu raporu
```

### 2.8 Gider Akışı

```
Gider Listesi ──→ [+ Yeni Gider] ──→ Form + Fatura upload (OCR placeholder)
     │
     ├─ Kategoriler → Yönet
     ├─ Bütçe Tanımla ──→ Kategori/Araç/Ay bazlı
     └─ Bütçe Raporu ──→ Harcama vs Bütçe grafik
```

### 2.9 Evrak Akışı

```
Evrak Listesi ──→ [+ Yeni Evrak] ──→ Form + Dosya upload
     │
     ├─ Türlere göre filtre
     ├─ Etiket ile arama
     ├─ Yaklaşan bitiş tarihleri (30/15/7 gün)
     └─ Toplu ZIP indirme
```

### 2.10 Rapor Akışı

```
Dashboard ──→ KPI kartları + grafikler
     │
     ├─ Filtre paneli (tarih, araç grubu, departman, sürücü)
     ├─ Saved Reports ──→ Listele / Oluştur
     └─ Export (CSV/XLSX/PDF)
```

### 2.11 Kiralık Araç Akışı

```
Kiralık Sözleşmeler ──→ [+ Yeni Sözleşme] ──→ Form
     │
     ├─ Fatura Takibi ──→ [+ Fatura] → Ödeme durumu
     └─ Sözleşme Hatırlatmaları
```

### 2.12 Ayarlar Akışı

```
Ayarlar
  ├─ Firma Profili ──→ Ad, logo, adres, para birimi, dil
  ├─ Kullanıcılar & Roller
  │    ├─ Kullanıcı Listesi ──→ Davet / Düzenle / Pasif yap
  │    └─ Rol Yönetimi ──→ İzin matrisi (modül × aksiyon)
  ├─ Bildirim Kuralları ──→ Kural listesi → Aktif/Pasif, eşik düzenle
  └─ Entegrasyonlar ──→ GPS provider, Yakıt kartı, Webhook URL'leri
```

---

## 3. Super Admin Paneli (SaaS Yönetimi)

```
SA Dashboard ──→ Toplam tenant, aktif kullanıcı, MRR
     │
     ├─ Tenant Yönetimi ──→ Liste / Detay / Plan değiştir / Askıya al
     ├─ Plan & Fiyatlandırma ──→ Paket tanımları
     ├─ Sistem Ayarları ──→ Global config, SMTP, S3
     └─ Sistem Logları ──→ Hata logları, audit
```
