import { Router, Request, Response } from 'express';
import { requirePermission } from '../../middleware/rbac';
import { getTenantId } from '../../middleware/tenant';
import prisma from '../../config/database';

export const settingsRouter = Router();

// GET /settings/tenant — Tenant settings
settingsRouter.get('/tenant', requirePermission('settings:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Firma bulunamadı' } });
        res.json({ success: true, data: tenant });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Ayarlar alınamadı' } }); }
});

// PUT /settings/tenant
settingsRouter.put('/tenant', requirePermission('settings:update'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const tenant = await prisma.tenant.update({ where: { id: tenantId }, data: req.body });
        res.json({ success: true, data: tenant });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Ayarlar güncellenemedi' } }); }
});

// GET /settings/roles
settingsRouter.get('/roles', requirePermission('roles:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const roles = await prisma.role.findMany({ where: { tenantId }, include: { rolePermissions: { include: { permission: true } }, _count: { select: { userRoles: true } } }, orderBy: { name: 'asc' } });
        res.json({ success: true, data: roles });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Roller alınamadı' } }); }
});

// POST /settings/roles
settingsRouter.post('/roles', requirePermission('roles:create'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { name, slug, description, permissions: permList } = req.body;
        const role = await prisma.role.create({ data: { tenantId, name, slug, description } });
        if (permList?.length) {
            const perms = await prisma.permission.findMany({ where: { id: { in: permList } } });
            await prisma.rolePermission.createMany({ data: perms.map((p: any) => ({ roleId: role.id, permissionId: p.id })) });
        }
        res.status(201).json({ success: true, data: role });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Rol oluşturulamadı' } }); }
});

// GET /settings/users
settingsRouter.get('/users', requirePermission('users:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const users = await prisma.user.findMany({
            where: { tenantId, deletedAt: null },
            select: { id: true, email: true, firstName: true, lastName: true, phone: true, status: true, lastLoginAt: true, userRoles: { include: { role: true } }, createdAt: true },
            orderBy: { firstName: 'asc' },
        });
        res.json({ success: true, data: users });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Kullanıcılar alınamadı' } }); }
});

// GET /settings/permissions
settingsRouter.get('/permissions', requirePermission('roles:view'), async (_req: Request, res: Response) => {
    try {
        const permissions = await prisma.permission.findMany({ orderBy: [{ module: 'asc' }, { action: 'asc' }] });
        res.json({ success: true, data: permissions });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'İzinler alınamadı' } }); }
});

// GET /settings/audit-logs
settingsRouter.get('/audit-logs', requirePermission('audit:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const page = parseInt(req.query.page as string || '1');
        const limit = parseInt(req.query.limit as string || '50');
        const where: any = { tenantId };
        if (req.query.resourceType) where.resourceType = req.query.resourceType;
        if (req.query.action) where.action = req.query.action;
        if (req.query.userId) where.userId = req.query.userId;
        const [data, total] = await Promise.all([
            prisma.activityLog.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
            prisma.activityLog.count({ where }),
        ]);
        res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Audit logları alınamadı' } }); }
});
