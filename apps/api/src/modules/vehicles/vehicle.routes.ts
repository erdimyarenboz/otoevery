import { Router, Request, Response } from 'express';
import { requirePermission } from '../../middleware/rbac';
import { auditLog } from '../../middleware/audit';
import { validate } from '../../middleware/validate';
import { getTenantId } from '../../middleware/tenant';
import { createVehicleSchema, updateVehicleSchema, paginationSchema } from '@otoevery/shared';
import prisma from '../../config/database';

export const vehicleRouter = Router();

// GET /vehicles — List (paginated, filtered)
vehicleRouter.get('/', requirePermission('vehicles:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { page, limit, sort, order, q } = paginationSchema.parse(req.query);

        const where: any = { tenantId, deletedAt: null };

        // Filters
        if (req.query.status) where.status = req.query.status;
        if (req.query.fuelType) where.fuelType = req.query.fuelType;
        if (req.query.ownership) where.ownership = req.query.ownership;
        if (req.query.department) where.department = req.query.department;
        if (req.query.brand) where.brand = req.query.brand;

        // Search
        if (q) {
            where.OR = [
                { plate: { contains: q, mode: 'insensitive' } },
                { brand: { contains: q, mode: 'insensitive' } },
                { model: { contains: q, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            prisma.vehicle.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { [sort]: order },
                include: {
                    groupMemberships: { include: { group: true } },
                    tagAssignments: { include: { tag: true } },
                },
            }),
            prisma.vehicle.count({ where }),
        ]);

        res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        console.error('Vehicle list error:', error);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Araç listesi alınamadı' } });
    }
});

// GET /vehicles/:id — Detail
vehicleRouter.get('/:id', requirePermission('vehicles:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const vehicle = await prisma.vehicle.findFirst({
            where: { id: req.params.id, tenantId, deletedAt: null },
            include: {
                groupMemberships: { include: { group: true } },
                tagAssignments: { include: { tag: true } },
                assignments: {
                    where: { deletedAt: null },
                    orderBy: { startDate: 'desc' },
                    take: 5,
                    include: { employee: true },
                },
            },
        });

        if (!vehicle) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Araç bulunamadı' } });
        }

        res.json({ success: true, data: vehicle });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Araç detayı alınamadı' } });
    }
});

// POST /vehicles — Create
vehicleRouter.post('/', requirePermission('vehicles:create'), auditLog('vehicle'), validate(createVehicleSchema), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);

        // Check unique plate
        const existing = await prisma.vehicle.findFirst({ where: { tenantId, plate: req.body.plate, deletedAt: null } });
        if (existing) {
            return res.status(409).json({ success: false, error: { code: 'DUPLICATE', message: 'Bu plaka zaten kayıtlı' } });
        }

        const vehicle = await prisma.vehicle.create({
            data: {
                tenantId,
                ...req.body,
                createdById: req.user!.id,
                updatedById: req.user!.id,
            },
        });

        res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
        console.error('Vehicle create error:', error);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Araç oluşturulamadı' } });
    }
});

// PUT /vehicles/:id — Update
vehicleRouter.put('/:id', requirePermission('vehicles:update'), auditLog('vehicle'), validate(updateVehicleSchema), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);

        const existing = await prisma.vehicle.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null } });
        if (!existing) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Araç bulunamadı' } });
        }

        // Store old values for audit
        (req as any).__oldValues = existing;

        // Check unique plate if changing
        if (req.body.plate && req.body.plate !== existing.plate) {
            const dup = await prisma.vehicle.findFirst({ where: { tenantId, plate: req.body.plate, deletedAt: null, id: { not: req.params.id } } });
            if (dup) {
                return res.status(409).json({ success: false, error: { code: 'DUPLICATE', message: 'Bu plaka zaten kayıtlı' } });
            }
        }

        const vehicle = await prisma.vehicle.update({
            where: { id: req.params.id },
            data: { ...req.body, updatedById: req.user!.id },
        });

        res.json({ success: true, data: vehicle });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Araç güncellenemedi' } });
    }
});

// DELETE /vehicles/:id — Soft delete
vehicleRouter.delete('/:id', requirePermission('vehicles:delete'), auditLog('vehicle'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const existing = await prisma.vehicle.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null } });
        if (!existing) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Araç bulunamadı' } });
        }

        await prisma.vehicle.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedById: req.user!.id } });

        res.json({ success: true, data: { message: 'Araç silindi' } });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Araç silinemedi' } });
    }
});

// POST /vehicles/:id/km — Update km
vehicleRouter.post('/:id/km', requirePermission('vehicles:update'), auditLog('vehicle'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { km } = req.body;

        const vehicle = await prisma.vehicle.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null } });
        if (!vehicle) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Araç bulunamadı' } });
        }

        if (km < vehicle.currentKm) {
            return res.status(400).json({ success: false, error: { code: 'INVALID_KM', message: 'Yeni km değeri mevcut değerden düşük olamaz' } });
        }

        await Promise.all([
            prisma.vehicle.update({
                where: { id: req.params.id },
                data: { currentKm: km, lastKmUpdate: new Date(), updatedById: req.user!.id },
            }),
            prisma.kilometerLog.create({
                data: { tenantId, vehicleId: req.params.id, kmValue: km, source: 'manual', createdById: req.user!.id },
            }),
        ]);

        res.json({ success: true, data: { message: 'Kilometre güncellendi' } });
    } catch (error) {
        res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'KM güncellenemedi' } });
    }
});
