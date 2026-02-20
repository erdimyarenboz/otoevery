import { z } from 'zod';

// Common schemas
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    sort: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    q: z.string().optional(),
});

export const uuidSchema = z.string().uuid();

// Auth schemas
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    phone: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

export const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(8).max(128),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8).max(128),
});

// Vehicle schemas
export const createVehicleSchema = z.object({
    plate: z.string().min(1).max(20),
    brand: z.string().max(100).optional(),
    model: z.string().max(100).optional(),
    year: z.number().int().min(1900).max(2100).optional(),
    chassisNo: z.string().max(50).optional(),
    engineNo: z.string().max(50).optional(),
    fuelType: z.enum(['benzin', 'dizel', 'lpg', 'elektrik', 'hibrit']).optional(),
    currentKm: z.number().int().min(0).default(0),
    location: z.string().max(255).optional(),
    department: z.string().max(100).optional(),
    status: z.enum(['active', 'passive', 'maintenance', 'sold']).default('active'),
    ownership: z.enum(['owned', 'rented']).default('owned'),
    color: z.string().max(50).optional(),
    seatCount: z.number().int().optional(),
    vehicleClass: z.string().max(50).optional(),
    notes: z.string().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

// Employee schemas
export const createEmployeeSchema = z.object({
    employeeNo: z.string().max(50).optional(),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    tcIdentity: z.string().length(11).optional(),
    phone: z.string().max(50).optional(),
    email: z.string().email().optional(),
    department: z.string().max(100).optional(),
    position: z.string().max(100).optional(),
    driverLicenseNo: z.string().max(50).optional(),
    licenseClass: z.string().max(10).optional(),
    licenseExpiry: z.string().datetime().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

// Assignment schemas
export const createAssignmentSchema = z.object({
    vehicleId: z.string().uuid(),
    employeeId: z.string().uuid(),
    startDate: z.string(),
    endDate: z.string().optional(),
    startKm: z.number().int().optional(),
    handoverNotes: z.string().optional(),
});

// Fuel entry schemas
export const createFuelEntrySchema = z.object({
    vehicleId: z.string().uuid(),
    employeeId: z.string().uuid().optional(),
    fillDate: z.string(),
    stationName: z.string().max(255).optional(),
    fuelType: z.string().optional(),
    liters: z.number().positive(),
    unitPrice: z.number().positive().optional(),
    totalAmount: z.number().positive(),
    kmAtFill: z.number().int().min(0).optional(),
    isFullTank: z.boolean().default(true),
    notes: z.string().optional(),
});

// Penalty schemas
export const createPenaltySchema = z.object({
    vehicleId: z.string().uuid(),
    penaltyDate: z.string(),
    notificationDate: z.string().optional(),
    dueDate: z.string().optional(),
    amount: z.number().positive(),
    discountedAmount: z.number().positive().optional(),
    penaltyType: z.string().max(100).optional(),
    location: z.string().max(255).optional(),
    description: z.string().optional(),
});

// Expense schemas
export const createExpenseSchema = z.object({
    vehicleId: z.string().uuid().optional(),
    categoryId: z.string().uuid(),
    employeeId: z.string().uuid().optional(),
    expenseDate: z.string(),
    amount: z.number().positive(),
    currency: z.string().length(3).default('TRY'),
    vatAmount: z.number().optional(),
    description: z.string().optional(),
    vendorName: z.string().max(255).optional(),
    invoiceNo: z.string().max(100).optional(),
    notes: z.string().optional(),
});

// Document schemas
export const createDocumentSchema = z.object({
    vehicleId: z.string().uuid().optional(),
    employeeId: z.string().uuid().optional(),
    documentTypeId: z.string().uuid(),
    title: z.string().min(1).max(255),
    issueDate: z.string().optional(),
    expiryDate: z.string().optional(),
    amount: z.number().optional(),
    issuer: z.string().max(255).optional(),
    policyNo: z.string().max(100).optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional(),
});

// Request schemas
export const createRequestSchema = z.object({
    requestTypeId: z.string().uuid(),
    vehicleId: z.string().uuid().optional(),
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    tags: z.array(z.string()).optional(),
});

// Rental contract schemas
export const createRentalContractSchema = z.object({
    vehicleId: z.string().uuid(),
    rentalCompany: z.string().min(1).max(255),
    contractNo: z.string().max(100).optional(),
    startDate: z.string(),
    endDate: z.string(),
    monthlyAmount: z.number().positive(),
    currency: z.string().length(3).default('TRY'),
    kmLimitMonthly: z.number().int().optional(),
    kmExcessRate: z.number().optional(),
    depositAmount: z.number().optional(),
    insuranceIncluded: z.boolean().default(false),
    maintenanceIncluded: z.boolean().default(false),
    tireIncluded: z.boolean().default(false),
    notes: z.string().optional(),
});

// Tire schemas
export const createTireSchema = z.object({
    serialNo: z.string().max(100).optional(),
    brand: z.string().max(100).optional(),
    model: z.string().max(100).optional(),
    size: z.string().max(50).optional(),
    dotCode: z.string().max(20).optional(),
    purchaseDate: z.string().optional(),
    purchaseCost: z.number().optional(),
    treadDepth: z.number().optional(),
    notes: z.string().optional(),
});

// Budget schemas
export const createBudgetSchema = z.object({
    categoryId: z.string().uuid().optional(),
    vehicleId: z.string().uuid().optional(),
    vehicleGroupId: z.string().uuid().optional(),
    periodYear: z.number().int(),
    periodMonth: z.number().int().min(1).max(12),
    amount: z.number().positive(),
    alertThreshold: z.number().min(0).max(100).default(80),
});

// Notification rule schemas
export const createNotificationRuleSchema = z.object({
    ruleType: z.string(),
    name: z.string().min(1).max(255),
    params: z.record(z.unknown()),
    channels: z.array(z.enum(['in_app', 'email', 'webhook'])).default(['in_app', 'email']),
    recipientRoles: z.array(z.string()).optional(),
    isActive: z.boolean().default(true),
});

// Tenant schemas
export const createTenantSchema = z.object({
    name: z.string().min(1).max(255),
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    taxId: z.string().optional(),
    currency: z.string().length(3).default('TRY'),
    locale: z.string().default('tr'),
});

// Webhook schemas
export const createWebhookSchema = z.object({
    name: z.string().min(1).max(255),
    url: z.string().url(),
    secret: z.string().optional(),
    events: z.array(z.string()).min(1),
    isActive: z.boolean().default(true),
});
