# OtoEvery — API Endpoint Listesi

> REST API · JSON · JWT Auth · Prefix: `/api/v1`

---

## Genel Kurallar

- Her endpoint `Authorization: Bearer <token>` header'ı bekler (auth hariç).
- Tenant izolasyonu: token'daki `tenant_id` her sorguya eklenir.
- RBAC middleware: `requirePermission('module:action')`.
- Pagination: `?page=1&limit=25&sort=created_at&order=desc`.
- Filtre: `?status=active&department=IT&q=34ABC` (query params).
- Rate limit: 100 req/min/user, 1000 req/min/tenant.
- Response format: `{ success: boolean, data: T | T[], meta?: { page, limit, total }, error?: { code, message } }`.

---

## 1. Auth & Users

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| POST | `/auth/login` | Giriş (email + password) | Public |
| POST | `/auth/logout` | Çıkış | Auth |
| POST | `/auth/refresh` | Token yenile | Auth |
| POST | `/auth/forgot-password` | Şifre sıfırlama e-postası | Public |
| POST | `/auth/reset-password` | Yeni şifre kaydet | Public (token ile) |
| POST | `/auth/verify-2fa` | 2FA doğrulama | Auth |
| GET | `/auth/me` | Oturumdaki kullanıcı bilgisi | Auth |
| PUT | `/auth/me` | Profil güncelle | Auth |
| PUT | `/auth/me/password` | Şifre değiştir | Auth |
| | | | |
| GET | `/users` | Kullanıcı listesi | users:view |
| POST | `/users` | Kullanıcı oluştur / davet | users:create |
| GET | `/users/:id` | Kullanıcı detay | users:view |
| PUT | `/users/:id` | Kullanıcı güncelle | users:update |
| DELETE | `/users/:id` | Kullanıcı sil (soft) | users:delete |
| POST | `/users/:id/roles` | Rol ata | users:update |
| DELETE | `/users/:id/roles/:roleId` | Rol kaldır | users:update |

---

## 2. Roller & İzinler

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| GET | `/roles` | Rol listesi | roles:view |
| POST | `/roles` | Rol oluştur | roles:create |
| GET | `/roles/:id` | Rol detay + izinler | roles:view |
| PUT | `/roles/:id` | Rol güncelle | roles:update |
| DELETE | `/roles/:id` | Rol sil | roles:delete |
| PUT | `/roles/:id/permissions` | İzin güncelle (bulk) | roles:update |
| GET | `/permissions` | Tüm izin listesi | roles:view |

---

## 3. Araçlar

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| GET | `/vehicles` | Araç listesi (filtered, paginated) | vehicles:view |
| POST | `/vehicles` | Araç oluştur | vehicles:create |
| GET | `/vehicles/:id` | Araç detay | vehicles:view |
| PUT | `/vehicles/:id` | Araç güncelle | vehicles:update |
| DELETE | `/vehicles/:id` | Araç sil (soft) | vehicles:delete |
| POST | `/vehicles/import` | CSV import | vehicles:create |
| GET | `/vehicles/export` | CSV/XLSX export | vehicles:export |
| POST | `/vehicles/:id/km` | KM güncelle | vehicles:update |
| GET | `/vehicles/:id/km-history` | KM geçmişi | vehicles:view |
| GET | `/vehicles/:id/timeline` | Araç timeline (tüm olaylar) | vehicles:view |
| | | | |
| GET | `/vehicle-groups` | Araç grupları | vehicles:view |
| POST | `/vehicle-groups` | Grup oluştur | vehicles:create |
| PUT | `/vehicle-groups/:id` | Grup güncelle | vehicles:update |
| DELETE | `/vehicle-groups/:id` | Grup sil | vehicles:delete |
| POST | `/vehicle-groups/:id/vehicles` | Araç ekle | vehicles:update |
| DELETE | `/vehicle-groups/:id/vehicles/:vehicleId` | Araç çıkar | vehicles:update |
| | | | |
| GET | `/vehicle-tags` | Etiketler | vehicles:view |
| POST | `/vehicle-tags` | Etiket oluştur | vehicles:create |
| PUT | `/vehicle-tags/:id` | Etiket güncelle | vehicles:update |
| DELETE | `/vehicle-tags/:id` | Etiket sil | vehicles:delete |

---

## 4. Çalışanlar / Sürücüler

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| GET | `/employees` | Çalışan listesi | employees:view |
| POST | `/employees` | Çalışan oluştur | employees:create |
| GET | `/employees/:id` | Çalışan detay | employees:view |
| PUT | `/employees/:id` | Çalışan güncelle | employees:update |
| DELETE | `/employees/:id` | Çalışan sil (soft) | employees:delete |
| GET | `/employees/:id/assignments` | Çalışan zimmet geçmişi | assignments:view |
| GET | `/employees/:id/penalties` | Çalışan ceza listesi | penalties:view |

---

## 5. Zimmet

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| GET | `/assignments` | Zimmet listesi | assignments:view |
| POST | `/assignments` | Zimmet ver | assignments:create |
| GET | `/assignments/:id` | Zimmet detay | assignments:view |
| PUT | `/assignments/:id` | Zimmet güncelle | assignments:update |
| POST | `/assignments/:id/complete` | Zimmet bitir | assignments:update |
| POST | `/assignments/:id/confirm` | "Teslim aldım" onayı | Auth (assigned user) |
| GET | `/assignments/:id/handover-pdf` | Teslim tutanağı PDF | assignments:view |
| GET | `/assignments/history` | Zimmet geçmişi | assignments:view |

---

## 6. Talepler (Workflow)

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| GET | `/requests` | Talep listesi | requests:view |
| POST | `/requests` | Talep oluştur | requests:create |
| GET | `/requests/:id` | Talep detay | requests:view |
| PUT | `/requests/:id` | Talep güncelle | requests:update |
| DELETE | `/requests/:id` | Talep sil | requests:delete |
| POST | `/requests/:id/submit` | Onaya gönder | requests:update |
| POST | `/requests/:id/approve` | Onayla | requests:approve |
| POST | `/requests/:id/reject` | Reddet | requests:approve |
| POST | `/requests/:id/assign` | Görev ata | requests:update |
| POST | `/requests/:id/complete` | Tamamla | requests:update |
| POST | `/requests/:id/cancel` | İptal et | requests:update |
| GET | `/requests/:id/history` | Durum geçmişi | requests:view |
| | | | |
| GET | `/requests/:id/comments` | Yorumlar | requests:view |
| POST | `/requests/:id/comments` | Yorum ekle | requests:create |
| | | | |
| GET | `/requests/:id/attachments` | Ekler | requests:view |
| POST | `/requests/:id/attachments` | Dosya ekle | requests:create |
| DELETE | `/requests/:id/attachments/:attachmentId` | Dosya sil | requests:delete |
| | | | |
| GET | `/request-types` | Talep türleri | requests:view |
| POST | `/request-types` | Tür oluştur | requests:create |
| PUT | `/request-types/:id` | Tür güncelle | requests:update |

---

## 7. Yakıt

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| GET | `/fuel-entries` | Yakıt kayıtları | fuel:view |
| POST | `/fuel-entries` | Yakıt kaydı oluştur | fuel:create |
| GET | `/fuel-entries/:id` | Yakıt detay | fuel:view |
| PUT | `/fuel-entries/:id` | Yakıt güncelle | fuel:update |
| DELETE | `/fuel-entries/:id` | Yakıt sil | fuel:delete |
| POST | `/fuel-entries/import` | CSV import | fuel:create |
| GET | `/fuel-entries/export` | Export | fuel:export |
| GET | `/fuel-entries/analytics` | Tüketim analizi | fuel:view |
| | | | |
| GET | `/fuel-anomaly-rules` | Anomali kuralları | fuel:view |
| POST | `/fuel-anomaly-rules` | Kural oluştur | fuel:create |
| PUT | `/fuel-anomaly-rules/:id` | Kural güncelle | fuel:update |
| DELETE | `/fuel-anomaly-rules/:id` | Kural sil | fuel:delete |

---

## 8. Lastik

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| GET | `/tires` | Lastik envanteri | tires:view |
| POST | `/tires` | Lastik oluştur | tires:create |
| GET | `/tires/:id` | Lastik detay | tires:view |
| PUT | `/tires/:id` | Lastik güncelle | tires:update |
| DELETE | `/tires/:id` | Lastik sil | tires:delete |
| GET | `/tires/export` | Export | tires:export |
| | | | |
| GET | `/tire-fittings` | Takma/çıkarma kayıtları | tires:view |
| POST | `/tire-fittings` | Lastik tak | tires:create |
| POST | `/tire-fittings/:id/remove` | Lastik çıkar | tires:update |
| | | | |
| GET | `/tire-inspections` | Muayene kayıtları | tires:view |
| POST | `/tire-inspections` | Muayene ekle | tires:create |
| | | | |
| GET | `/tire-rotation-plans` | Rotasyon planları | tires:view |
| POST | `/tire-rotation-plans` | Plan oluştur | tires:create |
| PUT | `/tire-rotation-plans/:id` | Plan güncelle | tires:update |

---

## 9. Cezalar

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| GET | `/penalties` | Ceza listesi | penalties:view |
| POST | `/penalties` | Ceza oluştur | penalties:create |
| GET | `/penalties/:id` | Ceza detay | penalties:view |
| PUT | `/penalties/:id` | Ceza güncelle | penalties:update |
| DELETE | `/penalties/:id` | Ceza sil | penalties:delete |
| POST | `/penalties/:id/pay` | Ödeme kayıt | penalties:update |
| POST | `/penalties/:id/dispute` | İtiraz başlat → talep oluşturur | penalties:create |
| POST | `/penalties/:id/match-driver` | Sürücü eşleştir (otomatik) | penalties:update |
| POST | `/penalties/:id/charge-back` | Sürücüye rücu | penalties:update |
| GET | `/penalties/export` | Export | penalties:export |
| GET | `/penalties/driver-report` | Sürücü bazlı ceza raporu | penalties:view |

---

## 10. Giderler & Bütçe

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| GET | `/expenses` | Gider listesi | expenses:view |
| POST | `/expenses` | Gider oluştur | expenses:create |
| GET | `/expenses/:id` | Gider detay | expenses:view |
| PUT | `/expenses/:id` | Gider güncelle | expenses:update |
| DELETE | `/expenses/:id` | Gider sil | expenses:delete |
| GET | `/expenses/export` | Export | expenses:export |
| GET | `/expenses/tco` | TCO raporu | expenses:view |
| | | | |
| GET | `/expense-categories` | Kategoriler | expenses:view |
| POST | `/expense-categories` | Kategori oluştur | expenses:create |
| PUT | `/expense-categories/:id` | Kategori güncelle | expenses:update |
| DELETE | `/expense-categories/:id` | Kategori sil | expenses:delete |
| | | | |
| GET | `/budgets` | Bütçeler | expenses:view |
| POST | `/budgets` | Bütçe oluştur | expenses:create |
| PUT | `/budgets/:id` | Bütçe güncelle | expenses:update |
| DELETE | `/budgets/:id` | Bütçe sil | expenses:delete |
| GET | `/budgets/status` | Bütçe vs harcama karşılaştırma | expenses:view |

---

## 11. Evrak & Sözleşme

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| GET | `/documents` | Evrak listesi | documents:view |
| POST | `/documents` | Evrak oluştur + upload | documents:create |
| GET | `/documents/:id` | Evrak detay | documents:view |
| PUT | `/documents/:id` | Evrak güncelle | documents:update |
| DELETE | `/documents/:id` | Evrak sil | documents:delete |
| GET | `/documents/:id/download` | Dosya indir (signed URL) | documents:view |
| GET | `/documents/export` | Toplu download (ZIP) | documents:export |
| GET | `/documents/expiring` | Yaklaşan bitiş tarihleri | documents:view |
| | | | |
| GET | `/document-types` | Belge türleri | documents:view |
| POST | `/document-types` | Tür oluştur | documents:create |
| PUT | `/document-types/:id` | Tür güncelle | documents:update |
| DELETE | `/document-types/:id` | Tür sil | documents:delete |

---

## 12. Raporlar

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| GET | `/reports/dashboard` | Dashboard KPI verileri | reports:view |
| GET | `/reports/fuel` | Yakıt raporu | reports:view |
| GET | `/reports/expenses` | Gider raporu | reports:view |
| GET | `/reports/penalties` | Ceza raporu | reports:view |
| GET | `/reports/tires` | Lastik raporu | reports:view |
| GET | `/reports/maintenance` | Bakım raporu | reports:view |
| GET | `/reports/tco` | TCO raporu | reports:view |
| GET | `/reports/vehicles` | Araç raporu | reports:view |
| POST | `/reports/export` | Rapor export (async job) | reports:export |
| GET | `/reports/export/:jobId` | Export durumu / indirme | reports:export |
| | | | |
| GET | `/saved-reports` | Kaydedilmiş raporlar | reports:view |
| POST | `/saved-reports` | Rapor kaydet | reports:create |
| PUT | `/saved-reports/:id` | Rapor güncelle | reports:update |
| DELETE | `/saved-reports/:id` | Rapor sil | reports:delete |

---

## 13. Kiralık Araç

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| GET | `/rental-contracts` | Sözleşme listesi | rentals:view |
| POST | `/rental-contracts` | Sözleşme oluştur | rentals:create |
| GET | `/rental-contracts/:id` | Sözleşme detay | rentals:view |
| PUT | `/rental-contracts/:id` | Sözleşme güncelle | rentals:update |
| DELETE | `/rental-contracts/:id` | Sözleşme sil | rentals:delete |
| GET | `/rental-contracts/export` | Export | rentals:export |
| | | | |
| GET | `/rental-invoices` | Fatura listesi | rentals:view |
| POST | `/rental-invoices` | Fatura oluştur | rentals:create |
| GET | `/rental-invoices/:id` | Fatura detay | rentals:view |
| PUT | `/rental-invoices/:id` | Fatura güncelle | rentals:update |
| POST | `/rental-invoices/:id/pay` | Ödeme kayıt | rentals:update |

---

## 14. Bildirimler

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| GET | `/notifications` | Kullanıcının bildirimleri | Auth |
| GET | `/notifications/unread-count` | Okunmamış sayısı | Auth |
| PUT | `/notifications/:id/read` | Okundu olarak işaretle | Auth |
| PUT | `/notifications/read-all` | Tümünü okundu yap | Auth |
| | | | |
| GET | `/notification-rules` | Bildirim kuralları | settings:view |
| POST | `/notification-rules` | Kural oluştur | settings:create |
| PUT | `/notification-rules/:id` | Kural güncelle | settings:update |
| DELETE | `/notification-rules/:id` | Kural sil | settings:delete |
| | | | |
| GET | `/webhooks` | Webhook listesi | settings:view |
| POST | `/webhooks` | Webhook oluştur | settings:create |
| PUT | `/webhooks/:id` | Webhook güncelle | settings:update |
| DELETE | `/webhooks/:id` | Webhook sil | settings:delete |
| POST | `/webhooks/:id/test` | Test webhook | settings:update |

---

## 15. Dosya Yönetimi

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| POST | `/files/upload` | Dosya yükle (multipart) | Auth |
| GET | `/files/:id` | Dosya meta | Auth |
| GET | `/files/:id/url` | Signed download URL | Auth |
| DELETE | `/files/:id` | Dosya sil | Auth |

---

## 16. GPS/Telematik (Placeholder)

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| GET | `/telematics/providers` | Provider listesi | telematics:view |
| POST | `/telematics/providers` | Provider ekle | telematics:create |
| PUT | `/telematics/providers/:id` | Provider güncelle | telematics:update |
| GET | `/telematics/vehicles/:vehicleId/location` | Son konum | telematics:view |
| GET | `/telematics/vehicles/:vehicleId/route` | Rota geçmişi | telematics:view |
| GET | `/telematics/vehicles/:vehicleId/driving-behavior` | Sürüş davranışı | telematics:view |

---

## 17. Ayarlar

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| GET | `/settings/tenant` | Tenant ayarları | settings:view |
| PUT | `/settings/tenant` | Tenant güncelle (ad, logo, para birimi) | settings:update |
| GET | `/settings/integrations` | Entegrasyon durumları | settings:view |
| PUT | `/settings/integrations/:type` | Entegrasyon güncelle | settings:update |

---

## 18. Audit Log

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| GET | `/activity-logs` | Audit log listesi (paginated, filterable) | audit:view |
| GET | `/activity-logs/export` | Audit log export | audit:export |

---

## 19. Super Admin (Ayrı prefix: `/api/v1/admin`)

| Method | Endpoint | Açıklama | İzin |
|--------|----------|----------|------|
| GET | `/admin/tenants` | Tenant listesi | Super Admin |
| POST | `/admin/tenants` | Tenant oluştur | Super Admin |
| GET | `/admin/tenants/:id` | Tenant detay | Super Admin |
| PUT | `/admin/tenants/:id` | Tenant güncelle | Super Admin |
| PUT | `/admin/tenants/:id/plan` | Plan değiştir | Super Admin |
| PUT | `/admin/tenants/:id/suspend` | Askıya al | Super Admin |
| PUT | `/admin/tenants/:id/activate` | Aktifleştir | Super Admin |
| GET | `/admin/stats` | Platform istatistikleri | Super Admin |
| GET | `/admin/system-settings` | Sistem ayarları | Super Admin |
| PUT | `/admin/system-settings` | Sistem ayarları güncelle | Super Admin |
| GET | `/admin/logs` | Sistem logları | Super Admin |

---

## Toplam Endpoint Sayısı: ~160+
