import { Router, Request, Response } from 'express';
import { requirePermission } from '../../middleware/rbac';
import { auditLog } from '../../middleware/audit';
import { getTenantId } from '../../middleware/tenant';
import { paginationSchema } from '@otoevery/shared';
import prisma from '../../config/database';

export const documentRouter = Router();

documentRouter.get('/', requirePermission('documents:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { page, limit, sort, order, q } = paginationSchema.parse(req.query);
        const where: any = { tenantId, deletedAt: null };
        if (req.query.vehicleId) where.vehicleId = req.query.vehicleId;
        if (req.query.employeeId) where.employeeId = req.query.employeeId;
        if (req.query.documentTypeId) where.documentTypeId = req.query.documentTypeId;
        if (q) where.title = { contains: q, mode: 'insensitive' };

        // Expiring soon filter
        if (req.query.expiringSoon === 'true') {
            const thirtyDays = new Date();
            thirtyDays.setDate(thirtyDays.getDate() + 30);
            where.expiryDate = { lte: thirtyDays, gte: new Date() };
        }
        if (req.query.expired === 'true') {
            where.expiryDate = { lt: new Date() };
        }

        const [data, total] = await Promise.all([
            prisma.document.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { [sort]: order }, include: { vehicle: true, employee: true, documentType: true } }),
            prisma.document.count({ where }),
        ]);
        res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Belge listesi alınamadı' } }); }
});

documentRouter.post('/', requirePermission('documents:create'), auditLog('document'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const doc = await prisma.document.create({ data: { tenantId, ...req.body, createdById: req.user!.id, updatedById: req.user!.id }, include: { documentType: true } });
        res.status(201).json({ success: true, data: doc });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Belge oluşturulamadı' } }); }
});

documentRouter.put('/:id', requirePermission('documents:update'), auditLog('document'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const existing = await prisma.document.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null } });
        if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Belge bulunamadı' } });
        const doc = await prisma.document.update({ where: { id: req.params.id }, data: { ...req.body, updatedById: req.user!.id } });
        res.json({ success: true, data: doc });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Belge güncellenemedi' } }); }
});

documentRouter.delete('/:id', requirePermission('documents:delete'), auditLog('document'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const existing = await prisma.document.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null } });
        if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Belge bulunamadı' } });
        await prisma.document.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedById: req.user!.id } });
        res.json({ success: true, data: { message: 'Belge silindi' } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Belge silinemedi' } }); }
});

// GET /documents/types
documentRouter.get('/types', requirePermission('documents:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const types = await prisma.documentType.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
        res.json({ success: true, data: types });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Belge tipleri alınamadı' } }); }
});

// GET /documents/expiring — Summary of expiring documents
documentRouter.get('/expiring', requirePermission('documents:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const now = new Date();
        const [expired, within7, within15, within30] = await Promise.all([
            prisma.document.count({ where: { tenantId, deletedAt: null, expiryDate: { lt: now } } }),
            prisma.document.count({ where: { tenantId, deletedAt: null, expiryDate: { gte: now, lte: new Date(now.getTime() + 7 * 86400000) } } }),
            prisma.document.count({ where: { tenantId, deletedAt: null, expiryDate: { gte: now, lte: new Date(now.getTime() + 15 * 86400000) } } }),
            prisma.document.count({ where: { tenantId, deletedAt: null, expiryDate: { gte: now, lte: new Date(now.getTime() + 30 * 86400000) } } }),
        ]);
        res.json({ success: true, data: { expired, within7, within15, within30 } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Belge sona erme verileri alınamadı' } }); }
});
