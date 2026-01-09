const db = require('../config/db');

// @desc    Get detailer dashboard statistics
// @route   GET /api/detailer/stats
// @access  Private (Detailer only)
const getStats = async (req, res) => {
    try {
        // Get service stats
        const servicesResult = await db.query(
            'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_active = TRUE) as active FROM services WHERE detailer_id = $1',
            [req.user.id]
        );

        // Get booking stats
        const bookingsResult = await db.query(
            `SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'pending') as pending,
                COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
                COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
                COUNT(*) FILTER (WHERE status = 'completed') as completed
            FROM bookings 
            WHERE detailer_id = $1`,
            [req.user.id]
        );

        // Get profile stats (rating, jobs_completed)
        const profileResult = await db.query(
            'SELECT rating, jobs_completed FROM profiles WHERE user_id = $1',
            [req.user.id]
        );

        // Calculate revenue (optional - sum of completed bookings)
        const revenueResult = await db.query(
            `SELECT 
                COALESCE(SUM(total_price), 0) as total_revenue,
                COALESCE(SUM(total_price) FILTER (WHERE EXTRACT(MONTH FROM completed_at) = EXTRACT(MONTH FROM CURRENT_DATE)), 0) as month_revenue
            FROM bookings 
            WHERE detailer_id = $1 AND status = 'completed'`,
            [req.user.id]
        );

        // Get Next Job
        const nextJobResult = await db.query(
            `SELECT 
                b.*, 
                s.name as service_name, 
                s.duration_minutes,
                u.email as customer_email,
                u.phone_number as customer_phone
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN users u ON b.customer_id = u.id
            WHERE b.detailer_id = $1 
            AND b.status IN ('confirmed', 'in_progress')
            AND b.scheduled_time > NOW() - INTERVAL '2 hours' -- Show current jobs too
            ORDER BY b.scheduled_time ASC
            LIMIT 1`,
            [req.user.id]
        );

        // Get Earnings History (Last 7 days)
        const earningsResult = await db.query(
            `SELECT 
                to_char(date_trunc('day', completed_at), 'YYYY-MM-DD') as date,
                SUM(total_price) as daily_total
            FROM bookings
            WHERE detailer_id = $1 
            AND status = 'completed'
            AND completed_at >= NOW() - INTERVAL '7 days'
            GROUP BY 1
            ORDER BY 1 ASC`,
            [req.user.id]
        );

        // Format earnings for chart (fill missing days with 0)
        const earningsHistory = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayData = earningsResult.rows.find((r) => r.date === dateStr);
            earningsHistory.push(dayData ? parseFloat(dayData.daily_total) : 0);
        }

        const stats = {
            services: {
                total: parseInt(servicesResult.rows[0].total) || 0,
                active: parseInt(servicesResult.rows[0].active) || 0
            },
            bookings: {
                total: parseInt(bookingsResult.rows[0].total) || 0,
                pending: parseInt(bookingsResult.rows[0].pending) || 0,
                confirmed: parseInt(bookingsResult.rows[0].confirmed) || 0,
                in_progress: parseInt(bookingsResult.rows[0].in_progress) || 0,
                completed: parseInt(bookingsResult.rows[0].completed) || 0
            },
            rating: parseFloat(profileResult.rows[0]?.rating) || 0,
            jobs_completed: parseInt(profileResult.rows[0]?.jobs_completed) || 0,
            revenue: {
                total: parseFloat(revenueResult.rows[0].total_revenue) || 0,
                month: parseFloat(revenueResult.rows[0].month_revenue) || 0
            },
            nextBooking: nextJobResult.rows[0] || null,
            earningsHistory: earningsHistory
        };

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getStats };
