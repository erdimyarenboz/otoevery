# OtoEvery — UI Planı & Component Listesi

---

## 1. Tasarım Prensipleri

- **Kurumsal B2B admin panel**: Temiz, profesyonel, minimal gürültü.
- **Layout**: Sol sidebar (collapsible 240px/64px) + üst bar (56px) + içerik alanı.
- **Renk paleti**: Primary #1B4DFF (koyu mavi), Secondary #10B981 (yeşil), Danger #EF4444, Warning #F59E0B, Neutral grays.
- **Dark mode**: Desteklenir (`prefers-color-scheme` + manual toggle).
- **Tipografi**: Inter (Google Fonts), base 14px.
- **Responsive**: Desktop-first, tablet (sidebar overlay), mobile (hamburger).
- **Tablolar**: Server-side pagination, sıralama, filtre, sütun seçici, satır seçimi (toplu işlem).

---

## 2. Layout Components

| Component | Açıklama |
|-----------|----------|
| `AppShell` | Sidebar + TopBar + ContentArea wrapper |
| `Sidebar` | Logo, navigation items, collapse toggle, active indicator, role-based visibility |
| `TopBar` | Breadcrumb, global search, notification bell, language switcher, user menu |
| `ContentArea` | Sayfa routing alanı, scroll container |
| `PageHeader` | Başlık + açıklama + aksiyon butonları (Yeni Ekle, Export, Import) |

---

## 3. Ortak (Shared) Components

### Data Display
| Component | Açıklama |
|-----------|----------|
| `DataTable` | Server-side paginated tablo, sıralama, filtre, sütun seçici, satır seçimi, toplu aksiyon bar |
| `KPICard` | Başlık + değer + trend (ok yukarı/aşağı) + sparkline |
| `StatCard` | İkon + başlık + değer (daha basit versiyon) |
| `Badge` | Durum badge (renk + label) |
| `Timeline` | Zaman çizelgesi (zimmet geçmişi, durum geçişi) |
| `EmptyState` | İkon + mesaj + CTA butonu |

### Form Components
| Component | Açıklama |
|-----------|----------|
| `FormField` | Label + input + error message + helper text |
| `TextInput` | Standart text input |
| `NumberInput` | Sayı girişi (min/max, step) |
| `SelectInput` | Tekli/çoklu seçim, searchable |
| `DatePicker` | Tarih seçici (range desteği) |
| `DateRangePicker` | Tarih aralığı seçici |
| `FileUpload` | Drag & drop, çoklu dosya, tip/boyut validasyonu, progress |
| `TagInput` | Etiket ekleme/çıkarma |
| `CurrencyInput` | Para birimi formatlı input |
| `PlateInput` | Plaka formatı validasyonlu input |
| `TextArea` | Çok satırlı metin |
| `Checkbox` | Tekli checkbox |
| `RadioGroup` | Radio buton grubu |
| `Switch` | Toggle switch |
| `FormSection` | Form gruplama (başlık + açıklama + alanlar) |

### Navigation & Actions
| Component | Açıklama |
|-----------|----------|
| `Button` | Primary/secondary/ghost/danger varyantları, loading state, icon desteği |
| `IconButton` | Sadece ikon buton |
| `DropdownMenu` | Aksiyon menüsü (tablo satır, page header) |
| `Tabs` | Sekme navigasyon (araç detay) |
| `Breadcrumb` | Sayfa hiyerarşisi |
| `Pagination` | Sayfa numaraları + per page seçimi |

### Feedback & Overlay
| Component | Açıklama |
|-----------|----------|
| `Modal` | Dialog kutusu (confirm, form, bilgi) |
| `Drawer` | Sağdan açılan panel (detay görüntüleme, hızlı düzenleme) |
| `Toast` | Bildirim pop-up (success/error/warning/info) |
| `Alert` | Sayfa içi uyarı banner |
| `Tooltip` | Hover bilgi |
| `ConfirmDialog` | Silme/kritik aksiyon onayı |
| `LoadingSpinner` | Yükleniyor göstergesi |
| `Skeleton` | İçerik yüklenirken placeholder |
| `ProgressBar` | İlerleme çubuğu (import işlemleri) |

### Filters & Search
| Component | Açıklama |
|-----------|----------|
| `FilterPanel` | Filtre alanları container (collapsible) |
| `SavedFilterSelect` | Kaydedilmiş filtre seçimi + CRUD |
| `ColumnSelector` | Tablo sütunlarını göster/gizle |
| `SearchInput` | Global / lokal arama, debounced |
| `QuickFilter` | Hızlı filtre chip'leri (durum, araç grubu) |

---

## 4. Modül-Spesifik Components

### Araç Modülü
| Component | Açıklama |
|-----------|----------|
| `VehicleCard` | Araç grid görünümü kartı (plaka, marka, durum) |
| `VehicleDetailTabs` | 8 sekmeli araç detay container |
| `KilometerUpdate` | KM güncelleme mini formu |
| `VehicleStatusBadge` | Aktif/Pasif/Bakımda/Satıldı durumu |
| `BulkActionBar` | Toplu seçim sonrası aksiyon çubuğu |
| `CSVImportWizard` | 3 adımlı import sihirbazı (dosya seç → eşleştir → sonuç) |

### Zimmet Modülü
| Component | Açıklama |
|-----------|----------|
| `AssignmentTimeline` | Araç/kişi zimmet geçmişi timeline |
| `HandoverForm` | Teslim tutanağı formu |
| `DigitalSignature` | İmza alanı (placeholder, e-imzaya hazır) |

### Talep Modülü
| Component | Açıklama |
|-----------|----------|
| `KanbanBoard` | Sürükle-bırak Kanban görünümü |
| `KanbanColumn` | Durum sütunu |
| `KanbanCard` | Talep özet kartı |
| `ApprovalFlow` | 2 seviyeli onay görsel akışı |
| `CommentThread` | Yorum listesi + yeni yorum |
| `SLAIndicator` | SLA durumu (yeşil/sarı/kırmızı) |

### Yakıt Modülü
| Component | Açıklama |
|-----------|----------|
| `FuelChart` | Tüketim grafikleri (bar/line) |
| `AnomalyFlag` | Anomali uyarı badge'i |
| `ConsumptionTable` | Araç/sürücü/aylık tüketim tablosu |

### Lastik Modülü
| Component | Açıklama |
|-----------|----------|
| `TirePositionDiagram` | Araç üzeri lastik pozisyonları görsel |
| `TireDepthGauge` | Diş derinliği göstergesi |
| `RotationPlanCalendar` | Rotasyon takvimi |

### Ceza Modülü
| Component | Açıklama |
|-----------|----------|
| `PenaltyDriverMatch` | Ceza-sürücü eşleştirme sonucu |
| `PaymentStatus` | Ödeme durumu göstergesi |

### Gider Modülü
| Component | Açıklama |
|-----------|----------|
| `BudgetGauge` | Bütçe kullanım gauge chart |
| `ExpenseCategoryTree` | Kategori ağacı |
| `TCOReport` | Toplam sahip olma maliyeti kartları |
| `InvoicePreview` | Fatura/fiş önizleme |

### Evrak Modülü
| Component | Açıklama |
|-----------|----------|
| `ExpiryAlert` | Bitiş tarihine yaklaşan evraklar listesi |
| `DocumentPreview` | Dosya önizleme (PDF/resim) |

### Rapor Modülü
| Component | Açıklama |
|-----------|----------|
| `ReportBuilder` | Saved report oluşturma formu |
| `ChartWidget` | Çeşitli grafik tipleri (bar, line, pie, donut) |
| `ExportButton` | CSV/XLSX/PDF export butonları |

### Bildirim
| Component | Açıklama |
|-----------|----------|
| `NotificationCenter` | Bildirim paneli (bell icon dropdown) |
| `NotificationItem` | Tekil bildirim satırı (ikon, mesaj, zaman, okundu/okunmadı) |
| `NotificationRuleForm` | Kural oluşturma/düzenleme formu |

---

## 5. Sayfa Listesi (Wireframe Özeti)

| # | Sayfa | Layout | Ana Component'ler |
|---|-------|--------|-------------------|
| 1 | Login | Ortada form | TextInput × 2, Button, Link |
| 2 | Forgot Password | Ortada form | TextInput, Button |
| 3 | Onboarding Step 1 | Wizard | FormSection (firma bilgileri) |
| 4 | Onboarding Step 2 | Wizard | CSVImportWizard (araç) |
| 5 | Onboarding Step 3 | Wizard | Kullanıcı davet formu |
| 6 | Dashboard | Grid | KPICard × 7, ChartWidget × 3, ExpiryAlert |
| 7 | Araç Listesi | DataTable | DataTable, FilterPanel, SavedFilterSelect, BulkActionBar |
| 8 | Araç Detay | Tabs | VehicleDetailTabs, 8 sekme paneli |
| 9 | Araç Formu | Form | FormSection × 3, SelectInput, PlateInput |
| 10 | Araç Grupları | DataTable + Modal | DataTable, Modal (CRUD) |
| 11 | Zimmet Listesi | DataTable | DataTable, FilterPanel |
| 12 | Zimmet Ver/Bitir | Form/Drawer | SelectInput (araç, kişi), DatePicker, HandoverForm |
| 13 | Talepler (Kanban) | KanbanBoard | KanbanBoard, KanbanColumn, KanbanCard |
| 14 | Talepler (Liste) | DataTable | DataTable, FilterPanel, SLAIndicator |
| 15 | Talep Detay | Detail + Sidebar | ApprovalFlow, CommentThread, FileUpload |
| 16 | Talep Formu | Form | SelectInput (tür, öncelik), TextArea, FileUpload |
| 17 | Yakıt Listesi | DataTable | DataTable, AnomalyFlag, FilterPanel |
| 18 | Yakıt Formu | Form/Drawer | Form alanları, CurrencyInput, NumberInput |
| 19 | Yakıt Analiz | Charts | FuelChart, ConsumptionTable, DateRangePicker |
| 20 | Lastik Stok | DataTable | DataTable, FilterPanel |
| 21 | Lastik Araç Üzeri | Visual | TirePositionDiagram, TireDepthGauge |
| 22 | Ceza Listesi | DataTable | DataTable, PenaltyDriverMatch, PaymentStatus |
| 23 | Ceza Formu | Form/Drawer | Form alanları, CurrencyInput, FileUpload |
| 24 | Gider Listesi | DataTable | DataTable, FilterPanel, InvoicePreview |
| 25 | Gider Formu | Form | ExpenseCategoryTree, FileUpload, CurrencyInput |
| 26 | Bütçe Yönetimi | DataTable + Chart | DataTable, BudgetGauge |
| 27 | Evrak Listesi | DataTable | DataTable, ExpiryAlert, DocumentPreview |
| 28 | Evrak Formu | Form | SelectInput (tür), DatePicker, FileUpload, TagInput |
| 29 | Rapor Dashboard | Grid | ChartWidget × N, FilterPanel, ExportButton |
| 30 | Saved Reports | DataTable | DataTable, ReportBuilder |
| 31 | Kiralık Sözleşme Listesi | DataTable | DataTable, FilterPanel |
| 32 | Kiralık Sözleşme Formu | Form | Form alanları, CurrencyInput, DateRangePicker |
| 33 | Kiralık Fatura Listesi | DataTable | DataTable, PaymentStatus |
| 34 | Ayarlar - Firma Profili | Form | Logo upload, TextInput, SelectInput |
| 35 | Ayarlar - Kullanıcılar | DataTable + Modal | DataTable, Modal (davet/düzenle) |
| 36 | Ayarlar - Roller | Matrix | İzin matrisi tablosu (modül × aksiyon checkboxlar) |
| 37 | Ayarlar - Bildirim Kuralları | DataTable + Form | Kural listesi, NotificationRuleForm |
| 38 | Ayarlar - Entegrasyonlar | Card list | Entegrasyon kartları, config formları |
| 39 | SA - Dashboard | Grid | StatCard'lar (tenant, user, MRR) |
| 40 | SA - Tenant Yönetimi | DataTable | DataTable, Drawer (tenant detay) |
| 41 | SA - Planlar | Card + Form | Plan kartları, düzenleme |
| 42 | SA - Sistem Ayarları | Form | SMTP, S3 config formları |

---

## 6. Responsive Breakpoints

| Breakpoint | Genişlik | Davranış |
|------------|----------|----------|
| Desktop | ≥ 1280px | Sidebar açık, tüm sütunlar |
| Tablet | 768–1279px | Sidebar overlay, bazı sütunlar gizli |
| Mobile | < 768px | Hamburger menü, tek sütun, kart görünümü |

---

## 7. Grafik Kütüphanesi

**Recharts** (React uyumlu, customizable, lightweight).  
Alternatif: Chart.js veya Nivo.

Grafik tipleri: Bar, Line, Pie/Donut, Area, Stacked Bar, Gauge.
