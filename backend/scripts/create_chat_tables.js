const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function createChatTables() {
    try {
        const client = await pool.connect();
        console.log('--- Creating Chat Tables ---');

        // Create Conversations Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS conversations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                participant1_id UUID REFERENCES users(id) ON DELETE CASCADE,
                participant2_id UUID REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(participant1_id, participant2_id)
            );
        `);
        console.log('Created conversations table');

        // Create Messages Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
                sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created messages table');

        // Create index for faster message retrieval
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
        `);
        console.log('Created index on messages(conversation_id)');

        client.release();
        console.log('--- Chat Tables Created Successfully ---');
    } catch (err) {
        console.error('Error creating tables:', err);
    } finally {
        await pool.end();
    }
}

createChatTables();
