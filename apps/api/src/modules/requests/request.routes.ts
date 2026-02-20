import { Router, Request, Response } from 'express';
import { requirePermission } from '../../middleware/rbac';
import { auditLog } from '../../middleware/audit';
import { getTenantId } from '../../middleware/tenant';
import { paginationSchema } from '@otoevery/shared';
import prisma from '../../config/database';

export const requestRouter = Router();

requestRouter.get('/', requirePermission('requests:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { page, limit, sort, order, q } = paginationSchema.parse(req.query);
        const where: any = { tenantId, deletedAt: null };
        if (req.query.status) where.status = req.query.status;
        if (req.query.priority) where.priority = req.query.priority;
        if (req.query.requestTypeId) where.requestTypeId = req.query.requestTypeId;
        if (req.query.requesterId) where.requesterId = req.query.requesterId;
        if (q) where.title = { contains: q, mode: 'insensitive' };
        const [data, total] = await Promise.all([
            prisma.request.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { [sort]: order }, include: { requestType: true, vehicle: true, approvals: true } }),
            prisma.request.count({ where }),
        ]);
        res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Talep listesi alınamadı' } }); }
});

requestRouter.get('/:id', requirePermission('requests:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const request = await prisma.request.findFirst({
            where: { id: req.params.id, tenantId, deletedAt: null },
            include: { requestType: true, vehicle: true, approvals: true, comments: { where: { deletedAt: null }, orderBy: { createdAt: 'asc' } }, attachments: true, statusHistory: { orderBy: { createdAt: 'asc' } } },
        });
        if (!request) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Talep bulunamadı' } });
        res.json({ success: true, data: request });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Talep detayı alınamadı' } }); }
});

requestRouter.post('/', requirePermission('requests:create'), auditLog('request'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const request = await prisma.request.create({
            data: { tenantId, ...req.body, requesterId: req.user!.id, status: 'pending_approval', createdById: req.user!.id, updatedById: req.user!.id },
            include: { requestType: true },
        });
        // Create status history
        await prisma.requestStatusHistory.create({ data: { requestId: request.id, toStatus: 'pending_approval', changedBy: req.user!.id } });
        res.status(201).json({ success: true, data: request });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Talep oluşturulamadı' } }); }
});

requestRouter.post('/:id/approve', requirePermission('requests:approve'), auditLog('request'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const request = await prisma.request.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null }, include: { requestType: true } });
        if (!request) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Talep bulunamadı' } });

        const currentLevel = await prisma.requestApproval.count({ where: { requestId: req.params.id, decision: 'approved' } });
        const nextLevel = currentLevel + 1;

        await prisma.requestApproval.create({
            data: { tenantId, requestId: req.params.id, level: nextLevel, approverId: req.user!.id, decision: 'approved', comment: req.body.comment, decidedAt: new Date() },
        });

        const newStatus = nextLevel >= request.requestType.approvalLevels ? 'approved' : `level${nextLevel}_approved`;
        await prisma.request.update({ where: { id: req.params.id }, data: { status: newStatus, updatedById: req.user!.id } });
        await prisma.requestStatusHistory.create({ data: { requestId: req.params.id, fromStatus: request.status, toStatus: newStatus, changedBy: req.user!.id, comment: req.body.comment } });

        res.json({ success: true, data: { message: 'Talep onaylandı', status: newStatus } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Onay yapılamadı' } }); }
});

requestRouter.post('/:id/reject', requirePermission('requests:approve'), auditLog('request'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const request = await prisma.request.findFirst({ where: { id: req.params.id, tenantId, deletedAt: null } });
        if (!request) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Talep bulunamadı' } });
        await prisma.requestApproval.create({
            data: { tenantId, requestId: req.params.id, level: 0, approverId: req.user!.id, decision: 'rejected', comment: req.body.comment, decidedAt: new Date() },
        });
        await prisma.request.update({ where: { id: req.params.id }, data: { status: 'rejected', updatedById: req.user!.id } });
        await prisma.requestStatusHistory.create({ data: { requestId: req.params.id, fromStatus: request.status, toStatus: 'rejected', changedBy: req.user!.id, comment: req.body.comment } });
        res.json({ success: true, data: { message: 'Talep reddedildi' } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Red yapılamadı' } }); }
});

requestRouter.post('/:id/comments', requirePermission('requests:view'), async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const comment = await prisma.requestComment.create({
            data: { tenantId, requestId: req.params.id, userId: req.user!.id, content: req.body.content, isInternal: req.body.isInternal || false },
        });
        res.status(201).json({ success: true, data: comment });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Yorum eklenemedi' } }); }
});
