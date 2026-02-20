import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding OtoEvery database...\n');

    // ─── COMPANIES ──────────────────────────────────────
    const company1 = await prisma.company.create({
        data: {
            id: uuid(),
            name: 'Demo Lojistik A.Ş.',
            slug: 'demo-lojistik',
            address: 'Ataşehir, İstanbul',
            contactEmail: 'info@demolojistik.com',
            contactPhone: '0212 555 1234',
        },
    });

    const company2 = await prisma.company.create({
        data: {
            id: uuid(),
            name: 'ABC Kargo Ltd.',
            slug: 'abc-kargo',
            address: 'Kadıköy, İstanbul',
            contactEmail: 'info@abckargo.com',
            contactPhone: '0216 444 5678',
        },
    });

    console.log(`✅ Companies: ${company1.name}, ${company2.name}`);

    // ─── SERVICE CENTERS ────────────────────────────────
    // Yıkama merkezleri
    const sc1 = await prisma.serviceCenter.create({
        data: {
            id: uuid(), name: 'Temiz Oto Yıkama', address: 'Bağdat Cad. No:45, Kartal, İstanbul',
            type: 'wash', contactEmail: 'info@temizoto.com', phone: '0216 333 1111',
            latitude: 40.8893, longitude: 29.1857,
        },
    });
    const sc_wash2 = await prisma.serviceCenter.create({
        data: {
            id: uuid(), name: 'Blue Wash Oto Kuaför', address: 'Fenerbahçe Mah., Kadıköy, İstanbul',
            type: 'wash', contactEmail: 'info@bluewash.com', phone: '0216 444 1234',
            latitude: 40.9700, longitude: 29.0370,
        },
    });

    // Bakım merkezleri
    const sc2 = await prisma.serviceCenter.create({
        data: {
            id: uuid(), name: 'Hızlı Bakım Servisi', address: 'Cevizli Mah., Maltepe, İstanbul',
            type: 'maintenance', contactEmail: 'info@hizlibakim.com', phone: '0216 333 2222',
            latitude: 40.9206, longitude: 29.1331,
        },
    });
    const sc_maint2 = await prisma.serviceCenter.create({
        data: {
            id: uuid(), name: 'Ataşehir Oto Bakım', address: 'Küçükbakkalköy, Ataşehir, İstanbul',
            type: 'maintenance', contactEmail: 'info@atasehirbakim.com', phone: '0216 555 7890',
            latitude: 40.9903, longitude: 29.1070,
        },
    });

    // Lastik merkezleri
    const sc_tire1 = await prisma.serviceCenter.create({
        data: {
            id: uuid(), name: 'Brisa Lastik Merkezi', address: 'Esentepe Mah., Şişli, İstanbul',
            type: 'tire', contactEmail: 'info@brisalastik.com', phone: '0212 666 1111',
            latitude: 41.0795, longitude: 29.0118,
        },
    });
    const sc_tire2 = await prisma.serviceCenter.create({
        data: {
            id: uuid(), name: 'Güven Lastik & Rot Balans', address: 'İçerenköy, Ataşehir, İstanbul',
            type: 'tire', contactEmail: 'info@guvenlastik.com', phone: '0216 777 2222',
            latitude: 40.9780, longitude: 29.1170,
        },
    });

    // Hepsi (wash + maintenance + tire)
    const sc3 = await prisma.serviceCenter.create({
        data: {
            id: uuid(), name: 'Pro Detailing & Yıkama', address: 'Levent Mah., Beşiktaş, İstanbul',
            type: 'both', contactEmail: 'info@prodetailing.com', phone: '0212 333 3333',
            latitude: 41.0767, longitude: 29.0104,
        },
    });
    const sc_both2 = await prisma.serviceCenter.create({
        data: {
            id: uuid(), name: 'Full Servis Oto Center', address: 'Kozyatağı, Kadıköy, İstanbul',
            type: 'both', contactEmail: 'info@fullservis.com', phone: '0216 888 3333',
            latitude: 40.9720, longitude: 29.0860,
        },
    });

    console.log(`✅ Service Centers: 8 created (2 wash, 2 maintenance, 2 tire, 2 both)`);

    // ─── QR CODES ───────────────────────────────────────
    const qrCodes = await Promise.all([
        prisma.qrCode.create({ data: { id: uuid(), code: 'QR-TEMIZ-DIS-001', serviceCenterId: sc1.id, serviceType: 'wash', amount: 150, label: 'Dış Yıkama' } }),
        prisma.qrCode.create({ data: { id: uuid(), code: 'QR-TEMIZ-IC-002', serviceCenterId: sc1.id, serviceType: 'wash_premium', amount: 300, label: 'İç + Dış Yıkama' } }),
        prisma.qrCode.create({ data: { id: uuid(), code: 'QR-HIZLI-YAG-001', serviceCenterId: sc2.id, serviceType: 'oil_change', amount: 1200, label: 'Yağ Değişimi' } }),
        prisma.qrCode.create({ data: { id: uuid(), code: 'QR-HIZLI-FREN-002', serviceCenterId: sc2.id, serviceType: 'maintenance', amount: 800, label: 'Fren Bakımı' } }),
        prisma.qrCode.create({ data: { id: uuid(), code: 'QR-PRO-DETAIL-001', serviceCenterId: sc3.id, serviceType: 'wash_premium', amount: 500, label: 'Detaylı Yıkama + Cila' } }),
        prisma.qrCode.create({ data: { id: uuid(), code: 'QR-PRO-BAKIM-002', serviceCenterId: sc3.id, serviceType: 'maintenance', amount: 950, label: 'Genel Bakım' } }),
        prisma.qrCode.create({ data: { id: uuid(), code: 'QR-BRISA-LASTIK-001', serviceCenterId: sc_tire1.id, serviceType: 'tire_change', amount: 2400, label: '4 Adet Lastik Değişimi' } }),
        prisma.qrCode.create({ data: { id: uuid(), code: 'QR-GUVEN-ROT-001', serviceCenterId: sc_tire2.id, serviceType: 'tire_balance', amount: 600, label: 'Rot Balans Ayarı' } }),
        prisma.qrCode.create({ data: { id: uuid(), code: 'QR-BLUE-DIS-001', serviceCenterId: sc_wash2.id, serviceType: 'wash', amount: 200, label: 'Premium Dış Yıkama' } }),
        prisma.qrCode.create({ data: { id: uuid(), code: 'QR-FULL-KOMPLE-001', serviceCenterId: sc_both2.id, serviceType: 'maintenance', amount: 1800, label: 'Komple Bakım Paketi' } }),
    ]);

    console.log(`✅ QR Codes: ${qrCodes.length} created`);

    // ─── AGREEMENTS ─────────────────────────────────────
    // Company 1 agreements (Demo Lojistik)
    const agreementData1 = [
        { serviceCenterId: sc1.id, monthlyLimit: 10000, discountRate: 15 },
        { serviceCenterId: sc2.id, monthlyLimit: 25000, discountRate: 10 },
        { serviceCenterId: sc_tire1.id, monthlyLimit: 20000, discountRate: 12 },
        { serviceCenterId: sc_wash2.id, monthlyLimit: 8000, discountRate: 8 },
        { serviceCenterId: sc3.id, monthlyLimit: 15000, discountRate: 10 },
        { serviceCenterId: sc_both2.id, monthlyLimit: 12000, discountRate: 10 },
    ];
    // Company 2 agreements (ABC Kargo)
    const agreementData2 = [
        { serviceCenterId: sc3.id, monthlyLimit: 15000, discountRate: 12 },
        { serviceCenterId: sc1.id, monthlyLimit: 8000, discountRate: 10 },
        { serviceCenterId: sc_tire2.id, monthlyLimit: 15000, discountRate: 10 },
        { serviceCenterId: sc_maint2.id, monthlyLimit: 18000, discountRate: 14 },
        { serviceCenterId: sc_both2.id, monthlyLimit: 10000, discountRate: 8 },
    ];

    for (const a of [...agreementData1.map(a => ({ ...a, companyId: company1.id })), ...agreementData2.map(a => ({ ...a, companyId: company2.id }))]) {
        await prisma.agreement.create({
            data: { id: uuid(), companyId: a.companyId, serviceCenterId: a.serviceCenterId, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), monthlyLimit: a.monthlyLimit, discountRate: a.discountRate },
        });
    }

    console.log('✅ Agreements: 11 created');

    // ─── VEHICLES ───────────────────────────────────────
    const hashedPw = await bcrypt.hash('Demo123!', 12);

    // Company 1 vehicles
    const v1 = await prisma.vehicle.create({
        data: { id: uuid(), plate: '34 ABC 123', brand: 'Ford', model: 'Transit', year: 2022, color: 'Beyaz', fuelType: 'dizel', currentKm: 45000, companyId: company1.id },
    });
    const v2 = await prisma.vehicle.create({
        data: { id: uuid(), plate: '34 DEF 456', brand: 'Volkswagen', model: 'Caddy', year: 2023, color: 'Gri', fuelType: 'dizel', currentKm: 22000, companyId: company1.id },
    });
    const v3 = await prisma.vehicle.create({
        data: { id: uuid(), plate: '34 GHI 789', brand: 'Renault', model: 'Megane', year: 2021, color: 'Siyah', fuelType: 'benzin', currentKm: 67000, companyId: company1.id },
    });
    const v4 = await prisma.vehicle.create({
        data: { id: uuid(), plate: '34 JKL 012', brand: 'Toyota', model: 'Corolla', year: 2023, color: 'Mavi', fuelType: 'hibrit', currentKm: 15000, companyId: company1.id },
    });

    // Company 2 vehicles
    const v5 = await prisma.vehicle.create({
        data: { id: uuid(), plate: '34 MNO 345', brand: 'Mercedes', model: 'Sprinter', year: 2020, color: 'Beyaz', fuelType: 'dizel', currentKm: 120000, status: 'maintenance', companyId: company2.id },
    });
    const v6 = await prisma.vehicle.create({
        data: { id: uuid(), plate: '34 PRS 678', brand: 'Fiat', model: 'Doblo', year: 2022, color: 'Kırmızı', fuelType: 'dizel', currentKm: 38000, companyId: company2.id },
    });
    const v7 = await prisma.vehicle.create({
        data: { id: uuid(), plate: '34 TUV 901', brand: 'Hyundai', model: 'Tucson', year: 2024, color: 'Lacivert', fuelType: 'hibrit', currentKm: 8000, companyId: company2.id },
    });

    console.log('✅ Vehicles: 7 created');

    // ─── USERS ──────────────────────────────────────────

    // 1) Super Admin
    await prisma.user.create({
        data: {
            id: uuid(), email: 'admin@otoevery.com', password: hashedPw,
            firstName: 'Süper', lastName: 'Admin', role: 'SUPER_ADMIN', phone: '0532 000 0000',
        },
    });

    // 2) Company Managers
    await prisma.user.create({
        data: {
            id: uuid(), email: 'yonetici@demolojistik.com', password: hashedPw,
            firstName: 'Mehmet', lastName: 'Kaya', role: 'COMPANY_MANAGER', companyId: company1.id, phone: '0533 111 1111',
        },
    });

    await prisma.user.create({
        data: {
            id: uuid(), email: 'yonetici@abckargo.com', password: hashedPw,
            firstName: 'Ayşe', lastName: 'Demir', role: 'COMPANY_MANAGER', companyId: company2.id, phone: '0534 222 2222',
        },
    });

    // 3) Drivers — login with plate + password
    await prisma.user.create({
        data: {
            id: uuid(), plateNumber: '34 ABC 123', password: hashedPw,
            firstName: 'Ali', lastName: 'Yılmaz', role: 'DRIVER', companyId: company1.id, vehicleId: v1.id,
        },
    });
    await prisma.user.create({
        data: {
            id: uuid(), plateNumber: '34 DEF 456', password: hashedPw,
            firstName: 'Fatma', lastName: 'Şahin', role: 'DRIVER', companyId: company1.id, vehicleId: v2.id,
        },
    });
    await prisma.user.create({
        data: {
            id: uuid(), plateNumber: '34 GHI 789', password: hashedPw,
            firstName: 'Hasan', lastName: 'Öztürk', role: 'DRIVER', companyId: company1.id, vehicleId: v3.id,
        },
    });
    await prisma.user.create({
        data: {
            id: uuid(), plateNumber: '34 JKL 012', password: hashedPw,
            firstName: 'Zeynep', lastName: 'Arslan', role: 'DRIVER', companyId: company1.id, vehicleId: v4.id,
        },
    });
    await prisma.user.create({
        data: {
            id: uuid(), plateNumber: '34 PRS 678', password: hashedPw,
            firstName: 'Emre', lastName: 'Çelik', role: 'DRIVER', companyId: company2.id, vehicleId: v6.id,
        },
    });
    await prisma.user.create({
        data: {
            id: uuid(), plateNumber: '34 TUV 901', password: hashedPw,
            firstName: 'Selin', lastName: 'Koç', role: 'DRIVER', companyId: company2.id, vehicleId: v7.id,
        },
    });

    // 4) Service Center Users
    await prisma.user.create({
        data: {
            id: uuid(), email: 'temiz@otoevery.com', password: hashedPw,
            firstName: 'Ahmet', lastName: 'Temiz', role: 'SERVICE_CENTER', serviceCenterId: sc1.id,
        },
    });
    await prisma.user.create({
        data: {
            id: uuid(), email: 'hizli@otoevery.com', password: hashedPw,
            firstName: 'Burak', lastName: 'Hızlı', role: 'SERVICE_CENTER', serviceCenterId: sc2.id,
        },
    });
    await prisma.user.create({
        data: {
            id: uuid(), email: 'pro@otoevery.com', password: hashedPw,
            firstName: 'Can', lastName: 'Pro', role: 'SERVICE_CENTER', serviceCenterId: sc3.id,
        },
    });

    console.log('✅ Users: 1 super admin, 2 company managers, 6 drivers, 3 service center users');

    // ─── TRANSACTIONS ───────────────────────────────────
    const now = new Date();
    const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

    await prisma.transaction.createMany({
        data: [
            { id: uuid(), type: 'wash', amount: 150, description: 'Dış yıkama', vehicleId: v1.id, serviceCenterId: sc1.id, qrPaymentRef: 'QR-TEMIZ-DIS-001', transactionDate: daysAgo(1) },
            { id: uuid(), type: 'wash_premium', amount: 300, description: 'İç + dış yıkama', vehicleId: v2.id, serviceCenterId: sc1.id, qrPaymentRef: 'QR-TEMIZ-IC-002', transactionDate: daysAgo(2) },
            { id: uuid(), type: 'maintenance', amount: 1200, description: 'Yağ değişimi', vehicleId: v1.id, serviceCenterId: sc2.id, qrPaymentRef: 'QR-HIZLI-YAG-001', transactionDate: daysAgo(3) },
            { id: uuid(), type: 'maintenance', amount: 800, description: 'Fren bakımı', vehicleId: v3.id, serviceCenterId: sc2.id, qrPaymentRef: 'QR-HIZLI-FREN-002', transactionDate: daysAgo(5) },
            { id: uuid(), type: 'wash_premium', amount: 500, description: 'Detaylı yıkama + cila', vehicleId: v5.id, serviceCenterId: sc3.id, qrPaymentRef: 'QR-PRO-DETAIL-001', transactionDate: daysAgo(1) },
            { id: uuid(), type: 'maintenance', amount: 950, description: 'Genel bakım', vehicleId: v6.id, serviceCenterId: sc3.id, qrPaymentRef: 'QR-PRO-BAKIM-002', transactionDate: daysAgo(4) },
            { id: uuid(), type: 'wash', amount: 150, description: 'Dış yıkama', vehicleId: v4.id, serviceCenterId: sc1.id, qrPaymentRef: 'QR-TEMIZ-DIS-001', transactionDate: daysAgo(6) },
            { id: uuid(), type: 'wash', amount: 150, description: 'Dış yıkama', vehicleId: v7.id, serviceCenterId: sc1.id, qrPaymentRef: 'QR-TEMIZ-DIS-001', transactionDate: daysAgo(7) },
        ],
    });

    console.log('✅ Transactions: 8 created');

    // ─── PENALTIES ──────────────────────────────────────
    await prisma.penalty.createMany({
        data: [
            { id: uuid(), vehicleId: v1.id, amount: 1002, penaltyDate: daysAgo(10), description: 'Hız ihlali — Kadıköy', location: 'Kadıköy', status: 'unpaid' },
            { id: uuid(), vehicleId: v3.id, amount: 488, penaltyDate: daysAgo(20), description: 'Park ihlali — Beşiktaş', location: 'Beşiktaş', status: 'paid', paidAt: daysAgo(15) },
            { id: uuid(), vehicleId: v5.id, amount: 1502, penaltyDate: daysAgo(5), description: 'Kırmızı ışık ihlali — Ataşehir', location: 'Ataşehir', status: 'unpaid' },
            { id: uuid(), vehicleId: v6.id, amount: 727, penaltyDate: daysAgo(8), description: 'Emniyet kemeri — Maltepe', location: 'Maltepe', status: 'appealed' },
        ],
    });

    console.log('✅ Penalties: 4 created');

    console.log('\n🎉 Seed complete!\n');
    console.log('Demo Hesaplar:');
    console.log('  Super Admin:      admin@otoevery.com / Demo123!');
    console.log('  Şirket Yönetici:  yonetici@demolojistik.com / Demo123!');
    console.log('  Şirket Yönetici:  yonetici@abckargo.com / Demo123!');
    console.log('  Sürücü:           34 ABC 123 / Demo123!');
    console.log('  Servis Merkezi:   temiz@otoevery.com / Demo123!');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
