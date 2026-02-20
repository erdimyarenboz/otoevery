import { Router, Request, Response } from 'express';
import { requirePermission } from '../../middleware/rbac';
import { auditLog } from '../../middleware/audit';
import { getTenantId } from '../../middleware/tenant';
import { paginationSchema } from '@otoevery/shared';
import prisma from '../../config/database';

export const penaltyRouter = Router();

penaltyRouter.get('/', requirePermission('penalties:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { page, limit, sort, order } = paginationSchema.parse(req.query);
        const where: any = { tenantId, deletedAt: null };
        if (req.query.status) where.status = req.query.status;
        if (req.query.vehicleId) where.vehicleId = req.query.vehicleId;
        const [data, total] = await Promise.all([
            prisma.penalty.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { [sort]: order }, include: { vehicle: true, matchedEmployee: true } }),
            prisma.penalty.count({ where }),
        ]);
        res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Ceza listesi alınamadı' } }); }
});

penaltyRouter.post('/', requirePermission('penalties:create'), auditLog('penalty'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const penalty = await prisma.penalty.create({ data: { tenantId, ...req.body, penaltyDate: new Date(req.body.penaltyDate), createdById: req.user!.id, updatedById: req.user!.id } });
        res.status(201).json({ success: true, data: penalty });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Ceza kaydı oluşturulamadı' } }); }
});

penaltyRouter.put('/:id', requirePermission('penalties:update'), auditLog('penalty'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const existing = await prisma.penalty.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null } });
        if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ceza kaydı bulunamadı' } });
        const penalty = await prisma.penalty.update({ where: { id: req.params.id }, data: { ...req.body, updatedById: req.user!.id } });
        res.json({ success: true, data: penalty });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Ceza kaydı güncellenemedi' } }); }
});

penaltyRouter.post('/:id/pay', requirePermission('penalties:update'), auditLog('penalty'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const existing = await prisma.penalty.findFirst({ where: { id: req.params.id, tenantId, status: 'unpaid', deletedAt: null } });
        if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ödenmemiş ceza bulunamadı' } });
        const penalty = await prisma.penalty.update({
            where: { id: req.params.id },
            data: { status: 'paid', paymentDate: new Date(), paymentAmount: req.body.paymentAmount, updatedById: req.user!.id },
        });
        res.json({ success: true, data: penalty });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Ödeme yapılamadı' } }); }
});

penaltyRouter.post('/:id/dispute', requirePermission('penalties:update'), auditLog('penalty'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const existing = await prisma.penalty.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null } });
        if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ceza bulunamadı' } });
        const dispute = await prisma.penaltyDispute.create({
            data: { tenantId, penaltyId: req.params.id, reason: req.body.reason, createdById: req.user!.id },
        });
        await prisma.penalty.update({ where: { id: req.params.id }, data: { status: 'disputed', updatedById: req.user!.id } });
        res.status(201).json({ success: true, data: dispute });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'İtiraz oluşturulamadı' } }); }
});
