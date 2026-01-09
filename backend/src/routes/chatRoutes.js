const express = require('express');
const router = express.Router();
const { getConversations, getMessages, startConversation } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations', startConversation);

module.exports = router;
