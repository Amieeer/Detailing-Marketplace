const { z } = require('zod');

const updateProfileSchema = z.object({
    body: z.object({
        business_name: z.string().min(2).optional(),
        bio: z.string().optional(),
        phone_number: z.string().optional(),
        service_radius_km: z.number().positive().optional(),
        location_coordinates: z
            .object({
                latitude: z.number(),
                longitude: z.number()
            })
            .optional()
            .nullable(),
        profile_picture_url: z.string().url('Invalid profile picture URL').optional().nullable(),
        cover_image: z.string().url('Invalid cover image URL').optional().nullable()
    })
});

const detailerIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid detailer ID')
    })
});

const updatePushTokenSchema = z.object({
    body: z.object({
        push_token: z.string().min(1, 'Push token is required')
    })
});

module.exports = {
    updateProfileSchema,
    detailerIdSchema,
    updatePushTokenSchema
};
