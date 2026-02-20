import { Router, Request, Response } from 'express';
import { requirePermission } from '../../middleware/rbac';
import { auditLog } from '../../middleware/audit';
import { getTenantId } from '../../middleware/tenant';
import { paginationSchema } from '@otoevery/shared';
import prisma from '../../config/database';

export const assignmentRouter = Router();

assignmentRouter.get('/', requirePermission('assignments:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { page, limit, sort, order } = paginationSchema.parse(req.query);
        const where: any = { tenantId, deletedAt: null };
        if (req.query.status) where.status = req.query.status;
        if (req.query.vehicleId) where.vehicleId = req.query.vehicleId;
        if (req.query.employeeId) where.employeeId = req.query.employeeId;
        const [data, total] = await Promise.all([
            prisma.assignment.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { [sort]: order }, include: { vehicle: true, employee: true } }),
            prisma.assignment.count({ where }),
        ]);
        res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Zimmet listesi alınamadı' } }); }
});

assignmentRouter.post('/', requirePermission('assignments:create'), auditLog('assignment'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { vehicleId, employeeId, startDate, endDate, startKm, handoverNotes } = req.body;

        // Check if vehicle has active assignment
        const active = await prisma.assignment.findFirst({ where: { tenantId, vehicleId, status: 'active', deletedAt: null } });
        if (active) return res.status(409).json({ success: false, error: { code: 'ALREADY_ASSIGNED', message: 'Bu araç zaten zimmetli' } });

        const assignment = await prisma.assignment.create({
            data: { tenantId, vehicleId, employeeId, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, startKm, handoverNotes, createdById: req.user!.id, updatedById: req.user!.id },
            include: { vehicle: true, employee: true },
        });

        res.status(201).json({ success: true, data: assignment });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Zimmet oluşturulamadı' } }); }
});

assignmentRouter.post('/:id/complete', requirePermission('assignments:update'), auditLog('assignment'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const existing = await prisma.assignment.findFirst({ where: { id: req.params.id, tenantId, status: 'active', deletedAt: null } });
        if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Aktif zimmet bulunamadı' } });

        const assignment = await prisma.assignment.update({
            where: { id: req.params.id },
            data: { status: 'completed', endDate: new Date(), endKm: req.body.endKm, endCondition: req.body.endCondition, updatedById: req.user!.id },
        });

        res.json({ success: true, data: assignment });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Zimmet kapatılamadı' } }); }
});

assignmentRouter.post('/:id/confirm', async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const existing = await prisma.assignment.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null } });
        if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Zimmet bulunamadı' } });

        await prisma.assignment.update({ where: { id: req.params.id }, data: { confirmedAt: new Date(), confirmedById: req.user!.id } });
        res.json({ success: true, data: { message: 'Zimmet onaylandı' } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Onay yapılamadı' } }); }
});
