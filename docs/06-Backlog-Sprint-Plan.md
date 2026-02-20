# OtoEvery — Satılabilir v1 Backlog & Sprint Planı

> 2 haftalık sprint'ler · 4 kişilik ekip (1 Backend, 1 Frontend, 1 Full-Stack, 1 QA)
> Toplam süre: ~16 hafta (8 sprint)

---

## Sprint 0 — Hazırlık (Hafta 1-2)

**Hedef:** Geliştirme ortamı, mimari altyapı, CI/CD

| # | Görev | Sorumlu | Story Point |
|---|-------|---------|-------------|
| S0-01 | Monorepo kurulumu (Turborepo: `apps/web`, `apps/api`, `packages/shared`) | Full-Stack | 3 |
| S0-02 | PostgreSQL + Redis Docker Compose | Backend | 2 |
| S0-03 | Next.js 14 boilerplate + AppShell + Sidebar + TopBar | Frontend | 5 |
| S0-04 | Express/Fastify API boilerplate + Prisma setup | Backend | 5 |
| S0-05 | Auth sistemi (JWT + refresh + 2FA placeholder) | Backend | 8 |
| S0-06 | RBAC middleware + permission seed data | Backend | 5 |
| S0-07 | RLS (Row Level Security) + tenant isolation middleware | Backend | 5 |
| S0-08 | i18n altyapısı (i18next TR/EN + tarih/para formatı) | Frontend | 3 |
| S0-09 | Design system: Button, Input, Select, Modal, Toast, Badge, FormField | Frontend | 8 |
| S0-10 | DataTable component (pagination, sort, filter, column selector) | Frontend | 8 |
| S0-11 | File upload altyapısı (S3/MinIO + signed URL) | Backend | 5 |
| S0-12 | Activity log middleware (auto audit) | Backend | 3 |
| S0-13 | CI/CD pipeline (lint, test, build, docker) | Full-Stack | 3 |
| S0-14 | Rate limiting middleware | Backend | 2 |
| **Toplam** | | | **65** |

---

## Sprint 1 — Araç & Envanter + Çalışanlar (Hafta 3-4)

| # | Görev | Sorumlu | SP |
|---|-------|---------|-----|
| S1-01 | `vehicles` DB migration + CRUD API | Backend | 5 |
| S1-02 | `vehicle_groups`, `vehicle_tags` API | Backend | 3 |
| S1-03 | `employees` DB migration + CRUD API | Backend | 5 |
| S1-04 | Araç listesi sayfası (DataTable + filtreler + saved filters) | Frontend | 8 |
| S1-05 | Araç oluşturma/düzenleme formu | Frontend | 5 |
| S1-06 | Araç detay sayfası (sekmeli yapı, genel sekme) | Frontend | 5 |
| S1-07 | CSV import wizard (araç) | Full-Stack | 8 |
| S1-08 | CSV/XLSX export | Full-Stack | 3 |
| S1-09 | KM güncelleme + km_logs | Full-Stack | 3 |
| S1-10 | Araç grupları + etiket yönetimi (UI + API) | Full-Stack | 5 |
| S1-11 | Çalışan listesi + CRUD sayfaları | Frontend | 5 |
| S1-12 | Toplu işlem bar (durum değiştirme) | Frontend | 3 |
| S1-13 | Tenant isolation testleri (araç modülü) | QA | 5 |
| S1-14 | RBAC testleri (araç modülü) | QA | 3 |
| **Toplam** | | | **66** |

---

## Sprint 2 — Zimmet + Talep/Onay Akışı (Hafta 5-6)

| # | Görev | Sorumlu | SP |
|---|-------|---------|-----|
| S2-01 | `assignments` DB migration + CRUD API | Backend | 5 |
| S2-02 | Zimmet ver/bitir endpoints + iş mantığı (araç durumu güncelleme) | Backend | 5 |
| S2-03 | Teslim tutanağı PDF oluşturma (PDFKit/puppeteer) | Backend | 5 |
| S2-04 | Zimmet listesi + ver/bitir UI | Frontend | 5 |
| S2-05 | Zimmet timeline component | Frontend | 3 |
| S2-06 | `requests`, `request_types`, `request_approvals`, `request_comments` API | Backend | 8 |
| S2-07 | 2 seviyeli onay akışı mantığı | Backend | 8 |
| S2-08 | Talep listesi sayfası (liste + filtreler) | Frontend | 5 |
| S2-09 | KanbanBoard component + talep Kanban görünümü | Frontend | 8 |
| S2-10 | Talep detay sayfası (onay akışı, yorumlar, ekler) | Frontend | 8 |
| S2-11 | Talep formu (tür, öncelik, açıklama, dosya ekleri) | Frontend | 5 |
| S2-12 | Onay akışı testleri (2 seviye) | QA | 5 |
| **Toplam** | | | **70** |

---

## Sprint 3 — Yakıt + Ceza (Hafta 7-8)

| # | Görev | Sorumlu | SP |
|---|-------|---------|-----|
| S3-01 | `fuel_entries`, `fuel_anomaly_rules` API | Backend | 5 |
| S3-02 | Yakıt anomali tespit servisi | Backend | 5 |
| S3-03 | Yakıt CSV import | Backend | 5 |
| S3-04 | Yakıt listesi sayfası + anomali flag | Frontend | 5 |
| S3-05 | Yakıt formu (kayıt + düzenleme) | Frontend | 3 |
| S3-06 | Yakıt tüketim analiz sayfası (grafikler) | Frontend | 8 |
| S3-07 | `penalties`, `penalty_disputes` API | Backend | 5 |
| S3-08 | Ceza-sürücü otomatik eşleştirme (zimmet tarih kontrolü) | Backend | 5 |
| S3-09 | Ceza listesi sayfası + ödeme/itiraz akışı | Frontend | 5 |
| S3-10 | Ceza formu + ödeme kayıt + dekont upload | Frontend | 5 |
| S3-11 | Sürücü rücu raporu | Full-Stack | 3 |
| S3-12 | Araç detay: yakıt + ceza sekmeleri entegrasyonu | Frontend | 3 |
| S3-13 | Ceza-sürücü eşleştirme testleri | QA | 3 |
| **Toplam** | | | **60** |

---

## Sprint 4 — Gider + Bütçe + Evrak (Hafta 9-10)

| # | Görev | Sorumlu | SP |
|---|-------|---------|-----|
| S4-01 | `expense_categories`, `expenses`, `budgets` API | Backend | 5 |
| S4-02 | Bütçe aşım kontrolü mantığı | Backend | 3 |
| S4-03 | Gider listesi + form + kategori ağacı | Frontend | 8 |
| S4-04 | Fatura/fiş upload + OCR placeholder UI | Frontend | 3 |
| S4-05 | Bütçe tanım + bütçe vs harcama sayfası | Frontend | 5 |
| S4-06 | TCO raporu (araç bazlı) | Full-Stack | 5 |
| S4-07 | `documents`, `document_types` API | Backend | 5 |
| S4-08 | Evrak otomatik hatırlatma servisi (30/15/7 gün) | Backend | 5 |
| S4-09 | Evrak listesi + form + dosya upload | Frontend | 5 |
| S4-10 | Evrak bitiş tarihi uyarı paneli | Frontend | 3 |
| S4-11 | Araç detay: gider + evrak sekmeleri | Frontend | 3 |
| S4-12 | Güvenli dosya erişimi (signed URL) testleri | QA | 3 |
| **Toplam** | | | **53** |

---

## Sprint 5 — Lastik + Kiralık Araç (Hafta 11-12)

| # | Görev | Sorumlu | SP |
|---|-------|---------|-----|
| S5-01 | `tire_assets`, `tire_fittings`, `tire_inspections`, `tire_rotation_plans` API | Backend | 8 |
| S5-02 | Lastik stok sayfası + CRUD | Frontend | 5 |
| S5-03 | Araç üzeri lastik pozisyon diyagramı | Frontend | 8 |
| S5-04 | Rotasyon planı + takvim | Frontend | 5 |
| S5-05 | Lastik maliyet/ömür raporu | Full-Stack | 5 |
| S5-06 | `rental_contracts`, `rental_invoices` API | Backend | 5 |
| S5-07 | Kiralık sözleşme liste + form | Frontend | 5 |
| S5-08 | Kiralık fatura takip | Frontend | 3 |
| S5-09 | Sözleşme hatırlatma servisi | Backend | 3 |
| S5-10 | Araç detay: lastik sekmesi | Frontend | 3 |
| S5-11 | Lastik hatırlatma testleri | QA | 2 |
| **Toplam** | | | **52** |

---

## Sprint 6 — Bildirim Sistemi + Raporlar + Dashboard (Hafta 13-14)

| # | Görev | Sorumlu | SP |
|---|-------|---------|-----|
| S6-01 | Bildirim servisi (notification dispatcher) | Backend | 8 |
| S6-02 | Panel içi bildirim (WebSocket/SSE + notification center) | Full-Stack | 8 |
| S6-03 | E-posta bildirim (SMTP, şablonlar TR/EN) | Backend | 5 |
| S6-04 | Webhook outgoing (retry logic, HMAC) | Backend | 5 |
| S6-05 | Bildirim kuralları yönetimi UI | Frontend | 5 |
| S6-06 | Dashboard sayfası (KPI kartları + grafikler) | Frontend | 8 |
| S6-07 | Dashboard API (aggregation queries) | Backend | 5 |
| S6-08 | Rapor oluşturucu (saved reports) | Full-Stack | 8 |
| S6-09 | Export engine (CSV/XLSX/PDF async) | Backend | 5 |
| S6-10 | Rapor sayfaları UI | Frontend | 5 |
| S6-11 | Bildirim gönderim testleri | QA | 3 |
| **Toplam** | | | **65** |

---

## Sprint 7 — Ayarlar + GPS Placeholder + Polish (Hafta 15-16)

| # | Görev | Sorumlu | SP |
|---|-------|---------|-----|
| S7-01 | Ayarlar: Firma profili sayfası | Frontend | 3 |
| S7-02 | Ayarlar: Kullanıcı yönetimi + davet sistemi | Full-Stack | 5 |
| S7-03 | Ayarlar: Rol/izin matrisi UI | Frontend | 5 |
| S7-04 | Ayarlar: Entegrasyon sayfası (placeholder) | Frontend | 3 |
| S7-05 | GPS/Telematik: adapter pattern + data model + placeholder UI | Full-Stack | 8 |
| S7-06 | Super Admin paneli (tenant CRUD, istatistikler) | Full-Stack | 8 |
| S7-07 | Onboarding wizard (firma, CSV import, kullanıcı davet) | Full-Stack | 8 |
| S7-08 | Login + forgot password + 2FA UI | Frontend | 5 |
| S7-09 | Tüm modüller dark mode uyumluluk | Frontend | 5 |
| S7-10 | Performance: query optimization, indeks review | Backend | 3 |
| S7-11 | Error tracking entegrasyon noktası (Sentry) | Full-Stack | 2 |
| **Toplam** | | | **55** |

---

## Sprint 8 — QA, Bug Fix, Release (Hafta 17-18)

| # | Görev | Sorumlu | SP |
|---|-------|---------|-----|
| S8-01 | E2E testler: tenant izolasyonu | QA | 8 |
| S8-02 | E2E testler: RBAC tüm roller | QA | 8 |
| S8-03 | E2E testler: talep 2 seviyeli onay akışı | QA | 5 |
| S8-04 | E2E testler: ceza-sürücü eşleştirme | QA | 3 |
| S8-05 | E2E testler: bildirim / hatırlatma | QA | 5 |
| S8-06 | Güvenlik taraması (OWASP top 10) | Full-Stack | 5 |
| S8-07 | Performans testleri (k6/artillery) | Backend | 5 |
| S8-08 | Bug fix sprint | Tüm Ekip | 13 |
| S8-09 | Dokümantasyon (API docs, kullanıcı kılavuzu taslağı) | Full-Stack | 5 |
| S8-10 | Production Docker image + deploy | Full-Stack | 5 |
| S8-11 | Demo verileri (seed data) | Backend | 3 |
| **Toplam** | | | **65** |

---

## Özet

| Sprint | Hafta | Odak | SP |
|--------|-------|------|-----|
| 0 | 1-2 | Altyapı & Mimari | 65 |
| 1 | 3-4 | Araç & Envanter | 66 |
| 2 | 5-6 | Zimmet & Talep | 70 |
| 3 | 7-8 | Yakıt & Ceza | 60 |
| 4 | 9-10 | Gider & Evrak | 53 |
| 5 | 11-12 | Lastik & Kiralık | 52 |
| 6 | 13-14 | Bildirim & Rapor | 65 |
| 7 | 15-16 | Ayarlar & GPS & Polish | 55 |
| 8 | 17-18 | QA & Release | 65 |
| **Toplam** | **~18 hafta** | | **~551 SP** |

---

## Risk & Mitigasyon

| Risk | Etki | Mitigasyon |
|------|------|------------|
| PDF oluşturma performansı | Orta | Queue-based async generation |
| Büyük CSV import timeout | Yüksek | Background job + progress tracking |
| Raporlama sorgu performansı | Yüksek | Materialized views, Redis cache |
| RLS karmaşıklığı | Yüksek | Sprint 0'da erken doğrulama |
| Ekip genişlemesi gereksinimi | Orta | Sprint 2 sonrası değerlendir |
