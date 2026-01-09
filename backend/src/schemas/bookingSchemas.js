const { z } = require('zod');

const createBookingSchema = z.object({
    body: z.object({
        detailer_id: z.string().uuid('Invalid detailer ID'),
        service_id: z.string().uuid('Invalid service ID'),
        vehicle_id: z.string().uuid('Invalid vehicle ID').optional(),
        scheduled_time: z.string().datetime('Invalid date time format'),
        location_address: z.string().min(5, 'Address is too short').optional(),
        location_latitude: z.number().min(-90).max(90).optional(),
        location_longitude: z.number().min(-180).max(180).optional()
    })
});

const bookingIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid booking ID')
    })
});

const updateStatusSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid booking ID')
    }),
    body: z.object({
        status: z.enum(['pending', 'confirmed', 'cancelled', 'in_progress', 'completed'])
    })
});

const declineBookingSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid booking ID')
    }),
    body: z.object({
        reason: z.string().optional()
    })
});

const completeJobSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid booking ID')
    }),
    body: z.object({
        notes: z.string().optional()
    })
});

const addPhotoSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid booking ID')
    }),
    body: z.object({
        type: z.enum(['before', 'after']),
        url: z.string().url('Invalid photo URL')
    })
});

module.exports = {
    createBookingSchema,
    bookingIdSchema,
    updateStatusSchema,
    declineBookingSchema,
    completeJobSchema,
    addPhotoSchema
};
