const { z } = require('zod');

const createServiceSchema = z.object({
    body: z.object({
        name: z.string().min(3, 'Name must be at least 3 characters'),
        description: z.string().min(10, 'Description must be at least 10 characters'),
        price: z.number().positive('Price must be positive'),
        duration_minutes: z.number().int().positive('Duration must be a positive integer'),
        image_url: z.string().url('Invalid image URL').optional(),
        is_active: z.boolean().optional()
    })
});

const updateServiceSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid service ID')
    }),
    body: z.object({
        name: z.string().min(3).optional(),
        description: z.string().min(10).optional(),
        price: z.number().positive().optional(),
        duration_minutes: z.number().int().positive().optional(),
        is_active: z.boolean().optional(),
        image_url: z.string().optional()
    })
});

const serviceIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid service ID')
    })
});

const detailerIdSchema = z.object({
    params: z.object({
        detailerId: z.string().uuid('Invalid detailer ID')
    })
});

module.exports = {
    createServiceSchema,
    updateServiceSchema,
    serviceIdSchema,
    detailerIdSchema
};
