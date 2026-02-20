# OtoEvery — Kabul Kriterleri Checklist

> Her madde test edilmeli ve onaylanmalıdır.

---

## 1. Tenant İzolasyonu ✅

- [ ] Tenant A kullanıcısı Tenant B araçlarını göremez (API + UI)
- [ ] Tenant A kullanıcısı Tenant B ID'si ile direct API call yapamaz
- [ ] RLS policy her tabloda aktif ve doğrulanmış
- [ ] Cross-tenant data leak testi: 50 farklı endpoint'te tenant_id filtreleme doğrulandı
- [ ] Super Admin tüm tenant verilerini görebilir
- [ ] Tenant oluşturma → varsayılan roller + izinler seed ediliyor

---

## 2. RBAC & Güvenlik ✅

- [ ] 6 rol tanımlı ve çalışıyor (Super Admin, Firma Admin, Filo Yöneticisi, Finans, Sürücü, Servis)
- [ ] Her modülde view/create/update/delete/approve/export izinleri ayrı ayrı çalışıyor
- [ ] İzinsiz erişim denemesi 403 döndürüyor
- [ ] Sürücü rolü sadece kendi araç bilgisini ve taleplerini görebilir
- [ ] Finans rolü sadece gider/fatura/bütçe/rapor/ceza modüllerine erişebilir
- [ ] Audit log'a tüm CRUD + onay aksiyonları yazılıyor
- [ ] Rate limiting çalışıyor (100 req/min aşımında 429)
- [ ] JWT token expire olunca 401 dönüyor, refresh token çalışıyor
- [ ] Password reset flow çalışıyor
- [ ] CSRF + XSS korumaları aktif
- [ ] Input validation (Zod) tüm endpoint'lerde çalışıyor

---

## 3. Araç & Envanter Modülü ✅

- [ ] Araç CRUD çalışıyor (oluştur/oku/güncelle/sil)
- [ ] Plaka tenant scope'unda unique
- [ ] Araç listesinde filtre, arama, sıralama, sayfalama çalışıyor
- [ ] Saved filters kayıt ve yükleme çalışıyor
- [ ] Sütun seçici çalışıyor
- [ ] Toplu işlem (durum değiştirme) çalışıyor
- [ ] CSV import wizard çalışıyor (hata satırları raporlanıyor)
- [ ] CSV/XLSX export çalışıyor (filtrelenmiş sonuçlar)
- [ ] Araç detay sayfası 8 sekme gösteriyor
- [ ] KM güncelleme çalışıyor (düşük km uyarısı)
- [ ] Araç grupları ve etiketler CRUD çalışıyor
- [ ] Audit log araç işlemleri için yazılıyor

---

## 4. Zimmet Modülü ✅

- [ ] Zimmet ver CRUD çalışıyor
- [ ] Aynı anda bir araç tek kişiye zimmetlenebilir
- [ ] Zimmet bitirince araç durumu güncelleniyor
- [ ] Zimmet geçmişi timeline gösterimi çalışıyor
- [ ] Teslim tutanağı PDF indirilebilir
- [ ] "Teslim aldım" onayı çalışıyor
- [ ] Zimmet tarih aralıkları ceza eşleştirmede kullanılıyor

---

## 5. Talep / İş Akışı Modülü ✅

- [ ] Talep CRUD çalışıyor
- [ ] Talep durumları: Taslak → Onay Bekliyor → Seviye 1 Onay → Seviye 2 Onay → Uygulamada → Kapandı
- [ ] **2 seviyeli onay akışı doğru çalışıyor**: Seviye 1 onaylayınca Seviye 2'ye geçiyor
- [ ] Seviye 1 reddettiğinde talep "Reddedildi" oluyor
- [ ] Kanban görünümü çalışıyor (sürükle-bırak)
- [ ] Liste görünümü çalışıyor
- [ ] Yorum ekleme/okuma çalışıyor
- [ ] Dosya ekleri yükleme/indirme çalışıyor
- [ ] SLA süresi hesaplanıyor, aşımda uyarı
- [ ] Görev atama çalışıyor, atanan kişiye bildirim gidiyor
- [ ] Durum geçmişi timeline gösterilıyor
- [ ] Onay bildirimi onaylayıcıya gidiyor

---

## 6. Yakıt Modülü ✅

- [ ] Yakıt kaydı CRUD çalışıyor
- [ ] CSV import çalışıyor (şablon indirme + hata raporu)
- [ ] Anomali kuralları tanımlanabiliyor
- [ ] Anomali tespit edilince kayıt flag'leniyor + bildirim gidiyor
- [ ] Araç/sürücü/aylık tüketim raporu grafik + tablo ile gösteriliyor
- [ ] Export çalışıyor
- [ ] Tüketim hesaplaması (lt/100km) doğru çalışıyor

---

## 7. Lastik Modülü ✅

- [ ] Lastik stok CRUD çalışıyor
- [ ] Araç üzeri lastik pozisyon diyagramı çalışıyor (5 pozisyon)
- [ ] Lastik takma/çıkarma kaydı çalışıyor
- [ ] Rotasyon planı oluşturma ve hatırlatma çalışıyor
- [ ] Lastik muayene kaydı çalışıyor
- [ ] Lastik ömrü ve maliyet raporu çalışıyor
- [ ] Değişim geçmişi timeline gösteriliyor

---

## 8. Ceza Modülü ✅

- [ ] Ceza CRUD çalışıyor
- [ ] Ödeme kaydı + dekont upload çalışıyor
- [ ] İtiraz başlatma → talep oluşturma çalışıyor
- [ ] **Ceza-sürücü otomatik eşleştirme çalışıyor**: ceza tarihinde aracı kullanan sürücü zimmet tablosundan bulunuyor
- [ ] Sürücüye rücu raporu çalışıyor
- [ ] Ceza son ödeme uyarısı çalışıyor

---

## 9. Gider Modülü ✅

- [ ] Gider CRUD çalışıyor
- [ ] Gider kategorileri (hiyerarşik) CRUD çalışıyor
- [ ] Fatura/fiş upload çalışıyor (OCR placeholder mevcut)
- [ ] Bütçe tanımlama çalışıyor (kategori/araç/ay)
- [ ] **Bütçe aşım uyarısı çalışıyor**: %80 ve %100'de bildirim
- [ ] TCO raporu araç bazlı çalışıyor
- [ ] Export çalışıyor

---

## 10. Evrak Modülü ✅

- [ ] Evrak CRUD çalışıyor
- [ ] Belge türleri yönetimi çalışıyor
- [ ] Dosya upload + güvenli indirme (signed URL) çalışıyor
- [ ] Etiket ile arama çalışıyor
- [ ] **Otomatik hatırlatma çalışıyor**: 30/15/7 gün kala bildirim gönderiliyor
- [ ] Yaklaşan bitiş tarihleri dashboard'da gösteriliyor
- [ ] Toplu zip indirme çalışıyor

---

## 11. Rapor Modülü ✅

- [ ] Dashboard KPI kartları doğru veri gösteriyor (7 KPI)
- [ ] Filtreler çalışıyor (tarih, araç grubu, departman, sürücü)
- [ ] Grafikler doğru render ediliyor
- [ ] Saved reports CRUD çalışıyor
- [ ] CSV export çalışıyor
- [ ] XLSX export çalışıyor
- [ ] PDF export çalışıyor
- [ ] Büyük veri setlerinde async export çalışıyor

---

## 12. Kiralık Araç Modülü ✅

- [ ] Sözleşme CRUD çalışıyor
- [ ] Fatura takip ve ödeme kaydı çalışıyor
- [ ] **Sözleşme hatırlatması çalışıyor**: 30/15 gün kala bildirim

---

## 13. Bildirim Sistemi ✅

- [ ] Panel içi bildirimler gösteriliyor (bell icon + unread count)
- [ ] E-posta bildirimleri gönderiliyor
- [ ] Webhook tetikleniyor (doğru payload, retry)
- [ ] Bildirim şablonları TR/EN çalışıyor
- [ ] Her tenant kendi bildirim kurallarını ayarlayabiliyor
- [ ] Kural aktif/pasif toggle çalışıyor

---

## 14. Genel UI/UX ✅

- [ ] Sol sidebar + üst bar layout çalışıyor
- [ ] Responsive: desktop, tablet, mobile çalışıyor
- [ ] Dark mode toggle çalışıyor
- [ ] i18n TR/EN dil değişimi çalışıyor
- [ ] Tüm listelerde server-side pagination çalışıyor
- [ ] Toast bildirimleri (success/error) gösteriliyor
- [ ] Loading skeletons gösteriliyor
- [ ] Boş durum (empty state) ekranları gösteriliyor
- [ ] Onboarding wizard çalışıyor (firma oluştur → araç import → kullanıcı davet)

---

## 15. Super Admin ✅

- [ ] Tenant listesi + detay görüntüleme çalışıyor
- [ ] Tenant plan değiştirme çalışıyor
- [ ] Tenant askıya alma/aktifleştirme çalışıyor
- [ ] Platform istatistikleri gösteriliyor
- [ ] Sistem ayarları yönetimi çalışıyor

---

## 16. Performans ✅

- [ ] Sayfa yüklenme süresi < 3s (95th percentile)
- [ ] API yanıt < 200ms (CRUD), < 500ms (raporlar)
- [ ] 10 000 araçlık listede pagination sorunsuz çalışıyor
- [ ] Dashboard aggregation sorguları optimize (< 1s)

---

## 17. Entegrasyon Placeholder'ları ✅

- [ ] GPS/Telematik adapter interface tanımlı
- [ ] Yakıt kartı CSV import çalışıyor, API placeholder hazır
- [ ] OCR placeholder UI gösteriliyor
- [ ] SSO placeholder hook tanımlı
- [ ] Webhook outgoing çalışıyor

---

## Onay Durumu

| Modül | Geliştirme | Test | Onay |
|-------|-----------|------|------|
| Tenant İzolasyonu | ⬜ | ⬜ | ⬜ |
| RBAC & Güvenlik | ⬜ | ⬜ | ⬜ |
| Araç & Envanter | ⬜ | ⬜ | ⬜ |
| Zimmet | ⬜ | ⬜ | ⬜ |
| Talep / İş Akışı | ⬜ | ⬜ | ⬜ |
| Yakıt | ⬜ | ⬜ | ⬜ |
| Lastik | ⬜ | ⬜ | ⬜ |
| Ceza | ⬜ | ⬜ | ⬜ |
| Gider & Bütçe | ⬜ | ⬜ | ⬜ |
| Evrak & Sözleşme | ⬜ | ⬜ | ⬜ |
| Raporlar | ⬜ | ⬜ | ⬜ |
| Kiralık Araç | ⬜ | ⬜ | ⬜ |
| Bildirimler | ⬜ | ⬜ | ⬜ |
| UI/UX | ⬜ | ⬜ | ⬜ |
| Super Admin | ⬜ | ⬜ | ⬜ |
| Performans | ⬜ | ⬜ | ⬜ |
| Entegrasyonlar | ⬜ | ⬜ | ⬜ |
