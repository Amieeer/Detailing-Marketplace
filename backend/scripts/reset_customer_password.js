const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function resetCustomerPassword() {
    try {
        const email = 'customer1735120807156@example.com';
        const newPassword = 'password123';

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password
        const result = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING email',
            [hashedPassword, email]
        );

        if (result.rows.length > 0) {
            console.log('✅ Password reset successfully!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('Email:', email);
            console.log('Password:', newPassword);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('\n📱 You can now login with these credentials!');
        } else {
            console.log('❌ Customer not found');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

resetCustomerPassword();
