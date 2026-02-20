# OtoEvery — Veritabanı Şeması

> PostgreSQL 16 · Prisma ORM · Multi-tenant (RLS + tenant_id)

---

## Genel Kurallar

1. **Her tabloda** `tenant_id UUID NOT NULL` (Super Admin tabloları hariç).
2. **Soft delete**: `deleted_at TIMESTAMPTZ NULL` (silinen kayıtlar filtrelenir).
3. **Audit alanları**: `created_at`, `updated_at`, `created_by`, `updated_by`.
4. **Primary key**: `id UUID DEFAULT gen_random_uuid()`.
5. **RLS policy**: Her tablo için `USING (tenant_id = current_setting('app.current_tenant')::uuid)`.
6. **İndeksler**: `tenant_id` + sık filtrelenen alanlar composite index.

---

## 1. Core / Auth Tabloları

### `tenants`
```sql
CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,
  logo_url      TEXT,
  address       TEXT,
  phone         VARCHAR(50),
  email         VARCHAR(255),
  tax_id        VARCHAR(50),
  currency      VARCHAR(3) DEFAULT 'TRY',
  locale        VARCHAR(5) DEFAULT 'tr',
  plan          VARCHAR(50) DEFAULT 'trial',  -- trial/starter/professional/enterprise
  status        VARCHAR(20) DEFAULT 'active', -- active/suspended/cancelled
  settings      JSONB DEFAULT '{}',           -- tenant-specific config
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);
```

### `users`
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id),  -- NULL for super admin
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  phone         VARCHAR(50),
  avatar_url    TEXT,
  is_super_admin BOOLEAN DEFAULT FALSE,
  status        VARCHAR(20) DEFAULT 'active', -- active/inactive/invited
  totp_secret   TEXT,                         -- 2FA (encrypted)
  totp_enabled  BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  locale        VARCHAR(5) DEFAULT 'tr',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ,
  created_by    UUID REFERENCES users(id),
  updated_by    UUID REFERENCES users(id),
  UNIQUE(tenant_id, email)
);
CREATE INDEX idx_users_tenant ON users(tenant_id) WHERE deleted_at IS NULL;
```

### `roles`
```sql
CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(id),
  name        VARCHAR(100) NOT NULL,  -- Firma Admin, Filo Yöneticisi, etc.
  slug        VARCHAR(100) NOT NULL,
  description TEXT,
  is_system   BOOLEAN DEFAULT FALSE,  -- sistem rolleri silinemez
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);
```

### `permissions`
```sql
CREATE TABLE permissions (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module  VARCHAR(50) NOT NULL,   -- vehicles, fuel, expenses, etc.
  action  VARCHAR(20) NOT NULL,   -- view, create, update, delete, approve, export
  UNIQUE(module, action)
);
```

### `role_permissions`
```sql
CREATE TABLE role_permissions (
  role_id       UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
```

### `user_roles`
```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);
```

---

## 2. Araç & Envanter

### `vehicles`
```sql
CREATE TABLE vehicles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  plate           VARCHAR(20) NOT NULL,
  brand           VARCHAR(100),
  model           VARCHAR(100),
  year            SMALLINT,
  chassis_no      VARCHAR(50),       -- encrypted
  engine_no       VARCHAR(50),       -- encrypted
  fuel_type       VARCHAR(20),       -- benzin/dizel/lpg/elektrik/hibrit
  current_km      INTEGER DEFAULT 0,
  last_km_update  TIMESTAMPTZ,
  location        VARCHAR(255),
  department      VARCHAR(100),
  status          VARCHAR(20) DEFAULT 'active', -- active/passive/maintenance/sold
  ownership       VARCHAR(20) DEFAULT 'owned',  -- owned/rented
  color           VARCHAR(50),
  seat_count      SMALLINT,
  vehicle_class   VARCHAR(50),       -- binek/ticari/kamyon/minibüs
  insurance_class VARCHAR(50),
  notes           TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  UNIQUE(tenant_id, plate)
);
CREATE INDEX idx_vehicles_tenant_status ON vehicles(tenant_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_vehicles_tenant_plate ON vehicles(tenant_id, plate) WHERE deleted_at IS NULL;
```

### `vehicle_groups`
```sql
CREATE TABLE vehicle_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ,
  UNIQUE(tenant_id, name)
);
```

### `vehicle_group_memberships`
```sql
CREATE TABLE vehicle_group_memberships (
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  group_id   UUID REFERENCES vehicle_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (vehicle_id, group_id)
);
```

### `vehicle_tags`
```sql
CREATE TABLE vehicle_tags (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name      VARCHAR(50) NOT NULL,
  color     VARCHAR(7),  -- hex renk
  UNIQUE(tenant_id, name)
);
```

### `vehicle_tag_assignments`
```sql
CREATE TABLE vehicle_tag_assignments (
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  tag_id     UUID REFERENCES vehicle_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (vehicle_id, tag_id)
);
```

### `kilometer_logs`
```sql
CREATE TABLE kilometer_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  vehicle_id  UUID NOT NULL REFERENCES vehicles(id),
  km_value    INTEGER NOT NULL,
  source      VARCHAR(20) DEFAULT 'manual', -- manual/telematics/fuel
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_km_vehicle ON kilometer_logs(tenant_id, vehicle_id, recorded_at DESC);
```

---

## 3. Çalışan (Sürücü) & Zimmet

### `employees`
```sql
CREATE TABLE employees (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  user_id           UUID REFERENCES users(id),  -- login varsa
  employee_no       VARCHAR(50),
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  tc_identity       VARCHAR(11),                -- encrypted
  phone             VARCHAR(50),
  email             VARCHAR(255),
  department        VARCHAR(100),
  position          VARCHAR(100),
  driver_license_no VARCHAR(50),
  license_class     VARCHAR(10),
  license_expiry    DATE,
  status            VARCHAR(20) DEFAULT 'active',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  created_by        UUID REFERENCES users(id),
  updated_by        UUID REFERENCES users(id)
);
CREATE INDEX idx_employees_tenant ON employees(tenant_id) WHERE deleted_at IS NULL;
```

### `assignments` (Zimmet)
```sql
CREATE TABLE assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
  employee_id     UUID NOT NULL REFERENCES employees(id),
  start_date      DATE NOT NULL,
  end_date        DATE,
  start_km        INTEGER,
  end_km          INTEGER,
  status          VARCHAR(20) DEFAULT 'active', -- active/completed/cancelled
  handover_notes  TEXT,
  start_condition JSONB,  -- araç durumu JSON (hasar, aksesuar listesi)
  end_condition   JSONB,
  confirmed_at    TIMESTAMPTZ,  -- kullanıcı "teslim aldım" onayı
  confirmed_by    UUID REFERENCES users(id),
  handover_pdf_url TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id)
);
CREATE INDEX idx_assignments_vehicle ON assignments(tenant_id, vehicle_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_employee ON assignments(tenant_id, employee_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_dates ON assignments(tenant_id, start_date, end_date);
```

---

## 4. Yakıt

### `fuel_entries`
```sql
CREATE TABLE fuel_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
  employee_id     UUID REFERENCES employees(id),
  fill_date       TIMESTAMPTZ NOT NULL,
  station_name    VARCHAR(255),
  fuel_type       VARCHAR(20),
  liters          NUMERIC(10,2) NOT NULL,
  unit_price      NUMERIC(10,4),
  total_amount    NUMERIC(12,2) NOT NULL,
  km_at_fill      INTEGER,
  consumption     NUMERIC(6,2),  -- hesaplanan: lt/100km
  is_full_tank    BOOLEAN DEFAULT TRUE,
  receipt_url     TEXT,
  source          VARCHAR(20) DEFAULT 'manual', -- manual/csv_import/fuel_card
  is_anomaly      BOOLEAN DEFAULT FALSE,
  anomaly_reasons JSONB,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id)
);
CREATE INDEX idx_fuel_vehicle ON fuel_entries(tenant_id, vehicle_id, fill_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_fuel_anomaly ON fuel_entries(tenant_id, is_anomaly) WHERE is_anomaly = TRUE AND deleted_at IS NULL;
```

### `fuel_anomaly_rules`
```sql
CREATE TABLE fuel_anomaly_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  rule_type       VARCHAR(50) NOT NULL,  -- consumption_threshold/refill_interval/average_exceed
  params          JSONB NOT NULL,        -- {"max_lt_per_100km": 15, "min_hours_between": 4, "exceed_pct": 30}
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Lastik

### `tire_assets`
```sql
CREATE TABLE tire_assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  serial_no       VARCHAR(100),
  brand           VARCHAR(100),
  model           VARCHAR(100),
  size            VARCHAR(50),    -- 205/55R16
  dot_code        VARCHAR(20),
  purchase_date   DATE,
  purchase_cost   NUMERIC(10,2),
  tread_depth     NUMERIC(4,1),   -- mm
  status          VARCHAR(20) DEFAULT 'in_stock', -- in_stock/fitted/worn/disposed
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id)
);
CREATE INDEX idx_tires_tenant ON tire_assets(tenant_id, status) WHERE deleted_at IS NULL;
```

### `tire_fittings` (Lastik Takma/Çıkarma)
```sql
CREATE TABLE tire_fittings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  tire_id         UUID NOT NULL REFERENCES tire_assets(id),
  vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
  position        VARCHAR(20) NOT NULL,  -- front_left/front_right/rear_left/rear_right/spare
  fitted_date     DATE NOT NULL,
  fitted_km       INTEGER,
  removed_date    DATE,
  removed_km      INTEGER,
  tread_depth_at_fit    NUMERIC(4,1),
  tread_depth_at_remove NUMERIC(4,1),
  reason          VARCHAR(100),  -- rotation/replacement/seasonal/damage
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      UUID REFERENCES users(id)
);
CREATE INDEX idx_fittings_vehicle ON tire_fittings(tenant_id, vehicle_id, removed_date) WHERE removed_date IS NULL;
```

### `tire_inspections`
```sql
CREATE TABLE tire_inspections (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id),
  tire_id        UUID NOT NULL REFERENCES tire_assets(id),
  vehicle_id     UUID REFERENCES vehicles(id),
  inspection_date DATE NOT NULL,
  tread_depth    NUMERIC(4,1),
  pressure       NUMERIC(4,1),  -- bar
  condition      VARCHAR(50),   -- good/fair/worn/damaged
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  created_by     UUID REFERENCES users(id)
);
```

### `tire_rotation_plans`
```sql
CREATE TABLE tire_rotation_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
  interval_km     INTEGER,
  interval_months SMALLINT,
  last_rotation   DATE,
  next_rotation   DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. Ceza

### `penalties`
```sql
CREATE TABLE penalties (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  vehicle_id        UUID NOT NULL REFERENCES vehicles(id),
  matched_employee_id UUID REFERENCES employees(id), -- otomatik eşleştirme
  penalty_date      DATE NOT NULL,
  notification_date DATE,
  due_date          DATE,
  amount            NUMERIC(10,2) NOT NULL,
  discounted_amount NUMERIC(10,2),
  penalty_type      VARCHAR(100),  -- hız/park/kırmızı ışık/HGS vb.
  location          VARCHAR(255),
  description       TEXT,
  status            VARCHAR(20) DEFAULT 'unpaid', -- unpaid/paid/disputed/cancelled
  payment_date      DATE,
  payment_amount    NUMERIC(10,2),
  receipt_url       TEXT,
  is_charged_back   BOOLEAN DEFAULT FALSE,  -- sürücüye rücu
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  created_by        UUID REFERENCES users(id),
  updated_by        UUID REFERENCES users(id)
);
CREATE INDEX idx_penalties_vehicle ON penalties(tenant_id, vehicle_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_penalties_status ON penalties(tenant_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_penalties_due ON penalties(tenant_id, due_date) WHERE status = 'unpaid' AND deleted_at IS NULL;
```

### `penalty_disputes`
```sql
CREATE TABLE penalty_disputes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id),
  penalty_id   UUID NOT NULL REFERENCES penalties(id),
  request_id   UUID REFERENCES requests(id),  -- talep ile bağlantı
  reason       TEXT,
  status       VARCHAR(20) DEFAULT 'open', -- open/accepted/rejected
  result_notes TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  created_by   UUID REFERENCES users(id)
);
```

---

## 7. Gider

### `expense_categories`
```sql
CREATE TABLE expense_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  name        VARCHAR(100) NOT NULL,
  parent_id   UUID REFERENCES expense_categories(id), -- kategori ağacı
  is_system   BOOLEAN DEFAULT FALSE,
  icon        VARCHAR(50),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ,
  UNIQUE(tenant_id, name, parent_id)
);
```

### `expenses`
```sql
CREATE TABLE expenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  vehicle_id      UUID REFERENCES vehicles(id),
  category_id     UUID NOT NULL REFERENCES expense_categories(id),
  employee_id     UUID REFERENCES employees(id),
  expense_date    DATE NOT NULL,
  amount          NUMERIC(12,2) NOT NULL,
  currency        VARCHAR(3) DEFAULT 'TRY',
  vat_amount      NUMERIC(12,2),
  description     TEXT,
  vendor_name     VARCHAR(255),
  invoice_no      VARCHAR(100),
  invoice_url     TEXT,
  receipt_url     TEXT,
  ocr_data        JSONB,           -- OCR placeholder sonucu
  source          VARCHAR(20) DEFAULT 'manual',
  request_id      UUID REFERENCES requests(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id)
);
CREATE INDEX idx_expenses_vehicle ON expenses(tenant_id, vehicle_id, expense_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_expenses_category ON expenses(tenant_id, category_id) WHERE deleted_at IS NULL;
```

### `budgets`
```sql
CREATE TABLE budgets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  category_id   UUID REFERENCES expense_categories(id),
  vehicle_id    UUID REFERENCES vehicles(id),
  vehicle_group_id UUID REFERENCES vehicle_groups(id),
  period_year   SMALLINT NOT NULL,
  period_month  SMALLINT NOT NULL,  -- 1-12
  amount        NUMERIC(12,2) NOT NULL,
  alert_threshold NUMERIC(5,2) DEFAULT 80.00, -- %
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  created_by    UUID REFERENCES users(id)
);
CREATE INDEX idx_budgets_period ON budgets(tenant_id, period_year, period_month);
```

---

## 8. Evrak & Sözleşme

### `document_types`
```sql
CREATE TABLE document_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  name        VARCHAR(100) NOT NULL,  -- Sigorta, Kasko, Muayene, Ruhsat, etc.
  is_system   BOOLEAN DEFAULT FALSE,
  expiry_required BOOLEAN DEFAULT TRUE,
  reminder_days   INTEGER[] DEFAULT '{30,15,7}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);
```

### `documents`
```sql
CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  vehicle_id      UUID REFERENCES vehicles(id),
  employee_id     UUID REFERENCES employees(id),
  document_type_id UUID NOT NULL REFERENCES document_types(id),
  title           VARCHAR(255) NOT NULL,
  file_url        TEXT NOT NULL,
  file_name       VARCHAR(255),
  file_size       INTEGER,
  mime_type       VARCHAR(100),
  issue_date      DATE,
  expiry_date     DATE,
  amount          NUMERIC(12,2),
  issuer          VARCHAR(255),   -- sigorta şirketi, muayene istasyonu vb.
  policy_no       VARCHAR(100),
  tags            TEXT[],
  notes           TEXT,
  reminder_sent_30 BOOLEAN DEFAULT FALSE,
  reminder_sent_15 BOOLEAN DEFAULT FALSE,
  reminder_sent_7  BOOLEAN DEFAULT FALSE,
  status          VARCHAR(20) DEFAULT 'active', -- active/expired/archived
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id)
);
CREATE INDEX idx_documents_vehicle ON documents(tenant_id, vehicle_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_expiry ON documents(tenant_id, expiry_date) WHERE status = 'active' AND deleted_at IS NULL;
```

---

## 9. Talep / İş Akışı

### `request_types`
```sql
CREATE TABLE request_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL,
  description TEXT,
  approval_levels SMALLINT DEFAULT 1,  -- 1 veya 2
  sla_hours   INTEGER,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);
```

### `requests`
```sql
CREATE TABLE requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  request_type_id UUID NOT NULL REFERENCES request_types(id),
  vehicle_id      UUID REFERENCES vehicles(id),
  requester_id    UUID NOT NULL REFERENCES users(id),
  assignee_id     UUID REFERENCES users(id),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  priority        VARCHAR(20) DEFAULT 'normal', -- low/normal/high/urgent
  status          VARCHAR(30) DEFAULT 'draft',
  -- draft/pending_approval/level1_approved/level2_approved/approved/rejected/in_progress/completed/cancelled
  sla_deadline    TIMESTAMPTZ,
  tags            TEXT[],
  metadata        JSONB DEFAULT '{}',
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id)
);
CREATE INDEX idx_requests_tenant_status ON requests(tenant_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_requests_requester ON requests(tenant_id, requester_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_requests_assignee ON requests(tenant_id, assignee_id) WHERE deleted_at IS NULL;
```

### `request_approvals`
```sql
CREATE TABLE request_approvals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  request_id  UUID NOT NULL REFERENCES requests(id),
  level       SMALLINT NOT NULL,  -- 1 veya 2
  approver_id UUID NOT NULL REFERENCES users(id),
  decision    VARCHAR(20),        -- approved/rejected
  comment     TEXT,
  decided_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_approvals_request ON request_approvals(request_id, level);
```

### `request_comments`
```sql
CREATE TABLE request_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  request_id  UUID NOT NULL REFERENCES requests(id),
  user_id     UUID NOT NULL REFERENCES users(id),
  content     TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);
```

### `request_attachments`
```sql
CREATE TABLE request_attachments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  request_id  UUID NOT NULL REFERENCES requests(id),
  file_url    TEXT NOT NULL,
  file_name   VARCHAR(255),
  file_size   INTEGER,
  mime_type   VARCHAR(100),
  uploaded_by UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `request_status_history`
```sql
CREATE TABLE request_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  UUID NOT NULL REFERENCES requests(id),
  from_status VARCHAR(30),
  to_status   VARCHAR(30) NOT NULL,
  changed_by  UUID NOT NULL REFERENCES users(id),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 10. Kiralık Araç

### `rental_contracts`
```sql
CREATE TABLE rental_contracts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  vehicle_id        UUID NOT NULL REFERENCES vehicles(id),
  rental_company    VARCHAR(255) NOT NULL,
  contract_no       VARCHAR(100),
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  monthly_amount    NUMERIC(12,2) NOT NULL,
  currency          VARCHAR(3) DEFAULT 'TRY',
  km_limit_monthly  INTEGER,
  km_excess_rate    NUMERIC(10,2),
  deposit_amount    NUMERIC(12,2),
  insurance_included BOOLEAN DEFAULT FALSE,
  maintenance_included BOOLEAN DEFAULT FALSE,
  tire_included     BOOLEAN DEFAULT FALSE,
  contract_file_url TEXT,
  status            VARCHAR(20) DEFAULT 'active', -- active/expired/terminated
  notes             TEXT,
  reminder_sent_30  BOOLEAN DEFAULT FALSE,
  reminder_sent_15  BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  created_by        UUID REFERENCES users(id),
  updated_by        UUID REFERENCES users(id)
);
CREATE INDEX idx_rental_vehicle ON rental_contracts(tenant_id, vehicle_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_rental_end ON rental_contracts(tenant_id, end_date) WHERE status = 'active' AND deleted_at IS NULL;
```

### `rental_invoices`
```sql
CREATE TABLE rental_invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  contract_id     UUID NOT NULL REFERENCES rental_contracts(id),
  invoice_no      VARCHAR(100),
  invoice_date    DATE NOT NULL,
  due_date        DATE,
  amount          NUMERIC(12,2) NOT NULL,
  vat_amount      NUMERIC(12,2),
  km_excess_amount NUMERIC(12,2),
  total_amount    NUMERIC(12,2) NOT NULL,
  status          VARCHAR(20) DEFAULT 'pending', -- pending/paid/overdue
  payment_date    DATE,
  invoice_file_url TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      UUID REFERENCES users(id)
);
```

---

## 11. Bildirim & Kurallar

### `notifications`
```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  user_id     UUID NOT NULL REFERENCES users(id),
  title       VARCHAR(255) NOT NULL,
  body        TEXT,
  type        VARCHAR(50),         -- document_expiry/penalty_due/maintenance/budget/fuel_anomaly/request
  channel     VARCHAR(20),         -- in_app/email/webhook
  resource_type VARCHAR(50),       -- hangi kaynakla ilgili
  resource_id UUID,
  is_read     BOOLEAN DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(tenant_id, user_id, is_read, created_at DESC);
```

### `notification_rules`
```sql
CREATE TABLE notification_rules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  rule_type   VARCHAR(50) NOT NULL,
  -- document_expiry/penalty_due/maintenance_km/maintenance_date/budget_threshold/fuel_anomaly/rental_expiry
  name        VARCHAR(255) NOT NULL,
  params      JSONB NOT NULL,        -- {"days_before": [30,15,7], "threshold_pct": 80}
  channels    TEXT[] DEFAULT '{in_app,email}',
  recipient_roles TEXT[],             -- hangi rollere gidecek
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  created_by  UUID REFERENCES users(id)
);
```

### `notification_templates`
```sql
CREATE TABLE notification_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(id), -- NULL = sistem şablonu
  rule_type   VARCHAR(50) NOT NULL,
  locale      VARCHAR(5) NOT NULL DEFAULT 'tr',
  subject     VARCHAR(255) NOT NULL,
  body_html   TEXT NOT NULL,
  body_text   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, rule_type, locale)
);
```

### `webhooks`
```sql
CREATE TABLE webhooks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  name        VARCHAR(255) NOT NULL,
  url         TEXT NOT NULL,
  secret      VARCHAR(255),         -- HMAC secret
  events      TEXT[] NOT NULL,       -- ['vehicle.created', 'request.approved', ...]
  is_active   BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  last_status_code  SMALLINT,
  retry_count SMALLINT DEFAULT 3,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 12. GPS/Telematik (Placeholder)

### `telematics_providers`
```sql
CREATE TABLE telematics_providers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  name        VARCHAR(100) NOT NULL,
  provider_type VARCHAR(50),        -- atspro/geotab/generic
  api_url     TEXT,
  api_key     TEXT,                  -- encrypted, boş bırakılır
  config      JSONB DEFAULT '{}',
  is_active   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `telematics_data`
```sql
CREATE TABLE telematics_data (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
  provider_id     UUID REFERENCES telematics_providers(id),
  recorded_at     TIMESTAMPTZ NOT NULL,
  latitude        NUMERIC(10,7),
  longitude       NUMERIC(10,7),
  speed           NUMERIC(6,1),
  heading         NUMERIC(5,1),
  engine_on       BOOLEAN,
  odometer        INTEGER,
  fuel_level      NUMERIC(5,1),
  harsh_accel     BOOLEAN DEFAULT FALSE,
  harsh_brake     BOOLEAN DEFAULT FALSE,
  raw_data        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_telematics_vehicle ON telematics_data(tenant_id, vehicle_id, recorded_at DESC);
-- Partition by month for large datasets
```

---

## 13. Audit & Dosya

### `activity_logs`
```sql
CREATE TABLE activity_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id),
  user_id       UUID REFERENCES users(id),
  action        VARCHAR(50) NOT NULL,   -- create/update/delete/approve/reject/login/export
  resource_type VARCHAR(50) NOT NULL,   -- vehicle/fuel_entry/request/etc.
  resource_id   UUID,
  old_values    JSONB,
  new_values    JSONB,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_activity_tenant ON activity_logs(tenant_id, created_at DESC);
CREATE INDEX idx_activity_resource ON activity_logs(tenant_id, resource_type, resource_id);
```

### `file_storage_refs`
```sql
CREATE TABLE file_storage_refs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  bucket        VARCHAR(100) NOT NULL,
  object_key    TEXT NOT NULL,
  original_name VARCHAR(255),
  mime_type     VARCHAR(100),
  size_bytes    BIGINT,
  uploaded_by   UUID REFERENCES users(id),
  resource_type VARCHAR(50),
  resource_id   UUID,
  is_public     BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);
CREATE INDEX idx_files_resource ON file_storage_refs(tenant_id, resource_type, resource_id);
```

### `saved_filters`
```sql
CREATE TABLE saved_filters (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  user_id     UUID NOT NULL REFERENCES users(id),
  module      VARCHAR(50) NOT NULL,
  name        VARCHAR(100) NOT NULL,
  filters     JSONB NOT NULL,
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `saved_reports`
```sql
CREATE TABLE saved_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  user_id     UUID NOT NULL REFERENCES users(id),
  name        VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  filters     JSONB NOT NULL,
  columns     JSONB,
  chart_config JSONB,
  is_shared   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);
```

---

## İlişki Diyagramı (Özet)

```
tenants ─┬─ users ─── user_roles ─── roles ─── role_permissions ─── permissions
         │
         ├─ vehicles ─┬─ vehicle_group_memberships ─── vehicle_groups
         │            ├─ vehicle_tag_assignments ─── vehicle_tags
         │            ├─ kilometer_logs
         │            ├─ assignments ─── employees
         │            ├─ fuel_entries
         │            ├─ tire_fittings ─── tire_assets ─── tire_inspections
         │            ├─ penalties ─── penalty_disputes
         │            ├─ expenses ─── expense_categories
         │            ├─ documents ─── document_types
         │            ├─ requests ─┬─ request_approvals
         │            │            ├─ request_comments
         │            │            ├─ request_attachments
         │            │            └─ request_status_history
         │            ├─ rental_contracts ─── rental_invoices
         │            └─ telematics_data
         │
         ├─ budgets
         ├─ notifications
         ├─ notification_rules
         ├─ notification_templates
         ├─ webhooks
         ├─ fuel_anomaly_rules
         ├─ telematics_providers
         ├─ activity_logs
         ├─ file_storage_refs
         ├─ saved_filters
         └─ saved_reports
```

---

## Toplam Tablo Sayısı: ~40
