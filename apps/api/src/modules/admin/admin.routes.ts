// @ts-nocheck
import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ── COMPANIES ──────────────────────────────────────────

// GET /api/v1/admin/companies
router.get('/companies', async (req: AuthRequest, res: Response) => {
    const companies = await prisma.company.findMany({
        include: {
            _count: { select: { vehicles: true, users: true, agreements: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: companies });
});

// POST /api/v1/admin/companies
router.post('/companies', async (req: AuthRequest, res: Response) => {
    const { name, slug, address, contactEmail, contactPhone } = req.body;
    if (!name || !slug) {
        return res.status(400).json({ success: false, message: 'İsim ve slug gerekli' });
    }
    const company = await prisma.company.create({
        data: { name, slug, address, contactEmail, contactPhone },
    });
    return res.status(201).json({ success: true, data: company });
});

// ── SERVICE CENTERS ────────────────────────────────────

// GET /api/v1/admin/service-centers
router.get('/service-centers', async (req: AuthRequest, res: Response) => {
    const centers = await prisma.serviceCenter.findMany({
        include: {
            _count: { select: { agreements: true, transactions: true, qrCodes: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: centers });
});

// POST /api/v1/admin/service-centers
router.post('/service-centers', async (req: AuthRequest, res: Response) => {
    const { name, address, type, contactEmail, phone } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'İsim gerekli' });
    }
    const center = await prisma.serviceCenter.create({
        data: { name, address, type: type || 'both', contactEmail, phone },
    });
    return res.status(201).json({ success: true, data: center });
});

// PUT /api/v1/admin/service-centers/:id/payment-day — Set payment day
router.put('/service-centers/:id/payment-day', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { paymentDay } = req.body;

    if (!paymentDay || paymentDay < 1 || paymentDay > 28) {
        return res.status(400).json({ success: false, message: 'Ödeme günü 1-28 arasında olmalı' });
    }

    const updated = await prisma.serviceCenter.update({
        where: { id },
        data: { paymentDay },
    });

    return res.json({
        success: true,
        data: updated,
        message: `Ödeme günü ayın ${paymentDay}'i olarak belirlendi`,
    });
});

// ── USERS ──────────────────────────────────────────────

// GET /api/v1/admin/users
router.get('/users', async (req: AuthRequest, res: Response) => {
    const users = await prisma.user.findMany({
        select: {
            id: true, email: true, plateNumber: true, firstName: true, lastName: true,
            role: true, isActive: true, phone: true, createdAt: true,
            company: { select: { id: true, name: true } },
            serviceCenter: { select: { id: true, name: true } },
            vehicle: { select: { id: true, plate: true, brand: true, model: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: users });
});

// POST /api/v1/admin/users
router.post('/users', async (req: AuthRequest, res: Response) => {
    const { email, plateNumber, password, firstName, lastName, role, companyId, serviceCenterId, vehicleId, phone } = req.body;
    if (!password || !firstName || !lastName || !role) {
        return res.status(400).json({ success: false, message: 'Zorunlu alanlar eksik' });
    }
    const hashedPw = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: { email, plateNumber, password: hashedPw, firstName, lastName, role, companyId, serviceCenterId, vehicleId, phone },
    });
    const { password: _pw, ...safeUser } = user;
    return res.status(201).json({ success: true, data: safeUser });
});

// PUT /api/v1/admin/users/:id/password — Change user password
router.put('/users/:id/password', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: 'Şifre en az 6 karakter olmalı' });
    }
    const hashedPw = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id }, data: { password: hashedPw } });
    return res.json({ success: true, message: 'Şifre güncellendi' });
});

// PUT /api/v1/admin/users/:id/status — Toggle user active/passive
router.put('/users/:id/status', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;
    const user = await prisma.user.update({ where: { id }, data: { isActive } });
    const { password: _pw, ...safeUser } = user;
    return res.json({ success: true, data: safeUser, message: `Kullanıcı ${isActive ? 'aktif' : 'pasif'} edildi` });
});

// ── COMPANY DETAIL ─────────────────────────────────────

// GET /api/v1/admin/companies/:id/vehicles
router.get('/companies/:id/vehicles', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const vehicles = await prisma.vehicle.findMany({
        where: { companyId: id },
        include: { _count: { select: { transactions: true, penalties: true } } },
        orderBy: { plate: 'asc' },
    });
    return res.json({ success: true, data: vehicles });
});

// GET /api/v1/admin/companies/:id/transactions
router.get('/companies/:id/transactions', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const transactions = await prisma.transaction.findMany({
        where: { vehicle: { companyId: id } },
        include: {
            vehicle: { select: { plate: true, brand: true, model: true } },
            serviceCenter: { select: { name: true } },
        },
        orderBy: { transactionDate: 'desc' },
        take: 200,
    });
    return res.json({ success: true, data: transactions });
});

// ── SERVICE CENTER DETAIL ──────────────────────────────

// GET /api/v1/admin/service-centers/:id/transactions
router.get('/service-centers/:id/transactions', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const transactions = await prisma.transaction.findMany({
        where: { serviceCenterId: id },
        include: {
            vehicle: {
                select: {
                    plate: true, brand: true, model: true,
                    company: { select: { name: true } },
                },
            },
        },
        orderBy: { transactionDate: 'desc' },
        take: 200,
    });
    return res.json({ success: true, data: transactions });
});

// ── AGREEMENTS ─────────────────────────────────────────

// GET /api/v1/admin/agreements
router.get('/agreements', async (req: AuthRequest, res: Response) => {
    const agreements = await prisma.agreement.findMany({
        include: {
            company: { select: { id: true, name: true } },
            serviceCenter: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: agreements });
});

// POST /api/v1/admin/agreements
router.post('/agreements', async (req: AuthRequest, res: Response) => {
    const { companyId, serviceCenterId, startDate, endDate, monthlyLimit, discountRate } = req.body;
    if (!companyId || !serviceCenterId || !startDate) {
        return res.status(400).json({ success: false, message: 'Şirket, servis merkezi ve başlangıç tarihi gerekli' });
    }
    const agreement = await prisma.agreement.create({
        data: {
            companyId, serviceCenterId,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            monthlyLimit, discountRate: discountRate || 0,
        },
        include: {
            company: { select: { name: true } },
            serviceCenter: { select: { name: true } },
        },
    });
    return res.status(201).json({ success: true, data: agreement });
});

// ── STATS ──────────────────────────────────────────────

// GET /api/v1/admin/stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
    const [companies, serviceCenters, vehicles, users, transactions, penalties] = await Promise.all([
        prisma.company.count(),
        prisma.serviceCenter.count(),
        prisma.vehicle.count(),
        prisma.user.count(),
        prisma.transaction.aggregate({ _sum: { amount: true }, _count: true }),
        prisma.penalty.aggregate({ _sum: { amount: true }, _count: true }),
    ]);

    return res.json({
        success: true,
        data: {
            companies, serviceCenters, vehicles, users,
            totalTransactions: transactions._count,
            totalTransactionAmount: transactions._sum.amount || 0,
            totalPenalties: penalties._count,
            totalPenaltyAmount: penalties._sum.amount || 0,
        },
    });
});

// ── KREDİ YÖNETİMİ (Credit Management) ───────────────

// GET /api/v1/admin/credits — List all companies with credit balances
router.get('/credits', async (req: AuthRequest, res: Response) => {
    const companies = await prisma.company.findMany({
        select: {
            id: true, name: true, creditBalance: true,
            _count: { select: { vehicles: true } },
        },
        orderBy: { name: 'asc' },
    });

    // Also get total allocated to vehicles per company
    const withDetails = await Promise.all(companies.map(async (c) => {
        const vehicleCredits = await prisma.vehicle.aggregate({
            where: { companyId: c.id },
            _sum: { creditBalance: true },
        });
        return {
            ...c,
            totalVehicleCredits: vehicleCredits._sum.creditBalance || 0,
        };
    }));

    return res.json({ success: true, data: withDetails });
});

// POST /api/v1/admin/credits/load — Load credits to a company
router.post('/credits/load', async (req: AuthRequest, res: Response) => {
    const { companyId, amount, description } = req.body;

    if (!companyId || !amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Şirket ve geçerli bir tutar gerekli' });
    }

    // Update company balance
    const company = await prisma.company.update({
        where: { id: companyId },
        data: { creditBalance: { increment: amount } },
    });

    // Create credit transaction record
    await prisma.creditTransaction.create({
        data: {
            type: 'load',
            amount,
            companyId,
            description: description || `Kredi yükleme — ₺${amount.toLocaleString('tr-TR')}`,
        },
    });

    return res.json({
        success: true,
        data: company,
        message: `₺${amount.toLocaleString('tr-TR')} kredi yüklendi. Yeni bakiye: ₺${company.creditBalance.toLocaleString('tr-TR')}`,
    });
});

// ── HAKEDİŞ (Accrued Earnings) ────────────────────────

// GET /api/v1/admin/hakedis — List all service centers with their unpaid earnings
router.get('/hakedis', async (req: AuthRequest, res: Response) => {
    // Get all service centers
    const centers = await prisma.serviceCenter.findMany({
        where: { isActive: true },
        select: {
            id: true, name: true, type: true, phone: true, contactEmail: true,
        },
    });

    // For each center, calculate: total transactions - total payouts = unpaid hakediş
    const hakedisData = await Promise.all(centers.map(async (sc) => {
        const [totalTx, totalPayouts, lastPayout] = await Promise.all([
            prisma.transaction.aggregate({
                where: { serviceCenterId: sc.id, status: 'completed' },
                _sum: { amount: true },
            }),
            prisma.payout.aggregate({
                where: { serviceCenterId: sc.id },
                _sum: { amount: true },
            }),
            prisma.payout.findFirst({
                where: { serviceCenterId: sc.id },
                orderBy: { paidAt: 'desc' },
                select: { paidAt: true, amount: true },
            }),
        ]);

        const totalRevenue = totalTx._sum.amount || 0;
        const totalPaid = totalPayouts._sum.amount || 0;
        const hakedis = totalRevenue - totalPaid;

        return {
            ...sc,
            totalRevenue,
            totalPaid,
            hakedis: Math.max(0, hakedis), // never negative
            lastPayoutDate: lastPayout?.paidAt || null,
            lastPayoutAmount: lastPayout?.amount || null,
        };
    }));

    // Sort by highest hakediş first
    hakedisData.sort((a, b) => b.hakedis - a.hakedis);

    return res.json({ success: true, data: hakedisData });
});

// POST /api/v1/admin/hakedis/:id/pay — Pay out hakediş for a service center
router.post('/hakedis/:id/pay', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { notes } = req.body;

    // Calculate current hakediş
    const [totalTx, totalPayouts] = await Promise.all([
        prisma.transaction.aggregate({
            where: { serviceCenterId: id, status: 'completed' },
            _sum: { amount: true },
        }),
        prisma.payout.aggregate({
            where: { serviceCenterId: id },
            _sum: { amount: true },
        }),
    ]);

    const hakedis = (totalTx._sum.amount || 0) - (totalPayouts._sum.amount || 0);

    if (hakedis <= 0) {
        return res.status(400).json({ success: false, message: 'Bu servis merkezinin hakediş borcu yok' });
    }

    // Create payout record
    const payout = await prisma.payout.create({
        data: {
            serviceCenterId: id,
            amount: hakedis,
            notes: notes || `Hakediş ödemesi — ₺${hakedis.toLocaleString('tr-TR')}`,
        },
    });

    return res.json({
        success: true,
        data: payout,
        message: `₺${hakedis.toLocaleString('tr-TR')} hakediş ödendi`,
    });
});

// GET /api/v1/admin/hakedis/history — Payout history
router.get('/hakedis/history', async (req: AuthRequest, res: Response) => {
    const payouts = await prisma.payout.findMany({
        include: {
            serviceCenter: { select: { id: true, name: true, type: true } },
        },
        orderBy: { paidAt: 'desc' },
        take: 50,
    });
    return res.json({ success: true, data: payouts });
});

// ── INDIVIDUAL USERS ────────────────────────────────────

// GET /api/v1/admin/individual-users
router.get('/individual-users', async (req: AuthRequest, res: Response) => {
    const users = await prisma.user.findMany({
        where: { role: 'INDIVIDUAL' },
        select: {
            id: true, firstName: true, lastName: true, email: true,
            phone: true, creditBalance: true, isActive: true, createdAt: true,
            individualPayments: {
                where: { status: 'success' },
                select: { amount: true, creditAmount: true, createdAt: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: users });
});

export default router;
