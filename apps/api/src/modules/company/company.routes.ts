import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ── VEHICLES ───────────────────────────────────────────

// GET /api/v1/company/vehicles — List company's vehicles
router.get('/vehicles', async (req: AuthRequest, res: Response) => {
    const vehicles = await prisma.vehicle.findMany({
        where: { companyId: req.user!.companyId! },
        include: {
            drivers: { select: { id: true, firstName: true, lastName: true, plateNumber: true } },
            _count: { select: { transactions: true, penalties: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: vehicles });
});

// POST /api/v1/company/vehicles — Add vehicle
router.post('/vehicles', async (req: AuthRequest, res: Response) => {
    const { plate, brand, model, year, color, fuelType, currentKm } = req.body;
    if (!plate) {
        return res.status(400).json({ success: false, message: 'Plaka gerekli' });
    }
    const vehicle = await prisma.vehicle.create({
        data: { plate, brand, model, year, color, fuelType, currentKm: currentKm || 0, companyId: req.user!.companyId! },
    });
    return res.status(201).json({ success: true, data: vehicle });
});

// DELETE /api/v1/company/vehicles/:id — Remove vehicle
router.delete('/vehicles/:id', async (req: AuthRequest, res: Response) => {
    const vehicle = await prisma.vehicle.findFirst({
        where: { id: req.params.id, companyId: req.user!.companyId! },
    });
    if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Araç bulunamadı' });
    }
    await prisma.vehicle.update({ where: { id: req.params.id }, data: { status: 'sold' } });
    return res.json({ success: true, message: 'Araç pasife alındı' });
});

// ── TRANSACTIONS ───────────────────────────────────────

// GET /api/v1/company/transactions — Company's transactions
router.get('/transactions', async (req: AuthRequest, res: Response) => {
    const transactions = await prisma.transaction.findMany({
        where: { vehicle: { companyId: req.user!.companyId! } },
        include: {
            vehicle: { select: { plate: true, brand: true, model: true } },
            serviceCenter: { select: { name: true } },
        },
        orderBy: { transactionDate: 'desc' },
    });
    return res.json({ success: true, data: transactions });
});

// ── PENALTIES ──────────────────────────────────────────

// GET /api/v1/company/penalties — Company's penalties
router.get('/penalties', async (req: AuthRequest, res: Response) => {
    const penalties = await prisma.penalty.findMany({
        where: { vehicle: { companyId: req.user!.companyId! } },
        include: {
            vehicle: { select: { plate: true, brand: true, model: true } },
        },
        orderBy: { penaltyDate: 'desc' },
    });
    return res.json({ success: true, data: penalties });
});

// ── STATS ──────────────────────────────────────────────

// GET /api/v1/company/stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
    const companyId = req.user!.companyId!;
    const [vehicles, activeVehicles, transactions, penalties, agreements, company] = await Promise.all([
        prisma.vehicle.count({ where: { companyId } }),
        prisma.vehicle.count({ where: { companyId, status: 'active' } }),
        prisma.transaction.aggregate({
            where: { vehicle: { companyId } },
            _sum: { amount: true }, _count: true,
        }),
        prisma.penalty.aggregate({
            where: { vehicle: { companyId } },
            _sum: { amount: true }, _count: true,
        }),
        prisma.agreement.count({ where: { companyId, isActive: true } }),
        prisma.company.findUnique({ where: { id: companyId }, select: { creditBalance: true } }),
    ]);

    return res.json({
        success: true,
        data: {
            totalVehicles: vehicles,
            activeVehicles,
            totalTransactions: transactions._count,
            totalTransactionAmount: transactions._sum.amount || 0,
            totalPenalties: penalties._count,
            totalPenaltyAmount: penalties._sum.amount || 0,
            activeAgreements: agreements,
            creditBalance: company?.creditBalance || 0,
        },
    });
});

// ── KREDİ YÖNETİMİ ────────────────────────────────────

// GET /api/v1/company/credits — Company balance + all vehicles with balances
router.get('/credits', async (req: AuthRequest, res: Response) => {
    const companyId = req.user!.companyId!;

    const [company, vehicles] = await Promise.all([
        prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true, name: true, creditBalance: true },
        }),
        prisma.vehicle.findMany({
            where: { companyId, status: 'active' },
            select: { id: true, plate: true, brand: true, model: true, creditBalance: true },
            orderBy: { plate: 'asc' },
        }),
    ]);

    return res.json({
        success: true,
        data: { company, vehicles },
    });
});

// POST /api/v1/company/credits/allocate — Allocate credit from company to a vehicle
router.post('/credits/allocate', async (req: AuthRequest, res: Response) => {
    const companyId = req.user!.companyId!;
    const { vehicleId, amount } = req.body;

    if (!vehicleId || !amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Araç ve geçerli bir tutar gerekli' });
    }

    // Check company has enough balance
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company || company.creditBalance < amount) {
        return res.status(400).json({
            success: false,
            message: `Yetersiz bakiye. Mevcut: ₺${company?.creditBalance?.toLocaleString('tr-TR') || 0}`,
        });
    }

    // Check vehicle belongs to this company
    const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, companyId } });
    if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Araç bulunamadı' });
    }

    // Transfer: decrease company, increase vehicle
    await Promise.all([
        prisma.company.update({
            where: { id: companyId },
            data: { creditBalance: { decrement: amount } },
        }),
        prisma.vehicle.update({
            where: { id: vehicleId },
            data: { creditBalance: { increment: amount } },
        }),
        prisma.creditTransaction.create({
            data: {
                type: 'allocate',
                amount,
                companyId,
                vehicleId,
                description: `${vehicle.plate} plakasına ₺${amount.toLocaleString('tr-TR')} kredi yüklendi`,
            },
        }),
    ]);

    return res.json({
        success: true,
        message: `₺${amount.toLocaleString('tr-TR')} kredi ${vehicle.plate} plakasına yüklendi`,
    });
});

// GET /api/v1/company/credits/history — Credit transaction history
router.get('/credits/history', async (req: AuthRequest, res: Response) => {
    const companyId = req.user!.companyId!;

    const transactions = await prisma.creditTransaction.findMany({
        where: { companyId },
        include: {
            vehicle: { select: { plate: true, brand: true, model: true } },
            serviceCenter: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });

    return res.json({ success: true, data: transactions });
});

export default router;

