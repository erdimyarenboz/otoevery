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
router.post('/use-credit', async (req: AuthRequest, res: Response) => {
    const { vehiclePlate, serviceType, amount } = req.body;

    if (!vehiclePlate || !serviceType || !amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Plaka, hizmet türü ve tutar gerekli',
        });
    }

    // Find vehicle with rights
    const vehicle = await prisma.vehicle.findUnique({
        where: { plate: vehiclePlate },
        include: {
            company: { select: { id: true, name: true } },
            serviceRights: { where: { serviceType } }
        },
    });
    if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Araç bulunamadı' });
    }

    // Check daily limit
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
        return res.status(400).json({
            success: false,
            message: `Bu araç bugün zaten bu hizmeti kullanmış. Günlük limit: 1 kez.`,
        });
    }

    let storageType = 'creditBalance'; // default fallback
    const right = vehicle.serviceRights[0];

    // Priority 1: Service Specific Points
    if (right && right.points >= amount) {
        storageType = 'rightPoints';
    }
    // Priority 2: Service Specific Quantity (Count-based)
    else if (right && right.quantity > 0) {
        storageType = 'rightQuantity';
    }
    // Priority 3: General Vehicle Credit Balance
    else if (vehicle.creditBalance >= amount) {
        storageType = 'creditBalance';
    } else {
        return res.status(400).json({
            success: false,
            message: `Yetersiz bakiye veya kullanım hakkı.`,
        });
    }

    // Transactional Update
    const result = await prisma.$transaction(async (tx) => {
        if (storageType === 'rightPoints') {
            await tx.vehicleServiceRight.update({
                where: { id: right.id },
                data: { points: { decrement: amount } }
            });
        } else if (storageType === 'rightQuantity') {
            await tx.vehicleServiceRight.update({
                where: { id: right.id },
                data: { quantity: { decrement: 1 } }
            });
        } else {
            await tx.vehicle.update({
                where: { id: vehicle.id },
                data: { creditBalance: { decrement: amount } }
            });
        }

        // Create credit spend transaction
        await tx.creditTransaction.create({
            data: {
                type: 'spend',
                amount,
                vehicleId: vehicle.id,
                companyId: vehicle.companyId,
                serviceCenterId: req.user!.serviceCenterId!,
                serviceType,
                description: `${vehiclePlate} — ${serviceType} (${storageType}) — ₺${amount.toLocaleString('tr-TR')}`,
            },
        });

        // Create a regular transaction
        return tx.transaction.create({
            data: {
                type: serviceType,
                amount,
                description: `Kredi/Hak ile ${serviceType} — ${vehiclePlate}`,
                vehicleId: vehicle.id,
                serviceCenterId: req.user!.serviceCenterId!,
                userId: req.user!.id,
                status: 'completed',
            },
            include: {
                vehicle: { select: { plate: true, brand: true, model: true } },
            },
        });
    });

    return res.status(201).json({
        success: true,
        data: { transaction: result },
        message: `₺${amount.toLocaleString('tr-TR')} tutarında kullanım başarıyla gerçekleşti.`,
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
