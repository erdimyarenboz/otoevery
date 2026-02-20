import { Router, Request, Response } from 'express';
import { getTenantId } from '../../middleware/tenant';
import { paginationSchema } from '@otoevery/shared';
import prisma from '../../config/database';

export const notificationRouter = Router();

// GET /notifications — User's notifications
notificationRouter.get('/', async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { page, limit } = paginationSchema.parse(req.query);
        const where = { tenantId, userId: req.user!.id };
        const [data, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
            prisma.notification.count({ where }),
            prisma.notification.count({ where: { ...where, isRead: false } }),
        ]);
        res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit), unreadCount } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Bildirimler alınamadı' } }); }
});

// PUT /notifications/:id/read
notificationRouter.put('/:id/read', async (req: Request, res: Response) => {
    try {
        await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user!.id }, data: { isRead: true, readAt: new Date() } });
        res.json({ success: true, data: { message: 'Okundu olarak işaretlendi' } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Hata oluştu' } }); }
});

// PUT /notifications/read-all
notificationRouter.put('/read-all', async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        await prisma.notification.updateMany({ where: { tenantId, userId: req.user!.id, isRead: false }, data: { isRead: true, readAt: new Date() } });
        res.json({ success: true, data: { message: 'Tüm bildirimler okundu' } });
    } catch (error) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Hata oluştu' } }); }
});
