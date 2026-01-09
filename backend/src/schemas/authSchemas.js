const { z } = require('zod');

const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        role: z.enum(['customer', 'detailer'], {
            errorMap: () => ({ message: "Role must be 'customer' or 'detailer'" })
        }),
        phone_number: z.string().optional().nullable(),
        location_coordinates: z
            .object({
                latitude: z.number(),
                longitude: z.number()
            })
            .optional()
            .nullable()
    })
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required')
    })
});

module.exports = {
    registerSchema,
    loginSchema
};
