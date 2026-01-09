const db = require('../src/config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, '../src/db/migrations/20260106_update_profile_schema_for_redesign.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration: 20260106_update_profile_schema_for_redesign.sql...');
        await db.query(sql);
        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
