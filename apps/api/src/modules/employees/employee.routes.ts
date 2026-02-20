import { Router, Request, Response } from 'express';
import { requirePermission } from '../../middleware/rbac';
import { auditLog } from '../../middleware/audit';
import { validate } from '../../middleware/validate';
import { getTenantId } from '../../middleware/tenant';
import { createEmployeeSchema, updateEmployeeSchema, paginationSchema } from '@otoevery/shared';
import prisma from '../../config/database';

export const employeeRouter = Router();

employeeRouter.get('/', requirePermission('employees:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { page, limit, sort, order, q } = paginationSchema.parse(req.query);
        const where: any = { tenantId, deletedAt: null };
        if (req.query.status) where.status = req.query.status;
        if (req.query.department) where.department = req.query.department;
        if (q) {
            where.OR = [
                { firstName: { contains: q, mode: 'insensitive' } },
                { lastName: { contains: q, mode: 'insensitive' } },
                { employeeNo: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            prisma.employee.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { [sort]: order } }),
            prisma.employee.count({ where }),
        ]);
        res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Çalışan listesi alınamadı' } }); }
});

employeeRouter.get('/:id', requirePermission('employees:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const emp = await prisma.employee.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null }, include: { assignments: { where: { deletedAt: null }, orderBy: { startDate: 'desc' }, take: 10, include: { vehicle: true } } } });
        if (!emp) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Çalışan bulunamadı' } });
        res.json({ success: true, data: emp });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Hata oluştu' } }); }
});

employeeRouter.post('/', requirePermission('employees:create'), auditLog('employee'), validate(createEmployeeSchema), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const emp = await prisma.employee.create({ data: { tenantId, ...req.body, createdById: req.user!.id, updatedById: req.user!.id } });
        res.status(201).json({ success: true, data: emp });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Çalışan oluşturulamadı' } }); }
});

employeeRouter.put('/:id', requirePermission('employees:update'), auditLog('employee'), validate(updateEmployeeSchema), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const existing = await prisma.employee.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null } });
        if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Çalışan bulunamadı' } });
        const emp = await prisma.employee.update({ where: { id: req.params.id }, data: { ...req.body, updatedById: req.user!.id } });
        res.json({ success: true, data: emp });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Çalışan güncellenemedi' } }); }
});

employeeRouter.delete('/:id', requirePermission('employees:delete'), auditLog('employee'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const existing = await prisma.employee.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null } });
        if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Çalışan bulunamadı' } });
        await prisma.employee.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedById: req.user!.id } });
        res.json({ success: true, data: { message: 'Çalışan silindi' } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Çalışan silinemedi' } }); }
});
