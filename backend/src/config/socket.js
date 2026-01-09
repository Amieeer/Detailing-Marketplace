const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('./db');

let io;

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*", // Allow all origins for mobile app
            methods: ["GET", "POST"]
        }
    });

    // Middleware for authentication
    io.use((socket, next) => {
        if (socket.handshake.query && socket.handshake.query.token) {
            jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) return next(new Error('Authentication error'));
                socket.decoded = decoded;
                next();
            });
        } else {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.decoded.id}`);

        // Join a room with the user's ID to receive private messages
        socket.join(socket.decoded.id);

        socket.on('join_conversation', (conversationId) => {
            console.log(`User ${socket.decoded.id} joined conversation ${conversationId}`);
            socket.join(conversationId);
        });

        socket.on('leave_conversation', (conversationId) => {
            socket.leave(conversationId);
        });

        socket.on('send_message', async (data) => {
            // data: { conversationId, content, recipientId }
            const { conversationId, content, recipientId } = data;
            const senderId = socket.decoded.id;

            try {
                // Save to database
                const result = await db.query(
                    'INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
                    [conversationId, senderId, content]
                );
                const newMessage = result.rows[0];

                // Emit to the conversation room (for real-time chat view)
                io.to(conversationId).emit('receive_message', newMessage);

                // Emit notification to recipient (if they are online but not in the conversation view)
                io.to(recipientId).emit('new_message_notification', {
                    conversationId,
                    senderId,
                    content
                });

            } catch (error) {
                console.error('Error saving message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.decoded.id}`);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = { initializeSocket, getIo };
