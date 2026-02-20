// @ts-nocheck
import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ── MY VEHICLE ─────────────────────────────────────────

// GET /api/v1/driver/my-vehicle — Driver's assigned vehicle
router.get('/my-vehicle', async (req: AuthRequest, res: Response) => {
    if (!req.user!.vehicleId) {
        return res.status(404).json({ success: false, message: 'Atanmış araç bulunamadı' });
    }

    const vehicle = await prisma.vehicle.findUnique({
        where: { id: req.user!.vehicleId },
        include: {
            company: { select: { name: true } },
        },
    });

    return res.json({ success: true, data: vehicle });
});

// ── MY TRANSACTIONS ────────────────────────────────────

// GET /api/v1/driver/transactions — Driver's transactions
router.get('/transactions', async (req: AuthRequest, res: Response) => {
    if (!req.user!.vehicleId) {
        return res.json({ success: true, data: [] });
    }

    const transactions = await prisma.transaction.findMany({
        where: { vehicleId: req.user!.vehicleId },
        include: {
            serviceCenter: { select: { name: true, type: true } },
        },
        orderBy: { transactionDate: 'desc' },
    });
    return res.json({ success: true, data: transactions });
});

// ── QR PAYMENT ─────────────────────────────────────────

// POST /api/v1/driver/pay — Pay via QR code
router.post('/pay', async (req: AuthRequest, res: Response) => {
    const { qrCode } = req.body;

    if (!qrCode) {
        return res.status(400).json({ success: false, message: 'QR kod gerekli' });
    }

    if (!req.user!.vehicleId) {
        return res.status(400).json({ success: false, message: 'Atanmış araç bulunamadı' });
    }

    // Find the QR code
    const qr = await prisma.qrCode.findUnique({
        where: { code: qrCode },
        include: { serviceCenter: true },
    });

    if (!qr || !qr.isActive) {
        return res.status(404).json({ success: false, message: 'Geçersiz veya aktif olmayan QR kod' });
    }

    // Check agreement between driver's company and service center
    const vehicle = await prisma.vehicle.findUnique({ where: { id: req.user!.vehicleId } });
    if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Araç bulunamadı' });
    }

    const agreement = await prisma.agreement.findFirst({
        where: {
            companyId: vehicle.companyId,
            serviceCenterId: qr.serviceCenterId,
            isActive: true,
        },
    });

    if (!agreement) {
        return res.status(403).json({ success: false, message: 'Bu servis merkezi ile anlaşma bulunamadı' });
    }

    // Calculate discounted amount
    const discountedAmount = qr.amount * (1 - agreement.discountRate / 100);

    // Create the transaction
    const transaction = await prisma.transaction.create({
        data: {
            type: qr.serviceType.includes('wash') ? 'wash' : 'maintenance',
            amount: discountedAmount,
            description: `${qr.label} (QR: ${qr.code})`,
            vehicleId: req.user!.vehicleId,
            serviceCenterId: qr.serviceCenterId,
            userId: req.user!.userId,
            qrPaymentRef: qr.code,
            status: 'completed',
        },
        include: {
            serviceCenter: { select: { name: true } },
            vehicle: { select: { plate: true } },
        },
    });

    return res.status(201).json({
        success: true,
        data: {
            transaction,
            originalAmount: qr.amount,
            discountRate: agreement.discountRate,
            discountedAmount,
        },
        message: `Ödeme başarılı: ${qr.label} — ₺${discountedAmount.toFixed(2)} (${agreement.discountRate}% indirim)`,
    });
});

// ── MY PENALTIES ───────────────────────────────────────

// GET /api/v1/driver/penalties
router.get('/penalties', async (req: AuthRequest, res: Response) => {
    if (!req.user!.vehicleId) {
        return res.json({ success: true, data: [] });
    }

    const penalties = await prisma.penalty.findMany({
        where: { vehicleId: req.user!.vehicleId },
        orderBy: { penaltyDate: 'desc' },
    });
    return res.json({ success: true, data: penalties });
});

export default router;
