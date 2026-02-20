import { Router, Request, Response } from 'express';
import { requirePermission } from '../../middleware/rbac';
import { auditLog } from '../../middleware/audit';
import { getTenantId } from '../../middleware/tenant';
import { paginationSchema } from '@otoevery/shared';
import prisma from '../../config/database';

export const tireRouter = Router();

tireRouter.get('/', requirePermission('tires:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { page, limit, sort, order, q } = paginationSchema.parse(req.query);
        const where: any = { tenantId, deletedAt: null };
        if (req.query.status) where.status = req.query.status;
        if (q) where.OR = [{ serialNo: { contains: q, mode: 'insensitive' } }, { brand: { contains: q, mode: 'insensitive' } }];
        const [data, total] = await Promise.all([
            prisma.tireAsset.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { [sort]: order } }),
            prisma.tireAsset.count({ where }),
        ]);
        res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Lastik listesi alınamadı' } }); }
});

tireRouter.post('/', requirePermission('tires:create'), auditLog('tire_asset'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const tire = await prisma.tireAsset.create({ data: { tenantId, ...req.body, createdById: req.user!.id, updatedById: req.user!.id } });
        res.status(201).json({ success: true, data: tire });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Lastik oluşturulamadı' } }); }
});

tireRouter.put('/:id', requirePermission('tires:update'), auditLog('tire_asset'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const existing = await prisma.tireAsset.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null } });
        if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Lastik bulunamadı' } });
        const tire = await prisma.tireAsset.update({ where: { id: req.params.id }, data: { ...req.body, updatedById: req.user!.id } });
        res.json({ success: true, data: tire });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Lastik güncellenemedi' } }); }
});

// POST /tires/:id/fit - Mount tire on vehicle
tireRouter.post('/:id/fit', requirePermission('tires:update'), auditLog('tire_fitting'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const fitting = await prisma.tireFitting.create({
            data: { tenantId, tireId: req.params.id, vehicleId: req.body.vehicleId, position: req.body.position, fittedDate: new Date(req.body.fittedDate), fittedKm: req.body.fittedKm, treadDepthAtFit: req.body.treadDepthAtFit, createdById: req.user!.id },
        });
        await prisma.tireAsset.update({ where: { id: req.params.id }, data: { status: 'fitted' } });
        res.status(201).json({ success: true, data: fitting });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Lastik takılamadı' } }); }
});

// POST /tires/:id/remove - Remove tire from vehicle
tireRouter.post('/:id/remove', requirePermission('tires:update'), auditLog('tire_fitting'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const activeFitting = await prisma.tireFitting.findFirst({ where: { tenantId, tireId: req.params.id, removedDate: null }, orderBy: { fittedDate: 'desc' } });
        if (!activeFitting) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Aktif takım bulunamadı' } });
        await prisma.tireFitting.update({ where: { id: activeFitting.id }, data: { removedDate: new Date(req.body.removedDate || new Date()), removedKm: req.body.removedKm, treadDepthAtRemove: req.body.treadDepthAtRemove, reason: req.body.reason } });
        await prisma.tireAsset.update({ where: { id: req.params.id }, data: { status: 'in_stock' } });
        res.json({ success: true, data: { message: 'Lastik çıkarıldı' } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Lastik çıkarılamadı' } }); }
});

// POST /tires/:id/inspect
tireRouter.post('/:id/inspect', requirePermission('tires:update'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const inspection = await prisma.tireInspection.create({
            data: { tenantId, tireId: req.params.id, vehicleId: req.body.vehicleId, inspectionDate: new Date(req.body.inspectionDate || new Date()), treadDepth: req.body.treadDepth, pressure: req.body.pressure, condition: req.body.condition, notes: req.body.notes, createdById: req.user!.id },
        });
        // Update tread depth on asset
        if (req.body.treadDepth) await prisma.tireAsset.update({ where: { id: req.params.id }, data: { treadDepth: req.body.treadDepth } });
        res.status(201).json({ success: true, data: inspection });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Muayene kaydı oluşturulamadı' } }); }
});
