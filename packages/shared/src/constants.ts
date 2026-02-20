// Shared constants
export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    FIRMA_ADMIN: 'firma_admin',
    FILO_YONETICISI: 'filo_yoneticisi',
    FINANS: 'finans',
    SURUCU: 'surucu',
    SERVIS: 'servis',
} as const;

export const MODULES = {
    VEHICLES: 'vehicles',
    EMPLOYEES: 'employees',
    ASSIGNMENTS: 'assignments',
    REQUESTS: 'requests',
    FUEL: 'fuel',
    TIRES: 'tires',
    PENALTIES: 'penalties',
    EXPENSES: 'expenses',
    DOCUMENTS: 'documents',
    REPORTS: 'reports',
    RENTALS: 'rentals',
    TELEMATICS: 'telematics',
    SETTINGS: 'settings',
    USERS: 'users',
    ROLES: 'roles',
    AUDIT: 'audit',
} as const;

export const ACTIONS = {
    VIEW: 'view',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    APPROVE: 'approve',
    EXPORT: 'export',
} as const;

export const VEHICLE_STATUS = {
    ACTIVE: 'active',
    PASSIVE: 'passive',
    MAINTENANCE: 'maintenance',
    SOLD: 'sold',
} as const;

export const VEHICLE_OWNERSHIP = {
    OWNED: 'owned',
    RENTED: 'rented',
} as const;

export const FUEL_TYPES = {
    GASOLINE: 'benzin',
    DIESEL: 'dizel',
    LPG: 'lpg',
    ELECTRIC: 'elektrik',
    HYBRID: 'hibrit',
} as const;

export const REQUEST_STATUS = {
    DRAFT: 'draft',
    PENDING_APPROVAL: 'pending_approval',
    LEVEL1_APPROVED: 'level1_approved',
    LEVEL2_APPROVED: 'level2_approved',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
} as const;

export const PRIORITY = {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent',
} as const;

export const PENALTY_STATUS = {
    UNPAID: 'unpaid',
    PAID: 'paid',
    DISPUTED: 'disputed',
    CANCELLED: 'cancelled',
} as const;

export const TIRE_POSITIONS = {
    FRONT_LEFT: 'front_left',
    FRONT_RIGHT: 'front_right',
    REAR_LEFT: 'rear_left',
    REAR_RIGHT: 'rear_right',
    SPARE: 'spare',
} as const;

export const NOTIFICATION_CHANNELS = {
    IN_APP: 'in_app',
    EMAIL: 'email',
    WEBHOOK: 'webhook',
} as const;

export const NOTIFICATION_RULE_TYPES = {
    DOCUMENT_EXPIRY: 'document_expiry',
    PENALTY_DUE: 'penalty_due',
    MAINTENANCE_KM: 'maintenance_km',
    MAINTENANCE_DATE: 'maintenance_date',
    BUDGET_THRESHOLD: 'budget_threshold',
    FUEL_ANOMALY: 'fuel_anomaly',
    RENTAL_EXPIRY: 'rental_expiry',
    REQUEST_APPROVAL: 'request_approval',
} as const;

// Pagination defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 25,
    MAX_LIMIT: 100,
} as const;

// Type helpers
export type Role = typeof ROLES[keyof typeof ROLES];
export type Module = typeof MODULES[keyof typeof MODULES];
export type Action = typeof ACTIONS[keyof typeof ACTIONS];
export type VehicleStatus = typeof VEHICLE_STATUS[keyof typeof VEHICLE_STATUS];
export type FuelType = typeof FUEL_TYPES[keyof typeof FUEL_TYPES];
export type RequestStatus = typeof REQUEST_STATUS[keyof typeof REQUEST_STATUS];
export type Priority = typeof PRIORITY[keyof typeof PRIORITY];
export type PenaltyStatus = typeof PENALTY_STATUS[keyof typeof PENALTY_STATUS];
export type TirePosition = typeof TIRE_POSITIONS[keyof typeof TIRE_POSITIONS];
