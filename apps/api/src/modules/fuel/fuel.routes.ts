import { Router, Request, Response } from 'express';
import { requirePermission } from '../../middleware/rbac';
import { auditLog } from '../../middleware/audit';
import { getTenantId } from '../../middleware/tenant';
import { paginationSchema } from '@otoevery/shared';
import prisma from '../../config/database';

export const fuelRouter = Router();

fuelRouter.get('/', requirePermission('fuel:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { page, limit, sort, order, q } = paginationSchema.parse(req.query);
        const where: any = { tenantId, deletedAt: null };
        if (req.query.vehicleId) where.vehicleId = req.query.vehicleId;
        if (req.query.isAnomaly === 'true') where.isAnomaly = true;
        if (req.query.startDate && req.query.endDate) {
            where.fillDate = { gte: new Date(req.query.startDate as string), lte: new Date(req.query.endDate as string) };
        }
        const [data, total] = await Promise.all([
            prisma.fuelEntry.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { [sort]: order }, include: { vehicle: true, employee: true } }),
            prisma.fuelEntry.count({ where }),
        ]);
        res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Yakıt listesi alınamadı' } }); }
});

fuelRouter.post('/', requirePermission('fuel:create'), auditLog('fuel_entry'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const entry = await prisma.fuelEntry.create({ data: { tenantId, ...req.body, fillDate: new Date(req.body.fillDate), createdById: req.user!.id, updatedById: req.user!.id } });

        // Update vehicle km if provided
        if (req.body.kmAtFill) {
            await prisma.vehicle.updateMany({ where: { id: req.body.vehicleId, tenantId, currentKm: { lt: req.body.kmAtFill } }, data: { currentKm: req.body.kmAtFill, lastKmUpdate: new Date() } });
        }

        // TODO: Run anomaly detection rules
        res.status(201).json({ success: true, data: entry });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Yakıt kaydı oluşturulamadı' } }); }
});

fuelRouter.put('/:id', requirePermission('fuel:update'), auditLog('fuel_entry'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const existing = await prisma.fuelEntry.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null } });
        if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Yakıt kaydı bulunamadı' } });
        const entry = await prisma.fuelEntry.update({ where: { id: req.params.id }, data: { ...req.body, updatedById: req.user!.id } });
        res.json({ success: true, data: entry });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Yakıt kaydı güncellenemedi' } }); }
});

fuelRouter.delete('/:id', requirePermission('fuel:delete'), auditLog('fuel_entry'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const existing = await prisma.fuelEntry.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null } });
        if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Yakıt kaydı bulunamadı' } });
        await prisma.fuelEntry.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedById: req.user!.id } });
        res.json({ success: true, data: { message: 'Yakıt kaydı silindi' } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Yakıt kaydı silinemedi' } }); }
});

// GET /fuel-entries/analytics
fuelRouter.get('/analytics', requirePermission('fuel:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().setMonth(new Date().getMonth() - 6));
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

        const entries = await prisma.fuelEntry.findMany({
            where: { tenantId, deletedAt: null, fillDate: { gte: startDate, lte: endDate } },
            include: { vehicle: { select: { plate: true, brand: true, model: true } }, employee: { select: { firstName: true, lastName: true } } },
            orderBy: { fillDate: 'asc' },
        });

        // Group by month
        const monthlyData: Record<string, { liters: number; amount: number; count: number }> = {};
        entries.forEach((e) => {
            const month = new Date(e.fillDate).toISOString().substring(0, 7);
            if (!monthlyData[month]) monthlyData[month] = { liters: 0, amount: 0, count: 0 };
            monthlyData[month].liters += Number(e.liters);
            monthlyData[month].amount += Number(e.totalAmount);
            monthlyData[month].count++;
        });

        res.json({ success: true, data: { entries, monthlyData, totalLiters: entries.reduce((s, e) => s + Number(e.liters), 0), totalAmount: entries.reduce((s, e) => s + Number(e.totalAmount), 0) } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Yakıt analizi alınamadı' } }); }
});
