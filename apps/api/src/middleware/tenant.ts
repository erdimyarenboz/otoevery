import { Request, Response, NextFunction } from 'express';

/**
 * Tenant isolation middleware
 * Ensures every tenant-scoped query is filtered by tenant_id
 * Adds tenantId to req for easy access in route handlers
 */
export const tenantIsolation = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Giriş yapılmadı' } });
    }

    // Super admins can optionally target a specific tenant via header
    if (req.user.isSuperAdmin) {
        const targetTenant = req.headers['x-tenant-id'] as string | undefined;
        if (targetTenant) {
            (req as any).tenantId = targetTenant;
        }
        return next();
    }

    if (!req.user.tenantId) {
        return res.status(403).json({
            success: false,
            error: { code: 'NO_TENANT', message: 'Tenant bilgisi bulunamadı' },
        });
    }

    (req as any).tenantId = req.user.tenantId;
    next();
};

/**
 * Helper to get tenant ID from request
 */
export const getTenantId = (req: Request): string => {
    return (req as any).tenantId;
};
