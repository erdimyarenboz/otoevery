import { Router, Request, Response } from 'express';
import { requirePermission } from '../../middleware/rbac';
import { auditLog } from '../../middleware/audit';
import { getTenantId } from '../../middleware/tenant';
import { paginationSchema } from '@otoevery/shared';
import prisma from '../../config/database';

export const rentalRouter = Router();

rentalRouter.get('/', requirePermission('rentals:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { page, limit, sort, order } = paginationSchema.parse(req.query);
        const where: any = { tenantId, deletedAt: null };
        if (req.query.status) where.status = req.query.status;
        if (req.query.vehicleId) where.vehicleId = req.query.vehicleId;
        const [data, total] = await Promise.all([
            prisma.rentalContract.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { [sort]: order }, include: { vehicle: true } }),
            prisma.rentalContract.count({ where }),
        ]);
        res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Kiralama listesi alınamadı' } }); }
});

rentalRouter.post('/', requirePermission('rentals:create'), auditLog('rental_contract'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const contract = await prisma.rentalContract.create({
            data: { tenantId, ...req.body, startDate: new Date(req.body.startDate), endDate: new Date(req.body.endDate), createdById: req.user!.id, updatedById: req.user!.id },
            include: { vehicle: true },
        });
        // Mark vehicle as rented
        await prisma.vehicle.update({ where: { id: req.body.vehicleId }, data: { ownership: 'rented' } });
        res.status(201).json({ success: true, data: contract });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Kiralama sözleşmesi oluşturulamadı' } }); }
});

rentalRouter.put('/:id', requirePermission('rentals:update'), auditLog('rental_contract'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const existing = await prisma.rentalContract.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null } });
        if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sözleşme bulunamadı' } });
        const contract = await prisma.rentalContract.update({ where: { id: req.params.id }, data: { ...req.body, updatedById: req.user!.id } });
        res.json({ success: true, data: contract });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Sözleşme güncellenemedi' } }); }
});

// GET /rental-contracts/:id/invoices
rentalRouter.get('/:id/invoices', requirePermission('rentals:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const invoices = await prisma.rentalInvoice.findMany({ where: { tenantId, contractId: req.params.id }, orderBy: { invoiceDate: 'desc' } });
        res.json({ success: true, data: invoices });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Faturalar alınamadı' } }); }
});

rentalRouter.post('/:id/invoices', requirePermission('rentals:create'), auditLog('rental_invoice'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const invoice = await prisma.rentalInvoice.create({
            data: { tenantId, contractId: req.params.id, ...req.body, invoiceDate: new Date(req.body.invoiceDate), createdById: req.user!.id },
        });
        res.status(201).json({ success: true, data: invoice });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Fatura oluşturulamadı' } }); }
});
