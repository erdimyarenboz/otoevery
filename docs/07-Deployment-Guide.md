# OtoEvery — Kurulum & Deploy Yönergesi

---

## 1. Proje Yapısı (Monorepo)

```
otoevery/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router
│   │   │   ├── components/     # UI components
│   │   │   ├── lib/            # Utilities, API client
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── stores/         # Zustand stores
│   │   │   ├── i18n/           # Çeviri dosyaları (tr.json, en.json)
│   │   │   └── styles/         # Global styles, design tokens
│   │   ├── public/
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   └── api/                    # Express/Fastify backend
│       ├── src/
│       │   ├── config/         # DB, Redis, S3, mail config
│       │   ├── middleware/     # auth, rbac, tenant, rate-limit, audit
│       │   ├── modules/        # Feature modules
│       │   │   ├── auth/
│       │   │   ├── vehicles/
│       │   │   ├── assignments/
│       │   │   ├── requests/
│       │   │   ├── fuel/
│       │   │   ├── tires/
│       │   │   ├── penalties/
│       │   │   ├── expenses/
│       │   │   ├── documents/
│       │   │   ├── reports/
│       │   │   ├── rentals/
│       │   │   ├── notifications/
│       │   │   ├── telematics/
│       │   │   └── admin/
│       │   ├── services/       # Shared services (mail, file, pdf, queue)
│       │   ├── utils/
│       │   └── index.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       └── package.json
│
├── packages/
│   └── shared/                 # Ortak tipler, validasyon şemaları, sabitler
│       ├── src/
│       │   ├── types/
│       │   ├── schemas/        # Zod validation schemas
│       │   ├── constants/
│       │   └── utils/
│       └── package.json
│
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   └── nginx.conf
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── turbo.json
├── package.json
├── .env.example
└── README.md
```

---

## 2. Ön Gereksinimler

| Araç | Versiyon |
|------|----------|
| Node.js | ≥ 20 LTS |
| pnpm | ≥ 9 |
| Docker | ≥ 24 |
| Docker Compose | ≥ 2.20 |
| PostgreSQL | 16 (Docker ile sağlanır) |
| Redis | 7 (Docker ile sağlanır) |

---

## 3. Ortam Değişkenleri (`.env.example`)

```env
# ===== Database =====
DATABASE_URL=postgresql://otoevery:otoevery_secret@localhost:5432/otoevery?schema=public
SHADOW_DATABASE_URL=postgresql://otoevery:otoevery_secret@localhost:5432/otoevery_shadow?schema=public

# ===== Redis =====
REDIS_URL=redis://localhost:6379

# ===== Auth =====
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ===== API =====
API_PORT=4000
API_URL=http://localhost:4000
CORS_ORIGINS=http://localhost:3000

# ===== Frontend =====
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# ===== File Storage (S3 uyumlu) =====
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=otoevery-files
S3_REGION=us-east-1

# ===== Email (SMTP) =====
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@otoevery.com

# ===== Encryption =====
ENCRYPTION_KEY=32-byte-hex-key-for-aes-256-encryption

# ===== Rate Limiting =====
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# ===== Error Tracking =====
SENTRY_DSN=

# ===== Super Admin =====
SUPER_ADMIN_EMAIL=admin@otoevery.com
SUPER_ADMIN_PASSWORD=change-me

# ===== GPS/Telematik (boş bırakılır) =====
TELEMATICS_API_KEY=
TELEMATICS_API_URL=

# ===== OCR (boş bırakılır) =====
OCR_API_KEY=
OCR_API_URL=
```

---

## 4. Lokal Geliştirme

### 4.1 Kurulum

```bash
# 1. Repo klonla
git clone https://github.com/your-org/otoevery.git
cd otoevery

# 2. Bağımlılıkları yükle
pnpm install

# 3. Env dosyasını oluştur
cp .env.example .env
# .env dosyasını düzenle

# 4. Docker servisleri başlat (DB + Redis + MinIO)
docker compose up -d postgres redis minio

# 5. Veritabanı migration
pnpm --filter api prisma migrate dev

# 6. Seed data (demo tenant + super admin)
pnpm --filter api prisma db seed

# 7. Geliştirme sunucularını başlat
pnpm dev
```

### 4.2 Erişim

| Servis | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000 |
| MinIO Console | http://localhost:9001 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

---

## 5. Docker Compose (Geliştirme)

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: otoevery
      POSTGRES_USER: otoevery
      POSTGRES_PASSWORD: otoevery_secret
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U otoevery']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - '9000:9000'
      - '9001:9001'
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

---

## 6. Docker Compose (Production)

```yaml
# docker-compose.prod.yml
version: '3.9'

services:
  api:
    build:
      context: .
      dockerfile: docker/Dockerfile.api
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    env_file: .env
    ports:
      - '4000:4000'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:4000/health']
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    build:
      context: .
      dockerfile: docker/Dockerfile.web
    environment:
      - NODE_ENV=production
    env_file: .env
    ports:
      - '3000:3000'
    depends_on:
      - api
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - api
      - web
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USER}']
      interval: 5s
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    command: server /data
    environment:
      MINIO_ROOT_USER: ${S3_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${S3_SECRET_KEY}
    volumes:
      - minio_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

---

## 7. Dockerfile'lar

### `docker/Dockerfile.api`

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .
RUN pnpm --filter api build
RUN pnpm --filter api prisma generate

FROM base AS runner
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./

EXPOSE 4000
CMD ["node", "dist/index.js"]
```

### `docker/Dockerfile.web`

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm --filter web build

FROM base AS runner
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
USER nextjs

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

---

## 8. Production Deploy Kontrol Listesi

- [ ] `.env` production değerleriyle dolduruldu
- [ ] `JWT_SECRET` güçlü rastgele string (≥ 64 karakter)
- [ ] `ENCRYPTION_KEY` 32 byte hex
- [ ] `DATABASE_URL` production DB'ye işaret ediyor
- [ ] PostgreSQL backup cron ayarlandı
- [ ] SSL sertifikaları yerleştirildi
- [ ] CORS origin production domain ile güncellendi
- [ ] Rate limit değerleri production'a uygun ayarlandı
- [ ] MinIO / S3 bucket oluşturuldu
- [ ] SMTP ayarları test edildi
- [ ] Sentry DSN ayarlandı
- [ ] Super Admin şifresi production için değiştirildi
- [ ] `docker compose -f docker-compose.prod.yml up -d` çalıştırıldı
- [ ] `prisma migrate deploy` production DB'de çalıştırıldı
- [ ] Health check endpoint'leri kontrol edildi
- [ ] Firewall kuralları ayarlandı (sadece 80/443 açık)
- [ ] Log rotation ayarlandı

---

## 9. CI/CD Pipeline (GitHub Actions Özet)

```yaml
name: CI/CD
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -f docker/Dockerfile.api -t otoevery-api .
      - run: docker build -f docker/Dockerfile.web -t otoevery-web .

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - # SSH deploy veya registry push
```

---

## 10. Yedekleme

```bash
# PostgreSQL otomatik yedekleme (cron, günlük)
0 3 * * * pg_dump -U otoevery -h localhost otoevery | gzip > /backups/otoevery_$(date +\%Y\%m\%d).sql.gz

# 30 günden eski yedekleri sil
0 4 * * * find /backups -name "*.sql.gz" -mtime +30 -delete
```
