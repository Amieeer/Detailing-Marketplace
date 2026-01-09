const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Upload image
// @route   POST /api/upload
// @access  Private
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'midnight-plasma'
        });

        // Remove file from local uploads folder
        fs.unlinkSync(req.file.path);

        res.json({
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error(error);
        // Try to remove file if upload failed
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Image upload failed' });
    }
};

module.exports = { uploadImage };
