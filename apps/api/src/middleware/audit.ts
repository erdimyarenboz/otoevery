import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

/**
 * Audit log middleware — logs all mutating actions
 */
export const auditLog = (resourceType: string) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        // Store original json method to intercept response
        const originalJson = _res.json.bind(_res);

        _res.json = function (body: any) {
            // Only log successful mutations
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && _res.statusCode < 400) {
                const action = getAction(req.method);

                prisma.activityLog.create({
                    data: {
                        tenantId: (req as any).tenantId || req.user?.tenantId || null,
                        userId: req.user?.id || null,
                        action,
                        resourceType,
                        resourceId: body?.data?.id || req.params.id || null,
                        oldValues: (req as any).__oldValues || null,
                        newValues: req.method !== 'DELETE' ? (req.body || null) : null,
                        ipAddress: (req.ip || req.socket.remoteAddress || '').substring(0, 45),
                        userAgent: req.headers['user-agent']?.substring(0, 500) || null,
                    },
                }).catch((err) => {
                    console.error('Audit log error:', err);
                });
            }

            return originalJson(body);
        };

        next();
    };
};

function getAction(method: string): string {
    switch (method) {
        case 'POST': return 'create';
        case 'PUT':
        case 'PATCH': return 'update';
        case 'DELETE': return 'delete';
        default: return 'unknown';
    }
}
