import { Router, Request, Response } from 'express';
import { requirePermission } from '../../middleware/rbac';
import { auditLog } from '../../middleware/audit';
import { getTenantId } from '../../middleware/tenant';
import { paginationSchema } from '@otoevery/shared';
import prisma from '../../config/database';

export const expenseRouter = Router();

expenseRouter.get('/', requirePermission('expenses:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { page, limit, sort, order } = paginationSchema.parse(req.query);
        const where: any = { tenantId, deletedAt: null };
        if (req.query.vehicleId) where.vehicleId = req.query.vehicleId;
        if (req.query.categoryId) where.categoryId = req.query.categoryId;
        if (req.query.startDate && req.query.endDate) {
            where.expenseDate = { gte: new Date(req.query.startDate as string), lte: new Date(req.query.endDate as string) };
        }
        const [data, total] = await Promise.all([
            prisma.expense.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { [sort]: order }, include: { vehicle: true, category: true, employee: true } }),
            prisma.expense.count({ where }),
        ]);
        res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Masraf listesi alınamadı' } }); }
});

expenseRouter.post('/', requirePermission('expenses:create'), auditLog('expense'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const expense = await prisma.expense.create({
            data: { tenantId, ...req.body, expenseDate: new Date(req.body.expenseDate), createdById: req.user!.id, updatedById: req.user!.id },
            include: { category: true },
        });
        res.status(201).json({ success: true, data: expense });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Masraf oluşturulamadı' } }); }
});

expenseRouter.put('/:id', requirePermission('expenses:update'), auditLog('expense'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const existing = await prisma.expense.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null } });
        if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Masraf bulunamadı' } });
        const expense = await prisma.expense.update({ where: { id: req.params.id }, data: { ...req.body, updatedById: req.user!.id } });
        res.json({ success: true, data: expense });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Masraf güncellenemedi' } }); }
});

expenseRouter.delete('/:id', requirePermission('expenses:delete'), auditLog('expense'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const existing = await prisma.expense.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null } });
        if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Masraf bulunamadı' } });
        await prisma.expense.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedById: req.user!.id } });
        res.json({ success: true, data: { message: 'Masraf silindi' } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Masraf silinemedi' } }); }
});

// GET /expenses/categories
expenseRouter.get('/categories', requirePermission('expenses:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const categories = await prisma.expenseCategory.findMany({ where: { tenantId, deletedAt: null }, include: { children: true }, orderBy: { name: 'asc' } });
        res.json({ success: true, data: categories });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Kategoriler alınamadı' } }); }
});
