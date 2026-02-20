import { Request, Response, NextFunction } from 'express';

/**
 * RBAC middleware — checks if user has the required permission
 * Permission format: "module:action" (e.g. "vehicles:create")
 */
export const requirePermission = (...permissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Giriş yapılmadı' } });
        }

        // Super admins bypass RBAC
        if (req.user.isSuperAdmin) {
            return next();
        }

        const hasPermission = permissions.some((p) => req.user!.permissions.includes(p));

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Bu işlem için yetkiniz yok' },
            });
        }

        next();
    };
};

/**
 * Require super admin role
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.isSuperAdmin) {
        return res.status(403).json({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Bu işlem sadece sistem yöneticisi tarafından yapılabilir' },
        });
    }
    next();
};
