const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Database connection using DATABASE_URL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function seedDetailers() {
    const client = await pool.connect();

    try {
        console.log('🌱 Starting database seeding...\n');

        // Hash password for all detailers
        const password = 'detailer123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Detailer 1: Premium Auto Detailing
        console.log('Creating Premium Auto Detailing...');
        const detailer1 = await client.query(
            `
            INSERT INTO users (email, password_hash, role, phone_number, is_verified)
            VALUES ($1, $2, 'detailer', $3, true)
            RETURNING id
        `,
            ['premium.detailing@example.com', hashedPassword, '555-0123']
        );

        const detailer1Id = detailer1.rows[0].id;

        await client.query(
            `
            INSERT INTO profiles (user_id, business_name, bio, rating, jobs_completed, service_radius_km, location_coordinates)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
            [
                detailer1Id,
                'Premium Auto Detailing',
                'Professional car detailing service with over 5 years of experience. We specialize in paint correction, ceramic coating, and interior restoration. Your car deserves the best care!',
                4.8,
                127,
                25,
                JSON.stringify({ lat: 40.7128, lng: -74.006 })
            ]
        );

        // Add services for detailer 1
        await client.query(
            `
            INSERT INTO services (detailer_id, name, description, price, duration_minutes, is_active)
            VALUES 
                ($1, 'Basic Wash & Vacuum', 'Exterior hand wash, tire shine, and interior vacuum. Perfect for regular maintenance.', 50.00, 60, true),
                ($1, 'Premium Detail', 'Complete interior and exterior detail including clay bar treatment, wax, and deep interior cleaning.', 150.00, 180, true),
                ($1, 'Ceramic Coating', 'Professional grade ceramic coating application with 5-year warranty. Includes paint correction.', 800.00, 480, true)
        `,
            [detailer1Id]
        );

        console.log('✅ Premium Auto Detailing created\n');

        // Detailer 2: Shine Masters
        console.log('Creating Shine Masters...');
        const detailer2 = await client.query(
            `
            INSERT INTO users (email, password_hash, role, phone_number, is_verified)
            VALUES ($1, $2, 'detailer', $3, true)
            RETURNING id
        `,
            ['shine.masters@example.com', hashedPassword, '555-0456']
        );

        const detailer2Id = detailer2.rows[0].id;

        await client.query(
            `
            INSERT INTO profiles (user_id, business_name, bio, rating, jobs_completed, service_radius_km, location_coordinates)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
            [
                detailer2Id,
                'Shine Masters',
                'Mobile detailing specialists bringing professional service to your doorstep. We use eco-friendly products and cutting-edge techniques.',
                4.9,
                203,
                30,
                JSON.stringify({ lat: 40.758, lng: -73.9855 })
            ]
        );

        await client.query(
            `
            INSERT INTO services (detailer_id, name, description, price, duration_minutes, is_active)
            VALUES 
                ($1, 'Express Detail', 'Quick exterior wash and interior wipe-down. Great for busy schedules.', 35.00, 45, true),
                ($1, 'Full Service Detail', 'Complete detailing package with paint correction, interior shampooing, and engine bay cleaning.', 200.00, 240, true)
        `,
            [detailer2Id]
        );

        console.log('✅ Shine Masters created\n');

        // Detailer 3: Elite Car Care
        console.log('Creating Elite Car Care...');
        const detailer3 = await client.query(
            `
            INSERT INTO users (email, password_hash, role, phone_number, is_verified)
            VALUES ($1, $2, 'detailer', $3, true)
            RETURNING id
        `,
            ['elite.carcare@example.com', hashedPassword, '555-0789']
        );

        const detailer3Id = detailer3.rows[0].id;

        await client.query(
            `
            INSERT INTO profiles (user_id, business_name, bio, rating, jobs_completed, service_radius_km, location_coordinates)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
            [
                detailer3Id,
                'Elite Car Care',
                'Luxury vehicle specialists with expertise in exotic and high-end cars. Meticulous attention to detail guaranteed.',
                4.7,
                89,
                20,
                JSON.stringify({ lat: 40.7489, lng: -73.968 })
            ]
        );

        await client.query(
            `
            INSERT INTO services (detailer_id, name, description, price, duration_minutes, is_active)
            VALUES 
                ($1, 'Luxury Wash', 'Premium hand wash with pH-neutral soap and microfiber drying. Includes wheel cleaning.', 75.00, 90, true),
                ($1, 'Paint Correction', 'Multi-stage paint correction to remove swirls and scratches. Restores factory shine.', 500.00, 360, true),
                ($1, 'Interior Detailing', 'Deep clean of all interior surfaces including leather conditioning and carpet shampooing.', 180.00, 150, true)
        `,
            [detailer3Id]
        );

        console.log('✅ Elite Car Care created\n');

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log('   - 3 detailer accounts created');
        console.log('   - 8 services added');
        console.log('   - Login credentials: [email] / detailer123');
        console.log('\n   Detailer emails:');
        console.log('   - premium.detailing@example.com');
        console.log('   - shine.masters@example.com');
        console.log('   - elite.carcare@example.com');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the seed function
seedDetailers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
