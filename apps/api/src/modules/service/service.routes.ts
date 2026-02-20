// @ts-nocheck
import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ── PROFILE ────────────────────────────────────────────

// GET /api/v1/service/profile — Get service center's own profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
    const sc = await prisma.serviceCenter.findUnique({
        where: { id: req.user!.serviceCenterId! },
    });
    if (!sc) return res.status(404).json({ success: false, message: 'Servis merkezi bulunamadı' });
    return res.json({ success: true, data: sc });
});

// PUT /api/v1/service/profile — Update profile info
router.put('/profile', async (req: AuthRequest, res: Response) => {
    const { address, phone, contactEmail, workingHours, type, description, name, iban, bankAccountName, bankName } = req.body;

    const updated = await prisma.serviceCenter.update({
        where: { id: req.user!.serviceCenterId! },
        data: {
            ...(address !== undefined && { address }),
            ...(phone !== undefined && { phone }),
            ...(contactEmail !== undefined && { contactEmail }),
            ...(workingHours !== undefined && { workingHours }),
            ...(type !== undefined && { type }),
            ...(description !== undefined && { description }),
            ...(name !== undefined && { name }),
            ...(iban !== undefined && { iban }),
            ...(bankAccountName !== undefined && { bankAccountName }),
            ...(bankName !== undefined && { bankName }),
        },
    });

    return res.json({ success: true, data: updated, message: 'Profil güncellendi' });
});

// ── HAKEDİŞ ────────────────────────────────────────────

// GET /api/v1/service/hakedis — Get service center's accrued earnings
router.get('/hakedis', async (req: AuthRequest, res: Response) => {
    const scId = req.user!.serviceCenterId!;

    const [totalTx, totalPayouts, payouts] = await Promise.all([
        prisma.transaction.aggregate({
            where: { serviceCenterId: scId, status: 'completed' },
            _sum: { amount: true },
            _count: true,
        }),
        prisma.payout.aggregate({
            where: { serviceCenterId: scId },
            _sum: { amount: true },
        }),
        prisma.payout.findMany({
            where: { serviceCenterId: scId },
            orderBy: { paidAt: 'desc' },
            take: 10,
        }),
    ]);

    const totalRevenue = totalTx._sum.amount || 0;
    const totalPaid = totalPayouts._sum.amount || 0;
    const hakedis = Math.max(0, totalRevenue - totalPaid);

    return res.json({
        success: true,
        data: {
            hakedis,
            totalRevenue,
            totalPaid,
            totalTransactions: totalTx._count,
            payoutHistory: payouts,
        },
    });
});

// ── TRANSACTIONS ───────────────────────────────────────

// GET /api/v1/service/transactions — Service center's transactions
router.get('/transactions', async (req: AuthRequest, res: Response) => {
    const transactions = await prisma.transaction.findMany({
        where: { serviceCenterId: req.user!.serviceCenterId! },
        include: {
            vehicle: { select: { plate: true, brand: true, model: true, company: { select: { name: true } } } },
            user: { select: { firstName: true, lastName: true } },
        },
        orderBy: { transactionDate: 'desc' },
    });
    return res.json({ success: true, data: transactions });
});

// ── RECEIVE PAYMENT (simulate) ─────────────────────────

// POST /api/v1/service/receive-payment — Receive QR payment
router.post('/receive-payment', async (req: AuthRequest, res: Response) => {
    const { qrCode, vehiclePlate } = req.body;

    if (!qrCode || !vehiclePlate) {
        return res.status(400).json({ success: false, message: 'QR kod ve araç plakası gerekli' });
    }

    // Find the QR code owned by this service center
    const qr = await prisma.qrCode.findFirst({
        where: { code: qrCode, serviceCenterId: req.user!.serviceCenterId!, isActive: true },
    });

    if (!qr) {
        return res.status(404).json({ success: false, message: 'Geçersiz QR kod' });
    }

    // Find the vehicle
    const vehicle = await prisma.vehicle.findUnique({ where: { plate: vehiclePlate } });
    if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Araç bulunamadı' });
    }

    // Check agreement
    const agreement = await prisma.agreement.findFirst({
        where: {
            companyId: vehicle.companyId,
            serviceCenterId: req.user!.serviceCenterId!,
            isActive: true,
        },
    });

    if (!agreement) {
        return res.status(403).json({ success: false, message: 'Bu araçın şirketi ile anlaşma bulunamadı' });
    }

    const discountedAmount = qr.amount * (1 - agreement.discountRate / 100);

    const transaction = await prisma.transaction.create({
        data: {
            type: qr.serviceType.includes('wash') ? 'wash' : 'maintenance',
            amount: discountedAmount,
            description: `${qr.label} — ${vehiclePlate}`,
            vehicleId: vehicle.id,
            serviceCenterId: req.user!.serviceCenterId!,
            qrPaymentRef: qr.code,
            status: 'completed',
        },
        include: {
            vehicle: { select: { plate: true, brand: true, model: true } },
        },
    });

    return res.status(201).json({
        success: true,
        data: { transaction, originalAmount: qr.amount, discountRate: agreement.discountRate, discountedAmount },
        message: `Ödeme alındı: ₺${discountedAmount.toFixed(2)}`,
    });
});

// ── KREDİ İLE ÖDEME ────────────────────────────────────

// POST /api/v1/service/use-credit — Use vehicle credit for service
// Daily limit: 1 wash, 1 maintenance, 1 tire per vehicle per day
router.post('/use-credit', async (req: AuthRequest, res: Response) => {
    const { vehiclePlate, serviceType, amount } = req.body;

    if (!vehiclePlate || !serviceType || !amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Plaka, hizmet türü (wash/maintenance/tire) ve tutar gerekli',
        });
    }

    // Validate service type
    const validTypes = ['wash', 'maintenance', 'tire'];
    if (!validTypes.includes(serviceType)) {
        return res.status(400).json({
            success: false,
            message: 'Hizmet türü wash, maintenance veya tire olmalı',
        });
    }

    // Find vehicle
    const vehicle = await prisma.vehicle.findUnique({
        where: { plate: vehiclePlate },
        include: { company: { select: { name: true } } },
    });
    if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Araç bulunamadı' });
    }

    // Check daily limit — has this vehicle already used this service type today?
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const usedToday = await prisma.creditTransaction.count({
        where: {
            vehicleId: vehicle.id,
            type: 'spend',
            serviceType,
            createdAt: { gte: todayStart, lte: todayEnd },
        },
    });

    if (usedToday >= 1) {
        const typeLabels: Record<string, string> = {
            wash: 'yıkama',
            maintenance: 'bakım',
            tire: 'lastik',
        };
        return res.status(400).json({
            success: false,
            message: `Bu araç bugün zaten ${typeLabels[serviceType]} hizmeti kullanmış. Günlük limit: 1 kez.`,
        });
    }

    // Check vehicle has enough credit balance
    if (vehicle.creditBalance < amount) {
        return res.status(400).json({
            success: false,
            message: `Araç kredi bakiyesi yetersiz. Mevcut: ₺${vehicle.creditBalance.toLocaleString('tr-TR')}`,
        });
    }

    // Deduct credit from vehicle
    await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { creditBalance: { decrement: amount } },
    });

    // Create credit spend transaction
    await prisma.creditTransaction.create({
        data: {
            type: 'spend',
            amount,
            vehicleId: vehicle.id,
            companyId: vehicle.companyId,
            serviceCenterId: req.user!.serviceCenterId!,
            serviceType,
            description: `${vehiclePlate} — ${serviceType} hizmeti — ₺${amount.toLocaleString('tr-TR')}`,
        },
    });

    // Create a regular transaction too (feeds into hakediş)
    const transaction = await prisma.transaction.create({
        data: {
            type: serviceType,
            amount,
            description: `Kredi ile ${serviceType} — ${vehiclePlate}`,
            vehicleId: vehicle.id,
            serviceCenterId: req.user!.serviceCenterId!,
            userId: req.user!.id,
            status: 'completed',
        },
        include: {
            vehicle: { select: { plate: true, brand: true, model: true } },
        },
    });

    return res.status(201).json({
        success: true,
        data: {
            transaction,
            remainingBalance: vehicle.creditBalance - amount,
        },
        message: `₺${amount.toLocaleString('tr-TR')} kredi kullanıldı. Kalan: ₺${(vehicle.creditBalance - amount).toLocaleString('tr-TR')}`,
    });
});

// ── QR CODES ───────────────────────────────────────────

// GET /api/v1/service/qr-codes — Service center's QR codes
router.get('/qr-codes', async (req: AuthRequest, res: Response) => {
    const qrCodes = await prisma.qrCode.findMany({
        where: { serviceCenterId: req.user!.serviceCenterId! },
        orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: qrCodes });
});

// ── STATS ──────────────────────────────────────────────

// GET /api/v1/service/stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
    const scId = req.user!.serviceCenterId!;
    const [transactions, agreements, qrCodes] = await Promise.all([
        prisma.transaction.aggregate({
            where: { serviceCenterId: scId },
            _sum: { amount: true }, _count: true,
        }),
        prisma.agreement.count({ where: { serviceCenterId: scId, isActive: true } }),
        prisma.qrCode.count({ where: { serviceCenterId: scId, isActive: true } }),
    ]);

    return res.json({
        success: true,
        data: {
            totalTransactions: transactions._count,
            totalRevenue: transactions._sum.amount || 0,
            activeAgreements: agreements,
            activeQrCodes: qrCodes,
        },
    });
});

export default router;
